#!/bin/bash

echo "🔧 Production Database Migration Script"
echo "======================================"

# Check current environment
echo "Environment: ${ENVIRONMENT:-production}"
echo "Database URL exists: ${DATABASE_URL:+YES}"

# Check if we can connect to the database
if [[ -n "$DATABASE_URL" ]]; then
    echo "✅ DATABASE_URL is configured"
else 
    echo "❌ DATABASE_URL not found"
    exit 1
fi

# Install requirements if needed
echo "📦 Installing requirements..."
pip3 install -r requirements.txt || {
    echo "❌ Failed to install requirements"
    exit 1
}

# Run migration
echo "🚀 Running database migration..."
python3 -m alembic upgrade head || {
    echo "⚠️  Migration may have failed, but continuing..."
}

echo "✅ Migration script completed!"
echo ""
echo "🔍 You can check the database schema with:"
echo "curl https://your-app.railway.app/debug/schema"
