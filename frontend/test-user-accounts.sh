#!/bin/bash

echo "👥 User Accounts Testing - Railway Backend"
echo "=========================================="
echo

RAILWAY_URL="https://web-production-5b6ab.up.railway.app"

# Test user accounts
declare -a users=(
    "superadmin:superadmin"
    "admin1:admin123" 
    "admin2:admin123"
)

echo "🔐 Testing Authentication for All Users:"
echo "----------------------------------------"

for user in "${users[@]}"; do
    IFS=':' read -r username password <<< "$user"
    
    echo "Testing user: $username"
    echo "Password: $password"
    
    # Test login
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}\nTIME:%{time_total}" \
        -X POST "$RAILWAY_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\": \"$username\", \"password\": \"$password\"}")
    
    # Parse response
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    response_time=$(echo "$response" | grep "TIME:" | cut -d: -f2)
    response_body=$(echo "$response" | sed '/HTTP_STATUS:/,$d')
    
    echo "HTTP Status: $http_status"
    echo "Response Time: ${response_time}s"
    
    if [ "$http_status" = "200" ]; then
        echo "✅ Login successful"
        echo "Response: $response_body"
        
        # Try to extract token and get user info
        token=$(echo "$response_body" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
        if [ -n "$token" ]; then
            echo "🔑 Token received: ${token:0:20}..."
            
            # Test protected endpoint
            echo "Testing protected endpoint..."
            protected_response=$(curl -s -w "HTTP_STATUS:%{http_code}" \
                -H "Authorization: Bearer $token" \
                "$RAILWAY_URL/auth/me")
            
            protected_status=$(echo "$protected_response" | grep "HTTP_STATUS:" | cut -d: -f2)
            protected_body=$(echo "$protected_response" | sed '/HTTP_STATUS:/,$d')
            
            if [ "$protected_status" = "200" ]; then
                echo "✅ Protected endpoint accessible"
                echo "User info: $protected_body"
            else
                echo "❌ Protected endpoint failed (Status: $protected_status)"
            fi
        fi
    else
        echo "❌ Login failed"
        echo "Error response: $response_body"
    fi
    
    echo "----------------------------------------"
    echo
done

echo "🔍 Additional Checks:"
echo "===================="

# Check if users endpoint exists (to see all users)
echo "1. Checking users endpoint..."
users_response=$(curl -s -w "HTTP_STATUS:%{http_code}" "$RAILWAY_URL/users")
users_status=$(echo "$users_response" | grep "HTTP_STATUS:" | cut -d: -f2)
users_body=$(echo "$users_response" | sed '/HTTP_STATUS:/,$d')

if [ "$users_status" = "200" ]; then
    echo "✅ Users endpoint accessible"
    echo "Users data: $users_body"
elif [ "$users_status" = "401" ] || [ "$users_status" = "403" ]; then
    echo "🔒 Users endpoint requires authentication"
else
    echo "❌ Users endpoint not accessible (Status: $users_status)"
fi

echo
echo "2. Checking database connection..."
# Try to get some system info that might indicate database status
db_response=$(curl -s -w "HTTP_STATUS:%{http_code}" "$RAILWAY_URL/health")
db_status=$(echo "$db_response" | grep "HTTP_STATUS:" | cut -d: -f2)
db_body=$(echo "$db_response" | sed '/HTTP_STATUS:/,$d')

if [ "$db_status" = "200" ]; then
    echo "✅ Health endpoint accessible"
    echo "System status: $db_body"
    
    # Look for database-related information
    if echo "$db_body" | grep -i "database\|db\|postgres\|mysql" > /dev/null; then
        echo "🗄️ Database information found in health check"
    else
        echo "ℹ️ No explicit database status in health check"
    fi
else
    echo "❌ Health endpoint failed"
fi

echo
echo "📊 Summary:"
echo "==========="
echo "- superadmin: Expected to work"
echo "- admin1: Should work if not mock data" 
echo "- admin2: Should work if not mock data"
echo
echo "If admin1 and admin2 fail consistently:"
echo "- They might be mock data in code"
echo "- Database might not be properly seeded"
echo "- Authentication logic might be hardcoded"
echo
echo "Next steps to verify:"
echo "1. Check backend logs on Railway"
echo "2. Verify database contains the users"
echo "3. Check if authentication is hardcoded vs database-driven"
