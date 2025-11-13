# 🚀 Stripe Test to Production Migration Guide

## ⚠️ Important: Before Switching to Production

1. **Test Everything** in test mode first
2. **Backup** your current `.env` files
3. **Verify** webhook endpoint is accessible publicly
4. **Update** webhook secret in Stripe Dashboard

## 📋 Step-by-Step Migration

### Step 1: Get Production Stripe Keys

1. **Log in to Stripe Dashboard**: https://dashboard.stripe.com
2. **Switch to Live Mode** (toggle in top right)
3. **Go to**: Developers → API Keys
4. **Copy** your Live keys:
   - `sk_live_...` (Secret Key)
   - `pk_live_...` (Publishable Key)

### Step 2: Update Backend Environment Variables

**File**: `backend/.env`

```bash
# Change from test to live keys
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY

# Update webhook secret (get from Stripe Dashboard → Webhooks → Your endpoint)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET

# Update frontend URL to production domain
FRONTEND_URL=https://yourdomain.com

# Set production environment
NODE_ENV=production
```

### Step 3: Update Frontend Environment Variables

**File**: `frontend/.env`

```bash
# Change from test to live publishable key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY

# Update API URL to production backend
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Step 4: Configure Production Webhook

1. **Go to**: Stripe Dashboard → Developers → Webhooks
2. **Add endpoint**: `https://api.yourdomain.com/api/payment/webhook`
3. **Select events**:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. **Copy webhook secret** and add to `backend/.env`

### Step 5: Verify Production Setup

```bash
# Test backend connection
cd backend
npm start
# Should show: ✅ Stripe is in LIVE mode

# Test frontend
cd frontend
npm run build
npm run preview
```

### Step 6: Test Production Payment

1. **Use real card** (small amount)
2. **Verify** payment processes
3. **Check** webhook receives events
4. **Verify** email sent
5. **Check** database record created

## 🔐 Security Checklist

- [ ] Live keys are secure (never commit to Git)
- [ ] Webhook endpoint uses HTTPS
- [ ] Webhook signature verification enabled
- [ ] Rate limiting configured
- [ ] CORS configured for production domain only
- [ ] Environment variables not exposed in frontend

## 📊 Monitoring

After going live, monitor:
- Payment success rates
- Webhook processing times
- Failed payments
- Email delivery rates
- Error logs

## 🔄 Rollback Plan

If issues occur:
1. **Switch back** to test keys in `.env`
2. **Restart** servers
3. **Investigate** issues
4. **Fix** and test again
5. **Switch** back to live when ready

## ✅ Production Checklist

- [ ] Live Stripe keys configured
- [ ] Webhook endpoint accessible
- [ ] Webhook secret updated
- [ ] Frontend URL updated
- [ ] HTTPS enabled
- [ ] Database connection secure
- [ ] Email service configured
- [ ] Error logging enabled
- [ ] Monitoring set up

**Ready for production!** 🎉

