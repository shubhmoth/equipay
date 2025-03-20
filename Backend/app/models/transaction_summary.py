# app/models/transaction_summary.py
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, BigInteger, Numeric
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.models.base import BaseModel

class TransactionSummary(Base, BaseModel):
    __tablename__ = "transaction_summary"
    
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    total_borrowings = Column(Numeric(12, 2), nullable=False, default=0.00)
    total_receivables = Column(Numeric(12, 2), nullable=False, default=0.00)
    total_amount = Column(Numeric(12, 2), nullable=False, default=0.00)
    
    # Relationships
    user = relationship("User", back_populates="transaction_summary")
    
    def __repr__(self):
        return f"<TransactionSummary(id={self.id}, user_id={self.user_id}, total_amount={self.total_amount})>"
