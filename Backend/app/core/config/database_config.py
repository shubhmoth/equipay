# app/core/config/database_config.py

class DatabaseConfig:
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_USER: str = "root"
    POSTGRES_PASSWORD: str = "root"
    POSTGRES_DB: str = "testtwo"
    
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
    EXCLUDED_TABLES: list = ["alembic_version"]  
    
    def get_database_url(self, server, port, user, password, db):
        """Get database URL from individual parameters"""
        user_pass = f"{user}:{password}" if password else user
        return f"postgresql+asyncpg://{user_pass}@{server}:{port}/{db}"