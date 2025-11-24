#!/usr/bin/env node

/**
 * Recreate Coupons and Promotion Codes with Correct Amounts
 * 
 * Base Price: $333
 * EARLY36: $297 off → Final price $36 (for first 100 users)
 * NEXT70: $263 off → Final price $70 (for next 400 users)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

// Use Stripe from backend node_modules
const backendPath = path.join(__dirname, '..', 'backend');
const Stripe = require(path.join(backendPath, 'node_modules/stripe'));
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
});

async function recreateCoupons() {
  console.log('\n🔄 Recreating Coupons and Promotion Codes\n');
  console.log('='.repeat(60));
  console.log('Base Price: $333');
  console.log('EARLY36: $297 off → Final price $36 (max 100 redemptions)');
  console.log('NEXT70: $263 off → Final price $70 (max 400 redemptions)');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Deactivate and delete old promotion codes
    console.log('📋 Step 1: Finding existing promotion codes...\n');
    const existingPromoCodes = await stripe.promotionCodes.list({ limit: 100 });
    const early36Promo = existingPromoCodes.data.find(p => p.code && p.code.toUpperCase() === 'EARLY36');
    const next70Promo = existingPromoCodes.data.find(p => p.code && p.code.toUpperCase() === 'NEXT70');

    if (early36Promo) {
      console.log(`🗑️  Deactivating old EARLY36 promotion code: ${early36Promo.id}`);
      await stripe.promotionCodes.update(early36Promo.id, { active: false });
      console.log('   ✅ Deactivated\n');
    }

    if (next70Promo) {
      console.log(`🗑️  Deactivating old NEXT70 promotion code: ${next70Promo.id}`);
      await stripe.promotionCodes.update(next70Promo.id, { active: false });
      console.log('   ✅ Deactivated\n');
    }

    // Step 2: Delete old coupons
    console.log('📋 Step 2: Finding existing coupons...\n');
    const existingCoupons = await stripe.coupons.list({ limit: 100 });
    const early36Coupon = existingCoupons.data.find(c => 
      (c.name === 'EARLY36' || c.amount_off === 29700) && c.currency === 'usd'
    );
    const next70Coupon = existingCoupons.data.find(c => 
      (c.name === 'NEXT70' || c.amount_off === 26300) && c.currency === 'usd'
    );

    if (early36Coupon) {
      console.log(`🗑️  Deleting old EARLY36 coupon: ${early36Coupon.id}`);
      try {
        await stripe.coupons.del(early36Coupon.id);
        console.log('   ✅ Deleted\n');
      } catch (error) {
        console.log(`   ⚠️  Could not delete: ${error.message}\n`);
      }
    }

    if (next70Coupon) {
      console.log(`🗑️  Deleting old NEXT70 coupon: ${next70Coupon.id}`);
      try {
        await stripe.coupons.del(next70Coupon.id);
        console.log('   ✅ Deleted\n');
      } catch (error) {
        console.log(`   ⚠️  Could not delete: ${error.message}\n`);
      }
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Create new coupons
    console.log('📋 Step 3: Creating new coupons...\n');

    // Create EARLY36 coupon
    console.log('💰 Creating EARLY36 coupon...');
    const newEarly36Coupon = await stripe.coupons.create({
      name: 'EARLY36',
      amount_off: 29700, // $297 in cents
      currency: 'usd',
      duration: 'once',
      max_redemptions: 100,
    });
    console.log(`   ✅ Created coupon: ${newEarly36Coupon.id}`);
    console.log(`   Discount: $${newEarly36Coupon.amount_off / 100} off`);
    console.log(`   Max Redemptions: ${newEarly36Coupon.max_redemptions}`);
    console.log(`   Final Price: $${(33300 - newEarly36Coupon.amount_off) / 100}\n`);

    // Create NEXT70 coupon
    console.log('💰 Creating NEXT70 coupon...');
    const newNext70Coupon = await stripe.coupons.create({
      name: 'NEXT70',
      amount_off: 26300, // $263 in cents
      currency: 'usd',
      duration: 'once',
      max_redemptions: 400,
    });
    console.log(`   ✅ Created coupon: ${newNext70Coupon.id}`);
    console.log(`   Discount: $${newNext70Coupon.amount_off / 100} off`);
    console.log(`   Max Redemptions: ${newNext70Coupon.max_redemptions}`);
    console.log(`   Final Price: $${(33300 - newNext70Coupon.amount_off) / 100}\n`);

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Create promotion codes
    console.log('📋 Step 4: Creating promotion codes...\n');

    // Create EARLY36 promotion code
    console.log('🎟️  Creating EARLY36 promotion code...');
    const newEarly36Promo = await stripe.promotionCodes.create({
      coupon: newEarly36Coupon.id,
      code: 'EARLY36',
      active: true,
      max_redemptions: 100,
    }, {
      apiVersion: '2024-12-18.acacia'
    });
    console.log(`   ✅ Created promotion code: ${newEarly36Promo.id}`);
    console.log(`   Code: ${newEarly36Promo.code}`);
    console.log(`   Max Redemptions: ${newEarly36Promo.max_redemptions}`);
    console.log(`   Active: ${newEarly36Promo.active}\n`);

    // Create NEXT70 promotion code
    console.log('🎟️  Creating NEXT70 promotion code...');
    const newNext70Promo = await stripe.promotionCodes.create({
      coupon: newNext70Coupon.id,
      code: 'NEXT70',
      active: true,
      max_redemptions: 400,
    }, {
      apiVersion: '2024-12-18.acacia'
    });
    console.log(`   ✅ Created promotion code: ${newNext70Promo.id}`);
    console.log(`   Code: ${newNext70Promo.code}`);
    console.log(`   Max Redemptions: ${newNext70Promo.max_redemptions}`);
    console.log(`   Active: ${newNext70Promo.active}\n`);

    // Summary
    console.log('='.repeat(60));
    console.log('✅ SUCCESS! Coupons and Promotion Codes Created\n');
    console.log('📊 Summary:');
    console.log(`   EARLY36 Coupon ID: ${newEarly36Coupon.id}`);
    console.log(`   EARLY36 Promotion Code: ${newEarly36Promo.code} (ID: ${newEarly36Promo.id})`);
    console.log(`   → $297 off → Final price $36 (max 100 uses)\n`);
    console.log(`   NEXT70 Coupon ID: ${newNext70Coupon.id}`);
    console.log(`   NEXT70 Promotion Code: ${newNext70Promo.code} (ID: ${newNext70Promo.id})`);
    console.log(`   → $263 off → Final price $70 (max 400 uses)\n`);
    console.log('='.repeat(60));
    console.log('\n🎉 Customers can now use EARLY36 and NEXT70 at checkout!');
    console.log('   Base price: $333');
    console.log('   EARLY36: $36 (first 100 customers)');
    console.log('   NEXT70: $70 (next 400 customers)\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.type === 'StripeInvalidRequestError') {
      console.error('   Details:', error.raw?.message || error.message);
    }
    process.exit(1);
  }
}

recreateCoupons().catch(console.error);

