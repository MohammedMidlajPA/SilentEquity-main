#!/usr/bin/env node

/**
 * Simple script to create Stripe Coupons and Promotion Codes
 * Creates coupons with max_redemptions and promotion codes
 */

const path = require('path');
const backendPath = path.join(__dirname, '../../backend');
require('dotenv').config({ path: path.join(backendPath, '.env') });
const Stripe = require(path.join(backendPath, 'node_modules/stripe'));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCouponAndPromoCode(name, code, amountOff, maxRedemptions) {
  console.log(`\n🎫 Creating ${name}...`);
  
  // Step 1: Create or get coupon
  let coupon;
  try {
    // Try to find existing coupon
    const coupons = await stripe.coupons.list({ limit: 100 });
    const existing = coupons.data.find(c => 
      c.name === name || (c.amount_off === amountOff && c.currency === 'usd')
    );
    
    if (existing && existing.max_redemptions === maxRedemptions) {
      coupon = existing;
      console.log(`   ✅ Using existing coupon: ${coupon.id}`);
    } else {
      if (existing) {
        console.log(`   🗑️  Deleting old coupon: ${existing.id}`);
        await stripe.coupons.del(existing.id);
      }
      coupon = await stripe.coupons.create({
        name: name,
        amount_off: amountOff,
        currency: 'usd',
        duration: 'once',
        max_redemptions: maxRedemptions
      });
      console.log(`   ✅ Created coupon: ${coupon.id}`);
    }
  } catch (error) {
    console.error(`   ❌ Error with coupon: ${error.message}`);
    return { success: false, error: error.message };
  }
  
  // Step 2: Create promotion code
  try {
    // List all promotion codes to find existing
    const allPromoCodes = await stripe.promotionCodes.list({ limit: 100 });
    const existingPromo = allPromoCodes.data.find(p => 
      p.code && p.code.toLowerCase() === code.toLowerCase()
    );
    
    if (existingPromo) {
      // Check if it needs updating
      const couponId = typeof coupon === 'string' ? coupon : coupon.id;
      const promoCouponId = typeof existingPromo.coupon === 'object' 
        ? existingPromo.coupon.id 
        : existingPromo.coupon;
      
      if (promoCouponId === couponId && existingPromo.max_redemptions === maxRedemptions) {
        console.log(`   ✅ Using existing promotion code: ${existingPromo.id}`);
        return { success: true, coupon, promotionCode: existingPromo };
      } else {
        // Deactivate old one
        console.log(`   🗑️  Deactivating old promotion code: ${existingPromo.id}`);
        await stripe.promotionCodes.update(existingPromo.id, { active: false });
      }
    }
    
    // Create new promotion code
    const couponId = typeof coupon === 'string' ? coupon : coupon.id;
    const promotionCode = await stripe.promotionCodes.create({
      coupon: couponId,
      code: code,
      max_redemptions: maxRedemptions,
      active: true
    });
    console.log(`   ✅ Created promotion code: ${promotionCode.id} (code: ${code})`);
    return { success: true, coupon, promotionCode };
    
  } catch (error) {
    console.error(`   ❌ Error creating promotion code: ${error.message}`);
    if (error.message.includes('already been taken') || error.message.includes('already exists')) {
      console.log(`   ⚠️  Promotion code ${code} already exists. You may need to manually deactivate it in Stripe Dashboard.`);
    }
    return { success: false, coupon, error: error.message };
  }
}

async function main() {
  console.log('🎫 Creating Stripe Coupons and Promotion Codes');
  console.log('==============================================\n');
  
  const results = await Promise.all([
    createCouponAndPromoCode('EARLY36', 'EARLY36', 29700, 100),
    createCouponAndPromoCode('NEXT70', 'NEXT70', 26300, 400)
  ]);
  
  console.log('\n📋 Summary');
  console.log('==========\n');
  
  results.forEach((result, i) => {
    const names = ['EARLY36', 'NEXT70'];
    const amounts = [29700, 26300];
    const maxRedemptions = [100, 400];
    
    console.log(`${i + 1}. ${names[i]}`);
    if (result.success && result.coupon && result.promotionCode) {
      console.log(`   ✅ Coupon ID: ${result.coupon.id}`);
      console.log(`   ✅ Promotion Code: ${result.promotionCode.code || names[i]}`);
      console.log(`   ✅ Max Redemptions: ${maxRedemptions[i]}`);
      console.log(`   ✅ Discount: $${amounts[i] / 100} off`);
      console.log(`   ✅ Final Price: $${(33300 - amounts[i]) / 100}`);
    } else {
      console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
    }
    console.log('');
  });
  
  const allSuccess = results.every(r => r.success);
  if (allSuccess) {
    console.log('✅ All coupons and promotion codes created successfully!');
  } else {
    console.log('⚠️  Some items failed. Check errors above.');
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});





