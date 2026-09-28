from typing import Any, Dict, List, Optional
from datetime import datetime, timezone, timedelta
import re

import httpx

from services.marine_service import MarineService


class MarineDataAgent:
    """
    Aqua Intellect - Marine Data Agent

    Responsibilities:
    - Understand marine-data requirements
    - Understand temporal requirements
    - Retrieve live marine model data
    - Filter data to the requested time window
    - Calculate useful summaries
    - Track data source and freshness
    - Never invent marine observations

    Supported temporal expressions:
    - today
    - tomorrow
    - next N days
    - explicit YYYY-MM-DD date
    """

    name = "marine_data"
    display_name = "Marine Data Agent"

    def __init__(self):
        self.last_result: Optional[Dict[str, Any]] = None
        self.marine_service = MarineService()

    async def run(
        self,
        query: str,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        forecast_days: int = 1,
    ) -> Dict[str, Any]:

        requested_data = self.detect_required_data(
            query
        )

        # --------------------------------------------------
        # Location validation
        # --------------------------------------------------

        if latitude is None or longitude is None:

            result = {
                "agent": self.name,
                "status": "location_required",
                "query": query,
                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },
                "requested_data": requested_data,
                "temporal_window": self.detect_temporal_window(
                    query=query
                ),
                "observations": [],
                "sources": [],
                "confidence": 0.0,
                "message": (
                    "A geographic location is required "
                    "to retrieve location-specific "
                    "marine conditions."
                ),
            }

            self.last_result = result

            return result

        # --------------------------------------------------
        # Determine temporal window
        # --------------------------------------------------

        temporal_window = self.detect_temporal_window(
            query=query
        )

        effective_forecast_days = max(
            forecast_days,
            temporal_window["forecast_days"],
        )

        try:

            # --------------------------------------------------
            # Get live marine data
            # --------------------------------------------------

            normalized = (
                await self.marine_service.get_marine_data(
                    latitude=latitude,
                    longitude=longitude,
                    forecast_days=effective_forecast_days,
                    start_date=temporal_window[
                        "start_date"
                    ],
                    end_date=temporal_window[
                        "end_date"
                    ],
                )
            )

            # --------------------------------------------------
            # Generate statistical summary
            #
            # get_marine_data() already returns normalized
            # and temporally filtered data.
            # --------------------------------------------------

            summary = self.marine_service.get_summary(
                normalized
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

                "forecast_days": effective_forecast_days,

                "requested_data": requested_data,

                "temporal_window": {
                    **temporal_window,
                    "matched_hourly_points": (
                        matched_points
                    ),
                },

                "data": normalized,

                "summary": summary,

                "sources": [
                    {
                        "name": "Open-Meteo Marine",
                        "type": "marine_forecast",
                        "status": "live",
                        "url": (
                            "https://marine-api.open-meteo.com/"
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
                    temporal_window=temporal_window,
                    matched_points=matched_points,
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

                "requested_data": requested_data,

                "temporal_window": temporal_window,

                "observations": [],

                "sources": [],

                "confidence": 0.0,

                "error": str(exc),

                "message": (
                    "Marine data service "
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

                "requested_data": requested_data,

                "temporal_window": temporal_window,

                "observations": [],

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

                "requested_data": requested_data,

                "temporal_window": temporal_window,

                "observations": [],

                "sources": [],

                "confidence": 0.0,

                "error": str(exc),

                "message": (
                    "Unexpected error occurred "
                    "while retrieving marine data."
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
        Convert natural-language temporal expressions into
        an explicit date window.

        Examples:

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

        The current local date is taken from the system
        clock of the backend.
        """

        text = (
            query.lower()
            if isinstance(query, str)
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

            explicit_date = datetime.strptime(
                explicit_match.group(1),
                "%Y-%m-%d",
            ).date()

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
                "forecast_days": forecast_days,
                "reason": (
                    "Explicit YYYY-MM-DD date "
                    "detected in query."
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
                today + timedelta(days=1)
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
                    "Tomorrow detected in query."
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
                    "Today detected in query."
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

            number_of_days = max(
                1,
                min(number_of_days, 7),
            )

            end_date = (
                today
                + timedelta(
                    days=number_of_days - 1
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
                "forecast_days": number_of_days,
                "days": number_of_days,
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
                "No explicit temporal expression "
                "detected."
            ),
        }

    # ======================================================
    # Data requirement detection
    # ======================================================

    def detect_required_data(
        self,
        query: str,
    ) -> List[str]:

        """
        Detect which marine datasets are relevant
        to the user's query.
        """

        text = query.lower()

        required: List[str] = []

        # --------------------------------------------------
        # PFZ / Fishing
        # --------------------------------------------------

        if any(
            keyword in text
            for keyword in [
                "pfz",
                "fishing",
                "fish",
                "fishing zone",
                "fish zone",
                "productive area",
                "hotspot",
            ]
        ):

            required.extend(
                [
                    "pfz",
                    "sst",
                    "chlorophyll",
                ]
            )

        # --------------------------------------------------
        # SST
        # --------------------------------------------------

        if any(
            keyword in text
            for keyword in [
                "sst",
                "sea surface temperature",
                "sea temperature",
                "water temperature",
            ]
        ):

            required.append(
                "sst"
            )

        # --------------------------------------------------
        # Chlorophyll
        # --------------------------------------------------

        if any(
            keyword in text
            for keyword in [
                "chlorophyll",
                "chlorophyll-a",
                "productivity",
            ]
        ):

            required.append(
                "chlorophyll"
            )

        # --------------------------------------------------
        # General ocean conditions
        # --------------------------------------------------

        if any(
            keyword in text
            for keyword in [
                "ocean",
                "marine",
                "sea condition",
                "sea conditions",
                "ocean condition",
            ]
        ):

            required.extend(
                [
                    "sst",
                    "waves",
                    "currents",
                ]
            )

        # --------------------------------------------------
        # Currents
        # --------------------------------------------------

        if any(
            keyword in text
            for keyword in [
                "current",
                "currents",
                "ocean current",
            ]
        ):

            required.append(
                "currents"
            )

        # --------------------------------------------------
        # Waves
        # --------------------------------------------------

        if any(
            keyword in text
            for keyword in [
                "wave",
                "waves",
                "swell",
                "sea state",
            ]
        ):

            required.append(
                "waves"
            )

        # --------------------------------------------------
        # Remove duplicates
        # --------------------------------------------------

        required = list(
            dict.fromkeys(
                required
            )
        )

        # --------------------------------------------------
        # Generic marine query
        # --------------------------------------------------

        if not required:

            required = [
                "sst",
                "chlorophyll",
                "waves",
                "currents",
            ]

        return required

    # ======================================================
    # Human-readable result message
    # ======================================================

    @staticmethod
    def build_message(
        temporal_window: Dict[str, Any],
        matched_points: int,
    ) -> str:
        """
        Build a transparent result message that tells
        downstream agents which temporal window was used.
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
                "Live marine model data retrieved "
                f"for {label} ({start_date}) "
                f"using {matched_points} hourly "
                "observations."
            )

        if start_date and end_date:

            return (
                "Live marine model data retrieved "
                f"for {start_date} to {end_date} "
                f"using {matched_points} hourly "
                "observations."
            )

        return (
            "Live marine model data "
            "retrieved successfully."
        )

    # ======================================================
    # Agent status
    # ======================================================

    def get_status(
        self,
    ) -> Dict[str, Any]:

        """
        Return current Marine Data Agent state.
        """

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