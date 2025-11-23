#!/usr/bin/env node

/**
 * Fix Promotion Codes - Link to correct coupons and activate
 */

const path = require('path');
const backendPath = path.join(__dirname, '../../backend');
require('dotenv').config({ path: path.join(backendPath, '.env') });
const Stripe = require(path.join(backendPath, 'node_modules/stripe'));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
});

async function fixPromotionCodes() {
  console.log('🔧 Fixing Promotion Codes\n');
  console.log('='.repeat(50));
  
  try {
    // Get the correct coupons
    const coupons = await stripe.coupons.list({ limit: 100 });
    const early36Coupon = coupons.data.find(c => c.name === 'EARLY36' || (c.amount_off === 29700 && c.currency === 'usd'));
    const next70Coupon = coupons.data.find(c => c.name === 'NEXT70' || (c.amount_off === 26300 && c.currency === 'usd'));
    
    if (!early36Coupon || !next70Coupon) {
      console.error('❌ Could not find coupons');
      process.exit(1);
    }
    
    console.log(`✅ Found EARLY36 coupon: ${early36Coupon.id}`);
    console.log(`✅ Found NEXT70 coupon: ${next70Coupon.id}\n`);
    
    // Get existing promotion codes
    const promoCodes = await stripe.promotionCodes.list({ limit: 100 });
    const early36Promo = promoCodes.data.find(p => p.code && p.code.toUpperCase() === 'EARLY36');
    const next70Promo = promoCodes.data.find(p => p.code && p.code.toUpperCase() === 'NEXT70');
    
    // Fix EARLY36
    console.log('🔧 Fixing EARLY36...');
    if (early36Promo) {
      // Deactivate old one
      try {
        await stripe.promotionCodes.update(early36Promo.id, { active: false });
        console.log(`   🗑️  Deactivated old promotion code: ${early36Promo.id}`);
      } catch (e) {
        console.log(`   ⚠️  Could not deactivate: ${e.message}`);
      }
    }
    
    // Create new promotion code for EARLY36
    try {
      const newEarly36Promo = await stripe.promotionCodes.create({
        coupon: early36Coupon.id,
        code: 'EARLY36',
        max_redemptions: 100,
        active: true
      });
      console.log(`   ✅ Created new promotion code: ${newEarly36Promo.id}`);
      console.log(`   ✅ Code: EARLY36`);
      console.log(`   ✅ Max Redemptions: 100`);
      console.log(`   ✅ Active: Yes\n`);
    } catch (error) {
      if (error.message.includes('already been taken') || error.message.includes('already exists')) {
        console.log(`   ⚠️  Code EARLY36 already exists. Trying to reactivate and update...`);
        // Try to find and update
        const existing = promoCodes.data.find(p => p.code && p.code.toUpperCase() === 'EARLY36');
        if (existing) {
          try {
            await stripe.promotionCodes.update(existing.id, {
              active: true,
              max_redemptions: 100
            });
            console.log(`   ✅ Updated existing promotion code: ${existing.id}`);
          } catch (updateError) {
            console.log(`   ❌ Could not update: ${updateError.message}`);
            console.log(`   💡 You may need to manually fix this in Stripe Dashboard`);
          }
        }
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    // Fix NEXT70
    console.log('🔧 Fixing NEXT70...');
    if (next70Promo) {
      // Deactivate old one
      try {
        await stripe.promotionCodes.update(next70Promo.id, { active: false });
        console.log(`   🗑️  Deactivated old promotion code: ${next70Promo.id}`);
      } catch (e) {
        console.log(`   ⚠️  Could not deactivate: ${e.message}`);
      }
    }
    
    // Create new promotion code for NEXT70
    try {
      const newNext70Promo = await stripe.promotionCodes.create({
        coupon: next70Coupon.id,
        code: 'NEXT70',
        max_redemptions: 400,
        active: true
      });
      console.log(`   ✅ Created new promotion code: ${newNext70Promo.id}`);
      console.log(`   ✅ Code: NEXT70`);
      console.log(`   ✅ Max Redemptions: 400`);
      console.log(`   ✅ Active: Yes\n`);
    } catch (error) {
      if (error.message.includes('already been taken') || error.message.includes('already exists')) {
        console.log(`   ⚠️  Code NEXT70 already exists. Trying to reactivate and update...`);
        // Try to find and update
        const existing = promoCodes.data.find(p => p.code && p.code.toUpperCase() === 'NEXT70');
        if (existing) {
          try {
            await stripe.promotionCodes.update(existing.id, {
              active: true,
              max_redemptions: 400
            });
            console.log(`   ✅ Updated existing promotion code: ${existing.id}`);
          } catch (updateError) {
            console.log(`   ❌ Could not update: ${updateError.message}`);
            console.log(`   💡 You may need to manually fix this in Stripe Dashboard`);
          }
        }
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n✅ Fix complete!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Run verification script to confirm status');
    console.log('   2. Test codes in checkout');
    console.log('   3. If issues persist, fix manually in Stripe Dashboard');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

fixPromotionCodes().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

