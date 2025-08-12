#!/usr/bin/env python3
import requests
import json
import time

print("🔍 Testing FastAPI server...")

BASE_URL = "http://127.0.0.1:8003"

# Test connection
try:
    response = requests.get(f"{BASE_URL}/health", timeout=5)
    print(f"Health Status: {response.status_code}")
    if response.status_code == 200:
        print("Response:", json.dumps(response.json(), indent=2))
        print("✅ Server is responding!")
    else:
        print("❌ Server returned error")
        print("Response:", response.text)
except Exception as e:
    print(f"❌ Cannot connect to server: {e}")

# Test admin login
try:
    login_data = {"username": "admin", "password": "admin123"}
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=5)
    print(f"\nLogin Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        token = data.get('access_token', '')
        print(f"✅ Login successful! Token: {token[:20]}...")
        
        # Test user creation
        headers = {'Authorization': f'Bearer {token}'}
        user_data = {
            "username": "test_simple",
            "email": "test_simple@sme.local",
            "password": "test123",
            "role": "user"
        }
        
        response = requests.post(f"{BASE_URL}/api/users", 
                               json=user_data, headers=headers, timeout=5)
        print(f"\nUser Creation Status: {response.status_code}")
        if response.status_code in [200, 201]:
            print("✅ User creation successful!")
            print("Response:", json.dumps(response.json(), indent=2))
        elif response.status_code == 409:
            print("⚠️ User already exists (this is expected)")
        else:
            print("❌ User creation failed")
            print("Response:", response.text)
            
    else:
        print("❌ Login failed")
        print("Response:", response.text)
except Exception as e:
    print(f"❌ Login test failed: {e}")

print("\n📋 Test complete!")
