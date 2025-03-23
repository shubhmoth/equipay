# app/core/config/database_config.py

from typing import Dict, Any, List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator

class DatabaseConfig(BaseSettings):
    """Database configuration settings"""
    # Database connection parameters
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_USER: str = "root"
    POSTGRES_PASSWORD: str = "root"
    POSTGRES_DB: str = "testtwo"
    DATABASE_URL: Optional[str] = None
    
    # Database connection pool settings
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 0
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800
    
    # Database initialization settings
    DB_CREATE_TABLES: bool = True
    DB_RUN_MIGRATIONS: bool = False
    DB_AUTO_MIGRATE: bool = True
    DB_SAVE_SCHEMA_SNAPSHOT: bool = True
    DB_STRICT_MODE: bool = False
    
    # Other database settings
    EXCLUDED_TABLES: List[str] = ["alembic_version"]
    DB_SKIP_COLUMNS_ON_MODIFY: List[str] = ["created_at", "last_updated_at", "expires_at", "last_login", "last_activity", "id"]
    
    
    @validator("DATABASE_URL", pre=True, always=True)
    def assemble_db_url(cls, v, values):
        # If DATABASE_URL is provided, use it directly
        if v:
            return v
            
        # Otherwise, build it from components
        user = values.get("POSTGRES_USER")
        password = values.get("POSTGRES_PASSWORD")
        server = values.get("POSTGRES_SERVER")
        port = values.get("POSTGRES_PORT")
        db = values.get("POSTGRES_DB")
        
        user_pass = f"{user}:{password}" if password else user
        return f"postgresql+asyncpg://{user_pass}@{server}:{port}/{db}"
    
    def get_database_url(self, server=None, port=None, user=None, password=None, db=None):
        """Get database URL from individual parameters or use default settings"""
        server = server or self.POSTGRES_SERVER
        port = port or self.POSTGRES_PORT
        user = user or self.POSTGRES_USER
        password = password or self.POSTGRES_PASSWORD
        db = db or self.POSTGRES_DB
        
        user_pass = f"{user}:{password}" if password else user
        return f"postgresql+asyncpg://{user_pass}@{server}:{port}/{db}"
        
    def get_db_connection_args(self) -> Dict[str, Any]:
        """Get SQLAlchemy connection arguments"""
        return {
            "pool_size": self.DB_POOL_SIZE,
            "max_overflow": self.DB_MAX_OVERFLOW,
            "pool_timeout": self.DB_POOL_TIMEOUT,
            "pool_recycle": self.DB_POOL_RECYCLE,
        }