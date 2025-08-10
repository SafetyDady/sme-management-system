#!/usr/bin/env python3
"""
Database connection script for sme-management-system-production
Connect to Railway PostgreSQL and check users table
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
import json

def get_database_url():
    """Get database URL from Railway backend"""
    try:
        # Try to get database info from backend
        response = requests.get("https://sme-management-system-production.up.railway.app/")
        print("Backend response:", response.json())
        
        # The backend should have DATABASE_URL environment variable
        # But we need to get it from Railway dashboard
        print("\n💡 Need to get DATABASE_URL from Railway dashboard environment variables")
        print("Go to: Railway Dashboard → sme-management-system → Variables")
        print("Look for: DATABASE_URL or POSTGRES_URL")
        
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def connect_and_check_users(database_url):
    """Connect to database and check users"""
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if users table exists
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users';
        """)
        tables = cursor.fetchall()
        print(f"Users table exists: {len(tables) > 0}")
        
        if len(tables) > 0:
            # Get all users
            cursor.execute("""
                SELECT id, username, email, role, is_active, created_at 
                FROM users 
                ORDER BY created_at;
            """)
            users = cursor.fetchall()
            
            print(f"\n📊 Found {len(users)} users:")
            for user in users:
                print(f"  - {user['username']} ({user['email']}) - Role: {user['role']} - Active: {user['is_active']}")
        else:
            print("❌ No users table found")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Database connection error: {e}")

def check_backend_endpoints():
    """Check what endpoints are available"""
    base_url = "https://sme-management-system-production.up.railway.app"
    
    endpoints_to_check = [
        "/",
        "/health", 
        "/auth/login",
        "/admin/check-users",
        "/docs"
    ]
    
    print("\n🔍 Checking available endpoints:")
    for endpoint in endpoints_to_check:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            status = "✅" if response.status_code == 200 else f"❌ {response.status_code}"
            print(f"  {endpoint}: {status}")
            
            if endpoint == "/" and response.status_code == 200:
                data = response.json()
                if "modules" in data:
                    print(f"    Modules: {data['modules']}")
                    
        except Exception as e:
            print(f"  {endpoint}: ❌ Error - {e}")

if __name__ == "__main__":
    print("🔧 SME Management System Database Check")
    print("=" * 50)
    
    # Check backend endpoints first
    check_backend_endpoints()
    
    # Try to get database URL
    database_url = get_database_url()
    
    if database_url:
        connect_and_check_users(database_url)
    else:
        print("\n💡 To check database manually:")
        print("1. Go to Railway Dashboard")
        print("2. Select sme-management-system service") 
        print("3. Go to Variables tab")
        print("4. Copy DATABASE_URL")
        print("5. Run: psql 'DATABASE_URL_HERE' -c 'SELECT * FROM users;'")
