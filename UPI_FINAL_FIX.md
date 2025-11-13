# 🔧 UPI Final Fix - Force UPI to Appear

## Current Issue

UPI is not appearing in checkout even though it's enabled in Dashboard.

## Root Cause

UPI might not be directly supported as a `payment_method_type` in Stripe Checkout for all account types. Stripe uses dynamic detection based on:
- Currency (INR)
- Customer location (India)
- Dashboard settings

## Solution Options

### Option 1: Use Payment Element (Recommended for UPI)

Payment Element has better UPI support than Checkout. This requires frontend changes.

### Option 2: Verify Dashboard Settings

1. **Check UPI is enabled**:
   - Go to: https://dashboard.stripe.com/settings/payment_methods
   - Click on your "Default" configuration
   - Verify UPI shows as "Enabled"

2. **Check Currency Settings**:
   - Ensure INR is supported
   - Check payment method rules

3. **Check Account Type**:
   - UPI might require specific account setup
   - Contact Stripe Support if needed

### Option 3: Test with Indian IP/Location

Stripe detects customer location. If testing from outside India:
- Use VPN with Indian IP
- Or test from actual Indian location
- UPI only shows for Indian customers

## Current Configuration

```javascript
{
  currency: 'inr',
  payment_method_types: ['card'], // Cards always work
  // UPI added dynamically if:
  // - Enabled in Dashboard
  // - Customer location is India
  // - Currency is INR
}
```

## Testing Steps

1. **Create checkout session**
2. **Open checkout URL**
3. **Check payment methods**:
   - Should see: Card
   - Should see: UPI (if conditions met)
4. **If UPI doesn't appear**:
   - Check Dashboard settings
   - Verify customer location (India)
   - Contact Stripe Support

## Alternative: Payment Element

If UPI still doesn't appear, consider switching to Payment Element which has better UPI support.

## Contact Stripe Support

If UPI still doesn't work:
- Go to: https://support.stripe.com/contact
- Request: "UPI not appearing in Checkout despite being enabled"
- Provide: Account ID, Checkout Session ID, Screenshot

