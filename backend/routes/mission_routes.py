"""
Aqua Intellect & Marine AI - Mission Routes
FastAPI endpoints for Digital Twin simulations, Decision Contracts, and Offline Packs.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.simulation_service import SimulationService

router = APIRouter(prefix="/api/mission", tags=["Mission & Digital Twin"])

sim_service = SimulationService()


class SimulateRequest(BaseModel):
    base_port: Optional[str] = "Visakhapatnam Outer Breakwater"
    vessel_speed_kn: Optional[float] = 9.0
    fuel_capacity_l: Optional[float] = 300.0
    departure_hour: Optional[int] = 5
    wind_gust_kn: Optional[float] = 14.0
    wave_height_m: Optional[float] = 1.2
    selected_plan: Optional[str] = "Plan B"


@router.post("/simulate")
async def simulate_digital_twin_mission(payload: SimulateRequest):
    """
    Executes hydrodynamic Digital Twin simulation comparing Plan A, Plan B, and Plan C
    with realistic fuel burn curves, risk ratings, and return deadlines.
    """
    try:
        sim_result = sim_service.simulate_mission(
            base_port=payload.base_port or "Visakhapatnam Outer Breakwater",
            vessel_speed_kn=payload.vessel_speed_kn or 9.0,
            fuel_capacity_l=payload.fuel_capacity_l or 300.0,
            departure_hour=payload.departure_hour or 5,
            wind_gust_kn=payload.wind_gust_kn or 14.0,
            wave_height_m=payload.wave_height_m or 1.2,
            selected_plan=payload.selected_plan or "Plan B"
        )
        return {"success": True, **sim_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


@router.get("/offline-pack")
async def get_offline_pack(sector: str = "Visakhapatnam & Bay of Bengal"):
    """Generates and returns the self-contained offline mission bundle for zero-connectivity operation."""
    return {
        "success": True,
        "pack_metadata": {
            "version": "2.4-OFFLINE-EDGE",
            "sector": sector,
            "cellular_cutoff_nm": 14.0,
            "downloaded_at": "Live Bundle Generated",
            "bundle_size_kb": 4200,
        },
        "offline_rules": {
            "max_safe_swell_height_m": 2.2,
            "max_safe_wind_kn": 22.0,
            "min_fuel_reserve_litres": 25.0,
            "hard_abort_imbl_buffer_km": 5.0
        },
        "contingency_ports": [
            {"name": "Visakhapatnam Outer Breakwater", "vhf": "Ch 16", "bearing": "295°"},
            {"name": "Kakinada Deep Water Port", "vhf": "Ch 16", "bearing": "210°"}
        ],
        "distress_frequencies": {
            "coast_guard": "1554",
            "maritime_vhf": "Channel 16 (156.8 MHz)",
            "navic_beacon": "NavIC-L5 (1176.45 MHz)"
        }
    }
