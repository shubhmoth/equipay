# app/core/config/auth_config.py

from typing import List, Dict, Any
from pydantic import validator

class AuthConfig:
    """Authentication configuration settings"""
    # JWT settings
    SECRET_KEY: str = "e0497ccaca7506a33b549dc77dbd9b605a66316d305b2463a442f375734bbe44"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30  # 30 days
    
    # Authentication middleware settings
    AUTH_EXCLUDE_PATHS: List[str] = [
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/auth/forgot-password",
        "/api/v1/auth/reset-password",
        "/api/v1/auth/verify-email",
        "/docs",
        "/redoc",
        "/openapi.json",
        "/",
        "/ping",
        "/health"
    ]
    
    AUTH_TOKEN_LOCATION: List[str] = ["header", "cookie", "query"]
    AUTH_TOKEN_NAME: str = "Authorization"
    AUTH_VERIFY_IP: bool = False
    AUTH_VERIFY_USER_AGENT: bool = False
    AUTH_REFRESH_TOKEN_ROTATION: bool = True
    
    # Platform-specific rules
    AUTH_PLATFORM_RULES: Dict[str, Dict[str, Any]] = {
        "web": {
            "verify_ip": True,
            "verify_user_agent": True
        },
        "mobile_ios": {
            "verify_ip": False,
            "verify_user_agent": False
        },
        "mobile_android": {
            "verify_ip": False,
            "verify_user_agent": False
        },
        "desktop": {
            "verify_ip": True,
            "verify_user_agent": True
        }
    }
    
    @validator("SECRET_KEY", pre=True)
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError("SECRET_KEY is too short, it should be at least 32 characters")
        return v
    
    @property
    def get_auth_middleware_config(self) -> Dict[str, Any]:
        """Get authentication middleware configuration as a dictionary."""
        return {
            "exclude_paths": self.AUTH_EXCLUDE_PATHS,
            "token_location": self.AUTH_TOKEN_LOCATION,
            "token_name": self.AUTH_TOKEN_NAME,
            "verify_ip": self.AUTH_VERIFY_IP,
            "verify_user_agent": self.AUTH_VERIFY_USER_AGENT,
            "platform_specific_rules": self.AUTH_PLATFORM_RULES,
            "refresh_token_rotation": self.AUTH_REFRESH_TOKEN_ROTATION
        }