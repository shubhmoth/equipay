# app/models/user.py
from sqlalchemy import Boolean, Column, DateTime, Integer, String, BigInteger, SmallInteger
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.models.base import BaseModel

class User(Base, BaseModel):
    __tablename__ = "users"
    
    name = Column(String(255), nullable=False)
    #other_name = Column(String(255), nullable=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    is_social_account = Column(Boolean, default=False)
    mobile_number = Column(String(20), nullable=False)
    password = Column(String(255), nullable=False)
    is_password_random = Column(Boolean, default=False)
    is_user_dummy = Column(Boolean, default=False)
    auth_provider = Column(String(50), nullable=True, index=True)
    max_session = Column(SmallInteger, default=1)
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    connections = relationship("UserConnection", foreign_keys="UserConnection.user_id", back_populates="user")
    connected_to = relationship("UserConnection", foreign_keys="UserConnection.connected_user_id", back_populates="connected_user")
    payments_made = relationship("Transaction", foreign_keys="Transaction.payer_id", back_populates="payer")
    payments_received = relationship("Transaction", foreign_keys="Transaction.payee_id", back_populates="payee")
    admin_of_groups = relationship("Group", back_populates="admin")
    group_memberships = relationship("GroupMember", back_populates="user")
    transaction_summary = relationship("TransactionSummary", uselist=False, back_populates="user")
    sessions = relationship("UserSession", back_populates="user")
    social_auths = relationship("SocialAuth", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"
