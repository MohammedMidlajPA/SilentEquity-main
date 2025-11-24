#!/usr/bin/env node

/**
 * Verify Supabase connection and test insert
 */

require('dotenv').config({ path: './backend/.env' });
const path = require('path');
const { createClient } = require(path.join(__dirname, '../backend/node_modules/@supabase/supabase-js'));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verifying Supabase Connection\n');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase credentials not found in environment');
  console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

console.log('✅ Supabase URL:', SUPABASE_URL);
console.log('✅ Service Role Key:', SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...');
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testConnection() {
  try {
    console.log('📡 Testing Supabase connection...');
    
    // Test query
    const { data, error } = await supabase
      .from('course_leads')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:');
      console.error('Error:', error.message);
      console.error('Code:', error.code);
      console.error('Details:', error.details);
      console.error('Hint:', error.hint);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('');
    
    // Test insert
    console.log('📝 Testing insert operation...');
    const testData = {
      name: 'Test Connection',
      email: `test${Date.now()}@connection.test`,
      phone: '+1234567890',
      paid: false
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('course_leads')
      .insert([testData])
      .select('id')
      .single();
    
    if (insertError) {
      console.error('❌ Insert test failed:');
      console.error('Error:', insertError.message);
      console.error('Code:', insertError.code);
      console.error('Details:', insertError.details);
      console.error('Hint:', insertError.hint);
      return false;
    }
    
    console.log('✅ Insert test successful!');
    console.log('✅ Inserted ID:', insertData.id);
    console.log('');
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await supabase
      .from('course_leads')
      .delete()
      .eq('id', insertData.id);
    console.log('✅ Test data cleaned up');
    console.log('');
    
    console.log('✅ All Supabase tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error.stack);
    return false;
  }
}

testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

