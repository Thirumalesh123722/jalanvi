import re
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from math import radians, sin, cos, sqrt, atan2


class GeospatialAgent:
    """
    Aqua Intellect - Geospatial Reasoning Agent

    Responsibilities:
    - Perform geographic reasoning
    - Calculate distances between coordinates
    - Determine nearest locations
    - Evaluate whether points fall inside geographic areas
    - Analyze bounding areas
    - Support geofence reasoning
    - Analyze requested vessel route geometry
    - Validate route endpoints against supplied geographic zones
    - Prepare spatial evidence for downstream agents
    - Never invent geographic boundaries
    """

    name = "geospatial"
    display_name = "Geospatial Reasoning Agent"

    def __init__(self):
        self.last_result: Optional[Dict[str, Any]] = None

    async def run(
        self,
        query: str,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        locations: Optional[List[Dict[str, Any]]] = None,
        zones: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:

        requested_operations = self.detect_required_operations(query)

        if latitude is None or longitude is None:

            result = {
                "agent": self.name,
                "status": "location_required",
                "query": query,
                "requested_operations": requested_operations,
                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },
                "spatial_analysis": {},
                "sources": [],
                "confidence": 0.0,
                "message": (
                    "A reference latitude and longitude "
                    "are required for geographic reasoning."
                ),
            }

            self.last_result = result
            return result

        if not self.is_valid_coordinate(latitude, longitude):

            result = {
                "agent": self.name,
                "status": "error",
                "query": query,
                "requested_operations": requested_operations,
                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },
                "spatial_analysis": {},
                "sources": [],
                "confidence": 0.0,
                "error": "Invalid reference latitude or longitude.",
                "message": (
                    "The supplied reference coordinates are invalid."
                ),
            }

            self.last_result = result
            return result

        try:

            locations = locations or []
            zones = zones or []

            distance_analysis = self.calculate_distances(
                latitude=latitude,
                longitude=longitude,
                locations=locations,
            )

            nearest_location = self.find_nearest_location(
                distance_analysis
            )

            zone_analysis = self.analyze_zones(
                latitude=latitude,
                longitude=longitude,
                zones=zones,
            )

            bounding_area = self.build_bounding_area(
                latitude=latitude,
                longitude=longitude,
            )

            route_analysis = self.analyze_requested_route(
                query=query,
                zones=zones,
            )

            spatial_summary = self.build_spatial_summary(
                nearest_location=nearest_location,
                zone_analysis=zone_analysis,
                distance_analysis=distance_analysis,
                route_analysis=route_analysis,
            )

            evidence = self.build_evidence(
                locations=locations,
                zones=zones,
                nearest_location=nearest_location,
                route_analysis=route_analysis,
            )

            result = {
                "agent": self.name,
                "status": "success",
                "query": query,
                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },
                "requested_operations": requested_operations,
                "spatial_analysis": {
                    "distances": distance_analysis,
                    "nearest": nearest_location,
                    "zones": zone_analysis,
                    "bounding_area": bounding_area,
                    "route_analysis": route_analysis,
                    "summary": spatial_summary,
                },
                "evidence": evidence,
                "sources": self.build_sources(
                    locations=locations,
                    zones=zones,
                    route_analysis=route_analysis,
                ),
                "retrieved_at": datetime.now(
                    timezone.utc
                ).isoformat(),
                "confidence": self.calculate_confidence(
                    locations=locations,
                    zones=zones,
                    nearest_location=nearest_location,
                    route_analysis=route_analysis,
                ),
                "message": self.build_message(
                    route_analysis=route_analysis,
                    zone_analysis=zone_analysis,
                ),
            }

            self.last_result = result
            return result

        except Exception as exc:

            result = {
                "agent": self.name,
                "status": "error",
                "query": query,
                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },
                "requested_operations": requested_operations,
                "spatial_analysis": {},
                "sources": [],
                "confidence": 0.0,
                "error": str(exc),
                "message": (
                    "Unexpected error occurred while "
                    "performing geospatial reasoning."
                ),
            }

            self.last_result = result
            return result

    def detect_required_operations(
        self,
        query: str,
    ) -> List[str]:

        text = query.lower()

        operations: List[str] = []

        if any(
            keyword in text
            for keyword in [
                "near",
                "nearest",
                "closest",
            ]
        ):
            operations.append(
                "nearest_location"
            )

        if any(
            keyword in text
            for keyword in [
                "distance",
                "far",
                "how far",
                "km",
                "route",
                "travel",
            ]
        ):
            operations.append(
                "distance_calculation"
            )

        if any(
            keyword in text
            for keyword in [
                "zone",
                "area",
                "region",
                "boundary",
            ]
        ):
            operations.append(
                "zone_analysis"
            )

        if any(
            keyword in text
            for keyword in [
                "geofence",
                "geofencing",
                "restricted",
                "restriction",
                "inside",
                "within",
            ]
        ):
            operations.append(
                "geofence_analysis"
            )

        if any(
            keyword in text
            for keyword in [
                "route",
                "vessel",
                "destination",
                "from",
                "to",
            ]
        ):
            operations.append(
                "route_spatial_analysis"
            )

        if any(
            keyword in text
            for keyword in [
                "coordinate",
                "coordinates",
                "location",
                "latitude",
                "longitude",
            ]
        ):
            operations.append(
                "coordinate_analysis"
            )

        if not operations:
            operations = [
                "coordinate_analysis",
                "spatial_summary",
            ]

        return list(
            dict.fromkeys(operations)
        )

    def calculate_distances(
        self,
        latitude: float,
        longitude: float,
        locations: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:

        results = []

        for location in locations:

            target_lat = location.get(
                "latitude"
            )
            target_lon = location.get(
                "longitude"
            )

            if not self.is_valid_coordinate(
                target_lat,
                target_lon,
            ):
                continue

            distance_km = self.haversine_distance(
                latitude,
                longitude,
                target_lat,
                target_lon,
            )

            results.append(
                {
                    "id": location.get(
                        "id"
                    ),
                    "name": location.get(
                        "name",
                        "Unnamed location",
                    ),
                    "latitude": target_lat,
                    "longitude": target_lon,
                    "distance_km": round(
                        distance_km,
                        3,
                    ),
                    "distance_nm": round(
                        distance_km / 1.852,
                        3,
                    ),
                }
            )

        return sorted(
            results,
            key=lambda item: item[
                "distance_km"
            ],
        )

    def find_nearest_location(
        self,
        distance_analysis: List[Dict[str, Any]],
    ) -> Dict[str, Any]:

        if not distance_analysis:
            return {
                "available": False,
                "message": (
                    "No valid geographic locations "
                    "were supplied for comparison."
                ),
            }

        nearest = distance_analysis[0]

        return {
            "available": True,
            "id": nearest.get("id"),
            "name": nearest.get("name"),
            "latitude": nearest.get(
                "latitude"
            ),
            "longitude": nearest.get(
                "longitude"
            ),
            "distance_km": nearest.get(
                "distance_km"
            ),
            "distance_nm": nearest.get(
                "distance_nm"
            ),
        }

    def analyze_zones(
        self,
        latitude: float,
        longitude: float,
        zones: List[Dict[str, Any]],
    ) -> Dict[str, Any]:

        if not zones:
            return {
                "available": False,
                "checked_zones": 0,
                "inside_zones": [],
                "message": (
                    "No geographic zone definitions "
                    "were supplied for spatial validation."
                ),
            }

        inside_zones = []
        checked_zones = 0

        for zone in zones:

            geometry = zone.get(
                "geometry"
            )

            if not geometry:
                continue

            checked_zones += 1

            if self.point_in_geometry(
                latitude,
                longitude,
                geometry,
            ):
                inside_zones.append(
                    {
                        "id": zone.get("id"),
                        "name": zone.get(
                            "name",
                            "Unnamed zone",
                        ),
                        "type": zone.get(
                            "type",
                            "unknown",
                        ),
                    }
                )

        return {
            "available": True,
            "checked_zones": checked_zones,
            "inside_zones": inside_zones,
            "inside_any_zone": bool(
                inside_zones
            ),
        }

    def analyze_requested_route(
        self,
        query: str,
        zones: List[Dict[str, Any]],
    ) -> Dict[str, Any]:

        route = self.extract_route_coordinates(
            query
        )

        if not route:
            return {
                "available": False,
                "route_detected": False,
                "message": (
                    "No explicit start and destination "
                    "coordinate pair was detected in the query."
                ),
            }

        start = route["start"]
        destination = route["destination"]

        distance_km = self.haversine_distance(
            start["latitude"],
            start["longitude"],
            destination["latitude"],
            destination["longitude"],
        )

        distance_nm = distance_km / 1.852

        sample_count = self.calculate_route_sample_count(
            distance_km
        )

        route_points = self.build_route_points(
            start=start,
            destination=destination,
            sample_count=sample_count,
        )

        corridor = self.build_route_corridor(
            route_points=route_points,
            padding_km=5.0,
        )

        zone_validation = self.validate_route_against_zones(
            route_points=route_points,
            zones=zones,
        )

        return {
            "available": True,
            "route_detected": True,
            "start": start,
            "destination": destination,
            "distance_km": round(
                distance_km,
                3,
            ),
            "distance_nm": round(
                distance_nm,
                3,
            ),
            "sample_count": len(
                route_points
            ),
            "route_points": route_points,
            "corridor": corridor,
            "zone_validation": zone_validation,
            "limitations": self.build_route_limitations(
                zones=zones,
                zone_validation=zone_validation,
            ),
        }

    def extract_route_coordinates(
        self,
        query: str,
    ) -> Optional[Dict[str, Dict[str, float]]]:

        if not query:
            return None

        pattern = (
            r"(-?\d+(?:\.\d+)?)\s*,\s*"
            r"(-?\d+(?:\.\d+)?)"
        )

        matches = re.findall(
            pattern,
            query,
        )

        if len(matches) < 2:
            return None

        first_lat = float(
            matches[0][0]
        )
        first_lon = float(
            matches[0][1]
        )

        second_lat = float(
            matches[1][0]
        )
        second_lon = float(
            matches[1][1]
        )

        if not self.is_valid_coordinate(
            first_lat,
            first_lon,
        ):
            return None

        if not self.is_valid_coordinate(
            second_lat,
            second_lon,
        ):
            return None

        return {
            "start": {
                "latitude": first_lat,
                "longitude": first_lon,
            },
            "destination": {
                "latitude": second_lat,
                "longitude": second_lon,
            },
        }

    def calculate_route_sample_count(
        self,
        distance_km: float,
    ) -> int:

        if distance_km <= 25:
            return 5

        if distance_km <= 50:
            return 7

        if distance_km <= 100:
            return 11

        if distance_km <= 250:
            return 21

        return 31

    def build_route_points(
        self,
        start: Dict[str, float],
        destination: Dict[str, float],
        sample_count: int,
    ) -> List[Dict[str, float]]:

        sample_count = max(
            2,
            int(sample_count),
        )

        points = []

        for index in range(
            sample_count
        ):

            fraction = (
                index
                / (sample_count - 1)
            )

            latitude = (
                start["latitude"]
                + (
                    destination["latitude"]
                    - start["latitude"]
                )
                * fraction
            )

            longitude = (
                start["longitude"]
                + (
                    destination["longitude"]
                    - start["longitude"]
                )
                * fraction
            )

            points.append(
                {
                    "latitude": round(
                        latitude,
                        6,
                    ),
                    "longitude": round(
                        longitude,
                        6,
                    ),
                }
            )

        return points

    def build_route_corridor(
        self,
        route_points: List[Dict[str, float]],
        padding_km: float = 5.0,
    ) -> Dict[str, Any]:

        if not route_points:
            return {
                "available": False,
                "message": (
                    "No route points available "
                    "for corridor construction."
                ),
            }

        latitudes = [
            point["latitude"]
            for point in route_points
        ]

        longitudes = [
            point["longitude"]
            for point in route_points
        ]

        center_latitude = (
            min(latitudes)
            + max(latitudes)
        ) / 2

        center_longitude = (
            min(longitudes)
            + max(longitudes)
        ) / 2

        latitude_padding = (
            padding_km / 111.0
        )

        longitude_factor = max(
            cos(
                radians(
                    center_latitude
                )
            ),
            0.01,
        )

        longitude_padding = (
            padding_km
            / (
                111.0
                * longitude_factor
            )
        )

        return {
            "available": True,
            "padding_km": padding_km,
            "min_latitude": round(
                min(latitudes)
                - latitude_padding,
                6,
            ),
            "max_latitude": round(
                max(latitudes)
                + latitude_padding,
                6,
            ),
            "min_longitude": round(
                min(longitudes)
                - longitude_padding,
                6,
            ),
            "max_longitude": round(
                max(longitudes)
                + longitude_padding,
                6,
            ),
        }

    def validate_route_against_zones(
        self,
        route_points: List[Dict[str, float]],
        zones: List[Dict[str, Any]],
    ) -> Dict[str, Any]:

        if not zones:
            return {
                "available": False,
                "zones_checked": 0,
                "route_intersects_zones": None,
                "intersecting_zones": [],
                "checked_route_points": len(
                    route_points
                ),
                "message": (
                    "No geographic zone definitions "
                    "were supplied for route validation."
                ),
            }

        valid_zones = [
            zone
            for zone in zones
            if zone.get("geometry")
        ]

        if not valid_zones:
            return {
                "available": False,
                "zones_checked": 0,
                "route_intersects_zones": None,
                "intersecting_zones": [],
                "checked_route_points": len(
                    route_points
                ),
                "message": (
                    "No valid zone geometries were "
                    "supplied for route validation."
                ),
            }

        intersecting_zones = []

        for zone in valid_zones:

            geometry = zone.get(
                "geometry"
            )

            hit_points = []

            for index, point in enumerate(
                route_points
            ):

                if self.point_in_geometry(
                    point["latitude"],
                    point["longitude"],
                    geometry,
                ):
                    hit_points.append(
                        index
                    )

            if hit_points:

                intersecting_zones.append(
                    {
                        "id": zone.get("id"),
                        "name": zone.get(
                            "name",
                            "Unnamed zone",
                        ),
                        "type": zone.get(
                            "type",
                            "unknown",
                        ),
                        "matched_route_points": len(
                            hit_points
                        ),
                        "first_matched_point_index": (
                            hit_points[0]
                        ),
                    }
                )

        return {
            "available": True,
            "zones_checked": len(
                valid_zones
            ),
            "route_intersects_zones": bool(
                intersecting_zones
            ),
            "intersecting_zones": (
                intersecting_zones
            ),
            "checked_route_points": len(
                route_points
            ),
        }

    def build_route_limitations(
        self,
        zones: List[Dict[str, Any]],
        zone_validation: Dict[str, Any],
    ) -> List[str]:

        limitations = [
            "Route geometry represents a direct planning path and is not a certified navigation route.",
            "Route validation does not account for bathymetry, vessel traffic, navigation notices, currents, draft or vessel-specific constraints.",
        ]

        if not zones:
            limitations.append(
                "No restricted-area or geofence dataset was supplied, so route-zone restrictions could not be validated."
            )
        elif not zone_validation.get(
            "available",
            False,
        ):
            limitations.append(
                "Supplied geographic zones could not be validated because no valid zone geometries were available."
            )

        return limitations

    def point_in_geometry(
        self,
        latitude: float,
        longitude: float,
        geometry: Dict[str, Any],
    ) -> bool:

        geometry_type = geometry.get(
            "type"
        )

        coordinates = geometry.get(
            "coordinates"
        )

        if not coordinates:
            return False

        if geometry_type == "Polygon":

            return self.point_in_polygon(
                latitude,
                longitude,
                coordinates[0],
            )

        if geometry_type == "MultiPolygon":

            for polygon in coordinates:

                if not polygon:
                    continue

                if self.point_in_polygon(
                    latitude,
                    longitude,
                    polygon[0],
                ):
                    return True

        return False

    def point_in_polygon(
        self,
        latitude: float,
        longitude: float,
        polygon: List[List[float]],
    ) -> bool:

        if len(polygon) < 3:
            return False

        inside = False

        j = len(polygon) - 1

        for i in range(
            len(polygon)
        ):

            lon_i = polygon[i][0]
            lat_i = polygon[i][1]

            lon_j = polygon[j][0]
            lat_j = polygon[j][1]

            if lat_i == lat_j:
                j = i
                continue

            intersects = (
                (
                    lat_i > latitude
                )
                != (
                    lat_j > latitude
                )
            ) and (
                longitude
                < (
                    (
                        lon_j - lon_i
                    )
                    * (
                        latitude - lat_i
                    )
                    / (
                        lat_j - lat_i
                    )
                    + lon_i
                )
            )

            if intersects:
                inside = not inside

            j = i

        return inside

    def build_bounding_area(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 25.0,
    ) -> Dict[str, Any]:

        latitude_delta = (
            radius_km / 111.0
        )

        longitude_factor = max(
            cos(
                radians(latitude)
            ),
            0.01,
        )

        longitude_delta = (
            radius_km
            / (
                111.0
                * longitude_factor
            )
        )

        return {
            "center": {
                "latitude": latitude,
                "longitude": longitude,
            },
            "radius_km": radius_km,
            "min_latitude": round(
                latitude
                - latitude_delta,
                6,
            ),
            "max_latitude": round(
                latitude
                + latitude_delta,
                6,
            ),
            "min_longitude": round(
                longitude
                - longitude_delta,
                6,
            ),
            "max_longitude": round(
                longitude
                + longitude_delta,
                6,
            ),
        }

    def build_spatial_summary(
        self,
        nearest_location: Dict[str, Any],
        zone_analysis: Dict[str, Any],
        distance_analysis: List[Dict[str, Any]],
        route_analysis: Dict[str, Any],
    ) -> Dict[str, Any]:

        return {
            "locations_analyzed": len(
                distance_analysis
            ),
            "nearest_available": (
                nearest_location.get(
                    "available",
                    False,
                )
            ),
            "nearest_location": (
                nearest_location.get(
                    "name"
                )
            ),
            "nearest_distance_km": (
                nearest_location.get(
                    "distance_km"
                )
            ),
            "zones_checked": (
                zone_analysis.get(
                    "checked_zones",
                    0,
                )
            ),
            "inside_any_zone": (
                zone_analysis.get(
                    "inside_any_zone",
                    False,
                )
            ),
            "route_analysis_available": (
                route_analysis.get(
                    "available",
                    False,
                )
            ),
            "route_distance_km": (
                route_analysis.get(
                    "distance_km"
                )
            ),
            "route_zone_validation_available": (
                route_analysis.get(
                    "zone_validation",
                    {},
                ).get(
                    "available",
                    False,
                )
            ),
            "route_intersects_zones": (
                route_analysis.get(
                    "zone_validation",
                    {},
                ).get(
                    "route_intersects_zones"
                )
            ),
        }

    def build_evidence(
        self,
        locations: List[Dict[str, Any]],
        zones: List[Dict[str, Any]],
        nearest_location: Dict[str, Any],
        route_analysis: Dict[str, Any],
    ) -> Dict[str, Any]:

        route_zone_validation = (
            route_analysis.get(
                "zone_validation",
                {},
            )
        )

        limitations = []

        if not locations and not zones:
            limitations.append(
                "No external spatial datasets "
                "were supplied."
            )

        limitations.extend(
            route_analysis.get(
                "limitations",
                [],
            )
        )

        return {
            "location_dataset_supplied": bool(
                locations
            ),
            "zone_dataset_supplied": bool(
                zones
            ),
            "nearest_calculation_valid": (
                nearest_location.get(
                    "available",
                    False,
                )
            ),
            "route_geometry_detected": (
                route_analysis.get(
                    "route_detected",
                    False,
                )
            ),
            "route_zone_validation_available": (
                route_zone_validation.get(
                    "available",
                    False,
                )
            ),
            "route_zone_intersection_detected": (
                route_zone_validation.get(
                    "route_intersects_zones"
                )
            ),
            "limitations": list(
                dict.fromkeys(
                    limitations
                )
            ),
        }

    def build_sources(
        self,
        locations: List[Dict[str, Any]],
        zones: List[Dict[str, Any]],
        route_analysis: Dict[str, Any],
    ) -> List[Dict[str, Any]]:

        sources = []

        if locations:
            sources.append(
                {
                    "name": "Supplied location dataset",
                    "type": "geospatial_dataset",
                    "status": "provided",
                }
            )

        if zones:
            sources.append(
                {
                    "name": "Supplied geographic zones",
                    "type": "zone_dataset",
                    "status": "provided",
                }
            )

        if route_analysis.get(
            "route_detected",
            False,
        ):
            sources.append(
                {
                    "name": "User-supplied route coordinates",
                    "type": "route_geometry",
                    "status": "parsed",
                }
            )

        return sources

    def calculate_confidence(
        self,
        locations: List[Dict[str, Any]],
        zones: List[Dict[str, Any]],
        nearest_location: Dict[str, Any],
        route_analysis: Dict[str, Any],
    ) -> float:

        route_detected = route_analysis.get(
            "route_detected",
            False,
        )

        route_zone_validation = (
            route_analysis.get(
                "zone_validation",
                {},
            )
        )

        route_validation_available = (
            route_zone_validation.get(
                "available",
                False,
            )
        )

        if (
            route_detected
            and zones
            and route_validation_available
            and locations
        ):
            return 0.95

        if (
            route_detected
            and zones
            and route_validation_available
        ):
            return 0.90

        if locations and zones:
            return 0.90

        if route_detected and locations:
            return 0.85

        if locations:
            return 0.80

        if zones:
            return 0.75

        if route_detected:
            return 0.70

        if nearest_location.get(
            "available"
        ):
            return 0.70

        return 0.50

    def build_message(
        self,
        route_analysis: Dict[str, Any],
        zone_analysis: Dict[str, Any],
    ) -> str:

        if not route_analysis.get(
            "route_detected",
            False,
        ):
            if zone_analysis.get(
                "available",
                False,
            ):
                return (
                    "Geospatial reasoning completed "
                    "successfully with geographic zone analysis."
                )

            return (
                "Geospatial reasoning completed "
                "successfully."
            )

        distance_km = route_analysis.get(
            "distance_km"
        )

        zone_validation = (
            route_analysis.get(
                "zone_validation",
                {},
            )
        )

        if zone_validation.get(
            "available",
            False,
        ):
            if zone_validation.get(
                "route_intersects_zones",
                False,
            ):
                return (
                    f"Route geometry analyzed over "
                    f"approximately {distance_km} km. "
                    "The supplied geographic zone dataset "
                    "indicates that the sampled route intersects "
                    "one or more defined zones."
                )

            return (
                f"Route geometry analyzed over "
                f"approximately {distance_km} km. "
                "No intersection with the supplied geographic "
                "zone geometries was detected in the sampled route."
            )

        return (
            f"Route geometry analyzed over "
            f"approximately {distance_km} km. "
            "No geographic zone dataset was available to "
            "validate route restrictions."
        )

    @staticmethod
    def is_valid_coordinate(
        latitude: Any,
        longitude: Any,
    ) -> bool:

        if not isinstance(
            latitude,
            (int, float),
        ):
            return False

        if not isinstance(
            longitude,
            (int, float),
        ):
            return False

        return (
            -90
            <= float(latitude)
            <= 90
            and
            -180
            <= float(longitude)
            <= 180
        )

    @staticmethod
    def haversine_distance(
        latitude_1: float,
        longitude_1: float,
        latitude_2: float,
        longitude_2: float,
    ) -> float:

        earth_radius_km = 6371.0088

        lat1 = radians(
            latitude_1
        )

        lat2 = radians(
            latitude_2
        )

        delta_lat = radians(
            latitude_2
            - latitude_1
        )

        delta_lon = radians(
            longitude_2
            - longitude_1
        )

        a = (
            sin(delta_lat / 2) ** 2
            + cos(lat1)
            * cos(lat2)
            * sin(delta_lon / 2) ** 2
        )

        c = 2 * atan2(
            sqrt(a),
            sqrt(1 - a),
        )

        return (
            earth_radius_km * c
        )

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