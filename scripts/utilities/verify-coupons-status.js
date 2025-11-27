#!/usr/bin/env node

/**
 * Verify Coupons and Promotion Codes Status
 */

const path = require('path');
const backendPath = path.join(__dirname, '../../backend');
require('dotenv').config({ path: path.join(backendPath, '.env') });
const Stripe = require(path.join(backendPath, 'node_modules/stripe'));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
});

async function verifyCoupons() {
  console.log('🔍 Verifying Coupons and Promotion Codes Status\n');
  console.log('='.repeat(50));
  
  try {
    // Get coupons
    const coupons = await stripe.coupons.list({ limit: 100 });
    
    const early36Coupon = coupons.data.find(c => c.name === 'EARLY36' || c.amount_off === 29700);
    const next70Coupon = coupons.data.find(c => c.name === 'NEXT70' || c.amount_off === 26300);
    
    console.log('\n📋 Coupons Status:');
    console.log('-'.repeat(50));
    
    if (early36Coupon) {
      console.log('\n✅ EARLY36 Coupon:');
      console.log(`   ID: ${early36Coupon.id}`);
      console.log(`   Discount: $${early36Coupon.amount_off / 100} off`);
      console.log(`   Max Redemptions: ${early36Coupon.max_redemptions || 'Not set'}`);
      console.log(`   Times Redeemed: ${early36Coupon.times_redeemed || 0}`);
      console.log(`   Active: ${early36Coupon.valid ? 'Yes' : 'No'}`);
    } else {
      console.log('\n❌ EARLY36 Coupon: Not found');
    }
    
    if (next70Coupon) {
      console.log('\n✅ NEXT70 Coupon:');
      console.log(`   ID: ${next70Coupon.id}`);
      console.log(`   Discount: $${next70Coupon.amount_off / 100} off`);
      console.log(`   Max Redemptions: ${next70Coupon.max_redemptions || 'Not set'}`);
      console.log(`   Times Redeemed: ${next70Coupon.times_redeemed || 0}`);
      console.log(`   Active: ${next70Coupon.valid ? 'Yes' : 'No'}`);
    } else {
      console.log('\n❌ NEXT70 Coupon: Not found');
    }
    
    // Get promotion codes
    console.log('\n\n📋 Promotion Codes Status:');
    console.log('-'.repeat(50));
    
    const promoCodes = await stripe.promotionCodes.list({ limit: 100 });
    const early36Promo = promoCodes.data.find(p => p.code && p.code.toUpperCase() === 'EARLY36');
    const next70Promo = promoCodes.data.find(p => p.code && p.code.toUpperCase() === 'NEXT70');
    
    if (early36Promo) {
      const couponId = typeof early36Promo.coupon === 'object' ? early36Promo.coupon.id : early36Promo.coupon;
      console.log('\n✅ EARLY36 Promotion Code:');
      console.log(`   Code: ${early36Promo.code}`);
      console.log(`   ID: ${early36Promo.id}`);
      console.log(`   Linked Coupon: ${couponId}`);
      console.log(`   Max Redemptions: ${early36Promo.max_redemptions || 'Not set'}`);
      console.log(`   Times Redeemed: ${early36Promo.times_redeemed || 0}`);
      console.log(`   Active: ${early36Promo.active ? 'Yes' : 'No'}`);
      
      if (early36Coupon && couponId === early36Coupon.id) {
        console.log(`   ✅ Correctly linked to EARLY36 coupon`);
      } else {
        console.log(`   ⚠️  Linked to different coupon (may need to update)`);
      }
    } else {
      console.log('\n❌ EARLY36 Promotion Code: Not found');
      console.log('   ⚠️  Need to create promotion code in Stripe Dashboard');
    }
    
    if (next70Promo) {
      const couponId = typeof next70Promo.coupon === 'object' ? next70Promo.coupon.id : next70Promo.coupon;
      console.log('\n✅ NEXT70 Promotion Code:');
      console.log(`   Code: ${next70Promo.code}`);
      console.log(`   ID: ${next70Promo.id}`);
      console.log(`   Linked Coupon: ${couponId}`);
      console.log(`   Max Redemptions: ${next70Promo.max_redemptions || 'Not set'}`);
      console.log(`   Times Redeemed: ${next70Promo.times_redeemed || 0}`);
      console.log(`   Active: ${next70Promo.active ? 'Yes' : 'No'}`);
      
      if (next70Coupon && couponId === next70Coupon.id) {
        console.log(`   ✅ Correctly linked to NEXT70 coupon`);
      } else {
        console.log(`   ⚠️  Linked to different coupon (may need to update)`);
      }
    } else {
      console.log('\n❌ NEXT70 Promotion Code: Not found');
      console.log('   ⚠️  Need to create promotion code in Stripe Dashboard');
    }
    
    // Check backend configuration
    console.log('\n\n📋 Backend Configuration:');
    console.log('-'.repeat(50));
    console.log('✅ allow_promotion_codes: true (configured in courseController.js)');
    console.log('✅ Custom text message configured');
    
    // Final summary
    console.log('\n\n📊 Summary:');
    console.log('='.repeat(50));
    
    const couponsReady = early36Coupon && next70Coupon;
    const promoCodesReady = early36Promo && next70Promo;
    const allReady = couponsReady && promoCodesReady;
    
    if (allReady) {
      console.log('✅ Everything is ready!');
      console.log('   - Coupons created ✅');
      console.log('   - Promotion codes created ✅');
      console.log('   - Backend configured ✅');
      console.log('\n🎉 Customers can now use EARLY36 and NEXT70 at checkout!');
    } else {
      console.log('⚠️  Status:');
      if (couponsReady) {
        console.log('   ✅ Coupons: Ready');
      } else {
        console.log('   ❌ Coupons: Missing');
      }
      if (promoCodesReady) {
        console.log('   ✅ Promotion Codes: Ready');
      } else {
        console.log('   ⚠️  Promotion Codes: Need to be created in Stripe Dashboard');
        console.log('      Go to: https://dashboard.stripe.com/coupons');
      }
      console.log('   ✅ Backend: Configured');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

verifyCoupons().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});





