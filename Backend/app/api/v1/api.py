"""
API router configuration for v1 endpoints.
This module imports all route modules and configures the main API router.
"""
import importlib
import os
import pkgutil
import logging
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter

from app.core.config.settings import get_settings

# Get settings
settings = get_settings()

# Set up logger
logger = logging.getLogger(__name__)

# Create the main v1 API router
api_router = APIRouter(prefix=settings.API_V1_STR)

def get_api_modules() -> List[str]:
    """
    Discover all API modules in the current package.
    
    Returns:
        List of module names that should be imported
    """
    package_path = Path(__file__).parent
    modules = []
    
    # Exclude these files from being treated as route modules
    exclude_files = ['__init__.py', 'api.py']
    
    for module_info in pkgutil.iter_modules([str(package_path)]):
        module_name = module_info.name
        if module_name not in [os.path.splitext(f)[0] for f in exclude_files]:
            modules.append(f"app.api.v1.{module_name}")
    
    return modules

def setup_routers(base_router: APIRouter = api_router) -> APIRouter:
    """
    Dynamically import all route modules and include their routers.
    
    Args:
        base_router: The base router to which all route modules will be attached
        
    Returns:
        Configured API router with all routes
    """
    modules = get_api_modules()
    
    # Import each module and include its router
    for module_name in modules:
        try:
            module = importlib.import_module(module_name)
            
            # Look for a router attribute in the module
            if hasattr(module, 'router'):
                logger.info(f"Including API routes from {module_name}")
                base_router.include_router(module.router)
            else:
                logger.warning(f"No router found in {module_name}")
                
        except ImportError as e:
            logger.error(f"Failed to import {module_name}: {str(e)}")
        except Exception as e:
            logger.error(f"Error setting up router for {module_name}: {str(e)}")
    
    return base_router

# Set up all routers
api_router = setup_routers(api_router)