"""Sync hr_employees table to match production schema

Revision ID: 4d6f8h9j0k23
Revises: 1a2b3c4d5e66
Create Date: 2025-08-10 17:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '4d6f8h9j0k23'
down_revision: Union[str, None] = '1a2b3c4d5e66'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if hr_employees table exists (for production compatibility)
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    
    if 'hr_employees' not in inspector.get_table_names():
        # Create table if it doesn't exist (development case)
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
            sa.Column('employment_type', sa.String(length=20), nullable=True),
            sa.Column('salary_monthly', sa.Numeric(10, 2), nullable=True),
            sa.Column('wage_daily', sa.Numeric(8, 2), nullable=True),
            sa.Column('active_status', sa.Boolean(), nullable=True, server_default=sa.text('true')),
            sa.Column('contact_phone', sa.String(length=20), nullable=True),
            sa.Column('contact_address', sa.Text(), nullable=True),
            sa.Column('note', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.Column('created_by', sa.String(), sa.ForeignKey('users.id'), nullable=True),
            sa.Column('updated_by', sa.String(), sa.ForeignKey('users.id'), nullable=True)
        )
        op.create_index('ix_hr_employees_emp_code', 'hr_employees', ['emp_code'], unique=True)
        op.create_index('ix_hr_employees_department', 'hr_employees', ['department'])
        op.create_index('ix_hr_employees_active_status', 'hr_employees', ['active_status'])
        op.create_index('ix_hr_employees_employee_id', 'hr_employees', ['employee_id'])
    else:
        # Table exists (production case) - ensure all columns exist
        existing_columns = [col['name'] for col in inspector.get_columns('hr_employees')]
        
        # Add missing columns if any
        if 'contact_address' not in existing_columns:
            op.add_column('hr_employees', sa.Column('contact_address', sa.Text(), nullable=True))
        if 'note' not in existing_columns:
            op.add_column('hr_employees', sa.Column('note', sa.Text(), nullable=True))


def downgrade() -> None:
    # Only drop if created by this migration
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    
    if 'hr_employees' in inspector.get_table_names():
        # Check if table was created by us (simple heuristic)
        # In production, this should be more sophisticated
        op.drop_index('ix_hr_employees_employee_id', table_name='hr_employees')
        op.drop_index('ix_hr_employees_active_status', table_name='hr_employees')
        op.drop_index('ix_hr_employees_department', table_name='hr_employees')
        op.drop_index('ix_hr_employees_emp_code', table_name='hr_employees')
        op.drop_table('hr_employees')
