# app/models/transaction.py
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, BigInteger, Numeric, Text
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.models.base import BaseModel

class Transaction(Base, BaseModel):
    __tablename__ = "transactions"

    payer_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    payee_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    transaction_amount = Column(Numeric(12, 2), nullable=False)
    description = Column(Text, nullable=False)
    is_settled = Column(Boolean, default=False, index=True)
    is_group_transaction = Column(Boolean, default=False, index=True)
    
    # Relationships
    payer = relationship("User", foreign_keys=[payer_id], back_populates="payments_made")
    payee = relationship("User", foreign_keys=[payee_id], back_populates="payments_received")
    
    def __repr__(self):
        return f"<Transaction(id={self.id}, amount={self.transaction_amount}, settled={self.is_settled})>"
