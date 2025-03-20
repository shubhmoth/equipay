#app/models/user_connection.py
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
from app.models.base import BaseModel

class UserConnection(Base, BaseModel):
    __tablename__ = "user_connections"
    
    user_id = Column(BigInteger, ForeignKey("users.id"), primary_key=True)
    connected_user_id = Column(BigInteger, ForeignKey("users.id"), primary_key=True, index=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="connections")
    connected_user = relationship("User", foreign_keys=[connected_user_id], back_populates="connected_to")
    
    def __repr__(self):
        return f"<UserConnection(user_id={self.user_id}, connected_user_id={self.connected_user_id})>"

