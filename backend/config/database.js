const mongoose = require('mongoose');

const dropLegacyCandidateIndex = async () => {
  try {
    const candidatesCollection = mongoose.connection.db.collection('candidates');
    const indexes = await candidatesCollection.indexes();
    const legacyCandidateIdIndex = indexes.find((index) => index.name === 'candidateId_1');

    if (!legacyCandidateIdIndex) {
      return;
    }

    await candidatesCollection.dropIndex(legacyCandidateIdIndex.name);
    console.log('Dropped legacy candidates.candidateId_1 index');
  } catch (error) {
    console.error('Failed to clean up legacy candidate index:', error.message);
  }
};

const connectDB = async () => {
  try {
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Atlas-optimized connection options
    const connectionOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      bufferCommands: true,
      maxPoolSize: 50,
      minPoolSize: 10,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority',
      appName: 'tale-job-portal'
    };

    // Add Atlas-specific options if using Atlas
    if (process.env.MONGODB_URI.includes('mongodb+srv')) {
      connectionOptions.ssl = true;
      connectionOptions.authSource = 'admin';
      console.log('Using MongoDB Atlas configuration');
    } else {
      console.log('Using local MongoDB configuration');
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    await dropLegacyCandidateIndex();
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isDBConnected };
