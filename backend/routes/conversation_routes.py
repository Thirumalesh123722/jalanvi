"""
Aqua Intellect & Marine AI - Conversation & Message Routes
Production-grade ChatGPT-style conversation persistence for Marine AI.
Strictly enforces authenticated user ownership and isolation.
"""

import json
import uuid
import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from database import get_db_connection, sync_db_mirrors
from services.auth_service import get_current_user, get_optional_current_user
from services.voice_service import VoiceService
from agents.orchestrator import OrchestratorAgent

router = APIRouter(prefix="/api/conversations", tags=["Marine AI Conversations"])
voice_service = VoiceService()
orchestrator = OrchestratorAgent()


class CreateConversationRequest(BaseModel):
    title: Optional[str] = Field(default="New Conversation", description="Conversation title")
    initial_message: Optional[str] = Field(default=None, description="Optional starting prompt")
    language: Optional[str] = Field(default="auto", description="Initial language code")


class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, description="User query or voice transcript")
    language: Optional[str] = Field(default="auto", description="Selected language or 'auto'")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    context_screen: Optional[str] = "GENERAL"
    is_voice: Optional[bool] = False


class UpdateConversationRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=120, description="New title")


def generate_deterministic_title(content: str) -> str:
    """Generates a concise, meaningful title from the initial user query."""
    if not content or not content.strip():
        return "Marine AI Chat"
    
    cleaned = content.strip().replace("\n", " ")
    lower = cleaned.lower()
    
    # Strip common conversational question prefixes
    fillers = [
        "what's the ", "what is the ", "tell me about ", "can you show me ", "can you show ",
        "find me ", "where is ", "how are the ", "is it ", "please ",
        "show me ", "check ", "what are the ", "give me ", "help me with "
    ]
    trimmed = cleaned
    for f in fillers:
        if lower.startswith(f):
            trimmed = cleaned[len(f):].strip()
            break
            
    words = trimmed.split()
    if len(words) > 6:
        trimmed = " ".join(words[:6])
        
    trimmed = trimmed.rstrip("?.!,:; ")
    if not trimmed:
        return "Marine AI Chat"
        
    # Title Case if Latin/English
    if all(ord(c) < 128 for c in trimmed):
        return trimmed.title()
    return trimmed[:45]


@router.get("")
async def list_user_conversations(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns all active conversations belonging to the authenticated user,
    ordered by latest update timestamp. Never leaks another user's conversations.
    """
    user_id = current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT 
        c.id, c.user_id, c.title, c.created_at, c.updated_at,
        COUNT(m.id) as message_count,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
    FROM conversations c
    LEFT JOIN messages m ON m.conversation_id = c.id
    WHERE c.user_id = ?
    GROUP BY c.id
    ORDER BY c.updated_at DESC
    """, (user_id,))

    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {
        "success": True,
        "count": len(rows),
        "conversations": rows
    }


@router.post("")
async def create_conversation(
    payload: CreateConversationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Creates a new conversation thread for the authenticated user.
    """
    user_id = current_user["id"]
    conv_id = f"conv_{uuid.uuid4().hex[:12]}"
    now_ts = datetime.datetime.utcnow().isoformat()
    
    title = payload.title.strip() if payload.title else "New Conversation"

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO conversations (id, user_id, title, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    """, (conv_id, user_id, title, now_ts, now_ts))

    conn.commit()
    conn.close()
    sync_db_mirrors()

    return {
        "success": True,
        "conversation": {
            "id": conv_id,
            "user_id": user_id,
            "title": title,
            "created_at": now_ts,
            "updated_at": now_ts,
            "message_count": 0
        }
    }


@router.get("/{conversation_id}")
async def get_conversation_details(
    conversation_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieves full conversation details and chronological message stream.
    Strictly verifies ownership: 404 if conversation does not belong to user.
    """
    user_id = current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM conversations WHERE id = ? AND user_id = ?", (conversation_id, user_id))
    conv = cursor.fetchone()

    if not conv:
        conn.close()
        raise HTTPException(status_code=404, detail="Conversation not found or access denied.")

    cursor.execute("""
    SELECT id, conversation_id, user_id, role, content, language, metadata_json, created_at
    FROM messages
    WHERE conversation_id = ? AND user_id = ?
    ORDER BY created_at ASC
    """, (conversation_id, user_id))

    raw_msgs = cursor.fetchall()
    conn.close()

    formatted_msgs = []
    for m in raw_msgs:
        meta = {}
        try:
            if m["metadata_json"]:
                meta = json.loads(m["metadata_json"])
        except Exception:
            pass

        formatted_msgs.append({
            "id": m["id"],
            "role": m["role"],
            "content": m["content"],
            "languageCode": m["language"],
            "timestamp": m["created_at"],
            "telemetryCard": meta.get("telemetryCard"),
            "executedAgents": meta.get("executedAgents", []),
            "spoken_advisory": meta.get("spoken_advisory")
        })

    return {
        "success": True,
        "conversation": dict(conv),
        "messages": formatted_msgs
    }


@router.post("/{conversation_id}/messages")
async def send_message_to_conversation(
    conversation_id: str,
    payload: SendMessageRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Adds a user message, runs the multi-agent intelligence/voice pipeline,
    records the assistant response, and returns both updated messages.
    """
    user_id = current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Verify ownership of the conversation
    cursor.execute("SELECT * FROM conversations WHERE id = ? AND user_id = ?", (conversation_id, user_id))
    conv = cursor.fetchone()
    if not conv:
        conn.close()
        raise HTTPException(status_code=404, detail="Conversation not found or access denied.")

    now_ts = datetime.datetime.utcnow().isoformat()
    user_msg_id = f"msg_{uuid.uuid4().hex[:10]}"

    # 2. Detect language
    active_lang = payload.language or "auto"
    fallback_lang = current_user.get("preferred_language", "en")
    if active_lang in ["auto", "detect", "", None]:
        detection = voice_service.detect_language(payload.content, fallback=fallback_lang)
        turn_language = detection["language"]
        confidence = detection["confidence"]
    else:
        turn_language = active_lang
        confidence = 1.0

    # 3. Store user message in database
    user_meta = {
        "is_voice": payload.is_voice,
        "context_screen": payload.context_screen,
        "confidence": confidence
    }

    cursor.execute("""
    INSERT INTO messages (id, conversation_id, user_id, role, content, language, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_msg_id, conversation_id, user_id, "user",
        payload.content, turn_language, json.dumps(user_meta), now_ts
    ))

    # 4. Auto-generate title if conversation still has default title
    current_title = conv["title"]
    if current_title in ["New Conversation", "Untitled", "Marine AI Chat"]:
        new_title = generate_deterministic_title(payload.content)
        cursor.execute("UPDATE conversations SET title = ? WHERE id = ?", (new_title, conversation_id))
        current_title = new_title

    # 5. Execute Multi-Agent pipeline
    vessel_info = f" [User: {current_user.get('name')}, Vessel: {current_user.get('vessel_name')}, BasePort: {current_user.get('base_port')}]"
    
    agent_res = await orchestrator.run(
        message=payload.content + vessel_info,
        latitude=payload.latitude or 15.24,
        longitude=payload.longitude or 82.16,
        forecast_days=1
    )

    # 6. Generate spoken advisory in detected language
    spoken = voice_service.generate_spoken_advisory(agent_res, lang=turn_language)
    assistant_text = spoken.get("advisory_text", "")

    executed_agents = agent_res.get("connected_agents", ["OrchestratorAgent", "MarineDataAgent", "WeatherAgent", "SafetyAgent"])
    card_data = None
    if spoken.get("telemetry_summary"):
        tsum = spoken["telemetry_summary"]
        card_data = {
            "waveHeight": f"{tsum.get('wave_height_m', 1.2)} m",
            "windSpeed": f"{tsum.get('wind_speed_kn', 13.5)} knots",
            "safetyScore": f"{tsum.get('safety_score', 89)}%",
            "recommendation": spoken.get("recommended_action", "PROCEED_PLAN_B")
        }

    assistant_meta = {
        "telemetryCard": card_data,
        "executedAgents": executed_agents,
        "speech_locale": spoken.get("speech_locale", "en-IN"),
        "spoken_advisory": spoken,
        "is_voice": payload.is_voice
    }

    # 7. Store assistant message in database
    ast_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
    cursor.execute("""
    INSERT INTO messages (id, conversation_id, user_id, role, content, language, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ast_msg_id, conversation_id, user_id, "assistant",
        assistant_text, turn_language, json.dumps(assistant_meta), now_ts
    ))

    # 8. Update conversation updated_at
    cursor.execute("UPDATE conversations SET updated_at = ? WHERE id = ?", (now_ts, conversation_id))
    conn.commit()
    conn.close()
    sync_db_mirrors()

    return {
        "success": True,
        "detected_language": turn_language,
        "confidence": confidence,
        "speech_locale": spoken.get("speech_locale", "en-IN"),
        "user_message": {
            "id": user_msg_id,
            "role": "user",
            "content": payload.content,
            "languageCode": turn_language,
            "timestamp": now_ts
        },
        "assistant_message": {
            "id": ast_msg_id,
            "role": "assistant",
            "content": assistant_text,
            "languageCode": turn_language,
            "timestamp": now_ts,
            "telemetryCard": card_data,
            "executedAgents": executed_agents,
            "spoken_advisory": spoken
        },
        "conversation": {
            "id": conversation_id,
            "title": current_title,
            "updated_at": now_ts
        }
    }


@router.patch("/{conversation_id}")
async def update_conversation(
    conversation_id: str,
    payload: UpdateConversationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Renames a conversation thread belonging to the authenticated user.
    """
    user_id = current_user["id"]
    new_title = payload.title.strip()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM conversations WHERE id = ? AND user_id = ?", (conversation_id, user_id))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Conversation not found or access denied.")

    now_ts = datetime.datetime.utcnow().isoformat()
    cursor.execute("UPDATE conversations SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?", (
        new_title, now_ts, conversation_id, user_id
    ))
    conn.commit()
    conn.close()
    sync_db_mirrors()

    return {
        "success": True,
        "message": "Conversation title updated successfully.",
        "conversation": {
            "id": conversation_id,
            "title": new_title,
            "updated_at": now_ts
        }
    }


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Deletes a conversation thread and all its messages.
    Strictly restricted to the conversation owner.
    """
    user_id = current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM conversations WHERE id = ? AND user_id = ?", (conversation_id, user_id))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Conversation not found or access denied.")

    cursor.execute("DELETE FROM messages WHERE conversation_id = ? AND user_id = ?", (conversation_id, user_id))
    cursor.execute("DELETE FROM conversations WHERE id = ? AND user_id = ?", (conversation_id, user_id))
    conn.commit()
    conn.close()
    sync_db_mirrors()

    return {
        "success": True,
        "message": "Conversation deleted successfully."
    }
