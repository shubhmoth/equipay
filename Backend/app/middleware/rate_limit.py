# app/middleware/rate_limit.py
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime, timedelta
import time
from typing import Dict, List, Optional, Callable, Any, Union
import logging

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware for FastAPI applications.
    
    Features:
    - In-memory rate limiting based on client IP or custom identifiers
    - Configurable rate limits per minute
    - Path exclusions for endpoints that should bypass rate limiting
    - Custom client key getter function support
    - Rate limit headers in responses
    """
    
    def __init__(
        self, 
        app,
        rate_limit_per_minute: int = 60,
        exclude_paths: List[str] = None,
        client_key_getter: Callable = None,  # Function to identify client (IP, user_id, etc.)
        rate_limit_window: int = 60,  # Window in seconds (default: 1 minute)
        block_duration: int = 0,  # Duration in seconds to block after limit exceeded (0 = no blocking)
        custom_response: Callable = None  # Custom response generator
    ):
        super().__init__(app)
        self.rate_limit_per_minute = rate_limit_per_minute
        self.exclude_paths = exclude_paths or []
        self.rate_limit_window = rate_limit_window
        self.block_duration = block_duration
        self.custom_response = custom_response
        
        # Default client key getter uses IP address
        self.client_key_getter = client_key_getter or (lambda r: self._get_client_ip(r))
        
        # In-memory storage for request timestamps
        # Structure: {client_key: [timestamp1, timestamp2, ...]}
        self.clients: Dict[str, List[float]] = {}
        
        # Storage for blocked clients
        # Structure: {client_key: unblock_time}
        self.blocked_clients: Dict[str, float] = {}
        
        logger.info(f"Rate limit middleware initialized with {rate_limit_per_minute} requests per minute")
    
    async def dispatch(self, request: Request, call_next):
        """Process the request through the rate limiting middleware."""
        # Skip rate limiting for excluded paths
        if await self._should_skip_rate_limit(request):
            return await call_next(request)
            
        # Get client identifier (IP address by default)
        client_key = self.client_key_getter(request)
        
        # Get current time
        now = time.time()
        
        # Check if client is blocked
        if client_key in self.blocked_clients:
            if now < self.blocked_clients[client_key]:
                # Client is still in block period
                return self._create_rate_limited_response(
                    request, 
                    reset_time=self.blocked_clients[client_key] - now
                )
            else:
                # Block period expired, remove from blocked list
                del self.blocked_clients[client_key]
        
        # Initialize client record if not exists
        if client_key not in self.clients:
            self.clients[client_key] = []
        
        # Remove timestamps older than the rate limit window
        self.clients[client_key] = [
            t for t in self.clients[client_key] 
            if now - t < self.rate_limit_window
        ]
        
        # Check if rate limit exceeded
        if len(self.clients[client_key]) >= self.rate_limit_per_minute:
            # If block duration is set, add client to blocked list
            if self.block_duration > 0:
                self.blocked_clients[client_key] = now + self.block_duration
                reset_time = self.block_duration
            else:
                # Calculate time until oldest request expires from window
                oldest_timestamp = min(self.clients[client_key])
                reset_time = oldest_timestamp + self.rate_limit_window - now
            
            # Log rate limit exceeded
            logger.warning(f"Rate limit exceeded for {client_key} on {request.url.path}")
            
            # Return rate limit exceeded response
            return self._create_rate_limited_response(request, reset_time)
        
        # Add current timestamp to client record
        self.clients[client_key].append(now)
        
        # Process the request
        response = await call_next(request)
        
        # Add rate limit headers to response
        remaining = self.rate_limit_per_minute - len(self.clients[client_key])
        response.headers["X-RateLimit-Limit"] = str(self.rate_limit_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(now + self.rate_limit_window))
        
        return response
    
    async def _should_skip_rate_limit(self, request: Request) -> bool:
        """Check if rate limiting should be skipped for this path."""
        return any(request.url.path.startswith(path) for path in self.exclude_paths)
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request with support for forwarded headers."""
        # Check multiple possible headers for IP
        for header in ["X-Forwarded-For", "X-Real-IP", "CF-Connecting-IP"]:
            if header in request.headers:
                ips = request.headers[header].split(",")
                return ips[0].strip()
        
        return request.client.host if request.client else "unknown"
    
    def _create_rate_limited_response(self, request: Request, reset_time: float):
        """Create rate limited response with appropriate headers."""
        if self.custom_response:
            return self.custom_response(request, reset_time)
        
        # Default rate limit response
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Try again in {int(reset_time)} seconds.",
            headers={
                "Retry-After": str(int(reset_time)),
                "X-RateLimit-Limit": str(self.rate_limit_per_minute),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(time.time() + reset_time)),
            },
        )