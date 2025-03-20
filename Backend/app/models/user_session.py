# app/models/user_session.py
import uuid
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, BigInteger, Text, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
from app.models.base import BaseModel

class UserSession(Base, BaseModel):
    __tablename__ = "user_sessions"
    
    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=False)
    user_agent = Column(Text, nullable=False)
    ip_address = Column(String, nullable=False)
    device_info = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    
    def __repr__(self):
        return f"<UserSession(session_id={self.session_id}, user_id={self.user_id})>"