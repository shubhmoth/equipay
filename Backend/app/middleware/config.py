# app/middleware/config.py
"""
Middleware configuration for the FastAPI application.
This module contains functions to set up and configure all middleware components.
"""

import time
import logging
from typing import Dict, Any, List

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.middleware.auth import create_auth_middleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.core.config.settings import get_settings

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging request details including timing information."""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Process the request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log the request
        logger.info(
            f"{request.method} {request.url.path} {response.status_code} "
            f"({process_time:.4f}s) - {request.client.host}"
        )
        
        return response

async def add_security_headers(request: Request, call_next):
    """Middleware for adding security-related HTTP headers to responses."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

async def db_session_middleware(request: Request, call_next):
    """Middleware for adding a database session to the request state."""
    from app.db.database import get_db
    
    request.state.db = next(get_db())
    response = await call_next(request)
    request.state.db.close()
    return response

def setup_middlewares(app: FastAPI) -> None:
    """
    Configure and add all middleware components to the FastAPI application.
    
    The middleware stack is configured in a specific order:
    1. Request Logging - To log all requests, even those rejected by later middleware
    2. GZip Compression - To compress response bodies
    3. CORS - To handle cross-origin requests
    4. Rate Limiting - To prevent abuse
    5. Authentication - To verify user identity
    6. Database Session - To provide database access to endpoint handlers
    7. Security Headers - To add security headers to all responses
    
    Args:
        app: The FastAPI application instance
    """
    settings = get_settings()
    
    # 1. Request Logging Middleware
    try:
        app.add_middleware(RequestLoggingMiddleware)
        logger.info("Request logging middleware added")
    except Exception as e:
        logger.error(f"Failed to add request logging middleware: {str(e)}")
        raise
    
    # 2. GZip Compression Middleware
    try:
        app.add_middleware(GZipMiddleware, minimum_size=1000)
        logger.info("GZip compression middleware added")
    except Exception as e:
        logger.error(f"Failed to add GZip compression middleware: {str(e)}")
        raise
    
    # 3. CORS Middleware
    try:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.get_cors_origins,
            allow_credentials=True,
            allow_methods=settings.get_cors_methods,
            allow_headers=settings.get_cors_headers,
        )
        logger.info("CORS middleware added")
    except Exception as e:
        logger.error(f"Failed to add CORS middleware: {str(e)}")
        raise
    
    # 4. Rate Limiting Middleware
    try:
        # Use the RATE_LIMIT_PER_MINUTE from your API config
        rate_limit_per_minute = settings.RATE_LIMIT_PER_MINUTE
        # Reuse the AUTH_EXCLUDE_PATHS for consistency
        exclude_paths = settings.AUTH_EXCLUDE_PATHS
        
        app.add_middleware(
            RateLimitMiddleware,
            rate_limit_per_minute=rate_limit_per_minute,
            exclude_paths=exclude_paths,
        )
        logger.info(f"Rate limiting middleware added with limit of {rate_limit_per_minute} requests per minute")
    except Exception as e:
        logger.error(f"Failed to add rate limiting middleware: {str(e)}")
        raise
    
    # 5. Authentication Middleware
    try:
        auth_middleware_config = settings.get_auth_middleware_config
        app.add_middleware(
            create_auth_middleware(**auth_middleware_config)
        )
        logger.info("Authentication middleware added")
    except Exception as e:
        logger.error(f"Failed to add authentication middleware: {str(e)}")
        raise
    
    # 6. Database Session Middleware (using @app.middleware decorator)
    app.middleware("http")(db_session_middleware)
    logger.info("Database session middleware added")
    
    # 7. Security Headers Middleware (using @app.middleware decorator)
    app.middleware("http")(add_security_headers)
    logger.info("Security headers middleware added")
    
    logger.info("All middleware components successfully configured")