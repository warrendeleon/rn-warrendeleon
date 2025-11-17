#!/bin/bash
# TASK-113: Verify .env files in .gitignore
# This script ensures .env files containing secrets are never committed to git

set -e

echo "=== .env .gitignore Verification ==="
echo ""

# Check .gitignore contains .env entries
echo "1. Checking .gitignore for .env patterns..."
if grep -q "^\.env$" .gitignore && grep -q "^\.env\.\*$" .gitignore; then
    echo "   ✅ .env patterns found in .gitignore"
else
    echo "   ❌ .env patterns missing from .gitignore"
    exit 1
fi

# Check if .env.example is allowed
if grep -q "^!\.env\.example$" .gitignore; then
    echo "   ✅ .env.example is allowed (negated pattern found)"
else
    echo "   ⚠️  .env.example negation not found"
fi

echo ""
echo "2. Checking for tracked .env files..."
TRACKED_ENV=$(git ls-files | grep -E "\.env\.(production|development|staging|local)$" || true)

if [ -z "$TRACKED_ENV" ]; then
    echo "   ✅ No sensitive .env files are tracked by git"
else
    echo "   ❌ Found tracked .env files:"
    echo "$TRACKED_ENV"
    exit 1
fi

echo ""
echo "3. Checking for existing .env files in project..."
HAS_TRACKED=false
find . -name ".env*" -type f ! -path "./node_modules/*" ! -path "./.git/*" ! -name ".env.example" 2>/dev/null | while read file; do
    if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
        echo "   ❌ TRACKED: $file"
        HAS_TRACKED=true
    else
        echo "   ✅ IGNORED: $file"
    fi
done

if [ "$HAS_TRACKED" = true ]; then
    echo ""
    echo "❌ FAILED: Some .env files are tracked by git"
    exit 1
fi

echo ""
echo "=== ✅ Verification Complete - All .env files properly protected ==="
