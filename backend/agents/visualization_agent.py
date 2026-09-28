from typing import Any, Dict, List, Optional
from datetime import datetime, timezone


class VisualizationAgent:
    """
    Aqua Intellect - Visualization Agent

    Responsibilities:
    - Convert agent outputs into visualization instructions
    - Decide whether a map, chart, metric card,
      route layer, alert panel or evidence panel
      is useful
    - Prepare frontend-friendly visualization data
    - Preserve source and uncertainty information
    - Never fabricate coordinates or measurements
    """

    name = "visualization"
    display_name = "Visualization Agent"

    def __init__(self):
        self.last_result: Optional[Dict[str, Any]] = None

    async def run(
        self,
        query: str,
        marine_result: Optional[Dict[str, Any]] = None,
        weather_result: Optional[Dict[str, Any]] = None,
        ocean_result: Optional[Dict[str, Any]] = None,
        geospatial_result: Optional[Dict[str, Any]] = None,
        safety_result: Optional[Dict[str, Any]] = None,
        route_result: Optional[Dict[str, Any]] = None,
        alert_result: Optional[Dict[str, Any]] = None,
        evidence_result: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:

        marine_result = marine_result or {}
        weather_result = weather_result or {}
        ocean_result = ocean_result or {}
        geospatial_result = geospatial_result or {}
        safety_result = safety_result or {}
        route_result = route_result or {}
        alert_result = alert_result or {}
        evidence_result = evidence_result or {}

        visualizations = (
            self.build_visualizations(
                query=query,
                marine_result=marine_result,
                weather_result=weather_result,
                ocean_result=ocean_result,
                geospatial_result=geospatial_result,
                safety_result=safety_result,
                route_result=route_result,
                alert_result=alert_result,
                evidence_result=evidence_result,
            )
        )

        map_layers = (
            self.build_map_layers(
                marine_result=marine_result,
                geospatial_result=geospatial_result,
                route_result=route_result,
                alert_result=alert_result,
            )
        )

        metrics = (
            self.build_metrics(
                marine_result=marine_result,
                weather_result=weather_result,
                ocean_result=ocean_result,
                safety_result=safety_result,
                route_result=route_result,
                alert_result=alert_result,
            )
        )

        charts = (
            self.build_charts(
                marine_result=marine_result,
                weather_result=weather_result,
                ocean_result=ocean_result,
            )
        )

        evidence_panel = (
            self.build_evidence_panel(
                evidence_result=evidence_result
            )
        )

        confidence = (
            self.calculate_confidence(
                marine_result=marine_result,
                weather_result=weather_result,
                ocean_result=ocean_result,
                safety_result=safety_result,
                evidence_result=evidence_result,
            )
        )

        result = {
            "agent": self.name,
            "status": "success",
            "query": query,
            "visualizations": visualizations,
            "map_layers": map_layers,
            "metrics": metrics,
            "charts": charts,
            "evidence_panel": evidence_panel,
            "confidence": confidence,
            "generated_at": datetime.now(
                timezone.utc
            ).isoformat(),
            "message": (
                "Visualization instructions "
                "prepared successfully."
            ),
        }

        self.last_result = result

        return result

    # ---------------------------------------------------------
    # VISUALIZATION TYPES
    # ---------------------------------------------------------

    def build_visualizations(
        self,
        query: str,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        ocean_result: Dict[str, Any],
        geospatial_result: Dict[str, Any],
        safety_result: Dict[str, Any],
        route_result: Dict[str, Any],
        alert_result: Dict[str, Any],
        evidence_result: Dict[str, Any],
    ) -> List[Dict[str, Any]]:

        visualizations = []

        if marine_result.get(
            "status"
        ) == "success":

            visualizations.append(
                {
                    "type": "marine_map",
                    "priority": "high",
                    "title": "Marine Conditions",
                    "description": (
                        "Map view for marine "
                        "conditions and location."
                    ),
                }
            )

        if weather_result.get(
            "status"
        ) == "success":

            visualizations.append(
                {
                    "type": "weather_panel",
                    "priority": "high",
                    "title": "Weather Conditions",
                    "description": (
                        "Weather and forecast "
                        "condition summary."
                    ),
                }
            )

        if ocean_result.get(
            "status"
        ) == "success":

            visualizations.append(
                {
                    "type": "ocean_metrics",
                    "priority": "high",
                    "title": "Ocean Analytics",
                    "description": (
                        "SST, wave and current "
                        "analytics."
                    ),
                }
            )

        if geospatial_result.get(
            "status"
        ) == "success":

            visualizations.append(
                {
                    "type": "spatial_map",
                    "priority": "medium",
                    "title": "Spatial Analysis",
                    "description": (
                        "Coordinates, distances "
                        "and geographic zones."
                    ),
                }
            )

        if safety_result.get(
            "status"
        ) == "success":

            visualizations.append(
                {
                    "type": "risk_card",
                    "priority": "high",
                    "title": "Marine Risk",
                    "description": (
                        "Current analytical "
                        "risk assessment."
                    ),
                }
            )

        if route_result.get(
            "status"
        ) == "success":

            visualizations.append(
                {
                    "type": "route_map",
                    "priority": "high",
                    "title": "Vessel Route",
                    "description": (
                        "Geometric route and "
                        "travel estimate."
                    ),
                }
            )

        if alert_result.get(
            "status"
        ) == "success":

            visualizations.append(
                {
                    "type": "alert_panel",
                    "priority": "high",
                    "title": "Marine Alerts",
                    "description": (
                        "Detected weather and "
                        "marine risk signals."
                    ),
                }
            )

        if evidence_result.get(
            "status"
        ) == "success":

            visualizations.append(
                {
                    "type": "evidence_panel",
                    "priority": "medium",
                    "title": "Evidence & Sources",
                    "description": (
                        "Sources, confidence and "
                        "limitations."
                    ),
                }
            )

        return visualizations

    # ---------------------------------------------------------
    # MAP LAYERS
    # ---------------------------------------------------------

    def build_map_layers(
        self,
        marine_result: Dict[str, Any],
        geospatial_result: Dict[str, Any],
        route_result: Dict[str, Any],
        alert_result: Dict[str, Any],
    ) -> List[Dict[str, Any]]:

        layers = []

        marine_location = (
            marine_result.get(
                "location"
            )
        )

        if isinstance(
            marine_location,
            dict,
        ):

            latitude = marine_location.get(
                "latitude"
            )

            longitude = marine_location.get(
                "longitude"
            )

            if (
                latitude is not None
                and longitude is not None
            ):

                layers.append(
                    {
                        "id": "marine-location",
                        "type": "point",
                        "title": (
                            "Marine Analysis Location"
                        ),
                        "data": {
                            "latitude": latitude,
                            "longitude": longitude,
                        },
                    }
                )

        spatial = (
            geospatial_result.get(
                "spatial_analysis",
                {}
            )
        )

        if not isinstance(
            spatial,
            dict,
        ):
            spatial = {}

        nearest = spatial.get(
            "nearest",
            {}
        )

        if not isinstance(
            nearest,
            dict,
        ):
            nearest = {}

        if nearest.get(
            "available"
        ):

            layers.append(
                {
                    "id": "nearest-location",
                    "type": "point",
                    "title": "Nearest Location",
                    "data": {
                        "latitude": nearest.get(
                            "latitude"
                        ),
                        "longitude": nearest.get(
                            "longitude"
                        ),
                        "distance_km": nearest.get(
                            "distance_km"
                        ),
                    },
                }
            )

        route = route_result.get(
            "route",
            {}
        )

        if not isinstance(
            route,
            dict,
        ):
            route = {}

        if route:

            start = route.get(
                "start"
            )

            destination = route.get(
                "destination"
            )

            if (
                isinstance(start, dict)
                and isinstance(destination, dict)
            ):

                layers.append(
                    {
                        "id": "planned-route",
                        "type": "line",
                        "title": "Planned Route",
                        "data": {
                            "coordinates": [
                                [
                                    start.get(
                                        "longitude"
                                    ),
                                    start.get(
                                        "latitude"
                                    ),
                                ],
                                [
                                    destination.get(
                                        "longitude"
                                    ),
                                    destination.get(
                                        "latitude"
                                    ),
                                ],
                            ],
                            "distance_km": route.get(
                                "distance_km"
                            ),
                        },
                    }
                )

        alerts = alert_result.get(
            "alerts",
            []
        )

        if isinstance(alerts, list) and alerts:

            layers.append(
                {
                    "id": "alert-indicators",
                    "type": "alert",
                    "title": "Alert Indicators",
                    "data": alerts,
                }
            )

        return layers

    # ---------------------------------------------------------
    # METRICS
    # ---------------------------------------------------------

    def build_metrics(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        ocean_result: Dict[str, Any],
        safety_result: Dict[str, Any],
        route_result: Dict[str, Any],
        alert_result: Dict[str, Any],
    ) -> List[Dict[str, Any]]:

        metrics = []

        marine_summary = marine_result.get(
            "summary",
            {}
        )

        if not isinstance(
            marine_summary,
            dict,
        ):
            marine_summary = {}

        sst = marine_summary.get(
            "sea_surface_temperature",
            {}
        )

        if isinstance(sst, dict) and sst.get(
            "average"
        ) is not None:

            metrics.append(
                {
                    "id": "sst",
                    "label": "SST",
                    "value": sst.get(
                        "average"
                    ),
                    "unit": "°C",
                }
            )

        wave = marine_summary.get(
            "wave_height",
            {}
        )

        if isinstance(wave, dict) and wave.get(
            "average"
        ) is not None:

            metrics.append(
                {
                    "id": "wave-height",
                    "label": "Wave Height",
                    "value": wave.get(
                        "average"
                    ),
                    "unit": "m",
                }
            )

        current = marine_summary.get(
            "ocean_current_velocity",
            {}
        )

        if isinstance(current, dict) and current.get(
            "average"
        ) is not None:

            metrics.append(
                {
                    "id": "current",
                    "label": "Ocean Current",
                    "value": current.get(
                        "average"
                    ),
                    "unit": "m/s",
                }
            )

        weather_assessment = (
            weather_result.get(
                "assessment",
                {}
            )
        )

        if not isinstance(
            weather_assessment,
            dict,
        ):
            weather_assessment = {}

        weather_status = weather_assessment.get(
            "operational_status"
        )

        if weather_status is None:
            weather_status = weather_assessment.get(
                "status"
            )

        if weather_status:

            metrics.append(
                {
                    "id": "weather-status",
                    "label": "Weather",
                    "value": weather_status,
                    "unit": "",
                }
            )

        safety_risk = safety_result.get(
            "risk",
            {}
        )

        if not isinstance(
            safety_risk,
            dict,
        ):
            safety_risk = {}

        if safety_risk.get(
            "level"
        ):

            metrics.append(
                {
                    "id": "risk-level",
                    "label": "Risk",
                    "value": safety_risk.get(
                        "level"
                    ),
                    "unit": "",
                }
            )

        route = route_result.get(
            "route",
            {}
        )

        if not isinstance(
            route,
            dict,
        ):
            route = {}

        if route.get(
            "distance_km"
        ) is not None:

            metrics.append(
                {
                    "id": "route-distance",
                    "label": "Route Distance",
                    "value": route.get(
                        "distance_km"
                    ),
                    "unit": "km",
                }
            )

        if route.get(
            "estimated_travel_hours"
        ) is not None:

            metrics.append(
                {
                    "id": "travel-time",
                    "label": "Estimated Travel Time",
                    "value": route.get(
                        "estimated_travel_hours"
                    ),
                    "unit": "hours",
                }
            )

        if alert_result.get(
            "alert_count"
        ) is not None:

            metrics.append(
                {
                    "id": "alert-count",
                    "label": "Alerts",
                    "value": alert_result.get(
                        "alert_count"
                    ),
                    "unit": "",
                }
            )

        return metrics

    # ---------------------------------------------------------
    # CHARTS
    # ---------------------------------------------------------

    def build_charts(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        ocean_result: Dict[str, Any],
    ) -> List[Dict[str, Any]]:

        charts = []

        marine_data = marine_result.get(
            "data",
            {}
        )

        if not isinstance(
            marine_data,
            dict,
        ):
            marine_data = {}

        hourly = marine_data.get(
            "hourly",
            {}
        )

        if not isinstance(
            hourly,
            dict,
        ):
            hourly = {}

        time_values = hourly.get(
            "time",
            []
        )

        sst_values = hourly.get(
            "sea_surface_temperature",
            []
        )

        if time_values and sst_values:

            charts.append(
                {
                    "id": "sst-time-series",
                    "type": "line",
                    "title": (
                        "Sea Surface Temperature"
                    ),
                    "x_axis": "time",
                    "y_axis": "temperature_celsius",
                    "data": self.build_series(
                        time_values,
                        sst_values,
                    ),
                }
            )

        wave_values = hourly.get(
            "wave_height",
            []
        )

        if time_values and wave_values:

            charts.append(
                {
                    "id": "wave-time-series",
                    "type": "line",
                    "title": "Wave Height",
                    "x_axis": "time",
                    "y_axis": "wave_height_m",
                    "data": self.build_series(
                        time_values,
                        wave_values,
                    ),
                }
            )

        weather_data = weather_result.get(
            "data",
            {}
        )

        if not isinstance(
            weather_data,
            dict,
        ):
            weather_data = {}

        weather_hourly = weather_data.get(
            "hourly",
            {}
        )

        if not isinstance(
            weather_hourly,
            dict,
        ):
            weather_hourly = {}

        weather_times = weather_hourly.get(
            "time",
            []
        )

        wind_values = weather_hourly.get(
            "wind_speed_10m",
            []
        )

        if weather_times and wind_values:

            charts.append(
                {
                    "id": "wind-time-series",
                    "type": "line",
                    "title": "Wind Speed",
                    "x_axis": "time",
                    "y_axis": "wind_speed_kmh",
                    "data": self.build_series(
                        weather_times,
                        wind_values,
                    ),
                }
            )

        return charts

    # ---------------------------------------------------------
    # EVIDENCE PANEL
    # ---------------------------------------------------------

    def build_evidence_panel(
        self,
        evidence_result: Dict[str, Any],
    ) -> Dict[str, Any]:

        if not evidence_result:

            return {
                "available": False,
                "status": "not_available",
                "sources": [],
                "limitations": [],
            }

        raw_sources = evidence_result.get(
            "sources",
            [],
        )

        sources = self.deduplicate_sources(
            raw_sources
        )

        return {
            "available": True,
            "status": evidence_result.get(
                "evidence_status",
                "unknown",
            ),
            "confidence": evidence_result.get(
                "confidence"
            ),
            "sources": sources,
            "limitations": evidence_result.get(
                "limitations",
                [],
            ),
            "unsupported_claims": (
                evidence_result.get(
                    "unsupported_claims",
                    [],
                )
            ),
        }

    # ---------------------------------------------------------
    # SOURCE DEDUPLICATION
    # ---------------------------------------------------------

    @staticmethod
    def deduplicate_sources(
        sources: Any,
    ) -> List[Dict[str, Any]]:

        if not isinstance(
            sources,
            list,
        ):
            return []

        unique_sources: List[Dict[str, Any]] = []
        seen = set()

        for source in sources:

            if not isinstance(
                source,
                dict,
            ):
                continue

            name = str(
                source.get(
                    "name",
                    "",
                )
            ).strip()

            source_type = str(
                source.get(
                    "type",
                    "",
                )
            ).strip()

            url = str(
                source.get(
                    "url",
                    "",
                )
            ).strip()

            key = (
                name.lower(),
                source_type.lower(),
                url.lower(),
            )

            if key in seen:
                continue

            seen.add(key)
            unique_sources.append(source)

        return unique_sources

    # ---------------------------------------------------------
    # CONFIDENCE
    # ---------------------------------------------------------

    def calculate_confidence(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        ocean_result: Dict[str, Any],
        safety_result: Dict[str, Any],
        evidence_result: Dict[str, Any],
    ) -> float:

        confidences = []

        for result in [
            marine_result,
            weather_result,
            ocean_result,
            safety_result,
            evidence_result,
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
            return 0.30

        return round(
            sum(confidences)
            / len(confidences),
            3,
        )

    # ---------------------------------------------------------
    # TIME SERIES
    # ---------------------------------------------------------

    @staticmethod
    def build_series(
        times: List[Any],
        values: List[Any],
    ) -> List[Dict[str, Any]]:

        series = []

        length = min(
            len(times),
            len(values),
        )

        for index in range(
            length
        ):

            value = values[index]

            if value is None:
                continue

            series.append(
                {
                    "time": times[index],
                    "value": value,
                }
            )

        return series

    # ---------------------------------------------------------
    # STATUS
    # ---------------------------------------------------------

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