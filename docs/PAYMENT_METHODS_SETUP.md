# Payment Methods Setup Guide

## Available Payment Methods

### ✅ Card Payments
- **Status**: Always enabled
- **3D Secure/OTP**: Automatic (required for Indian cards)
- **Availability**: Worldwide
- **Currencies**: All supported currencies

### ✅ Google Pay
- **Status**: Automatically enabled with cards (no code changes needed)
- **Availability**: 
  - ✅ Available for international customers (USD, EUR, GBP, etc.)
  - ❌ **NOT available in India** (per Stripe limitations)
- **Requirements**:
  - Cards must be enabled
  - Customer must have Google Pay set up
  - Device/browser must support Google Pay
  - Customer location must NOT be India

### ✅ Amazon Pay
- **Status**: Enabled in code, requires Dashboard activation
- **Availability**: Worldwide (except INR currency)
- **Supported Currencies**: USD, EUR, GBP, AUD, DKK, HKD, JPY, NZD, NOK, ZAR, SEK, CHF
- **Note**: Amazon Pay does NOT support INR currency

### ✅ UPI (Unified Payments Interface)
- **Status**: Enabled via Dashboard (if available for your account)
- **Availability**: India only
- **Currency**: INR only
- **Requirements**: Must be enabled in Stripe Dashboard

## Dashboard Configuration

### Step 1: Enable Amazon Pay

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Navigate to**: Settings → Payment Methods
3. **Find "Amazon Pay"** in the payment methods list
4. **Click "Set up"** or **"Turn on"** (may require terms acceptance)
5. **Save changes**

### Step 2: Verify Google Pay

- Google Pay is **automatically enabled** with cards
- No separate toggle needed
- Will appear automatically for non-Indian customers

### Step 3: Enable UPI (Optional, India only)

1. **Go to Stripe Dashboard**: Settings → Payment Methods
2. **Find "UPI"** in the list
3. **Enable it** (may require beta access)
4. **Save changes**

## Payment Method Availability by Customer Location

### For Indian Customers (INR Currency):
- ✅ **Card** - Credit/Debit cards with OTP
- ✅ **UPI** - If enabled in Dashboard
- ✅ **Amazon Pay** - Not available (INR not supported)
- ❌ **Google Pay** - Not available in India

### For International Customers (USD/EUR/GBP):
- ✅ **Card** - Credit/Debit cards
- ✅ **Google Pay** - Automatically available
- ✅ **Amazon Pay** - If enabled in Dashboard
- ❌ **UPI** - India only

## Code Configuration

### Course Enrollment (`courseController.js`)
```javascript
payment_method_types: ['card', 'amazon_pay']
```
- Explicitly includes Card and Amazon Pay
- Google Pay automatically enabled with cards

### Webinar Payment (`paymentController.js`)
```javascript
// Omitting payment_method_types - Stripe auto-detects
// Based on currency and customer location
```
- Dynamic payment method detection
- Stripe shows appropriate methods based on:
  - Currency (INR vs USD/EUR)
  - Customer location
  - Dashboard settings

## Testing

### Test Card Payment
1. Create checkout session
2. Select "Card" payment method
3. Use test card: `4242 4242 4242 4242`
4. Complete payment with OTP (if Indian card)

### Test Google Pay (International)
1. Use VPN or non-Indian IP address
2. Create checkout session with USD/EUR currency
3. Google Pay should appear automatically
4. Complete payment using Google Pay

### Test Amazon Pay
1. Ensure Amazon Pay is enabled in Dashboard
2. Create checkout session with USD/EUR currency (not INR)
3. Amazon Pay should appear as payment option
4. Complete payment using Amazon Pay

### Test UPI (India only)
1. Ensure UPI is enabled in Dashboard
2. Create checkout session with INR currency
3. UPI should appear as payment option
4. Complete payment using UPI ID or QR code

## Troubleshooting

### Amazon Pay Not Appearing
- **Check**: Is Amazon Pay enabled in Dashboard?
- **Check**: Is currency supported? (USD, EUR, GBP, etc. - NOT INR)
- **Check**: Is customer location supported?

### Google Pay Not Appearing
- **Check**: Is customer in India? (Google Pay not available in India)
- **Check**: Does customer have Google Pay set up?
- **Check**: Is device/browser compatible?
- **Check**: Are cards enabled? (Google Pay requires cards)

### UPI Not Appearing
- **Check**: Is UPI enabled in Dashboard?
- **Check**: Is currency INR?
- **Check**: Is customer location India?
- **Note**: UPI may require beta access - contact Stripe Support

## Support

If payment methods don't appear:
1. Check Stripe Dashboard → Settings → Payment Methods
2. Verify payment method is enabled
3. Check currency compatibility
4. Contact Stripe Support: https://support.stripe.com/contact


