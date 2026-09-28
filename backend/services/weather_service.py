import httpx
from datetime import datetime, date
from typing import Any, Dict, Optional


class WeatherService:
    """
    Aqua Intellect - Live Weather Service

    Provides weather and marine-weather forecast data
    for a geographic location.

    Current source:
    Open-Meteo Weather API

    Data handled:
    - Air temperature
    - Relative humidity
    - Precipitation
    - Rain
    - Wind speed
    - Wind direction
    - Wind gusts
    - Weather code

    Temporal support:
    - Full forecast response
    - Optional date-based filtering
    - Tomorrow / explicit-date windows can be handled
      by passing start_date and end_date
    """

    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    HOURLY_FIELDS = [
        "temperature_2m",
        "relative_humidity_2m",
        "precipitation",
        "rain",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
    ]

    async def get_weather_data(
        self,
        latitude: float,
        longitude: float,
        forecast_days: int = 3,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Fetch weather forecast/model data.

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
        The Open-Meteo response is filtered locally when a
        temporal window is supplied.

        This ensures that downstream summaries and risk
        assessments are based only on the requested dates.
        """

        params = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": ",".join(
                self.HOURLY_FIELDS
            ),
            "forecast_days": forecast_days,
            "timezone": "auto",
            "wind_speed_unit": "kmh",
            "temperature_unit": "celsius",
            "precipitation_unit": "mm",
        }

        async with httpx.AsyncClient(
            timeout=20.0
        ) as client:

            response = await client.get(
                self.BASE_URL,
                params=params,
            )

            response.raise_for_status()

            raw_data = response.json()

        normalized = self.normalize(
            raw_data
        )

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
        Normalize the raw Open-Meteo response into a
        stable Aqua Intellect weather data structure.
        """

        hourly = raw_data.get(
            "hourly",
            {},
        )

        return {
            "source": "Open-Meteo Weather",

            "latitude": raw_data.get(
                "latitude"
            ),

            "longitude": raw_data.get(
                "longitude"
            ),

            "timezone": raw_data.get(
                "timezone"
            ),

            "utc_offset_seconds": raw_data.get(
                "utc_offset_seconds"
            ),

            "time": hourly.get(
                "time",
                [],
            ),

            "temperature_2m": hourly.get(
                "temperature_2m",
                [],
            ),

            "relative_humidity_2m": hourly.get(
                "relative_humidity_2m",
                [],
            ),

            "precipitation": hourly.get(
                "precipitation",
                [],
            ),

            "rain": hourly.get(
                "rain",
                [],
            ),

            "weather_code": hourly.get(
                "weather_code",
                [],
            ),

            "wind_speed_10m": hourly.get(
                "wind_speed_10m",
                [],
            ),

            "wind_direction_10m": hourly.get(
                "wind_direction_10m",
                [],
            ),

            "wind_gusts_10m": hourly.get(
                "wind_gusts_10m",
                [],
            ),
        }

    def filter_by_date_range(
        self,
        normalized_data: Dict[str, Any],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Filter hourly weather data by local calendar date.

        Example:

            start_date="2026-09-25"
            end_date="2026-09-25"

        returns only the 24 hourly records belonging to
        September 25, assuming the API provides all hours.

        This prevents a query such as:

            "Tomorrow weather?"

        from accidentally combining today and tomorrow.
        """

        times = normalized_data.get(
            "time",
            [],
        )

        if not isinstance(
            times,
            list,
        ) or not times:

            return self._add_temporal_metadata(
                normalized_data=normalized_data,
                start_date=start_date,
                end_date=end_date,
                matched_points=0,
            )

        parsed_start = self._parse_date(
            start_date
        )

        parsed_end = self._parse_date(
            end_date
        )

        if (
            parsed_start
            and parsed_end
            and parsed_end < parsed_start
        ):
            raise ValueError(
                "end_date cannot be earlier than start_date"
            )

        selected_indices = []

        for index, timestamp in enumerate(times):

            timestamp_date = self._extract_date(
                timestamp
            )

            if timestamp_date is None:
                continue

            if (
                parsed_start
                and timestamp_date < parsed_start
            ):
                continue

            if (
                parsed_end
                and timestamp_date > parsed_end
            ):
                continue

            selected_indices.append(
                index
            )

        filtered = dict(
            normalized_data
        )

        temporal_fields = [
            "time",
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "rain",
            "weather_code",
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m",
        ]

        for field in temporal_fields:

            values = normalized_data.get(
                field,
                [],
            )

            if not isinstance(
                values,
                list,
            ):
                filtered[field] = []
                continue

            filtered[field] = [
                values[index]
                for index in selected_indices
                if index < len(values)
            ]

        return self._add_temporal_metadata(
            normalized_data=filtered,
            start_date=start_date,
            end_date=end_date,
            matched_points=len(
                selected_indices
            ),
        )

    def get_summary(
        self,
        normalized_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Creates a compact summary from the currently selected
        hourly weather data.

        If the data was filtered to a temporal window first,
        the summary represents only that window.
        """

        temperature = self._numeric_values(
            normalized_data.get(
                "temperature_2m",
                [],
            )
        )

        humidity = self._numeric_values(
            normalized_data.get(
                "relative_humidity_2m",
                [],
            )
        )

        precipitation = self._numeric_values(
            normalized_data.get(
                "precipitation",
                [],
            )
        )

        rain = self._numeric_values(
            normalized_data.get(
                "rain",
                [],
            )
        )

        wind_speed = self._numeric_values(
            normalized_data.get(
                "wind_speed_10m",
                [],
            )
        )

        wind_gusts = self._numeric_values(
            normalized_data.get(
                "wind_gusts_10m",
                [],
            )
        )

        return {
            "temperature": self._statistics(
                temperature
            ),

            "humidity": self._statistics(
                humidity
            ),

            "precipitation": self._statistics(
                precipitation
            ),

            "rain": self._statistics(
                rain
            ),

            "wind_speed": self._statistics(
                wind_speed
            ),

            "wind_gusts": self._statistics(
                wind_gusts
            ),
        }

    def assess_conditions(
        self,
        normalized_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Performs a simple rule-based weather assessment.

        This does not invent weather values.

        It derives operational signals only from the values
        returned by the weather API.

        The assessment is intentionally conservative.

        If normalized_data was temporally filtered, all
        assessment values apply only to that time window.
        """

        wind_speed = self._numeric_values(
            normalized_data.get(
                "wind_speed_10m",
                [],
            )
        )

        wind_gusts = self._numeric_values(
            normalized_data.get(
                "wind_gusts_10m",
                [],
            )
        )

        precipitation = self._numeric_values(
            normalized_data.get(
                "precipitation",
                [],
            )
        )

        rain = self._numeric_values(
            normalized_data.get(
                "rain",
                [],
            )
        )

        max_wind = (
            max(wind_speed)
            if wind_speed
            else None
        )

        max_gust = (
            max(wind_gusts)
            if wind_gusts
            else None
        )

        total_precipitation = (
            sum(precipitation)
            if precipitation
            else 0.0
        )

        total_rain = (
            sum(rain)
            if rain
            else 0.0
        )

        signals = []

        if max_wind is not None:

            if max_wind >= 40:

                signals.append(
                    {
                        "type": "high_wind",
                        "severity": "high",
                        "message": (
                            "Forecast includes "
                            "high wind speeds."
                        ),
                    }
                )

            elif max_wind >= 25:

                signals.append(
                    {
                        "type": "elevated_wind",
                        "severity": "moderate",
                        "message": (
                            "Forecast includes "
                            "elevated wind speeds."
                        ),
                    }
                )

        if max_gust is not None:

            if max_gust >= 55:

                signals.append(
                    {
                        "type": "strong_gusts",
                        "severity": "high",
                        "message": (
                            "Forecast includes "
                            "strong wind gusts."
                        ),
                    }
                )

            elif max_gust >= 35:

                signals.append(
                    {
                        "type": "elevated_gusts",
                        "severity": "moderate",
                        "message": (
                            "Forecast includes "
                            "elevated wind gusts."
                        ),
                    }
                )

        if (
            total_precipitation >= 20
            or total_rain >= 20
        ):

            signals.append(
                {
                    "type": "heavy_precipitation",
                    "severity": "high",
                    "message": (
                        "Forecast indicates "
                        "substantial precipitation."
                    ),
                }
            )

        elif (
            total_precipitation > 0
            or total_rain > 0
        ):

            signals.append(
                {
                    "type": "precipitation",
                    "severity": "moderate",
                    "message": (
                        "Forecast includes "
                        "precipitation."
                    ),
                }
            )

        high_signals = [
            signal
            for signal in signals
            if signal["severity"] == "high"
        ]

        moderate_signals = [
            signal
            for signal in signals
            if signal["severity"] == "moderate"
        ]

        if high_signals:

            operational_status = "high_attention"

        elif moderate_signals:

            operational_status = "moderate_attention"

        else:

            operational_status = "no_major_signal"

        return {
            "operational_status": operational_status,

            "signals": signals,

            "max_wind_speed_kmh": max_wind,

            "max_wind_gust_kmh": max_gust,

            "total_precipitation_mm": (
                total_precipitation
            ),

            "total_rain_mm": total_rain,
        }

    @staticmethod
    def _parse_date(
        value: Optional[str],
    ) -> Optional[date]:
        """
        Parse YYYY-MM-DD into a date.

        Raises ValueError for invalid explicit dates.
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
        Extract the local calendar date from an
        Open-Meteo timestamp.

        Example:

            2026-09-25T14:00
            -> 2026-09-25
        """

        if not isinstance(
            timestamp,
            str,
        ):
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
        Attach explicit temporal metadata to the normalized
        dataset.
        """

        result = dict(
            normalized_data
        )

        result["temporal_window"] = {
            "start_date": start_date,
            "end_date": end_date,
            "matched_hourly_points": (
                matched_points
            ),
            "filtered": bool(
                start_date or end_date
            ),
        }

        return result

    @staticmethod
    def _numeric_values(
        values: Any,
    ) -> list[float]:

        if not isinstance(
            values,
            list,
        ):
            return []

        result = []

        for value in values:

            if isinstance(
                value,
                (int, float),
            ):

                result.append(
                    float(value)
                )

        return result

    @staticmethod
    def _statistics(
        values: list[float],
    ) -> Dict[str, Any]:

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
            "average": (
                sum(values) / len(values)
            ),
        }