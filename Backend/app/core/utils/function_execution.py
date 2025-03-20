# app/core/utils/function_execution.py

import logging
import sys
import traceback
from typing import Any, Callable, Optional, TypeVar, Dict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

T = TypeVar('T')

def safe_execute(
    func: Callable[..., T], 
    error_message: str = "Function execution failed", 
    default_return: Optional[T] = None,
    log_error: bool = True,
    raise_error: bool = False,
    **kwargs
) -> T:
    """
    Safely execute a function and handle exceptions.
    
    Args:
        func: The function to execute
        error_message: Message to log if the function fails
        default_return: Value to return if the function fails
        log_error: Whether to log the error
        raise_error: Whether to re-raise the exception
        **kwargs: Keyword arguments to pass to the function
        
    Returns:
        The function result or default_return if the function fails
    """
    try:
        return func(**kwargs)
    except Exception as e:
        if log_error:
            logger.error(f"{error_message}: {str(e)}")
            logger.debug(traceback.format_exc())
        
        if raise_error:
            raise
            
        return default_return

def safe_db_operation(
    func: Callable[..., T],
    db_session,
    error_message: str = "Database operation failed",
    default_return: Optional[T] = None,
    commit: bool = True,
    rollback_on_error: bool = True,
    log_error: bool = True,
    raise_error: bool = False,
    **kwargs
) -> T:
    """
    Safely execute a database operation and handle exceptions.
    
    Args:
        func: The function to execute
        db_session: The SQLAlchemy session to use
        error_message: Message to log if the function fails
        default_return: Value to return if the function fails
        commit: Whether to commit the session after execution
        rollback_on_error: Whether to rollback the session on error
        log_error: Whether to log the error
        raise_error: Whether to re-raise the exception
        **kwargs: Keyword arguments to pass to the function
        
    Returns:
        The function result or default_return if the function fails
    """
    try:
        result = func(db_session=db_session, **kwargs)
        if commit:
            db_session.commit()
        return result
    except Exception as e:
        if rollback_on_error:
            db_session.rollback()
            
        if log_error:
            logger.error(f"{error_message}: {str(e)}")
            logger.debug(traceback.format_exc())
            
        if raise_error:
            raise
            
        return default_return

def retry_operation(
    func: Callable[..., T],
    max_attempts: int = 3,
    retry_delay: float = 1.0,
    error_message: str = "Operation failed",
    default_return: Optional[T] = None,
    log_error: bool = True,
    raise_error: bool = False,
    **kwargs
) -> T:
    """
    Retry a function multiple times with exponential backoff.
    
    Args:
        func: The function to execute
        max_attempts: Maximum number of attempts
        retry_delay: Initial delay between retries (in seconds)
        error_message: Message to log if all attempts fail
        default_return: Value to return if all attempts fail
        log_error: Whether to log errors
        raise_error: Whether to re-raise the exception after all attempts
        **kwargs: Keyword arguments to pass to the function
        
    Returns:
        The function result or default_return if all attempts fail
    """
    import time
    
    last_error = None
    
    for attempt in range(1, max_attempts + 1):
        try:
            return func(**kwargs)
        except Exception as e:
            last_error = e
            
            if log_error:
                logger.warning(f"Attempt {attempt}/{max_attempts} failed: {str(e)}")
                
            if attempt < max_attempts:
                # Exponential backoff
                sleep_time = retry_delay * (2 ** (attempt - 1))
                time.sleep(sleep_time)
    
    # All attempts failed
    if log_error:
        logger.error(f"{error_message} after {max_attempts} attempts: {str(last_error)}")
    
    if raise_error and last_error:
        raise last_error
        
    return default_return