#!/usr/bin/env python3
"""
Create admin user in production database
"""
import os
import sys
import asyncpg
import bcrypt
from datetime import datetime
import uuid

async def create_admin_user():
    """Create admin user in production database"""
    
    # Get database URL from environment
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not found in environment")
        return False
    
    try:
        # Connect to database
        print(f"🔗 Connecting to database...")
        conn = await asyncpg.connect(database_url, ssl='require')
        
        # Check if admin user exists
        existing_user = await conn.fetchrow(
            "SELECT username FROM users WHERE username = $1", 
            'admin'
        )
        
        if existing_user:
            print("✅ Admin user already exists")
            await conn.close()
            return True
        
        # Hash password
        password_bytes = 'admin123'.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
        # Create admin user
        user_id = str(uuid.uuid4())
        await conn.execute("""
            INSERT INTO users (id, username, email, hashed_password, role, is_active, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """, user_id, 'admin', 'admin@sme.local', hashed_password, 'superadmin', True, datetime.utcnow())
        
        print("✅ Admin user created successfully!")
        print("   Username: admin")
        print("   Password: admin123")
        print("   Role: superadmin")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return False

if __name__ == "__main__":
    import asyncio
    success = asyncio.run(create_admin_user())
    sys.exit(0 if success else 1)
