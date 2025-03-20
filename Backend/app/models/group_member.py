# app/models/group_member.py
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
from app.models.base import BaseModel

class GroupMember(Base,BaseModel):
    __tablename__ = "group_members"
    
    group_id = Column(BigInteger, ForeignKey("groups.id"), primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="group_memberships")
    
    def __repr__(self):
        return f"<GroupMember(group_id={self.group_id}, user_id={self.user_id})>"

