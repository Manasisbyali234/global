const mongoose = require('mongoose');
require('dotenv').config();

const createIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Job indexes
    console.log('Creating Job indexes...');
    await db.collection('jobs').createIndex({ status: 1, employerId: 1 });
    await db.collection('jobs').createIndex({ createdAt: -1 });
    await db.collection('jobs').createIndex({ employerId: 1, status: 1 });
    await db.collection('jobs').createIndex({ location: 1, status: 1 });
    await db.collection('jobs').createIndex({ jobType: 1, status: 1 });
    await db.collection('jobs').createIndex({ category: 1, status: 1 });
    
    // Employer indexes
    console.log('Creating Employer indexes...');
    await db.collection('employers').createIndex({ status: 1, isApproved: 1 });
    await db.collection('employers').createIndex({ createdAt: -1 });
    
    // EmployerProfile indexes
    console.log('Creating EmployerProfile indexes...');
    await db.collection('employerprofiles').createIndex({ employerId: 1 });
    
    // Application indexes
    console.log('Creating Application indexes...');
    await db.collection('applications').createIndex({ candidateId: 1 });
    await db.collection('applications').createIndex({ jobId: 1 });
    await db.collection('applications').createIndex({ status: 1 });

    console.log('All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
};

createIndexes();
