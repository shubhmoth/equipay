# app/core/config/environment_config.py
from pydantic_settings import BaseSettings

class EnvironmentConfig(BaseSettings):
    """Base settings class that handles different environments"""
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"
    
    @property
    def is_staging(self) -> bool:
        return self.ENVIRONMENT.lower() == "staging"
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_testing(self) -> bool:
        return self.ENVIRONMENT.lower() == "testing"