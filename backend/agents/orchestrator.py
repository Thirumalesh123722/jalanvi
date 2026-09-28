from __future__ import annotations

from typing import Any, Dict, List, Optional
import re

from agents.marine_data_agent import MarineDataAgent
from agents.weather_agent import WeatherAgent
from agents.ocean_analytics_agent import OceanAnalyticsAgent
from agents.geospatial_agent import GeospatialAgent
from agents.safety_agent import SafetyAgent
from agents.route_planner_agent import RoutePlannerAgent
from agents.alert_agent import AlertAgent
from agents.visualization_agent import VisualizationAgent
from agents.evidence_agent import EvidenceAgent

# Advanced Marine AI Feature Agents
from agents.opportunity_agent import OpportunityAnalysisAgent
from agents.ai_challenger_agent import AIChallengerAgent
from agents.marine_scientist_agent import AIMarineScientistAgent
from agents.marine_memory_agent import MarineMemoryAgent
from agents.offline_pack_agent import OfflinePackAgent
from agents.explainability_agent import ExplainabilityAgent


class OrchestratorAgent:
    """
    Aqua Intellect - Orchestrator / Planner Agent

    Responsibilities:
    - Understand the user's marine-intelligence request
    - Determine intent
    - Build an execution plan
    - Execute specialized agents in dependency order
    - Pass results between agents
    - Collect evidence, alerts and visualizations
    - Return one structured response

    Complete Aqua Intellect architecture:
    1. Orchestrator
    2. Marine Data
    3. Weather
    4. Ocean Analytics
    5. Geospatial
    6. Safety / Risk
    7. Route Planner
    8. Alert
    9. Visualization
    10. Evidence
    11. Opportunity Analysis
    12. AI Challenger (Red-Team)
    13. Marine Scientist
    14. Marine Memory & Learning
    15. Offline Mission Pack
    16. Explainability & Decision Contract
    """

    name = "orchestrator"
    display_name = "Orchestrator / Planner Agent"

    def __init__(self):
        self.last_result: Optional[Dict[str, Any]] = None

        # Core agents
        self.marine_data_agent = MarineDataAgent()
        self.weather_agent = WeatherAgent()
        self.ocean_analytics_agent = OceanAnalyticsAgent()
        self.geospatial_agent = GeospatialAgent()

        # Operational intelligence
        self.safety_agent = SafetyAgent()
        self.route_planner_agent = RoutePlannerAgent()
        self.alert_agent = AlertAgent()

        # Presentation / evidence
        self.visualization_agent = VisualizationAgent()
        self.evidence_agent = EvidenceAgent()

        # Advanced Feature Agents
        self.opportunity_agent = OpportunityAnalysisAgent()
        self.ai_challenger_agent = AIChallengerAgent()
        self.marine_scientist_agent = AIMarineScientistAgent()
        self.marine_memory_agent = MarineMemoryAgent()
        self.offline_pack_agent = OfflinePackAgent()
        self.explainability_agent = ExplainabilityAgent()

    # ======================================================
    # PUBLIC ENTRY POINT
    # ======================================================

    async def run(
        self,
        message: str,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        forecast_days: int = 1,
    ) -> Dict[str, Any]:

        intent = self.detect_intent(message)

        plan = self.create_plan(
            message=message,
            intent=intent,
        )

        execution: Dict[str, Any] = {
            "steps": [],
            "completed": [],
            "failed": [],
            "pending": [],
        }

        results: Dict[str, Any] = {}

        # ==================================================
        # 1. MARINE DATA
        # ==================================================

        if "marine_data" in plan["agents"]:

            self._add_step(
                execution,
                "marine_data",
                "running",
            )

            marine_result = await self.marine_data_agent.run(
                query=message,
                latitude=latitude,
                longitude=longitude,
                forecast_days=forecast_days,
            )

            results["marine_data"] = marine_result

            self._update_step_status(
                execution,
                "marine_data",
                marine_result.get("status"),
            )

        # ==================================================
        # 2. WEATHER
        # ==================================================

        if "weather" in plan["agents"]:

            self._add_step(
                execution,
                "weather",
                "running",
            )

            weather_result = await self.weather_agent.run(
                query=message,
                latitude=latitude,
                longitude=longitude,
                forecast_days=forecast_days,
            )

            results["weather"] = weather_result

            self._update_step_status(
                execution,
                "weather",
                weather_result.get("status"),
            )

        # ==================================================
        # 3. OCEAN ANALYTICS
        # ==================================================

        if "ocean_analytics" in plan["agents"]:

            self._add_step(
                execution,
                "ocean_analytics",
                "running",
            )

            ocean_result = await self.ocean_analytics_agent.run(
                query=message,
                marine_result=results.get("marine_data"),
                weather_result=results.get("weather"),
            )

            results["ocean_analytics"] = ocean_result

            self._update_step_status(
                execution,
                "ocean_analytics",
                ocean_result.get("status"),
            )

        # ==================================================
        # 4. GEOSPATIAL
        # ==================================================

        if "geospatial" in plan["agents"]:

            self._add_step(
                execution,
                "geospatial",
                "running",
            )

            locations = self.extract_locations_from_results(
                results
            )

            zones = self.extract_zones_from_results(
                results
            )

            geospatial_result = await self.geospatial_agent.run(
                query=message,
                latitude=latitude,
                longitude=longitude,
                locations=locations,
                zones=zones,
            )

            results["geospatial"] = geospatial_result

            self._update_step_status(
                execution,
                "geospatial",
                geospatial_result.get("status"),
            )

        # ==================================================
        # 5. SAFETY / RISK
        # ==================================================

        if "safety" in plan["agents"]:

            self._add_step(
                execution,
                "safety",
                "running",
            )

            safety_result = await self.safety_agent.run(
                query=message,
                marine_result=results.get("marine_data"),
                weather_result=results.get("weather"),
                ocean_result=results.get("ocean_analytics"),
                geospatial_result=results.get("geospatial"),
            )

            results["safety"] = safety_result

            self._update_step_status(
                execution,
                "safety",
                safety_result.get("status"),
            )

        # ==================================================
        # 6. ROUTE PLANNER
        # ==================================================

        if "route_planner" in plan["agents"]:

            self._add_step(
                execution,
                "route_planner",
                "running",
            )

            route_coordinates = self.extract_route_coordinates(
                message
            )

            route_result = await self.route_planner_agent.run(
                query=message,
                start_latitude=(
                    route_coordinates["start_latitude"]
                    if route_coordinates
                    else latitude
                ),
                start_longitude=(
                    route_coordinates["start_longitude"]
                    if route_coordinates
                    else longitude
                ),
                destination_latitude=(
                    route_coordinates["destination_latitude"]
                    if route_coordinates
                    else None
                ),
                destination_longitude=(
                    route_coordinates["destination_longitude"]
                    if route_coordinates
                    else None
                ),
                marine_result=results.get("marine_data"),
                weather_result=results.get("weather"),
                safety_result=results.get("safety"),
                geospatial_result=results.get("geospatial"),
            )

            results["route_planner"] = route_result

            self._update_step_status(
                execution,
                "route_planner",
                route_result.get("status"),
            )

        # ==================================================
        # 7. ALERT
        # ==================================================

        if "alert" in plan["agents"]:

            self._add_step(
                execution,
                "alert",
                "running",
            )

            alert_result = await self.alert_agent.run(
                query=message,
                marine_result=results.get("marine_data"),
                weather_result=results.get("weather"),
                ocean_result=results.get("ocean_analytics"),
                safety_result=results.get("safety"),
                geospatial_result=results.get("geospatial"),
            )

            results["alert"] = alert_result

            self._update_step_status(
                execution,
                "alert",
                alert_result.get("status"),
            )

        # ==================================================
        # 8. EVIDENCE / REPORT
        # ==================================================
        #
        # IMPORTANT:
        # Evidence receives ALL upstream specialist results
        # that are already available at this point.
        #
        # Visualization is intentionally NOT passed here
        # because visualization itself depends on evidence.
        # Passing visualization here would create a circular
        # dependency:
        #
        # Evidence -> Visualization -> Evidence
        #
        # Therefore evidence validates the complete upstream
        # intelligence pipeline, then visualization consumes
        # the validated evidence.
        # ==================================================

        if "evidence" in plan["agents"]:

            self._add_step(
                execution,
                "evidence",
                "running",
            )

            evidence_result = await self.evidence_agent.run(
                query=message,
                marine_result=results.get("marine_data"),
                weather_result=results.get("weather"),
                ocean_result=results.get("ocean_analytics"),
                geospatial_result=results.get("geospatial"),
                safety_result=results.get("safety"),
                route_result=results.get("route_planner"),
                alert_result=results.get("alert"),
                visualization_result=None,
            )

            results["evidence"] = evidence_result

            self._update_step_status(
                execution,
                "evidence",
                evidence_result.get("status"),
            )

        # ==================================================
        # 9. VISUALIZATION
        # ==================================================

        if "visualization" in plan["agents"]:

            self._add_step(
                execution,
                "visualization",
                "running",
            )

            visualization_result = (
                await self.visualization_agent.run(
                    query=message,
                    marine_result=results.get("marine_data"),
                    weather_result=results.get("weather"),
                    ocean_result=results.get("ocean_analytics"),
                    geospatial_result=results.get("geospatial"),
                    safety_result=results.get("safety"),
                    route_result=results.get("route_planner"),
                    alert_result=results.get("alert"),
                    evidence_result=results.get("evidence"),
                )
            )

            results["visualization"] = visualization_result

            self._update_step_status(
                execution,
                "visualization",
                visualization_result.get("status"),
            )

        # ==================================================
        # 10. OPPORTUNITY ANALYSIS
        # ==================================================
        self._add_step(execution, "opportunity", "running")
        try:
            opp_res = await self.opportunity_agent.run(
                query=message,
                marine_data=results.get("marine_data"),
                route_plan=results.get("route_planner"),
            )
            results["opportunity"] = opp_res
            self._update_step_status(execution, "opportunity", "success")
        except Exception as e:
            results["opportunity"] = {"status": "error", "error": str(e)}
            self._update_step_status(execution, "opportunity", "error")

        # ==================================================
        # 11. AI CHALLENGER (RED-TEAM ADVERSARIAL)
        # ==================================================
        self._add_step(execution, "ai_challenger", "running")
        try:
            chal_res = await self.ai_challenger_agent.run(
                query=message,
                primary_plan=results.get("route_planner"),
                weather_result=results.get("weather"),
                safety_result=results.get("safety"),
                ocean_result=results.get("ocean_analytics"),
            )
            results["ai_challenger"] = chal_res
            self._update_step_status(execution, "ai_challenger", "success")
        except Exception as e:
            results["ai_challenger"] = {"status": "error", "error": str(e)}
            self._update_step_status(execution, "ai_challenger", "error")

        # ==================================================
        # 12. AI MARINE SCIENTIST & KNOWLEDGE GRAPH
        # ==================================================
        self._add_step(execution, "marine_scientist", "running")
        try:
            sci_res = await self.marine_scientist_agent.run(
                query=message,
                marine_data=results.get("marine_data"),
                ocean_data=results.get("ocean_analytics"),
            )
            results["marine_scientist"] = sci_res
            self._update_step_status(execution, "marine_scientist", "success")
        except Exception as e:
            results["marine_scientist"] = {"status": "error", "error": str(e)}
            self._update_step_status(execution, "marine_scientist", "error")

        # ==================================================
        # 13. MARINE MEMORY & LEARNING
        # ==================================================
        self._add_step(execution, "marine_memory", "running")
        try:
            mem_res = await self.marine_memory_agent.run(query=message)
            results["marine_memory"] = mem_res
            self._update_step_status(execution, "marine_memory", "success")
        except Exception as e:
            results["marine_memory"] = {"status": "error", "error": str(e)}
            self._update_step_status(execution, "marine_memory", "error")

        # ==================================================
        # 14. OFFLINE MISSION PACK
        # ==================================================
        self._add_step(execution, "offline_pack", "running")
        try:
            pack_res = await self.offline_pack_agent.run(query=message)
            results["offline_pack"] = pack_res
            self._update_step_status(execution, "offline_pack", "success")
        except Exception as e:
            results["offline_pack"] = {"status": "error", "error": str(e)}
            self._update_step_status(execution, "offline_pack", "error")

        # ==================================================
        # 15. EXPLAINABILITY & DECISION CONTRACT
        # ==================================================
        self._add_step(execution, "explainability", "running")
        try:
            exp_res = await self.explainability_agent.run(query=message)
            results["explainability"] = exp_res
            self._update_step_status(execution, "explainability", "success")
        except Exception as e:
            results["explainability"] = {"status": "error", "error": str(e)}
            self._update_step_status(execution, "explainability", "error")

        # ==================================================
        # FINAL PIPELINE STATUS
        # ==================================================

        completed = execution["completed"]
        failed = execution["failed"]

        if failed and not completed:
            overall_status = "error"
        elif failed:
            overall_status = "partial"
        elif completed:
            overall_status = "success"
        else:
            overall_status = "pending"

        all_16_agents = [
            "orchestrator",
            "marine_data",
            "weather",
            "ocean_analytics",
            "geospatial",
            "safety",
            "route_planner",
            "alert",
            "visualization",
            "evidence",
            "opportunity",
            "ai_challenger",
            "marine_scientist",
            "marine_memory",
            "offline_pack",
            "explainability",
        ]

        final_result = {
            "agent": self.name,
            "status": overall_status,
            "query": message,
            "intent": intent,
            "plan": plan,
            "results": results,
            "execution": execution,
            "agent_count": len(all_16_agents),
            "connected_agents": all_16_agents,
        }

        self.last_result = final_result

        return final_result

    # ======================================================
    # INTENT DETECTION
    # ======================================================

    def detect_intent(
        self,
        message: str,
    ) -> str:

        text = message.lower()

        # Route
        if any(
            keyword in text
            for keyword in [
                "route",
                "routing",
                "navigate",
                "navigation",
                "vessel route",
                "ship route",
                "boat route",
            ]
        ):
            return "route_planning"

        # Fishing / PFZ
        if any(
            keyword in text
            for keyword in [
                "pfz",
                "fishing",
                "fish",
                "fishing zone",
                "productive area",
                "hotspot",
            ]
        ):
            return "fishing_productivity"

        # Safety
        if any(
            keyword in text
            for keyword in [
                "safe",
                "safety",
                "danger",
                "risk",
                "dangerous",
                "storm",
                "cyclone",
                "rough sea",
                "sea safety",
            ]
        ):
            return "marine_safety"

        # Alerts
        if any(
            keyword in text
            for keyword in [
                "alert",
                "warning",
                "advisory",
                "notification",
                "hazard",
            ]
        ):
            return "marine_alert"

        # Weather
        if any(
            keyword in text
            for keyword in [
                "weather",
                "wind",
                "rain",
                "temperature",
                "forecast",
                "gust",
            ]
        ):
            return "weather"

        # Geospatial
        if any(
            keyword in text
            for keyword in [
                "nearest",
                "nearby",
                "distance",
                "location",
                "geofence",
                "boundary",
                "restricted area",
                "zone",
            ]
        ):
            return "geospatial"

        # Ocean / marine
        if any(
            keyword in text
            for keyword in [
                "ocean",
                "marine",
                "sea",
                "sst",
                "wave",
                "waves",
                "current",
                "chlorophyll",
            ]
        ):
            return "ocean_conditions"

        return "general_marine_intelligence"

    # ======================================================
    # PLAN CREATION
    # ======================================================

    def create_plan(
        self,
        message: str,
        intent: Optional[str] = None,
    ) -> Dict[str, Any]:

        intent = intent or self.detect_intent(message)

        base = [
            "orchestrator",
        ]

        if intent == "fishing_productivity":

            agents = [
                "marine_data",
                "weather",
                "ocean_analytics",
                "geospatial",
                "safety",
                "alert",
                "evidence",
                "visualization",
            ]

        elif intent == "route_planning":

            agents = [
                "marine_data",
                "weather",
                "ocean_analytics",
                "geospatial",
                "safety",
                "route_planner",
                "alert",
                "evidence",
                "visualization",
            ]

        elif intent == "marine_safety":

            agents = [
                "marine_data",
                "weather",
                "ocean_analytics",
                "geospatial",
                "safety",
                "alert",
                "evidence",
                "visualization",
            ]

        elif intent == "marine_alert":

            agents = [
                "marine_data",
                "weather",
                "ocean_analytics",
                "geospatial",
                "safety",
                "alert",
                "evidence",
                "visualization",
            ]

        elif intent == "weather":

            agents = [
                "weather",
                "marine_data",
                "geospatial",
                "safety",
                "alert",
                "evidence",
                "visualization",
            ]

        elif intent == "geospatial":

            agents = [
                "geospatial",
                "evidence",
                "visualization",
            ]

        elif intent == "ocean_conditions":

            agents = [
                "marine_data",
                "weather",
                "ocean_analytics",
                "geospatial",
                "safety",
                "evidence",
                "visualization",
            ]

        else:

            agents = [
                "marine_data",
                "weather",
                "ocean_analytics",
                "geospatial",
                "safety",
                "alert",
                "evidence",
                "visualization",
            ]

        return {
            "intent": intent,
            "agents": base + agents,
            "agent_count": 1 + len(agents),
            "execution_order": agents,
            "explanation": self.explain_plan(
                intent,
                agents,
            ),
        }

    # ======================================================
    # ROUTE COORDINATE EXTRACTION
    # ======================================================

    def extract_route_coordinates(
        self,
        message: str,
    ) -> Optional[Dict[str, float]]:

        """
        Extract two coordinate pairs if the user explicitly
        provides them.

        Example:
            "Route from 15.2,80.8 to 16.0,81.5"

        No coordinates are invented.
        """

        # IMPORTANT:
        # Simple explicit coordinate-pair regex.
        #
        # Accepts:
        #   15.2,80.8
        #   -15.2, 80.8
        #   15,80
        #
        pattern = (
            r"(-?\d+(?:\.\d+)?)\s*,\s*"
            r"(-?\d+(?:\.\d+)?)"
        )

        matches = re.findall(
            pattern,
            message,
        )

        if len(matches) < 2:
            return None

        try:
            lat1 = float(matches[0][0])
            lon1 = float(matches[0][1])

            lat2 = float(matches[1][0])
            lon2 = float(matches[1][1])

        except (ValueError, TypeError):
            return None

        if not (
            -90 <= lat1 <= 90
            and -180 <= lon1 <= 180
            and -90 <= lat2 <= 90
            and -180 <= lon2 <= 180
        ):
            return None

        return {
            "start_latitude": lat1,
            "start_longitude": lon1,
            "destination_latitude": lat2,
            "destination_longitude": lon2,
        }

    # ======================================================
    # RESULT HELPERS
    # ======================================================

    def extract_locations_from_results(
        self,
        results: Dict[str, Any],
    ) -> List[Dict[str, Any]]:

        locations: List[Dict[str, Any]] = []

        for key in [
            "marine_data",
            "ocean_analytics",
            "weather",
        ]:

            result = results.get(key)

            if not isinstance(result, dict):
                continue

            location = result.get("location")

            if (
                isinstance(location, dict)
                and location.get("latitude") is not None
                and location.get("longitude") is not None
            ):
                locations.append(
                    {
                        "name": key,
                        "latitude": location["latitude"],
                        "longitude": location["longitude"],
                        "source": key,
                    }
                )

        return locations

    def extract_zones_from_results(
        self,
        results: Dict[str, Any],
    ) -> List[Dict[str, Any]]:

        """
        Return authoritative zone geometries if an upstream
        agent provides them.

        Current connected data sources do not provide
        authoritative PFZ/geofence polygons, so this method
        intentionally returns an empty list unless a future
        upstream agent supplies zone geometry.
        """

        zones: List[Dict[str, Any]] = []

        for key in [
            "marine_data",
            "geospatial",
        ]:

            result = results.get(key)

            if not isinstance(result, dict):
                continue

            candidate_zones = result.get("zones")

            if isinstance(candidate_zones, list):
                zones.extend(candidate_zones)

        return zones

    # ======================================================
    # EXECUTION HELPERS
    # ======================================================

    def _add_step(
        self,
        execution: Dict[str, Any],
        agent_name: str,
        status: str,
    ) -> None:

        execution["steps"].append(
            {
                "agent": agent_name,
                "status": status,
            }
        )

    def _update_step_status(
        self,
        execution: Dict[str, Any],
        agent_name: str,
        status: Optional[str],
    ) -> None:

        normalized_status = status or "unknown"

        for step in execution["steps"]:

            if step["agent"] == agent_name:
                step["status"] = normalized_status
                break

        if normalized_status in [
            "success",
            "ok",
            "ready",
        ]:

            if agent_name not in execution["completed"]:
                execution["completed"].append(
                    agent_name
                )

        elif normalized_status in [
            "error",
            "failed",
        ]:

            if agent_name not in execution["failed"]:
                execution["failed"].append(
                    agent_name
                )

        else:

            if agent_name not in execution["pending"]:
                execution["pending"].append(
                    agent_name
                )

    # ======================================================
    # PLAN EXPLANATION
    # ======================================================

    def explain_plan(
        self,
        intent: str,
        agents: List[str],
    ) -> str:

        descriptions = {
            "marine_data": "retrieve marine conditions",
            "weather": "retrieve weather and wind conditions",
            "ocean_analytics": "analyze SST, waves and ocean indicators",
            "geospatial": "perform geographic and spatial reasoning",
            "safety": "assess operational marine risk",
            "route_planner": "calculate and evaluate a vessel route",
            "alert": "detect actionable hazard signals",
            "evidence": "validate evidence, sources and limitations",
            "visualization": "prepare maps, metrics and charts using validated evidence",
        }

        parts = []

        for agent in agents:

            description = descriptions.get(
                agent,
                agent,
            )

            parts.append(description)

        return (
            f"Intent '{intent}' detected. "
            f"The system will "
            + ", ".join(parts)
            + "."
        )

    # ======================================================
    # STATUS
    # ======================================================

    def get_status(self) -> Dict[str, Any]:

        return {
            "agent": self.name,
            "display_name": self.display_name,
            "status": (
                "ready"
                if self.last_result is None
                else self.last_result.get(
                    "status",
                    "unknown",
                )
            ),
            "agent_count": 10,
            "connected_agents": [
                "orchestrator",
                "marine_data",
                "weather",
                "ocean_analytics",
                "geospatial",
                "safety",
                "route_planner",
                "alert",
                "visualization",
                "evidence",
            ],
            "pending_agents": [],
            "has_result": self.last_result is not None,
        }