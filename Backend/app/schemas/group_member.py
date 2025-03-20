# app/schemas/group_member.py
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

# Shared properties
class GroupMemberBase(BaseModel):
    group_id: int
    user_id: int
    is_active: bool = True

# Properties to receive on group member creation
class GroupMemberCreate(GroupMemberBase):
    pass

# Properties to receive on group member update
class GroupMemberUpdate(BaseModel):
    is_active: Optional[bool] = None

# Properties shared by models in DB
class GroupMemberInDB(GroupMemberBase):
    created_at: datetime
    
    class Config:
        from_attributes = True
