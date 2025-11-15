#!/bin/bash

# Verify Stripe Key Script
# Tests if the Stripe API key is valid

echo "🔍 Stripe Key Verification"
echo "=========================="
echo ""

cd "$(dirname "$0")/../.." || exit 1

# Load environment variables
if [ -f "backend/.env" ]; then
  export $(grep -v '^#' backend/.env | xargs)
else
  echo "❌ Error: backend/.env not found"
  exit 1
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "❌ Error: STRIPE_SECRET_KEY not found in backend/.env"
  exit 1
fi

echo "📋 Key Information:"
echo "   Prefix: $(echo "$STRIPE_SECRET_KEY" | cut -c1-8)"
echo "   Length: $(echo "$STRIPE_SECRET_KEY" | wc -c | tr -d ' ') characters"
echo ""

# Check key format
if [[ "$STRIPE_SECRET_KEY" =~ ^sk_test_ ]]; then
  echo "⚠️  Warning: This is a TEST key (sk_test_)"
  echo "   Switch to Live Mode in Stripe Dashboard to get production key"
elif [[ "$STRIPE_SECRET_KEY" =~ ^sk_live_ ]]; then
  echo "✅ Key format: LIVE mode (sk_live_)"
else
  echo "❌ Error: Invalid key format"
  echo "   Key must start with 'sk_test_' or 'sk_live_'"
  exit 1
fi

echo ""
echo "🧪 Testing connection..."

# Test the key
cd backend || exit 1
node -e "
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

stripe.accounts.retrieve()
  .then(account => {
    console.log('✅ SUCCESS!');
    console.log('   Account ID:', account.id);
    console.log('   Country:', account.country);
    console.log('   Type:', account.type);
    console.log('   Charges Enabled:', account.charges_enabled);
    console.log('   Payouts Enabled:', account.payouts_enabled);
    process.exit(0);
  })
  .catch(error => {
    console.log('❌ FAILED!');
    console.log('   Error:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Verify key is complete (copy entire key from Stripe)');
    console.log('   2. Check you copied from correct mode (Live vs Test)');
    console.log('   3. Ensure account is activated for live mode');
    console.log('   4. Check for account restrictions in Stripe Dashboard');
    process.exit(1);
  });
"

