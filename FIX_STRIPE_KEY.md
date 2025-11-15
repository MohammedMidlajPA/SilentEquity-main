# 🔧 Fix Stripe Key Error

## Problem
Your Stripe key is **incomplete** or **invalid**.

## Current Status
- Key length: **102 characters** (should be **107 characters**)
- Key format: ✅ Correct (`sk_live_`)
- Status: ❌ Invalid (missing ~5 characters)

## Solution

### Option 1: Get Complete Key from Stripe (Recommended)

1. **Go to**: https://dashboard.stripe.com
2. **Switch to Live Mode** (top right toggle)
3. **Navigate**: Developers → API Keys
4. **Click**: "Reveal live key" button
5. **Copy the COMPLETE key** - It should be exactly 107 characters

### Option 2: Check if Key Was Truncated

Your current key ends with: `...00az`

A complete Stripe live key should end with more characters. Check if:
- You copied the full key from Stripe
- The key wasn't cut off when pasting
- There are no missing characters

### Step-by-Step Fix

1. **Open** `backend/.env` file
2. **Find** the line: `STRIPE_SECRET_KEY=sk_live_...`
3. **Replace** with the complete key from Stripe Dashboard
4. **Verify** the key is exactly 107 characters
5. **Save** the file
6. **Test** using: `./scripts/utilities/verify-stripe-key.sh`

### Expected Key Format

```
sk_live_51SJGxH1R8sS9eHMU... (exactly 107 characters total)
```

### Quick Test

After updating, test the key:

```bash
cd backend
node -e "require('dotenv').config(); const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); stripe.accounts.retrieve().then(acc => console.log('✅ Valid! Account:', acc.id)).catch(err => console.error('❌ Error:', err.message))"
```

## Important Notes

- ✅ Stripe live keys are **exactly 107 characters** long
- ✅ Key must start with `sk_live_`
- ✅ No spaces, quotes, or special characters
- ✅ Copy the ENTIRE key from Stripe Dashboard

## Still Having Issues?

If the key is complete (107 chars) but still invalid:
1. Verify account is activated for live mode
2. Check for account restrictions in Stripe Dashboard
3. Try creating a new API key in Stripe
4. Contact Stripe Support

