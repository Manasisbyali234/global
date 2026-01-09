/**
 * Fix Pending Candidates Script
 * 
 * This script fixes candidates who have passwords but are stuck in 'pending' status.
 * This happens when a candidate completes password creation but status wasn't updated.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');

const fixPendingCandidates = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Find all candidates with passwords but still pending
    const pendingWithPassword = await Candidate.find({
      status: 'pending',
      password: { $exists: true, $ne: null }
    });

    console.log(`\n📊 Found ${pendingWithPassword.length} candidates with passwords but pending status`);

    if (pendingWithPassword.length === 0) {
      console.log('✅ No candidates need fixing!');
      process.exit(0);
    }

    console.log('\n📋 Candidates to fix:');
    pendingWithPassword.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.name} (${candidate.email})`);
    });

    // Update all pending candidates with passwords to active
    const result = await Candidate.updateMany(
      {
        status: 'pending',
        password: { $exists: true, $ne: null }
      },
      {
        $set: {
          status: 'active',
          registrationMethod: 'signup'
        }
      }
    );

    console.log(`\n✅ Successfully updated ${result.modifiedCount} candidates to active status`);
    console.log('✅ All candidates can now login and access the system!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing candidates:', error);
    process.exit(1);
  }
};

// Run the script
fixPendingCandidates();
