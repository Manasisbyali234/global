const mongoose = require('mongoose');
const Job = require('../models/Job');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Final_test';

async function checkJobs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const jobs = await Job.find({}).select('title vacancies').limit(5);
    console.log('Sample jobs:', JSON.stringify(jobs, null, 2));

    const count = await Job.countDocuments({});
    console.log(`Total jobs: ${count}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkJobs();
