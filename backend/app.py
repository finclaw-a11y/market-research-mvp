from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import logging
import os
from dotenv import load_dotenv

# Import database and models
from database import engine, Base
from models import User, DataUpload, UploadedData, InsightAnalysis, Subscription

# Import routes
from routes import users, uploads, insights, subscriptions

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Market Research API",
    description="Automated market research tool with AI insights",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
)

# Include routers
app.include_router(users.router)
app.include_router(uploads.router)
app.include_router(insights.router)
app.include_router(subscriptions.router)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "market-research-api",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "message": "Market Research API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Market Research API starting up...")
    logger.info(f"Database: {os.getenv('DATABASE_URL', 'Not configured')}")
    logger.info(f"CORS Origins: {os.getenv('CORS_ORIGINS', 'http://localhost:3000')}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Market Research API shutting down...")

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
