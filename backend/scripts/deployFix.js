const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const deployFix = async () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   CANDIDATE ID DUPLICATE KEY ERROR - AUTOMATED FIX         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Confirm environment
    console.log('Current Environment:', process.env.NODE_ENV || 'development');
    console.log('MongoDB URI:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//<credentials>@') || 'Not set');
    
    const confirm = await question('\n⚠️  This will modify the database. Continue? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('Operation cancelled.');
      process.exit(0);
    }

    // Step 2: Connect to database
    console.log('\n[1/6] Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected successfully');

    const db = mongoose.connection.db;
    const candidateProfilesCollection = db.collection('candidateprofiles');
    const candidatesCollection = db.collection('candidates');

    // Step 3: Check current state
    console.log('\n[2/6] Checking current state...');
    const nullCount = await candidateProfilesCollection.countDocuments({ candidateId: null });
    const totalProfiles = await candidateProfilesCollection.countDocuments();
    const totalCandidates = await candidatesCollection.countDocuments();
    
    console.log(`   - Total Candidates: ${totalCandidates}`);
    console.log(`   - Total Profiles: ${totalProfiles}`);
    console.log(`   - Profiles with null candidateId: ${nullCount}`);

    if (nullCount === 0) {
      console.log('\n✓ No null candidateId records found. Proceeding to index verification...');
    } else {
      console.log(`\n⚠️  Found ${nullCount} profiles with null candidateId`);
      const deleteConfirm = await question(`   Delete these ${nullCount} records? (yes/no): `);
      
      if (deleteConfirm.toLowerCase() === 'yes') {
        console.log('\n[3/6] Deleting null candidateId records...');
        const deleteResult = await candidateProfilesCollection.deleteMany({ candidateId: null });
        console.log(`✓ Deleted ${deleteResult.deletedCount} records`);
      } else {
        console.log('⚠️  Skipping deletion. Fix may not work properly.');
      }
    }

    // Step 4: Fix indexes
    console.log('\n[4/6] Fixing indexes...');
    const indexes = await candidateProfilesCollection.indexes();
    const candidateIdIndex = indexes.find(idx => idx.key.candidateId);
    
    if (candidateIdIndex) {
      console.log('   Current index:', JSON.stringify(candidateIdIndex.key), 
                  candidateIdIndex.unique ? '(unique)' : '(non-unique)');
      
      if (!candidateIdIndex.unique) {
        console.log('   Dropping non-unique index...');
        await candidateProfilesCollection.dropIndex('candidateId_1');
        console.log('   ✓ Dropped');
      }
    }

    console.log('   Creating unique index...');
    await candidateProfilesCollection.createIndex(
      { candidateId: 1 }, 
      { unique: true, sparse: false }
    );
    console.log('   ✓ Unique index created');

    // Step 5: Verify fix
    console.log('\n[5/6] Verifying fix...');
    const remainingNull = await candidateProfilesCollection.countDocuments({ candidateId: null });
    const newIndexes = await candidateProfilesCollection.indexes();
    const newCandidateIdIndex = newIndexes.find(idx => idx.key.candidateId);
    
    console.log(`   - Remaining null records: ${remainingNull}`);
    console.log(`   - Index is unique: ${newCandidateIdIndex?.unique ? '✓' : '✗'}`);

    // Step 6: Summary
    console.log('\n[6/6] Summary:');
    if (remainingNull === 0 && newCandidateIdIndex?.unique) {
      console.log('   ✅ All checks passed!');
      console.log('   ✅ Database is ready for production use');
      console.log('\n   Next steps:');
      console.log('   1. Deploy updated code (models and controllers)');
      console.log('   2. Test candidate registration');
      console.log('   3. Monitor logs for any errors');
    } else {
      console.log('   ⚠️  Some issues remain:');
      if (remainingNull > 0) console.log(`      - ${remainingNull} null records still exist`);
      if (!newCandidateIdIndex?.unique) console.log('      - Index is not unique');
      console.log('\n   Please review and run the script again.');
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    FIX COMPLETED                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during fix:', error.message);
    console.error('\nFull error:', error);
    rl.close();
    process.exit(1);
  }
};

deployFix();
