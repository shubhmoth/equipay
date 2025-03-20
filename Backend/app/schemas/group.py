# app/schemas/group.py
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

# Shared properties
class GroupBase(BaseModel):
    admin_id: int
    group_name: str
    is_active: bool = True

# Properties to receive on group creation
class GroupCreate(GroupBase):
    pass

# Properties to receive on group update
class GroupUpdate(BaseModel):
    group_name: Optional[str] = None
    admin_id: Optional[int] = None
    is_active: Optional[bool] = None

# Properties shared by models in DB
class GroupInDBBase(GroupBase):
    id: int
    created_at: datetime
    last_updated_at: datetime
    
    class Config:
        from_attributes = True

# Properties to return to client
class Group(GroupInDBBase):
    pass

# Properties stored in DB
class GroupInDB(GroupInDBBase):
    pass