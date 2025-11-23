#!/bin/bash

# Fix Promotion Codes - Swap Coupons if Needed
# This script helps identify and fix promotion code to coupon mappings

set -e

echo "🔍 Checking Promotion Code to Coupon Mappings"
echo "=============================================="
echo ""

echo "Expected Mappings:"
echo "  EARLY36 → Coupon KkjYz0b1 (\$297 off)"
echo "  NEXT70 → Coupon V9rrQAR1 (\$263 off)"
echo ""

echo "⚠️  If the mappings are incorrect, you need to:"
echo ""
echo "1. Go to Stripe Dashboard → Coupons"
echo "2. Click on each promotion code"
echo "3. Edit the promotion code"
echo "4. Change the coupon it's linked to"
echo ""
echo "OR use Stripe API to update:"
echo ""
echo "For EARLY36 (should link to KkjYz0b1):"
echo "  stripe promotion_codes update promo_1SWct41R8sS9eHMU63EEPuuk --coupon=KkjYz0b1"
echo ""
echo "For NEXT70 (should link to V9rrQAR1):"
echo "  stripe promotion_codes update promo_1SWct41R8sS9eHMUtqbXRjof --coupon=V9rrQAR1"
echo ""


