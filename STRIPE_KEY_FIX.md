# 🔧 Stripe Connection Error Fix

## Problem
**Error**: `Invalid API Key provided`

## Possible Causes

1. **Key is incomplete** - The key might be truncated
2. **Key has extra characters** - Spaces, newlines, or special characters
3. **Key not activated** - Live mode keys need account activation
4. **Wrong key copied** - Might have copied test key instead of live key

## Solution Steps

### Step 1: Verify Key in Stripe Dashboard

1. **Go to**: https://dashboard.stripe.com
2. **Switch to Live Mode** (toggle top right)
3. **Navigate**: Developers → API Keys
4. **Click**: "Reveal test key" or "Reveal live key"
5. **Copy the FULL key** - Make sure you copy the entire key

### Step 2: Check Key Format

A valid Stripe secret key should:
- Start with `sk_live_` (for production)
- Be approximately 100-110 characters long
- Contain only alphanumeric characters (no spaces, newlines, or special chars)

### Step 3: Update Backend .env

**File**: `backend/.env`

```bash
# Remove any spaces, newlines, or special characters
STRIPE_SECRET_KEY=sk_live_YOUR_COMPLETE_KEY_HERE
```

**Important**: 
- No spaces before or after the `=`
- No quotes around the key
- No trailing characters

### Step 4: Verify Key

Test the key manually:

```bash
cd backend
node -e "require('dotenv').config(); const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); stripe.accounts.retrieve().then(acc => console.log('✅ Valid key, Account:', acc.id)).catch(err => console.error('❌ Invalid:', err.message))"
```

### Step 5: Common Issues

#### Issue: Key ends with `>` or other characters
**Fix**: Remove trailing characters, copy only the key

#### Issue: Key has spaces
**Fix**: Remove all spaces from the key

#### Issue: Key is incomplete
**Fix**: Copy the full key from Stripe Dashboard

#### Issue: Account not activated for live mode
**Fix**: Complete Stripe account activation in Dashboard

## Quick Fix Script

```bash
# Edit backend/.env
cd backend
nano .env  # or use your preferred editor

# Make sure STRIPE_SECRET_KEY line looks like:
# STRIPE_SECRET_KEY=sk_live_51SJGxH1R8sS9eHMU... (complete key, no spaces)
```

## Verify After Fix

```bash
cd backend
npm start
# Should see: "Stripe is in LIVE mode" and "Stripe connected"
```

## Still Having Issues?

1. **Double-check** you're copying from Live Mode (not Test Mode)
2. **Verify** your Stripe account is fully activated
3. **Check** for any account restrictions in Stripe Dashboard
4. **Contact** Stripe Support if key still doesn't work

