# app/core/security.py

import bcrypt
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union

import jwt
from passlib.context import CryptContext
from app.core.config.settings import get_settings

settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        subject: The subject of the token (usually user ID)
        expires_delta: Optional expiration time, defaults to settings value
        
    Returns:
        Encoded JWT token as a string
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode a JWT access token.
    
    Args:
        token: The JWT token to decode
        
    Returns:
        Decoded token payload
        
    Raises:
        jwt.PyJWTError: If token is invalid
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

def generate_random_password(length: int = 12) -> str:
    """
    Generate a secure random password.
    
    Args:
        length: Length of the password
        
    Returns:
        A random password string
    """
    import secrets
    import string
    
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()_-+=<>?"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    
    # Ensure password contains at least one of each character type
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_-+=<>?" for c in password)
    
    if not (has_upper and has_lower and has_digit and has_special):
        # If not, generate a new password recursively
        return generate_random_password(length)
    
    return password