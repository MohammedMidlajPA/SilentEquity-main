#!/bin/bash

# 🔄 Switch Stripe from Test to Production Mode
# This script helps migrate from test keys to live keys

set -e

echo "🚀 Stripe Production Migration Script"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env files exist
BACKEND_ENV="backend/.env"
FRONTEND_ENV="frontend/.env"

if [ ! -f "$BACKEND_ENV" ]; then
  echo -e "${RED}❌ Error: $BACKEND_ENV not found${NC}"
  echo "Please create it first with your test keys"
  exit 1
fi

if [ ! -f "$FRONTEND_ENV" ]; then
  echo -e "${YELLOW}⚠️  Warning: $FRONTEND_ENV not found${NC}"
  echo "Creating it..."
  touch "$FRONTEND_ENV"
fi

# Backup existing .env files
echo "📦 Creating backups..."
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
cp "$BACKEND_ENV" "${BACKEND_ENV}.backup.${BACKUP_DATE}"
cp "$FRONTEND_ENV" "${FRONTEND_ENV}.backup.${BACKUP_DATE}" 2>/dev/null || true
echo -e "${GREEN}✅ Backups created${NC}"
echo ""

# Prompt for production keys
echo "🔑 Enter your Stripe Production Keys"
echo "Get them from: https://dashboard.stripe.com (switch to Live mode)"
echo ""

read -p "Stripe Secret Key (sk_live_...): " STRIPE_SECRET_KEY
read -p "Stripe Publishable Key (pk_live_...): " STRIPE_PUBLISHABLE_KEY
read -p "Stripe Webhook Secret (whsec_...): " STRIPE_WEBHOOK_SECRET
read -p "Production Frontend URL (e.g., https://yourdomain.com): " FRONTEND_URL
read -p "Production API URL (e.g., https://api.yourdomain.com/api): " API_URL

# Validate keys
if [[ ! "$STRIPE_SECRET_KEY" =~ ^sk_live_ ]]; then
  echo -e "${RED}❌ Error: Secret key must start with 'sk_live_'${NC}"
  exit 1
fi

if [[ ! "$STRIPE_PUBLISHABLE_KEY" =~ ^pk_live_ ]]; then
  echo -e "${RED}❌ Error: Publishable key must start with 'pk_live_'${NC}"
  exit 1
fi

if [[ ! "$STRIPE_WEBHOOK_SECRET" =~ ^whsec_ ]]; then
  echo -e "${YELLOW}⚠️  Warning: Webhook secret should start with 'whsec_'${NC}"
  read -p "Continue anyway? (y/n): " CONTINUE
  if [ "$CONTINUE" != "y" ]; then
    exit 1
  fi
fi

echo ""
echo "🔄 Updating backend/.env..."

# Update backend .env
sed -i.bak "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY|" "$BACKEND_ENV"
sed -i.bak "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET|" "$BACKEND_ENV"
sed -i.bak "s|FRONTEND_URL=.*|FRONTEND_URL=$FRONTEND_URL|" "$BACKEND_ENV"
sed -i.bak "s|NODE_ENV=.*|NODE_ENV=production|" "$BACKEND_ENV"

# Add if not exists
grep -q "^STRIPE_SECRET_KEY=" "$BACKEND_ENV" || echo "STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY" >> "$BACKEND_ENV"
grep -q "^STRIPE_WEBHOOK_SECRET=" "$BACKEND_ENV" || echo "STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET" >> "$BACKEND_ENV"
grep -q "^FRONTEND_URL=" "$BACKEND_ENV" || echo "FRONTEND_URL=$FRONTEND_URL" >> "$BACKEND_ENV"
grep -q "^NODE_ENV=" "$BACKEND_ENV" || echo "NODE_ENV=production" >> "$BACKEND_ENV"

echo -e "${GREEN}✅ Backend .env updated${NC}"

echo ""
echo "🔄 Updating frontend/.env..."

# Update frontend .env
sed -i.bak "s|VITE_STRIPE_PUBLISHABLE_KEY=.*|VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY|" "$FRONTEND_ENV" 2>/dev/null || true
sed -i.bak "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=$API_URL|" "$FRONTEND_ENV" 2>/dev/null || true

# Add if not exists
grep -q "^VITE_STRIPE_PUBLISHABLE_KEY=" "$FRONTEND_ENV" || echo "VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY" >> "$FRONTEND_ENV"
grep -q "^VITE_API_BASE_URL=" "$FRONTEND_ENV" || echo "VITE_API_BASE_URL=$API_URL" >> "$FRONTEND_ENV"

echo -e "${GREEN}✅ Frontend .env updated${NC}"

# Clean up backup files created by sed
rm -f "${BACKEND_ENV}.bak" "${FRONTEND_ENV}.bak" 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Migration Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "1. Verify webhook endpoint in Stripe Dashboard"
echo "2. Test a small payment"
echo "3. Monitor logs for any issues"
echo ""
echo "🔄 To rollback, restore from backups:"
echo "   cp ${BACKEND_ENV}.backup.${BACKUP_DATE} ${BACKEND_ENV}"
echo "   cp ${FRONTEND_ENV}.backup.${BACKUP_DATE} ${FRONTEND_ENV}"
echo ""
