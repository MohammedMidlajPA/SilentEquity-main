# 🔐 Stripe 3D Secure (OTP) Authentication

## Overview

Stripe Checkout **automatically handles 3D Secure (3DS) authentication** for card payments, including OTP verification required for Indian cards and other cards that require additional authentication.

## How It Works

### Automatic 3DS Handling

When a customer enters their card details in Stripe Checkout:

1. **Card Entry**: Customer enters card number, expiry, CVC
2. **Bank Assessment**: Stripe communicates with the card issuer to determine if 3DS is required
3. **OTP Prompt**: If required (especially for Indian cards), the customer sees a prompt to enter an OTP sent to their registered phone number
4. **Verification**: Customer enters the OTP code received via SMS
5. **Payment Completion**: Once verified, the payment is processed

### For Indian Cards

- **Mandatory**: Indian cards require 3D Secure authentication for online payments
- **OTP Delivery**: OTP is sent to the phone number registered with the bank
- **Automatic**: Stripe Checkout automatically detects Indian cards and triggers 3DS
- **No Configuration Needed**: This happens automatically - no additional setup required

## Current Configuration

Our checkout session is configured with:

```javascript
{
  phone_number_collection: {
    enabled: true  // Required for 3DS OTP verification
  },
  payment_method_types: ['card'],  // Explicitly enable card payments
  payment_method_options: {
    card: {
      request_three_d_secure: 'challenge'  // FORCE OTP verification (mandatory)
    }
  }
}
```

### Important: 3DS Challenge Mode

We use `request_three_d_secure: 'challenge'` to **force** OTP verification for all card payments. This ensures:
- ✅ Indian cards **MUST** complete OTP verification
- ✅ No payments can proceed without OTP
- ✅ Maximum security and fraud protection
- ✅ Compliance with RBI regulations

## Security Benefits

✅ **Fraud Protection**: 3DS shifts liability from merchant to card issuer  
✅ **Regulatory Compliance**: Meets SCA (Strong Customer Authentication) requirements  
✅ **Customer Trust**: Customers recognize the secure OTP verification process  
✅ **Prevents Unauthorized Use**: OTP ensures only the card owner can complete payment

## Testing 3DS

### Test Cards That Require 3DS

Use these test cards in Stripe test mode to verify OTP flow:

- **Visa**: `4000 0025 0000 3155` (requires 3DS)
- **Mastercard**: `5200 8282 8282 8210` (requires 3DS)
- **Any card**: Use `4000 0027 6000 3184` for 3DS authentication

### Test OTP Codes

When testing, use:
- **Success**: `123456`
- **Failure**: `000000` or any other code

## Important Notes

1. **Automatic**: Stripe Checkout handles 3DS automatically - no code changes needed
2. **Phone Number**: We collect phone numbers to support 3DS OTP delivery
3. **User Experience**: The OTP prompt appears seamlessly within Stripe Checkout
4. **No Additional Fees**: 3DS authentication doesn't incur additional charges

## References

- [Stripe 3D Secure Documentation](https://docs.stripe.com/payments/3d-secure)
- [Indian Payment Regulations](https://docs.stripe.com/india-accept-international-payments)
- [SCA Requirements](https://docs.stripe.com/strong-customer-authentication)

