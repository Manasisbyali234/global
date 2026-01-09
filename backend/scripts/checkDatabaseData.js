const mongoose = require('mongoose');
require('dotenv').config();

const Employer = require('../models/Employer');
const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkDatabaseData = async () => {
  try {
    await connectDB();
    console.log('Checking current database data...\n');
    
    const employers = await Employer.find({ status: 'active', isApproved: true }).select('companyName email phone');
    console.log('=== EMPLOYERS IN DATABASE ===');
    employers.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.companyName} (${emp.email})`);
    });
    
    console.log(`\nTotal Employers: ${employers.length}\n`);
    
    const jobs = await Job.find({ status: 'active' }).select('title companyName location salary');
    console.log('=== JOBS IN DATABASE ===');
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.companyName} - ${job.location}`);
    });
    
    console.log(`\nTotal Jobs: ${jobs.length}\n`);
    
    // Check job count per employer
    console.log('=== JOB COUNT PER EMPLOYER ===');
    for (const employer of employers) {
      const jobCount = await Job.countDocuments({ 
        employerId: employer._id, 
        status: { $in: ['active', 'pending'] } 
      });
      console.log(`${employer.companyName}: ${jobCount} jobs`);
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
};

checkDatabaseData();