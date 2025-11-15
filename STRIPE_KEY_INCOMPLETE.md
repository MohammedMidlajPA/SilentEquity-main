# ⚠️ Stripe Key is Incomplete

## Problem
Your Stripe secret key is **101 characters** but needs to be **107 characters**.

**Current key ends with**: `...00az`  
**Missing**: ~6 characters

## Solution: Get Complete Key from Stripe

### Step 1: Access Stripe Dashboard
1. Go to: **https://dashboard.stripe.com**
2. **IMPORTANT**: Toggle to **Live Mode** (top right - must show "Live mode")
3. Navigate: **Developers** → **API Keys**

### Step 2: Reveal the Complete Key
1. Find the **Secret key** section
2. Click **"Reveal live key"** button
3. **Copy the ENTIRE key** - It should be exactly **107 characters**

### Step 3: Verify Key Length
A complete Stripe live secret key:
- Starts with: `sk_live_`
- Total length: **exactly 107 characters**
- Example format: `sk_live_51SJGxH1R8sS9eHMU...` (107 chars total)

### Step 4: Update backend/.env

**File**: `backend/.env`

```bash
STRIPE_SECRET_KEY=sk_live_YOUR_COMPLETE_107_CHARACTER_KEY_HERE
```

**Important**:
- No trailing `>` or other characters
- No spaces
- Copy the ENTIRE key from Stripe

### Step 5: Verify

After updating, test:

```bash
cd backend
node -e "require('dotenv').config(); const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); stripe.accounts.retrieve().then(acc => console.log('✅ Valid! Account:', acc.id)).catch(err => console.error('❌ Error:', err.message))"
```

## Why This Happens

The key you copied might have been:
- Truncated when copying
- Cut off in the source (email, document, etc.)
- Missing characters due to copy-paste issues

## Quick Check

Your current key: `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`

**Length**: 101 characters  
**Expected**: 107 characters  
**Missing**: 6 characters

## Still Having Issues?

If you've copied the complete 107-character key but it's still invalid:
1. Verify you're in **Live Mode** (not Test Mode)
2. Check if your Stripe account is fully activated
3. Try creating a **new API key** in Stripe Dashboard
4. Contact Stripe Support: https://support.stripe.com

---

**Action Required**: Copy the complete 107-character key from Stripe Dashboard Live Mode.

