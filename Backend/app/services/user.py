import logging
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from sqlalchemy import select, update, delete, and_, or_, func, not_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_409_CONFLICT

from app.core.config.security import get_password_hash, verify_password
from app.models.user import User
from app.models.user_session import UserSession
from app.schemas.user import UserCreate, UserUpdate, User as UserSchema

# Set up logger
logger = logging.getLogger(__name__)

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """
    Get a user by email.
    
    Args:
        db: Database session
        email: Email to lookup
        
    Returns:
        User object if found, None otherwise
    """
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """
    Get a user by username.
    
    Args:
        db: Database session
        username: Username to lookup
        
    Returns:
        User object if found, None otherwise
    """
    query = select(User).where(User.username == username)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """
    Get a user by ID.
    
    Args:
        db: Database session
        user_id: User ID to lookup
        
    Returns:
        User object if found, None otherwise
    """
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_active_verified_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """
    Get an active, verified user by ID.
    
    Args:
        db: Database session
        user_id: User ID to lookup
        
    Returns:
        User object if found, active and verified, None otherwise
    """
    query = select(User).where(
        and_(
            User.id == user_id,
            User.is_active == True,
            User.is_user_verified == True
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_active_verified_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """
    Get an active, verified user by email.
    
    Args:
        db: Database session
        email: Email to lookup
        
    Returns:
        User object if found, active and verified, None otherwise
    """
    query = select(User).where(
        and_(
            User.email == email,
            User.is_active == True,
            User.is_user_verified == True
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_active_verified_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """
    Get an active, verified user by username.
    
    Args:
        db: Database session
        username: Username to lookup
        
    Returns:
        User object if found, active and verified, None otherwise
    """
    query = select(User).where(
        and_(
            User.username == username,
            User.is_active == True,
            User.is_user_verified == True
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_user_by_mobile(db: AsyncSession, mobile_number: str) -> Optional[User]:
    """
    Get a user by mobile number.
    
    Args:
        db: Database session
        mobile_number: Mobile number to lookup
        
    Returns:
        User object if found, None otherwise
    """
    query = select(User).where(User.mobile_number == mobile_number)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def has_active_session(db: AsyncSession, user_id: int) -> bool:
    """
    Check if a user has any active session.
    
    Args:
        db: Database session
        user_id: User ID to check
        
    Returns:
        True if the user has an active session, False otherwise
    """
    query = (
        select(func.count(UserSession.session_id))
        .where(
            and_(
                UserSession.user_id == user_id,
                UserSession.expires_at > func.now()
            )
        )
    )
    result = await db.execute(query)
    count = result.scalar_one()
    return count > 0

async def has_active_session_from_ip(db: AsyncSession, user_id: int, ip_address: str) -> bool:
    """
    Check if a user has an active session from a specific IP address.
    
    Args:
        db: Database session
        user_id: User ID to check
        ip_address: IP address to check
        
    Returns:
        True if the user has an active session from the specified IP, False otherwise
    """
    if not ip_address:
        return False
        
    query = (
        select(func.count(UserSession.session_id))
        .where(
            and_(
                UserSession.user_id == user_id,
                UserSession.ip_address == ip_address,
                UserSession.expires_at > func.now()
            )
        )
    )
    result = await db.execute(query)
    count = result.scalar_one()
    return count > 0

async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    """
    Create a new user.
    
    Args:
        db: Database session
        user_data: User data from request
        
    Returns:
        Created User object
        
    Raises:
        HTTPException: If the email or username is already taken
    """
    # Check if email already exists
    existing_email = await get_user_by_email(db, user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = await get_user_by_username(db, user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=HTTP_409_CONFLICT,
            detail="Username already taken"
        )
    
    # Check if mobile number already exists
    existing_mobile = await get_user_by_mobile(db, user_data.mobile_number)
    if existing_mobile:
        raise HTTPException(
            status_code=HTTP_409_CONFLICT,
            detail="Mobile number already registered"
        )
    
    # Create user object
    hashed_password = get_password_hash(user_data.password)
    
    db_user = User(
        name=user_data.name,
        other_name=user_data.other_name,
        username=user_data.username,
        email=user_data.email,
        is_social_account=user_data.is_social_account,
        mobile_number=user_data.mobile_number,
        password=hashed_password,
        is_password_random=user_data.is_password_random,
        is_user_dummy=user_data.is_user_dummy,
        is_user_verified=False,  # Always set to False regardless of input
        is_mobile_verified=user_data.is_mobile_verified,
        is_private_user=user_data.is_private_user,
        auth_provider=user_data.auth_provider,
        max_session=user_data.max_session,
        is_active=True  # Always set active to True for new users
    )
    
    try:
        # Add and commit the new user
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        logger.info(f"User created: {db_user.username} (ID: {db_user.id})")
        return db_user
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"Failed to create user: {str(e)}")
        # Add more detailed error information for debugging
        error_detail = str(e)
        if "violates not-null constraint" in error_detail and "id" in error_detail:
            logger.error("ID column violation - check if the database table has ID defined as SERIAL/BIGSERIAL")
        elif "unique constraint" in error_detail:
            if "username" in error_detail:
                error_detail = "Username already exists"
            elif "email" in error_detail:
                error_detail = "Email already exists"
            elif "mobile_number" in error_detail:
                error_detail = "Mobile number already exists"
        
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=f"Could not create user: {error_detail}"
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error creating user: {str(e)}")
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=f"An unexpected error occurred: {str(e)}"
        )

async def update_user(
    db: AsyncSession, 
    user_id: int, 
    user_data: UserUpdate
) -> Optional[User]:
    """
    Update a user.
    
    Args:
        db: Database session
        user_id: ID of the user to update
        user_data: New user data
        
    Returns:
        Updated User object
        
    Raises:
        HTTPException: If the user doesn't exist or if there's a conflict
    """
    # Get existing user
    db_user = await get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if mobile number is changing and already exists
    if user_data.mobile_number and user_data.mobile_number != db_user.mobile_number:
        existing_mobile = await get_user_by_mobile(db, user_data.mobile_number)
        if existing_mobile:
            raise HTTPException(
                status_code=HTTP_409_CONFLICT,
                detail="Mobile number already registered"
            )
    
    # Prepare update data dictionary
    update_data = user_data.model_dump(exclude_unset=True)
    
    if not update_data:
        # No fields to update
        return db_user
    
    try:
        # Update the user
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(**update_data)
            .execution_options(synchronize_session="fetch")
        )
        
        await db.execute(stmt)
        await db.commit()
        
        # Refresh user object
        await db.refresh(db_user)
        
        logger.info(f"User updated: {db_user.username} (ID: {db_user.id})")
        return db_user
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"Failed to update user: {str(e)}")
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="Could not update user. Please check your input."
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error updating user: {str(e)}")
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="An unexpected error occurred"
        )

async def update_user_login_timestamp(db: AsyncSession, user_id: int) -> bool:
    """
    Update a user's last login timestamp.
    
    Args:
        db: Database session
        user_id: ID of the user to update
        
    Returns:
        True if successful, False otherwise
    """
    try:
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(last_login=func.now())
            .execution_options(synchronize_session="fetch")
        )
        
        await db.execute(stmt)
        await db.commit()
        
        logger.info(f"Updated last login for user ID: {user_id}")
        return True
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to update last login: {str(e)}")
        return False

async def deactivate_user(db: AsyncSession, user_id: int) -> bool:
    """
    Deactivate a user (soft delete).
    
    Args:
        db: Database session
        user_id: ID of the user to deactivate
        
    Returns:
        True if successful, False if user not found
        
    Raises:
        HTTPException: If there's a database error
    """
    # Check if user exists
    db_user = await get_user_by_id(db, user_id)
    if not db_user:
        return False
    
    try:
        # Set is_active to False
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(is_active=False)
            .execution_options(synchronize_session="fetch")
        )
        
        await db.execute(stmt)
        await db.commit()
        
        logger.info(f"User deactivated: {db_user.username} (ID: {db_user.id})")
        return True
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to deactivate user: {str(e)}")
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="Failed to deactivate user"
        )

async def search_public_users(
    db: AsyncSession,
    search_term: Optional[str] = None,
    limit: int = 5,
    exclude_user_id: Optional[int] = None
) -> List[User]:
    """
    Search for verified, public users by name, username, or email.
    
    Args:
        db: Database session
        search_term: Term to search for (optional)
        limit: Maximum number of users to return
        exclude_user_id: User ID to exclude from results (typically the current user)
        
    Returns:
        List of matching verified users
    """
    # Base conditions: active, verified users who are not private
    conditions = [
        User.is_active == True,
        User.is_private_user == False,
        User.is_user_verified == True
    ]
    
    # Exclude the current user if an ID is provided
    if exclude_user_id is not None:
        conditions.append(User.id != exclude_user_id)
    
    query = (
        select(User)
        .where(and_(*conditions))
        .limit(limit)
    )
    
    # Apply search term if provided
    if search_term:
        search_pattern = f"%{search_term}%"
        query = query.where(
            or_(
                User.name.ilike(search_pattern),
                User.username.ilike(search_pattern),
                User.email.ilike(search_pattern)
            )
        )
    
    # Execute query with optimization for faster results
    # Using LIMIT directly in the query for better performance
    result = await db.execute(query)
    return result.scalars().all()