from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
import os
import sys
from dotenv import load_dotenv

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Load environment variables from .env
load_dotenv()

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
from app.db.database import Base
from app.models import Base, User, UserConnection, Transaction, Group, GroupMember, TransactionSummary, UserSession, SocialAuth

target_metadata = Base.metadata

# Helper function to convert async URL to sync URL
def get_sync_db_url(async_url):
    """Convert an async database URL to a sync URL for Alembic."""
    if async_url and '+asyncpg' in async_url:
        return async_url.replace('+asyncpg', '')
    return async_url

# Get database URL from environment and convert to sync URL if needed
database_url = get_sync_db_url(os.getenv('DATABASE_URL'))
config.set_main_option('sqlalchemy.url', database_url)

def run_migrations_offline():
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()