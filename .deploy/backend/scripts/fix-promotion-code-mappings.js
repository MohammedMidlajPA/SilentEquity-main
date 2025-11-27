/**
 * Fix Promotion Code to Coupon Mappings
 * 
 * This script fixes the promotion codes to ensure they're linked to the correct coupons:
 * - EARLY36 → Coupon KkjYz0b1 ($297 off)
 * - NEXT70 → Coupon V9rrQAR1 ($263 off)
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function fixPromotionCodes() {
  try {
    console.log('🔍 Checking Promotion Code Mappings...\n');

    // Get promotion codes
    const early36Code = 'promo_1SWct41R8sS9eHMU63EEPuuk';
    const next70Code = 'promo_1SWct41R8sS9eHMUtqbXRjof';

    // Expected coupon IDs
    const early36CouponId = 'KkjYz0b1'; // $297 off
    const next70CouponId = 'V9rrQAR1'; // $263 off

    // Retrieve current promotion codes
    const early36 = await stripe.promotionCodes.retrieve(early36Code);
    const next70 = await stripe.promotionCodes.retrieve(next70Code);

    console.log('Current Mappings:');
    console.log(`  EARLY36 → Coupon: ${early36.coupon}`);
    console.log(`  NEXT70 → Coupon: ${next70.coupon}`);
    console.log('');

    // Check if mappings are correct
    let needsFix = false;

    if (early36.coupon !== early36CouponId) {
      console.log('❌ EARLY36 is linked to wrong coupon!');
      console.log(`   Current: ${early36.coupon}`);
      console.log(`   Should be: ${early36CouponId}`);
      needsFix = true;
    } else {
      console.log('✅ EARLY36 correctly linked to KkjYz0b1');
    }

    if (next70.coupon !== next70CouponId) {
      console.log('❌ NEXT70 is linked to wrong coupon!');
      console.log(`   Current: ${next70.coupon}`);
      console.log(`   Should be: ${next70CouponId}`);
      needsFix = true;
    } else {
      console.log('✅ NEXT70 correctly linked to V9rrQAR1');
    }

    if (needsFix) {
      console.log('\n🔧 Fixing mappings...\n');

      // Update EARLY36 to link to correct coupon
      if (early36.coupon !== early36CouponId) {
        await stripe.promotionCodes.update(early36Code, {
          coupon: early36CouponId,
        });
        console.log('✅ Updated EARLY36 → KkjYz0b1');
      }

      // Update NEXT70 to link to correct coupon
      if (next70.coupon !== next70CouponId) {
        await stripe.promotionCodes.update(next70Code, {
          coupon: next70CouponId,
        });
        console.log('✅ Updated NEXT70 → V9rrQAR1');
      }

      console.log('\n✅ Promotion codes fixed!');
    } else {
      console.log('\n✅ All promotion codes are correctly mapped!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.type === 'StripeInvalidRequestError') {
      console.error('   This might mean the promotion codes need to be recreated in Stripe Dashboard');
    }
    process.exit(1);
  }
}

fixPromotionCodes();


