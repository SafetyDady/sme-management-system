"""add_employee_fields_safe

Revision ID: 4c7ba3dadedc
Revises: bd12eba79c4c
Create Date: 2025-08-12 12:50:24.211309

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4c7ba3dadedc'
down_revision: Union[str, None] = 'bd12eba79c4c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add employee fields to users table safely"""
    # Add employee fields as nullable columns
    try:
        op.add_column('users', sa.Column('employee_code', sa.String(50), nullable=True))
        op.add_column('users', sa.Column('department', sa.String(100), nullable=True))
        op.add_column('users', sa.Column('position', sa.String(100), nullable=True))
        op.add_column('users', sa.Column('hire_date', sa.Date(), nullable=True))
        op.add_column('users', sa.Column('phone', sa.String(20), nullable=True))
        op.add_column('users', sa.Column('address', sa.Text(), nullable=True))
        
        # Create unique index on employee_code if not null
        op.create_index('ix_users_employee_code', 'users', ['employee_code'], unique=True, 
                       postgresql_where=sa.text('employee_code IS NOT NULL'))
        
    except Exception as e:
        # If columns already exist, ignore the error
        print(f"Some columns may already exist: {e}")


def downgrade() -> None:
    """Remove employee fields from users table"""
    try:
        op.drop_index('ix_users_employee_code', table_name='users')
        op.drop_column('users', 'address')
        op.drop_column('users', 'phone')  
        op.drop_column('users', 'hire_date')
        op.drop_column('users', 'position')
        op.drop_column('users', 'department')
        op.drop_column('users', 'employee_code')
    except Exception as e:
        print(f"Some columns may not exist: {e}")
