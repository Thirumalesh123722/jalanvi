from typing import Any, Dict, List, Optional
from datetime import datetime, timezone


class OceanAnalyticsAgent:
    """
    Aqua Intellect - Ocean Analytics Agent

    Responsibilities:
    - Analyze marine model data
    - Evaluate SST conditions
    - Evaluate wave conditions
    - Evaluate ocean-current conditions
    - Detect whether chlorophyll/PFZ evidence exists
    - Produce transparent ocean-productivity signals
    - Never fabricate PFZ or chlorophyll information
    """

    name = "ocean_analytics"
    display_name = "Ocean Analytics Agent"

    def __init__(self):
        self.last_result: Optional[Dict[str, Any]] = None

    async def run(
        self,
        query: str,
        marine_result: Optional[Dict[str, Any]] = None,
        weather_result: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:

        marine_result = marine_result or {}
        weather_result = weather_result or {}

        marine_data = marine_result.get(
            "data",
            {},
        )

        marine_summary = marine_result.get(
            "summary",
            {},
        )

        weather_assessment = weather_result.get(
            "assessment",
            {},
        )

        requested_data = self.detect_required_data(
            query
        )

        sst = self._get_statistics(
            marine_summary,
            "sea_surface_temperature",
        )

        waves = self._get_statistics(
            marine_summary,
            "wave_height",
        )

        wave_period = self._get_statistics(
            marine_summary,
            "wave_period",
        )

        currents = self._get_statistics(
            marine_summary,
            "ocean_current_velocity",
        )

        chlorophyll_available = self._has_chlorophyll(
            marine_data
        )

        pfz_available = self._has_pfz(
            marine_result
        )

        sst_analysis = self.analyze_sst(
            sst
        )

        wave_analysis = self.analyze_waves(
            waves,
            wave_period,
        )

        current_analysis = self.analyze_currents(
            currents
        )

        productivity = self.assess_productivity(
            sst_analysis=sst_analysis,
            chlorophyll_available=(
                chlorophyll_available
            ),
            pfz_available=pfz_available,
        )

        operational_context = self.build_operational_context(
            wave_analysis=wave_analysis,
            weather_assessment=weather_assessment,
        )

        evidence_status = self.build_evidence_status(
            marine_result=marine_result,
            chlorophyll_available=(
                chlorophyll_available
            ),
            pfz_available=pfz_available,
        )

        result = {
            "agent": self.name,
            "status": "success",
            "query": query,
            "location": marine_result.get(
                "location",
                {},
            ),
            "requested_data": requested_data,
            "analysis": {
                "sst": sst_analysis,
                "waves": wave_analysis,
                "currents": current_analysis,
                "productivity": productivity,
                "operational_context": (
                    operational_context
                ),
            },
            "pfz": {
                "available": pfz_available,
                "validated": pfz_available,
                "message": (
                    "Validated PFZ data is available."
                    if pfz_available
                    else (
                        "Validated PFZ data is not "
                        "available from the connected "
                        "marine source."
                    )
                ),
            },
            "chlorophyll": {
                "available": chlorophyll_available,
                "message": (
                    "Chlorophyll data is available."
                    if chlorophyll_available
                    else (
                        "Chlorophyll data is not "
                        "available from the connected "
                        "marine source."
                    )
                ),
            },
            "evidence": evidence_status,
            "sources": self.collect_sources(
                marine_result,
                weather_result,
            ),
            "retrieved_at": (
                datetime.now(
                    timezone.utc
                ).isoformat()
            ),
            "confidence": self.calculate_confidence(
                marine_result=marine_result,
                weather_result=weather_result,
                chlorophyll_available=(
                    chlorophyll_available
                ),
                pfz_available=pfz_available,
            ),
            "message": self.build_message(
                productivity=productivity,
                chlorophyll_available=(
                    chlorophyll_available
                ),
                pfz_available=pfz_available,
            ),
        }

        self.last_result = result

        return result

    def detect_required_data(
        self,
        query: str,
    ) -> List[str]:

        text = query.lower()

        required: List[str] = []

        if any(
            keyword in text
            for keyword in [
                "pfz",
                "fishing",
                "fish",
                "fishing zone",
                "hotspot",
            ]
        ):
            required.extend(
                [
                    "sst",
                    "chlorophyll",
                    "pfz",
                    "waves",
                    "currents",
                ]
            )

        if any(
            keyword in text
            for keyword in [
                "sst",
                "temperature",
            ]
        ):
            required.append("sst")

        if any(
            keyword in text
            for keyword in [
                "chlorophyll",
                "productivity",
            ]
        ):
            required.append("chlorophyll")

        if any(
            keyword in text
            for keyword in [
                "wave",
                "waves",
                "swell",
            ]
        ):
            required.append("waves")

        if any(
            keyword in text
            for keyword in [
                "current",
                "currents",
            ]
        ):
            required.append("currents")

        if not required:
            required = [
                "sst",
                "waves",
                "currents",
            ]

        return list(
            dict.fromkeys(required)
        )

    def analyze_sst(
        self,
        statistics: Dict[str, Any],
    ) -> Dict[str, Any]:

        if not statistics.get("available"):
            return {
                "available": False,
                "status": "data_unavailable",
                "message": (
                    "SST data is unavailable."
                ),
            }

        average = statistics.get(
            "average"
        )

        minimum = statistics.get(
            "min"
        )

        maximum = statistics.get(
            "max"
        )

        signal = "neutral"

        if average is not None:

            if 24 <= average <= 30:
                signal = "potentially_favorable"

            elif average < 20:
                signal = "cool"

            elif average > 32:
                signal = "warm"

        return {
            "available": True,
            "min_celsius": minimum,
            "max_celsius": maximum,
            "average_celsius": average,
            "signal": signal,
            "interpretation": (
                "SST falls within a broad "
                "marine-productivity screening "
                "range."
                if signal == "potentially_favorable"
                else (
                    "SST alone is not sufficient "
                    "to establish a PFZ."
                )
            ),
        }

    def analyze_waves(
        self,
        statistics: Dict[str, Any],
        period: Dict[str, Any],
    ) -> Dict[str, Any]:

        if not statistics.get("available"):
            return {
                "available": False,
                "status": "data_unavailable",
            }

        average_height = statistics.get(
            "average"
        )

        maximum_height = statistics.get(
            "max"
        )

        average_period = period.get(
            "average"
        )

        if (
            average_height is not None
            and average_height < 1.5
        ):
            sea_state = "relatively_calm"

        elif (
            average_height is not None
            and average_height < 2.5
        ):
            sea_state = "moderate"

        else:
            sea_state = "rougher_conditions"

        return {
            "available": True,
            "average_height_m": (
                average_height
            ),
            "maximum_height_m": (
                maximum_height
            ),
            "average_period_s": (
                average_period
            ),
            "sea_state_signal": sea_state,
        }

    def analyze_currents(
        self,
        statistics: Dict[str, Any],
    ) -> Dict[str, Any]:

        if not statistics.get("available"):
            return {
                "available": False,
                "status": "data_unavailable",
            }

        return {
            "available": True,
            "minimum": statistics.get(
                "min"
            ),
            "maximum": statistics.get(
                "max"
            ),
            "average": statistics.get(
                "average"
            ),
            "interpretation": (
                "Current information is available "
                "for ocean-condition analysis, "
                "but current velocity alone does "
                "not establish a PFZ."
            ),
        }

    def assess_productivity(
        self,
        sst_analysis: Dict[str, Any],
        chlorophyll_available: bool,
        pfz_available: bool,
    ) -> Dict[str, Any]:

        if pfz_available:
            return {
                "status": "pfz_evidence_available",
                "basis": [
                    "validated_pfz"
                ],
                "message": (
                    "PFZ evidence is available "
                    "for downstream analysis."
                ),
            }

        if not chlorophyll_available:
            return {
                "status": "insufficient_evidence",
                "basis": [
                    "sst"
                    if sst_analysis.get(
                        "available"
                    )
                    else "no_sst"
                ],
                "missing": [
                    "chlorophyll",
                    "validated_pfz",
                ],
                "message": (
                    "SST and marine conditions "
                    "can be analyzed, but a "
                    "validated fishing productivity "
                    "zone cannot be established "
                    "without chlorophyll/ocean-colour "
                    "evidence or an authoritative PFZ "
                    "dataset."
                ),
            }

        return {
            "status": "screening_available",
            "basis": [
                "sst",
                "chlorophyll",
            ],
            "message": (
                "Ocean productivity screening "
                "can be performed using SST and "
                "chlorophyll data."
            ),
        }

    def build_operational_context(
        self,
        wave_analysis: Dict[str, Any],
        weather_assessment: Dict[str, Any],
    ) -> Dict[str, Any]:

        signals = []

        sea_state = wave_analysis.get(
            "sea_state_signal"
        )

        if sea_state:
            signals.append(
                {
                    "source": "marine",
                    "signal": sea_state,
                }
            )

        weather_status = weather_assessment.get(
            "operational_status"
        )

        if weather_status:
            signals.append(
                {
                    "source": "weather",
                    "signal": weather_status,
                }
            )

        return {
            "signals": signals,
            "weather_status": weather_status,
            "sea_state": sea_state,
        }

    def build_evidence_status(
        self,
        marine_result: Dict[str, Any],
        chlorophyll_available: bool,
        pfz_available: bool,
    ) -> Dict[str, Any]:

        return {
            "marine_source_available": (
                marine_result.get(
                    "status"
                )
                == "success"
            ),
            "chlorophyll_available": (
                chlorophyll_available
            ),
            "validated_pfz_available": (
                pfz_available
            ),
            "limitations": (
                []
                if (
                    chlorophyll_available
                    and pfz_available
                )
                else [
                    "No validated PFZ evidence "
                    "is currently connected."
                ]
            ),
        }

    def collect_sources(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
    ) -> List[Dict[str, Any]]:

        sources = []

        for result in [
            marine_result,
            weather_result,
        ]:

            for source in result.get(
                "sources",
                [],
            ):

                sources.append(source)

        return sources

    def calculate_confidence(
        self,
        marine_result: Dict[str, Any],
        weather_result: Dict[str, Any],
        chlorophyll_available: bool,
        pfz_available: bool,
    ) -> float:

        marine_ok = (
            marine_result.get("status")
            == "success"
        )

        weather_ok = (
            weather_result.get("status")
            == "success"
        )

        if pfz_available:
            return 0.90

        if (
            marine_ok
            and weather_ok
            and chlorophyll_available
        ):
            return 0.80

        if marine_ok and weather_ok:
            return 0.65

        if marine_ok:
            return 0.50

        return 0.0

    def build_message(
        self,
        productivity: Dict[str, Any],
        chlorophyll_available: bool,
        pfz_available: bool,
    ) -> str:

        if pfz_available:
            return (
                "Validated PFZ evidence is available "
                "for further spatial analysis."
            )

        if not chlorophyll_available:
            return (
                "Marine conditions were analyzed, "
                "but a validated PFZ cannot be identified "
                "because chlorophyll/PFZ evidence is "
                "not currently connected."
            )

        return (
            "Ocean productivity conditions were "
            "screened using the available marine data."
        )

    @staticmethod
    def _get_statistics(
        summary: Dict[str, Any],
        key: str,
    ) -> Dict[str, Any]:

        value = summary.get(
            key,
            {},
        )

        if not isinstance(
            value,
            dict,
        ):
            return {
                "available": False
            }

        return value

    @staticmethod
    def _has_chlorophyll(
        marine_data: Dict[str, Any],
    ) -> bool:

        possible_keys = [
            "chlorophyll",
            "chlorophyll_a",
            "chlorophyll-a",
            "chlorophyll_concentration",
        ]

        return any(
            key in marine_data
            and marine_data.get(key)
            not in [
                None,
                [],
            ]
            for key in possible_keys
        )

    @staticmethod
    def _has_pfz(
        marine_result: Dict[str, Any],
    ) -> bool:

        possible_keys = [
            "pfz",
            "pfz_zones",
            "fishing_zones",
            "productivity_zones",
        ]

        for key in possible_keys:

            if (
                key in marine_result
                and marine_result.get(key)
                not in [
                    None,
                    [],
                ]
            ):
                return True

        data = marine_result.get(
            "data",
            {},
        )

        return any(
            key in data
            and data.get(key)
            not in [
                None,
                [],
            ]
            for key in possible_keys
        )

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
            "has_result": (
                self.last_result is not None
            ),
        }