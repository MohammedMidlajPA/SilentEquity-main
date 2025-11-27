/**
 * Recreate Promotion Codes with Correct Coupon Mappings
 * 
 * This script deletes and recreates promotion codes to ensure correct mappings:
 * - EARLY36 → Coupon KkjYz0b1 ($297 off)
 * - NEXT70 → Coupon V9rrQAR1 ($263 off)
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function recreatePromotionCodes() {
  try {
    console.log('🔧 Recreating Promotion Codes with Correct Mappings...\n');

    // Coupon IDs
    const early36CouponId = 'KkjYz0b1'; // $297 off
    const next70CouponId = 'V9rrQAR1'; // $263 off

    // Find existing promotion codes
    const allCodes = await stripe.promotionCodes.list({ limit: 100 });
    const early36 = allCodes.data.find(c => c.code === 'EARLY36');
    const next70 = allCodes.data.find(c => c.code === 'NEXT70');

    // Delete existing codes if they exist
    if (early36) {
      console.log('Deleting existing EARLY36 promotion code...');
      await stripe.promotionCodes.update(early36.id, { active: false });
      console.log('✅ Deactivated EARLY36');
    }

    if (next70) {
      console.log('Deleting existing NEXT70 promotion code...');
      await stripe.promotionCodes.update(next70.id, { active: false });
      console.log('✅ Deactivated NEXT70');
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create new promotion codes with correct mappings
    console.log('\nCreating new promotion codes...\n');

    // Create EARLY36
    const newEarly36 = await stripe.promotionCodes.create({
      coupon: early36CouponId,
      code: 'EARLY36',
      active: true,
      max_redemptions: 100,
    });
    console.log('✅ Created EARLY36 → KkjYz0b1 ($297 off)');
    console.log('   Promotion Code ID:', newEarly36.id);

    // Create NEXT70
    const newNext70 = await stripe.promotionCodes.create({
      coupon: next70CouponId,
      code: 'NEXT70',
      active: true,
      max_redemptions: 400,
    });
    console.log('✅ Created NEXT70 → V9rrQAR1 ($263 off)');
    console.log('   Promotion Code ID:', newNext70.id);

    console.log('\n✅ Promotion codes recreated successfully!');
    console.log('\nTest in checkout:');
    console.log('  EARLY36 → Should show $36.00 total');
    console.log('  NEXT70 → Should show $70.00 total');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.type === 'StripeInvalidRequestError') {
      console.error('\n⚠️  Note: Promotion codes might already exist.');
      console.error('   You may need to delete them manually in Stripe Dashboard first.');
      console.error('   Or deactivate the old ones and create new ones.');
    }
    process.exit(1);
  }
}

// Uncomment to run
// recreatePromotionCodes();

console.log('⚠️  This script is ready but not executed automatically.');
console.log('   Review the code and run manually if needed.');
console.log('   Or fix the mappings directly in Stripe Dashboard.');


