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
        
        # Get columns to skip from settings
        self.columns_to_skip = settings.DB_SKIP_COLUMNS_ON_MODIFY
        
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

        # Handle autoincrement columns specially
        if getattr(model_col, 'autoincrement', False) and model_col.primary_key:
            # Check if db column is serial/bigserial or integer/bigint with sequence
            if 'integer' in db_type and 'serial' in db_type:
                return True
            if 'bigint' in db_type and ('bigserial' in db_type or self._has_sequence(model_col.table.name, model_col.name)):
                return True

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
        
        # Additional check for integer/bigint vs serial/bigserial
        if (model_type == 'integer' and db_type == 'serial') or (model_type == 'bigint' and db_type == 'bigserial'):
            return True
        
        return model_type == db_type
    
    def _has_sequence(self, table_name, column_name):
        """
        Check if a column has an associated sequence for autoincrement
        
        Args:
            table_name: Name of the table
            column_name: Name of the column
            
        Returns:
            bool: True if a sequence exists for this column
        """
        sequence_name = f"{table_name}_{column_name}_seq"
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text(
                    f"SELECT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = '{sequence_name}')"
                )).scalar()
                return result
        except Exception as e:
            logger.error(f"Error checking for sequence {sequence_name}: {e}")
            return False
    
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
        
        # First attempt with standard SQLAlchemy approach
        try:
            metadata = MetaData()
            tables_to_create = []
            
            for table_name in missing_tables:
                model = next((m for m in self.models if m.__tablename__ == table_name), None)
                if model:
                    tables_to_create.append(model.__tablename__)
                    Table(table_name, metadata, *[c.copy() for c in model.__table__.columns])
            
            metadata.create_all(self.engine)
            logger.info(f"Successfully created tables: {tables_to_create}")
        except Exception as e:
            logger.error(f"Error creating tables with SQLAlchemy: {e}")
            logger.error(traceback.format_exc())
            
            # If standard approach fails, try to create tables using raw SQL
            # This is especially important for autoincrement columns with asyncpg
            for table_name in missing_tables:
                self._create_table_with_raw_sql(table_name)
    
    def _create_table_with_raw_sql(self, table_name):
        """Create a table using raw SQL statements"""
        model = next((m for m in self.models if m.__tablename__ == table_name), None)
        if not model:
            return
            
        try:
            columns = []
            primary_keys = []
            autoincrement_columns = []
            
            for column in model.__table__.columns:
                col_name = column.name
                col_type = self._get_column_type_definition(column, skip_serial=True)
                nullable = "NULL" if column.nullable else "NOT NULL"
                
                # Handle default for non-autoincrement columns
                default = ""
                if column.default is not None and not (getattr(column, 'autoincrement', False) and column.primary_key):
                    if column.default.is_scalar:
                        default_val = column.default.arg
                        if isinstance(default_val, bool):
                            default_val = str(default_val).lower()
                        elif isinstance(default_val, str):
                            default_val = f"'{default_val}'"
                        default = f"DEFAULT {default_val}"
                
                columns.append(f"{col_name} {col_type} {nullable} {default}")
                
                if column.primary_key:
                    primary_keys.append(col_name)
                
                if getattr(column, 'autoincrement', False) and column.primary_key:
                    autoincrement_columns.append(col_name)
            
            # Add primary key constraint
            if primary_keys:
                columns.append(f"PRIMARY KEY ({', '.join(primary_keys)})")
            
            # Create table
            with self.engine.begin() as conn:
                create_table_sql = f"CREATE TABLE {table_name} ({', '.join(columns)})"
                conn.execute(text(create_table_sql))
                
                # Set up sequences for autoincrement columns
                for col_name in autoincrement_columns:
                    sequence_name = f"{table_name}_{col_name}_seq"
                    conn.execute(text(f"CREATE SEQUENCE IF NOT EXISTS {sequence_name}"))
                    conn.execute(text(f"ALTER TABLE {table_name} ALTER COLUMN {col_name} SET DEFAULT nextval('{sequence_name}')"))
            
            logger.info(f"Successfully created table {table_name} with raw SQL")
        except Exception as e:
            logger.error(f"Error creating table {table_name} with raw SQL: {e}")
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
            # Skip columns that should not be checked for modifications
            if col_name in self.columns_to_skip:
                logger.debug(f"Skipping column modification check for '{col_name}' in table '{table_name}'")
                continue
                
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
        
        if extra_columns and self.settings.DB_STRICT_MODE:
            # Don't drop columns that are in the skip list
            extra_columns_to_drop = set(extra_columns) - set(self.columns_to_skip)
            if extra_columns_to_drop:
                self._drop_columns(table_name, extra_columns_to_drop)
            
            skipped_extra_columns = set(extra_columns).intersection(set(self.columns_to_skip))
            if skipped_extra_columns:
                logger.info(f"Skipped dropping columns in {table_name}: {skipped_extra_columns}")

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
                    
                    # Handle autoincrement
                    if getattr(column, 'autoincrement', False) and column.primary_key:
                        if 'SERIAL' in column_type or 'BIGSERIAL' in column_type:
                            # Convert SERIAL to explicit INTEGER + sequence for better control
                            base_type = "INTEGER" if "SERIAL" in column_type and "BIG" not in column_type else "BIGINT"
                            stmt = text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {base_type} NOT NULL")
                        else:
                            # Otherwise, add column first then add sequence
                            nullable = "NULL" if column.nullable else "NOT NULL"
                            stmt = text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {column_type} {nullable}")
                        
                        conn.execute(stmt)
                        
                        # Create sequence and set default - simple approach
                        sequence_name = f"{table_name}_{col_name}_seq"
                        stmt = text(f"CREATE SEQUENCE IF NOT EXISTS {sequence_name}")
                        conn.execute(stmt)
                        
                        stmt = text(f"ALTER TABLE {table_name} ALTER COLUMN {col_name} SET DEFAULT nextval('{sequence_name}')")
                        conn.execute(stmt)
                        
                        # Add primary key if needed
                        if column.primary_key:
                            stmt = text(f"ALTER TABLE {table_name} ADD PRIMARY KEY ({col_name})")
                            try:
                                conn.execute(stmt)
                            except Exception as e:
                                logger.warning(f"Could not add primary key constraint to {col_name}: {e}")
                        
                        logger.info(f"Added autoincrement column {col_name} to table {table_name}")
                    else:
                        nullable = "NULL" if column.nullable else "NOT NULL"
                        default = f"DEFAULT {column.default.arg}" if column.default is not None and column.default.arg is not None else ""
                        
                        stmt = text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {column_type} {nullable} {default}")
                        conn.execute(stmt)
                
                logger.info(f"Added column {col_name} to table {table_name}")
            except Exception as e:
                logger.error(f"Error adding column {col_name} to table {table_name}: {e}")
                logger.error(traceback.format_exc())
    
    def _drop_columns(self, table_name, columns):
        """
        Drop columns from an existing table
        
        Args:
            table_name: Name of the table
            columns: Set of column names to drop
        """
        for col_name in columns:
            # Double-check to ensure we don't drop columns in the skip list
            if col_name in self.columns_to_skip:
                logger.info(f"Skipping drop of column {col_name} from table {table_name} (in skip list)")
                continue
                
            try:
                with self.engine.begin() as conn:
                    # Check if the column has a sequence
                    sequence_name = f"{table_name}_{col_name}_seq"
                    has_sequence = self._has_sequence(table_name, col_name)
                    
                    stmt = text(f"ALTER TABLE {table_name} DROP COLUMN {col_name} CASCADE")
                    conn.execute(stmt)
                    
                    # Drop the sequence if it exists
                    if has_sequence:
                        stmt = text(f"DROP SEQUENCE IF EXISTS {sequence_name}")
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
            # Skip columns that should not be modified (already filtered in _synchronize_table_columns, 
            # but double-checking here for safety)
            if col_name in self.columns_to_skip:
                logger.info(f"Skipping modification of column {col_name} in table {table_name} (in skip list)")
                continue
            
            # Special handling for autoincrement columns
            if getattr(model_col, 'autoincrement', False) and model_col.primary_key:
                self._modify_autoincrement_column(table_name, col_name, model_col, db_col)
                continue
                
            try:
                with self.engine.begin() as conn:
                    column_type = self._get_column_type_definition(model_col)
                    
                    # First drop not null constraint if exists
                    stmt = text(f"ALTER TABLE {table_name} ALTER COLUMN {col_name} DROP NOT NULL")
                    try:
                        conn.execute(stmt)
                    except Exception:
                        pass
                    
                    # Modify type
                    stmt = text(f"ALTER TABLE {table_name} ALTER COLUMN {col_name} TYPE {column_type} USING {col_name}::{column_type}")
                    conn.execute(stmt)
                    
                    # Add not null constraint if needed
                    if not model_col.nullable:
                        stmt = text(f"ALTER TABLE {table_name} ALTER COLUMN {col_name} SET NOT NULL")
                        conn.execute(stmt)
                
                logger.info(f"Modified column {col_name} in table {table_name}")
            except Exception as e:
                logger.error(f"Error modifying column {col_name} in table {table_name}: {e}")
                logger.error(traceback.format_exc())
    
    def _modify_autoincrement_column(self, table_name, col_name, model_col, db_col):
        """
        Special handling for modifying autoincrement columns
        
        Args:
            table_name: Name of the table
            col_name: Name of the column
            model_col: SQLAlchemy Column object from model
            db_col: Dictionary representing database column
        """
        try:
            with self.engine.begin() as conn:
                sequence_name = f"{table_name}_{col_name}_seq"
                has_sequence = self._has_sequence(table_name, col_name)
                
                # Drop the existing sequence if it exists but is not working correctly
                if has_sequence:
                    # Check if sequence is properly linked to the column
                    result = conn.execute(text(f"""
                        SELECT pg_get_serial_sequence('{table_name}', '{col_name}') IS NOT NULL
                    """)).scalar()
                    
                    if not result:
                        # Sequence exists but isn't correctly linked - recreate it
                        stmt = text(f"""
                            ALTER TABLE {table_name} ALTER COLUMN {col_name} DROP DEFAULT;
                            DROP SEQUENCE IF EXISTS {sequence_name};
                        """)
                        conn.execute(stmt)
                        has_sequence = False
                
                # Check if we need to transform a regular column to an autoincrement one
                if not has_sequence and not 'serial' in str(db_col['type']).lower():
                    # Create sequence
                    stmt = text(f"CREATE SEQUENCE IF NOT EXISTS {sequence_name}")
                    conn.execute(stmt)
                    
                    # Set ownership and default
                    stmt = text(f"""
                        ALTER SEQUENCE {sequence_name} OWNED BY {table_name}.{col_name};
                        ALTER TABLE {table_name} ALTER COLUMN {col_name} SET DEFAULT nextval('{sequence_name}'::regclass);
                    """)
                    conn.execute(stmt)
                    
                    # Update existing values if needed
                    stmt = text(f"""
                        DO $
                        BEGIN
                            IF EXISTS (SELECT 1 FROM {table_name} WHERE {col_name} IS NULL OR {col_name} = 0) THEN
                                UPDATE {table_name} SET {col_name} = nextval('{sequence_name}') 
                                WHERE {col_name} IS NULL OR {col_name} = 0;
                            END IF;
                        END $;
                    """)
                    conn.execute(stmt)
                
                # Ensure the column is NOT NULL
                stmt = text(f"ALTER TABLE {table_name} ALTER COLUMN {col_name} SET NOT NULL")
                try:
                    conn.execute(stmt)
                except Exception as e:
                    logger.warning(f"Column already has NOT NULL constraint: {e}")
                
                # Ensure the column is the right type
                column_type = self._get_column_type_definition(model_col, skip_serial=True)
                stmt = text(f"ALTER TABLE {table_name} ALTER COLUMN {col_name} TYPE {column_type} USING {col_name}::{column_type}")
                try:
                    conn.execute(stmt)
                except Exception as e:
                    logger.warning(f"Could not modify column type, may already be correct: {e}")
                
                # Ensure primary key constraint
                if model_col.primary_key:
                    # Check if primary key already exists
                    result = conn.execute(text(f"""
                        SELECT count(*) FROM pg_constraint 
                        WHERE conrelid = '{table_name}'::regclass 
                        AND contype = 'p'
                        AND conkey @> array[
                            (SELECT attnum FROM pg_attribute 
                             WHERE attrelid = '{table_name}'::regclass 
                             AND attname = '{col_name}')
                        ]::smallint[]
                    """)).scalar()
                    
                    if not result:
                        stmt = text(f"ALTER TABLE {table_name} ADD PRIMARY KEY ({col_name})")
                        try:
                            conn.execute(stmt)
                        except Exception as e:
                            logger.warning(f"Could not add primary key constraint to {col_name}: {e}")
            
            logger.info(f"Modified autoincrement column {col_name} in table {table_name}")
        except Exception as e:
            logger.error(f"Error modifying autoincrement column {col_name} in table {table_name}: {e}")
            logger.error(traceback.format_exc())
    
    def _get_column_type_definition(self, column, skip_serial=False):
        """
        Get PostgreSQL type definition for a SQLAlchemy column
        
        Args:
            column: SQLAlchemy Column object
            skip_serial: If True, don't convert to SERIAL types
            
        Returns:
            str: PostgreSQL type definition
        """
        # Handle autoincrement columns
        if not skip_serial and getattr(column, 'autoincrement', False) and column.primary_key:
            col_type = str(column.type).upper()
            if 'INTEGER' in col_type:
                return "SERIAL"
            elif 'BIGINT' in col_type:
                return "BIGSERIAL"
        
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
        
    def set_skip_columns(self, columns):
        """
        Set the list of columns to skip during modification checks
        
        Args:
            columns: List of column names to skip
        """
        self.columns_to_skip = columns
        logger.info(f"Set skip columns for modification: {columns}")