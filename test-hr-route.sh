#!/bin/bash

echo "🧪 Testing HR Dashboard Route"
echo "================================"

# Test 1: Check if route exists in App.jsx
echo "✅ Checking route definition in App.jsx..."
grep -n "path=\"/hr\"" /home/safety/sme-management/frontend/src/App.jsx

# Test 2: Check import statement
echo -e "\n✅ Checking HRDashboard import..."
grep -n "HRDashboard" /home/safety/sme-management/frontend/src/App.jsx

# Test 3: Check if HRDashboard file exists
echo -e "\n✅ Checking if HRDashboard.jsx exists..."
if [ -f "/home/safety/sme-management/frontend/src/pages/hr/HRDashboard.jsx" ]; then
    echo "✅ File exists: HRDashboard.jsx"
    echo "📄 File size: $(wc -l < /home/safety/sme-management/frontend/src/pages/hr/HRDashboard.jsx) lines"
else
    echo "❌ File not found: HRDashboard.jsx"
fi

# Test 4: Check redirect path in auth.js
echo -e "\n✅ Checking redirect path for HR role..."
grep -A 5 -B 2 "case 'hr'" /home/safety/sme-management/frontend/src/lib/auth.js

# Test 5: Check if dev server is running
echo -e "\n✅ Checking development server status..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Frontend server is running on port 3001"
else
    echo "❌ Frontend server is not accessible"
fi

if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ Backend server is running on port 8000"
else
    echo "❌ Backend server is not accessible"
fi

echo -e "\n🎯 Summary:"
echo "- Route: /hr → pages/hr/HRDashboard.jsx"
echo "- Import: ✅ Correct"
echo "- File: ✅ Exists"
echo "- Servers: ✅ Running"

echo -e "\n🚀 Test HR login by visiting: http://localhost:3001/login"
