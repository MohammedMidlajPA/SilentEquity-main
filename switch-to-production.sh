#!/bin/bash

# Stripe Test to Production Migration Script
# This script helps switch from test to production Stripe keys

echo "🚀 Stripe Production Migration Script"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Error: backend/.env not found${NC}"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${RED}❌ Error: frontend/.env not found${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will switch from TEST to PRODUCTION mode${NC}"
echo -e "${YELLOW}⚠️  Make sure you have:${NC}"
echo "   1. Live Stripe keys (sk_live_... and pk_live_...)"
echo "   2. Production webhook secret"
echo "   3. Production frontend URL"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

# Backup current .env files
echo ""
echo "📦 Creating backups..."
cp backend/.env backend/.env.test.backup
cp frontend/.env frontend/.env.test.backup
echo -e "${GREEN}✅ Backups created${NC}"

# Get production keys
echo ""
echo "🔑 Enter Production Stripe Keys:"
read -p "Secret Key (sk_live_...): " STRIPE_SECRET
read -p "Publishable Key (pk_live_...): " STRIPE_PUBLISHABLE
read -p "Webhook Secret (whsec_...): " WEBHOOK_SECRET
read -p "Frontend URL (https://yourdomain.com): " FRONTEND_URL

# Update backend .env
echo ""
echo "📝 Updating backend/.env..."
sed -i.bak "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SECRET|" backend/.env
sed -i.bak "s|STRIPE_PUBLISHABLE_KEY=.*|STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE|" backend/.env
sed -i.bak "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|" backend/.env
sed -i.bak "s|FRONTEND_URL=.*|FRONTEND_URL=$FRONTEND_URL|" backend/.env
sed -i.bak "s|NODE_ENV=.*|NODE_ENV=production|" backend/.env
echo -e "${GREEN}✅ Backend .env updated${NC}"

# Update frontend .env
echo ""
echo "📝 Updating frontend/.env..."
sed -i.bak "s|VITE_STRIPE_PUBLISHABLE_KEY=.*|VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE|" frontend/.env
sed -i.bak "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=$FRONTEND_URL/api|" frontend/.env
echo -e "${GREEN}✅ Frontend .env updated${NC}"

# Clean up backup files
rm backend/.env.bak frontend/.env.bak 2>/dev/null

echo ""
echo -e "${GREEN}✅ Migration Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "   1. Restart backend server"
echo "   2. Rebuild frontend: cd frontend && npm run build"
echo "   3. Test with a small real payment"
echo "   4. Monitor Stripe Dashboard for payments"
echo ""
echo "📚 See PRODUCTION_MIGRATION.md for detailed guide"

