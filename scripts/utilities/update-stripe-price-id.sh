#!/bin/bash

# Update Stripe Price ID for Course Enrollment
# Product ID: prod_TTZmE3dOKNtBVp
# Default Price ID: price_1SWcd81R8sS9eHMU6c31RDAC

set -e

BACKEND_ENV_FILE="backend/.env"
NEW_PRICE_ID="price_1SWcd81R8sS9eHMU6c31RDAC"
PRODUCT_ID="prod_TTZmE3dOKNtBVp"

echo "🔧 Updating Stripe Price ID for Course Enrollment"
echo "=================================================="
echo ""
echo "Product ID: $PRODUCT_ID"
echo "Price ID: $NEW_PRICE_ID"
echo ""

# Check if .env file exists
if [ ! -f "$BACKEND_ENV_FILE" ]; then
    echo "❌ Error: $BACKEND_ENV_FILE not found"
    echo "   Please create the file first or run this from the project root"
    exit 1
fi

# Backup .env file
BACKUP_FILE="${BACKEND_ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$BACKEND_ENV_FILE" "$BACKUP_FILE"
echo "✅ Backed up .env to: $BACKUP_FILE"
echo ""

# Check if STRIPE_PRICE_ID exists in .env
if grep -q "^STRIPE_PRICE_ID=" "$BACKEND_ENV_FILE"; then
    # Update existing STRIPE_PRICE_ID
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|^STRIPE_PRICE_ID=.*|STRIPE_PRICE_ID=$NEW_PRICE_ID|" "$BACKEND_ENV_FILE"
    else
        # Linux
        sed -i "s|^STRIPE_PRICE_ID=.*|STRIPE_PRICE_ID=$NEW_PRICE_ID|" "$BACKEND_ENV_FILE"
    fi
    echo "✅ Updated STRIPE_PRICE_ID to: $NEW_PRICE_ID"
else
    # Add STRIPE_PRICE_ID if it doesn't exist
    echo "" >> "$BACKEND_ENV_FILE"
    echo "# Stripe Price ID for Course Enrollment (Code of Consistency)" >> "$BACKEND_ENV_FILE"
    echo "STRIPE_PRICE_ID=$NEW_PRICE_ID" >> "$BACKEND_ENV_FILE"
    echo "✅ Added STRIPE_PRICE_ID: $NEW_PRICE_ID"
fi

echo ""
echo "📋 Verification:"
echo "=================="
grep "^STRIPE_PRICE_ID=" "$BACKEND_ENV_FILE" || echo "⚠️  STRIPE_PRICE_ID not found (this shouldn't happen)"

echo ""
echo "✅ Update complete!"
echo ""
echo "⚠️  IMPORTANT: Restart your backend server for changes to take effect"
echo "   cd backend && npm start"
echo ""


