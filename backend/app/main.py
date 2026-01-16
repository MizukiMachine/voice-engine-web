from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.routers import settings, memory, simulation, google_integration, vision


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up Voice Engine Studio Backend...")
    yield
    # Shutdown
    print("Shutting down Voice Engine Studio Backend...")


app = FastAPI(
    title="Voice Engine Studio API",
    description="AI Voice Agent Web Prototype Backend",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS Configuration
settings_config = get_settings()
origins = settings_config.backend_cors_origins.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(memory.router, prefix="/api/memory", tags=["Memory"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["Simulation"])
app.include_router(google_integration.router, prefix="/api/google", tags=["Google Integration"])
app.include_router(vision.router, prefix="/api/vision", tags=["Vision"])


@app.get("/")
async def root():
    return {"message": "Voice Engine Studio API", "version": "0.1.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
