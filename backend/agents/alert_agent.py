from typing import Any, Dict, List, Optional
from datetime import datetime, timezone


class AlertAgent:
    """
    Aqua Intellect - Alert Agent

    Responsibilities:
    - Detect actionable marine/weather signals
    - Convert risk signals into structured alerts
    - Assign alert severity
    - Provide alert reasons and evidence
    - Avoid duplicate alerts
    - Preserve uncertainty and source limitations

    Important:
    This agent generates alerts from available
    agent evidence. It does not invent official
    warnings or advisories.
    """

    name = "alert"
    display_name = "Alert Agent"

    def __init__(self):
        self.last_result: Optional[Dict[str, Any]] = None

    async def run(
        self,
        query: str,
        marine_result: Optional[Dict[str, Any]] = None,
        weather_result: Optional[Dict[str, Any]] = None,
        ocean_result: Optional[Dict[str, Any]] = None,
        safety_result: Optional[Dict[str, Any]] = None,
        geospatial_result: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:

        marine_result = marine_result or {}
        weather_result = weather_result or {}
        ocean_result = ocean_result or {}
        safety_result = safety_result or {}
        geospatial_result = geospatial_result or {}

        alerts = self.detect_alerts(
            marine_result=marine_result,
            weather_result=weather_result,
            ocean_result=ocean_result,
            safety_result=safety_result,
        )

        alerts = self.deduplicate_alerts(alerts)

        highest_severity = self.highest_severity(alerts)

        alert_status = self.determine_alert_status(alerts)

        limitations = self.identify_limitations(
            marine_result=marine_result,
            weather_result=weather_result,
            safety_result=safety_result,
            geospatial_result=geospatial_result,
        )

        confidence = self.calculate_confidence(
            marine_result=marine_result,
            weather_result=weather_result,
            ocean_result=ocean_result,
            safety_result=safety_result,
        )

        result = {
            "agent": self.name,
            "status": "success",
            "query": query,
            "alert_status": alert_status,
            "highest_severity": highest_severity,
            "alert_count": len(alerts),
            "alerts": alerts,
            "limitations": limitations,
            "sources": self.collect_sources(
                marine_result=marine_result,
                weather_result=weather_result,
                ocean_result=ocean_result,
                safety_result=safety_result,
            ),
            "confidence": confidence,
            "generated_at": datetime.now(
                timezone.utc
            ).isoformat(),
            "message": self.build_message(
                alerts=alerts,
                highest_severity=highest_severity,
                limitations=limitations,
            ),
        }

        self.last_result = result

        return result

    # ---------------------------------------------------------
    # ALERT DETECTION
    # ---------------------------------------------------------

    def detect_alerts(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        ocean_result: Dict[str, Any],
        safety_result: Dict[str, Any],
    ) -> List[Dict[str, Any]]:

        alerts: List[Dict[str, Any]] = []

        # -----------------------------------------------------
        # WEATHER ALERT
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

            alerts.append(
                self.create_alert(
                    alert_type="weather",
                    severity="high",
                    title="High weather attention",
                    message=(
                        "Weather conditions require "
                        "heightened attention."
                    ),
                    reasons=weather_reasons,
                )
            )

        elif weather_status == "moderate_attention":

            alerts.append(
                self.create_alert(
                    alert_type="weather",
                    severity="moderate",
                    title="Moderate weather attention",
                    message=(
                        "Moderate weather signals "
                        "were detected."
                    ),
                    reasons=weather_reasons,
                )
            )

        # -----------------------------------------------------
        # SAFETY / RISK ALERT
        # -----------------------------------------------------

        safety_risk = safety_result.get(
            "risk",
            {},
        )

        if not isinstance(safety_risk, dict):
            safety_risk = {}

        safety_level = safety_risk.get(
            "level"
        )

        safety_factors = safety_risk.get(
            "factors",
            [],
        )

        if not isinstance(safety_factors, list):
            safety_factors = [safety_factors]

        if safety_level == "high":

            alerts.append(
                self.create_alert(
                    alert_type="marine_risk",
                    severity="high",
                    title="High marine risk",
                    message=(
                        "The Safety / Risk Agent "
                        "detected high-risk signals."
                    ),
                    reasons=safety_factors,
                )
            )

        elif safety_level == "moderate":

            alerts.append(
                self.create_alert(
                    alert_type="marine_risk",
                    severity="moderate",
                    title="Moderate marine risk",
                    message=(
                        "The Safety / Risk Agent "
                        "detected moderate-risk signals."
                    ),
                    reasons=safety_factors,
                )
            )

        # -----------------------------------------------------
        # WAVE ALERT
        # -----------------------------------------------------

        wave_alert = self.detect_wave_alert(
            marine_result
        )

        if wave_alert:
            alerts.append(wave_alert)

        # -----------------------------------------------------
        # PRECIPITATION ALERT
        # -----------------------------------------------------

        precipitation_alert = (
            self.detect_precipitation_alert(
                weather_result
            )
        )

        if precipitation_alert:
            alerts.append(
                precipitation_alert
            )

        # -----------------------------------------------------
        # WIND ALERT
        # -----------------------------------------------------

        wind_alert = self.detect_wind_alert(
            weather_result
        )

        if wind_alert:
            alerts.append(wind_alert)

        # -----------------------------------------------------
        # WIND GUST ALERT
        # -----------------------------------------------------

        gust_alert = self.detect_gust_alert(
            weather_result
        )

        if gust_alert:
            alerts.append(gust_alert)

        return alerts

    # ---------------------------------------------------------
    # WAVE ALERT
    # ---------------------------------------------------------

    def detect_wave_alert(
        self,
        marine_result: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:

        summary = marine_result.get(
            "summary",
            {},
        )

        if not isinstance(summary, dict):
            return None

        wave_height = summary.get(
            "wave_height",
            {},
        )

        if not isinstance(wave_height, dict):
            return None

        maximum = wave_height.get(
            "max"
        )

        if not isinstance(
            maximum,
            (int, float),
        ):
            return None

        if maximum >= 3.5:

            return self.create_alert(
                alert_type="waves",
                severity="high",
                title="High wave signal",
                message=(
                    "The available marine model "
                    "indicates elevated wave height."
                ),
                reasons=[
                    f"Maximum wave height: "
                    f"{maximum} m"
                ],
            )

        if maximum >= 2.5:

            return self.create_alert(
                alert_type="waves",
                severity="moderate",
                title="Elevated wave signal",
                message=(
                    "The available marine model "
                    "indicates moderately elevated "
                    "wave height."
                ),
                reasons=[
                    f"Maximum wave height: "
                    f"{maximum} m"
                ],
            )

        return None

    # ---------------------------------------------------------
    # PRECIPITATION ALERT
    # ---------------------------------------------------------

    def detect_precipitation_alert(
        self,
        weather_result: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:

        summary = weather_result.get(
            "summary",
            {},
        )

        if not isinstance(summary, dict):
            return None

        precipitation = summary.get(
            "precipitation",
            {},
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

            return self.create_alert(
                alert_type="precipitation",
                severity="high",
                title="Heavy precipitation signal",
                message=(
                    "The weather forecast indicates "
                    "substantial precipitation."
                ),
                reasons=[
                    f"Forecast precipitation: "
                    f"{total} mm"
                ],
            )

        if total > 0:

            return self.create_alert(
                alert_type="precipitation",
                severity="moderate",
                title="Precipitation signal",
                message=(
                    "The weather forecast includes "
                    "precipitation."
                ),
                reasons=[
                    f"Forecast precipitation: "
                    f"{total} mm"
                ],
            )

        return None

    # ---------------------------------------------------------
    # WIND ALERT
    # ---------------------------------------------------------

    def detect_wind_alert(
        self,
        weather_result: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:

        summary = weather_result.get(
            "summary",
            {},
        )

        if not isinstance(summary, dict):
            return None

        wind_speed = summary.get(
            "wind_speed",
            {},
        )

        if not isinstance(wind_speed, dict):
            return None

        maximum = wind_speed.get(
            "max"
        )

        if not isinstance(
            maximum,
            (int, float),
        ):
            return None

        if maximum >= 40:

            return self.create_alert(
                alert_type="wind",
                severity="high",
                title="High wind signal",
                message=(
                    "The weather forecast indicates "
                    "high wind speed."
                ),
                reasons=[
                    f"Maximum wind speed: "
                    f"{maximum} km/h"
                ],
            )

        if maximum >= 25:

            return self.create_alert(
                alert_type="wind",
                severity="moderate",
                title="Elevated wind signal",
                message=(
                    "The weather forecast indicates "
                    "elevated wind speed."
                ),
                reasons=[
                    f"Maximum wind speed: "
                    f"{maximum} km/h"
                ],
            )

        return None

    # ---------------------------------------------------------
    # WIND GUST ALERT
    # ---------------------------------------------------------

    def detect_gust_alert(
        self,
        weather_result: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:

        summary = weather_result.get(
            "summary",
            {},
        )

        if not isinstance(summary, dict):
            return None

        gusts = summary.get(
            "wind_gusts",
            {},
        )

        if not isinstance(gusts, dict):
            return None

        maximum = gusts.get(
            "max"
        )

        if not isinstance(
            maximum,
            (int, float),
        ):
            return None

        if maximum >= 55:

            return self.create_alert(
                alert_type="wind_gust",
                severity="high",
                title="Strong wind gust signal",
                message=(
                    "The weather forecast indicates "
                    "strong wind gusts."
                ),
                reasons=[
                    f"Maximum wind gust: "
                    f"{maximum} km/h"
                ],
            )

        if maximum >= 35:

            return self.create_alert(
                alert_type="wind_gust",
                severity="moderate",
                title="Elevated wind gust signal",
                message=(
                    "The weather forecast indicates "
                    "elevated wind gusts."
                ),
                reasons=[
                    f"Maximum wind gust: "
                    f"{maximum} km/h"
                ],
            )

        return None

    # ---------------------------------------------------------
    # ALERT CREATION
    # ---------------------------------------------------------

    def create_alert(
        self,
        alert_type: str,
        severity: str,
        title: str,
        message: str,
        reasons: Any,
    ) -> Dict[str, Any]:

        if not isinstance(
            reasons,
            list,
        ):
            reasons = [reasons]

        return {
            "type": alert_type,
            "severity": severity,
            "title": title,
            "message": message,
            "reasons": reasons,
            "generated_at": datetime.now(
                timezone.utc
            ).isoformat(),
            "source_type": "agent_analysis",
        }

    # ---------------------------------------------------------
    # DEDUPLICATION
    # ---------------------------------------------------------

    def deduplicate_alerts(
        self,
        alerts: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:

        unique = []
        seen = set()

        for alert in alerts:

            key = (
                alert.get("type"),
                alert.get("severity"),
            )

            if key in seen:
                continue

            seen.add(key)
            unique.append(alert)

        return unique

    # ---------------------------------------------------------
    # HIGHEST SEVERITY
    # ---------------------------------------------------------

    def highest_severity(
        self,
        alerts: List[Dict[str, Any]],
    ) -> str:

        priority = {
            "high": 3,
            "moderate": 2,
            "low": 1,
        }

        highest = "none"
        highest_score = 0

        for alert in alerts:

            severity = alert.get(
                "severity",
                "low",
            )

            score = priority.get(
                severity,
                0,
            )

            if score > highest_score:

                highest_score = score
                highest = severity

        return highest

    # ---------------------------------------------------------
    # ALERT STATUS
    # ---------------------------------------------------------

    def determine_alert_status(
        self,
        alerts: List[Dict[str, Any]],
    ) -> str:

        if not alerts:
            return "no_alerts"

        if any(
            alert.get("severity") == "high"
            for alert in alerts
        ):

            return "active_high_attention"

        if any(
            alert.get("severity") == "moderate"
            for alert in alerts
        ):

            return "active_caution"

        return "active"

    # ---------------------------------------------------------
    # LIMITATIONS
    # ---------------------------------------------------------

    def identify_limitations(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        safety_result: Dict[str, Any],
        geospatial_result: Dict[str, Any],
    ) -> List[str]:

        limitations = []

        if not weather_result:
            limitations.append(
                "Weather forecast evidence "
                "was not available."
            )

        if not marine_result:
            limitations.append(
                "Marine condition evidence "
                "was not available."
            )

        if not safety_result:
            limitations.append(
                "Dedicated safety assessment "
                "was not available."
            )

        if not geospatial_result:
            limitations.append(
                "Spatial context was not available."
            )

        limitations.append(
            "Generated alerts are analytical "
            "signals and are not substitutes "
            "for official maritime advisories."
        )

        return limitations

    # ---------------------------------------------------------
    # CONFIDENCE
    # ---------------------------------------------------------

    def calculate_confidence(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        ocean_result: Dict[str, Any],
        safety_result: Dict[str, Any],
    ) -> float:

        confidences = []

        for result in [
            marine_result,
            weather_result,
            ocean_result,
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
        safety_result: Dict[str, Any],
    ) -> List[Dict[str, Any]]:

        sources: List[Dict[str, Any]] = []
        seen = set()

        for result in [
            marine_result,
            weather_result,
            ocean_result,
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
                sources.append(source)

        return sources

    # ---------------------------------------------------------
    # MESSAGE
    # ---------------------------------------------------------

    def build_message(
        self,
        alerts: List[Dict[str, Any]],
        highest_severity: str,
        limitations: List[str],
    ) -> str:

        if not alerts:

            message = (
                "No alert-level signal was "
                "detected from the available "
                "marine and weather evidence."
            )

        elif highest_severity == "high":

            message = (
                f"{len(alerts)} alert signal(s) "
                "were detected, including a "
                "high-attention condition."
            )

        elif highest_severity == "moderate":

            message = (
                f"{len(alerts)} alert signal(s) "
                "were detected with moderate "
                "attention required."
            )

        else:

            message = (
                f"{len(alerts)} alert signal(s) "
                "were detected."
            )

        if limitations:

            message += (
                " These are analytical signals "
                "and should be checked against "
                "current official advisories."
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