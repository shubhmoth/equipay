# app/startup.py
import logging
import sys
from sqlalchemy.exc import SQLAlchemyError

from app.core.utils.function_execution import safe_execute
from app.db.initializer import (
    check_database_connection,
    check_async_database_connection,
    initialize_db
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

async def startup_event(engine, async_engine, settings):
    """Run startup tasks when the application starts"""
    logger.info("Running application startup tasks...")
    
    # Check database connection first
    db_connected = check_database_connection(engine)
    if not db_connected:
        logger.error("❌ Database connection failed. Shutting down application.")
        raise SystemExit("Database connection failed. Cannot start the application.")
    
    # Initialize database with schema synchronization
    db_initialized = initialize_db(engine, {
        'create_tables': settings.DB_CREATE_TABLES,
        'run_migrations': settings.DB_RUN_MIGRATIONS,
        'sync_schema': settings.DB_AUTO_MIGRATE,
        'update_models': settings.DB_SAVE_SCHEMA_SNAPSHOT
    })
    
    if not db_initialized:
        logger.error("❌ Database initialization failed. Shutting down application.")
        raise SystemExit("Database initialization failed. Cannot start the application.")
    
    # Check async database connection
    async_db_connected = await check_async_database_connection(async_engine)
    
    if not async_db_connected:
        logger.error("❌ Async database connection failed. Shutting down application.")
        raise SystemExit("Async database connection failed. Cannot start the application.")
    else:
        logger.info("✅ Async database connection verified successfully")
    
    logger.info("✅ All startup checks passed. Application is ready.")

async def shutdown_event():
    """Run tasks when the application shuts down"""
    logger.info("Running shutdown tasks...")
    # Add any shutdown cleanup here if needed