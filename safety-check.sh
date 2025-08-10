#!/bin/bash
# ============================================================================
# SME Management System - Pre-commit Safety Check
# ============================================================================
# Usage: ./safety-check.sh
# Run this before every git commit to avoid dangerous file commits

echo "🔍 SME Management System - Pre-commit Safety Check"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any issues found
ISSUES_FOUND=0

# Check for dangerous files
echo -e "\n📋 Checking for dangerous files..."

DANGEROUS_FILES=(
    "check_db.py"
    "connect_railway_db.py"
    "connect_db.py"
    "create_admin.py"
    "admin_setup.py"
    ".env"
    "*.env"
    "database_url.txt"
    "credentials.txt"
    "secrets.json"
)

for file in "${DANGEROUS_FILES[@]}"; do
    if find . -name "$file" -type f 2>/dev/null | grep -q .; then
        echo -e "${RED}❌ DANGEROUS FILE FOUND: $file${NC}"
        ISSUES_FOUND=1
    fi
done

# Check git status for staged files
echo -e "\n📋 Checking staged files..."
STAGED_FILES=$(git diff --cached --name-only)

if [ -z "$STAGED_FILES" ]; then
    echo -e "${YELLOW}⚠️  No files staged for commit${NC}"
else
    echo -e "${GREEN}✅ Staged files:${NC}"
    echo "$STAGED_FILES" | while read file; do
        echo "   - $file"
    done
fi

# Check for railway.json changes
if echo "$STAGED_FILES" | grep -q "railway.json"; then
    echo -e "\n${YELLOW}⚠️  WARNING: railway.json is staged for commit!${NC}"
    echo -e "${YELLOW}   Make sure startCommand is correct: main_sme:app${NC}"
    
    # Check the actual content
    if git diff --cached backend/railway.json | grep -q "main:app"; then
        echo -e "${RED}❌ CRITICAL: railway.json contains 'main:app' - should be 'main_sme:app'${NC}"
        ISSUES_FOUND=1
    elif git diff --cached backend/railway.json | grep -q "main_sme:app"; then
        echo -e "${GREEN}✅ railway.json startCommand looks correct${NC}"
    fi
fi

# Final summary
echo -e "\n=================================================="
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 SAFETY CHECK PASSED - Safe to commit!${NC}"
    echo -e "\n💡 Remember to:"
    echo -e "   1. Review changes: git diff --cached"
    echo -e "   2. Use descriptive commit message"
    echo -e "   3. Test after deployment"
    exit 0
else
    echo -e "${RED}🚨 SAFETY CHECK FAILED - DO NOT COMMIT!${NC}"
    echo -e "\n🔧 Fix these issues first:"
    echo -e "   1. Remove or ignore dangerous files"
    echo -e "   2. Check configuration files carefully"
    echo -e "   3. Run this script again"
    exit 1
fi
