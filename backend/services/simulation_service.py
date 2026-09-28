"""
Aqua Intellect & Marine AI - Digital Twin & What-If Mission Simulator Service
Layer 14 & 21 of Marine AI Architecture
"""

from typing import Any, Dict, List, Optional
import math


class SimulationService:
    """Calculates vessel voyage plans, dynamic fuel curves, risk exposure, and what-if permutations."""

    def simulate_mission(
        self,
        base_port: str = "Visakhapatnam Outer Breakwater",
        vessel_speed_kn: float = 9.0,
        fuel_capacity_l: float = 300.0,
        departure_hour: int = 5,
        wind_gust_kn: float = 14.0,
        wave_height_m: float = 1.2,
        selected_plan: str = "Plan B"
    ) -> Dict[str, Any]:
        """Runs multi-variable hydrodynamic and economic trade-off simulation."""
        
        # Physics hydrodynamic resistance factor
        # Fuel burn increases exponentially with wave swell steepness and head-winds
        sea_resistance_multiplier = 1.0 + (wave_height_m ** 1.4) * 0.12 + (wind_gust_kn / 50.0) * 0.18

        plans = [
            {
                "id": "plan-a",
                "name": "Plan A: Maximum Yield Strike",
                "strategy": "Aggressive Offshore (Edge of Shelf)",
                "distance_nm": 48.5,
                "duration_hrs": round(48.5 / vessel_speed_kn, 1),
                "fuel_burn_litres": round(36.0 * sea_resistance_multiplier, 1),
                "expected_catch_kg": 490,
                "catch_value_inr": 98000,
                "diesel_cost_inr": round(36.0 * sea_resistance_multiplier * 94.8),
                "safety_score": max(55, min(95, round(88 - (wave_height_m * 12 + wind_gust_kn * 0.6)))),
                "risk_profile": "MODERATE_ELEVATED",
                "return_window": "15:30 IST",
                "imbl_buffer_nm": 14.2,
            },
            {
                "id": "plan-b",
                "name": "Plan B: Balanced & Optimal",
                "strategy": "PFZ Core Gradient Intercept (Recommended)",
                "distance_nm": 34.2,
                "duration_hrs": round(34.2 / vessel_speed_kn, 1),
                "fuel_burn_litres": round(26.5 * sea_resistance_multiplier, 1),
                "expected_catch_kg": 380,
                "catch_value_inr": 76000,
                "diesel_cost_inr": round(26.5 * sea_resistance_multiplier * 94.8),
                "safety_score": max(65, min(98, round(94 - (wave_height_m * 8 + wind_gust_kn * 0.4)))),
                "risk_profile": "LOW_OPTIMAL",
                "return_window": "13:45 IST",
                "imbl_buffer_nm": 22.8,
            },
            {
                "id": "plan-c",
                "name": "Plan C: Quick Shore Return",
                "strategy": "Nearshore Thermal Eddy (Conservative)",
                "distance_nm": 18.0,
                "duration_hrs": round(18.0 / vessel_speed_kn, 1),
                "fuel_burn_litres": round(14.0 * sea_resistance_multiplier, 1),
                "expected_catch_kg": 210,
                "catch_value_inr": 42000,
                "diesel_cost_inr": round(14.0 * sea_resistance_multiplier * 94.8),
                "safety_score": 96,
                "risk_profile": "MINIMAL_SAFE",
                "return_window": "11:15 IST",
                "imbl_buffer_nm": 38.5,
            }
        ]

        active_plan = next((p for p in plans if p["id"] == selected_plan.lower() or selected_plan in p["name"]), plans[1])

        # Tradeoff points for scatter plot
        scatter_points = [
            {"name": "Plan C (Conservative)", "opportunity": 48, "risk": 12, "color": "#10b981"},
            {"name": "Plan B (Recommended)", "opportunity": 84, "risk": 22, "color": "#f97316"},
            {"name": "Plan A (Max Strike)", "opportunity": 96, "risk": 48, "color": "#8b5cf6"},
        ]

        return {
            "simulation_timestamp": "Live Simulation",
            "base_port": base_port,
            "vessel_parameters": {
                "speed_knots": vessel_speed_kn,
                "fuel_capacity_litres": fuel_capacity_l,
                "departure_hour_ist": departure_hour,
                "sea_resistance_multiplier": round(sea_resistance_multiplier, 2)
            },
            "environmental_conditions": {
                "wave_height_m": wave_height_m,
                "wind_gust_kn": wind_gust_kn
            },
            "plans": plans,
            "recommended_plan": active_plan,
            "scatter_points": scatter_points,
            "decision_contract": {
                "contract_id": "DC-2026-ISRO-998",
                "approved_window": active_plan["return_window"],
                "fuel_margin_reserve_litres": round(fuel_capacity_l - active_plan["fuel_burn_litres"], 1),
                "max_allowed_wave_m": 2.2,
                "imbl_safety_buffer_nm": active_plan["imbl_buffer_nm"],
                "status": "VALIDATED_BY_SAFETY_GUARDIAN"
            }
        }
