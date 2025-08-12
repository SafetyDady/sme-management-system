#!/bin/bash

echo "🧪 Production Backend Testing Script"
echo "==================================="

BACKEND_URL="https://sme-management-system-production.up.railway.app"

echo "🔍 1. Check backend health..."
curl -s "$BACKEND_URL/health" | python3 -m json.tool
echo ""

echo "🔍 2. Check database schema..."  
curl -s "$BACKEND_URL/debug/schema" | python3 -m json.tool
echo ""

echo "� 3. List existing users..."
curl -s "$BACKEND_URL/debug/users" | python3 -m json.tool
echo ""

echo "🔄 4. Reset admin password..."
curl -X POST -s "$BACKEND_URL/debug/reset-admin" | python3 -m json.tool
echo ""

echo "🔑 5. Test authentication with reset password..."
curl -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' | python3 -m json.tool
echo ""

echo "✅ Test completed!"
