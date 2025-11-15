# 🚀 Switch Stripe to Production Mode

## Quick Start

### Option 1: Use the Script (Recommended)

```bash
cd /Users/mohammedmidlajpa/Downloads/SilentEquity-main
./scripts/utilities/switch-to-production.sh
```

The script will:
- ✅ Backup your current `.env` files
- ✅ Prompt for production keys
- ✅ Update both backend and frontend `.env` files
- ✅ Validate key formats

### Option 2: Manual Update

## Step 1: Get Production Keys from Stripe

1. **Log in**: https://dashboard.stripe.com
2. **Switch to Live Mode** (toggle in top right)
3. **Go to**: Developers → API Keys
4. **Copy**:
   - Secret Key: `sk_live_...`
   - Publishable Key: `pk_live_...`

## Step 2: Get Webhook Secret

1. **Go to**: Developers → Webhooks
2. **Add endpoint** (if not exists): `https://your-api-domain.com/api/payment/webhook`
3. **Select events**:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. **Copy** webhook signing secret: `whsec_...`

## Step 3: Update Backend `.env`

**File**: `backend/.env`

```bash
# Change these lines:
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

## Step 4: Update Frontend `.env`

**File**: `frontend/.env`

```bash
# Change these lines:
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## Step 5: Verify Production Mode

### Backend
```bash
cd backend
npm start
```

**Look for**: `Stripe is in LIVE mode` ✅

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Step 6: Test Production Payment

1. **Use a real card** (start with small amount)
2. **Verify** payment processes successfully
3. **Check** webhook receives events
4. **Verify** email confirmation sent
5. **Check** database record created

## 🔐 Security Checklist

- [ ] Live keys are secure (never commit to Git)
- [ ] `.env` files are in `.gitignore`
- [ ] Webhook endpoint uses HTTPS
- [ ] Webhook signature verification enabled
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] Error logging configured

## 🔄 Rollback Plan

If you need to rollback to test mode:

```bash
# Restore backups
cp backend/.env.backup.* backend/.env
cp frontend/.env.backup.* frontend/.env

# Or manually change keys back to test keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## ⚠️ Important Notes

1. **Test First**: Always test in test mode before switching
2. **Backup**: Script creates backups automatically
3. **Webhook**: Must be accessible publicly (HTTPS required)
4. **Monitoring**: Watch logs after switching to production
5. **Small Test**: Start with a small real payment to verify

## 📊 After Switching

Monitor:
- Payment success rates
- Webhook processing times
- Failed payments
- Email delivery rates
- Error logs in `logs/error.log`

## ✅ Verification

After switching, verify:
- [ ] Backend logs show "Stripe is in LIVE mode"
- [ ] Frontend uses live publishable key
- [ ] Webhook endpoint accessible
- [ ] Test payment succeeds
- [ ] Email confirmation sent
- [ ] Database record created

---

**Ready to switch?** Run the script or follow manual steps above! 🚀

