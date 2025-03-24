#app/api/v1/user.py
"""
User-related API endpoints.
"""
import logging
from typing import List, Dict, Any, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Body, Request, Response, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import EmailStr

from app.db.database import get_async_db
from app.models.user import User as UserModel
from app.schemas.user import (
    User as UserSchema,
    UserCreate,
    UserUpdate
)
from app.middleware.auth import get_current_user_id, get_current_user
from app.services import user as user_service

# Setup logger
logger = logging.getLogger(__name__)

# Create a router for user endpoints
router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={
        status.HTTP_404_NOT_FOUND: {"description": "Not found"},
        status.HTTP_403_FORBIDDEN: {"description": "Forbidden"},
        status.HTTP_401_UNAUTHORIZED: {"description": "Unauthorized"}
    },
)

@router.post(
    "/register",
    response_model=UserSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Register a new user with required details."
)
async def register_user(
    user_data: UserCreate = Body(...),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Register a new user.
    
    This endpoint is public and doesn't require authentication.
    """
    # Create user with is_user_verified set to False
    user_data_dict = user_data.model_dump()
    user_data_dict["is_user_verified"] = False
    
    # Create user using service
    user = await user_service.create_user(db=db, user_data=user_data)
    
    # TODO: Send welcome email to the user with email verification link
    # TODO: Implement email service integration
    
    return user

@router.get(
    "/details",
    response_model=UserSchema,
    summary="Get user details by username or email",
    description="Get user details by providing either username or email."
)
async def get_user_details(
    username: Optional[str] = Query(None, description="Username of the user"),
    email: Optional[EmailStr] = Query(None, description="Email of the user"),
    db: AsyncSession = Depends(get_async_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Get user details by username or email.
    
    This endpoint requires authentication.
    """
    if not username and not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either username or email must be provided"
        )
    
    # Get user by username or email
    user = None
    if username:
        user = await user_service.get_active_verified_user_by_username(db=db, username=username)
    else:
        user = await user_service.get_active_verified_user_by_email(db=db, email=email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found, inactive, or not verified"
        )
    
    # Check if user has active session
    has_active_session = await user_service.has_active_session(db=db, user_id=user.id)
    if not has_active_session:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have an active session"
        )
    
    return user

@router.get(
    "/details/{user_id}",
    response_model=UserSchema,
    summary="Get user details by ID",
    description="Get user details by ID."
)
async def get_user_details_by_id(
    user_id: int = Path(..., gt=0, description="ID of the user"),
    db: AsyncSession = Depends(get_async_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Get user details by ID.
    
    This endpoint requires authentication.
    """
    user = await user_service.get_active_verified_user_by_id(db=db, user_id=user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found, inactive, or not verified"
        )
    
    # Check if user has active session
    has_active_session = await user_service.has_active_session(db=db, user_id=user.id)
    if not has_active_session:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have an active session"
        )
    
    return user

@router.put(
    "/update",
    response_model=UserSchema,
    summary="Update user details",
    description="Update user details by providing username or email for identification."
)
async def update_user_details(
    user_data: UserUpdate = Body(...),
    username: Optional[str] = Query(None, description="Username of the user to update"),
    email: Optional[EmailStr] = Query(None, description="Email of the user to update"),
    db: AsyncSession = Depends(get_async_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Update user details.
    
    This endpoint requires authentication.
    """
    if not username and not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either username or email must be provided"
        )
    
    # Get user by username or email
    user_to_update = None
    if username:
        user_to_update = await user_service.get_active_verified_user_by_username(db=db, username=username)
    else:
        user_to_update = await user_service.get_active_verified_user_by_email(db=db, email=email)
    
    if not user_to_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found, inactive, or not verified"
        )
    
    # Check if user has active session
    has_active_session = await user_service.has_active_session(db=db, user_id=user_to_update.id)
    if not has_active_session:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have an active session"
        )
    
    # Check if current user is the same as the user to update
    if current_user.id != user_to_update.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile"
        )
    
    # Update user
    updated_user = await user_service.update_user(
        db=db,
        user_id=user_to_update.id,
        user_data=user_data
    )
    
    # TODO: Send notification email to user that their details were updated
    # TODO: Implement email service integration
    
    return updated_user

@router.put(
    "/deactivate",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Deactivate user",
    description="Deactivate a user account by providing username or email."
)
async def deactivate_user(
    username: Optional[str] = Query(None, description="Username of the user to deactivate"),
    email: Optional[EmailStr] = Query(None, description="Email of the user to deactivate"),
    request: Request = None,
    db: AsyncSession = Depends(get_async_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Deactivate a user account.
    
    This endpoint requires authentication.
    """
    if not username and not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either username or email must be provided"
        )
    
    # Get user by username or email
    user_to_deactivate = None
    if username:
        user_to_deactivate = await user_service.get_active_verified_user_by_username(db=db, username=username)
    else:
        user_to_deactivate = await user_service.get_active_verified_user_by_email(db=db, email=email)
    
    if not user_to_deactivate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found, already inactive, or not verified"
        )
    
    # Check if current user is the same as the user to deactivate
    if current_user.id != user_to_deactivate.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only deactivate your own account"
        )
    
    # Get client IP address
    client_ip = request.client.host if request else None
    
    # Verify user has active session from the same IP
    has_valid_session = await user_service.has_active_session_from_ip(
        db=db, 
        user_id=user_to_deactivate.id, 
        ip_address=client_ip
    )
    
    if not has_valid_session:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active session found from this IP address"
        )
    
    # Deactivate user
    success = await user_service.deactivate_user(db=db, user_id=user_to_deactivate.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate user"
        )
    
    # TODO: Send notification email that account has been suspended
    # TODO: Implement email service integration
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get(
    "/search",
    response_model=List[UserSchema],
    summary="Search for users",
    description="Search for verified, public users with optional search term. Excludes the current user from results."
)
async def search_users(
    q: Optional[str] = Query(None, description="Search term for name, username, or email"),
    limit: int = Query(5, ge=1, le=20, description="Maximum number of users to return"),
    db: AsyncSession = Depends(get_async_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Search for verified, public users. Excludes the current user from the search results.
    
    This endpoint requires authentication.
    """
    # Search for public users, excluding the current user
    users = await user_service.search_public_users(
        db=db,
        search_term=q,
        limit=limit,
        exclude_user_id=current_user_id
    )
    
    return users