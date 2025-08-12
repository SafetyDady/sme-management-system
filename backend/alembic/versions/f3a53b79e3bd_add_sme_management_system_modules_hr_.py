"""Add SME Management System modules - HR, Projects, Inventory, Financial

Revision ID: f3a53b79e3bd
Revises: ea0be61f2816
Create Date: 2025-08-08 15:33:49.626174

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f3a53b79e3bd'
down_revision: Union[str, None] = 'ea0be61f2816'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create lean HR employees table (phase 1)
    op.create_table(
        'hr_employees',
        sa.Column('employee_id', sa.Integer(), primary_key=True, index=True),
        sa.Column('emp_code', sa.String(length=20), nullable=False),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('first_name', sa.String(length=50), nullable=False),
        sa.Column('last_name', sa.String(length=50), nullable=False),
        sa.Column('position', sa.String(length=100), nullable=True),
        sa.Column('department', sa.String(length=100), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('active_status', sa.Boolean(), nullable=True, server_default=sa.text('true')),
        sa.Column('contact_phone', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('created_by', sa.String(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('updated_by', sa.String(), sa.ForeignKey('users.id'), nullable=True)
    )
    op.create_index('ix_hr_employees_emp_code', 'hr_employees', ['emp_code'], unique=True)
    op.create_index('ix_hr_employees_department', 'hr_employees', ['department'])
    op.create_index('ix_hr_employees_active_status', 'hr_employees', ['active_status'])


def downgrade() -> None:
    op.drop_index('ix_hr_employees_active_status', table_name='hr_employees')
    op.drop_index('ix_hr_employees_department', table_name='hr_employees')
    op.drop_index('ix_hr_employees_emp_code', table_name='hr_employees')
    op.drop_table('hr_employees')
