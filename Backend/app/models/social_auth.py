# app/models/social_auth.py
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, BigInteger, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.models.base import BaseModel

class SocialAuth(Base, BaseModel):
    __tablename__ = "social_auth"

    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    provider = Column(String(50), nullable=False)
    provider_user_id = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    profile_picture = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="social_auths")
    
    # Correct way to define a unique constraint
    __table_args__ = (
        UniqueConstraint('provider', 'provider_user_id', name='uq_provider_provider_user_id'),
    )
    
    def __repr__(self):
        return f"<SocialAuth(id={self.id}, user_id={self.user_id}, provider='{self.provider}')>"