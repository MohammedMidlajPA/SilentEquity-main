#!/bin/bash

# Script to help retrieve Supabase Service Role Key
# This key is required for backend operations

echo "🔑 Supabase Service Role Key Retrieval Guide"
echo "=============================================="
echo ""
echo "To get your Supabase Service Role Key:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/vqounfxvykhwbzxpodwq"
echo "2. Navigate to: Settings → API"
echo "3. Under 'Project API keys', find the 'service_role' key (starts with 'eyJ...')"
echo "4. Copy the entire key"
echo ""
echo "⚠️  WARNING: This key has admin privileges. Keep it secret!"
echo ""
read -p "Paste your Supabase Service Role Key here: " SERVICE_KEY

if [ -z "$SERVICE_KEY" ]; then
    echo "❌ No key provided. Exiting."
    exit 1
fi

# Update backend/.env
BACKEND_ENV="backend/.env"
if [ -f "$BACKEND_ENV" ]; then
    if grep -q "^SUPABASE_SERVICE_ROLE_KEY=" "$BACKEND_ENV"; then
        sed -i.bak "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY|" "$BACKEND_ENV"
        echo "✅ Updated SUPABASE_SERVICE_ROLE_KEY in $BACKEND_ENV"
    else
        echo "SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY" >> "$BACKEND_ENV"
        echo "✅ Added SUPABASE_SERVICE_ROLE_KEY to $BACKEND_ENV"
    fi
else
    echo "❌ $BACKEND_ENV not found"
    exit 1
fi

echo ""
echo "✅ Service Role Key configured successfully!"
echo "   You can now restart your backend server."



