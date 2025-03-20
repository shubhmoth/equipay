# app/models/group.py
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, BigInteger, String
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.models.base import BaseModel

class Group(Base, BaseModel):
    __tablename__ = "groups"

    admin_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    group_name = Column(String(255), nullable=False)
    
    # Relationships
    admin = relationship("User", back_populates="admin_of_groups")
    members = relationship("GroupMember", back_populates="group")
    
    def __repr__(self):
        return f"<Group(id={self.id}, name='{self.group_name}')>"

