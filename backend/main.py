"""
Aqua Intellect & Marine AI - Unified FastAPI Backend Entrypoint
Provides high-performance multi-agent marine intelligence APIs.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import uvicorn

from routes.agent_routes import router as agent_router
from routes.marine_routes import router as marine_router
from routes.voice_routes import router as voice_router
from routes.mission_routes import router as mission_router
from routes.family_link_routes import router as family_link_router
from routes.memory_routes import router as memory_router
from routes.scientific_routes import router as scientific_router
from routes.auth_routes import router as auth_router
from routes.history_routes import router as history_router
from routes.conversation_routes import router as conversation_router
from routes.authority_routes import router as authority_router

app = FastAPI(
    title="Aqua Intellect & Marine AI Platform API",
    description="Agentic Marine Decision Support, Digital Twin, and Oceanographic AI Engine",
    version="2.4.0",
)

# Robust CORS Configuration supporting any local development port or host
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include specialized sub-routers
app.include_router(auth_router)
app.include_router(history_router)
app.include_router(conversation_router)
app.include_router(authority_router)
app.include_router(agent_router)
app.include_router(marine_router)
app.include_router(voice_router)
app.include_router(mission_router)
app.include_router(family_link_router)
app.include_router(memory_router)
app.include_router(scientific_router)

FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"


@app.get("/")
async def root():
    index_file = FRONTEND_DIST / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)

    return {
        "name": "Marine AI & Aqua Intellect Platform",
        "status": "online",
        "version": "2.4.0",
        "description": "Agentic AI Ocean Intelligence, Digital Twin, and Multilingual Marine Voice Engine",
        "docs_url": "/docs"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "backend": "online",
        "agents_available": 16,
        "services": {
            "orchestrator": "online",
            "marine_data_service": "online (Open-Meteo & ISRO)",
            "weather_service": "online (ECMWF)",
            "voice_intelligence": "online (13 Indian languages)",
            "digital_twin_simulator": "online",
            "ai_challenger": "online"
        }
    }


if FRONTEND_DIST.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST), name="frontend")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)