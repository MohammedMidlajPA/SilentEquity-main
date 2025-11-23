#!/bin/bash

# Final setup script - makes it as easy as possible

PROJECT_REF="vqounfxvykhwbzxpodwq"
SQL_EDITOR="https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"

echo "🎯 FINAL SETUP: Course Leads Table"
echo "===================================="
echo ""
echo "Since Supabase requires SQL execution via dashboard (security),"
echo "here's the easiest way to complete setup:"
echo ""

# Copy SQL to clipboard
cat <<'EOF' | pbcopy
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

echo "✅ SQL copied to your clipboard!"
echo ""
echo "📋 3 SIMPLE STEPS:"
echo ""
echo "   1. Click this link (or it will open automatically):"
echo "      👉 $SQL_EDITOR"
echo ""
echo "   2. Paste the SQL (Cmd+V) - it's already in your clipboard!"
echo ""
echo "   3. Click 'Run' button (or press Cmd+Enter)"
echo ""
echo "⏳ Opening SQL Editor in 3 seconds..."
sleep 3
open "$SQL_EDITOR"
echo ""
echo "✅ Browser opened!"
echo ""
echo "After you run the SQL, come back here and I'll verify it worked."
echo ""
read -p "Press Enter after you've run the SQL in the browser... "

echo ""
echo "🔍 Verifying table creation..."
echo ""

node scripts/utilities/create-course-leads-table.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Table created and verified!"
    echo "✅ Your Supabase database is ready for form submissions!"
else
    echo ""
    echo "⚠️  Table not found yet. Please make sure you:"
    echo "   1. Pasted the SQL correctly"
    echo "   2. Clicked 'Run'"
    echo "   3. Saw a success message"
    echo ""
    echo "Then run this script again to verify."
fi


