# app/core/config/cors_config.py

import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import validator

class CORSConfig(BaseSettings):
    """CORS configuration settings"""
    CORS_ORIGINS: List[str] = []
    CORS_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    CORS_HEADERS: List[str] = ["Content-Type", "Authorization", "Accept"]
    
    @validator("CORS_ORIGINS", pre=True, always=True)
    def set_cors_origins(cls, v, values):
        # If CORS_ORIGINS is provided, use it directly
        if v:
            return v
            
        # Otherwise, set based on environment
        environment = os.getenv("ENVIRONMENT", "development").lower()
        if environment == "development":
            return [
                "http://localhost:3000",
                "http://localhost:8000",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:8000",
                "http://127.0.0.1:5500"
            ]
        elif environment == "staging":
            return [
                "https://staging.equipay.com",
                "https://api.staging.equipay.com"
            ]
        elif environment == "production":
            return [
                "https://equipay.com",
                "https://api.equipay.com"
            ]
        else:
            return ["http://127.0.0.1:5500"]
            
    @property
    def get_cors_origins(self) -> List[str]:
        return self.CORS_ORIGINS
        
    @property
    def get_cors_methods(self) -> List[str]:
        return self.CORS_METHODS
        
    @property
    def get_cors_headers(self) -> List[str]:
        return self.CORS_HEADERS