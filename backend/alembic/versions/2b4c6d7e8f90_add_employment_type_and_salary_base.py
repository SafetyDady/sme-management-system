"""Add employment_type and salary_base to hr_employees

Revision ID: 2b4c6d7e8f90
Revises: 1a2b3c4d5e66
Create Date: 2025-08-10 00:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '2b4c6d7e8f90'
down_revision: Union[str, None] = 'f3a53b79e3bd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create hr_employees table with all fields (lean + employment/salary fields)
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
        sa.Column('employment_type', sa.String(length=30), nullable=True),
        sa.Column('salary_base', sa.Numeric(10, 2), nullable=True),
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
    op.create_index('ix_hr_employees_employment_type', 'hr_employees', ['employment_type'])


def downgrade() -> None:
    op.drop_index('ix_hr_employees_employment_type', table_name='hr_employees')
    op.drop_index('ix_hr_employees_active_status', table_name='hr_employees')
    op.drop_index('ix_hr_employees_department', table_name='hr_employees')
    op.drop_index('ix_hr_employees_emp_code', table_name='hr_employees')
    op.drop_table('hr_employees')
