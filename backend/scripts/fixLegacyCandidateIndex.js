const mongoose = require('mongoose');
require('dotenv').config();

const fixLegacyCandidateIndex = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const candidatesCollection = db.collection('candidates');
    const indexes = await candidatesCollection.indexes();
    const legacyIndex = indexes.find((index) => index.name === 'candidateId_1');

    if (!legacyIndex) {
      console.log('No legacy candidateId_1 index found on candidates collection');
      process.exit(0);
    }

    await candidatesCollection.dropIndex(legacyIndex.name);
    console.log('Dropped legacy candidateId_1 index from candidates collection');
    process.exit(0);
  } catch (error) {
    console.error('Failed to fix legacy candidate index:', error);
    process.exit(1);
  }
};

fixLegacyCandidateIndex();
