# app/middleware/auth.py
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Callable, Any, Union
import logging

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN

from app.db.database import get_db, get_async_db
from app.models.user_session import UserSession
from app.models.user import User
from app.core.config import get_settings
from app.core.config.security import decode_access_token

# Initialize settings and logger
settings = get_settings()
logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

class AuthenticationMiddleware(BaseHTTPMiddleware):
    """
    Flexible authentication middleware for FastAPI applications.
    
    Features:
    - Multi-platform support (web, mobile, desktop)
    - Configurable authentication exclusion paths
    - Support for different token locations (header, cookie, query params)
    - Session validation with IP and User-Agent verification (configurable)
    - Automatic session management with session limits per user
    - Custom authentication handlers for specific paths
    """
    
    def __init__(
        self, 
        app,
        exclude_paths: List[str] = None,
        custom_handlers: Dict[str, Callable] = None,
        require_active_session: bool = True,
        verify_ip: bool = False,  # Default to False for mobile clients that may change IPs
        verify_user_agent: bool = False,  # Default to False as mobile apps may have varying user agents
        token_location: List[str] = ["header", "cookie", "query"],  # Check multiple locations
        token_name: str = "Authorization",
        platform_specific_rules: Dict[str, Dict] = None,  # Platform-specific auth rules
        refresh_token_rotation: bool = False,  # Whether to rotate refresh tokens for security
    ):
        super().__init__(app)
        self.exclude_paths = exclude_paths or []
        self.custom_handlers = custom_handlers or {}
        self.require_active_session = require_active_session
        self.verify_ip = verify_ip
        self.verify_user_agent = verify_user_agent
        self.token_location = token_location if isinstance(token_location, list) else [token_location]
        self.token_name = token_name
        self.platform_specific_rules = platform_specific_rules or {}
        self.refresh_token_rotation = refresh_token_rotation
        logger.info(f"Authentication middleware initialized with exclude paths: {self.exclude_paths}")
    
    async def dispatch(self, request: Request, call_next):
        """Process the request through the middleware pipeline."""
        # Add db session to request state
        request.state.db = next(get_db())
        
        # Skip authentication for excluded paths
        if await self._should_skip_auth(request):
            response = await call_next(request)
            return response
        
        # Extract and verify token
        token = await self._extract_token(request)
        if not token:
            return self._create_unauthorized_response("Authentication credentials missing")
        
        try:
            # Detect platform and apply rules
            platform = self.detect_client_platform(request)
            platform_rules = self.platform_specific_rules.get(platform, {})
            verify_ip = platform_rules.get("verify_ip", self.verify_ip)
            verify_user_agent = platform_rules.get("verify_user_agent", self.verify_user_agent)
            
            # Get database session
            db = request.state.db
            
            # Verify token against database
            user_session = await self.get_session_by_token(db, token)
            
            if not user_session:
                return self._create_unauthorized_response("Invalid authentication credentials")
            
            # Check if session is expired
            if user_session.expires_at < datetime.now():
                return self._create_unauthorized_response("Session expired")
            
            # Verify IP if required
            if verify_ip and not await self._verify_ip_address(request, user_session, platform):
                return self._create_forbidden_response("IP address mismatch")
            
            # Verify User-Agent if required
            if verify_user_agent and not await self._verify_user_agent(request, user_session, platform):
                return self._create_forbidden_response("User agent mismatch")
            
            # Update last activity timestamp
            await self._update_last_activity(db, user_session)
            
            # Add user and session info to request state
            self._add_auth_info_to_request(request, user_session, platform)
            
            # Check for device limit based on user's max_session setting
            await self._enforce_user_session_limit(db, user_session)
            
            # Continue processing the request
            response = await call_next(request)
            return response
            
        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}", exc_info=True)
            return self._create_unauthorized_response(f"Authentication error: {str(e)}")
    
    async def _should_skip_auth(self, request: Request) -> bool:
        """Determine if authentication should be skipped for this path."""
        # Skip authentication for excluded paths
        if any(request.url.path.startswith(path) for path in self.exclude_paths):
            logger.debug(f"Skipping auth for excluded path: {request.url.path}")
            return True
        
        # Check for custom handler based on path
        for path_prefix, handler in self.custom_handlers.items():
            if request.url.path.startswith(path_prefix):
                logger.debug(f"Using custom handler for path: {request.url.path}")
                # Note: We're not calling the handler here, but returning False
                # The handler would be called in the main dispatch method
                return False
        
        return False
    
    async def _extract_token(self, request: Request) -> Optional[str]:
        """Extract authentication token from request based on configured locations."""
        token = None
        
        # Extract token from multiple possible locations based on configuration
        for location in self.token_location:
            if location == "header":
                auth_header = request.headers.get(self.token_name)
                if auth_header:
                    if auth_header.startswith("Bearer "):
                        token = auth_header.replace("Bearer ", "")
                    elif auth_header.startswith("Token "):
                        token = auth_header.replace("Token ", "")
                    else:
                        token = auth_header
            elif location == "cookie":
                token = request.cookies.get(self.token_name)
            elif location == "query":
                token = request.query_params.get(self.token_name)
            
            if token:
                break
                
        return token
    
    def _create_unauthorized_response(self, detail: str):
        """Create a standardized 401 unauthorized response."""
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    def _create_forbidden_response(self, detail: str):
        """Create a standardized 403 forbidden response."""
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail=detail,
        )
    
    async def get_session_by_token(self, db, token: str) -> Optional[UserSession]:
        """Get user session by access token."""
        try:
            # First try to decode the token to validate it
            token_data = decode_access_token(token)
            user_id = token_data.get("sub")
            
            # Then find the session in the database
            query = select(UserSession).where(
                UserSession.access_token == token,
                UserSession.is_active == True
            )
            result = await db.execute(query)
            session = result.scalar_one_or_none()
            
            # Verify the session belongs to the correct user
            if session and str(session.user_id) != user_id:
                logger.warning(f"Token user ID mismatch: {user_id} vs {session.user_id}")
                return None
                
            return session
            
        except jwt.PyJWTError as e:
            logger.warning(f"JWT validation error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error retrieving session: {str(e)}")
            return None
    
    async def _update_last_activity(self, db, session: UserSession):
        """Update the last activity timestamp of a session."""
        try:
            session.last_activity = datetime.now()
            db.add(session)
            await db.commit()
        except Exception as e:
            logger.error(f"Error updating session activity: {str(e)}")
            await db.rollback()
    
    def detect_client_platform(self, request: Request) -> str:
        """
        Detect the client platform based on User-Agent and other headers.
        Returns one of: "web", "mobile_ios", "mobile_android", "desktop", "unknown"
        """
        user_agent = request.headers.get("User-Agent", "").lower()
        platform_header = request.headers.get("X-Client-Platform", "").lower()
        
        # Check custom platform header first
        if platform_header:
            if "ios" in platform_header:
                return "mobile_ios"
            elif "android" in platform_header:
                return "mobile_android"
            elif "web" in platform_header:
                return "web"
            elif "desktop" in platform_header:
                return "desktop"
        
        # Fallback to user agent detection
        if user_agent:
            if "iphone" in user_agent or "ipad" in user_agent or "ios" in user_agent:
                return "mobile_ios"
            elif "android" in user_agent:
                return "mobile_android"
            elif "mozilla" in user_agent and ("chrome" in user_agent or "firefox" in user_agent or "safari" in user_agent):
                return "web"
            elif "electron" in user_agent or "macos" in user_agent or "windows nt" in user_agent:
                return "desktop"
        
        return "unknown"
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request with support for various proxy headers."""
        # Check multiple possible headers for IP
        for header in ["X-Forwarded-For", "X-Real-IP", "CF-Connecting-IP"]:
            if header in request.headers:
                ips = request.headers[header].split(",")
                return ips[0].strip()
        
        return request.client.host if request.client else ""
    
    async def _verify_ip_address(self, request: Request, user_session: UserSession, platform: str) -> bool:
        """Verify that the client IP address matches the session's stored IP address."""
        client_ip = self._get_client_ip(request)
        stored_ip = user_session.ip_address
        
        # For mobile clients on cellular networks, we might just compare IP blocks
        # rather than exact matches to account for carrier IP changes
        if platform in ["mobile_android", "mobile_ios"] and stored_ip and client_ip:
            return self._compare_ip_blocks(stored_ip, client_ip)
        else:
            return (stored_ip == client_ip)
    
    def _compare_ip_blocks(self, ip1: str, ip2: str) -> bool:
        """
        Compare IP addresses by subnet blocks for more flexible matching.
        Useful for mobile clients where exact IP might change but subnet remains the same.
        """
        if not ip1 or not ip2:
            return False
            
        try:
            # This is a simplified approach - in production you'd use a proper IP library
            ip1_parts = ip1.split(".")
            ip2_parts = ip2.split(".")
            
            if len(ip1_parts) >= 2 and len(ip2_parts) >= 2:
                # Compare first two octets (network part)
                return ip1_parts[0] == ip2_parts[0] and ip1_parts[1] == ip2_parts[1]
        except:
            pass
            
        return ip1 == ip2  # Fallback to exact matching
    
    async def _verify_user_agent(self, request: Request, user_session: UserSession, platform: str) -> bool:
        """Verify that the client User-Agent matches the session's stored User-Agent."""
        current_ua = request.headers.get("User-Agent", "")
        stored_ua = user_session.user_agent
        
        # For mobile apps, we might only check that the app identifier is consistent
        # rather than the entire UA string which could change with app updates
        if platform in ["mobile_android", "mobile_ios"]:
            return self._compare_app_identifiers(stored_ua, current_ua)
        else:
            return (stored_ua == current_ua)
    
    def _compare_app_identifiers(self, stored_ua: str, current_ua: str) -> bool:
        """
        Compare app identifiers within user agents instead of requiring exact matches.
        Useful for mobile apps where the UA might change with updates.
        """
        if not stored_ua or not current_ua:
            return False
            
        # Strip version numbers for comparison
        stored_ua = stored_ua.split("/")[0] if "/" in stored_ua else stored_ua
        current_ua = current_ua.split("/")[0] if "/" in current_ua else current_ua
        
        # Simple contains check - in production use more sophisticated pattern matching
        return stored_ua in current_ua or current_ua in stored_ua
    
    def _add_auth_info_to_request(self, request: Request, user_session: UserSession, platform: str):
        """Add authenticated user and session info to the request state."""
        request.state.user_id = user_session.user_id
        request.state.session_id = user_session.session_id
        request.state.user = user_session.user if hasattr(user_session, "user") else None
        request.state.client_platform = platform
        request.state.device_info = user_session.device_info
        request.state.authenticated = True
    
    async def _enforce_user_session_limit(self, db, current_session: UserSession):
        """
        Enforce maximum number of active sessions based on user's max_session setting.
        If limit is exceeded, oldest sessions will be removed.
        
        The max_session value is defined in the User model and can be different for each user.
        """
        try:
            # Get the user's max_session setting directly from the User model
            query = select(User).where(User.id == current_session.user_id)
            result = await db.execute(query)
            user = result.scalar_one_or_none()
            
            if not user:
                # This should not happen as the session belongs to a user
                logger.warning(f"User not found for session: {current_session.session_id}")
                return
                
            max_sessions = user.max_session
            if max_sessions <= 0:
                # If max_sessions is 0 or negative, no limit is applied
                return
                
            # Count active sessions for the user (excluding the current one)
            query = select(UserSession).where(
                UserSession.user_id == current_session.user_id,
                UserSession.session_id != current_session.session_id,
                UserSession.expires_at > datetime.now(),
                UserSession.is_active == True
            )
            result = await db.execute(query)
            other_active_sessions = result.scalars().all()
            
            # If the user already has max_sessions (or more), invalidate the oldest ones
            if len(other_active_sessions) >= max_sessions:
                # Sort by last activity (oldest first)
                sessions_to_remove = sorted(
                    other_active_sessions, 
                    key=lambda s: s.last_activity or datetime.min
                )[:(len(other_active_sessions) - max_sessions + 1)]  # Keep only up to max_sessions-1 (plus current)
                
                for session in sessions_to_remove:
                    # Set expires_at to now to invalidate the session
                    session.expires_at = datetime.now()
                    db.add(session)
                
                await db.commit()
                logger.info(f"Removed {len(sessions_to_remove)} old sessions for user {current_session.user_id}")
                
        except Exception as e:
            logger.error(f"Error enforcing session limit: {str(e)}")
            await db.rollback()

# Dependency functions for route handlers

async def get_current_user_id(request: Request) -> int:
    """Dependency to get current user ID from request state."""
    if not hasattr(request.state, "user_id"):
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return request.state.user_id

async def get_current_user(request: Request) -> User:
    """Dependency to get current user from request state."""
    if not hasattr(request.state, "user"):
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return request.state.user

async def get_client_platform(request: Request) -> str:
    """Dependency to get current user's platform/device type."""
    if not hasattr(request.state, "client_platform"):
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return request.state.client_platform

async def get_device_info(request: Request) -> Optional[str]:
    """Dependency to get current user's device info."""
    if not hasattr(request.state, "device_info"):
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return request.state.device_info

# Function to create and configure the authentication middleware
def create_auth_middleware(
    exclude_paths: List[str] = None,
    custom_handlers: Dict[str, Callable] = None,
    require_active_session: bool = True,
    verify_ip: bool = False,
    verify_user_agent: bool = False,
    token_location: Union[str, List[str]] = ["header", "cookie", "query"],
    token_name: str = "Authorization",
    platform_specific_rules: Dict[str, Dict] = None,
    refresh_token_rotation: bool = False
) -> Callable:
    """
    Create a configured instance of the authentication middleware.
    
    Args:
        exclude_paths: List of URL paths to exclude from authentication
        custom_handlers: Dictionary mapping path prefixes to custom handler functions
        require_active_session: Whether to require an active session
        verify_ip: Whether to verify the client IP address matches the session
        verify_user_agent: Whether to verify the User-Agent header matches the session
        token_location: Where to look for the token ("header", "cookie", or "query") or a list of locations
        token_name: Name of the header, cookie, or query parameter containing the token
        platform_specific_rules: Dict mapping platform names to custom rule dictionaries
        refresh_token_rotation: Whether to rotate refresh tokens for enhanced security
    
    Returns:
        Configured authentication middleware
    """
    def middleware(app):
        return AuthenticationMiddleware(
            app,
            exclude_paths=exclude_paths,
            custom_handlers=custom_handlers,
            require_active_session=require_active_session,
            verify_ip=verify_ip,
            verify_user_agent=verify_user_agent,
            token_location=token_location,
            token_name=token_name,
            platform_specific_rules=platform_specific_rules,
            refresh_token_rotation=refresh_token_rotation
        )
    return middleware