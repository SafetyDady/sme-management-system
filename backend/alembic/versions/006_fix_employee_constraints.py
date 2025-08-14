"""Fix employee assignment constraints

Revision ID: 006_fix_employee_constraints
Revises: 005_user_employee_id
Create Date: 2025-08-14 13:50:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '006_fix_employee_constraints'
down_revision = '005_user_employee_id'
branch_labels = None
depends_on = None

def upgrade():
    # Drop the problematic unique constraint on hr_employees.user_id
    try:
        op.drop_constraint('uq_hr_employees_user_id', 'hr_employees', type_='unique')
        print("✅ Dropped uq_hr_employees_user_id constraint")
    except Exception as e:
        print(f"⚠️  Could not drop uq_hr_employees_user_id: {e}")
    
    # Ensure unique constraint on users.employee_id exists
    try:
        op.create_unique_constraint('uq_users_employee_id', 'users', ['employee_id'])
        print("✅ Created uq_users_employee_id constraint")
    except Exception as e:
        print(f"⚠️  Could not create uq_users_employee_id: {e}")

def downgrade():
    # Recreate the constraint if needed
    try:
        op.drop_constraint('uq_users_employee_id', 'users', type_='unique')
        op.create_unique_constraint('uq_hr_employees_user_id', 'hr_employees', ['user_id'])
        print("✅ Restored uq_hr_employees_user_id constraint")
    except Exception as e:
        print(f"⚠️  Could not restore constraints: {e}")
