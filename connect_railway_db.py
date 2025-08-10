#!/usr/bin/env python3
"""
Connect to Railway PostgreSQL and examine user data
"""
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import sys

def connect_to_railway_db():
    """Connect to Railway PostgreSQL database"""
    try:
        # Railway PostgreSQL connection string
        DATABASE_URL = "postgresql://postgres:SYUbfiDuzlUYeOzXRRWuherDJpiWkcAr@nozomi.proxy.rlwy.net:22599/railway"
        
        print("🔌 Connecting to Railway PostgreSQL...")
        print(f"📍 Host: nozomi.proxy.rlwy.net:22599")
        
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        cursor = conn.cursor()
        
        print("✅ Connected successfully!")
        
        # Check if users table exists
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users';
        """)
        
        if cursor.fetchone():
            print("📋 Users table found!")
            
            # First, check table structure
            cursor.execute("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                ORDER BY ordinal_position;
            """)
            
            columns = cursor.fetchall()
            print(f"\n🏗️ Table Structure:")
            for col in columns:
                print(f"  - {col['column_name']}: {col['data_type']} ({'NULL' if col['is_nullable'] == 'YES' else 'NOT NULL'})")
            
            # Get users data with available columns
            cursor.execute("""
                SELECT * FROM users 
                ORDER BY created_at DESC
                LIMIT 10;
            """)
            
            users = cursor.fetchall()
            print(f"\n👥 Found {len(users)} users:")
            print("-" * 80)
            
            for user in users:
                print(f"User Data: {dict(user)}")
                print("-" * 40)
            
            # Test login credentials
            print("\n🔐 Testing login credentials:")
            test_credentials = [
                ("admin1", "admin123"),
                ("admin2", "admin123"),
                ("superadmin", "superadmin123"),
                ("superadmin2", "superadmin123")
            ]
            
            for username, password in test_credentials:
                cursor.execute("""
                    SELECT username, role, is_active 
                    FROM users 
                    WHERE username = %s;
                """, (username,))
                
                user = cursor.fetchone()
                if user:
                    print(f"✅ {username}: Found - Role: {user['role']}, Active: {user['is_active']}")
                else:
                    print(f"❌ {username}: Not found")
                    
        else:
            print("❌ Users table not found!")
            
            # Show available tables
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public';
            """)
            
            tables = cursor.fetchall()
            print(f"\n📋 Available tables:")
            for table in tables:
                print(f"  - {table['table_name']}")
        
        # Close connection
        cursor.close()
        conn.close()
        print("\n🔌 Database connection closed.")
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Railway PostgreSQL Database Inspector")
    print("=" * 50)
    
    connect_to_railway_db()
