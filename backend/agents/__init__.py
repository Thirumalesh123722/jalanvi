"""
Unified Multi-Agent Intelligence Layer for Marine AI & Aqua Intellect
Combines the 10 Aqua Intellect foundation agents with the Advanced Marine AI feature agents.
"""

from .orchestrator import OrchestratorAgent
from .alert_agent import AlertAgent
from .evidence_agent import EvidenceAgent
from .geospatial_agent import GeospatialAgent
from .marine_data_agent import MarineDataAgent
from .ocean_analytics_agent import OceanAnalyticsAgent
from .route_planner_agent import RoutePlannerAgent
from .safety_agent import SafetyAgent
from .visualization_agent import VisualizationAgent
from .weather_agent import WeatherAgent

# Advanced Marine AI Feature Agents
from .ai_challenger_agent import AIChallengerAgent
from .marine_scientist_agent import AIMarineScientistAgent
from .opportunity_agent import OpportunityAnalysisAgent
from .marine_memory_agent import MarineMemoryAgent
from .offline_pack_agent import OfflinePackAgent
from .explainability_agent import ExplainabilityAgent

# Aliases
Orchestrator = OrchestratorAgent
ChallengerAgent = AIChallengerAgent
ScientistAgent = AIMarineScientistAgent
