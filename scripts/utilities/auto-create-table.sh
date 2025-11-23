#!/bin/bash

# Automated table creation script
# Uses browser automation to execute SQL in Supabase dashboard

set -e

PROJECT_REF="vqounfxvykhwbzxpodwq"
SQL_EDITOR_URL="https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"

echo "🚀 Automated Course Leads Table Creation"
echo "=========================================="
echo ""

# Check if we can use osascript (macOS automation)
if command -v osascript > /dev/null; then
    echo "📋 Using macOS automation to help create the table..."
    echo ""
    
    # Read SQL file
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
    
    # Copy SQL to clipboard (macOS)
    echo "$SQL" | pbcopy
    echo "✅ SQL copied to clipboard!"
    echo ""
    
    # Open SQL Editor
    open "$SQL_EDITOR_URL"
    echo "✅ Opened SQL Editor in browser"
    echo ""
    echo "📋 Next steps:"
    echo "   1. The SQL is already in your clipboard"
    echo "   2. Paste it (Cmd+V) into the SQL Editor"
    echo "   3. Click 'Run' or press Cmd+Enter"
    echo "   4. Wait for success message"
    echo ""
    echo "⏳ Waiting 30 seconds for you to execute the SQL..."
    sleep 30
    
    # Verify table was created
    echo ""
    echo "🔍 Verifying table creation..."
    node scripts/utilities/create-course-leads-table.js
    
else
    echo "📋 Please run the SQL manually:"
    echo "   👉 $SQL_EDITOR_URL"
    echo ""
    cat <<'EOF'
SQL to execute:
────────────────────────────────────────────────────────────
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
────────────────────────────────────────────────────────────
EOF
    echo ""
    open "$SQL_EDITOR_URL" 2>/dev/null || echo "Please open: $SQL_EDITOR_URL"
fi


