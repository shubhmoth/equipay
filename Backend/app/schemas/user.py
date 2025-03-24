#app/schemas/user.py
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, validator
import re

# Shared properties
class UserBase(BaseModel):
    name: str
    other_name: Optional[str] = None
    username: str
    email: EmailStr
    is_social_account: bool = False
    mobile_number: str
    is_password_random: bool = False
    is_user_dummy: bool = False
    is_user_verified: bool = False
    is_mobile_verified: bool = False
    is_private_user: bool = False
    auth_provider: Optional[str] = None
    is_active: bool = True
    max_session: int = 1
    
    @validator('mobile_number')
    def mobile_number_must_be_valid(cls, v):
        # Simple validation pattern for mobile numbers
        pattern = r'^\+?[0-9]{10,15}$'
        if not re.match(pattern, v):
            raise ValueError('Invalid mobile number format')
        return v
    
    @validator('username')
    def username_must_be_valid(cls, v):
        # Alphanumeric, underscore, dash allowed, 3-50 chars
        pattern = r'^[a-zA-Z0-9_-]{3,50}$'
        if not re.match(pattern, v):
            raise ValueError('Username must be 3-50 characters and contain only letters, numbers, underscore, or dash')
        return v

# Properties to receive on user creation
class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def password_must_be_strong(cls, v):
        # At least 8 chars, one uppercase, one lowercase, one digit
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        return v

# Properties to receive on user update
class UserUpdate(BaseModel):
    name: Optional[str] = None
    other_name: Optional[str] = None
    mobile_number: Optional[str] = None
    is_user_verified: Optional[bool] = None  
    is_mobile_verified: Optional[bool] = None
    is_private_user: Optional[bool] = None
    auth_provider: Optional[str] = None
    is_active: Optional[bool] = None
    max_session: Optional[int] = None
    
    @validator('mobile_number')
    def mobile_number_must_be_valid(cls, v):
        if v is None:
            return v
        pattern = r'^\+?[0-9]{10,15}$'
        if not re.match(pattern, v):
            raise ValueError('Invalid mobile number format')
        return v

# Properties shared by models in DB
class UserInDBBase(UserBase):
    id: int
    last_login: Optional[datetime] = None
    created_at: datetime
    last_updated_at: datetime
    
    class Config:
        from_attributes = True

# Properties to return to client
class User(UserInDBBase):
    pass

# Properties stored in DB
class UserInDB(UserInDBBase):
    password: str