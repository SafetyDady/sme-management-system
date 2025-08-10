"""Migrate user employee data to hr_employees and remove duplicate fields

Revision ID: 3c5e7f8g9h12
Revises: 1a2b3c4d5e66
Create Date: 2025-08-10 17:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '3c5e7f8g9h12'
down_revision: Union[str, None] = '4d6f8h9j0k23'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Step 1: Migrate existing employee data from users to hr_employees (if any exists)
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    
    # Check if users table has employee fields
    user_columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'employee_code' in user_columns:
        # Migrate data only if employee fields exist in users table
        op.execute("""
            INSERT INTO hr_employees (
                user_id, emp_code, first_name, last_name, position, 
                department, contact_phone, contact_address, active_status, created_at, updated_at
            )
            SELECT 
                u.id as user_id,
                u.employee_code as emp_code,
                COALESCE(SPLIT_PART(u.username, '.', 1), 'Unknown') as first_name,
                COALESCE(SPLIT_PART(u.username, '.', 2), 'User') as last_name,
                u.position,
                u.department,
                u.phone as contact_phone,
                COALESCE(u.address, '') as contact_address,
                u.is_active as active_status,
                u.created_at,
                u.created_at as updated_at
            FROM users u 
            WHERE u.employee_code IS NOT NULL 
            AND NOT EXISTS (
                SELECT 1 FROM hr_employees he WHERE he.user_id = u.id
            )
        """)
        
        # Step 2: Remove duplicate fields from users table
        with op.batch_alter_table('users') as batch_op:
            batch_op.drop_index('ix_users_employee_code')
            batch_op.drop_index('ix_users_department')
            batch_op.drop_column('employee_code')
            batch_op.drop_column('department')
            batch_op.drop_column('position')
            batch_op.drop_column('hire_date')
            batch_op.drop_column('phone')
            batch_op.drop_column('address')


def downgrade() -> None:
    # Step 1: Re-add employee fields to users table
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('employee_code', sa.String(length=30), nullable=True))
        batch_op.add_column(sa.Column('department', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('position', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('hire_date', sa.Date(), nullable=True))
        batch_op.add_column(sa.Column('phone', sa.String(length=30), nullable=True))
        batch_op.add_column(sa.Column('address', sa.Text(), nullable=True))
        batch_op.create_index('ix_users_employee_code', ['employee_code'], unique=True)
        batch_op.create_index('ix_users_department', ['department'])
    
    # Step 2: Migrate data back from hr_employees to users
    op.execute("""
        UPDATE users SET
            employee_code = he.emp_code,
            department = he.department,
            position = he.position,
            phone = he.contact_phone,
            address = he.contact_address
        FROM hr_employees he
        WHERE users.id = he.user_id
    """)
    
    # Step 3: Remove hr_employees records that were created from users migration
    # (Keep only records that existed before this migration)
    # Note: This is a simplified approach - in production, you might want more sophisticated tracking
