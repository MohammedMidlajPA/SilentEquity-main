# 🧪 UPI Production Testing Guide

## ✅ Current Status

- ✅ **UPI Enabled** in Stripe Dashboard
- ✅ **Code Configured** for dynamic payment methods
- ✅ **INR Currency** set (required for UPI)
- ✅ **Webhook Handling** ready for UPI payments

## 🎯 How UPI Works in Checkout

1. **Customer clicks "JOIN THE WAITLIST"**
   - Creates checkout session with INR currency
   - Stripe shows all available payment methods (Card + UPI)

2. **Customer selects UPI**
   - Stripe displays QR code or UPI ID input
   - Customer scans QR or enters UPI ID
   - Payment processes via UPI network

3. **Payment Completion**
   - UPI payments are **asynchronous** (may take a few seconds)
   - Webhook receives `checkout.session.async_payment_succeeded`
   - Customer redirected to success page

## 🧪 Testing Steps

### Test 1: Verify UPI Appears in Checkout

```bash
# Create checkout session
curl -X POST http://localhost:5001/api/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Result:**
- Checkout URL created successfully
- Open URL in browser
- **UPI should appear** as payment option alongside Cards

### Test 2: Test UPI Payment Flow

1. **Create checkout session** (use button or API)
2. **Open checkout URL** in browser
3. **Select UPI** as payment method
4. **Enter test UPI ID** or scan QR code
5. **Complete payment** in UPI app
6. **Verify redirect** to success page
7. **Check email** for confirmation

### Test 3: Verify Webhook Handling

UPI payments trigger these webhook events:
- `checkout.session.completed` (if payment is immediate)
- `checkout.session.async_payment_succeeded` (for async UPI payments)
- `checkout.session.async_payment_failed` (if payment fails)

**Check webhook logs:**
```bash
tail -f /tmp/backend-final.log | grep -i "upi\|async\|webhook"
```

## 🔍 Verification Checklist

- [ ] UPI appears in checkout page
- [ ] QR code displays correctly
- [ ] UPI ID input works
- [ ] Payment processes successfully
- [ ] Webhook receives async_payment_succeeded
- [ ] Email confirmation sent
- [ ] Payment record created in database
- [ ] Success page displays correctly

## 📋 UPI Payment Flow

```
User clicks "JOIN THE WAITLIST"
    ↓
Backend creates checkout session (INR currency)
    ↓
Stripe Checkout shows: Card + UPI options
    ↓
User selects UPI
    ↓
Stripe shows QR code / UPI ID input
    ↓
User completes payment in UPI app
    ↓
Stripe processes payment (async)
    ↓
Webhook: checkout.session.async_payment_succeeded
    ↓
Backend processes payment & sends email
    ↓
User redirected to success page
```

## 🚀 Production Readiness

### Code Status
- ✅ Checkout session creation
- ✅ Dynamic payment methods
- ✅ INR currency
- ✅ Webhook handling for async payments
- ✅ Email notifications
- ✅ Database records

### Environment Variables
- ✅ `STRIPE_SECRET_KEY` - Test/Live key
- ✅ `STRIPE_WEBHOOK_SECRET` - Webhook signature verification
- ✅ `FRONTEND_URL` - Success/cancel URLs
- ✅ `WEBINAR_PRICE` - Base price in USD
- ✅ `MONGODB_URI` - Database connection

### Webhook Configuration
- ✅ Webhook endpoint: `/api/payment/webhook`
- ✅ Signature verification enabled
- ✅ Handles `checkout.session.completed`
- ✅ Handles `checkout.session.async_payment_succeeded`
- ✅ Handles `checkout.session.async_payment_failed`

## 🐛 Troubleshooting

### UPI Not Appearing?
1. Check Dashboard → Settings → Payment Methods
2. Verify UPI is enabled
3. Check currency is INR
4. Clear browser cache

### Payment Not Completing?
1. Check webhook logs
2. Verify webhook endpoint is accessible
3. Check Stripe Dashboard → Events
4. Verify webhook secret is correct

### Email Not Sending?
1. Check email configuration
2. Verify SMTP settings
3. Check email logs
4. Test email service

## 📞 Support

- Stripe Dashboard: https://dashboard.stripe.com
- Webhook Events: https://dashboard.stripe.com/test/events
- Payment Methods: https://dashboard.stripe.com/settings/payment_methods

## ✅ Production Checklist

- [ ] Test UPI payment in test mode
- [ ] Verify webhook receives events
- [ ] Test email delivery
- [ ] Verify database records
- [ ] Switch to live mode
- [ ] Test with real UPI payment
- [ ] Monitor webhook events
- [ ] Verify production webhook endpoint

**Your UPI integration is ready for production!** 🎉

