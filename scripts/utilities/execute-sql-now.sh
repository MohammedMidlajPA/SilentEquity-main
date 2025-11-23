#!/bin/bash

# Complete automated SQL execution script
# This script will copy SQL to clipboard, open SQL Editor, and provide instructions

set -e

PROJECT_REF="vqounfxvykhwbzxpodwq"
SQL_FILE="docs/supabase/COURSE_LEADS_TABLE.sql"
SQL_EDITOR="https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"

echo "🚀 Automated SQL Execution Script"
echo "=================================="
echo ""

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ SQL file not found: $SQL_FILE"
    exit 1
fi

# Extract SQL (remove comments)
SQL=$(cat "$SQL_FILE" | grep -v "^--" | grep -v "^$" | tr '\n' ' ' | sed 's/  */ /g')

# Copy to clipboard
echo "$SQL" | pbcopy
echo "✅ SQL copied to clipboard"

# Open SQL Editor
open "$SQL_EDITOR"
echo "✅ Opened SQL Editor in browser"
echo ""

echo "📋 SQL is ready in your clipboard!"
echo ""
echo "Next steps:"
echo "   1. Wait for SQL Editor to load"
echo "   2. Click in the editor"
echo "   3. Paste: Cmd+V"
echo "   4. Click 'Run' button or press Cmd+Enter"
echo ""
echo "⏳ Waiting 60 seconds for you to execute..."
sleep 60

echo ""
echo "🔍 Verifying table creation..."
node scripts/utilities/create-course-leads-table.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Table created and verified!"
else
    echo ""
    echo "⚠️  Table not found yet."
    echo "   Please make sure you:"
    echo "   1. Pasted the SQL correctly"
    echo "   2. Clicked 'Run'"
    echo "   3. Saw a success message"
    echo ""
    echo "Then run this script again to verify."
fi


