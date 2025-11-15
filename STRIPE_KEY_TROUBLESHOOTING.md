# 🔧 Stripe Key Troubleshooting Guide

## Current Error
**Error**: `Invalid API Key provided`

## Quick Fix Steps

### Step 1: Get Fresh Key from Stripe Dashboard

1. **Go to**: https://dashboard.stripe.com
2. **IMPORTANT**: Toggle to **Live Mode** (top right - must show "Live mode")
3. **Navigate**: Developers → API Keys
4. **Click**: "Reveal live key" button
5. **Copy the ENTIRE key** - Make sure you copy all characters

### Step 2: Verify Key Format

A valid Stripe live key should:
- ✅ Start with `sk_live_`
- ✅ Be **exactly** 107 characters long (including `sk_live_`)
- ✅ Contain only letters and numbers (no spaces, no `>` symbol)

### Step 3: Update Backend .env

**File**: `backend/.env`

```bash
# Remove the old key and paste the NEW complete key
STRIPE_SECRET_KEY=sk_live_YOUR_COMPLETE_KEY_HERE_NO_SPACES
```

**Important**:
- No spaces before or after `=`
- No quotes around the key
- No trailing characters like `>` or newlines
- Copy the ENTIRE key from Stripe

### Step 4: Verify the Key

Run the verification script:

```bash
./scripts/utilities/verify-stripe-key.sh
```

Or test manually:

```bash
cd backend
node -e "require('dotenv').config(); const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); stripe.accounts.retrieve().then(acc => console.log('✅ Valid! Account:', acc.id)).catch(err => console.error('❌ Invalid:', err.message))"
```

## Common Issues

### Issue 1: Key is Incomplete
**Symptom**: Key is less than 100 characters
**Fix**: Copy the complete key from Stripe Dashboard

### Issue 2: Key Has Trailing Characters
**Symptom**: Key ends with `>`, spaces, or newlines
**Fix**: Remove all trailing characters, copy only the key

### Issue 3: Wrong Mode
**Symptom**: Using test key (`sk_test_`) instead of live key (`sk_live_`)
**Fix**: Switch to Live Mode in Stripe Dashboard before copying

### Issue 4: Account Not Activated
**Symptom**: Key format is correct but still invalid
**Fix**: 
- Complete Stripe account activation
- Verify account status in Dashboard
- Check for any account restrictions

### Issue 5: Key Copied Incorrectly
**Symptom**: Missing characters in the middle
**Fix**: Use "Reveal key" button in Stripe Dashboard, don't copy manually

## Verification Checklist

- [ ] Key starts with `sk_live_`
- [ ] Key is exactly 107 characters long
- [ ] No spaces in the key
- [ ] No trailing characters (`>`, newlines, etc.)
- [ ] Copied from Live Mode (not Test Mode)
- [ ] Account is activated for live mode
- [ ] Key is in `backend/.env` file
- [ ] No quotes around the key value

## Still Not Working?

1. **Double-check** you're in Live Mode in Stripe Dashboard
2. **Try creating a new API key** in Stripe Dashboard
3. **Verify** your Stripe account is fully activated
4. **Check** Stripe Dashboard for any account restrictions
5. **Contact** Stripe Support: https://support.stripe.com

## Expected Output When Working

When the key is valid, you should see:
```
✅ SUCCESS!
   Account ID: acct_xxxxx
   Country: US (or your country)
   Type: standard
   Charges Enabled: true
   Payouts Enabled: true
```

## Next Steps After Fix

Once the key is verified:
1. Update webhook secret for production
2. Update production URLs
3. Test with a small real payment
4. Monitor Stripe Dashboard

