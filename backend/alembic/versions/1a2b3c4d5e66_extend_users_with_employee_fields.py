"""Extend users table with employee/HR profile fields

Revision ID: 1a2b3c4d5e66
Revises: f3a53b79e3bd
Create Date: 2025-08-10 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '1a2b3c4d5e66'
down_revision: Union[str, None] = '2b4c6d7e8f90'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add nullable columns (additive, fast, reversible)
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('employee_code', sa.String(length=30), nullable=True))
        batch_op.add_column(sa.Column('department', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('position', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('hire_date', sa.Date(), nullable=True))
        batch_op.add_column(sa.Column('phone', sa.String(length=30), nullable=True))
        batch_op.add_column(sa.Column('address', sa.Text(), nullable=True))
        batch_op.create_index('ix_users_employee_code', ['employee_code'], unique=True)
        batch_op.create_index('ix_users_department', ['department'])


def downgrade() -> None:
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_index('ix_users_department')
        batch_op.drop_index('ix_users_employee_code')
        batch_op.drop_column('address')
        batch_op.drop_column('phone')
        batch_op.drop_column('hire_date')
        batch_op.drop_column('position')
        batch_op.drop_column('department')
        batch_op.drop_column('employee_code')
