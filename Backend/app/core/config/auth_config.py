# app/core/config/auth_config.py

from pydantic_settings import BaseSettings
from pydantic import validator

class AuthConfig(BaseSettings):
    """Authentication configuration settings"""
    SECRET_KEY: str = "e0497ccaca7506a33b549dc77dbd9b605a66316d305b2463a442f375734bbe44"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    @validator("SECRET_KEY", pre=True)
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError("SECRET_KEY is too short, it should be at least 32 characters")
        return v