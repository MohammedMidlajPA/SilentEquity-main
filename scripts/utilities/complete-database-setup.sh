#!/bin/bash

# Complete automated database setup script
# Verifies configuration and provides final steps

set -e

PROJECT_REF="vqounfxvykhwbzxpodwq"
SQL_FILE="docs/supabase/COURSE_LEADS_TABLE.sql"

echo "🚀 Complete Supabase Database Setup"
echo "===================================="
echo ""

# Check configuration
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env not found"
    exit 1
fi

SUPABASE_URL=$(grep '^SUPABASE_URL=' backend/.env | cut -d'=' -f2-)
SUPABASE_KEY=$(grep '^SUPABASE_SERVICE_ROLE_KEY=' backend/.env | cut -d'=' -f2-)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Supabase credentials not configured"
    exit 1
fi

echo "✅ Configuration verified:"
echo "   URL: $SUPABASE_URL"
echo "   Key: ${SUPABASE_KEY:0:20}..."
echo ""

# Check if table exists
echo "🔍 Checking if table exists..."
node scripts/utilities/create-course-leads-table.js 2>&1 | grep -q "already exists" && {
    echo "✅ Table already exists!"
    echo "🎉 Database is ready!"
    exit 0
} || {
    echo "❌ Table does not exist yet"
    echo ""
}

# Provide SQL
echo "📋 SQL to execute:"
echo "────────────────────────────────────────────────────────────"
cat "$SQL_FILE" | grep -v "^--"
echo "────────────────────────────────────────────────────────────"
echo ""

# Copy to clipboard
if command -v pbcopy > /dev/null; then
    cat "$SQL_FILE" | grep -v "^--" | pbcopy
    echo "✅ SQL copied to clipboard!"
fi

# Open SQL Editor
SQL_EDITOR="https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
if command -v open > /dev/null; then
    open "$SQL_EDITOR"
    echo "✅ Opened SQL Editor: $SQL_EDITOR"
fi

echo ""
echo "📋 Next steps:"
echo "   1. Paste SQL (Cmd+V) in the SQL Editor"
echo "   2. Click 'Run'"
echo "   3. Wait for success message"
echo ""
echo "⏳ After running SQL, verify with:"
echo "   node scripts/utilities/create-course-leads-table.js"
echo ""


