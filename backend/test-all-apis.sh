#!/bin/bash

echo "🧪 Comprehensive API Testing Suite - Local Development"
echo "====================================================="

BASE_URL="http://localhost:8000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test result tracking
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASSED${NC}: $2"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAILED${NC}: $2"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Function to test API endpoint
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    local expected_status=$5
    local test_name=$6
    
    echo -e "\n${YELLOW}Testing:${NC} $test_name"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" $headers "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "%{http_code}" -X POST $headers -d "$data" "$BASE_URL$endpoint")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "%{http_code}" -X PUT $headers -d "$data" "$BASE_URL$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "%{http_code}" -X DELETE $headers "$BASE_URL$endpoint")
    fi
    
    http_code="${response: -3}"
    body="${response%???}"
    
    echo "Status Code: $http_code"
    if [ ! -z "$body" ] && [ "$body" != "" ]; then
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    fi
    
    if [ "$http_code" = "$expected_status" ]; then
        print_result 0 "$test_name"
        return 0
    else
        print_result 1 "$test_name (Expected: $expected_status, Got: $http_code)"
        return 1
    fi
}

echo -e "\n🔍 1. BASIC HEALTH CHECKS"
echo "========================"

test_api "GET" "/health" "" "" "200" "Health Check"
test_api "GET" "/debug/schema" "" "" "200" "Database Schema Check"

echo -e "\n🔐 2. AUTHENTICATION TESTS"
echo "=========================="

# Admin Login
echo -e "\n${YELLOW}Getting admin token...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token', 'FAILED'))" 2>/dev/null)

if [ "$TOKEN" = "FAILED" ]; then
    echo -e "${RED}❌ Admin login failed!${NC}"
    echo $LOGIN_RESPONSE | python3 -m json.tool
    exit 1
else
    echo -e "${GREEN}✅ Admin login successful${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi

# Test login endpoint
test_api "POST" "/auth/login" '{"username": "admin", "password": "admin123"}' "-H 'Content-Type: application/json'" "200" "Admin Login"

# Test invalid login
test_api "POST" "/auth/login" '{"username": "admin", "password": "wrong"}' "-H 'Content-Type: application/json'" "401" "Invalid Login"

echo -e "\n👥 3. USER MANAGEMENT TESTS"
echo "==========================="

# Get all users
test_api "GET" "/api/users" "" "-H 'Authorization: Bearer $TOKEN'" "200" "Get All Users"

# Create HR user
HR_DATA='{"username": "test_hr_local", "email": "test_hr_local@sme.local", "password": "hr123456", "role": "hr"}'
test_api "POST" "/api/users" "$HR_DATA" "-H 'Content-Type: application/json' -H 'Authorization: Bearer $TOKEN'" "201" "Create HR User"

# Create regular user
USER_DATA='{"username": "test_user_local", "email": "test_user_local@sme.local", "password": "user123456", "role": "user"}'
test_api "POST" "/api/users" "$USER_DATA" "-H 'Content-Type: application/json' -H 'Authorization: Bearer $TOKEN'" "201" "Create Regular User"

# Test duplicate username
DUPLICATE_DATA='{"username": "test_hr_local", "email": "different@sme.local", "password": "pass123", "role": "user"}'
test_api "POST" "/api/users" "$DUPLICATE_DATA" "-H 'Content-Type: application/json' -H 'Authorization: Bearer $TOKEN'" "409" "Duplicate Username Check"

# Test duplicate email
DUPLICATE_EMAIL='{"username": "different_user", "email": "test_hr_local@sme.local", "password": "pass123", "role": "user"}'
test_api "POST" "/api/users" "$DUPLICATE_EMAIL" "-H 'Content-Type: application/json' -H 'Authorization: Bearer $TOKEN'" "409" "Duplicate Email Check"

echo -e "\n🔒 4. AUTHORIZATION TESTS"
echo "========================"

# Test HR user login
echo -e "\n${YELLOW}Testing HR user authentication...${NC}"
HR_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "test_hr_local", "password": "hr123456"}')

HR_TOKEN=$(echo $HR_LOGIN_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token', 'FAILED'))" 2>/dev/null)

if [ "$HR_TOKEN" = "FAILED" ]; then
    echo -e "${YELLOW}⚠️ HR user not found or login failed${NC}"
else
    echo -e "${GREEN}✅ HR user login successful${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Test HR access to users endpoint
    test_api "GET" "/api/users" "" "-H 'Authorization: Bearer $HR_TOKEN'" "200" "HR Access to Users"
fi

# Test regular user login
echo -e "\n${YELLOW}Testing regular user authentication...${NC}"
USER_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "test_user_local", "password": "user123456"}')

USER_TOKEN=$(echo $USER_LOGIN_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token', 'FAILED'))" 2>/dev/null)

if [ "$USER_TOKEN" = "FAILED" ]; then
    echo -e "${YELLOW}⚠️ Regular user not found or login failed${NC}"
else
    echo -e "${GREEN}✅ Regular user login successful${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Test regular user should NOT access users endpoint
    test_api "GET" "/api/users" "" "-H 'Authorization: Bearer $USER_TOKEN'" "403" "Regular User Access Denied"
fi

echo -e "\n📋 5. API DOCUMENTATION"
echo "======================="

test_api "GET" "/docs" "" "" "200" "API Documentation"
test_api "GET" "/openapi.json" "" "" "200" "OpenAPI Schema"

echo -e "\n📊 TEST SUMMARY"
echo "==============="
echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
echo -e "Total: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! API is ready for production.${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️ Some tests failed. Please review and fix issues.${NC}"
    exit 1
fi
