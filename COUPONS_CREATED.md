# ✅ Stripe Coupons Created

## Status

✅ **Coupons Created Successfully**
- EARLY36: Coupon ID `zJ2CrraE` - $297 off, max 100 redemptions
- NEXT70: Coupon ID `SUbNlujf` - $263 off, max 400 redemptions

⚠️ **Promotion Codes**: Need to be created manually in Stripe Dashboard

## Coupon Details

### EARLY36
- **Coupon ID**: `zJ2CrraE`
- **Discount**: $297.00 off
- **Final Price**: $36.00 (from $333 base price)
- **Max Redemptions**: 100
- **Currency**: USD
- **Duration**: Once

### NEXT70
- **Coupon ID**: `SUbNlujf`
- **Discount**: $263.00 off
- **Final Price**: $70.00 (from $333 base price)
- **Max Redemptions**: 400
- **Currency**: USD
- **Duration**: Once

## Next Steps: Create Promotion Codes

The coupons are created, but promotion codes need to be created manually in Stripe Dashboard:

### Option 1: Stripe Dashboard (Recommended)

1. Go to [Stripe Dashboard → Coupons](https://dashboard.stripe.com/coupons)
2. Click on each coupon (EARLY36 or NEXT70)
3. Click "Create promotion code"
4. Enter the code:
   - For EARLY36 coupon: Enter code `EARLY36`
   - For NEXT70 coupon: Enter code `NEXT70`
5. Set max redemptions:
   - EARLY36: 100
   - NEXT70: 400
6. Click "Create promotion code"

### Option 2: Stripe CLI

```bash
# For EARLY36
stripe promotion_codes create \
  --coupon=zJ2CrraE \
  --code=EARLY36 \
  --max-redemptions=100

# For NEXT70
stripe promotion_codes create \
  --coupon=SUbNlujf \
  --code=NEXT70 \
  --max-redemptions=400
```

### Option 3: API Call (if needed)

```bash
curl https://api.stripe.com/v1/promotion_codes \
  -u sk_live_YOUR_KEY: \
  -d "coupon=zJ2CrraE" \
  -d "code=EARLY36" \
  -d "max_redemptions=100"

curl https://api.stripe.com/v1/promotion_codes \
  -u sk_live_YOUR_KEY: \
  -d "coupon=SUbNlujf" \
  -d "code=NEXT70" \
  -d "max_redemptions=400"
```

## Verification

After creating promotion codes, verify they work:

1. Go to your checkout page
2. Enter code `EARLY36` - should show $297 discount, final price $36
3. Enter code `NEXT70` - should show $263 discount, final price $70

## Important Notes

- ✅ Coupons have `max_redemptions` set (100 and 400 respectively)
- ✅ Promotion codes will inherit the coupon's max_redemptions limit
- ✅ Make sure `allow_promotion_codes: true` is set in your checkout session creation
- ⚠️ Promotion codes need to be created separately (see above)

## Current Configuration

Your checkout session should already have:
```javascript
allow_promotion_codes: true
```

This is already configured in `backend/controllers/courseController.js` (line 173).

---

**Status**: Coupons ready ✅ | Promotion codes need manual creation ⚠️

