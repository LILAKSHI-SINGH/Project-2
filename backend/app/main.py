import os
import sys
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add parent directory to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.database import engine, Base
from app.routes import prediction, detections, statistics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("zero_day_xai")

# Initialize SQLite database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Explainable AI Zero-Day Attack Detection Framework",
    description="Backend API service combining Isolation Forest anomaly detection, Random Forest classification, and SHAP Explainable AI.",
    version="1.0.0"
)

# CORS configuration for React frontend
frontend_url = os.getenv("FRONTEND_URL", "").strip()
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if frontend_url:
    allowed_origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if frontend_url else ["*"],
    allow_credentials=bool(frontend_url),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler for clean error responses
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception caught on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "error": str(exc)}
    )

app.include_router(prediction.router)
app.include_router(detections.router)
app.include_router(statistics.router)

@app.get("/")
def read_root():
    return {
        "title": "Explainable AI-Based Framework for Detecting Zero-Day Cyber Attacks",
        "status": "Operational",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api")
def api_root():
    return {
        "status": "online",
        "message": "Explainable AI Detection API Base URL",
        "endpoints": {
            "health": "/api/health",
            "predict": "/api/predict",
            "analyze_csv": "/api/analyze-csv",
            "detections": "/api/detections",
            "statistics": "/api/statistics",
            "model_info": "/api/model-info",
            "docs": "/docs"
        }
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "service": "XAI Zero-Day Detection API"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
