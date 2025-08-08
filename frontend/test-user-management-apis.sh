#!/bin/bash

# 🧪 API Testing Script for Backend Development
# Run this script to test the new User Management APIs

RAILWAY_URL="https://web-production-5b6ab.up.railway.app"

echo "🚀 User Management API Testing"
echo "=============================="
echo "Testing URL: $RAILWAY_URL"
echo

# Test credentials
SUPERADMIN_USER="superadmin"
SUPERADMIN_PASS="superadmin123"

echo "1. Getting authentication token..."
echo "--------------------------------"

# Get JWT token
login_response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$RAILWAY_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$SUPERADMIN_USER\", \"password\": \"$SUPERADMIN_PASS\"}")

http_status=$(echo "$login_response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
response_body=$(echo "$login_response" | sed 's/HTTPSTATUS:[0-9]*$//')

if [ "$http_status" = "200" ]; then
    echo "✅ Login successful"
    TOKEN=$(echo "$response_body" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
    if [ -z "$TOKEN" ]; then
        echo "❌ Could not extract token"
        exit 1
    fi
    echo "🔑 Token received: ${TOKEN:0:20}..."
else
    echo "❌ Login failed (HTTP $http_status)"
    echo "Response: $response_body"
    exit 1
fi

echo
echo "2. Testing User Management APIs..."
echo "================================="

# Test GET /users
echo
echo "Testing GET /users (Get all users)..."
echo "------------------------------------"
response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$RAILWAY_URL/users" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

http_status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
response_body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')

if [ "$http_status" = "200" ]; then
    echo "✅ GET /users successful (HTTP $http_status)"
    echo "Users found:"
    echo "$response_body" | python3 -c "
import sys, json
try:
    users = json.load(sys.stdin)
    for user in users:
        print(f\"  - {user['username']} ({user['role']}) - Active: {user.get('is_active', 'N/A')}\")
except:
    print('Could not parse users list')
" 2>/dev/null
else
    echo "❌ GET /users failed (HTTP $http_status)"
    echo "Response: $response_body"
fi

# Test POST /users (Create new user)
echo
echo "Testing POST /users (Create new user)..."
echo "---------------------------------------"
response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$RAILWAY_URL/users" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser123",
        "email": "test@example.com",
        "password": "testpassword123",
        "role": "user"
    }')

http_status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
response_body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')

if [ "$http_status" = "201" ] || [ "$http_status" = "200" ]; then
    echo "✅ POST /users successful (HTTP $http_status)"
    echo "New user created:"
    echo "$response_body" | python3 -c "
import sys, json
try:
    user = json.load(sys.stdin)
    print(f\"  ID: {user.get('id', 'N/A')}\")
    print(f\"  Username: {user.get('username', 'N/A')}\")
    print(f\"  Email: {user.get('email', 'N/A')}\")
    print(f\"  Role: {user.get('role', 'N/A')}\")
except:
    print('Could not parse user data')
" 2>/dev/null
else
    echo "❌ POST /users failed (HTTP $http_status)"
    echo "Response: $response_body"
fi

# Test GET /users/me (Get current user profile)
echo
echo "Testing GET /users/me (Get current user profile)..."
echo "--------------------------------------------------"
response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$RAILWAY_URL/users/me" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

http_status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
response_body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')

if [ "$http_status" = "200" ]; then
    echo "✅ GET /users/me successful (HTTP $http_status)"
    echo "Current user profile:"
    echo "$response_body" | python3 -c "
import sys, json
try:
    user = json.load(sys.stdin)
    print(f\"  Username: {user.get('username', 'N/A')}\")
    print(f\"  Email: {user.get('email', 'N/A')}\")
    print(f\"  Role: {user.get('role', 'N/A')}\")
    print(f\"  Active: {user.get('is_active', 'N/A')}\")
except:
    print('Could not parse profile data')
" 2>/dev/null
else
    echo "❌ GET /users/me failed (HTTP $http_status)"
    echo "Response: $response_body"
fi

# Test PUT /users/me (Update current user profile)
echo
echo "Testing PUT /users/me (Update profile)..."
echo "----------------------------------------"
response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X PUT "$RAILWAY_URL/users/me" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "superadmin_updated",
        "email": "superadmin_new@example.com"
    }')

http_status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
response_body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')

if [ "$http_status" = "200" ]; then
    echo "✅ PUT /users/me successful (HTTP $http_status)"
    echo "Updated profile:"
    echo "$response_body" | python3 -c "
import sys, json
try:
    user = json.load(sys.stdin)
    print(f\"  Username: {user.get('username', 'N/A')}\")
    print(f\"  Email: {user.get('email', 'N/A')}\")
except:
    print('Could not parse updated profile')
" 2>/dev/null
else
    echo "❌ PUT /users/me failed (HTTP $http_status)"
    echo "Response: $response_body"
fi

echo
echo "3. Testing Error Scenarios..."
echo "============================"

# Test unauthorized access
echo
echo "Testing unauthorized access (no token)..."
echo "----------------------------------------"
response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$RAILWAY_URL/users")
http_status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)

if [ "$http_status" = "401" ]; then
    echo "✅ Unauthorized access correctly blocked (HTTP $http_status)"
else
    echo "⚠️ Unauthorized access not properly handled (HTTP $http_status)"
fi

# Test invalid user creation
echo
echo "Testing invalid user creation..."
echo "-------------------------------"
response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$RAILWAY_URL/users" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "ab",
        "email": "invalid-email",
        "password": "123",
        "role": "invalid_role"
    }')

http_status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)

if [ "$http_status" = "400" ] || [ "$http_status" = "422" ]; then
    echo "✅ Invalid data correctly rejected (HTTP $http_status)"
else
    echo "⚠️ Invalid data validation needs improvement (HTTP $http_status)"
fi

echo
echo "🎯 Testing Complete!"
echo "==================="
echo
echo "Summary of expected results:"
echo "• All authenticated requests should return 200/201"
echo "• Unauthorized requests should return 401"
echo "• Invalid data should return 400/422"
echo "• Users list should contain existing users"
echo "• Profile updates should reflect changes"
echo
echo "If any tests fail, the corresponding API endpoints need to be implemented."
echo
echo "Next steps:"
echo "1. Implement missing endpoints that failed"
echo "2. Ensure proper error handling"
echo "3. Test with different user roles (admin1, admin2)"
echo "4. Verify frontend integration"
