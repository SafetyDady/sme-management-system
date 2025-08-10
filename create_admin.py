#!/usr/bin/env python3
"""
Create admin user script for SME Management System
Run this script to create default admin user in production
"""
import os
import requests
import json

# Configuration
BACKEND_URL = "https://sme-management-system-production.up.railway.app"

def create_admin_user():
    """Create admin user via API"""
    
    # First check if we have any initialization endpoint
    try:
        # Try to call a test endpoint
        response = requests.get(f"{BACKEND_URL}/health")
        if response.status_code == 200:
            print("✅ Backend is healthy")
            print(response.json())
        else:
            print("❌ Backend health check failed")
            return False
            
        # Try to create admin via direct API call if endpoint exists
        admin_data = {
            "username": "admin",
            "password": "admin123",
            "email": "admin@company.com",
            "role": "SuperAdmin"
        }
        
        # This would need to be implemented in the backend
        print("💡 Need to implement admin creation endpoint in backend")
        print("🚀 Current backend URL:", BACKEND_URL)
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Creating admin user for SME Management System")
    print("=" * 50)
    
    success = create_admin_user()
    
    if success:
        print("✅ Process completed")
    else:
        print("❌ Process failed")
