# app/core/config/settings.py

import os
from functools import lru_cache
from typing import Dict, Any

from .env_config import EnvironmentConfig
from .api_config import APIConfig
from .auth_config import AuthConfig
from .cors_config import CORSConfig
from .database_config import DatabaseConfig


class Settings(
    EnvironmentConfig,
    APIConfig,
    AuthConfig,
    CORSConfig, 
    DatabaseConfig
):  
    class Config:
        case_sensitive = True
        env_nested_delimiter = "__"
        
    @classmethod
    def get_environment_specific_settings(cls) -> 'Settings':
        """
        Factory method to create settings based on the current environment.
        Override settings for different environments here.
        """
        env = os.getenv("ENVIRONMENT", "development").lower()
        
        # Create base settings
        settings = cls()
        
        # Apply environment-specific overrides
        if env == "development":
            settings.DEBUG = True
            # Development-specific overrides
            
        elif env == "staging":
            settings.DEBUG = False
            settings.DB_POOL_SIZE = 30
            settings.DB_MAX_OVERFLOW = 10
            # Staging-specific overrides
            
        elif env == "production":
            settings.DEBUG = False
            settings.RATE_LIMIT_PER_MINUTE = 12
            settings.DB_POOL_SIZE = 50
            settings.DB_MAX_OVERFLOW = 20
            settings.DB_POOL_RECYCLE = 3600
            # Production-specific overrides
            
        elif env == "testing":
            settings.DEBUG = True
            settings.DB_CREATE_TABLES = True
            settings.DB_AUTO_MIGRATE = False
            # Testing-specific overrides
            
        return settings


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance based on the current environment.
    
    Returns:
        Singleton Settings instance for the application
    """
    try:
        # Clear the cache to ensure we get fresh settings
        get_settings.cache_clear()
        settings = Settings.get_environment_specific_settings()
        return settings
    except Exception as e:
        raise RuntimeError(f"Failed to initialize application settings: {e}")