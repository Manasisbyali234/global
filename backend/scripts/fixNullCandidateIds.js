const mongoose = require('mongoose');
require('dotenv').config();

const fixNullCandidateIds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const candidateProfilesCollection = db.collection('candidateprofiles');

    // Find all profiles with null candidateId
    const nullProfiles = await candidateProfilesCollection.find({ 
      candidateId: null 
    }).toArray();

    console.log(`Found ${nullProfiles.length} profiles with null candidateId`);

    if (nullProfiles.length > 0) {
      // Delete profiles with null candidateId
      const deleteResult = await candidateProfilesCollection.deleteMany({ 
        candidateId: null 
      });
      console.log(`Deleted ${deleteResult.deletedCount} profiles with null candidateId`);
    }

    // Verify the unique index exists
    const indexes = await candidateProfilesCollection.indexes();
    console.log('\nCurrent indexes on candidateprofiles:');
    indexes.forEach(idx => {
      console.log(`- ${idx.name}:`, JSON.stringify(idx.key), idx.unique ? '(unique)' : '');
    });

    // Drop the old unique index if it exists
    try {
      await candidateProfilesCollection.dropIndex('candidateId_1');
      console.log('\nDropped old candidateId_1 index');
    } catch (e) {
      console.log('\nNo old index to drop or error:', e.message);
    }

    // Recreate the unique index with sparse option to prevent null duplicates
    await candidateProfilesCollection.createIndex(
      { candidateId: 1 }, 
      { unique: true, sparse: false }
    );
    console.log('Created unique index on candidateId');

    // Verify no orphaned profiles exist
    const CandidateProfile = require('../models/CandidateProfile');
    const Candidate = require('../models/Candidate');
    
    const allProfiles = await CandidateProfile.find({});
    console.log(`\nTotal profiles: ${allProfiles.length}`);
    
    let orphanedCount = 0;
    for (const profile of allProfiles) {
      const candidate = await Candidate.findById(profile.candidateId);
      if (!candidate) {
        console.log(`Orphaned profile found: ${profile._id} (candidateId: ${profile.candidateId})`);
        orphanedCount++;
      }
    }
    
    if (orphanedCount > 0) {
      console.log(`\nFound ${orphanedCount} orphaned profiles (profiles without matching candidates)`);
      console.log('Consider running cleanup if needed');
    } else {
      console.log('\nNo orphaned profiles found');
    }

    console.log('\n✅ Fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing null candidateIds:', error);
    process.exit(1);
  }
};

fixNullCandidateIds();
