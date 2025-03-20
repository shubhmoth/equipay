# app/schemas/transaction_summary.py
from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel

# Shared properties
class TransactionSummaryBase(BaseModel):
    user_id: int
    total_borrowings: Decimal = Decimal('0.00')
    total_receivables: Decimal = Decimal('0.00')
    total_amount: Decimal = Decimal('0.00')
    is_active: bool = True

# Properties to receive on transaction summary creation
class TransactionSummaryCreate(TransactionSummaryBase):
    pass

# Properties to receive on transaction summary update
class TransactionSummaryUpdate(BaseModel):
    total_borrowings: Optional[Decimal] = None
    total_receivables: Optional[Decimal] = None
    total_amount: Optional[Decimal] = None
    is_active: Optional[bool] = None

# Properties shared by models in DB
class TransactionSummaryInDBBase(TransactionSummaryBase):
    id: int
    created_at: datetime
    last_updated_at: datetime
    
    class Config:
        from_attributes = True

# Properties to return to client
class TransactionSummary(TransactionSummaryInDBBase):
    pass

# Properties stored in DB
class TransactionSummaryInDB(TransactionSummaryInDBBase):
    pass