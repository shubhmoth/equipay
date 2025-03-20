# app/schemas/transaction.py
from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, validator

# Shared properties
class TransactionBase(BaseModel):
    payer_id: int
    payee_id: int
    transaction_amount: Decimal
    description: str
    is_settled: bool = False
    is_group_transaction: bool = False
    is_active: bool = True

    @validator('transaction_amount')
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Transaction amount must be positive')
        return v

# Properties to receive on transaction creation
class TransactionCreate(TransactionBase):
    pass

# Properties to receive on transaction update
class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    is_settled: Optional[bool] = None
    is_active: Optional[bool] = None

# Properties shared by models in DB
class TransactionInDBBase(TransactionBase):
    id: int
    created_at: datetime
    last_updated_at: datetime
    
    class Config:
        from_attributes = True

# Properties to return to client
class Transaction(TransactionInDBBase):
    pass

# Properties stored in DB
class TransactionInDB(TransactionInDBBase):
    pass