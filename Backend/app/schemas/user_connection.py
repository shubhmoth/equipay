# app/schemas/user_connection.py
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

# Shared properties
class UserConnectionBase(BaseModel):
    is_active: bool = True

# Properties to receive on user connection creation
class UserConnectionCreate(UserConnectionBase):
    user_id: int
    connected_user_id: int

# Properties to receive on user connection update
class UserConnectionUpdate(UserConnectionBase):
    is_active: Optional[bool] = None

# Properties shared by models in DB
class UserConnectionInDB(UserConnectionBase):
    user_id: int
    connected_user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True