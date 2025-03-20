# app/db/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import QueuePool
import logging

from app.core.config.settings import get_settings
from app.core.utils.database_utils import get_sync_db_url

logger = logging.getLogger(__name__)
settings = get_settings()

SQLALCHEMY_DATABASE_URL = get_sync_db_url(settings.DATABASE_URL)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_pre_ping=True,
    pool_recycle=settings.DB_POOL_RECYCLE,
    poolclass=QueuePool
)

async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.is_development,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_pre_ping=True,
    pool_recycle=settings.DB_POOL_RECYCLE,
)

Base = declarative_base()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

AsyncSessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

def get_db():
    """Synchronous database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    """Asynchronous database session dependency"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()