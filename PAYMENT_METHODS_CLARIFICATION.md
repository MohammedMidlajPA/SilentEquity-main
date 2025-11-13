# 💳📱 Payment Methods - Card & UPI Only

## ⚠️ Important: Google Pay Not Available in India

According to Stripe documentation:
- **Google Pay**: Available worldwide **EXCEPT India**
- **Customer locations**: Worldwide except India

Since you're targeting Indian customers (INR currency, UPI), **Google Pay will NOT be available**.

## ✅ Available Payment Methods for India

### 1. Card Payment 💳
- ✅ **Available**: Yes
- ✅ **3D Secure/OTP**: Automatic (will ask OTP)
- ✅ **Works**: Credit/Debit cards
- ✅ **Currency**: INR (with conversion)

### 2. UPI Payment 📱
- ✅ **Available**: Yes (if enabled in Dashboard)
- ✅ **Currency**: INR (required)
- ✅ **Works**: UPI ID or QR code
- ✅ **Location**: India only

## 🎯 Current Configuration

Your checkout is configured to show:
- **Card** (always available)
- **UPI** (appears automatically if enabled)

**Google Pay is NOT included** because it's not available in India.

## ✅ Implementation Status

- ✅ Card: Configured with OTP
- ✅ UPI: Configured to appear automatically
- ❌ Google Pay: Not available for Indian customers

## 🧪 Testing

1. **Test Card**: Use test card `4242 4242 4242 4242`
2. **Test UPI**: Should appear if enabled in Dashboard
3. **Google Pay**: Will NOT appear (not available in India)

## 📋 Summary

**For Indian customers, you have:**
- ✅ Card payment (with OTP)
- ✅ UPI payment (if enabled)

**Google Pay is not an option** for Indian customers per Stripe's limitations.

