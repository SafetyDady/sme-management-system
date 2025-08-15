"""Add employee_id to users table

Revision ID: 005_user_employee_id  
Revises: 4c7ba3dadedc
Create Date: 2025-08-13 19:50:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '005_user_employee_id'
down_revision = '4c7ba3dadedc'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add employee_id column to users table with unique constraint
    op.add_column('users', sa.Column('employee_id', sa.Integer(), nullable=True))
    op.create_unique_constraint('users_employee_id_unique', 'users', ['employee_id'])
    op.create_index('idx_users_employee_id', 'users', ['employee_id'])


def downgrade() -> None:
    # Remove employee_id column and constraints
    op.drop_index('idx_users_employee_id', 'users')
    op.drop_constraint('users_employee_id_unique', 'users', type_='unique')
    op.drop_column('users', 'employee_id')
