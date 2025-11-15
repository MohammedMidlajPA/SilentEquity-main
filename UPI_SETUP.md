# 📱 UPI Payment Setup Guide

## Current Status

UPI has been configured in the code, but **UPI availability depends on your Stripe account settings**.

## How Stripe UPI Works

1. **UPI is in Preview/Beta** - Not all accounts have access
2. **Account Location Matters** - UPI availability varies by account location
3. **Dashboard Settings** - Must be enabled in Stripe Dashboard

## ✅ Steps to Enable UPI

### Option 1: Enable in Stripe Dashboard (Recommended)

1. **Log in to Stripe Dashboard**: https://dashboard.stripe.com
2. **Go to Settings** → **Payment Methods**
3. **Find "UPI"** in the list
4. **Enable it** if available
5. **Save changes**

### Option 2: Contact Stripe Support

If UPI doesn't appear in your Dashboard:
- UPI might not be available for your account type/location
- Contact Stripe Support: https://support.stripe.com/contact
- Request UPI beta access

## 🔧 Code Configuration

The code is already set up to support UPI:

```javascript
// In backend/controllers/paymentController.js
// Omitting payment_method_types lets Stripe auto-detect available methods
const checkoutSession = await stripe.checkout.sessions.create({
  // No payment_method_types specified = Stripe shows all available methods
  // This includes UPI if enabled in Dashboard
  line_items: [{
    currency: 'inr', // INR required for Indian payment methods
    // ...
  }]
});
```

## 🧪 Testing UPI

1. **Create a checkout session** (already working)
2. **Check if UPI appears** in the Stripe Checkout page
3. **If UPI doesn't appear**: It's not enabled for your account

## 📋 Current Payment Methods

- ✅ **Card** - Always available (Credit/Debit cards)
- ⚠️ **UPI** - Available only if enabled in Dashboard

## 💡 Alternative: Payment Element

If UPI doesn't work with Checkout, consider using **Payment Element** instead:
- More control over payment methods
- Better UPI support
- Requires frontend changes

## 🔍 Check UPI Availability

Run this to test:
```bash
curl -X POST http://localhost:5001/api/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{}'
```

Then open the checkout URL and check if UPI appears as an option.

## 📞 Need Help?

- Stripe Docs: https://docs.stripe.com/payments/upi
- Stripe Support: https://support.stripe.com/contact
- Check Dashboard: https://dashboard.stripe.com/settings/payment_methods




