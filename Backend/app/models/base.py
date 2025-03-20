from sqlalchemy import Boolean, Column, DateTime, BigInteger
from sqlalchemy.sql import func
from app.db.database import Base

class BaseModel:
    """Base model with common columns for all tables"""
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
