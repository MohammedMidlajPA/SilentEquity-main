#!/bin/bash

# Script to update Supabase account configuration
# Usage: ./scripts/utilities/update-supabase-account.sh

echo "🔄 Supabase Account Migration Script"
echo "======================================"
echo ""

# New Supabase project details
NEW_PROJECT_ID="vqounfxvykhwbzxpodwq"
NEW_SUPABASE_URL="https://${NEW_PROJECT_ID}.supabase.co"

echo "New Supabase Project ID: ${NEW_PROJECT_ID}"
echo "New Supabase URL: ${NEW_SUPABASE_URL}"
echo ""

# Check if backend/.env exists
BACKEND_ENV="backend/.env"
if [ ! -f "$BACKEND_ENV" ]; then
    echo "⚠️  $BACKEND_ENV not found. Creating it..."
    touch "$BACKEND_ENV"
fi

# Backup existing .env file
if [ -f "$BACKEND_ENV" ]; then
    BACKUP_FILE="${BACKEND_ENV}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$BACKEND_ENV" "$BACKUP_FILE"
    echo "✅ Backed up existing .env to: $BACKUP_FILE"
fi

# Update SUPABASE_URL
if grep -q "^SUPABASE_URL=" "$BACKEND_ENV"; then
    sed -i.bak "s|^SUPABASE_URL=.*|SUPABASE_URL=${NEW_SUPABASE_URL}|" "$BACKEND_ENV"
    echo "✅ Updated SUPABASE_URL in $BACKEND_ENV"
else
    echo "SUPABASE_URL=${NEW_SUPABASE_URL}" >> "$BACKEND_ENV"
    echo "✅ Added SUPABASE_URL to $BACKEND_ENV"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Get your Service Role Key from the new Supabase project:"
echo "   → Go to: https://supabase.com/dashboard/project/${NEW_PROJECT_ID}"
echo "   → Navigate to: Settings → API"
echo "   → Under 'Project API keys', find the 'service_role' key (starts with 'eyJ...')"
echo "   → Copy the entire key"
echo ""
echo "2. Run this command to set the Service Role Key:"
echo "   ./scripts/utilities/get-supabase-service-key.sh"
echo ""
echo "   OR manually add to backend/.env:"
echo "   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here"
echo ""
echo "3. Make sure the 'course_leads' table exists in your new Supabase project."
echo "   Run the SQL from: docs/supabase/COURSE_LEADS_TABLE.sql"
echo ""
echo "4. Restart your backend server to apply changes."
echo ""
echo "⚠️  IMPORTANT: Keep your Service Role Key secret and never commit it to git!"
echo ""

