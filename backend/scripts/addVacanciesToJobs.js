const mongoose = require('mongoose');
const Job = require('../models/Job');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Final_test';

async function addVacanciesToJobs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Job.updateMany(
      { $or: [{ vacancies: { $exists: false } }, { vacancies: null }] },
      { $set: { vacancies: 1 } }
    );

    console.log(`Updated ${result.modifiedCount} jobs with default vacancies value of 1`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addVacanciesToJobs();
