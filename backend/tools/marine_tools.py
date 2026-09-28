from __future__ import annotations


def get_marine_snapshot(region: str) -> dict:
    return {
        "region": region,
        "temperature_c": 28.4,
        "current_speed_knots": 1.6,
        "status": "stable",
    }
