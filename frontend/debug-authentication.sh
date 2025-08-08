#!/bin/bash

echo "🔍 Authentication Debug Analysis"
echo "================================"
echo

RAILWAY_URL="https://web-production-5b6ab.up.railway.app"

echo "📋 Database Status Confirmed:"
echo "- ✅ superadmin exists in DB"
echo "- ✅ admin1 exists in DB"
echo "- ✅ admin2 exists in DB"
echo "- ✅ All have hashed passwords"
echo

echo "🚨 Issues Found:"
echo "==============="
echo "1. superadmin: HTTP 500 - ValueError JSON serialization"
echo "2. admin1/admin2: HTTP 401 - Password verification fails"
echo

echo "🧪 Testing Different Password Variations..."
echo "==========================================="

# Test if passwords might be stored differently
declare -A password_tests=(
    ["admin1"]="admin123,admin1,password,123456"
    ["admin2"]="admin123,admin2,password,123456"
)

for username in "${!password_tests[@]}"; do
    echo
    echo "Testing $username with different passwords:"
    echo "============================================"
    
    IFS=',' read -ra PASSWORDS <<< "${password_tests[$username]}"
    for pwd in "${PASSWORDS[@]}"; do
        echo -n "Testing $username:$pwd ... "
        
        response=$(curl -s -w "HTTP:%{http_code}" -X POST "$RAILWAY_URL/auth/login" \
            -H "Content-Type: application/json" \
            -d "{\"username\": \"$username\", \"password\": \"$pwd\"}" 2>/dev/null)
        
        status=$(echo "$response" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
        body=$(echo "$response" | sed 's/HTTP:[0-9]*$//')
        
        case $status in
            200) echo "✅ SUCCESS" ;;
            401) echo "❌ Wrong password" ;;
            500) echo "💥 Server error" ;;
            *) echo "❓ HTTP $status" ;;
        esac
    done
done

echo
echo "🔧 Backend Issues to Check:"
echo "=========================="
echo "1. superadmin JSON serialization error:"
echo "   - Check what object is being returned"
echo "   - Ensure all response objects are JSON-serializable"
echo "   - Look for datetime, UUID, or custom objects"
echo

echo "2. Password verification for admin1/admin2:"
echo "   - Check bcrypt version compatibility"
echo "   - Verify salt rounds match"
echo "   - Check if passwords were hashed correctly"
echo "   - Test password verification logic"
echo

echo "🎯 Recommended Actions:"
echo "======================"
echo "1. Check Railway backend logs for detailed error traces"
echo "2. Test password reset/update functionality"
echo "3. Verify bcrypt library version and configuration"
echo "4. Check database password hash format"
echo

echo "🌐 Railway Backend Logs:"
echo "========================"
echo "Visit: https://railway.app/project/[your-project]/service/[your-service]/logs"
echo "Look for:"
echo "- ValueError details for superadmin"
echo "- Password verification failures for admin1/admin2"
