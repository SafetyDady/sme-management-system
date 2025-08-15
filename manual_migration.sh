#!/bin/bash
# Manual Database Migration - Add employee_id to users table

echo "🔧 Manual Migration: Adding employee_id column to users table"

# PostgreSQL connection details from Railway
DB_URL="postgresql://postgres:SYUbfiDuzlUYeOzXRRWuherDJpiWkcAr@nozomi.proxy.rlwy.net:22599/railway"

echo "📊 Running SQL migration..."

psql "$DB_URL" << EOF
-- Add employee_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id INTEGER;

-- Add unique constraint
ALTER TABLE users ADD CONSTRAINT users_employee_id_unique UNIQUE (employee_id);

-- Add index for performance  
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

-- Verify the change
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'employee_id';

-- Also check hr_employees table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'hr_employees' AND column_name IN ('employee_id', 'user_id');

EOF

echo "✅ Migration completed!"
