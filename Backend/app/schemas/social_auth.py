# app/schemas/social_auth.py
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

# Shared properties
class SocialAuthBase(BaseModel):
    user_id: int
    provider: str
    provider_user_id: str
    email: EmailStr
    name: str
    profile_picture: Optional[str] = None
    is_active: bool = True

# Properties to receive on social auth creation
class SocialAuthCreate(SocialAuthBase):
    pass

# Properties to receive on social auth update
class SocialAuthUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    profile_picture: Optional[str] = None
    is_active: Optional[bool] = None

# Properties shared by models in DB
class SocialAuthInDBBase(SocialAuthBase):
    id: int
    created_at: datetime
    last_updated_at: datetime
    
    class Config:
        from_attributes = True

# Properties to return to client
class SocialAuth(SocialAuthInDBBase):
    pass

# Properties stored in DB
class SocialAuthInDB(SocialAuthInDBBase):
    pass

