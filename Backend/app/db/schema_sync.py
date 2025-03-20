# app/db/schema_sync.py
import logging
import traceback
from sqlalchemy import inspect, text, MetaData, Table, Column
from sqlalchemy.schema import DropTable, DropConstraint
from sqlalchemy.dialects.postgresql import BIGINT, VARCHAR, TEXT, BOOLEAN, INTEGER, TIMESTAMP, SMALLINT
from sqlalchemy.exc import OperationalError, ProgrammingError

logger = logging.getLogger(__name__)

class SchemaSynchronizer:
    """Utility class to synchronize SQLAlchemy models with database schema"""
    
    def __init__(self, engine, models, settings):
        """
        Initialize the schema synchronizer
        
        Args:
            engine: SQLAlchemy engine
            models: List of SQLAlchemy model classes
            settings: Application settings
        """
        self.engine = engine
        self.models = models
        self.settings = settings
        self.inspector = inspect(engine)
        
        self.type_map = {
            'String': 'character varying',
            'Integer': 'integer',
            'Boolean': 'boolean',
            'DateTime': 'timestamp with time zone',
            'BigInteger': 'bigint',
            'SmallInteger': 'smallint',
            'Text': 'text'
        }
    
    def get_db_tables(self):
        """Get all tables in the database"""
        return set(self.inspector.get_table_names())
    
    def get_model_tables(self):
        """Get all table names defined in the models"""
        return {model.__tablename__ for model in self.models}
    
    def get_excluded_tables(self):
        """Get tables that should be excluded from operations"""
        return set(self.settings.EXCLUDED_TABLES)
    
    def get_table_columns(self, table_name):
        """Get all columns in a database table"""
        try:
            return {c['name']: c for c in self.inspector.get_columns(table_name)}
        except Exception as e:
            logger.error(f"Error getting columns for table {table_name}: {e}")
            return {}
    
    def get_model_columns(self, model):
        """Get all columns defined in a model"""
        return {c.name: c for c in model.__table__.columns}
    
    def compare_column_type(self, model_col, db_col):
        """
        Compare column types between model and database
        
        Returns:
            bool: True if types are compatible, False otherwise
        """
        model_type = str(model_col.type)
        for sa_type, pg_type in self.type_map.items():
            if sa_type in model_type:
                model_type = pg_type
                break
        
        db_type = str(db_col['type']).lower()

        if 'character varying' in model_type.lower():
            import re
            model_length = re.search(r'\((\d+)\)', model_type)
            model_length = int(model_length.group(1)) if model_length else 0
            
            db_length = 0
            if 'character varying' in db_type:
                db_length_match = re.search(r'\((\d+)\)', db_type)
                db_length = int(db_length_match.group(1)) if db_length_match else 0
            
            if 'character varying' in db_type and model_length <= db_length:
                return True
            
            if 'character varying' in db_type and abs(model_length - db_length) > 0:
                return False
        
        model_type = model_type.lower().split('(')[0].strip()
        db_type = db_type.lower().split('(')[0].strip()
        
        return model_type == db_type
    
    def synchronize_schema(self):
        """Synchronize database schema with models"""
        db_tables = self.get_db_tables()
        model_tables = self.get_model_tables()
        excluded_tables = self.get_excluded_tables()
        
        missing_tables = model_tables - db_tables

        extra_tables = db_tables - model_tables - excluded_tables
        
        if missing_tables and self.settings.DB_CREATE_TABLES:
            logger.info(f"Creating missing tables: {missing_tables}")
            self._create_missing_tables(missing_tables)
        
        for table_name in model_tables.intersection(db_tables):
            model = next((m for m in self.models if m.__tablename__ == table_name), None)
            if not model:
                continue

            self._synchronize_table_columns(model)
        
        if extra_tables and self.settings.DB_STRICT_MODE:
            logger.warning(f"Extra tables found in database: {extra_tables}")
            if self.settings.DB_AUTO_MIGRATE:
                self._drop_extra_tables(extra_tables)
    
    def _create_missing_tables(self, missing_tables):
        """Create tables that exist in models but not in the database"""
        from app.models import Base
        
        metadata = MetaData()
        for table_name in missing_tables:
            model = next((m for m in self.models if m.__tablename__ == table_name), None)
            if model:
                Table(table_name, metadata, *[c.copy() for c in model.__table__.columns])
        
        try:
            metadata.create_all(self.engine)
            logger.info(f"Successfully created tables: {missing_tables}")
        except Exception as e:
            logger.error(f"Error creating tables: {e}")
            logger.error(traceback.format_exc())
    
    def _drop_extra_tables(self, extra_tables):
        """Drop tables that exist in the database but not in the models"""
        if not self.settings.DB_AUTO_MIGRATE:
            logger.warning("Table deletion is disabled. Set DB_AUTO_MIGRATE to True to enable.")
            return
        
        for table_name in extra_tables:
            try:
                with self.engine.begin() as conn:
                    conn.execute(text(f"""
                        DO $$
                        DECLARE
                            r RECORD;
                        BEGIN
                            FOR r IN (SELECT constraint_name 
                                    FROM information_schema.table_constraints 
                                    WHERE table_name = '{table_name}' 
                                    AND constraint_type = 'FOREIGN KEY') 
                            LOOP
                                EXECUTE 'ALTER TABLE {table_name} DROP CONSTRAINT ' || quote_ident(r.constraint_name);
                            END LOOP;
                        END $$;
                    """))
                    
                    conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
                
                logger.info(f"Dropped table {table_name}")
            except Exception as e:
                logger.error(f"Error dropping table {table_name}: {e}")
    
    def _synchronize_table_columns(self, model):
        """
        Synchronize columns of an existing table with the model
        
        Args:
            model: SQLAlchemy model class
        """
        table_name = model.__tablename__
        model_columns = self.get_model_columns(model)
        db_columns = self.get_table_columns(table_name)
        
        missing_columns = set(model_columns.keys()) - set(db_columns.keys())
        
        extra_columns = set(db_columns.keys()) - set(model_columns.keys())

        modified_columns = []
        for col_name in set(model_columns.keys()).intersection(set(db_columns.keys())):
            model_col = model_columns[col_name]
            db_col = db_columns[col_name]
            
            if not self.compare_column_type(model_col, db_col):
                modified_columns.append((col_name, model_col, db_col))
        
        if not (missing_columns or extra_columns or modified_columns):
            logger.debug(f"Table {table_name} is up to date")
            return
        
        if not self.settings.DB_AUTO_MIGRATE:
            if missing_columns:
                logger.warning(f"Missing columns in {table_name}: {missing_columns}")
            if extra_columns:
                logger.warning(f"Extra columns in {table_name}: {extra_columns}")
            if modified_columns:
                logger.warning(f"Modified columns in {table_name}: {[c[0] for c in modified_columns]}")
            return
        
        if missing_columns:
            self._add_columns(table_name, {name: model_columns[name] for name in missing_columns})
        
        if extra_columns:
            self._drop_columns(table_name, extra_columns)

        if modified_columns:
            self._modify_columns(table_name, modified_columns)
    
    def _add_columns(self, table_name, columns):
        """
        Add columns to an existing table
        
        Args:
            table_name: Name of the table
            columns: Dictionary of column_name -> SQLAlchemy Column objects
        """
        for col_name, column in columns.items():
            try:
                with self.engine.begin() as conn:
                    column_type = self._get_column_type_definition(column)
                    nullable = "NULL" if column.nullable else "NOT NULL"
                    default = f"DEFAULT {column.default.arg}" if column.default is not None and column.default.arg is not None else ""
                    
                    stmt = text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {column_type} {nullable} {default}")
                    conn.execute(stmt)
                
                logger.info(f"Added column {col_name} to table {table_name}")
            except Exception as e:
                logger.error(f"Error adding column {col_name} to table {table_name}: {e}")
    
    def _drop_columns(self, table_name, columns):
        """
        Drop columns from an existing table
        
        Args:
            table_name: Name of the table
            columns: Set of column names to drop
        """
        for col_name in columns:
            try:
                with self.engine.begin() as conn:
                    stmt = text(f"ALTER TABLE {table_name} DROP COLUMN {col_name}")
                    conn.execute(stmt)
                
                logger.info(f"Dropped column {col_name} from table {table_name}")
            except Exception as e:
                logger.error(f"Error dropping column {col_name} from table {table_name}: {e}")
    
    def _modify_columns(self, table_name, columns):
        """
        Modify columns in an existing table
        
        Args:
            table_name: Name of the table
            columns: List of tuples (column_name, model_column, db_column)
        """
        for col_name, model_col, db_col in columns:
            try:
                with self.engine.begin() as conn:
                    column_type = self._get_column_type_definition(model_col)
                    
                    stmt = text(f"ALTER TABLE {table_name} ALTER COLUMN {col_name} DROP NOT NULL")
                    try:
                        conn.execute(stmt)
                    except Exception:
                        pass
                    
                    stmt = text(f"ALTER TABLE {table_name} ALTER COLUMN {col_name} TYPE {column_type} USING {col_name}::{column_type}")
                    conn.execute(stmt)
                    
                    if not model_col.nullable:
                        stmt = text(f"ALTER TABLE {table_name} ALTER COLUMN {col_name} SET NOT NULL")
                        conn.execute(stmt)
                
                logger.info(f"Modified column {col_name} in table {table_name}")
            except Exception as e:
                logger.error(f"Error modifying column {col_name} in table {table_name}: {e}")
                logger.error(traceback.format_exc())
    
    def _get_column_type_definition(self, column):
        """
        Get PostgreSQL type definition for a SQLAlchemy column
        
        Args:
            column: SQLAlchemy Column object
            
        Returns:
            str: PostgreSQL type definition
        """
        col_type = str(column.type).upper()
        
        if 'VARCHAR' in col_type:
            length = col_type.split('(')[1].split(')')[0] if '(' in col_type else '255'
            return f"VARCHAR({length})"
        elif 'NUMERIC' in col_type:
            precision = col_type.split('(')[1].split(')')[0] if '(' in col_type else '10,2'
            return f"NUMERIC({precision})"
        
        type_mappings = {
            'INTEGER': 'INTEGER',
            'BIGINT': 'BIGINT',
            'SMALLINT': 'SMALLINT',
            'BOOLEAN': 'BOOLEAN',
            'TEXT': 'TEXT',
            'TIMESTAMP': 'TIMESTAMP',
            'TIMESTAMP WITH TIME ZONE': 'TIMESTAMP WITH TIME ZONE',
            'DATE': 'DATE',
            'TIME': 'TIME',
            'FLOAT': 'FLOAT',
            'DOUBLE': 'DOUBLE PRECISION',
            'DOUBLE_PRECISION': 'DOUBLE PRECISION',
            'REAL': 'REAL',
            'BYTEA': 'BYTEA',
            'UUID': 'UUID',
            'JSON': 'JSON',
            'JSONB': 'JSONB',
        }
        
        for sa_type, pg_type in type_mappings.items():
            if sa_type in col_type:
                return pg_type
        
        logger.warning(f"Unknown column type: {col_type}, using TEXT as fallback")
        return "TEXT"