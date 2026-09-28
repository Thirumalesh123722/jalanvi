"""
Aqua Intellect & Marine AI - User Activity & History Routes
Provides persistent, user-isolated history endpoints for:
- Mission History & Replays
- Scientific AI Queries & Analyses
- Marine AI Conversations
- Safety, SOS, & Shore Watchdog Events
- Personal Activity Overview
All endpoints strictly enforce authentication and scope data to current_user["id"].
"""

import json
import uuid
import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from database import get_db_connection, sync_db_mirrors
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/history", tags=["User Application History & Ownership"])


class SaveMissionRequest(BaseModel):
    mission_name: str = Field(..., description="Descriptive mission name")
    base_port: str = Field(..., description="Departure harbor")
    destination_zone: str = Field(..., description="Target fishing zone or waypoint")
    departure_time: str = Field(..., description="Departure timestamp")
    expected_return: str = Field(..., description="Expected return timestamp")
    status: Optional[str] = "COMPLETED"
    vessel_data: Optional[Dict[str, Any]] = None
    telemetry: Optional[Dict[str, Any]] = None


class SaveScientificQueryRequest(BaseModel):
    query: str = Field(..., description="Scientific inquiry text")
    latitude: Optional[float] = 9.28
    longitude: Optional[float] = 79.31
    target_zone: Optional[str] = "PFZ Zone B"
    confidence: Optional[int] = 92
    response_summary: Optional[str] = ""


class SaveConversationMessageRequest(BaseModel):
    session_id: Optional[str] = "default_session"
    role: str = Field(..., description="'user' or 'assistant'")
    message: str = Field(..., description="Conversation message text")
    metadata: Optional[Dict[str, Any]] = None


class SaveSafetyEventRequest(BaseModel):
    event_type: str = Field(..., description="'SOS', 'HAZARD_ALERT', 'ZONE_ENTRY', 'WEATHER_WARNING', 'CHECK_IN'")
    severity: Optional[str] = "INFO"
    title: str = Field(..., description="Event summary title")
    description: Optional[str] = ""
    telemetry: Optional[Dict[str, Any]] = None


@router.get("/me")
async def get_my_activity_summary(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns an aggregated activity summary of all records owned by the authenticated user.
    Enforces strict user isolation.
    """
    user_id = current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Missions count and recent missions
    cursor.execute("""
    SELECT id, mission_name, base_port, destination_zone, departure_time, expected_return, status, created_at
    FROM missions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    """, (user_id,))
    recent_missions = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT COUNT(*) FROM missions WHERE user_id = ?", (user_id,))
    total_missions = cursor.fetchone()[0]

    # 2. Scientific AI History
    cursor.execute("""
    SELECT id, query, target_zone, confidence, response_summary, created_at
    FROM scientific_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    """, (user_id,))
    recent_scientific = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT COUNT(*) FROM scientific_history WHERE user_id = ?", (user_id,))
    total_scientific_queries = cursor.fetchone()[0]

    # 3. Safety Events
    cursor.execute("""
    SELECT id, event_type, severity, title, description, created_at
    FROM safety_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    """, (user_id,))
    recent_safety = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT COUNT(*) FROM safety_events WHERE user_id = ?", (user_id,))
    total_safety_events = cursor.fetchone()[0]

    # 4. Family Contacts count
    cursor.execute("SELECT COUNT(*) FROM family_contacts WHERE user_id = ?", (user_id,))
    total_contacts = cursor.fetchone()[0]

    # 5. Marine Memory
    cursor.execute("SELECT voyages_logged, total_sea_hours, total_catch_recorded_kg FROM marine_memory WHERE user_id = ?", (user_id,))
    mem = cursor.fetchone()
    memory_stats = dict(mem) if mem else {"voyages_logged": total_missions, "total_sea_hours": 0.0, "total_catch_recorded_kg": 0.0}

    conn.close()

    return {
        "success": True,
        "user_id": user_id,
        "user_name": current_user.get("name"),
        "vessel_name": current_user.get("vessel_name"),
        "stats": {
            "total_missions": total_missions,
            "total_scientific_queries": total_scientific_queries,
            "total_safety_events": total_safety_events,
            "total_family_contacts": total_contacts,
            "voyages_logged": memory_stats["voyages_logged"],
            "total_sea_hours": memory_stats["total_sea_hours"],
            "total_catch_kg": memory_stats["total_catch_recorded_kg"]
        },
        "recent_missions": recent_missions,
        "recent_scientific_queries": recent_scientific,
        "recent_safety_events": recent_safety
    }


@router.get("/missions")
async def get_user_missions(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Returns all missions owned by the authenticated user."""
    user_id = current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM missions WHERE user_id = ? ORDER BY created_at DESC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()

    missions = []
    for r in rows:
        m = dict(r)
        try:
            m["vessel_data"] = json.loads(m.get("vessel_json") or "{}")
        except Exception:
            m["vessel_data"] = {}
        try:
            m["connectivity"] = json.loads(m.get("connectivity_json") or "{}")
        except Exception:
            m["connectivity"] = {}
        try:
            m["smart_updates"] = json.loads(m.get("smart_updates_json") or "[]")
        except Exception:
            m["smart_updates"] = []
        missions.append(m)

    return {
        "success": True,
        "count": len(missions),
        "missions": missions
    }


@router.post("/missions")
async def save_user_mission(
    payload: SaveMissionRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Saves a new user-owned mission record to SQLite."""
    user_id = current_user["id"]
    mission_id = f"mis_{uuid.uuid4().hex[:10]}"
    now_ts = datetime.datetime.utcnow().isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO missions (
        id, user_id, mission_name, base_port, destination_zone, departure_time, expected_return,
        status, share_with_family, vessel_json, connectivity_json, smart_updates_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        mission_id,
        user_id,
        payload.mission_name,
        payload.base_port,
        payload.destination_zone,
        payload.departure_time,
        payload.expected_return,
        payload.status or "COMPLETED",
        1,
        json.dumps(payload.vessel_data or {}),
        json.dumps(payload.telemetry or {}),
        json.dumps([]),
        now_ts,
        now_ts
    ))

    # Also log a safety event for trip completion
    cursor.execute("""
    INSERT INTO safety_events (id, user_id, event_type, severity, title, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        f"evt_{uuid.uuid4().hex[:8]}",
        user_id,
        "MISSION_RECORDED",
        "INFO",
        f"Mission '{payload.mission_name}' logged to voyage history",
        f"Departed {payload.base_port} toward {payload.destination_zone}",
        now_ts
    ))

    conn.commit()
    conn.close()
    sync_db_mirrors()

    return {
        "success": True,
        "message": "Mission saved to your private voyage history.",
        "mission_id": mission_id
    }


@router.get("/scientific")
async def get_user_scientific_history(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Returns private scientific AI query history for authenticated user."""
    user_id = current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM scientific_history WHERE user_id = ? ORDER BY created_at DESC
    """, (user_id,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {
        "success": True,
        "count": len(rows),
        "history": rows
    }


@router.post("/scientific")
async def save_user_scientific_query(
    payload: SaveScientificQueryRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Saves a scientific analysis result associated with the current user."""
    user_id = current_user["id"]
    record_id = f"sci_{uuid.uuid4().hex[:10]}"
    now_ts = datetime.datetime.utcnow().isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO scientific_history (
        id, user_id, query, latitude, longitude, target_zone, confidence, response_summary, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record_id,
        user_id,
        payload.query,
        payload.latitude,
        payload.longitude,
        payload.target_zone,
        payload.confidence,
        payload.response_summary,
        now_ts
    ))
    conn.commit()
    conn.close()
    sync_db_mirrors()

    return {
        "success": True,
        "id": record_id,
        "message": "Scientific AI inquiry saved to your private research journal."
    }


@router.get("/conversations")
async def get_user_conversations(
    session_id: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Returns authenticated user's private Marine AI messages."""
    user_id = current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    if session_id:
        cursor.execute("""
        SELECT * FROM marine_conversations WHERE user_id = ? AND session_id = ? ORDER BY created_at ASC
        """, (user_id, session_id))
    else:
        cursor.execute("""
        SELECT * FROM marine_conversations WHERE user_id = ? ORDER BY created_at ASC LIMIT 100
        """, (user_id,))

    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {
        "success": True,
        "count": len(rows),
        "messages": rows
    }


@router.post("/conversations")
async def save_user_conversation_message(
    payload: SaveConversationMessageRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Appends a message to the user's private Marine AI conversation history."""
    user_id = current_user["id"]
    msg_id = f"msg_{uuid.uuid4().hex[:10]}"
    now_ts = datetime.datetime.utcnow().isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO marine_conversations (
        id, user_id, session_id, role, message, metadata_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        msg_id,
        user_id,
        payload.session_id or "default_session",
        payload.role,
        payload.message,
        json.dumps(payload.metadata or {}),
        now_ts
    ))
    conn.commit()
    conn.close()
    sync_db_mirrors()

    return {
        "success": True,
        "id": msg_id,
        "message": "Message saved to personal conversation history."
    }


@router.get("/safety-events")
async def get_user_safety_events(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Returns private safety and SOS alerts for the current user."""
    user_id = current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM safety_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
    """, (user_id,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {
        "success": True,
        "count": len(rows),
        "events": rows
    }
