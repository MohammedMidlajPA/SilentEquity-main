# 🔄 Switch Stripe to Production Mode

## Quick Start

Run the automated script:

```bash
cd /Users/mohammedmidlajpa/Downloads/SilentEquity-main
./scripts/utilities/switch-to-production.sh
```

## Manual Steps

### Step 1: Get Production Keys

1. **Login**: https://dashboard.stripe.com
2. **Toggle**: Switch to **Live Mode** (top right)
3. **Navigate**: Developers → API Keys
4. **Copy**:
   - Secret Key: `sk_live_...`
   - Publishable Key: `pk_live_...`

### Step 2: Get Webhook Secret

1. **Navigate**: Developers → Webhooks
2. **Add Endpoint**: `https://your-api-domain.com/api/payment/webhook`
3. **Select Events**:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. **Copy**: Webhook signing secret `whsec_...`

### Step 3: Update Backend `.env`

**File**: `backend/.env`

```bash
# Change from test to live keys
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET

# Update URLs
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

### Step 4: Update Frontend `.env` (if needed)

**File**: `frontend/.env`

```bash
# Only needed if frontend uses Stripe.js directly
# Since we use Stripe Checkout, this may not be required
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Step 5: Verify Production Mode

```bash
# Backend
cd backend
npm start
# Should show: "Stripe is in LIVE mode" ✅

# Frontend
cd frontend
npm run build
npm run preview
```

## ✅ Verification Checklist

- [ ] Backend logs show "Stripe is in LIVE mode"
- [ ] Webhook endpoint accessible (HTTPS)
- [ ] Test payment with real card (small amount)
- [ ] Webhook receives events
- [ ] Email confirmation sent
- [ ] Database record created

## 🔄 Rollback

```bash
# Restore backups
cp backend/.env.backup.* backend/.env
cp frontend/.env.backup.* frontend/.env
```

## 📊 Current Detection

The code automatically detects production mode:
- **Test Mode**: Key starts with `sk_test_`
- **Production Mode**: Key starts with `sk_live_`

No code changes needed - just update environment variables!

