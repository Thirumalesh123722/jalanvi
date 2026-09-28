from __future__ import annotations


def get_weather_snapshot(region: str) -> dict:
    return {
        "region": region,
        "wind_kmh": 12,
        "rainfall_mm": 0.5,
        "storm_risk": "low",
    }
