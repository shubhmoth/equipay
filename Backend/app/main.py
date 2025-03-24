# app/main.py
import sys
import logging
import traceback

from fastapi import FastAPI, Depends, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.exc import SQLAlchemyError

from app.db.database import engine, async_engine
from app.core.config.settings import get_settings
from app.core.utils.function_execution import safe_execute
from app.startup import startup_event, shutdown_event
from app.db.initializer import (
    check_database_connection
)
from app.middleware.config import setup_middlewares

from app.api.v1.api import api_router

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

settings = safe_execute(get_settings, "Error loading settings")

# Initialize application
app = safe_execute(
    lambda: FastAPI(**settings.get_api_config),
    "Error initializing FastAPI app"
)

# Setup all middlewares
setup_middlewares(app)

# Add API router
app.include_router(api_router)

@app.get("/", response_class=HTMLResponse)
def read_root():
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Equipay</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                color: #333;
                text-align: center;
                padding: 50px;
            }
            h1 {
                color: #5a67d8;
            }
            p {
                font-size: 18px;
                margin-top: 20px;
            }
            a {
                text-decoration: none;
                color: #5a67d8;
                font-weight: bold;
            }
            a:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <h1>Welcome to Equipay</h1>
        <p>Your FastAPI application is running successfully!</p>
        <p>Visit the <a href="/docs">API Documentation</a> to explore your endpoints.</p>
    </body>
    </html>
    """
    return html_content

@app.get("/ping")
def ping():
    return {"message": "Pong!"}

@app.get("/health")
def health_check():
    """Health check endpoint that verifies database connectivity"""
    try:
        db_connected = check_database_connection(engine)
        return {
            "status": "healthy" if db_connected else "unhealthy",
            "database": "connected" if db_connected else "disconnected",
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.on_event("startup")
async def app_startup_event():
    """Run startup tasks when the application starts"""
    await startup_event(engine, async_engine, settings)

@app.on_event("shutdown")
async def app_shutdown_event():
    """Run tasks when the application shuts down"""
    await shutdown_event()

if __name__ == "__main__":
    try:
        import uvicorn
        port = getattr(settings, 'PORT', 8000)
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=port,
            reload=settings.is_development
        )
    except Exception as e:
        logger.error(f"❌ Error starting the server: {e}")
        traceback.print_exc()
        raise SystemExit(f"Error starting the server: {e}")