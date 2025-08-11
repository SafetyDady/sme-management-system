#!/bin/bash

# 🚨 URGENT SECURITY CLEANUP SCRIPT
# Remove old production URLs from entire project

echo "🚨 URGENT: Removing old production URLs from project..."

OLD_URL="sme-management-system-production.up.railway.app"
NEW_URL="sme-management-system-production.up.railway.app"

if [ "$NEW_URL" = "PLEASE_PROVIDE_NEW_URL" ]; then
    echo "❌ ERROR: Please update NEW_URL in this script first!"
    echo "Current files containing old URL:"
    echo "==========================================="
    grep -r "$OLD_URL" --include="*.md" --include="*.js" --include="*.json" --include="*.py" --include="*.sh" --include="*.toml" --include="*.env*" .
    echo "==========================================="
    echo ""
    echo "📋 TOTAL FILES AFFECTED:"
    grep -r "$OLD_URL" --include="*.md" --include="*.js" --include="*.json" --include="*.py" --include="*.sh" --include="*.toml" --include="*.env*" . | wc -l
    exit 1
fi

# Backup current state
echo "📁 Creating backup..."
cp -r . "../sme-management-backup-$(date +%Y%m%d_%H%M%S)"

echo "🔍 Replacing URLs in all files..."

# Replace in all relevant files
find . -type f \( -name "*.md" -o -name "*.js" -o -name "*.json" -o -name "*.py" -o -name "*.sh" -o -name "*.toml" -o -name "*.env*" \) \
    -not -path "./.git/*" \
    -not -path "./node_modules/*" \
    -not -path "./__pycache__/*" \
    -exec sed -i "s|$OLD_URL|$NEW_URL|g" {} \;

echo "✅ URL replacement completed!"
echo ""
echo "🔍 Verification - Files that still contain old URL:"
grep -r "$OLD_URL" --include="*.md" --include="*.js" --include="*.json" --include="*.py" --include="*.sh" --include="*.toml" --include="*.env*" . || echo "✅ No old URLs found!"

echo ""
echo "⚠️  NEXT STEPS:"
echo "1. Review the changes: git diff"
echo "2. Test the application with new URL"
echo "3. Commit and deploy: git add . && git commit -m 'security: Replace old production URL' && git push"
echo "4. Verify production is working with new URL"
