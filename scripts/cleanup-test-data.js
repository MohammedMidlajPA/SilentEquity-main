#!/usr/bin/env node

/**
 * Cleanup Test Data from Supabase
 * Removes test entries from course_leads table
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const { getSupabaseClient, isSupabaseConfigured } = require('../backend/config/supabase');

async function cleanupTestData() {
  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase not configured');
    process.exit(1);
  }

  const supabase = getSupabaseClient();
  
  // Test email patterns to identify test data
  const testPatterns = [
    /test\d+@example\.com/i,
    /test\d+@test\.com/i,
    /loadtest\d+.*@test\.com/i,
    /dbtest\d+@verification\.com/i,
    /realuser\d+@test\.com/i,
    /final\d+@test\.com/i
  ];

  console.log('\n🧹 Cleaning up test data from course_leads table...\n');

  try {
    // Get all leads
    const { data: allLeads, error: fetchError } = await supabase
      .from('course_leads')
      .select('id, name, email')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching leads:', fetchError.message);
      process.exit(1);
    }

    if (!allLeads || allLeads.length === 0) {
      console.log('✅ No leads found in database');
      return;
    }

    console.log(`📊 Total leads in database: ${allLeads.length}`);

    // Identify test entries
    const testEntries = allLeads.filter(lead => {
      return testPatterns.some(pattern => pattern.test(lead.email)) ||
             lead.name.toLowerCase().includes('test user') ||
             lead.name.toLowerCase().includes('load test') ||
             lead.name.toLowerCase().includes('database test');
    });

    console.log(`🔍 Found ${testEntries.length} test entries to remove`);

    if (testEntries.length === 0) {
      console.log('✅ No test entries found');
      return;
    }

    // Show what will be deleted
    console.log('\n📋 Test entries to be removed:');
    testEntries.forEach((entry, idx) => {
      console.log(`   ${idx + 1}. ${entry.name} - ${entry.email}`);
    });

    // Delete test entries
    const testIds = testEntries.map(e => e.id);
    const { error: deleteError } = await supabase
      .from('course_leads')
      .delete()
      .in('id', testIds);

    if (deleteError) {
      console.error('❌ Error deleting test entries:', deleteError.message);
      process.exit(1);
    }

    console.log(`\n✅ Successfully removed ${testEntries.length} test entries`);
    console.log(`📊 Remaining leads: ${allLeads.length - testEntries.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupTestData().catch(console.error);

