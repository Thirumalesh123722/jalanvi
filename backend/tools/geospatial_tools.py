from __future__ import annotations


def get_geofence(region: str) -> dict:
    return {
        "region": region,
        "zone_type": "coastal_monitoring",
        "alerts": [],
        "status": "active",
    }
