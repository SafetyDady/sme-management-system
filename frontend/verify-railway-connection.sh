#!/bin/bash

echo "🔗 Railway Backend Connection Verification"
echo "========================================="
echo

# Get current environment
echo "📋 Environment Check:"
echo "Current working directory: $(pwd)"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "VITE_API_URL: ${VITE_API_URL:-'not set'}"
echo

# Test Railway URL directly
RAILWAY_URL="https://web-production-5b6ab.up.railway.app"
echo "🚀 Testing Railway Backend: $RAILWAY_URL"
echo "----------------------------------------"

echo "1. Basic connectivity test..."
if curl -s --max-time 10 -f "$RAILWAY_URL/health" > /dev/null; then
    echo "✅ Railway backend is reachable"
else
    echo "❌ Railway backend is not reachable"
fi

echo
echo "2. Health check with detailed response..."
response=$(curl -s --max-time 10 -i "$RAILWAY_URL/health" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Health check successful"
    echo
    echo "📊 Response Headers:"
    echo "$response" | head -n 20 | grep -E "(HTTP/|X-Request-ID|Content-Security-Policy|X-Frame-Options)"
    echo
    echo "📄 Response Body:"
    echo "$response" | tail -n +$(echo "$response" | grep -n "^$" | head -1 | cut -d: -f1) | head -10
else
    echo "❌ Health check failed"
fi

echo
echo "3. Security headers check..."
headers=$(curl -s --max-time 10 -I "$RAILWAY_URL/health" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "🔒 Security Headers Analysis:"
    echo "$headers" | grep -i "x-request-id" && echo "  ✅ Request ID tracking enabled" || echo "  ❌ No Request ID tracking"
    echo "$headers" | grep -i "content-security-policy" && echo "  ✅ CSP header present" || echo "  ❌ No CSP header"
    echo "$headers" | grep -i "x-frame-options" && echo "  ✅ X-Frame-Options present" || echo "  ❌ No X-Frame-Options"
    echo "$headers" | grep -i "strict-transport-security" && echo "  ✅ HSTS header present" || echo "  ❌ No HSTS header"
else
    echo "❌ Could not retrieve headers"
fi

echo
echo "4. Frontend configuration check..."
if [ -f ".env" ]; then
    echo "📁 .env file exists"
    echo "Current VITE_API_URL in .env:"
    grep "VITE_API_URL" .env || echo "  VITE_API_URL not found in .env"
else
    echo "📁 No .env file found"
fi

echo
echo "5. Package.json scripts check..."
if [ -f "package.json" ]; then
    echo "📦 Available scripts:"
    node -e "console.log(Object.keys(require('./package.json').scripts).join(', '))"
else
    echo "❌ No package.json found"
fi

echo
echo "6. User Authentication Test..."
echo "👥 Testing User Accounts:"
echo "========================"

# Test different user accounts
declare -a test_users=(
    "superadmin:superadmin123"
    "admin1:admin1123"
    "admin2:admin2123"
)

for user_combo in "${test_users[@]}"; do
    IFS=':' read -r username password <<< "$user_combo"
    echo
    echo "Testing user: $username"
    echo "Password: $password"
    echo "-------------------"
    
    # Test login
    login_response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$RAILWAY_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\": \"$username\", \"password\": \"$password\"}" 2>/dev/null)
    
    http_status=$(echo "$login_response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    response_body=$(echo "$login_response" | sed 's/HTTPSTATUS:[0-9]*$//')
    
    if [ "$http_status" = "200" ]; then
        echo "✅ Login successful (HTTP $http_status)"
        echo "Response: $response_body" | head -c 200
        echo "..."
        
        # Try to extract token for further testing
        if echo "$response_body" | grep -q "access_token"; then
            echo "🔑 Access token received"
        else
            echo "⚠️ No access token in response"
        fi
    else
        echo "❌ Login failed (HTTP $http_status)"
        echo "Error: $response_body" | head -c 200
        
        # Check if it's a specific error message
        if echo "$response_body" | grep -qi "invalid.*credentials\|unauthorized\|wrong.*password"; then
            echo "🔍 Authentication error - credentials might be wrong"
        elif echo "$response_body" | grep -qi "user.*not.*found\|not.*exist"; then
            echo "🔍 User not found - might be mock data"
        elif [ "$http_status" = "404" ]; then
            echo "🔍 Endpoint not found - check API routing"
        elif [ "$http_status" = "500" ]; then
            echo "🔍 Server error - check backend logs"
        fi
    fi
done

echo
echo "🎯 Verification Complete!"
echo "========================="
echo
echo "Authentication Test Summary:"
echo "- If only superadmin works: Others might be mock data"
echo "- If all fail: Check API endpoint or credentials format"
echo "- If server errors: Check Railway backend logs"
echo
echo "To verify frontend connection:"
echo "1. Open http://localhost:5173/verify-connection"
echo "2. Check browser Network tab for API requests"
echo "3. Look for Railway URL in requests"
echo
echo "Expected Railway indicators:"
echo "- Base URL contains: web-production-5b6ab.up.railway.app"
echo "- X-Request-ID header present"
echo "- Security headers (CSP, X-Frame-Options, etc.)"
echo "- Response time typically 200-800ms"
