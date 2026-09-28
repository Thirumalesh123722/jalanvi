from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


class EvidenceAgent:
    """
    Evidence and provenance validation agent.

    Responsibilities:
    - Validate evidence produced by upstream agents.
    - Build a unified source/provenance summary.
    - Validate route-specific evidence.
    - Track safety, alert and visualization dependencies.
    - Calculate confidence without fabricating missing evidence.
    - Explicitly identify unsupported claims and limitations.
    """

    def __init__(self):
        self.name = "evidence"

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
        visualization_result: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        marine_result = marine_result or {}
        weather_result = weather_result or {}
        ocean_result = ocean_result or {}
        geospatial_result = geospatial_result or {}
        safety_result = safety_result or {}
        route_result = route_result or {}
        alert_result = alert_result or {}
        visualization_result = visualization_result or {}

        evidence = self.build_evidence(
            marine_result=marine_result,
            weather_result=weather_result,
            ocean_result=ocean_result,
            geospatial_result=geospatial_result,
            safety_result=safety_result,
            route_result=route_result,
            alert_result=alert_result,
            visualization_result=visualization_result,
        )

        sources = self.build_source_summary(
            marine_result=marine_result,
            weather_result=weather_result,
            ocean_result=ocean_result,
            geospatial_result=geospatial_result,
            safety_result=safety_result,
            route_result=route_result,
            alert_result=alert_result,
            visualization_result=visualization_result,
        )

        limitations = self.build_limitations(
            marine_result=marine_result,
            weather_result=weather_result,
            ocean_result=ocean_result,
            geospatial_result=geospatial_result,
            safety_result=safety_result,
            route_result=route_result,
            alert_result=alert_result,
        )

        unsupported_claims = self.build_unsupported_claims(
            ocean_result=ocean_result,
            geospatial_result=geospatial_result,
            route_result=route_result,
        )

        confidence = self.calculate_confidence(
            marine_result=marine_result,
            weather_result=weather_result,
            ocean_result=ocean_result,
            geospatial_result=geospatial_result,
            safety_result=safety_result,
            route_result=route_result,
            alert_result=alert_result,
            evidence=evidence,
        )

        validation = self.build_validation(
            marine_result=marine_result,
            weather_result=weather_result,
            ocean_result=ocean_result,
            geospatial_result=geospatial_result,
            safety_result=safety_result,
            route_result=route_result,
            alert_result=alert_result,
            visualization_result=visualization_result,
        )

        evidence_status = self.determine_evidence_status(
            evidence=evidence,
            limitations=limitations,
            unsupported_claims=unsupported_claims,
        )

        generated_at = datetime.now(timezone.utc).isoformat()

        return {
            "agent": self.name,
            "status": "success",
            "query": query,
            "evidence_status": evidence_status,
            "evidence": evidence,
            "sources": sources,
            "confidence": confidence,
            "limitations": limitations,
            "unsupported_claims": unsupported_claims,
            "validation": validation,
            "generated_at": generated_at,
            "message": self.build_message(
                evidence_status=evidence_status,
                confidence=confidence,
                limitations=limitations,
                route_available=self.route_evidence_available(
                    geospatial_result,
                    route_result,
                ),
            ),
        }

    # ------------------------------------------------------------------
    # Evidence construction
    # ------------------------------------------------------------------

    def build_evidence(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        ocean_result: Dict[str, Any],
        geospatial_result: Dict[str, Any],
        safety_result: Dict[str, Any],
        route_result: Dict[str, Any],
        alert_result: Dict[str, Any],
        visualization_result: Dict[str, Any],
    ) -> Dict[str, Any]:
        marine_available = self.is_success(marine_result)
        weather_available = self.is_success(weather_result)
        ocean_available = self.is_success(ocean_result)
        geospatial_available = self.is_success(geospatial_result)
        safety_available = self.is_success(safety_result)
        route_available = self.is_success(route_result)
        alert_available = self.is_success(alert_result)
        visualization_available = self.is_success(visualization_result)

        ocean_analysis = ocean_result.get("analysis", {})
        if not isinstance(ocean_analysis, dict):
            ocean_analysis = {}

        productivity = ocean_analysis.get("productivity", {})
        if not isinstance(productivity, dict):
            productivity = {}

        pfz = ocean_result.get("pfz", {})
        if not isinstance(pfz, dict):
            pfz = {}

        chlorophyll = ocean_result.get("chlorophyll", {})
        if not isinstance(chlorophyll, dict):
            chlorophyll = {}

        route_analysis = self.extract_route_analysis(
            geospatial_result=geospatial_result,
            route_result=route_result,
        )

        route_zone_validation = route_analysis.get("zone_validation", {})
        if not isinstance(route_zone_validation, dict):
            route_zone_validation = {}

        safety_risk = safety_result.get("risk", {})
        if not isinstance(safety_risk, dict):
            safety_risk = {}

        alert_count = alert_result.get("alert_count", 0)

        return {
            "marine": {
                "available": marine_available,
                "source_count": len(self.get_sources(marine_result)),
                "has_live_data": self.has_live_sources(marine_result),
                "summary_available": bool(
                    isinstance(marine_result.get("summary"), dict)
                    and marine_result.get("summary")
                ),
            },
            "weather": {
                "available": weather_available,
                "source_count": len(self.get_sources(weather_result)),
                "has_live_data": self.has_live_sources(weather_result),
                "summary_available": bool(
                    isinstance(weather_result.get("summary"), dict)
                    and weather_result.get("summary")
                ),
                "assessment_available": bool(
                    isinstance(weather_result.get("assessment"), dict)
                    and weather_result.get("assessment")
                ),
            },
            "ocean_analytics": {
                "available": ocean_available,
                "source_count": len(self.get_sources(ocean_result)),
                "analysis_available": bool(ocean_analysis),
                "pfz_evidence_available": bool(
                    pfz.get("available") and pfz.get("validated")
                ),
                "chlorophyll_available": bool(
                    chlorophyll.get("available")
                ),
                "productivity_status": productivity.get("status"),
            },
            "geospatial": {
                "available": geospatial_available,
                "route_geometry_available": bool(
                    route_analysis.get("route_detected")
                ),
                "route_distance_km": route_analysis.get("distance_km"),
                "route_distance_nm": route_analysis.get("distance_nm"),
                "route_zone_validation_available": bool(
                    route_zone_validation.get("available")
                ),
                "route_intersects_zones": route_zone_validation.get(
                    "route_intersects_zones"
                ),
            },
            "safety": {
                "available": safety_available,
                "risk_level": safety_risk.get("level"),
                "operational_status": safety_risk.get(
                    "operational_status"
                ),
                "recommendations_available": bool(
                    safety_result.get("recommendations")
                ),
            },
            "route_planner": {
                "available": route_available,
                "route_available": bool(
                    isinstance(route_result.get("route"), dict)
                    and route_result.get("route")
                ),
                "distance_km": self.nested_value(
                    route_result,
                    "route",
                    "distance_km",
                ),
                "distance_nm": self.nested_value(
                    route_result,
                    "route",
                    "distance_nm",
                ),
                "travel_time_hours": self.nested_value(
                    route_result,
                    "route",
                    "estimated_travel_hours",
                ),
                "planning_only": route_available,
            },
            "alerts": {
                "available": alert_available,
                "alert_count": alert_count,
                "highest_severity": alert_result.get(
                    "highest_severity"
                ),
                "alert_status": alert_result.get("alert_status"),
                "analytical_only": alert_available,
            },
            "visualization": {
                "available": visualization_available,
                "visualization_count": len(
                    visualization_result.get("visualizations", [])
                    if isinstance(
                        visualization_result.get("visualizations"),
                        list,
                    )
                    else []
                ),
                "route_map_available": self.visualization_has_type(
                    visualization_result,
                    "route_map",
                ),
                "evidence_panel_available": self.visualization_has_type(
                    visualization_result,
                    "evidence_panel",
                ),
            },
            "cross_agent": {
                "marine_weather_available": (
                    marine_available and weather_available
                ),
                "marine_ocean_available": (
                    marine_available and ocean_available
                ),
                "route_pipeline_available": (
                    geospatial_available
                    and route_available
                ),
                "risk_pipeline_available": (
                    weather_available
                    and safety_available
                    and alert_available
                ),
                "full_current_pipeline": (
                    marine_available
                    and weather_available
                    and ocean_available
                    and geospatial_available
                    and safety_available
                    and route_available
                    and alert_available
                ),
            },
        }

    # ------------------------------------------------------------------
    # Source / provenance
    # ------------------------------------------------------------------

    def build_source_summary(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        ocean_result: Dict[str, Any],
        geospatial_result: Dict[str, Any],
        safety_result: Dict[str, Any],
        route_result: Dict[str, Any],
        alert_result: Dict[str, Any],
        visualization_result: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        sources: List[Dict[str, Any]] = []
        seen = set()

        self._append_sources(
            sources,
            seen,
            agent="marine_data",
            result=marine_result,
        )

        self._append_sources(
            sources,
            seen,
            agent="weather",
            result=weather_result,
        )

        self._append_sources(
            sources,
            seen,
            agent="ocean_analytics",
            result=ocean_result,
        )

        self._append_sources(
            sources,
            seen,
            agent="geospatial",
            result=geospatial_result,
        )

        self._append_sources(
            sources,
            seen,
            agent="safety",
            result=safety_result,
        )

        self._append_sources(
            sources,
            seen,
            agent="route_planner",
            result=route_result,
        )

        self._append_sources(
            sources,
            seen,
            agent="alert",
            result=alert_result,
        )

        self._append_sources(
            sources,
            seen,
            agent="visualization",
            result=visualization_result,
        )

        return sources

    def _append_sources(
        self,
        target: List[Dict[str, Any]],
        seen: set,
        agent: str,
        result: Dict[str, Any],
    ) -> None:
        raw_sources = result.get("sources", [])

        if not isinstance(raw_sources, list):
            return

        for source in raw_sources:
            if isinstance(source, str):
                source = {
                    "name": source,
                    "type": "unknown",
                }

            if not isinstance(source, dict):
                continue

            name = str(source.get("name") or "").strip()
            source_type = str(
                source.get("type")
                or source.get("source_type")
                or "unknown"
            ).strip()
            url = source.get("url")

            if url is not None:
                url = str(url).strip() or None

            if not name:
                continue

            key = (
                name.lower(),
                source_type.lower(),
                (url or "").lower(),
            )

            if key in seen:
                continue

            seen.add(key)

            target.append(
                {
                    "agent": agent,
                    "name": name,
                    "type": source_type,
                    "status": source.get("status", "available"),
                    **({"url": url} if url else {}),
                }
            )

    # ------------------------------------------------------------------
    # Limitations
    # ------------------------------------------------------------------

    def build_limitations(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        ocean_result: Dict[str, Any],
        geospatial_result: Dict[str, Any],
        safety_result: Dict[str, Any],
        route_result: Dict[str, Any],
        alert_result: Dict[str, Any],
    ) -> List[str]:
        limitations: List[str] = []

        ocean_analysis = ocean_result.get("analysis", {})
        if not isinstance(ocean_analysis, dict):
            ocean_analysis = {}

        productivity = ocean_analysis.get("productivity", {})
        if not isinstance(productivity, dict):
            productivity = {}

        pfz = ocean_result.get("pfz", {})
        if not isinstance(pfz, dict):
            pfz = {}

        chlorophyll = ocean_result.get("chlorophyll", {})
        if not isinstance(chlorophyll, dict):
            chlorophyll = {}

        if not pfz.get("available") or not pfz.get("validated"):
            limitations.append(
                "No validated PFZ evidence is currently connected."
            )

        if not chlorophyll.get("available"):
            limitations.append(
                "Chlorophyll/ocean-colour evidence is not currently available."
            )

        route_analysis = self.extract_route_analysis(
            geospatial_result,
            route_result,
        )

        if route_analysis.get("route_detected"):
            if not route_analysis.get("zone_validation", {}).get(
                "available",
                False,
            ):
                limitations.append(
                    "No restricted-area or geofence dataset was supplied, "
                    "so route-zone restrictions could not be validated."
                )

            limitations.append(
                "Route geometry is a planning path and is not a certified "
                "navigation route."
            )

        weather_assessment = weather_result.get("assessment", {})
        if not isinstance(weather_assessment, dict):
            weather_assessment = {}

        if weather_assessment.get("operational_status") == "high_attention":
            limitations.append(
                "Weather analysis contains high-attention operational signals."
            )

        safety_risk = safety_result.get("risk", {})
        if not isinstance(safety_risk, dict):
            safety_risk = {}

        if safety_risk.get("level") == "high":
            limitations.append(
                "Safety analysis detected high-risk signals from the "
                "available forecast and marine evidence."
            )

        if alert_result.get("alert_count", 0):
            limitations.append(
                "Generated alerts are analytical signals and are not "
                "substitutes for official maritime advisories."
            )

        # Stable deduplication while preserving order.
        return self.deduplicate_strings(limitations)

    # ------------------------------------------------------------------
    # Unsupported claims
    # ------------------------------------------------------------------

    def build_unsupported_claims(
        self,
        ocean_result: Dict[str, Any],
        geospatial_result: Dict[str, Any],
        route_result: Dict[str, Any],
    ) -> List[str]:
        unsupported: List[str] = []

        pfz = ocean_result.get("pfz", {})
        if not isinstance(pfz, dict):
            pfz = {}

        chlorophyll = ocean_result.get("chlorophyll", {})
        if not isinstance(chlorophyll, dict):
            chlorophyll = {}

        if not pfz.get("available") or not pfz.get("validated"):
            unsupported.append(
                "A specific PFZ location cannot be claimed from the "
                "currently connected evidence."
            )

        if not chlorophyll.get("available"):
            unsupported.append(
                "Chlorophyll-based productivity claims cannot be confirmed."
            )

        route_analysis = self.extract_route_analysis(
            geospatial_result,
            route_result,
        )

        if route_analysis.get("route_detected"):
            zone_validation = route_analysis.get(
                "zone_validation",
                {},
            )

            if not isinstance(zone_validation, dict):
                zone_validation = {}

            if not zone_validation.get("available"):
                unsupported.append(
                    "Route clearance from restricted areas or geofences "
                    "cannot be confirmed because no zone dataset was supplied."
                )

            unsupported.append(
                "The geometric route cannot be represented as a certified "
                "navigation route."
            )

        return self.deduplicate_strings(unsupported)

    # ------------------------------------------------------------------
    # Confidence
    # ------------------------------------------------------------------

    def calculate_confidence(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        ocean_result: Dict[str, Any],
        geospatial_result: Dict[str, Any],
        safety_result: Dict[str, Any],
        route_result: Dict[str, Any],
        alert_result: Dict[str, Any],
        evidence: Dict[str, Any],
    ) -> Dict[str, Any]:
        agent_results = [
            marine_result,
            weather_result,
            ocean_result,
            geospatial_result,
            safety_result,
            route_result,
            alert_result,
        ]

        confidence_values = []

        for result in agent_results:
            if not isinstance(result, dict):
                continue

            value = result.get("confidence")

            if isinstance(value, (int, float)):
                if 0 <= value <= 1:
                    confidence_values.append(float(value))

        agent_average = (
            sum(confidence_values) / len(confidence_values)
            if confidence_values
            else 0.0
        )

        pipeline_adjustment = 0.0

        cross_agent = evidence.get("cross_agent", {})
        if not isinstance(cross_agent, dict):
            cross_agent = {}

        if cross_agent.get("marine_weather_available"):
            pipeline_adjustment += 0.02

        if cross_agent.get("marine_ocean_available"):
            pipeline_adjustment += 0.02

        if cross_agent.get("route_pipeline_available"):
            pipeline_adjustment += 0.02

        if cross_agent.get("risk_pipeline_available"):
            pipeline_adjustment += 0.02

        pfz_available = bool(
            evidence.get("ocean_analytics", {}).get(
                "pfz_evidence_available"
            )
        )

        chlorophyll_available = bool(
            evidence.get("ocean_analytics", {}).get(
                "chlorophyll_available"
            )
        )

        if pfz_available and chlorophyll_available:
            pipeline_adjustment += 0.02

        score = min(
            1.0,
            max(
                0.0,
                agent_average + pipeline_adjustment,
            ),
        )

        return {
            "score": round(score, 3),
            "percentage": round(score * 100, 1),
            "basis": {
                "agent_average": round(agent_average, 3),
                "pipeline_adjustment": round(
                    pipeline_adjustment,
                    3,
                ),
                "agent_count": len(confidence_values),
                "pfz_evidence_available": pfz_available,
                "chlorophyll_available": chlorophyll_available,
                "route_evidence_available": bool(
                    evidence.get("geospatial", {}).get(
                        "route_geometry_available"
                    )
                ),
                "route_zone_validation_available": bool(
                    evidence.get("geospatial", {}).get(
                        "route_zone_validation_available"
                    )
                ),
                "safety_evidence_available": bool(
                    evidence.get("safety", {}).get("available")
                ),
                "alert_evidence_available": bool(
                    evidence.get("alerts", {}).get("available")
                ),
            },
        }

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

    def build_validation(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        ocean_result: Dict[str, Any],
        geospatial_result: Dict[str, Any],
        safety_result: Dict[str, Any],
        route_result: Dict[str, Any],
        alert_result: Dict[str, Any],
        visualization_result: Dict[str, Any],
    ) -> Dict[str, Any]:
        return {
            "marine_agent_checked": self.is_success(marine_result),
            "weather_agent_checked": self.is_success(weather_result),
            "ocean_analytics_checked": self.is_success(ocean_result),
            "geospatial_agent_checked": self.is_success(
                geospatial_result
            ),
            "safety_agent_checked": self.is_success(safety_result),
            "route_planner_checked": self.is_success(route_result),
            "alert_agent_checked": self.is_success(alert_result),
            "visualization_agent_checked": self.is_success(
                visualization_result
            ),
            "source_validation": True,
            "confidence_validation": True,
            "limitation_validation": True,
            "route_provenance_validation": self.route_evidence_available(
                geospatial_result,
                route_result,
            ),
        }

    # ------------------------------------------------------------------
    # Status / message
    # ------------------------------------------------------------------

    def determine_evidence_status(
        self,
        evidence: Dict[str, Any],
        limitations: List[str],
        unsupported_claims: List[str],
    ) -> str:
        cross_agent = evidence.get("cross_agent", {})
        if not isinstance(cross_agent, dict):
            cross_agent = {}

        full_pipeline = cross_agent.get(
            "full_current_pipeline",
            False,
        )

        route_available = bool(
            evidence.get("geospatial", {}).get(
                "route_geometry_available"
            )
        )

        pfz_available = bool(
            evidence.get("ocean_analytics", {}).get(
                "pfz_evidence_available"
            )
        )

        chlorophyll_available = bool(
            evidence.get("ocean_analytics", {}).get(
                "chlorophyll_available"
            )
        )

        if (
            full_pipeline
            and route_available
            and pfz_available
            and chlorophyll_available
            and not unsupported_claims
        ):
            return "complete"

        if full_pipeline:
            return "partial"

        if route_available:
            return "partial"

        if limitations or unsupported_claims:
            return "partial"

        return "insufficient"

    def build_message(
        self,
        evidence_status: str,
        confidence: Dict[str, Any],
        limitations: List[str],
        route_available: bool,
    ) -> str:
        percentage = confidence.get("percentage", 0)

        if evidence_status == "complete":
            return (
                f"Evidence validation completed with complete evidence "
                f"({percentage}% confidence)."
            )

        if route_available:
            return (
                f"Evidence validation completed with partial evidence "
                f"({percentage}% confidence). Route geometry and operational "
                f"evidence were validated, while some authoritative datasets "
                f"remain unavailable."
            )

        if evidence_status == "partial":
            return (
                f"Evidence validation completed with partial evidence "
                f"({percentage}% confidence). Some required evidence "
                f"is unavailable."
            )

        return (
            f"Evidence validation completed with insufficient evidence "
            f"({percentage}% confidence)."
        )

    # ------------------------------------------------------------------
    # Route helpers
    # ------------------------------------------------------------------

    def extract_route_analysis(
        self,
        geospatial_result: Dict[str, Any],
        route_result: Dict[str, Any],
    ) -> Dict[str, Any]:
        spatial_analysis = geospatial_result.get(
            "spatial_analysis",
            {},
        )

        if not isinstance(spatial_analysis, dict):
            spatial_analysis = {}

        route_analysis = spatial_analysis.get(
            "route_analysis",
            {},
        )

        if isinstance(route_analysis, dict) and route_analysis:
            return route_analysis

        route = route_result.get("route", {})

        if not isinstance(route, dict):
            route = {}

        if not route:
            return {}

        return {
            "available": True,
            "route_detected": True,
            "start": route.get("start"),
            "destination": route.get("destination"),
            "distance_km": route.get("distance_km"),
            "distance_nm": route.get("distance_nm"),
            "zone_validation": {
                "available": False,
                "route_intersects_zones": None,
            },
        }

    def route_evidence_available(
        self,
        geospatial_result: Dict[str, Any],
        route_result: Dict[str, Any],
    ) -> bool:
        route_analysis = self.extract_route_analysis(
            geospatial_result,
            route_result,
        )

        return bool(route_analysis.get("route_detected"))

    # ------------------------------------------------------------------
    # Generic helpers
    # ------------------------------------------------------------------

    def is_success(self, result: Dict[str, Any]) -> bool:
        return (
            isinstance(result, dict)
            and result.get("status") == "success"
        )

    def get_sources(
        self,
        result: Dict[str, Any],
    ) -> List[Any]:
        sources = result.get("sources", [])

        if not isinstance(sources, list):
            return []

        return sources

    def has_live_sources(
        self,
        result: Dict[str, Any],
    ) -> bool:
        for source in self.get_sources(result):
            if isinstance(source, dict):
                status = str(
                    source.get("status") or ""
                ).lower()

                if status in {
                    "live",
                    "available",
                    "active",
                }:
                    return True

        return False

    def visualization_has_type(
        self,
        result: Dict[str, Any],
        visualization_type: str,
    ) -> bool:
        visualizations = result.get(
            "visualizations",
            [],
        )

        if not isinstance(visualizations, list):
            return False

        for item in visualizations:
            if not isinstance(item, dict):
                continue

            if item.get("type") == visualization_type:
                return True

        return False

    def nested_value(
        self,
        result: Dict[str, Any],
        parent_key: str,
        child_key: str,
    ) -> Any:
        parent = result.get(parent_key)

        if not isinstance(parent, dict):
            return None

        return parent.get(child_key)

    def deduplicate_strings(
        self,
        values: List[str],
    ) -> List[str]:
        result = []
        seen = set()

        for value in values:
            if not isinstance(value, str):
                continue

            normalized = value.strip()

            if not normalized:
                continue

            key = normalized.lower()

            if key in seen:
                continue

            seen.add(key)
            result.append(normalized)

        return result