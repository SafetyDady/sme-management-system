#!/usr/bin/env python3

"""
Simple API Testing Script - Local Development
"""

import requests
import json
import sys
import time

BASE_URL = "http://127.0.0.1:8002"

def print_status(success, message):
    print(f"{'✅' if success else '❌'} {message}")

def test_endpoint(method, endpoint, data=None, headers=None, expected_status=200):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=10)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=10)
        elif method == 'PUT':
            response = requests.put(url, json=data, headers=headers, timeout=10)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=10)
        
        success = response.status_code == expected_status
        print(f"\n🔍 {method} {endpoint}")
        print(f"Status: {response.status_code} (Expected: {expected_status})")
        
        if response.text:
            try:
                json_data = response.json()
                print("Response:", json.dumps(json_data, indent=2)[:500])
            except:
                print("Response:", response.text[:200])
        
        print_status(success, f"{method} {endpoint}")
        return success, response
        
    except Exception as e:
        print(f"\n❌ {method} {endpoint} - Error: {e}")
        return False, None

def main():
    print("🧪 FastAPI Local Testing")
    print("=" * 50)
    
    # Wait for server to be ready
    print("⏳ Waiting for server...")
    time.sleep(2)
    
    tests_passed = 0
    total_tests = 0
    
    # Test 1: Health Check
    success, _ = test_endpoint('GET', '/health')
    total_tests += 1
    if success: tests_passed += 1
    
    # Test 2: Database Schema
    success, _ = test_endpoint('GET', '/debug/schema')
    total_tests += 1
    if success: tests_passed += 1
    
    # Test 3: Admin Login
    login_data = {"username": "admin", "password": "admin123"}
    success, response = test_endpoint('POST', '/auth/login', data=login_data)
    total_tests += 1
    if success: tests_passed += 1
    
    token = None
    if success and response:
        try:
            token = response.json().get('access_token')
            print(f"🔑 Got token: {token[:20]}...")
        except:
            pass
    
    if token:
        headers = {'Authorization': f'Bearer {token}'}
        
        # Test 4: Get Users
        success, _ = test_endpoint('GET', '/api/users', headers=headers)
        total_tests += 1
        if success: tests_passed += 1
        
        # Test 5: Create HR User
        hr_data = {
            "username": "test_hr_python",
            "email": "test_hr_python@sme.local", 
            "password": "hr123456",
            "role": "hr"
        }
        success, _ = test_endpoint('POST', '/api/users', data=hr_data, headers=headers, expected_status=201)
        total_tests += 1
        if success: tests_passed += 1
        
        # Test 6: Create Regular User
        user_data = {
            "username": "test_user_python",
            "email": "test_user_python@sme.local",
            "password": "user123456", 
            "role": "user"
        }
        success, _ = test_endpoint('POST', '/api/users', data=user_data, headers=headers, expected_status=201)
        total_tests += 1
        if success: tests_passed += 1
        
        # Test 7: Test duplicate username (should fail)
        duplicate_data = {
            "username": "test_hr_python",  # Same username
            "email": "different@sme.local",
            "password": "pass123",
            "role": "user"
        }
        success, _ = test_endpoint('POST', '/api/users', data=duplicate_data, headers=headers, expected_status=409)
        total_tests += 1
        if success: tests_passed += 1
    
    # Summary
    print(f"\n📊 TEST SUMMARY")
    print("=" * 30)
    print(f"✅ Passed: {tests_passed}")
    print(f"❌ Failed: {total_tests - tests_passed}")
    print(f"Total: {total_tests}")
    
    if tests_passed == total_tests:
        print("\n🎉 All tests passed! API is working correctly.")
        return 0
    else:
        print("\n⚠️ Some tests failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
