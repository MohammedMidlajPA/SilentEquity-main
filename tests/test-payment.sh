#!/bin/bash

# Quick Payment API Test Script
# This script tests the payment checkout session creation

echo "🧪 Testing Stripe Checkout Integration"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "1. Checking if backend server is running..."
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server is running${NC}"
else
    echo -e "${RED}❌ Backend server is not running${NC}"
    echo "   Please start the server: cd backend && npm start"
    exit 1
fi

# Test health endpoint
echo ""
echo "2. Testing health endpoint..."
HEALTH=$(curl -s http://localhost:5000/api/health)
if echo "$HEALTH" | grep -q "success"; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "$HEALTH"
fi

# Test checkout session creation
echo ""
echo "3. Testing checkout session creation..."
echo "   (This will create a test checkout session)"

RESPONSE=$(curl -s -X POST http://localhost:5000/api/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890"
  }')

if echo "$RESPONSE" | grep -q "checkoutUrl"; then
    echo -e "${GREEN}✅ Checkout session created successfully!${NC}"
    CHECKOUT_URL=$(echo "$RESPONSE" | grep -o '"checkoutUrl":"[^"]*' | cut -d'"' -f4)
    SESSION_ID=$(echo "$RESPONSE" | grep -o '"sessionId":"[^"]*' | cut -d'"' -f4)
    echo ""
    echo "   Session ID: $SESSION_ID"
    echo "   Checkout URL: $CHECKOUT_URL"
    echo ""
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo "   1. Open the checkout URL in your browser"
    echo "   2. Use test card: 4242 4242 4242 4242"
    echo "   3. Complete the payment"
    echo "   4. You'll be redirected back to the success page"
else
    echo -e "${RED}❌ Failed to create checkout session${NC}"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
fi

echo ""
echo "======================================"
echo "✅ Test completed!"
echo ""
echo "📖 For more details, see TEST_GUIDE.md"

