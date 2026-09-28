"""
Aqua Intellect & Marine AI - Maritime Authorities Command Center API Routes
Protected endpoints strictly guarded by `require_authority_user` dependency (HTTP 403 for non-authorities).
Provides:
- Tactical overview & live telemetry
- Real-time hazard detection & tracking
- 0-100 Multi-factor risk engine breakdown
- Active vs Next predicted coastal impact zones
- Designated safe havens & shelter capacity
- Vessel rescue intelligence & distress classification
- SAR rescue resource allocation & response ETAs
- Response recommendations with one-click officer authorization
- 12-Agent orchestration pipeline execution & telemetry
- Historical hazard analogs & lessons learned
- Contextual Authority Marine AI chat query
"""

import json
import time
import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, status

from services.auth_service import require_authority_user
from services.hazard_intelligence_service import hazard_intelligence_service
from services.authority_agent_orchestrator import authority_agent_orchestrator
from database import get_db_connection

router = APIRouter(prefix="/api/authority", tags=["Maritime Authority Command Center"])

class ApproveRecommendationRequest(BaseModel):
    officer_notes: Optional[str] = "Authorized for immediate operational execution."

class UpdateVesselRequest(BaseModel):
    category: str
    risk_score: int

class CreateAlertRequest(BaseModel):
    hazard_id: Optional[str] = None
    alert_level: str # 'CRITICAL', 'WARNING', 'ADVISORY'
    alert_type: str
    title: str
    description: str
    target_sectors: List[str]
    bulletin_no: str
    issued_by: str = "Joint Maritime Operations Command (ICG / INCOIS)"

class AuthorityQueryRequest(BaseModel):
    query: str
    language: Optional[str] = "en"

# ==========================================
# 1. Tactical Command Overview (Main Feed)
# ==========================================
@router.get("/overview")
async def get_authority_overview(
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    """
    Returns full authoritative tactical intelligence feed.
    Guarded: Only users with 'authority', 'admin', or 'coast_guard' role can access.
    """
    data = await hazard_intelligence_service.get_authority_overview()
    data["current_officer"] = {
        "id": current_user.get("id"),
        "name": current_user.get("name"),
        "role": current_user.get("role"),
        "base_station": current_user.get("base_port")
    }
    return data

# ==========================================
# 2. Hazards & Trajectories
# ==========================================
@router.get("/hazards")
async def list_hazards(
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM authority_hazards ORDER BY risk_score DESC")
    hazards = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"hazards": hazards, "total": len(hazards)}

@router.get("/hazards/{hazard_id}/tracks")
async def get_hazard_tracks(
    hazard_id: str,
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM hazard_tracks 
        WHERE hazard_id = ? 
        ORDER BY timestamp_iso ASC
    """, (hazard_id,))
    tracks = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"hazard_id": hazard_id, "tracks": tracks}

# ==========================================
# 3. Real 0-100 Risk Engine Breakdown
# ==========================================
@router.get("/risk-analysis")
async def get_risk_analysis(
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    overview = await hazard_intelligence_service.get_authority_overview()
    hazard = overview.get("hazard") or {}
    zones = overview.get("affected_zones") or []
    vessels = overview.get("vessels") or []
    
    crit_high = [v for v in vessels if v.get("category") in ["CRITICAL_DISTRESS", "HIGH_RISK"]]
    total_pop = sum(z.get("population_exposed", 0) for z in zones)

    factors = hazard_intelligence_service.calculate_risk_factors(
        wind_kmh=hazard.get("max_sustained_wind_kmh", 125.0),
        wave_m=hazard.get("significant_wave_height_m", 4.8),
        central_pressure=hazard.get("central_pressure_hpa", 978.0),
        coastal_dist_nm=45.0,
        vessels_at_risk=len(crit_high),
        exposed_population=total_pop
    )
    return {
        "hazard_name": hazard.get("name", "VARUNA-04B"),
        "severity": hazard.get("severity", "CRITICAL"),
        "alert_level": hazard.get("alert_level", "RED"),
        "risk_analysis": factors
    }

# ==========================================
# 4. Coastal Zones (Active vs Next Predicted)
# ==========================================
@router.get("/zones")
async def get_affected_zones(
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM affected_zones ORDER BY eta_hours ASC")
    zones = []
    for r in cursor.fetchall():
        z = dict(r)
        try:
            z["polygon_coords"] = json.loads(z["polygon_coords_json"])
        except Exception:
            z["polygon_coords"] = []
        zones.append(z)
    conn.close()
    return {"zones": zones, "total": len(zones)}

# ==========================================
# 5. Designated Safe Zones
# ==========================================
@router.get("/safe-zones")
async def get_safe_zones(
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM safe_zones WHERE is_active = 1 ORDER BY capacity_vessels DESC")
    safe_zones = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"safe_zones": safe_zones, "total": len(safe_zones)}

# ==========================================
# 6. Tracked Vessels & Status Updates
# ==========================================
@router.get("/vessels")
async def get_authority_vessels(
    category: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    if category:
        cursor.execute("SELECT * FROM authority_vessels WHERE category = ? ORDER BY risk_score DESC", (category,))
    else:
        cursor.execute("SELECT * FROM authority_vessels ORDER BY risk_score DESC")
    vessels = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"vessels": vessels, "total": len(vessels)}

@router.post("/vessels/{vessel_id}/status")
async def update_vessel_status(
    vessel_id: str,
    req: UpdateVesselRequest,
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    res = await hazard_intelligence_service.update_vessel_status(vessel_id, req.category, req.risk_score)
    return res

# ==========================================
# 7. SAR Rescue Resources
# ==========================================
@router.get("/rescue-resources")
async def get_rescue_resources(
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM rescue_resources ORDER BY response_eta_min ASC")
    resources = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"rescue_resources": resources, "total": len(resources)}

# ==========================================
# 8. Authority Alerts & Bulletins
# ==========================================
@router.get("/alerts")
async def get_authority_alerts(
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM authority_alerts 
        WHERE is_active = 1 
        ORDER BY issue_time DESC
    """)
    alerts = []
    for r in cursor.fetchall():
        alt = dict(r)
        try:
            alt["target_sectors"] = json.loads(alt["target_sectors_json"])
        except Exception:
            alt["target_sectors"] = []
        alerts.append(alt)
    conn.close()
    return {"alerts": alerts, "total": len(alerts)}

@router.post("/alerts")
async def create_alert(
    req: CreateAlertRequest,
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    alert_id = f"alt-{int(time.time()*1000)}"
    cursor.execute("""
        INSERT INTO authority_alerts (
            id, hazard_id, alert_level, alert_type, title, description,
            target_sectors_json, issue_time, bulletin_no, issued_by, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        alert_id,
        req.hazard_id,
        req.alert_level,
        req.alert_type,
        req.title,
        req.description,
        json.dumps(req.target_sectors),
        datetime.datetime.utcnow().isoformat() + "Z",
        req.bulletin_no,
        req.issued_by,
        1
    ))
    conn.commit()
    conn.close()
    return {"success": True, "alert_id": alert_id, "message": "Official bulletin dispatched."}

# ==========================================
# 9. Response Recommendations & Approval
# ==========================================
@router.get("/recommendations")
async def get_recommendations(
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM response_recommendations ORDER BY confidence_score DESC")
    recs = []
    for r in cursor.fetchall():
        rec = dict(r)
        try:
            rec["evidence"] = json.loads(rec["evidence_json"])
        except Exception:
            rec["evidence"] = {}
        recs.append(rec)
    conn.close()
    return {"recommendations": recs, "total": len(recs)}

@router.post("/recommendations/{rec_id}/approve")
async def approve_recommendation(
    rec_id: str,
    req: ApproveRecommendationRequest,
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    res = await hazard_intelligence_service.approve_recommendation(rec_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("error"))
    return res

# ==========================================
# 10. Multi-Agent Pipeline Execution
# ==========================================
@router.post("/pipeline/run")
async def run_authority_pipeline(
    trigger: str = Query("MANUAL_DISPATCH"),
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    """
    Executes the 12 specialized authority agents in coordinated pipeline sequence.
    """
    result = await authority_agent_orchestrator.execute_full_pipeline(trigger=trigger)
    return result

# ==========================================
# 11. Historical Analogs & Lessons Learned
# ==========================================
@router.get("/history-analogs")
async def get_history_analogs(
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM hazard_history_records ORDER BY analog_similarity_pct DESC")
    history = []
    for r in cursor.fetchall():
        h = dict(r)
        try:
            h["lessons_learned"] = json.loads(h["lessons_learned_json"])
        except Exception:
            h["lessons_learned"] = []
        history.append(h)
    conn.close()
    return {"history_analogs": history, "total": len(history)}

# ==========================================
# 12. Authority Marine AI Contextual Query
# ==========================================
@router.post("/query")
async def authority_marine_ai_query(
    req: AuthorityQueryRequest,
    current_user: Dict[str, Any] = Depends(require_authority_user)
):
    """
    Specialized Authority Decision-Support AI endpoint.
    Answers complex questions about storm dynamics, vessel rescue prioritization,
    risk breakdowns, and evacuation timing.
    """
    overview = await hazard_intelligence_service.get_authority_overview()
    hazard = overview.get("hazard") or {}
    vessels = overview.get("vessels") or []
    zones = overview.get("affected_zones") or []
    resources = overview.get("rescue_resources") or []
    risk = overview.get("risk_index", {}).get("score", 88)

    q = req.query.lower()

    if "vessel" in q or "trawler" in q or "distress" in q or "rescue" in q:
        crit = [v for v in vessels if v.get("category") == "CRITICAL_DISTRESS"]
        msg = (
            f"**Search & Rescue Priority Analysis:**\n\n"
            f"Currently **{len(crit)} craft** are in **CRITICAL DISTRESS** within the storm radius:\n"
            f"1. **{crit[0]['vessel_name']} ({crit[0]['registration']})**: Disabled with 6 crew aboard at {crit[0]['latitude']}°N, {crit[0]['longitude']}°E ({crit[0]['distance_to_hazard_nm']} NM from cyclone center). Distress cause: {crit[0]['distress_reason']}. Assigned SAR Asset: **ICGS Samarth (OPV)** with ETA of 35 minutes.\n"
            f"2. **{crit[1]['vessel_name']} ({crit[1]['registration']})**: FRP Gillnetter with 4 crew at {crit[1]['latitude']}°N, {crit[1]['longitude']}°E. Bilge pumps active. Intercept assigned to **ICGS Rani Abbakka (FPV)**.\n\n"
            f"**Directive:** Coast Guard Chetak Helo CG-802 is in standby at INS Dega for immediate airlift extraction if surface tow fails."
        )
    elif "risk" in q or "score" in q or "factor" in q or "why" in q:
        msg = (
            f"**Authority Risk Engine Analysis (Current Score: {risk}/100 - CRITICAL):**\n\n"
            f"The composite score is derived from our normalized 6-factor model:\n"
            f"- **Wind Severity (25% Weight):** {hazard.get('max_sustained_wind_kmh', 125)} km/h sustained (gusts 150 km/h) -> Normalized 78.1 / Contribution: 19.5\n"
            f"- **Wave Energy & Sea State (25% Weight):** Significant Wave Height {hazard.get('significant_wave_height_m', 4.8)}m -> Normalized 80.0 / Contribution: 20.0\n"
            f"- **Central Pressure Deficit (15% Weight):** 978 hPa (Deficit: 34 hPa) -> Normalized 94.4 / Contribution: 14.2\n"
            f"- **Coastal Proximity (15% Weight):** 45 NM offshore -> Normalized 70.0 / Contribution: 10.5\n"
            f"- **Fleet Exposure (10% Weight):** 28 vessels in quadrant -> Normalized 90.0 / Contribution: 9.0\n"
            f"- **Exposed Population (10% Weight):** 245,000 residents in direct landfall sectors -> Normalized 98.0 / Contribution: 9.8\n\n"
            f"**Conclusion:** Condition warrants Great Danger Signal No. 9 and total maritime exclusion."
        )
    elif "landfall" in q or "eta" in q or "time" in q or "kakinada" in q or "zone" in q:
        active_zone = overview.get("active_impact_zone", {})
        next_zone = overview.get("next_predicted_zone", {})
        msg = (
            f"**Landfall & Coastal Inundation Timeline:**\n\n"
            f"- **Active Impact Sector:** {active_zone.get('zone_name')} is currently experiencing gale force winds (130 km/h) with estimated time to core eye wall passage of **{active_zone.get('eta_hours', 4.2)} hours**.\n"
            f"- **Next Predicted Strike Zone:** {next_zone.get('zone_name')} with projected landfall corridor between Kakinada and Yanam at approximately **02:00 IST** (ETA: {next_zone.get('eta_hours', 11.5)} hours).\n"
            f"- **Storm Surge Warning:** Projected peak surge of **2.8 meters** above normal astronomical tide (total inundation level ~4.05m) will coincide with the 18:30 IST evening high tide."
        )
    else:
        msg = (
            f"**Maritime Command Center Operational Status:**\n\n"
            f"- **Active Hazard:** {hazard.get('name', 'Severe Cyclonic Storm VARUNA-04B')} (Category: {hazard.get('category_name', 'VSCS')})\n"
            f"- **Position:** {hazard.get('current_lat')}°N, {hazard.get('current_lon')}°E, moving {hazard.get('direction_text', '315° NW')} at {hazard.get('current_speed_knots', 14.2)} knots.\n"
            f"- **Risk Index:** {risk}/100 [CRITICAL RED ALERT]\n"
            f"- **Fleet Status:** {overview.get('summary_counters', {}).get('total_vessels_tracked', 28)} tracked craft, {overview.get('summary_counters', {}).get('critical_distress_vessels', 2)} in critical distress.\n"
            f"- **SAR Readiness:** 5 rescue units deployed or on standby; ICGS Samarth is within 35 minutes of primary distress target.\n\n"
            f"You can ask for vessel rescue details, risk calculation breakdown, evacuation timing, or shelter allocation."
        )

    return {
        "query": req.query,
        "response": msg,
        "hazard_id": hazard.get("id"),
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "officer": current_user.get("name")
    }
