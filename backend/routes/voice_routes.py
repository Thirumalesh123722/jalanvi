"""
Aqua Intellect & Marine AI - Voice Routes
FastAPI endpoints for Multilingual Voice Copilot across 13 Indian Coastal Languages.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from services.voice_service import VoiceService, LANGUAGE_REGISTRY
from agents.orchestrator import OrchestratorAgent

router = APIRouter(prefix="/api/voice", tags=["Voice Intelligence"])

from database import get_db_connection, sync_db_mirrors
from services.auth_service import get_optional_current_user
import uuid
import datetime
import json

voice_service = VoiceService()
orchestrator = OrchestratorAgent()


class VoiceProcessRequest(BaseModel):
    transcript: str = Field(..., min_length=1, description="Speech-to-text transcript or natural language query")
    language: Optional[str] = Field(default="auto", description="Selected language code or 'auto' for automatic detection")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    context_screen: Optional[str] = "GENERAL"


@router.post("/process")
async def process_voice_query(
    payload: VoiceProcessRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)
):
    """
    Complete Voice Agent pipeline:
    1. Automatically detects spoken language or honors explicit user override.
    2. Incorporates authenticated user vessel and active mission context.
    3. Runs the multi-agent orchestrator.
    4. Synthesizes localized spoken audio advisory in native Indian dialect.
    5. Persists conversation turn in user history if authenticated.
    """
    try:
        # Step 1: Automatic Language Detection or Explicit Selection
        fallback_lang = current_user.get("preferred_language", "en") if current_user else "en"
        if not payload.language or payload.language.lower() in ["auto", "detect", ""]:
            detection = voice_service.detect_language(payload.transcript, fallback=fallback_lang)
            active_lang = detection["language"]
            confidence = detection["confidence"]
        else:
            active_lang = payload.language
            detection = voice_service.detect_language(payload.transcript, fallback=active_lang)
            confidence = 1.0

        # Step 2: Voice intent parsing
        parsed = voice_service.parse_voice_intent(payload.transcript, lang=active_lang)

        # Step 3: Extract authenticated vessel context if available
        user_context_info = ""
        user_id = current_user["id"] if current_user else None
        if current_user:
            user_context_info = f" [User: {current_user.get('name')}, Vessel: {current_user.get('vessel_name')}, BasePort: {current_user.get('base_port')}]"

        # Step 4: Agent execution
        agent_res = await orchestrator.run(
            message=payload.transcript + user_context_info,
            latitude=payload.latitude,
            longitude=payload.longitude,
            forecast_days=1
        )

        # Step 5: Localized Speech Synthesis
        spoken = voice_service.generate_spoken_advisory(agent_res, lang=active_lang)

        # Step 6: Persist in user conversation history if authenticated
        if user_id:
            try:
                conn = get_db_connection()
                cursor = conn.cursor()
                now_ts = datetime.datetime.utcnow().isoformat()
                session_id = f"voice_session_{user_id}"

                # Save user speech transcript
                cursor.execute("""
                INSERT INTO marine_conversations (id, user_id, session_id, role, message, metadata_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    f"msg_{uuid.uuid4().hex[:8]}",
                    user_id,
                    session_id,
                    "user",
                    payload.transcript,
                    json.dumps({"language": active_lang, "is_voice": True, "screen": payload.context_screen}),
                    now_ts
                ))

                # Save assistant response
                cursor.execute("""
                INSERT INTO marine_conversations (id, user_id, session_id, role, message, metadata_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    f"msg_{uuid.uuid4().hex[:8]}",
                    user_id,
                    session_id,
                    "assistant",
                    spoken.get("advisory_text", ""),
                    json.dumps({"language": active_lang, "is_voice": True, "speech_locale": spoken.get("speech_locale")}),
                    now_ts
                ))
                conn.commit()
                conn.close()
                sync_db_mirrors()
            except Exception as hist_err:
                print(f"Warning: Failed to log voice conversation history: {hist_err}")

        return {
            "success": True,
            "detected_language": active_lang,
            "confidence": confidence,
            "language_name": spoken.get("language_name", "English"),
            "speech_locale": spoken.get("speech_locale", "en-IN"),
            "voice_metadata": parsed,
            "spoken_advisory": spoken,
            "agent_results": agent_res.get("results", {}),
            "executed_agents": agent_res.get("connected_agents", []),
            "safety_score": agent_res.get("results", {}).get("safety", {}).get("safety_score", 89),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice agent error: {str(e)}")


@router.get("/languages")
async def get_supported_languages():
    """Returns the list of 13 supported Indian coastal languages with speech locales."""
    return {
        "success": True,
        "count": len(LANGUAGE_REGISTRY),
        "languages": [
            {"code": code, **meta}
            for code, meta in LANGUAGE_REGISTRY.items()
        ]
    }
