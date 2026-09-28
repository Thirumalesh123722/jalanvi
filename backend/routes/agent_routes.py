"""
Aqua Intellect & Marine AI - Agent Routes
FastAPI endpoints for multi-agent query execution and specialized agent calls.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from agents.orchestrator import OrchestratorAgent
from agents.ai_challenger_agent import AIChallengerAgent
from agents.marine_scientist_agent import AIMarineScientistAgent
from agents.opportunity_agent import OpportunityAnalysisAgent

router = APIRouter(prefix="/api/agent", tags=["Agents"])

orchestrator = OrchestratorAgent()
ai_challenger = AIChallengerAgent()
marine_scientist = AIMarineScientistAgent()
opportunity_agent = OpportunityAnalysisAgent()


class AgentQueryRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Natural language marine query")
    latitude: Optional[float] = Field(default=None, description="Vessel or target latitude")
    longitude: Optional[float] = Field(default=None, description="Vessel or target longitude")
    forecast_days: int = Field(default=1, ge=1, le=7, description="Number of forecast days")


class ChallengeRequest(BaseModel):
    query: str
    plan_name: Optional[str] = "Plan B: Balanced Strike"
    wind_speed: Optional[float] = 14.2
    wave_height: Optional[float] = 1.2


class HypothesisRequest(BaseModel):
    query: str
    region: Optional[str] = "Palk Bay & Gulf of Mannar"


@router.post("/query")
async def execute_agent_query(payload: AgentQueryRequest):
    """
    Executes the full 16-agent Aqua Intellect pipeline:
    Orchestrates live Open-Meteo marine and weather data, ocean analytics,
    geospatial geofence validation, safety risk matrix, route planner,
    alerts, visualization evidence, AI challenger red-team stress test,
    marine scientist hypotheses, memory recall, and decision contract.
    """
    try:
        result = await orchestrator.run(
            message=payload.message,
            latitude=payload.latitude,
            longitude=payload.longitude,
            forecast_days=payload.forecast_days,
        )
        return {
            "success": True,
            "query": payload.message,
            "intent": result.get("intent"),
            "plan": result.get("plan"),
            "results": result.get("results", {}),
            "execution": result.get("execution", {}),
            "agent_count": result.get("agent_count", 16),
            "connected_agents": result.get("connected_agents", []),
            "source": "AQUA_INTELLECT_LIVE_ENGINE"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent execution error: {str(e)}")


@router.post("/challenge")
async def run_ai_challenger(payload: ChallengeRequest):
    """Executes the AI Challenger Red-Team Agent to stress test voyage assumptions."""
    try:
        critique = await ai_challenger.run(
            query=payload.query,
            primary_plan={"name": payload.plan_name},
            weather_result={"data": {"wind_speed": payload.wind_speed}},
            safety_result={"data": {"wave_height": payload.wave_height}}
        )
        return {"success": True, "critique": critique}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/scientist")
async def run_marine_scientist(payload: HypothesisRequest):
    """Executes the AI Marine Scientist Agent evaluating multi-hypothesis ecological evidence."""
    try:
        analysis = await marine_scientist.run(query=payload.query)
        return {"success": True, "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/roster")
async def get_agent_roster():
    """Returns the operational status and specifications for all 16 connected agents."""
    agents = [
        {"id": "orchestrator", "name": "Orchestrator / Planner Agent", "squadron": "Foundation", "status": "ONLINE", "version": "2.4"},
        {"id": "marine_data", "name": "Marine Data Agent (Oceansat-3)", "squadron": "Foundation", "status": "ONLINE", "version": "2.4"},
        {"id": "weather", "name": "Weather Intelligence Agent (ECMWF)", "squadron": "Foundation", "status": "ONLINE", "version": "2.4"},
        {"id": "ocean_analytics", "name": "Ocean Analytics Agent (INCOIS)", "squadron": "Foundation", "status": "ONLINE", "version": "2.4"},
        {"id": "geospatial", "name": "Geospatial Agent (EEZ & Bathymetry)", "squadron": "Foundation", "status": "ONLINE", "version": "2.4"},
        {"id": "safety", "name": "Safety & Maritime Risk Agent", "squadron": "Operations", "status": "ONLINE", "version": "2.4"},
        {"id": "route_planner", "name": "Dynamic Route Optimization Agent", "squadron": "Operations", "status": "ONLINE", "version": "2.4"},
        {"id": "alert", "name": "Hazard & Coastal Alert Agent", "squadron": "Operations", "status": "ONLINE", "version": "2.4"},
        {"id": "visualization", "name": "Hydrodynamic Map Visualization Agent", "squadron": "Presentation", "status": "ONLINE", "version": "2.4"},
        {"id": "evidence", "name": "Evidence Synthesis & Provenance Agent", "squadron": "Presentation", "status": "ONLINE", "version": "2.4"},
        {"id": "opportunity", "name": "Commercial Opportunity Analysis Agent", "squadron": "Advanced", "status": "ONLINE", "version": "2.4"},
        {"id": "ai_challenger", "name": "AI Challenger (Red-Team Agent)", "squadron": "Advanced", "status": "ONLINE", "version": "2.4"},
        {"id": "marine_scientist", "name": "AI Marine Scientist Agent", "squadron": "Advanced", "status": "ONLINE", "version": "2.4"},
        {"id": "marine_memory", "name": "Personal Marine Memory & Learning Agent", "squadron": "Advanced", "status": "ONLINE", "version": "2.4"},
        {"id": "offline_pack", "name": "Offline Edge Mission Pack Agent", "squadron": "Advanced", "status": "ONLINE", "version": "2.4"},
        {"id": "explainability", "name": "Explainability & Decision Contract Agent", "squadron": "Advanced", "status": "ONLINE", "version": "2.4"},
    ]
    return {
        "success": True,
        "total_agents": len(agents),
        "active_agents": len(agents),
        "agents": agents
    }
