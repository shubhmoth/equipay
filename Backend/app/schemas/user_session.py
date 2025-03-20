# app/schemas/user_session.py
from typing import Optional
from datetime import datetime
import uuid
from pydantic import BaseModel

# Shared properties
class UserSessionBase(BaseModel):
    user_id: int
    access_token: str
    refresh_token: str
    user_agent: str
    ip_address: str
    device_info: Optional[str] = None
    expires_at: datetime
    is_active: bool = True

# Properties to receive on user session creation
class UserSessionCreate(UserSessionBase):
    pass

# Properties to receive on user session update
class UserSessionUpdate(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    last_activity: Optional[datetime] = None
    is_active: Optional[bool] = None

# Properties shared by models in DB
class UserSessionInDBBase(UserSessionBase):
    session_id: uuid.UUID
    created_at: datetime
    last_activity: datetime
    
    class Config:
        from_attributes = True

# Properties to return to client
class UserSession(UserSessionInDBBase):
    pass

# Properties stored in DB
class UserSessionInDB(UserSessionInDBBase):
    pass
