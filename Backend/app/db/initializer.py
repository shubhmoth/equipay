# app/db/initializer.py - updated version
import os
import logging
import importlib
import json
import traceback
from sqlalchemy import inspect, text, MetaData
from sqlalchemy.exc import OperationalError
from app.core.config.settings import get_settings
from app.db.schema_sync import SchemaSynchronizer

settings = get_settings()

logger = logging.getLogger(__name__)

def check_database_connection(engine):
    """Check database connection and report status"""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("✅ Database connection successful")
        return True
    except OperationalError as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error during database connection: {e}")
        return False

async def check_async_database_connection(async_engine):
    """Check async database connection and report status"""
    try:
        from sqlalchemy.ext.asyncio import AsyncSession
        
        async with AsyncSession(async_engine) as session:
            result = await session.execute(text("SELECT 1"))
            await session.commit()
            
        logger.info("✅ Async database connection successful")
        return True
    except Exception as e:
        logger.error(f"❌ Async database connection failed: {e}")
        return False

def get_all_models():
    """Get all SQLAlchemy models from app.models"""
    try:
        # Import all model modules to ensure they're registered
        logger.info("Importing models...")
        
        # Try to import the Base class first
        try:
            from app.models import Base
        except ImportError:
            logger.error("❌ Cannot import Base class from app.models")
            return []
        
        # Dynamically import all modules in the models directory
        models = []
        models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
        
        if not os.path.exists(models_dir):
            logger.error(f"❌ Models directory not found: {models_dir}")
            return []
            
        # Get all Python files in the models directory
        model_files = [
            f[:-3] for f in os.listdir(models_dir) 
            if f.endswith(".py") and f != "__init__.py" and not f.startswith("_")
        ]
        
        # Import each model file
        for model_file in model_files:
            try:
                module_name = f"app.models.{model_file}"
                module = importlib.import_module(module_name)
                
                # Find model classes in the module
                for attr_name in dir(module):
                    try:
                        attr = getattr(module, attr_name)
                        # Check if it's a model class
                        if (isinstance(attr, type) and 
                            hasattr(attr, "__tablename__") and 
                            hasattr(attr, "__table__")):
                            models.append(attr)
                            logger.debug(f"Found model: {attr.__name__} with table: {attr.__tablename__}")
                    except Exception as e:
                        logger.error(f"❌ Error processing model attribute {attr_name}: {e}")
            except Exception as e:
                logger.error(f"❌ Error importing model file {model_file}: {e}")
        
        logger.info(f"Found {len(models)} models in the app.models directory")
        
        if len(models) == 0:
            logger.warning("⚠️ No models found in app.models directory. Make sure your models are correctly defined.")
        
        return models
    except Exception as e:
        logger.error(f"❌ Unexpected error while getting models: {e}")
        logger.error(traceback.format_exc())
        return []

def validate_models_against_db(engine):
    """Validate that all models match the database schema"""
    try:
        inspector = inspect(engine)
        tables_in_db = set(inspector.get_table_names())
        
        models = get_all_models()
        if not models:
            logger.warning("⚠️ No models found to validate against database")
            return False, set(), set()
        
        model_tables = set(model.__tablename__ for model in models)
        
        missing_tables = model_tables - tables_in_db
        extra_tables = tables_in_db - model_tables - set(settings.EXCLUDED_TABLES)
        
        if missing_tables:
            logger.warning(f"❗ Some model tables are missing in the database: {missing_tables}")
            return False, missing_tables, extra_tables
        
        if extra_tables and settings.DB_STRICT_MODE:
            logger.warning(f"❗ Some tables in the database are not represented by models: {extra_tables}")
        
        logger.info("✅ All model tables exist in the database")
        return True, missing_tables, extra_tables
    except Exception as e:
        logger.error(f"❌ Error validating models against database: {e}")
        logger.error(traceback.format_exc())
        return False, set(), set()

def create_missing_tables(engine):
    """Create missing tables in the database if needed"""
    try:
        from app.models import Base
        logger.info("Creating all tables from Base metadata...")
        
        # Create all tables that don't exist yet
        Base.metadata.create_all(bind=engine)
        
        # Verify if tables were created
        inspector = inspect(engine)
        tables_after = set(inspector.get_table_names())
        
        models = get_all_models()
        model_tables = set(model.__tablename__ for model in models)
        
        still_missing = model_tables - tables_after
        if still_missing:
            logger.warning(f"⚠️ Some tables could not be created: {still_missing}")
            return False
        
        logger.info(f"✅ Successfully created database tables: {model_tables}")
        return True
    except Exception as e:
        logger.error(f"❌ Error creating database tables: {e}")
        logger.error(traceback.format_exc())
        return False

def synchronize_schema(engine, skip_columns=None):
    """
    Synchronize the database schema with model definitions
    
    Args:
        engine: SQLAlchemy engine
        skip_columns: List of column names to skip during synchronization
    """
    try:
        # Get all models
        models = get_all_models()
        if not models:
            logger.warning("⚠️ No models found to synchronize schema")
            return False
        
        # Initialize the schema synchronizer
        synchronizer = SchemaSynchronizer(engine, models, settings)
        
        # Set columns to skip if provided
        if skip_columns:
            synchronizer.skip_column_names = skip_columns
        
        # Perform schema synchronization
        synchronizer.synchronize_schema()
        
        logger.info("✅ Schema synchronization completed")
        return True
    except Exception as e:
        logger.error(f"❌ Error synchronizing schema: {e}")
        logger.error(traceback.format_exc())
        return False
    
def generate_schema_snapshot(output_file="schema_snapshot.json"):
    """Generate a JSON snapshot of the current schema for comparison"""
    try:
        # Get all models
        models = get_all_models()
        if not models:
            logger.warning("⚠️ No models found to generate schema snapshot")
            return False
            
        # Create a schema representation
        schema = {}
        for model in models:
            table_schema = {}
            for column in model.__table__.columns:
                col_info = {
                    "type": str(column.type),
                    "nullable": column.nullable,
                    "primary_key": column.primary_key,
                    "default": str(column.default) if column.default else None
                }
                table_schema[column.name] = col_info
            
            schema[model.__tablename__] = table_schema
        
        # Write to file
        with open(output_file, 'w') as f:
            json.dump(schema, f, indent=2)
        
        logger.info(f"✅ Schema snapshot saved to {output_file}")
        return True
    except Exception as e:
        logger.error(f"❌ Error generating schema snapshot: {e}")
        logger.error(traceback.format_exc())
        return False

def initialize_db(engine, options=None):
    """Initialize the database with various options
    
    Options:
        create_tables: Create missing tables
        run_migrations: No longer used, kept for backward compatibility
        compare_models: Compare and update table schema
        update_models: Generate schema snapshot
        sync_schema: Synchronize database schema with model definitions
    """
    if options is None:
        options = {
            'update_models': settings.DB_SAVE_SCHEMA_SNAPSHOT,
            'compare_models': settings.DB_AUTO_MIGRATE,
            'create_tables': settings.DB_CREATE_TABLES,
            'run_migrations': settings.DB_RUN_MIGRATIONS,
            'sync_schema': settings.DB_AUTO_MIGRATE
        }
    
    # Add more verbose logging
    logger.info(f"Database initialization options: {options}")
    
    # Check database connection first
    db_connected = check_database_connection(engine)
    if not db_connected:
        logger.error("❌ Cannot initialize the application without a working database connection")
        return False
    
    # Force create_tables to True on first run
    logger.info("Starting database initialization process...")
    
    # Check if models match database schema
    models_valid, missing_tables, extra_tables = validate_models_against_db(engine)
    logger.info(f"Models validation result: valid={models_valid}, missing={missing_tables}, extra={extra_tables}")
    
    # Create missing tables if requested and needed
    tables_created = True
    if options.get('create_tables', True) and (not models_valid or missing_tables):
        logger.info(f"Creating missing database tables: {missing_tables}")
        tables_created = create_missing_tables(engine)
        if not tables_created:
            logger.error("❌ Failed to create required database tables")
            return False
    
    # Synchronize schema if requested
    schema_synced = True
    if options.get('sync_schema', True):
        logger.info("Synchronizing database schema with model definitions...")
        schema_synced = synchronize_schema(engine, skip_columns=['created_at'])
        if not schema_synced:
            logger.warning("⚠️ Schema synchronization had issues - check logs for details")
    
    # Generate schema snapshot
    if options.get('update_models', False):
        logger.info("Generating schema snapshot...")
        generate_schema_snapshot()
    
    logger.info(f"Database initialization completed: success={db_connected and (models_valid or tables_created) and schema_synced}")
    return db_connected and (models_valid or tables_created) and schema_synced