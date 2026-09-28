"""
Aqua Intellect & Marine AI - SQLite Production Database & Migration Layer
Provides persistent, thread-safe SQLite storage for:
- Users & Secure Bcrypt Password Hashes
- User Profiles & Preferences
- User-Owned Missions & Telemetry History
- User-Owned Family Link Contacts & SOS Events
- User-Owned Scientific AI History & Analyses
- User-Owned Marine AI Conversations & Safety Events
- Token Revocation & Password Recovery
"""

import sqlite3
import os
import json
import uuid
import datetime
import shutil
from pathlib import Path
import bcrypt

def resolve_database_path() -> str:
    """
    Resolves the canonical persistent database path.
    Prioritizes:
    1. Explicit environment variable: MARINE_AI_DB_PATH
    2. Primary user desktop workspace path if present: C:/Users/K TIRUMALESH/OneDrive/Desktop/marine-ai/backend/marine_ai.db
    3. Current backend file directory: Path(__file__).parent.resolve() / "marine_ai.db"
    """
    if "MARINE_AI_DB_PATH" in os.environ:
        return os.environ["MARINE_AI_DB_PATH"]
    
    desktop_dir = Path(r"C:\Users\K TIRUMALESH\OneDrive\Desktop\marine-ai\backend")
    if desktop_dir.exists():
        desktop_db = desktop_dir / "marine_ai.db"
        return str(desktop_db)
    
    return str((Path(__file__).parent.resolve() / "marine_ai.db"))

DB_PATH = resolve_database_path()

def sync_db_mirrors():
    """
    Ensures that all mirror directories (scratch, Desktop, Documents)
    have an identical up-to-date copy of the persistent database.
    """
    try:
        mirrors = [
            Path(r"C:\Users\K TIRUMALESH\.gemini\antigravity\scratch\marine-ai\backend\marine_ai.db"),
            Path(r"C:\Users\K TIRUMALESH\OneDrive\Desktop\marine-ai\backend\marine_ai.db"),
            Path(r"C:\Users\K TIRUMALESH\OneDrive\Documents\marine-ai\backend\marine_ai.db")
        ]
        src_path = Path(DB_PATH)
        if not src_path.exists():
            return

        for m in mirrors:
            if m.resolve() != src_path.resolve() and m.parent.exists():
                try:
                    shutil.copy2(src_path, m)
                except Exception:
                    pass
    except Exception:
        pass

def get_db_connection():
    """Returns a SQLite connection with row_factory enabled and foreign keys enforced."""
    conn = sqlite3.connect(DB_PATH, timeout=20.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    return conn

def init_db():
    """
    Initializes database tables safely with migrations.
    Never drops existing user data.
    """
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table (Core Identity)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        base_port TEXT DEFAULT 'Rameswaram Fishing Harbor',
        vessel_name TEXT DEFAULT 'Matsya-Varuna',
        vessel_reg TEXT DEFAULT 'IND-TN-09-MM-4421',
        vessel_type TEXT DEFAULT 'Mechanized Wooden Trawler (14m)',
        preferred_language TEXT DEFAULT 'en',
        notification_preferences TEXT DEFAULT '{"sms":true,"whatsapp":true,"urgent_calls":true}',
        role TEXT DEFAULT 'fisher',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Revoked Tokens Table (For immediate logout revocation)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS revoked_tokens (
        token_jti TEXT PRIMARY KEY,
        user_id TEXT,
        revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. Password Resets Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS password_resets (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 4. Family Contacts Table (User-Owned)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS family_contacts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        phone TEXT NOT NULL,
        notify_sms INTEGER DEFAULT 1,
        notify_whatsapp INTEGER DEFAULT 1,
        is_emergency_priority INTEGER DEFAULT 0,
        is_authorized_for_trip INTEGER DEFAULT 1,
        status TEXT DEFAULT 'Active',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 5. Missions Table (User-Owned)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS missions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        mission_name TEXT NOT NULL,
        base_port TEXT NOT NULL,
        destination_zone TEXT NOT NULL,
        departure_time TEXT NOT NULL,
        expected_return TEXT NOT NULL,
        eta_countdown TEXT DEFAULT '3 hours 15 minutes',
        status TEXT DEFAULT 'FISHING_ACTIVE',
        share_with_family INTEGER DEFAULT 1,
        authorized_contact_ids TEXT DEFAULT '[]',
        vessel_json TEXT DEFAULT '{}',
        connectivity_json TEXT DEFAULT '{}',
        smart_updates_json TEXT DEFAULT '[]',
        sos_incident_json TEXT DEFAULT 'null',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 6. Scientific AI Query History (User-Owned)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scientific_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        query TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        target_zone TEXT,
        confidence INTEGER,
        response_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 7. Personal Marine Memory (User-Owned)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS marine_memory (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        vessel_id TEXT,
        skipper TEXT,
        voyages_logged INTEGER DEFAULT 0,
        total_sea_hours REAL DEFAULT 0.0,
        total_catch_recorded_kg REAL DEFAULT 0.0,
        memory_json TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 8. Marine AI Conversations & Messages (ChatGPT-style User Threads)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL, -- 'user' | 'assistant' | 'system'
        content TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata_json TEXT DEFAULT '{}',
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, updated_at DESC);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at ASC);")

    # Legacy flat marine_conversations table (preserved for backward compatibility)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS marine_conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_id TEXT,
        role TEXT NOT NULL, -- 'user' | 'assistant'
        message TEXT NOT NULL,
        metadata_json TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 9. Safety & SOS Events Table (User-Owned)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS safety_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        event_type TEXT NOT NULL, -- 'SOS', 'HAZARD_ALERT', 'ZONE_ENTRY', 'WEATHER_WARNING', 'CHECK_IN'
        severity TEXT DEFAULT 'INFO', -- 'INFO', 'WARNING', 'CRITICAL'
        title TEXT NOT NULL,
        description TEXT,
        telemetry_json TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 10. Saved Routes & Locations (User-Owned)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS saved_routes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        route_name TEXT NOT NULL,
        departure_port TEXT NOT NULL,
        destination_zone TEXT NOT NULL,
        waypoints_json TEXT NOT NULL,
        distance_nm REAL DEFAULT 0.0,
        estimated_duration_hours REAL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 11. Authority Hazards (Real Cyclone / Storm Surge / Tsunami / High Sea State Intelligence)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS authority_hazards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        hazard_type TEXT NOT NULL, -- 'CYCLONE', 'STORM_SURGE', 'EXTREME_WAVE', 'GALE_FORCE_WIND', 'TSUNAMI_WARNING'
        category_name TEXT NOT NULL, -- 'Severe Cyclonic Storm (VSCS)', 'Depression', 'Deep Depression', 'Very Severe'
        severity TEXT NOT NULL, -- 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'
        status TEXT NOT NULL, -- 'ACTIVE', 'MONITORING', 'DISSIPATING', 'ARCHIVED'
        current_lat REAL NOT NULL,
        current_lon REAL NOT NULL,
        current_speed_knots REAL NOT NULL,
        direction_deg REAL NOT NULL,
        direction_text TEXT NOT NULL, -- '315° NW', '045° NE'
        central_pressure_hpa REAL NOT NULL,
        max_sustained_wind_kmh REAL NOT NULL,
        max_gust_kmh REAL NOT NULL,
        significant_wave_height_m REAL NOT NULL,
        peak_wave_period_s REAL NOT NULL,
        storm_surge_m REAL NOT NULL,
        core_radius_nm REAL NOT NULL,
        risk_score INTEGER NOT NULL, -- 0 to 100
        alert_level TEXT NOT NULL, -- 'RED', 'ORANGE', 'YELLOW', 'GREEN'
        affected_population INTEGER NOT NULL,
        affected_vessels_count INTEGER NOT NULL,
        telemetry_source TEXT DEFAULT 'Open-Meteo ECMWF & IMD/INCOIS Coastal Mesh',
        details_json TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 12. Hazard Historical & Projected Trajectory Tracks
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hazard_tracks (
        id TEXT PRIMARY KEY,
        hazard_id TEXT NOT NULL,
        track_type TEXT NOT NULL, -- 'HISTORICAL', 'CURRENT', 'PREDICTED_6H', 'PREDICTED_12H', 'PREDICTED_24H', 'PREDICTED_48H'
        timestamp_iso TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        speed_knots REAL NOT NULL,
        wind_kmh REAL NOT NULL,
        wave_m REAL NOT NULL,
        pressure_hpa REAL NOT NULL,
        cone_radius_nm REAL NOT NULL,
        FOREIGN KEY (hazard_id) REFERENCES authority_hazards(id) ON DELETE CASCADE
    );
    """)

    # 13. Coastal Impact Zones (Active Impact, Next Predicted, Watch Zones)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS affected_zones (
        id TEXT PRIMARY KEY,
        hazard_id TEXT NOT NULL,
        zone_name TEXT NOT NULL,
        state_or_region TEXT NOT NULL,
        zone_type TEXT NOT NULL, -- 'ACTIVE_IMPACT', 'NEXT_PREDICTED', 'WATCH_ZONE'
        severity TEXT NOT NULL, -- 'CRITICAL', 'HIGH', 'MODERATE'
        eta_hours REAL NOT NULL,
        expected_wind_kmh REAL NOT NULL,
        expected_wave_m REAL NOT NULL,
        expected_surge_m REAL NOT NULL,
        coastal_length_km REAL NOT NULL,
        population_exposed INTEGER NOT NULL,
        vessels_in_zone INTEGER NOT NULL,
        polygon_coords_json TEXT NOT NULL,
        evacuation_status TEXT NOT NULL, -- 'MANDATORY_EVACUATION', 'VOLUNTARY_SHELTER', 'ADVISORY_MONITORING'
        harbor_warning_signal TEXT NOT NULL, -- 'SIGNAL_9_GREAT_DANGER', 'SIGNAL_8', 'SIGNAL_4'
        FOREIGN KEY (hazard_id) REFERENCES authority_hazards(id) ON DELETE CASCADE
    );
    """)

    # 14. Designated Safe Zones & Shelters
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS safe_zones (
        id TEXT PRIMARY KEY,
        zone_name TEXT NOT NULL,
        harbor_type TEXT NOT NULL, -- 'DEEP_WATER_PORT', 'LEE_SHELTER', 'INLAND_ESTUARY', 'ANCHORAGE'
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        capacity_vessels INTEGER NOT NULL,
        current_occupancy INTEGER NOT NULL,
        wind_protection_rating TEXT NOT NULL, -- 'EXCELLENT', 'HIGH', 'MODERATE'
        sea_state_calm_m REAL NOT NULL,
        distance_nm_from_hazard REAL NOT NULL,
        contact_channel TEXT NOT NULL,
        is_active INTEGER DEFAULT 1
    );
    """)

    # 15. Tracked Vessels (Distress, High Risk, In Port, Coast Guard Cutters)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS authority_vessels (
        id TEXT PRIMARY KEY,
        vessel_name TEXT NOT NULL,
        registration TEXT NOT NULL,
        vessel_type TEXT NOT NULL,
        category TEXT NOT NULL, -- 'CRITICAL_DISTRESS', 'HIGH_RISK', 'SAFE_IN_PORT', 'RESCUE_VESSEL'
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        speed_knots REAL NOT NULL,
        heading_deg REAL NOT NULL,
        crew_count INTEGER NOT NULL,
        skipper_name TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        vhf_channel TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        distress_reason TEXT,
        distance_to_hazard_nm REAL NOT NULL,
        eta_to_safe_port TEXT NOT NULL,
        last_telemetry_time TEXT NOT NULL
    );
    """)

    # 16. Rescue Resources & Assets (ICG Cutters, Aircraft, Helicopters, Fast Interceptors)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rescue_resources (
        id TEXT PRIMARY KEY,
        asset_name TEXT NOT NULL,
        asset_type TEXT NOT NULL, -- 'COAST_GUARD_OPV', 'FAST_PATROL_VESSEL', 'SAR_HELICOPTER', 'DORNIER_AIRCRAFT', 'MARINE_POLICE_CUTTER'
        base_station TEXT NOT NULL,
        current_lat REAL NOT NULL,
        current_lon REAL NOT NULL,
        status TEXT NOT NULL, -- 'READY_PATROL', 'DISPATCHED', 'STANDBY', 'UNDER_MAINTENANCE'
        speed_max_knots REAL NOT NULL,
        operational_range_nm REAL NOT NULL,
        crew_complement INTEGER NOT NULL,
        commanding_officer TEXT NOT NULL,
        assigned_target_vessel_id TEXT,
        response_eta_min INTEGER NOT NULL
    );
    """)

    # 17. Authority Alerts & Official Bulletins
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS authority_alerts (
        id TEXT PRIMARY KEY,
        hazard_id TEXT,
        alert_level TEXT NOT NULL, -- 'CRITICAL', 'WARNING', 'ADVISORY', 'ALL_CLEAR'
        alert_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        target_sectors_json TEXT NOT NULL,
        issue_time TEXT NOT NULL,
        bulletin_no TEXT NOT NULL,
        issued_by TEXT NOT NULL,
        is_active INTEGER DEFAULT 1
    );
    """)

    # 18. Structured Response Directives & Recommendations
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS response_recommendations (
        id TEXT PRIMARY KEY,
        hazard_id TEXT NOT NULL,
        priority TEXT NOT NULL, -- 'IMMEDIATE', 'HIGH', 'MEDIUM', 'ROUTINE'
        category TEXT NOT NULL, -- 'EVACUATION', 'FISHING_BAN', 'PORT_WARNING', 'SAR_DISPATCH', 'SHELTER_ADVISORY'
        action_directive TEXT NOT NULL,
        rationale TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        evidence_json TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING_APPROVAL',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 19. Historical Hazard Analogs & Lessons Learned
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hazard_history_records (
        id TEXT PRIMARY KEY,
        event_name TEXT NOT NULL,
        year INTEGER NOT NULL,
        peak_category TEXT NOT NULL,
        landfall_location TEXT NOT NULL,
        peak_wind_kmh REAL NOT NULL,
        max_surge_m REAL NOT NULL,
        mortality_prevention_rate REAL NOT NULL,
        lessons_learned_json TEXT NOT NULL,
        analog_similarity_pct REAL NOT NULL
    );
    """)

    # 20. Multi-Agent Pipeline Runs & Telemetry Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS agent_pipeline_runs (
        id TEXT PRIMARY KEY,
        trigger_type TEXT NOT NULL, -- 'AUTO_POLL', 'MANUAL_DISPATCH', 'CRITICAL_EVENT'
        status TEXT NOT NULL, -- 'SUCCESS', 'IN_PROGRESS', 'FAILED'
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        duration_ms INTEGER NOT NULL,
        agents_log_json TEXT NOT NULL,
        summary_json TEXT NOT NULL
    );
    """)

    conn.commit()

    # Seed Default Demo User if database is freshly created
    cursor.execute("SELECT id FROM users WHERE email = 'demo@marine-ai.io'")
    demo_user = cursor.fetchone()
    if not demo_user:
        seed_demo_user(cursor)
        conn.commit()

    # Seed Default Authority User and Hazard Intelligence if not present
    cursor.execute("SELECT id FROM users WHERE email = 'authority@marine-ai.io'")
    auth_user = cursor.fetchone()
    if not auth_user:
        seed_authority_data(cursor)
        conn.commit()

    conn.close()
    sync_db_mirrors()

def seed_demo_user(cursor):
    """Seeds an initial demo user so existing demo tests run seamlessly."""
    demo_id = "usr_demo_001"
    hashed_pwd = bcrypt.hashpw("marineai2026".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    cursor.execute("""
    INSERT INTO users (
        id, name, email, phone, password_hash, base_port, vessel_name, vessel_reg, vessel_type, preferred_language
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        demo_id,
        "K. Murugan (Master Fisher)",
        "demo@marine-ai.io",
        "+91 98480 23119",
        hashed_pwd,
        "Rameswaram Fishing Harbor",
        "Matsya-Varuna",
        "IND-TN-09-MM-4421",
        "Mechanized Wooden Trawler (14m)",
        "en"
    ))

    # Seed contacts for demo user
    demo_contacts = [
        ("c-demo-1", demo_id, "Amma", "Mother (Primary Emergency)", "+91 98765 43210", 1, 1, 1, 1, "Active", "Home shore emergency kin"),
        ("c-demo-2", demo_id, "Nanna", "Father (Secondary Contact)", "+91 91234 56789", 1, 1, 0, 1, "Active", "Harbour arrival notification"),
        ("c-demo-3", demo_id, "V. Naidu", "Harbour Master (Port Authority)", "+91 891 256 8920", 1, 0, 1, 1, "Active", "Coast Guard VHF liaison")
    ]
    cursor.executemany("""
    INSERT INTO family_contacts (
        id, user_id, name, relationship, phone, notify_sms, notify_whatsapp, is_emergency_priority, is_authorized_for_trip, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, demo_contacts)

    # Seed active mission for demo user
    vessel_data = {
        "id": "IND-TN-09-MM-4421",
        "name": "Matsya-Varuna",
        "registration": "IND-TN-09-MM-4421",
        "type": "Mechanized Wooden Trawler (14m)",
        "captain": "K. Murugan (Master Fisher)",
        "crew_count": 5
    }
    connectivity_data = {
        "state": "LIMITED",
        "connection_label": "Limited — NavIC Coastal Satellite Only",
        "is_live_tracking": False,
        "last_known_location": {
            "latitude": 15.24,
            "longitude": 82.16,
            "distance_from_port_nm": 14.2,
            "bearing_from_port": "14.2 NM Offshore • 120° SE",
            "updated_at": "Live Telemetry via NavIC-L5",
            "timestamp": "11:55 IST"
        },
        "dead_zone_entered_at_nm": 14.0,
        "cellular_status": "No 4G/LTE (Beyond 14 NM Perimeter)",
        "satellite_uplink": "NavIC-L5 Beacon Active (15-min burst interval)"
    }
    smart_updates_data = [
        {
            "id": "upd-001",
            "type": "TRIP_STARTED",
            "badge_color": "emerald",
            "title": "Trip Started",
            "time": "05:30 IST",
            "message": "Matsya-Varuna departed port with 5 crew on board.",
            "dispatched_to": ["Amma", "Nanna", "V. Naidu"]
        },
        {
            "id": "upd-002",
            "type": "MISSION_UPDATE",
            "badge_color": "blue",
            "title": "Reached Fishing Zone",
            "time": "11:55 IST",
            "message": "Vessel reached predicted fishing zone safely (14.2 NM offshore). Calm sea swell (1.1m).",
            "dispatched_to": ["Amma", "Nanna", "V. Naidu"]
        }
    ]

    cursor.execute("""
    INSERT INTO missions (
        id, user_id, mission_name, base_port, destination_zone, departure_time, expected_return, status, share_with_family, authorized_contact_ids, vessel_json, connectivity_json, smart_updates_json, sos_incident_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "mis-demo-001",
        demo_id,
        "Palk Bay Pelagic Intercept (Plan B)",
        "Rameswaram Fishing Harbor",
        "Palk Bay Thermal Edge (Zone B • 14.2 NM Offshore)",
        "Today, 05:30 IST",
        "Today, 18:00 IST",
        "FISHING_ACTIVE",
        1,
        json.dumps(["c-demo-1", "c-demo-2", "c-demo-3"]),
        json.dumps(vessel_data),
        json.dumps(connectivity_data),
        json.dumps(smart_updates_data),
        "null"
    ))

    # Seed marine memory for demo user
    cursor.execute("""
    INSERT INTO marine_memory (
        id, user_id, vessel_id, skipper, voyages_logged, total_sea_hours, total_catch_recorded_kg, memory_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "mem-demo-001",
        demo_id,
        "IND-TN-09-MM-4421",
        "K. Murugan (Master Fisher)",
        142,
        1184.5,
        48250.0,
        json.dumps({"frequent_zones": ["Palk Bay Thermal Edge #4", "Gulf of Mannar Confluence"]})
    ))

def seed_authority_data(cursor):
    """Seeds authority command user, active hazard, tracks, zones, vessels, assets, alerts, and recommendations."""
    auth_id = "usr_auth_001"
    hashed_pwd = bcrypt.hashpw("authority2026".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # 1. Authority User
    cursor.execute("""
    INSERT OR REPLACE INTO users (
        id, name, email, phone, password_hash, base_port, vessel_name, vessel_reg, vessel_type, preferred_language, role
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        auth_id,
        "Commander S. R. Ramanathan (CG Operations)",
        "authority@marine-ai.io",
        "+91 891 256 8800",
        hashed_pwd,
        "Visakhapatnam Maritime Operations Command (INCOIS / ICG)",
        "ICGS Samarth (SAR Flagship)",
        "ICG-CG-01-OPV",
        "Coast Guard Offshore Patrol Vessel (105m)",
        "en",
        "authority"
    ))

    # 2. Authority Active Hazard: Severe Cyclonic Storm VARUNA-04B
    haz_id = "haz_varuna_04b"
    details_data = {
        "eye_diameter_km": 24.0,
        "central_pressure_deficit_hpa": 24.0,
        "sea_surface_temp_c": 30.6,
        "sst_anomaly_c": 1.8,
        "coriolis_parameter": "f = 3.9e-5 s^-1",
        "convective_banding_intensity": "T-4.5 (Dvorak Technique)",
        "incois_buoy_id": "BD-08 (West Central Bay of Bengal)",
        "imd_bulletin_reference": "BOB/04/2026/08",
        "storm_translation_vector": "14.2 knots along 315 deg azimuth",
        "radius_of_maximum_winds_km": 32.0,
        "coastal_surge_height_m": 2.8,
        "astronomical_tide_high_m": 1.25,
        "total_inundation_water_level_m": 4.05
    }

    cursor.execute("""
    INSERT OR REPLACE INTO authority_hazards (
        id, name, hazard_type, category_name, severity, status,
        current_lat, current_lon, current_speed_knots, direction_deg, direction_text,
        central_pressure_hpa, max_sustained_wind_kmh, max_gust_kmh,
        significant_wave_height_m, peak_wave_period_s, storm_surge_m, core_radius_nm,
        risk_score, alert_level, affected_population, affected_vessels_count,
        telemetry_source, details_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        haz_id,
        "Severe Cyclonic Storm VARUNA-04B",
        "CYCLONE",
        "Severe Cyclonic Storm (VSCS)",
        "CRITICAL",
        "ACTIVE",
        15.85, 83.42, 14.2, 315.0, "315° NW (Towards Kakinada-Yanam Corridor)",
        978.0, 125.0, 150.0,
        4.8, 12.5, 2.8, 45.0,
        88, "RED", 245000, 28,
        "Open-Meteo ECMWF, INCOIS Buoy BD-08 & IMD Coastal Doppler Mesh",
        json.dumps(details_data)
    ))

    # 3. Hazard Trajectory Tracks (Historical + Predicted Cones)
    tracks = [
        ("trk-1", haz_id, "HISTORICAL", "2026-09-28T02:00:00Z", 14.10, 84.80, 12.0, 95.0, 3.2, 992.0, 10.0),
        ("trk-2", haz_id, "HISTORICAL", "2026-09-28T08:00:00Z", 14.95, 84.10, 13.5, 110.0, 4.0, 985.0, 12.0),
        ("trk-3", haz_id, "CURRENT",    "2026-09-28T14:00:00Z", 15.85, 83.42, 14.2, 125.0, 4.8, 978.0, 15.0),
        ("trk-4", haz_id, "PREDICTED_6H",  "2026-09-28T20:00:00Z", 16.45, 82.80, 14.0, 130.0, 5.2, 974.0, 25.0),
        ("trk-5", haz_id, "PREDICTED_12H", "2026-09-29T02:00:00Z", 16.98, 82.25, 13.0, 135.0, 5.6, 970.0, 38.0),
        ("trk-6", haz_id, "PREDICTED_24H", "2026-09-29T14:00:00Z", 17.65, 81.60, 11.5, 90.0, 2.8, 990.0, 65.0),
        ("trk-7", haz_id, "PREDICTED_48H", "2026-09-30T14:00:00Z", 18.80, 81.10, 9.0, 45.0, 1.2, 1002.0, 110.0)
    ]
    cursor.executemany("""
    INSERT OR REPLACE INTO hazard_tracks (
        id, hazard_id, track_type, timestamp_iso, latitude, longitude, speed_knots, wind_kmh, wave_m, pressure_hpa, cone_radius_nm
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, tracks)

    # 4. Coastal Affected Zones
    zones = [
        (
            "zn-1", haz_id, "Kakinada - Godavari Delta Sector", "Andhra Pradesh",
            "ACTIVE_IMPACT", "CRITICAL", 4.2, 130.0, 5.2, 2.8, 115.0, 142000, 18,
            json.dumps([[16.70, 82.10], [17.15, 82.35], [16.85, 82.60], [16.45, 82.30]]),
            "MANDATORY_EVACUATION", "SIGNAL_9_GREAT_DANGER"
        ),
        (
            "zn-2", haz_id, "Visakhapatnam Urban Coastal Sector", "Andhra Pradesh",
            "NEXT_PREDICTED", "HIGH", 11.5, 115.0, 4.2, 1.9, 85.0, 78000, 7,
            json.dumps([[17.50, 83.15], [17.85, 83.45], [17.65, 83.70], [17.30, 83.35]]),
            "VOLUNTARY_SHELTER", "SIGNAL_8_GREAT_DANGER"
        ),
        (
            "zn-3", haz_id, "Machilipatnam - Krishna Estuary", "Andhra Pradesh",
            "WATCH_ZONE", "HIGH", 6.0, 95.0, 3.8, 1.4, 90.0, 25000, 3,
            json.dumps([[15.95, 80.95], [16.30, 81.30], [16.05, 81.50], [15.75, 81.10]]),
            "ADVISORY_MONITORING", "SIGNAL_4_WARNING"
        ),
        (
            "zn-4", haz_id, "North Chennai - Pulicat Coastal Sector", "Tamil Nadu",
            "WATCH_ZONE", "MODERATE", 14.0, 65.0, 2.9, 0.8, 65.0, 12000, 0,
            json.dumps([[13.20, 80.20], [13.60, 80.35], [13.40, 80.60], [13.05, 80.40]]),
            "ADVISORY_MONITORING", "SIGNAL_3_ALERT"
        )
    ]
    cursor.executemany("""
    INSERT OR REPLACE INTO affected_zones (
        id, hazard_id, zone_name, state_or_region, zone_type, severity, eta_hours,
        expected_wind_kmh, expected_wave_m, expected_surge_m, coastal_length_km,
        population_exposed, vessels_in_zone, polygon_coords_json, evacuation_status, harbor_warning_signal
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, zones)

    # 5. Designated Safe Zones & Refuges
    safe_zones = [
        ("sz-1", "Paradip North Deep Shelter", "DEEP_WATER_PORT", 20.26, 86.68, 120, 45, "EXCELLENT", 0.8, 290.0, "VHF Ch 16 / 12", 1),
        ("sz-2", "Krishnapatnam Lee Haven", "LEE_SHELTER", 14.25, 80.12, 85, 62, "HIGH", 1.1, 210.0, "VHF Ch 16 / 09", 1),
        ("sz-3", "Kalingapatnam Inner Basin", "INLAND_ESTUARY", 18.33, 84.12, 40, 22, "HIGH", 0.9, 155.0, "VHF Ch 16 / 68", 1),
        ("sz-4", "Tuticorin Marine Basin", "DEEP_WATER_PORT", 8.75, 78.18, 150, 38, "EXCELLENT", 0.6, 460.0, "VHF Ch 16 / 14", 1)
    ]
    cursor.executemany("""
    INSERT OR REPLACE INTO safe_zones (
        id, zone_name, harbor_type, latitude, longitude, capacity_vessels, current_occupancy,
        wind_protection_rating, sea_state_calm_m, distance_nm_from_hazard, contact_channel, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, safe_zones)

    # 6. Authority Tracked Vessels
    vessels = [
        (
            "v-auth-01", "Matsya-Krupa", "IND-AP-03-MM-1102", "Mechanized Wooden Trawler (15m)",
            "CRITICAL_DISTRESS", 16.12, 83.15, 0.5, 340.0, 6, "P. Apparao", "+91 98481 10293", "VHF 16",
            96, "Rudder damaged + auxiliary engine flooded; drifting into inner storm core", 22.0, "8.0 hrs (Tow Required)",
            "2026-09-28T14:10:00Z"
        ),
        (
            "v-auth-02", "Samudra-Jyoti", "IND-AP-07-GM-2041", "FRP Gillnetter (11m)",
            "CRITICAL_DISTRESS", 15.60, 82.95, 2.1, 280.0, 4, "M. Ramana", "+91 94402 88410", "VHF 16",
            89, "Fuel reserve critically low; active bilge pumping against 4.5m beam sea", 38.0, "5.5 hrs (Tow Escort)",
            "2026-09-28T14:05:00Z"
        ),
        (
            "v-auth-03", "Sri-Kalyani", "IND-AP-04-MM-8840", "Steel Stern Trawler (18m)",
            "HIGH_RISK", 16.48, 82.60, 6.8, 290.0, 7, "T. Venkat", "+91 99890 33112", "VHF 14",
            74, "Speed restricted due to heavy head seas; navigating towards Kakinada lee", 42.0, "2.2 hrs to Kakinada Port",
            "2026-09-28T14:12:00Z"
        ),
        (
            "v-auth-04", "Sagar-Ratna", "IND-TN-02-MM-3109", "Longliner Vessel (16m)",
            "HIGH_RISK", 15.10, 82.30, 7.5, 220.0, 5, "S. Elango", "+91 98410 44521", "VHF 12",
            68, "Steaming south-southwest towards Krishnapatnam safe lee haven", 55.0, "4.8 hrs to Krishnapatnam",
            "2026-09-28T14:08:00Z"
        ),
        (
            "v-auth-05", "Ganga-1", "IND-AP-01-MM-0012", "Mechanized Trawler (14m)",
            "SAFE_IN_PORT", 16.98, 82.25, 0.0, 0.0, 0, "B. Satyam", "+91 94901 22910", "VHF 16",
            12, "Safely berthed with four-point storm mooring at Kakinada Fishery Wharf", 68.0, "Berthed Securely",
            "2026-09-28T13:45:00Z"
        ),
        (
            "v-auth-06", "ICGS Samarth", "ICG-CG-01-OPV", "Offshore Patrol Vessel (105m)",
            "RESCUE_VESSEL", 16.35, 82.90, 22.0, 135.0, 85, "Capt. S. Nair", "+91 891 256 9911", "VHF 16/06",
            15, "Steaming on high-speed SAR intercept to distressed Trawler Matsya-Krupa", 28.0, "On SAR Intercept",
            "2026-09-28T14:14:00Z"
        )
    ]
    cursor.executemany("""
    INSERT OR REPLACE INTO authority_vessels (
        id, vessel_name, registration, vessel_type, category, latitude, longitude, speed_knots,
        heading_deg, crew_count, skipper_name, contact_phone, vhf_channel, risk_score,
        distress_reason, distance_to_hazard_nm, eta_to_safe_port, last_telemetry_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, vessels)

    # 7. Rescue Assets & Resources
    resources = [
        ("res-1", "ICGS Samarth (OPV)", "COAST_GUARD_OPV", "Visakhapatnam Naval Base", 16.35, 82.90, "DISPATCHED", 24.0, 6000.0, 85, "Capt. S. Nair", "v-auth-01", 35),
        ("res-2", "ICGS Rani Abbakka (FPV)", "FAST_PATROL_VESSEL", "Kakinada Port Station", 16.92, 82.30, "READY_PATROL", 33.0, 1500.0, 34, "Lt. Cmdr. D. Paul", "v-auth-02", 52),
        ("res-3", "Coast Guard Chetak CG-802", "SAR_HELICOPTER", "INS Dega Air Station", 17.72, 83.22, "STANDBY", 110.0, 280.0, 4, "Sqn Ldr A. Joshi", "v-auth-01", 28),
        ("res-4", "Dornier-228 Recon CG-751", "DORNIER_AIRCRAFT", "Chennai Air Enclave", 12.99, 80.17, "READY_PATROL", 220.0, 1300.0, 6, "Wing Cmdr V. Rao", None, 25),
        ("res-5", "Marine Police Interceptor MP-14", "MARINE_POLICE_CUTTER", "Machilipatnam Marine Police", 16.18, 81.15, "READY_PATROL", 35.0, 200.0, 8, "Sub-Insp. G. Mohan", "v-auth-04", 45)
    ]
    cursor.executemany("""
    INSERT OR REPLACE INTO rescue_resources (
        id, asset_name, asset_type, base_station, current_lat, current_lon, status,
        speed_max_knots, operational_range_nm, crew_complement, commanding_officer,
        assigned_target_vessel_id, response_eta_min
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, resources)

    # 8. Authority Alerts
    alerts = [
        (
            "alt-red-01", haz_id, "CRITICAL", "CYCLONE_LANDFALL_WARNING",
            "Great Danger Port Signal No. 9 hoisted for Kakinada & Visakhapatnam",
            "Severe Cyclonic Storm Varuna-04B moving NW at 14 knots with central winds of 125 km/h. Coastal landfall expected within 12 hours. Suspend all port, shipping, and fishing operations immediately.",
            json.dumps(["Kakinada", "Visakhapatnam", "Yanam", "Machilipatnam"]),
            "2026-09-28T14:00:00Z", "Bulletin No. 06 / 14:00 IST", "IMD-INCOIS-ICG Joint Cyclone Operations", 1
        ),
        (
            "alt-org-02", haz_id, "WARNING", "HIGH_SWELL_SURGE",
            "Storm Surge Inundation Warning: 2.8m above Astronomical Tide",
            "Low-lying coastal settlements from Uppada to Hope Island face imminent seawater inundation during high tide at 18:30 IST. Evacuation of beach villages mandatory.",
            json.dumps(["Uppada", "Hope Island", "Kakinada Beach", "Kottapatnam"]),
            "2026-09-28T13:30:00Z", "Bulletin No. 04 / 13:30 IST", "INCOIS Ocean Hazard Division", 1
        ),
        (
            "alt-sar-03", haz_id, "CRITICAL", "SAR_EMERGENCY",
            "Active SAR Intercept: Trawler Matsya-Krupa in Storm Core",
            "Vessel disabled 22 NM offshore Kakinada with 6 crew aboard. ICGS Samarth and Chetak CG-802 dispatched on Code Red Priority rescue intercept.",
            json.dumps(["Offshore Kakinada Sector", "Sector Bravo-4"]),
            "2026-09-28T14:15:00Z", "Incident #SAR-2026-089 / 14:15 IST", "MRCC Visakhapatnam", 1
        )
    ]
    cursor.executemany("""
    INSERT OR REPLACE INTO authority_alerts (
        id, hazard_id, alert_level, alert_type, title, description,
        target_sectors_json, issue_time, bulletin_no, issued_by, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, alerts)

    # 9. Structured Response Directives & Recommendations
    recs = [
        (
            "rec-01", haz_id, "IMMEDIATE", "SAR_DISPATCH",
            "Authorize ICGS Samarth High-Speed Intercept to Trawler Matsya-Krupa (IND-AP-03-MM-1102)",
            "Disabled vessel with 6 souls drifting directly into eye wall path. Estimated survivability envelope under 3 hours without tow intercept.",
            97.4, json.dumps({"target": "IND-AP-03-MM-1102", "bearing": "135 deg", "range_nm": 14.8, "sea_state": "Sea State 6 (4.8m swell)"}),
            "APPROVED"
        ),
        (
            "rec-02", haz_id, "IMMEDIATE", "EVACUATION",
            "Issue Mandatory Coastal Evacuation of Uppada and Hope Island Low-Lying Hamlets",
            "Astronomical high tide (1.25m) combined with 2.8m storm surge will breach shoreline sea walls by +1.4m starting 17:30 IST.",
            94.8, json.dumps({"projected_surge": "2.8m", "high_tide_time": "18:30 IST", "vulnerable_population": 42000}),
            "PENDING_APPROVAL"
        ),
        (
            "rec-03", haz_id, "HIGH", "FISHING_BAN",
            "Enforce Absolute Maritime Exclusion Perimeter within 150 NM of Bay Center",
            "Prevents remaining 11 mechanized trawlers from exiting port; orders 2 high-risk vessels to seek immediate lee shelter at Krishnapatnam.",
            99.1, json.dumps({"exclusion_radius_nm": 150, "vessels_diverted": 2, "ports_closed": ["Kakinada", "Visakhapatnam", "Machilipatnam"]}),
            "APPROVED"
        ),
        (
            "rec-04", haz_id, "MEDIUM", "SHELTER_ADVISORY",
            "Activate Storm Relief Shelters #1 through #14 in East Godavari & Krishna Districts",
            "Pre-position medical supplies, diesel dewatering pumps, and satellite sat-phones at all designated multi-purpose cyclone shelters.",
            91.0, json.dumps({"shelters_activated": 14, "district_teams": ["NDRF 10th Bn", "AP SDRF", "District Fire Services"]}),
            "PENDING_APPROVAL"
        )
    ]
    cursor.executemany("""
    INSERT OR REPLACE INTO response_recommendations (
        id, hazard_id, priority, category, action_directive, rationale,
        confidence_score, evidence_json, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, recs)

    # 10. Historical Analogs
    history = [
        (
            "hist-01", "Cyclone Michaung", 2023, "Severe Cyclonic Storm (VSCS)", "Bapatla (Andhra Coast)",
            110.0, 2.1, 99.4,
            json.dumps(["Early harbor evacuation prevented vessel collisions against concrete wharves", "Continuous NavIC broadcasts reached deep-sea trawlers 36 hours prior to gale onset"]),
            88.5
        ),
        (
            "hist-02", "Cyclone Hudhud", 2014, "Extremely Severe Cyclonic Storm (ESCS)", "Visakhapatnam Coast",
            185.0, 3.8, 96.2,
            json.dumps(["High urban radar telemetry prevented fishing casualties offshore", "Underground utility hardening proved essential for post-storm port recovery"]),
            82.0
        ),
        (
            "hist-03", "Cyclone Gulab", 2021, "Cyclonic Storm", "Kalingapatnam",
            95.0, 1.6, 98.7,
            json.dumps(["Lee shelter diversion of 44 mechanized craft to Paradip was fully successful", "Estuary bar mouth sand clearing prevented localized backwater flooding"]),
            79.4
        )
    ]
    cursor.executemany("""
    INSERT OR REPLACE INTO hazard_history_records (
        id, event_name, year, peak_category, landfall_location, peak_wind_kmh, max_surge_m,
        mortality_prevention_rate, lessons_learned_json, analog_similarity_pct
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, history)

# Execute init on import
init_db()
