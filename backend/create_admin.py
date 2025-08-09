import os
import psycopg2
from passlib.context import CryptContext
from datetime import datetime

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Database connection
db_url = os.getenv("DATABASE_URL", "postgresql://postgres:SYUbfiDuzlUYeOzXRRWuherDJpiWkcAr@nozomi.proxy.rlwy.net:22599/railway")

try:
    from urllib.parse import urlparse
    parsed = urlparse(db_url)
    
    conn = psycopg2.connect(
        host=parsed.hostname,
        port=parsed.port,
        database=parsed.path[1:],
        user=parsed.username,
        password=parsed.password
    )
    
    cursor = conn.cursor()
    
    # Check if admin user exists
    cursor.execute("SELECT id, username FROM users WHERE username = %s", ("admin",))
    existing = cursor.fetchone()
    
    if existing:
        print(f"✅ Admin user already exists: ID {existing[0]}, Username: {existing[1]}")
    else:
        # Create admin user
        hashed_password = hash_password("admin123")
        cursor.execute("""
            INSERT INTO users (username, email, hashed_password, role, is_active, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, username, email
        """, ("admin", "admin@sme.local", hashed_password, "superadmin", True, datetime.utcnow()))
        
        new_user = cursor.fetchone()
        conn.commit()
        
        print(f"✅ Created admin user:")
        print(f"   ID: {new_user[0]}")
        print(f"   Username: {new_user[1]}")
        print(f"   Email: {new_user[2]}")
        print(f"   Password: admin123")
        print(f"⚠️  Please change password after first login!")
    
    # Show all users
    cursor.execute("SELECT id, username, email, role, is_active FROM users ORDER BY id")
    users = cursor.fetchall()
    print(f"\n📋 All users in database ({len(users)}):")
    for user in users:
        print(f"   {user[0]}: {user[1]} ({user[2]}) - {user[3]} - {'Active' if user[4] else 'Inactive'}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
