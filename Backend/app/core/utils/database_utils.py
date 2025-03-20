# app/core/database_utils.py

import logging
from sqlalchemy.engine import make_url

logger = logging.getLogger(__name__)

def get_sync_db_url(async_url):
    """
    Convert an async database URL to a sync URL for SQLAlchemy.
    This is necessary because Alembic doesn't support async drivers.
    
    Args:
        async_url: Database URL with async driver
        
    Returns:
        Database URL with sync driver
    """
    try:
        # Parse the URL
        url = make_url(async_url)
        
        # Check if it's already a sync URL
        if '+asyncpg' not in str(url) and '+aiopg' not in str(url):
            return async_url
            
        # Convert to sync URL
        if '+asyncpg' in str(url):
            sync_url = str(url).replace('+asyncpg', '')
        elif '+aiopg' in str(url):
            sync_url = str(url).replace('+aiopg', '')
        else:
            # If we don't recognize the async driver, return as is
            return async_url
            
        logger.info(f"Converted async DB URL to sync URL for Alembic/SQLAlchemy core")
        return sync_url
    except Exception as e:
        logger.error(f"Error converting async URL to sync URL: {e}")
        # Fall back to the original URL
        return async_url