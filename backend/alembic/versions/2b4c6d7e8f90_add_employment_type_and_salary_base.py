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
down_revision: Union[str, None] = '1a2b3c4d5e66'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('hr_employees') as batch_op:
        batch_op.add_column(sa.Column('employment_type', sa.String(length=30), nullable=True))
        batch_op.add_column(sa.Column('salary_base', sa.Numeric(10, 2), nullable=True))
        batch_op.create_index('ix_hr_employees_employment_type', ['employment_type'])


def downgrade() -> None:
    with op.batch_alter_table('hr_employees') as batch_op:
        batch_op.drop_index('ix_hr_employees_employment_type')
        batch_op.drop_column('salary_base')
        batch_op.drop_column('employment_type')
