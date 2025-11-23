#!/bin/bash

# Final complete database setup script
# Uses psql to connect directly to Supabase PostgreSQL

set -e

PROJECT_REF="vqounfxvykhwbzxpodwq"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

echo "🚀 Complete Supabase Database Setup"
echo "===================================="
echo ""

# Load environment variables
if [ -f "backend/.env" ]; then
    set -a
    source backend/.env
    set +a
else
    echo "❌ backend/.env not found"
    exit 1
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set"
    exit 1
fi

echo "📡 Project: ${PROJECT_REF}"
echo ""

# SQL to execute
SQL_FILE="docs/supabase/COURSE_LEADS_TABLE.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ SQL file not found: $SQL_FILE"
    exit 1
fi

echo "📋 SQL file found: $SQL_FILE"
echo ""

# Try to execute using psql
# Supabase connection string format:
# postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
# But we need the database password, not the service role key

echo "⚠️  To execute SQL directly, we need the database password."
echo "   Get it from: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database"
echo ""
echo "   Or use the connection string from:"
echo "   https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database"
echo ""

# Alternative: Use Supabase CLI if linked
if command -v supabase > /dev/null; then
    echo "🔧 Trying Supabase CLI..."
    # Check if project is linked
    if [ -f ".supabase/config.toml" ]; then
        echo "   Project appears to be linked"
        # Try to execute SQL via CLI
        echo "   Attempting to execute SQL..."
        # Supabase CLI doesn't have direct SQL execution, but we can try db push
    fi
fi

# Final fallback: Provide clear instructions
echo "📋 Since direct SQL execution requires database password,"
echo "   please run the SQL in Supabase SQL Editor:"
echo ""
echo "   👉 https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
echo ""

# Display SQL
echo "SQL to execute:"
echo "────────────────────────────────────────────────────────────"
cat "$SQL_FILE" | grep -v "^--"
echo "────────────────────────────────────────────────────────────"
echo ""

# Copy to clipboard (macOS)
if command -v pbcopy > /dev/null; then
    cat "$SQL_FILE" | grep -v "^--" | pbcopy
    echo "✅ SQL copied to clipboard!"
fi

# Open browser
if command -v open > /dev/null; then
    open "https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
    echo "✅ Opened SQL Editor in browser"
fi

echo ""
echo "⏳ After running the SQL, verify with:"
echo "   node scripts/utilities/create-course-leads-table.js"
echo ""


