const mongoose = require('mongoose');
require('dotenv').config();

const verifyCandidateSetup = async () => {
  try {
    console.log('=== Candidate Registration Setup Verification ===\n');
    
    // Check environment variables
    console.log('1. Environment Variables:');
    console.log(`   - MONGODB_URI: ${process.env.MONGODB_URI ? '✓ Set' : '✗ Missing'}`);
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`   - JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Missing'}`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n2. Database Connection: ✓ Connected');

    const db = mongoose.connection.db;
    const candidateProfilesCollection = db.collection('candidateprofiles');
    const candidatesCollection = db.collection('candidates');

    // Check for null candidateId records
    console.log('\n3. Checking for null candidateId records:');
    const nullProfiles = await candidateProfilesCollection.countDocuments({ 
      candidateId: null 
    });
    
    if (nullProfiles > 0) {
      console.log(`   ✗ Found ${nullProfiles} profiles with null candidateId`);
      console.log('   → Run: node scripts/fixNullCandidateIds.js');
    } else {
      console.log('   ✓ No profiles with null candidateId');
    }

    // Check indexes
    console.log('\n4. Checking indexes:');
    const indexes = await candidateProfilesCollection.indexes();
    const candidateIdIndex = indexes.find(idx => idx.key.candidateId);
    
    if (candidateIdIndex) {
      console.log(`   ✓ candidateId index exists`);
      console.log(`     - Unique: ${candidateIdIndex.unique ? '✓' : '✗'}`);
      console.log(`     - Sparse: ${candidateIdIndex.sparse ? 'Yes' : 'No'}`);
    } else {
      console.log('   ✗ candidateId index missing');
      console.log('   → Run: node scripts/createIndexes.js');
    }

    // Check for orphaned profiles
    console.log('\n5. Checking for orphaned profiles:');
    const CandidateProfile = require('../models/CandidateProfile');
    const Candidate = require('../models/Candidate');
    
    const allProfiles = await CandidateProfile.find({}).limit(100);
    let orphanedCount = 0;
    
    for (const profile of allProfiles) {
      if (profile.candidateId) {
        const candidate = await Candidate.findById(profile.candidateId);
        if (!candidate) {
          orphanedCount++;
        }
      }
    }
    
    if (orphanedCount > 0) {
      console.log(`   ⚠ Found ${orphanedCount} orphaned profiles (checked first 100)`);
    } else {
      console.log('   ✓ No orphaned profiles found');
    }

    // Statistics
    console.log('\n6. Database Statistics:');
    const totalCandidates = await candidatesCollection.countDocuments();
    const totalProfiles = await candidateProfilesCollection.countDocuments();
    console.log(`   - Total Candidates: ${totalCandidates}`);
    console.log(`   - Total Profiles: ${totalProfiles}`);
    console.log(`   - Difference: ${Math.abs(totalCandidates - totalProfiles)}`);

    // Check recent registrations
    console.log('\n7. Recent Registrations (last 5):');
    const recentCandidates = await candidatesCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    for (const candidate of recentCandidates) {
      const hasProfile = await candidateProfilesCollection.findOne({ 
        candidateId: candidate._id 
      });
      console.log(`   - ${candidate.email}: ${hasProfile ? '✓' : '✗'} profile`);
    }

    console.log('\n=== Verification Complete ===');
    
    if (nullProfiles === 0 && candidateIdIndex && candidateIdIndex.unique) {
      console.log('\n✅ All checks passed! System is ready.');
    } else {
      console.log('\n⚠ Issues found. Please run the suggested fix scripts.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  }
};

verifyCandidateSetup();
