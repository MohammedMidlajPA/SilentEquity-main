#!/usr/bin/env node

/**
 * Test Supabase Connection
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const { getSupabaseClient, isSupabaseConfigured } = require('../backend/config/supabase');

async function testConnection() {
  console.log('\n🔍 Testing Supabase Connection\n');
  console.log('='.repeat(60));
  
  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase not configured');
    console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
    process.exit(1);
  }
  
  console.log('✅ Supabase configured');
  console.log('   SUPABASE_URL:', process.env.SUPABASE_URL?.substring(0, 30) + '...');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
  console.log('');
  
  try {
    const supabase = getSupabaseClient();
    
    // Test 1: List tables
    console.log('📋 Test 1: Checking course_leads table...');
    const { data, error } = await supabase
      .from('course_leads')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
      console.log('   Code:', error.code);
      console.log('   Details:', error.details);
      console.log('   Hint:', error.hint);
      process.exit(1);
    }
    
    console.log('✅ Table accessible');
    console.log('   Records found:', data?.length || 0);
    console.log('');
    
    // Test 2: Try inserting a test record (then delete it)
    console.log('📋 Test 2: Testing insert operation...');
    const testData = {
      name: 'Test Connection',
      email: `testconnection${Date.now()}@test.com`,
      phone: '+1234567890',
      paid: false
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('course_leads')
      .insert([testData])
      .select('id')
      .single();
    
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      console.log('   Code:', insertError.code);
      console.log('   Details:', insertError.details);
      console.log('   Hint:', insertError.hint);
      process.exit(1);
    }
    
    console.log('✅ Insert successful');
    console.log('   Inserted ID:', insertData.id);
    
    // Clean up test record
    await supabase
      .from('course_leads')
      .delete()
      .eq('id', insertData.id);
    console.log('✅ Test record cleaned up');
    console.log('');
    
    console.log('='.repeat(60));
    console.log('✅ All tests passed! Supabase connection is working.');
    console.log('');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

testConnection().catch(console.error);





