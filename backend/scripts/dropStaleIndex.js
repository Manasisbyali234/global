const mongoose = require('mongoose');
require('dotenv').config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const candidatesCol = db.collection('candidates');

    // Show current indexes
    const indexes = await candidatesCol.indexes();
    console.log('Current indexes on candidates collection:');
    indexes.forEach(idx => console.log(`  - ${idx.name}:`, JSON.stringify(idx.key)));

    // Drop the stale candidateId_1 index if it exists on the candidates collection
    const hasStaleIndex = indexes.some(idx => idx.name === 'candidateId_1');
    if (hasStaleIndex) {
      await candidatesCol.dropIndex('candidateId_1');
      console.log('✅ Dropped stale candidateId_1 index from candidates collection');
    } else {
      console.log('ℹ️  No stale candidateId_1 index found on candidates collection');
    }

    // Also clean up any null-candidateId docs in candidateprofiles that block signups
    const profilesCol = db.collection('candidateprofiles');
    const result = await profilesCol.deleteMany({ candidateId: null });
    if (result.deletedCount > 0) {
      console.log(`✅ Deleted ${result.deletedCount} candidateprofiles with null candidateId`);
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

run();
