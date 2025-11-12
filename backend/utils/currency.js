/**
 * Currency Conversion Utility
 * Handles USD to INR conversion with fallback to cached rates
 */

const https = require('https');
const http = require('http');

// Cache exchange rate for 1 hour (3600000 ms)
const RATE_CACHE_DURATION = 60 * 60 * 1000;
let cachedRate = null;
let cacheTimestamp = null;

/**
 * Get USD to INR exchange rate
 * Uses cached rate if available, otherwise fetches from API
 * Falls back to default rate if API fails
 */
async function getUSDToINRRate() {
  const now = Date.now();
  
  // Return cached rate if still valid
  if (cachedRate && cacheTimestamp && (now - cacheTimestamp) < RATE_CACHE_DURATION) {
    return cachedRate;
  }

  try {
    // Try to fetch real-time rate from exchangerate-api.com (free tier)
    // Using Node.js https module for better compatibility
    const rate = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        req.destroy();
        reject(new Error('Request timeout'));
      }, 3000);

      const req = https.get('https://api.exchangerate-api.com/v4/latest/USD', (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          clearTimeout(timeout);
          try {
            const json = JSON.parse(data);
            const inrRate = json.rates?.INR;
            
            if (inrRate && typeof inrRate === 'number' && inrRate > 0) {
              resolve(inrRate);
            } else {
              reject(new Error('Invalid rate data'));
            }
          } catch (parseError) {
            reject(parseError);
          }
        });
      });
      
      req.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    cachedRate = rate;
    cacheTimestamp = now;
    console.log(`✅ Exchange rate fetched: 1 USD = ${rate.toFixed(2)} INR`);
    return rate;
    
  } catch (error) {
    console.warn('⚠️ Failed to fetch exchange rate from API:', error.message);
  }

  // Fallback to default rate if API fails
  const defaultRate = parseFloat(process.env.DEFAULT_USD_TO_INR_RATE) || 83;
  console.log(`⚠️ Using default exchange rate: 1 USD = ${defaultRate} INR`);
  
  // Cache the default rate
  cachedRate = defaultRate;
  cacheTimestamp = now;
  
  return defaultRate;
}

/**
 * Convert USD amount to INR
 * @param {number} usdAmount - Amount in USD
 * @returns {Promise<number>} Amount in INR (paise/cents)
 */
async function convertUSDToINR(usdAmount) {
  const rate = await getUSDToINRRate();
  const inrAmount = usdAmount * rate;
  // Round to nearest paise (INR cents)
  return Math.round(inrAmount * 100);
}

/**
 * Format currency amount for display
 * @param {number} amount - Amount in smallest currency unit (cents/paise)
 * @param {string} currency - Currency code (usd, inr)
 * @returns {string} Formatted amount
 */
function formatCurrency(amount, currency = 'usd') {
  const majorAmount = amount / 100;
  const symbol = currency.toUpperCase() === 'INR' ? '₹' : '$';
  return `${symbol}${majorAmount.toFixed(2)}`;
}

module.exports = {
  getUSDToINRRate,
  convertUSDToINR,
  formatCurrency
};

