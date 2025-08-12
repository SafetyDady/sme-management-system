#!/bin/bash

echo "🧪 User Creation Test Script"
echo "==========================="

BACKEND_URL="https://sme-management-system-production.up.railway.app"

echo "🔑 1. Login as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token', 'FAILED'))" 2>/dev/null)

if [ "$TOKEN" = "FAILED" ]; then
    echo "❌ Login failed!"
    echo $LOGIN_RESPONSE | python3 -m json.tool
    exit 1
fi

echo "✅ Login successful!"

echo "👥 2. Test HR user creation..."
curl -X POST "$BACKEND_URL/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "hr_test_new", 
    "email": "hr_test_new@sme.local", 
    "password": "hr123456", 
    "role": "hr"
  }' | python3 -m json.tool

echo ""
echo "👤 3. Test regular user creation..."
curl -X POST "$BACKEND_URL/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "employee_test", 
    "email": "employee_test@sme.local", 
    "password": "emp123456", 
    "role": "user"
  }' | python3 -m json.tool

echo ""
echo "📋 4. List all users..."
curl -X GET "$BACKEND_URL/api/users" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo ""
echo "✅ User creation test completed!"
