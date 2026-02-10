const mongoose = require('mongoose');
require('dotenv').config();

const createIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Job indexes
    console.log('Creating Job indexes...');
    try {
      await db.collection('jobs').createIndex({ status: 1, employerId: 1 });
      await db.collection('jobs').createIndex({ createdAt: -1 });
      await db.collection('jobs').createIndex({ employerId: 1, status: 1 });
      await db.collection('jobs').createIndex({ location: 1, status: 1 });
      await db.collection('jobs').createIndex({ jobType: 1, status: 1 });
      await db.collection('jobs').createIndex({ category: 1, status: 1 });
      console.log('✓ Job indexes created');
    } catch (e) {
      console.log('Job indexes already exist or error:', e.message);
    }
    
    // Employer indexes
    console.log('Creating Employer indexes...');
    try {
      await db.collection('employers').createIndex({ status: 1, isApproved: 1 });
      await db.collection('employers').createIndex({ createdAt: -1 });
      console.log('✓ Employer indexes created');
    } catch (e) {
      console.log('Employer indexes already exist or error:', e.message);
    }
    
    // EmployerProfile indexes - skip if unique index exists
    console.log('Checking EmployerProfile indexes...');
    const existingIndexes = await db.collection('employerprofiles').indexes();
    const hasEmployerIdIndex = existingIndexes.some(idx => idx.key.employerId);
    if (!hasEmployerIdIndex) {
      try {
        await db.collection('employerprofiles').createIndex({ employerId: 1 });
        console.log('✓ EmployerProfile index created');
      } catch (e) {
        console.log('EmployerProfile index error:', e.message);
      }
    } else {
      console.log('✓ EmployerProfile index already exists');
    }
    
    // Application indexes
    console.log('Creating Application indexes...');
    try {
      await db.collection('applications').createIndex({ candidateId: 1 });
      await db.collection('applications').createIndex({ jobId: 1 });
      await db.collection('applications').createIndex({ status: 1 });
      console.log('✓ Application indexes created');
    } catch (e) {
      console.log('Application indexes already exist or error:', e.message);
    }

    console.log('\n✅ Index creation completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
};

createIndexes();
