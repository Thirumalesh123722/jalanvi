from __future__ import annotations


def get_route_plan(origin: str, destination: str) -> dict:
    return {
        "origin": origin,
        "destination": destination,
        "distance_nm": 145.2,
        "estimated_time_hours": 6.4,
        "status": "recommended",
    }
