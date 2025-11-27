#!/bin/bash

# Cleanup unnecessary markdown files
# Keeps only essential documentation

set -e

echo "🧹 Cleaning up unnecessary markdown files..."
echo "=========================================="
echo ""

# Files to keep (essential documentation)
KEEP_FILES=(
  "README.md"
  "frontend/README.md"
  "docs/security/SECURITY_AUDIT_REPORT.md"
  "docs/deployment/DEPLOYMENT_WORKFLOW.md"
  "docs/deployment/PRODUCTION_READY.md"
  "docs/deployment/VPS_DEPLOYMENT_GUIDE.md"
  "docs/PAYMENT_METHODS_SETUP.md"
  "docs/STRIPE_3DS_OTP.md"
  "docs/STRIPE_INVOICE_AUTOMATIC.md"
  "docs/supabase/SUPABASE_MIGRATION.md"
  "TEST_GUIDE.md"
)

# Files to remove (temporary fixes, status files, old documentation)
REMOVE_FILES=(
  # Fix/Status files
  "RESTART_BACKEND_FIX.md"
  "COUPONS_CREATED.md"
  "FIX_ENROLLMENT_ERROR.md"
  "FIX_STRIPE_KEY.md"
  "FIX_CODE_REVIEW_ISSUES.md"
  "FIXED_CORS.md"
  "FIXED_FETCH_ERROR.md"
  "FIXED_FINAL.md"
  "FIXED_PORT.md"
  "STRIPE_KEY_FIX.md"
  "STRIPE_KEY_INCOMPLETE.md"
  "STRIPE_KEY_TROUBLESHOOTING.md"
  "PROMOTION_CODE_FIX.md"
  "UPI_NOT_APPEARING_FIX.md"
  "UPI_FINAL_FIX.md"
  "OTP_UPI_FIXED.md"
  "CONNECTION_FIX.md"
  "PAYMENT_FIXED.md"
  "PAYMENT_WORKING.md"
  
  # Status/Complete files
  "AUTOMATED_SETUP_COMPLETE.md"
  "COMPLETE_SETUP_STATUS.md"
  "SUPABASE_SETUP_COMPLETE.md"
  "PRODUCTION_KEYS_UPDATED.md"
  "FINAL_VERIFICATION_REPORT.md"
  "FINAL_PUSH.md"
  
  # Old implementation summaries
  "CHANGES_SUMMARY.md"
  "IMPLEMENTATION_SUMMARY.md"
  "CODE_REVIEW_COMPLETE.md"
  "COMPREHENSIVE_REVIEW.md"
  "CODERABBIT_CODE_REVIEW.md"
  "SECURITY_AND_STRUCTURE_SUMMARY.md"
  "CODEBASE_STRUCTURE.md"
  "TEST_FIXES_SUMMARY.md"
  "TEST_REPORT.md"
  "EMAIL_TEST_RESULTS.md"
  "EMAIL_DELIVERY_TROUBLESHOOTING.md"
  
  # Old guides that are outdated
  "COUPON_CODE_IMPLEMENTATION.md"
  "PAYMENT_METHODS_IMPLEMENTATION.md"
  "PAYMENT_METHODS_CLARIFICATION.md"
  "CARD_UPI_IMPLEMENTATION.md"
  "UPI_QR_CODE_IMPLEMENTATION.md"
  "UPI_SETUP.md"
  "UPI_FINAL_STATUS.md"
  "UPI_PRODUCTION_TEST.md"
  "UPI_MCP_ENABLE.md"
  "ENABLE_UPI_STEPS.md"
  "APPLE_PAY_INDIA.md"
  "DATABASE_FORM_FIXES.md"
  
  # Setup/Config files (already done)
  "PRODUCTION_MIGRATION.md"
  "PRODUCTION_SWITCH_GUIDE.md"
  "SWITCH_TO_PRODUCTION.md"
  "STRIPE_PRODUCTION_UPDATE.md"
  "PRODUCTION_READY_CHECKLIST.md"
  "HOSTINGER_MCP_INTEGRATION.md"
  "HOSTINGER_MCP_SETUP.md"
  "GITHUB_SETUP.md"
  "AUTO_PUSH_INSTRUCTIONS.md"
  "PUSH.md"
  "USE_TOKEN.md"
  
  # Test files
  "TEST_IN_BROWSER.md"
  "TEST_BUTTON.md"
  "QUICK_TEST.md"
  "DEBUG_STEPS.md"
  "README_START.md"
  
  # Old docs
  "PLAN.md"
)

# Count files to remove
REMOVE_COUNT=0
for file in "${REMOVE_FILES[@]}"; do
  if [ -f "$file" ]; then
    REMOVE_COUNT=$((REMOVE_COUNT + 1))
  fi
done

echo "📊 Files to remove: $REMOVE_COUNT"
echo "📊 Files to keep: ${#KEEP_FILES[@]}"
echo ""

# Ask for confirmation
read -p "Continue with cleanup? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cleanup cancelled"
  exit 1
fi

# Remove files
REMOVED=0
for file in "${REMOVE_FILES[@]}"; do
  if [ -f "$file" ]; then
    rm "$file"
    echo "🗑️  Removed: $file"
    REMOVED=$((REMOVED + 1))
  fi
done

echo ""
echo "✅ Cleanup complete!"
echo "   Removed: $REMOVED files"
echo "   Kept: ${#KEEP_FILES[@]} essential documentation files"





