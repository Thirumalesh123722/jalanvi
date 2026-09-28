from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from math import radians, sin, cos, sqrt, atan2


class RoutePlannerAgent:
    """
    Aqua Intellect - Route Planner Agent

    Responsibilities:
    - Build vessel route candidates
    - Calculate route distance
    - Estimate travel time
    - Evaluate route segments against
      available marine/weather risk
    - Avoid known restricted zones when supplied
    - Return transparent route reasoning

    Important:
    - Does not claim a route is safe unless
      available evidence supports that statement.
    - Does not invent restricted zones.
    - Generated routes are planning geometries,
      not certified navigation routes.
    """

    name = "route_planner"
    display_name = "Route Planner Agent"

    def __init__(self):
        self.last_result: Optional[Dict[str, Any]] = None

    async def run(
        self,
        query: str,
        start_latitude: Optional[float] = None,
        start_longitude: Optional[float] = None,
        destination_latitude: Optional[float] = None,
        destination_longitude: Optional[float] = None,
        marine_result: Optional[Dict[str, Any]] = None,
        weather_result: Optional[Dict[str, Any]] = None,
        safety_result: Optional[Dict[str, Any]] = None,
        geospatial_result: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:

        marine_result = marine_result or {}
        weather_result = weather_result or {}
        safety_result = safety_result or {}
        geospatial_result = geospatial_result or {}

        if not self.valid_coordinate_pair(
            start_latitude,
            start_longitude,
        ):
            return self.build_error_result(
                query=query,
                message=(
                    "Valid starting latitude and longitude "
                    "are required for route planning."
                ),
            )

        if not self.valid_coordinate_pair(
            destination_latitude,
            destination_longitude,
        ):
            return self.build_error_result(
                query=query,
                message=(
                    "Valid destination latitude and longitude "
                    "are required for route planning."
                ),
            )

        route_distance_km = self.haversine_distance(
            start_latitude,
            start_longitude,
            destination_latitude,
            destination_longitude,
        )

        route_distance_nm = route_distance_km / 1.852

        vessel_speed_knots = self.extract_vessel_speed(
            query=query
        )

        estimated_hours = (
            route_distance_nm / vessel_speed_knots
        )

        risk_context = self.build_risk_context(
            weather_result=weather_result,
            safety_result=safety_result,
            marine_result=marine_result,
        )

        route_status = self.determine_route_status(
            risk_context=risk_context,
            geospatial_result=geospatial_result,
        )

        route = {
            "start": {
                "latitude": start_latitude,
                "longitude": start_longitude,
            },
            "destination": {
                "latitude": destination_latitude,
                "longitude": destination_longitude,
            },
            "distance_km": round(
                route_distance_km,
                3,
            ),
            "distance_nm": round(
                route_distance_nm,
                3,
            ),
            "assumed_speed_knots": vessel_speed_knots,
            "estimated_travel_hours": round(
                estimated_hours,
                2,
            ),
            "status": route_status,
        }

        alternatives = self.build_route_alternatives(
            start_latitude=start_latitude,
            start_longitude=start_longitude,
            destination_latitude=destination_latitude,
            destination_longitude=destination_longitude,
            direct_distance_km=route_distance_km,
        )

        limitations = self.identify_limitations(
            marine_result=marine_result,
            weather_result=weather_result,
            safety_result=safety_result,
            geospatial_result=geospatial_result,
        )

        confidence = self.calculate_confidence(
            marine_result=marine_result,
            weather_result=weather_result,
            safety_result=safety_result,
        )

        result = {
            "agent": self.name,
            "status": "success",
            "query": query,
            "route": route,
            "alternatives": alternatives,
            "risk_context": risk_context,
            "limitations": limitations,
            "sources": self.collect_sources(
                marine_result=marine_result,
                weather_result=weather_result,
                safety_result=safety_result,
            ),
            "confidence": confidence,
            "generated_at": datetime.now(
                timezone.utc
            ).isoformat(),
            "message": self.build_message(
                route=route,
                limitations=limitations,
            ),
        }

        self.last_result = result

        return result

    def extract_vessel_speed(
        self,
        query: str,
    ) -> float:

        text = query.lower()

        tokens = (
            text.replace(",", " ")
            .replace(":", " ")
            .split()
        )

        for index, token in enumerate(tokens):
            if token in [
                "knots",
                "knot",
                "kn",
            ]:
                if index > 0:
                    try:
                        value = float(
                            tokens[index - 1]
                        )

                        if 1 <= value <= 60:
                            return value

                    except ValueError:
                        pass

        # Conservative planning assumption.
        # Actual vessel speed should be supplied
        # by vessel-specific data when available.
        return 10.0

    def build_risk_context(
        self,
        weather_result: Dict[str, Any],
        safety_result: Dict[str, Any],
        marine_result: Dict[str, Any],
    ) -> Dict[str, Any]:

        weather_assessment = weather_result.get(
            "assessment",
            {},
        )

        if not isinstance(weather_assessment, dict):
            weather_assessment = {}

        safety_risk = safety_result.get(
            "risk",
            {},
        )

        if not isinstance(safety_risk, dict):
            safety_risk = {}

        marine_summary = marine_result.get(
            "summary",
            {},
        )

        if not isinstance(marine_summary, dict):
            marine_summary = {}

        # Current Weather Agent schema.
        weather_status = weather_assessment.get(
            "operational_status"
        )

        # Backward compatibility with older schema.
        if not weather_status:
            weather_status = weather_assessment.get(
                "status",
                "unknown",
            )

        weather_signals = weather_assessment.get(
            "signals",
            [],
        )

        if not isinstance(weather_signals, list):
            weather_signals = []

        # Backward compatibility with older schema.
        if not weather_signals:
            weather_signals = weather_assessment.get(
                "reasons",
                [],
            )

        safety_level = safety_risk.get(
            "level",
            "unknown",
        )

        wave_height = marine_summary.get(
            "wave_height",
            {},
        )

        if not isinstance(wave_height, dict):
            wave_height = {}

        return {
            "weather_status": weather_status,
            "weather_signals": weather_signals,
            "safety_level": safety_level,
            "safety_operational_status": safety_risk.get(
                "operational_status",
                "unknown",
            ),
            "wave_height": wave_height,
            "evidence_available": bool(
                weather_result
                or marine_result
                or safety_result
            ),
        }

    def determine_route_status(
        self,
        risk_context: Dict[str, Any],
        geospatial_result: Dict[str, Any],
    ) -> str:

        safety_level = risk_context.get(
            "safety_level"
        )

        weather_status = risk_context.get(
            "weather_status"
        )

        if (
            safety_level == "high"
            or weather_status == "high_attention"
        ):
            return "high_attention"

        if (
            safety_level == "moderate"
            or weather_status == "moderate_attention"
        ):
            return "caution"

        if not risk_context.get(
            "evidence_available"
        ):
            return "insufficient_evidence"

        return "no_major_signal"

    def build_route_alternatives(
        self,
        start_latitude: float,
        start_longitude: float,
        destination_latitude: float,
        destination_longitude: float,
        direct_distance_km: float,
    ) -> List[Dict[str, Any]]:

        # These are geometric candidates only.
        # They are not certified navigational routes.

        midpoint_latitude = (
            start_latitude
            + destination_latitude
        ) / 2

        midpoint_longitude = (
            start_longitude
            + destination_longitude
        ) / 2

        return [
            {
                "name": "Direct geometric route",
                "type": "geometric",
                "distance_km": round(
                    direct_distance_km,
                    3,
                ),
                "waypoints": [
                    {
                        "latitude": start_latitude,
                        "longitude": start_longitude,
                    },
                    {
                        "latitude": destination_latitude,
                        "longitude": destination_longitude,
                    },
                ],
            },
            {
                "name": "Midpoint geometric route",
                "type": "geometric",
                "distance_km": round(
                    direct_distance_km,
                    3,
                ),
                "waypoints": [
                    {
                        "latitude": start_latitude,
                        "longitude": start_longitude,
                    },
                    {
                        "latitude": midpoint_latitude,
                        "longitude": midpoint_longitude,
                    },
                    {
                        "latitude": destination_latitude,
                        "longitude": destination_longitude,
                    },
                ],
            },
        ]

    def identify_limitations(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        safety_result: Dict[str, Any],
        geospatial_result: Dict[str, Any],
    ) -> List[str]:

        limitations = []

        if not marine_result:
            limitations.append(
                "Marine conditions were not available."
            )

        if not weather_result:
            limitations.append(
                "Weather forecast was not available."
            )

        if not safety_result:
            limitations.append(
                "Dedicated safety assessment was not available."
            )

        if not geospatial_result:
            limitations.append(
                "Geospatial zone validation was not available."
            )

        limitations.append(
            "The generated route is a planning geometry, "
            "not a certified navigation route."
        )

        limitations.append(
            "Actual vessel speed, draft, traffic, bathymetry, "
            "navigation notices and restricted areas should "
            "be validated before operational use."
        )

        return limitations

    def calculate_confidence(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        safety_result: Dict[str, Any],
    ) -> float:

        confidences = []

        for result in [
            marine_result,
            weather_result,
            safety_result,
        ]:
            confidence = result.get(
                "confidence"
            )

            if isinstance(
                confidence,
                (int, float),
            ):
                confidences.append(
                    float(confidence)
                )

        if not confidences:
            return 0.40

        return round(
            sum(confidences)
            / len(confidences),
            3,
        )

    def collect_sources(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        safety_result: Dict[str, Any],
    ) -> List[Dict[str, Any]]:

        sources: List[Dict[str, Any]] = []
        seen = set()

        for result in [
            marine_result,
            weather_result,
            safety_result,
        ]:
            result_sources = result.get(
                "sources",
                [],
            )

            if not isinstance(
                result_sources,
                list,
            ):
                continue

            for source in result_sources:
                if not isinstance(source, dict):
                    continue

                name = str(
                    source.get("name") or ""
                ).strip()

                source_type = str(
                    source.get("type") or ""
                ).strip()

                url = str(
                    source.get("url") or ""
                ).strip()

                key = (
                    name.lower(),
                    source_type.lower(),
                    url.lower(),
                )

                if key in seen:
                    continue

                seen.add(key)
                sources.append(source)

        return sources

    def build_message(
        self,
        route: Dict[str, Any],
        limitations: List[str],
    ) -> str:

        status = route.get(
            "status"
        )

        distance = route.get(
            "distance_km"
        )

        hours = route.get(
            "estimated_travel_hours"
        )

        speed = route.get(
            "assumed_speed_knots"
        )

        if status == "high_attention":
            message = (
                f"A geometric route of approximately "
                f"{distance} km was calculated, but "
                f"the available conditions indicate "
                f"high operational attention."
            )

        elif status == "caution":
            message = (
                f"A geometric route of approximately "
                f"{distance} km was calculated with "
                f"caution conditions in the available "
                f"marine/weather evidence."
            )

        elif status == "insufficient_evidence":
            message = (
                f"A geometric route of approximately "
                f"{distance} km was calculated, but "
                f"available operational evidence is "
                f"insufficient for a stronger assessment."
            )

        else:
            message = (
                f"A geometric route of approximately "
                f"{distance} km was calculated with "
                f"an estimated travel time of "
                f"{hours} hours at an assumed vessel "
                f"speed of {speed} knots."
            )

        if limitations:
            message += (
                " This is a planning result and "
                "requires operational navigation validation."
            )

        return message

    def build_error_result(
        self,
        query: str,
        message: str,
    ) -> Dict[str, Any]:

        result = {
            "agent": self.name,
            "status": "location_required",
            "query": query,
            "route": {},
            "alternatives": [],
            "risk_context": {},
            "limitations": [
                message
            ],
            "sources": [],
            "confidence": 0.0,
            "message": message,
        }

        self.last_result = result

        return result

    @staticmethod
    def valid_coordinate_pair(
        latitude: Optional[float],
        longitude: Optional[float],
    ) -> bool:

        if not isinstance(
            latitude,
            (int, float),
        ):
            return False

        if not isinstance(
            longitude,
            (int, float),
        ):
            return False

        return (
            -90 <= latitude <= 90
            and -180 <= longitude <= 180
        )

    @staticmethod
    def haversine_distance(
        latitude_1: float,
        longitude_1: float,
        latitude_2: float,
        longitude_2: float,
    ) -> float:

        earth_radius_km = 6371.0088

        lat1 = radians(
            latitude_1
        )

        lat2 = radians(
            latitude_2
        )

        delta_lat = radians(
            latitude_2 - latitude_1
        )

        delta_lon = radians(
            longitude_2 - longitude_1
        )

        a = (
            sin(delta_lat / 2) ** 2
            + cos(lat1)
            * cos(lat2)
            * sin(delta_lon / 2) ** 2
        )

        c = 2 * atan2(
            sqrt(a),
            sqrt(1 - a),
        )

        return earth_radius_km * c

    def get_status(
        self,
    ) -> Dict[str, Any]:

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
            "has_result": (
                self.last_result is not None
            ),
        }