#!/usr/bin/env node

/**
 * Create Stripe Coupons with Max Redemptions and Promotion Codes
 * 
 * Creates:
 * - EARLY36: $297 off, final price $36, max 100 redemptions
 * - NEXT70: $263 off, final price $70, max 400 redemptions
 */

const path = require('path');
const backendPath = path.join(__dirname, '../../backend');
require('dotenv').config({ path: path.join(backendPath, '.env') });

// Use Stripe from backend node_modules
const Stripe = require(path.join(backendPath, 'node_modules/stripe'));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const COUPONS = [
  {
    name: 'EARLY36',
    code: 'EARLY36',
    amount_off: 29700, // $297 in cents
    currency: 'usd',
    max_redemptions: 100,
    description: 'Early bird discount - $297 off, final price $36'
  },
  {
    name: 'NEXT70',
    code: 'NEXT70',
    amount_off: 26300, // $263 in cents
    currency: 'usd',
    max_redemptions: 400,
    description: 'Next batch discount - $263 off, final price $70'
  }
];

async function deleteExistingCoupon(couponId) {
  try {
    await stripe.coupons.del(couponId);
    console.log(`   🗑️  Deleted existing coupon: ${couponId}`);
    return true;
  } catch (error) {
    console.log(`   ⚠️  Could not delete coupon ${couponId}: ${error.message}`);
    return false;
  }
}

async function createCouponWithPromotionCode(couponConfig) {
  try {
    console.log(`\n🔧 Creating coupon: ${couponConfig.name}`);
    console.log(`   Discount: $${couponConfig.amount_off / 100} off`);
    console.log(`   Max redemptions: ${couponConfig.max_redemptions}`);
    
    // Check for existing coupons with same name or amount
    let existingCoupon = null;
    try {
      const coupons = await stripe.coupons.list({ limit: 100 });
      existingCoupon = coupons.data.find(c => 
        c.name === couponConfig.name || 
        (c.amount_off === couponConfig.amount_off && c.currency === couponConfig.currency)
      );
    } catch (error) {
      console.log(`   ⚠️  Error listing coupons: ${error.message}`);
    }
    
    let coupon;
    
    if (existingCoupon) {
      console.log(`   ⚠️  Found existing coupon: ${existingCoupon.id}`);
      
      // Check if it has max_redemptions set
      if (existingCoupon.max_redemptions === couponConfig.max_redemptions) {
        console.log(`   ✅ Existing coupon already has correct max_redemptions`);
        coupon = existingCoupon;
      } else {
        // Delete and recreate with max_redemptions
        console.log(`   🔄 Deleting existing coupon to recreate with max_redemptions...`);
        await deleteExistingCoupon(existingCoupon.id);
        
        // Create new coupon with max_redemptions
        coupon = await stripe.coupons.create({
          name: couponConfig.name,
          amount_off: couponConfig.amount_off,
          currency: couponConfig.currency,
          duration: 'once',
          max_redemptions: couponConfig.max_redemptions
        });
        console.log(`   ✅ Created new coupon: ${coupon.id}`);
      }
    } else {
      // Create new coupon
      coupon = await stripe.coupons.create({
        name: couponConfig.name,
        amount_off: couponConfig.amount_off,
        currency: couponConfig.currency,
        duration: 'once',
        max_redemptions: couponConfig.max_redemptions
      });
      console.log(`   ✅ Created coupon: ${coupon.id}`);
    }
    
    // Check for existing promotion codes
    console.log(`   🔍 Checking for promotion code: ${couponConfig.code}`);
    
    let promotionCode;
    try {
      const promotionCodes = await stripe.promotionCodes.list({ 
        code: couponConfig.code,
        limit: 10 
      });
      
      if (promotionCodes.data.length > 0) {
        promotionCode = promotionCodes.data[0];
        console.log(`   ⚠️  Found existing promotion code: ${promotionCode.id}`);
        
        // Check if we need to recreate the promotion code
        const currentCouponId = typeof promotionCode.coupon === 'object' ? promotionCode.coupon.id : promotionCode.coupon;
        const newCouponId = typeof coupon === 'string' ? coupon : coupon.id;
        const needsRecreate = 
          promotionCode.max_redemptions !== couponConfig.max_redemptions ||
          currentCouponId !== newCouponId;
        
        if (needsRecreate) {
          console.log(`   🔄 Deactivating old promotion code and creating new one...`);
          try {
            // Deactivate old promotion code
            await stripe.promotionCodes.update(promotionCode.id, { active: false });
            console.log(`   🗑️  Deactivated old promotion code`);
          } catch (e) {
            console.log(`   ⚠️  Could not deactivate old code: ${e.message}`);
          }
          
          // Create new promotion code with correct settings
          // Use coupon ID string, not object
          const couponId = typeof coupon === 'string' ? coupon : coupon.id;
          promotionCode = await stripe.promotionCodes.create({
            coupon: couponId,
            code: couponConfig.code,
            max_redemptions: couponConfig.max_redemptions,
            active: true
          });
          console.log(`   ✅ Created new promotion code: ${promotionCode.id}`);
        } else {
          // Update max_redemptions if needed (only if coupon matches)
          if (promotionCode.max_redemptions !== couponConfig.max_redemptions) {
            try {
              promotionCode = await stripe.promotionCodes.update(promotionCode.id, {
                max_redemptions: couponConfig.max_redemptions
              });
              console.log(`   ✅ Updated promotion code max_redemptions: ${promotionCode.id}`);
            } catch (updateError) {
              console.log(`   ⚠️  Could not update max_redemptions: ${updateError.message}`);
              console.log(`   ✅ Using existing promotion code: ${promotionCode.id}`);
            }
          } else {
            console.log(`   ✅ Using existing promotion code: ${promotionCode.id}`);
          }
        }
      } else {
        // Create new promotion code
        const couponId = typeof coupon === 'string' ? coupon : coupon.id;
        promotionCode = await stripe.promotionCodes.create({
          coupon: couponId,
          code: couponConfig.code,
          max_redemptions: couponConfig.max_redemptions,
          active: true
        });
        console.log(`   ✅ Created promotion code: ${promotionCode.id}`);
      }
    } catch (promoError) {
      console.error(`   ❌ Error creating/updating promotion code: ${promoError.message}`);
      // Try to create anyway
      try {
        const couponId = typeof coupon === 'string' ? coupon : coupon.id;
        promotionCode = await stripe.promotionCodes.create({
          coupon: couponId,
          code: couponConfig.code,
          max_redemptions: couponConfig.max_redemptions,
          active: true
        });
        console.log(`   ✅ Created promotion code after retry: ${promotionCode.id}`);
      } catch (retryError) {
        return {
          coupon,
          promotionCode: null,
          success: false,
          error: retryError.message
        };
      }
    }
    
    return {
      coupon,
      promotionCode,
      success: true
    };
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return {
      coupon: null,
      promotionCode: null,
      success: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('🎫 Creating Stripe Coupons with Max Redemptions');
  console.log('================================================\n');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ Error: STRIPE_SECRET_KEY not found in backend/.env');
    process.exit(1);
  }
  
  const results = [];
  
  for (const couponConfig of COUPONS) {
    const result = await createCouponWithPromotionCode(couponConfig);
    results.push({ ...couponConfig, ...result });
  }
  
  console.log('\n📋 Summary');
  console.log('===========\n');
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}`);
    if (result.success && result.coupon && result.promotionCode) {
      console.log(`   ✅ Coupon ID: ${result.coupon.id}`);
      console.log(`   ✅ Promotion Code: ${result.code}`);
      console.log(`   ✅ Max Redemptions: ${result.max_redemptions}`);
      console.log(`   ✅ Discount: $${result.amount_off / 100} off`);
      console.log(`   ✅ Final Price: $${(33300 - result.amount_off) / 100}`);
      console.log(`   ✅ Redemptions Used: ${result.promotionCode.times_redeemed || 0}/${result.max_redemptions}`);
    } else {
      console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
    }
    console.log('');
  });
  
  const allSuccess = results.every(r => r.success);
  
  if (allSuccess) {
    console.log('✅ All coupons created successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Customers can use these codes at checkout:');
    console.log('      - EARLY36 (first 100 customers, $36 final price)');
    console.log('      - NEXT70 (next 400 customers, $70 final price)');
    console.log('   2. Make sure allow_promotion_codes: true is set in checkout sessions');
    console.log('   3. Test the codes in Stripe Checkout');
    console.log('\n💡 Note: Max redemptions are set on both the coupon and promotion code');
    console.log('   The promotion code will stop working after reaching its limit.');
  } else {
    console.log('⚠️  Some coupons failed to create. Check errors above.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
