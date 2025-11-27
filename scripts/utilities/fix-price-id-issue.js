#!/usr/bin/env node

/**
 * Fix Stripe Price ID Issue
 * 
 * This script:
 * 1. Verifies the current STRIPE_PRICE_ID in .env
 * 2. Updates it to the correct active price ID if needed
 * 3. Verifies the price is active in Stripe
 * 4. Provides restart instructions
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const OLD_PRICE_ID = 'price_1SJbZc1R8sS9eHMUxrNkvhRf';
const CORRECT_PRICE_ID = 'price_1SWcd81R8sS9eHMU6c31RDAC';
const PRODUCT_ID = 'prod_TTZmE3dOKNtBVp';
const BACKEND_ENV_FILE = path.join(__dirname, '../../backend/.env');

async function verifyStripePrice(priceId) {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
    
    return {
      valid: true,
      price: {
        id: price.id,
        active: price.active,
        amount: price.unit_amount / 100,
        currency: price.currency,
        product: {
          id: price.product.id,
          name: typeof price.product === 'string' ? price.product : price.product.name,
          active: typeof price.product === 'string' ? null : price.product.active
        }
      }
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

function updateEnvFile() {
  if (!fs.existsSync(BACKEND_ENV_FILE)) {
    console.error('❌ Error: backend/.env file not found');
    console.error('   Please create the file first');
    process.exit(1);
  }

  let envContent = fs.readFileSync(BACKEND_ENV_FILE, 'utf8');
  let updated = false;
  let backupCreated = false;

  // Create backup
  const backupFile = `${BACKEND_ENV_FILE}.backup.${Date.now()}`;
  fs.writeFileSync(backupFile, envContent);
  backupCreated = true;
  console.log(`✅ Created backup: ${path.basename(backupFile)}`);

  // Check if STRIPE_PRICE_ID exists
  if (envContent.includes('STRIPE_PRICE_ID=')) {
    // Update existing
    const lines = envContent.split('\n');
    const updatedLines = lines.map(line => {
      if (line.startsWith('STRIPE_PRICE_ID=')) {
        updated = true;
        return `STRIPE_PRICE_ID=${CORRECT_PRICE_ID}`;
      }
      return line;
    });
    envContent = updatedLines.join('\n');
  } else {
    // Add new
    envContent += `\n# Stripe Price ID for Course Enrollment (Code of Consistency)\nSTRIPE_PRICE_ID=${CORRECT_PRICE_ID}\n`;
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(BACKEND_ENV_FILE, envContent);
    console.log(`✅ Updated STRIPE_PRICE_ID to: ${CORRECT_PRICE_ID}`);
  }

  return updated;
}

async function main() {
  console.log('🔧 Fixing Stripe Price ID Issue');
  console.log('================================\n');

  // Check current price ID from environment
  const currentPriceId = process.env.STRIPE_PRICE_ID;
  
  console.log('📋 Current Configuration:');
  console.log(`   STRIPE_PRICE_ID: ${currentPriceId || 'NOT SET'}`);
  console.log('');

  // Verify Stripe connection
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ Error: STRIPE_SECRET_KEY not found in .env');
    process.exit(1);
  }

  // Check old price ID
  if (currentPriceId === OLD_PRICE_ID) {
    console.log('⚠️  Found old price ID (inactive product)');
    console.log(`   Old: ${OLD_PRICE_ID}`);
    console.log(`   New: ${CORRECT_PRICE_ID}\n`);
  }

  // Verify correct price ID in Stripe
  console.log('🔍 Verifying correct price ID in Stripe...');
  const correctPriceCheck = await verifyStripePrice(CORRECT_PRICE_ID);
  
  if (!correctPriceCheck.valid) {
    console.error(`❌ Error verifying price ID: ${correctPriceCheck.error}`);
    console.error('   Please check your Stripe secret key and price ID');
    process.exit(1);
  }

  const price = correctPriceCheck.price;
  console.log('✅ Correct price ID is valid:');
  console.log(`   Price ID: ${price.id}`);
  console.log(`   Amount: $${price.amount} ${price.currency.toUpperCase()}`);
  console.log(`   Active: ${price.active ? '✅ Yes' : '❌ No'}`);
  console.log(`   Product: ${price.product.name || price.product.id}`);
  console.log(`   Product Active: ${price.product.active !== false ? '✅ Yes' : '❌ No'}\n`);

  if (!price.active || price.product.active === false) {
    console.error('❌ Error: Price or product is not active in Stripe');
    console.error('   Please activate the product/price in Stripe Dashboard');
    process.exit(1);
  }

  // Check if update is needed
  if (currentPriceId !== CORRECT_PRICE_ID) {
    console.log('🔧 Updating .env file...');
    const updated = updateEnvFile();
    
    if (updated) {
      console.log('\n✅ Update complete!\n');
    } else {
      console.log('\n⚠️  No changes needed (price ID already correct in file)\n');
    }
  } else {
    console.log('✅ Price ID is already correct in .env file\n');
  }

  // Final verification
  console.log('📋 Final Status:');
  console.log('================');
  console.log(`✅ Correct Price ID: ${CORRECT_PRICE_ID}`);
  console.log(`✅ Price Active: Yes`);
  console.log(`✅ Product Active: Yes`);
  console.log(`✅ Amount: $${price.amount} ${price.currency.toUpperCase()}\n`);

  console.log('⚠️  IMPORTANT: Restart your backend server for changes to take effect!');
  console.log('');
  console.log('   Steps to restart:');
  console.log('   1. Stop the current backend server (Ctrl+C)');
  console.log('   2. Start it again:');
  console.log('      cd backend');
  console.log('      npm start');
  console.log('');
  console.log('   After restart, test with:');
  console.log(`   curl -X POST http://localhost:5001/api/course/join \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"name":"Test User","email":"test@example.com","phone":"1234567890"}'`);
  console.log('');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});





