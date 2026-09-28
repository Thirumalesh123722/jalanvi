from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import re
from datetime import timedelta

import httpx

from services.weather_service import WeatherService


class WeatherAgent:
    """
    Aqua Intellect - Weather Agent

    Responsibilities:
    - Understand weather-related requirements
    - Understand temporal requirements
    - Retrieve live forecast data
    - Filter data to the requested time window
    - Analyze wind and precipitation
    - Detect operational weather signals
    - Track source and freshness
    - Never invent weather observations

    Supported temporal expressions:
    - today
    - tomorrow
    - next N days
    - explicit YYYY-MM-DD date
    """

    name = "weather"
    display_name = "Weather Agent"

    def __init__(self):

        self.last_result: Optional[
            Dict[str, Any]
        ] = None

        self.weather_service = (
            WeatherService()
        )

    async def run(
        self,
        query: str,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        forecast_days: int = 1,
    ) -> Dict[str, Any]:

        requested_data = (
            self.detect_required_data(
                query
            )
        )

        # --------------------------------------------------
        # Location validation
        # --------------------------------------------------

        if (
            latitude is None
            or longitude is None
        ):

            result = {
                "agent": self.name,

                "status": "location_required",

                "query": query,

                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },

                "requested_data": (
                    requested_data
                ),

                "temporal_window": (
                    self.detect_temporal_window(
                        query
                    )
                ),

                "forecast": [],

                "sources": [],

                "confidence": 0.0,

                "message": (
                    "A geographic location "
                    "is required to retrieve "
                    "location-specific weather "
                    "conditions."
                ),
            }

            self.last_result = result

            return result

        # --------------------------------------------------
        # Determine temporal window
        # --------------------------------------------------

        temporal_window = (
            self.detect_temporal_window(
                query
            )
        )

        effective_forecast_days = max(
            forecast_days,
            temporal_window[
                "forecast_days"
            ],
        )

        try:

            # --------------------------------------------------
            # Get live weather data
            #
            # WeatherService now performs normalization
            # and optional temporal filtering.
            # --------------------------------------------------

            normalized = (
                await self.weather_service
                .get_weather_data(
                    latitude=latitude,
                    longitude=longitude,
                    forecast_days=(
                        effective_forecast_days
                    ),
                    start_date=(
                        temporal_window[
                            "start_date"
                        ]
                    ),
                    end_date=(
                        temporal_window[
                            "end_date"
                        ]
                    ),
                )
            )

            # --------------------------------------------------
            # Generate summary from the selected
            # temporal window only
            # --------------------------------------------------

            summary = (
                self.weather_service
                .get_summary(
                    normalized
                )
            )

            # --------------------------------------------------
            # Assess only the selected temporal window
            # --------------------------------------------------

            assessment = (
                self.weather_service
                .assess_conditions(
                    normalized
                )
            )

            matched_points = len(
                normalized.get(
                    "time",
                    []
                )
            )

            # --------------------------------------------------
            # Build final agent result
            # --------------------------------------------------

            result = {
                "agent": self.name,

                "status": "success",

                "query": query,

                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },

                "forecast_days": (
                    effective_forecast_days
                ),

                "requested_data": (
                    requested_data
                ),

                "temporal_window": {
                    **temporal_window,
                    "matched_hourly_points": (
                        matched_points
                    ),
                },

                "data": normalized,

                "summary": summary,

                "assessment": assessment,

                "sources": [
                    {
                        "name": (
                            "Open-Meteo Weather"
                        ),
                        "type": (
                            "weather_forecast"
                        ),
                        "status": "live",
                        "url": (
                            "https://api.open-meteo.com/"
                            "v1/forecast"
                        ),
                    }
                ],

                "retrieved_at": (
                    datetime.now(
                        timezone.utc
                    ).isoformat()
                ),

                "confidence": 0.85,

                "message": self.build_message(
                    temporal_window=(
                        temporal_window
                    ),
                    matched_points=(
                        matched_points
                    ),
                ),
            }

            self.last_result = result

            return result

        except httpx.HTTPError as exc:

            result = {
                "agent": self.name,

                "status": "error",

                "query": query,

                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },

                "requested_data": (
                    requested_data
                ),

                "temporal_window": (
                    temporal_window
                ),

                "forecast": [],

                "sources": [],

                "confidence": 0.0,

                "error": str(exc),

                "message": (
                    "Weather data service "
                    "could not be reached."
                ),
            }

            self.last_result = result

            return result

        except ValueError as exc:

            result = {
                "agent": self.name,

                "status": "error",

                "query": query,

                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },

                "requested_data": (
                    requested_data
                ),

                "temporal_window": (
                    temporal_window
                ),

                "forecast": [],

                "sources": [],

                "confidence": 0.0,

                "error": str(exc),

                "message": (
                    "The requested temporal "
                    "window is invalid."
                ),
            }

            self.last_result = result

            return result

        except Exception as exc:

            result = {
                "agent": self.name,

                "status": "error",

                "query": query,

                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },

                "requested_data": (
                    requested_data
                ),

                "temporal_window": (
                    temporal_window
                ),

                "forecast": [],

                "sources": [],

                "confidence": 0.0,

                "error": str(exc),

                "message": (
                    "Unexpected error occurred "
                    "while retrieving weather "
                    "data."
                ),
            }

            self.last_result = result

            return result

    # ======================================================
    # Temporal reasoning
    # ======================================================

    def detect_temporal_window(
        self,
        query: str,
    ) -> Dict[str, Any]:
        """
        Convert natural-language temporal expressions
        into an explicit date window.

        Supported examples:

            "today"
                -> today only

            "tomorrow"
                -> tomorrow only

            "next 3 days"
                -> today through day 3

            "next 5 days"
                -> today through day 5

            "2026-09-28"
                -> that date only
        """

        text = (
            query.lower()
            if isinstance(
                query,
                str,
            )
            else ""
        )

        today = datetime.now().date()

        # --------------------------------------------------
        # Explicit YYYY-MM-DD date
        # --------------------------------------------------

        explicit_match = re.search(
            r"\b(20\d{2}-\d{2}-\d{2})\b",
            text,
        )

        if explicit_match:

            explicit_date = (
                datetime.strptime(
                    explicit_match.group(1),
                    "%Y-%m-%d",
                ).date()
            )

            days_from_today = (
                explicit_date - today
            ).days

            forecast_days = max(
                1,
                days_from_today + 1,
            )

            return {
                "label": "explicit_date",

                "start_date": (
                    explicit_date.isoformat()
                ),

                "end_date": (
                    explicit_date.isoformat()
                ),

                "forecast_days": (
                    forecast_days
                ),

                "reason": (
                    "Explicit YYYY-MM-DD "
                    "date detected in query."
                ),
            }

        # --------------------------------------------------
        # Tomorrow
        # --------------------------------------------------

        if re.search(
            r"\b(tomorrow|tomorrows|tomorrow's)\b",
            text,
        ):

            tomorrow = (
                today
                + timedelta(days=1)
            )

            return {
                "label": "tomorrow",

                "start_date": (
                    tomorrow.isoformat()
                ),

                "end_date": (
                    tomorrow.isoformat()
                ),

                "forecast_days": 2,

                "reason": (
                    "Tomorrow detected "
                    "in query."
                ),
            }

        # --------------------------------------------------
        # Today
        # --------------------------------------------------

        if re.search(
            r"\b(today|todays|today's)\b",
            text,
        ):

            return {
                "label": "today",

                "start_date": (
                    today.isoformat()
                ),

                "end_date": (
                    today.isoformat()
                ),

                "forecast_days": 1,

                "reason": (
                    "Today detected "
                    "in query."
                ),
            }

        # --------------------------------------------------
        # Next N days
        # --------------------------------------------------

        next_days_match = re.search(
            r"\bnext\s+(\d+)\s+days?\b",
            text,
        )

        if next_days_match:

            number_of_days = int(
                next_days_match.group(1)
            )

            # Keep within the connected
            # forecast capability.

            number_of_days = max(
                1,
                min(
                    number_of_days,
                    7,
                ),
            )

            end_date = (
                today
                + timedelta(
                    days=(
                        number_of_days - 1
                    )
                )
            )

            return {
                "label": "next_days",

                "start_date": (
                    today.isoformat()
                ),

                "end_date": (
                    end_date.isoformat()
                ),

                "forecast_days": (
                    number_of_days
                ),

                "days": (
                    number_of_days
                ),

                "reason": (
                    f"Next {number_of_days} "
                    "days detected in query."
                ),
            }

        # --------------------------------------------------
        # Default
        # --------------------------------------------------

        return {
            "label": "default",

            "start_date": None,

            "end_date": None,

            "forecast_days": 1,

            "reason": (
                "No explicit temporal "
                "expression detected."
            ),
        }

    # ======================================================
    # Weather data requirement detection
    # ======================================================

    def detect_required_data(
        self,
        query: str,
    ) -> List[str]:

        """
        Detect weather datasets relevant
        to the user's request.
        """

        text = query.lower()

        required: List[str] = []

        # --------------------------------------------------
        # General weather
        # --------------------------------------------------

        if any(
            keyword in text
            for keyword in [
                "weather",
                "forecast",
                "condition",
                "conditions",
            ]
        ):

            required.extend(
                [
                    "temperature",
                    "wind",
                    "precipitation",
                    "weather_code",
                ]
            )

        # --------------------------------------------------
        # Wind
        # --------------------------------------------------

        if any(
            keyword in text
            for keyword in [
                "wind",
                "winds",
                "wind speed",
                "gust",
                "gusts",
            ]
        ):

            required.extend(
                [
                    "wind",
                    "wind_gusts",
                    "wind_direction",
                ]
            )

        # --------------------------------------------------
        # Rain / precipitation
        # --------------------------------------------------

        if any(
            keyword in text
            for keyword in [
                "rain",
                "rainfall",
                "precipitation",
            ]
        ):

            required.extend(
                [
                    "rain",
                    "precipitation",
                ]
            )

        # --------------------------------------------------
        # Operational risk
        # --------------------------------------------------

        if any(
            keyword in text
            for keyword in [
                "storm",
                "cyclone",
                "danger",
                "hazard",
                "safe",
                "safety",
            ]
        ):

            required.extend(
                [
                    "wind",
                    "wind_gusts",
                    "precipitation",
                    "weather_code",
                ]
            )

        # --------------------------------------------------
        # Time-specific forecast
        # --------------------------------------------------

        if any(
            keyword in text
            for keyword in [
                "tomorrow",
                "today",
                "tonight",
                "next",
            ]
        ):

            required.append(
                "time_specific_forecast"
            )

        # --------------------------------------------------
        # Generic fallback
        # --------------------------------------------------

        if not required:

            required = [
                "temperature",
                "wind",
                "wind_gusts",
                "precipitation",
                "weather_code",
            ]

        return list(
            dict.fromkeys(
                required
            )
        )

    # ======================================================
    # Human-readable result message
    # ======================================================

    @staticmethod
    def build_message(
        temporal_window: Dict[str, Any],
        matched_points: int,
    ) -> str:
        """
        Build a transparent message describing
        the analyzed time window.
        """

        label = temporal_window.get(
            "label"
        )

        start_date = temporal_window.get(
            "start_date"
        )

        end_date = temporal_window.get(
            "end_date"
        )

        if (
            start_date
            and end_date
            and start_date == end_date
        ):

            return (
                "Live weather forecast data "
                f"retrieved and analyzed for "
                f"{label} ({start_date}) using "
                f"{matched_points} hourly "
                "observations."
            )

        if (
            start_date
            and end_date
        ):

            return (
                "Live weather forecast data "
                f"retrieved and analyzed for "
                f"{start_date} to {end_date} "
                f"using {matched_points} "
                "hourly observations."
            )

        return (
            "Live weather forecast data "
            "retrieved and analyzed "
            "successfully."
        )

    # ======================================================
    # Agent status
    # ======================================================

    def get_status(
        self,
    ) -> Dict[str, Any]:

        """
        Return current Weather Agent state.
        """

        return {
            "agent": self.name,

            "display_name": (
                self.display_name
            ),

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