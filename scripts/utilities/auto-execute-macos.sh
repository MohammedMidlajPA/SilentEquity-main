#!/bin/bash

# Automated SQL execution using macOS AppleScript
# Opens browser, pastes SQL, and executes it

set -e

PROJECT_REF="vqounfxvykhwbzxpodwq"
SQL_EDITOR="https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"

echo "🚀 Automated SQL Execution (macOS)"
echo "==================================="
echo ""

# Read SQL
SQL=$(cat <<'EOF'
create table if not exists public.course_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  paid boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists course_leads_email_idx on public.course_leads (lower(email));

comment on table public.course_leads is 'Stores enrollment form submissions before Stripe checkout.';
EOF
)

# Copy to clipboard
echo "$SQL" | pbcopy
echo "✅ SQL copied to clipboard"

# Open browser
open "$SQL_EDITOR"
echo "✅ Opened SQL Editor"
echo ""

# Use AppleScript to automate
osascript <<EOF
tell application "System Events"
    delay 3
    tell application "Google Chrome" to activate
    delay 2
    
    -- Paste SQL (Cmd+V)
    keystroke "v" using command down
    delay 2
    
    -- Execute (Cmd+Enter)
    keystroke return using command down
    delay 3
    
    display notification "SQL execution triggered!" with title "Supabase Setup"
end tell
EOF

echo "✅ Automation complete!"
echo "⏳ Waiting 15 seconds for SQL to execute..."
sleep 15

echo ""
echo "🔍 Verifying table creation..."
node scripts/utilities/create-course-leads-table.js


