"""Initial schema

Revision ID: aa0c7e2939e5
Revises: 
Create Date: 2025-03-20 00:41:22.767504

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aa0c7e2939e5'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user_connections',
    sa.Column('user_id', sa.BigInteger(), nullable=False),
    sa.Column('connected_user_id', sa.BigInteger(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('last_updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['connected_user_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('user_id', 'connected_user_id')
    )
    op.create_index(op.f('ix_user_connections_connected_user_id'), 'user_connections', ['connected_user_id'], unique=False)
    op.create_table('user_sessions',
    sa.Column('session_id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.BigInteger(), nullable=False),
    sa.Column('access_token', sa.Text(), nullable=False),
    sa.Column('refresh_token', sa.Text(), nullable=False),
    sa.Column('user_agent', sa.Text(), nullable=False),
    sa.Column('ip_address', sa.String(), nullable=False),
    sa.Column('device_info', sa.Text(), nullable=True),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('last_activity', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('last_updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('session_id')
    )
    op.create_index(op.f('ix_user_sessions_expires_at'), 'user_sessions', ['expires_at'], unique=False)
    op.create_index(op.f('ix_user_sessions_user_id'), 'user_sessions', ['user_id'], unique=False)
    op.create_table('group_members',
    sa.Column('group_id', sa.BigInteger(), nullable=False),
    sa.Column('user_id', sa.BigInteger(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('last_updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['group_id'], ['groups.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('group_id', 'user_id')
    )
    op.create_index(op.f('ix_group_members_user_id'), 'group_members', ['user_id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_group_members_user_id'), table_name='group_members')
    op.drop_table('group_members')
    op.drop_index(op.f('ix_user_sessions_user_id'), table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_expires_at'), table_name='user_sessions')
    op.drop_table('user_sessions')
    op.drop_index(op.f('ix_user_connections_connected_user_id'), table_name='user_connections')
    op.drop_table('user_connections')
    # ### end Alembic commands ###
