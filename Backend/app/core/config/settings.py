# app/core/config/settings.py

from pydantic_settings import BaseSettings
from functools import lru_cache
from .api_config import APIConfig
from .auth_config import AuthConfig
from .cors_config import CORSConfig
from .database_config import DatabaseConfig

class Settings(BaseSettings, APIConfig, AuthConfig, CORSConfig, DatabaseConfig):
    """
    Application settings class that combines all config components.
    Inherits database settings from DatabaseConfig.
    """
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    DATABASE_URL: str
    VERSION: str = "0.1.0"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def is_development(self) -> bool:
        if not isinstance(self.ENVIRONMENT, str) or not self.ENVIRONMENT.strip():
            raise ValueError("Environment must be a non-empty string.")
        return self.ENVIRONMENT.lower() == "development"

    @property
    def is_production(self) -> bool:
        if not isinstance(self.ENVIRONMENT, str) or not self.ENVIRONMENT.strip():
            raise ValueError("Environment must be a non-empty string.")
        return self.ENVIRONMENT.lower() == "production"
    
    def get_postgres_url(self) -> str:
        return self.get_database_url(
            self.POSTGRES_SERVER,
            self.POSTGRES_PORT,
            self.POSTGRES_USER,
            self.POSTGRES_PASSWORD,
            self.POSTGRES_DB
        )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    
    try:
        # Clear the cache to ensure we get fresh settings
        get_settings.cache_clear()
        settings = Settings()
        if not isinstance(settings, Settings):
            raise TypeError("Failed to create a valid Settings instance.")
        return settings
    except Exception as e:
        raise RuntimeError(f"An error occurred while initializing the settings: {e}")