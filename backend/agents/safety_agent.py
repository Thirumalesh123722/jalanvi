from typing import Any, Dict, Optional, List
from datetime import datetime, timezone


class SafetyAgent:
    """
    Aqua Intellect - Safety / Risk Agent

    Responsibilities:
    - Assess marine operational hazards
    - Analyze weather and sea-state risk
    - Detect high-risk conditions
    - Produce transparent risk factors
    - Preserve uncertainty
    - Never claim an area is safe when evidence is insufficient
    """

    name = "safety"
    display_name = "Safety / Risk Agent"

    def __init__(self):
        self.last_result: Optional[Dict[str, Any]] = None

    async def run(
        self,
        query: str,
        marine_result: Optional[Dict[str, Any]] = None,
        weather_result: Optional[Dict[str, Any]] = None,
        ocean_result: Optional[Dict[str, Any]] = None,
        geospatial_result: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:

        marine_result = marine_result or {}
        weather_result = weather_result or {}
        ocean_result = ocean_result or {}
        geospatial_result = geospatial_result or {}

        risk_factors = self.detect_risk_factors(
            marine_result=marine_result,
            weather_result=weather_result,
            ocean_result=ocean_result,
        )

        risk_level = self.calculate_risk_level(
            risk_factors
        )

        operational_status = self.determine_operational_status(
            risk_level=risk_level,
            risk_factors=risk_factors,
        )

        missing_evidence = self.identify_missing_evidence(
            marine_result=marine_result,
            weather_result=weather_result,
            ocean_result=ocean_result,
            geospatial_result=geospatial_result,
        )

        recommendations = self.build_recommendations(
            risk_level=risk_level,
            risk_factors=risk_factors,
            missing_evidence=missing_evidence,
        )

        confidence = self.calculate_confidence(
            marine_result=marine_result,
            weather_result=weather_result,
            ocean_result=ocean_result,
        )

        result = {
            "agent": self.name,
            "status": "success",
            "query": query,
            "risk": {
                "level": risk_level,
                "factors": risk_factors,
                "operational_status": operational_status,
            },
            "recommendations": recommendations,
            "missing_evidence": missing_evidence,
            "sources": self.collect_sources(
                marine_result=marine_result,
                weather_result=weather_result,
                ocean_result=ocean_result,
            ),
            "confidence": confidence,
            "generated_at": datetime.now(
                timezone.utc
            ).isoformat(),
            "message": self.build_message(
                risk_level=risk_level,
                operational_status=operational_status,
                risk_factors=risk_factors,
                missing_evidence=missing_evidence,
            ),
        }

        self.last_result = result

        return result

    # ---------------------------------------------------------
    # RISK DETECTION
    # ---------------------------------------------------------

    def detect_risk_factors(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        ocean_result: Dict[str, Any],
    ) -> List[Dict[str, Any]]:

        factors: List[Dict[str, Any]] = []

        # -----------------------------------------------------
        # WEATHER RISK
        # -----------------------------------------------------

        weather_assessment = weather_result.get(
            "assessment",
            {},
        )

        if not isinstance(weather_assessment, dict):
            weather_assessment = {}

        weather_status = weather_assessment.get(
            "operational_status"
        )

        if weather_status is None:
            weather_status = weather_assessment.get(
                "status"
            )

        weather_reasons = weather_assessment.get(
            "reasons",
            [],
        )

        if not isinstance(weather_reasons, list):
            weather_reasons = [str(weather_reasons)]

        if weather_status == "high_attention":

            factors.append(
                {
                    "type": "weather",
                    "severity": "high",
                    "status": "active",
                    "operational_status": "high_attention",
                    "reasons": weather_reasons,
                }
            )

        elif weather_status == "moderate_attention":

            factors.append(
                {
                    "type": "weather",
                    "severity": "moderate",
                    "status": "active",
                    "operational_status": "moderate_attention",
                    "reasons": weather_reasons,
                }
            )

        # -----------------------------------------------------
        # WIND / GUST VALIDATION
        # -----------------------------------------------------

        weather_summary = weather_result.get(
            "summary",
            {},
        )

        if not isinstance(weather_summary, dict):
            weather_summary = {}

        wind_summary = weather_summary.get(
            "wind_speed",
            {},
        )

        if not isinstance(wind_summary, dict):
            wind_summary = {}

        max_wind = wind_summary.get("max")

        if isinstance(max_wind, (int, float)):

            if max_wind >= 40:

                factors.append(
                    {
                        "type": "wind",
                        "severity": "high",
                        "status": "active",
                        "max_kmh": max_wind,
                        "threshold_kmh": 40,
                    }
                )

            elif max_wind >= 25:

                factors.append(
                    {
                        "type": "wind",
                        "severity": "moderate",
                        "status": "active",
                        "max_kmh": max_wind,
                        "threshold_kmh": 25,
                    }
                )

        gust_summary = weather_summary.get(
            "wind_gusts",
            {},
        )

        if not isinstance(gust_summary, dict):
            gust_summary = {}

        max_gust = gust_summary.get("max")

        if isinstance(max_gust, (int, float)):

            if max_gust >= 55:

                factors.append(
                    {
                        "type": "wind_gust",
                        "severity": "high",
                        "status": "active",
                        "max_kmh": max_gust,
                        "threshold_kmh": 55,
                    }
                )

            elif max_gust >= 35:

                factors.append(
                    {
                        "type": "wind_gust",
                        "severity": "moderate",
                        "status": "active",
                        "max_kmh": max_gust,
                        "threshold_kmh": 35,
                    }
                )

        # -----------------------------------------------------
        # WAVE RISK
        # -----------------------------------------------------

        marine_summary = marine_result.get(
            "summary",
            {},
        )

        if not isinstance(marine_summary, dict):
            marine_summary = {}

        wave_summary = marine_summary.get(
            "wave_height",
            {},
        )

        if not isinstance(wave_summary, dict):
            wave_summary = {}

        max_wave = wave_summary.get(
            "max"
        )

        if isinstance(max_wave, (int, float)):

            if max_wave >= 3.5:

                factors.append(
                    {
                        "type": "waves",
                        "severity": "high",
                        "status": "active",
                        "value_m": max_wave,
                        "threshold_m": 3.5,
                    }
                )

            elif max_wave >= 2.5:

                factors.append(
                    {
                        "type": "waves",
                        "severity": "moderate",
                        "status": "active",
                        "value_m": max_wave,
                        "threshold_m": 2.5,
                    }
                )

        # -----------------------------------------------------
        # PRECIPITATION RISK
        # -----------------------------------------------------

        precipitation_signal = (
            self.extract_precipitation_signal(
                weather_result
            )
        )

        if precipitation_signal:
            factors.append(
                precipitation_signal
            )

        return factors

    # ---------------------------------------------------------
    # PRECIPITATION
    # ---------------------------------------------------------

    def extract_precipitation_signal(
        self,
        weather_result: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:

        summary = weather_result.get(
            "summary",
            {}
        )

        if not isinstance(summary, dict):
            return None

        precipitation = summary.get(
            "precipitation",
            {}
        )

        if not isinstance(precipitation, dict):
            return None

        total = precipitation.get(
            "total"
        )

        if not isinstance(
            total,
            (int, float),
        ):
            return None

        if total >= 20:

            return {
                "type": "precipitation",
                "severity": "high",
                "status": "active",
                "total_mm": total,
                "threshold_mm": 20,
            }

        if total > 0:

            return {
                "type": "precipitation",
                "severity": "moderate",
                "status": "active",
                "total_mm": total,
            }

        return None

    # ---------------------------------------------------------
    # RISK LEVEL
    # ---------------------------------------------------------

    def calculate_risk_level(
        self,
        risk_factors: List[Dict[str, Any]],
    ) -> str:

        severities = [
            factor.get("severity")
            for factor in risk_factors
        ]

        if "high" in severities:
            return "high"

        if "moderate" in severities:
            return "moderate"

        return "low"

    # ---------------------------------------------------------
    # OPERATIONAL STATUS
    # ---------------------------------------------------------

    def determine_operational_status(
        self,
        risk_level: str,
        risk_factors: List[Dict[str, Any]],
    ) -> str:

        if risk_level == "high":
            return "high_attention"

        if risk_level == "moderate":
            return "caution"

        if not risk_factors:
            return "no_major_signal"

        return "caution"

    # ---------------------------------------------------------
    # MISSING EVIDENCE
    # ---------------------------------------------------------

    def identify_missing_evidence(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        ocean_result: Dict[str, Any],
        geospatial_result: Dict[str, Any],
    ) -> List[str]:

        missing = []

        if marine_result.get("status") != "success":

            missing.append(
                "Marine condition data"
            )

        if weather_result.get("status") != "success":

            missing.append(
                "Weather forecast data"
            )

        if ocean_result.get("status") != "success":

            missing.append(
                "Ocean analytics"
            )

        if geospatial_result.get("status") != "success":

            missing.append(
                "Geospatial context"
            )

        return missing

    # ---------------------------------------------------------
    # RECOMMENDATIONS
    # ---------------------------------------------------------

    def build_recommendations(
        self,
        risk_level: str,
        risk_factors: List[Dict[str, Any]],
        missing_evidence: List[str],
    ) -> List[str]:

        recommendations = []

        if risk_level == "high":

            recommendations.append(
                "Exercise heightened caution "
                "and review current official "
                "marine safety advisories before "
                "operations."
            )

        elif risk_level == "moderate":

            recommendations.append(
                "Review evolving weather and "
                "sea conditions before "
                "operational decisions."
            )

        else:

            recommendations.append(
                "No major risk signal was detected "
                "from the currently available data."
            )

        if any(
            factor.get("type") == "waves"
            for factor in risk_factors
        ):

            recommendations.append(
                "Monitor wave conditions and "
                "vessel-specific operating limits."
            )

        if any(
            factor.get("type") == "weather"
            for factor in risk_factors
        ):

            recommendations.append(
                "Monitor the latest weather "
                "forecast and marine advisories."
            )

        if any(
            factor.get("type") == "wind"
            for factor in risk_factors
        ):

            recommendations.append(
                "Monitor wind conditions and "
                "vessel-specific operating limits."
            )

        if any(
            factor.get("type") == "wind_gust"
            for factor in risk_factors
        ):

            recommendations.append(
                "Account for strong wind gusts "
                "when assessing operational exposure."
            )

        if any(
            factor.get("type") == "precipitation"
            for factor in risk_factors
        ):

            recommendations.append(
                "Account for reduced visibility "
                "or changing operating conditions "
                "during precipitation."
            )

        if missing_evidence:

            recommendations.append(
                "Risk assessment is limited by "
                "missing evidence: "
                + ", ".join(
                    missing_evidence
                )
                + "."
            )

        return recommendations

    # ---------------------------------------------------------
    # CONFIDENCE
    # ---------------------------------------------------------

    def calculate_confidence(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        ocean_result: Dict[str, Any],
    ) -> float:

        confidences = []

        for result in [
            marine_result,
            weather_result,
            ocean_result,
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
    # SOURCES
    # ---------------------------------------------------------

    def collect_sources(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        ocean_result: Dict[str, Any],
    ) -> List[Dict[str, Any]]:

        sources: List[Dict[str, Any]] = []
        seen = set()

        for result in [
            marine_result,
            weather_result,
            ocean_result,
        ]:

            result_sources = result.get(
                "sources",
                []
            )

            if not isinstance(
                result_sources,
                list,
            ):
                continue

            for source in result_sources:

                if not isinstance(source, dict):
                    continue

                # Stable deduplication key.
                # Prefer URL when available because
                # the same provider may appear through
                # multiple downstream agents.
                name = str(
                    source.get("name", "")
                ).strip()

                source_type = str(
                    source.get("type", "")
                ).strip()

                url = str(
                    source.get("url", "")
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

    # ---------------------------------------------------------
    # MESSAGE
    # ---------------------------------------------------------

    def build_message(
        self,
        risk_level: str,
        operational_status: str,
        risk_factors: List[Dict[str, Any]],
        missing_evidence: List[str],
    ) -> str:

        if risk_level == "high":

            message = (
                "High-attention marine risk "
                "signals were detected from "
                "the available data."
            )

        elif risk_level == "moderate":

            message = (
                "Moderate marine risk signals "
                "were detected. Conditions "
                "should be monitored."
            )

        else:

            message = (
                "No major marine risk signal "
                "was detected in the available "
                "data."
            )

        if missing_evidence:

            message += (
                " This assessment is subject "
                "to the available evidence and "
                "should not be treated as a "
                "complete safety clearance."
            )

        return message

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