import httpx
from datetime import datetime, date
from typing import Any, Dict, Optional


class MarineService:
    """
    Aqua Intellect - Live Marine Data Service

    Provides marine forecast/model data for a geographic location.

    Current source:
    Open-Meteo Marine API

    Data handled:
    - Sea surface temperature
    - Wave height
    - Wave direction
    - Wave period
    - Ocean current velocity
    - Ocean current direction

    Temporal support:
    - Full forecast response
    - Optional date-based filtering
    - Tomorrow / explicit-date windows can be handled
      by passing start_date and end_date
    """

    BASE_URL = "https://marine-api.open-meteo.com/v1/marine"

    HOURLY_FIELDS = [
        "sea_surface_temperature",
        "wave_height",
        "wave_direction",
        "wave_period",
        "ocean_current_velocity",
        "ocean_current_direction",
    ]

    async def get_marine_data(
        self,
        latitude: float,
        longitude: float,
        forecast_days: int = 3,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Fetch marine forecast/model data.

        Parameters
        ----------
        latitude:
            Geographic latitude.

        longitude:
            Geographic longitude.

        forecast_days:
            Number of forecast days requested from Open-Meteo.

        start_date:
            Optional analysis start date in YYYY-MM-DD format.

        end_date:
            Optional analysis end date in YYYY-MM-DD format.

        Notes
        -----
        Open-Meteo provides hourly marine model/forecast data.

        If start_date/end_date are provided, the API response is
        filtered locally so downstream agents receive only the
        requested temporal analysis window.
        """

        params = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": ",".join(self.HOURLY_FIELDS),
            "forecast_days": forecast_days,
            "timezone": "auto",
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(
                self.BASE_URL,
                params=params,
            )

            response.raise_for_status()

            raw_data = response.json()

        normalized = self.normalize(raw_data)

        if start_date or end_date:
            normalized = self.filter_by_date_range(
                normalized_data=normalized,
                start_date=start_date,
                end_date=end_date,
            )

        return normalized

    def normalize(
        self,
        raw_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Normalize the raw Open-Meteo response into a stable
        Aqua Intellect marine data structure.
        """

        hourly = raw_data.get("hourly", {})

        return {
            "source": "Open-Meteo Marine",
            "latitude": raw_data.get("latitude"),
            "longitude": raw_data.get("longitude"),
            "elevation": raw_data.get("elevation"),
            "timezone": raw_data.get("timezone"),
            "utc_offset_seconds": raw_data.get(
                "utc_offset_seconds"
            ),

            "time": hourly.get(
                "time",
                []
            ),

            "sea_surface_temperature": hourly.get(
                "sea_surface_temperature",
                []
            ),

            "wave_height": hourly.get(
                "wave_height",
                []
            ),

            "wave_direction": hourly.get(
                "wave_direction",
                []
            ),

            "wave_period": hourly.get(
                "wave_period",
                []
            ),

            "ocean_current_velocity": hourly.get(
                "ocean_current_velocity",
                []
            ),

            "ocean_current_direction": hourly.get(
                "ocean_current_direction",
                []
            ),
        }

    def filter_by_date_range(
        self,
        normalized_data: Dict[str, Any],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Filter hourly marine data by local calendar date.

        Example:

            start_date="2026-09-25"
            end_date="2026-09-25"

        returns only:

            2026-09-25 00:00
            ...
            2026-09-25 23:00

        This is important for queries such as:

            "Tomorrow fishing conditions"

        because the analysis should not accidentally aggregate
        today + tomorrow together.
        """

        times = normalized_data.get("time", [])

        if not isinstance(times, list) or not times:
            return self._add_temporal_metadata(
                normalized_data,
                start_date=start_date,
                end_date=end_date,
                matched_points=0,
            )

        parsed_start = self._parse_date(start_date)
        parsed_end = self._parse_date(end_date)

        if parsed_start and parsed_end and parsed_end < parsed_start:
            raise ValueError(
                "end_date cannot be earlier than start_date"
            )

        selected_indices = []

        for index, timestamp in enumerate(times):
            timestamp_date = self._extract_date(timestamp)

            if timestamp_date is None:
                continue

            if parsed_start and timestamp_date < parsed_start:
                continue

            if parsed_end and timestamp_date > parsed_end:
                continue

            selected_indices.append(index)

        filtered = dict(normalized_data)

        temporal_fields = [
            "time",
            "sea_surface_temperature",
            "wave_height",
            "wave_direction",
            "wave_period",
            "ocean_current_velocity",
            "ocean_current_direction",
        ]

        for field in temporal_fields:
            values = normalized_data.get(field, [])

            if not isinstance(values, list):
                filtered[field] = []
                continue

            filtered[field] = [
                values[index]
                for index in selected_indices
                if index < len(values)
            ]

        filtered = self._add_temporal_metadata(
            filtered,
            start_date=start_date,
            end_date=end_date,
            matched_points=len(selected_indices),
        )

        return filtered

    def get_summary(
        self,
        normalized_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Creates a compact summary from the currently selected
        hourly marine data.

        Important:
        This method summarizes ONLY the values present in
        normalized_data.

        Therefore, if filter_by_date_range() was used first,
        the summary represents only that temporal window.
        """

        sst = self._numeric_values(
            normalized_data.get(
                "sea_surface_temperature",
                []
            )
        )

        wave_height = self._numeric_values(
            normalized_data.get(
                "wave_height",
                []
            )
        )

        wave_period = self._numeric_values(
            normalized_data.get(
                "wave_period",
                []
            )
        )

        current_velocity = self._numeric_values(
            normalized_data.get(
                "ocean_current_velocity",
                []
            )
        )

        return {
            "sea_surface_temperature": self._statistics(
                sst
            ),
            "wave_height": self._statistics(
                wave_height
            ),
            "wave_period": self._statistics(
                wave_period
            ),
            "ocean_current_velocity": self._statistics(
                current_velocity
            ),
        }

    @staticmethod
    def _parse_date(
        value: Optional[str],
    ) -> Optional[date]:
        """
        Parse YYYY-MM-DD into a date.

        Invalid values return None so callers can decide how
        to handle missing temporal constraints.
        """

        if not value:
            return None

        try:
            return datetime.strptime(
                value,
                "%Y-%m-%d",
            ).date()

        except (TypeError, ValueError):
            raise ValueError(
                f"Invalid date '{value}'. "
                "Expected YYYY-MM-DD."
            )

    @staticmethod
    def _extract_date(
        timestamp: Any,
    ) -> Optional[date]:
        """
        Extract the calendar date from an Open-Meteo timestamp.

        Handles values such as:

            2026-09-25T00:00
            2026-09-25T12:00
        """

        if not isinstance(timestamp, str):
            return None

        try:
            return datetime.fromisoformat(
                timestamp
            ).date()

        except ValueError:
            return None

    @staticmethod
    def _add_temporal_metadata(
        normalized_data: Dict[str, Any],
        start_date: Optional[str],
        end_date: Optional[str],
        matched_points: int,
    ) -> Dict[str, Any]:
        """
        Add explicit temporal metadata so downstream agents know
        exactly which window was analyzed.
        """

        result = dict(normalized_data)

        result["temporal_window"] = {
            "start_date": start_date,
            "end_date": end_date,
            "matched_hourly_points": matched_points,
            "filtered": bool(
                start_date or end_date
            ),
        }

        return result

    @staticmethod
    def _numeric_values(
        values: Any,
    ) -> list[float]:
        """
        Keep only numeric values.

        None / missing / non-numeric values are ignored.
        """

        if not isinstance(values, list):
            return []

        result = []

        for value in values:
            if isinstance(value, (int, float)):
                result.append(float(value))

        return result

    @staticmethod
    def _statistics(
        values: list[float],
    ) -> Dict[str, Any]:
        """
        Calculate basic statistics without inventing data.
        """

        if not values:
            return {
                "available": False,
                "count": 0,
                "min": None,
                "max": None,
                "average": None,
            }

        return {
            "available": True,
            "count": len(values),
            "min": min(values),
            "max": max(values),
            "average": sum(values) / len(values),
        }