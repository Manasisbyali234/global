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

// Note: Additional recruiters have been moved to addTopRecruitersData.js to maintain exactly 8 recruiters
const additionalRecruiters = [];

const addMoreRecruiters = async () => {
  try {
    await connectDB();
    console.log('Adding additional recruiters data...');
    
    for (const recruiterData of additionalRecruiters) {
      // Check if employer already exists
      const existingEmployer = await Employer.findOne({ email: recruiterData.email });
      if (existingEmployer) {
        console.log(`Employer ${recruiterData.companyName} already exists, skipping...`);
        continue;
      }
      
      // Create employer
      const employer = await Employer.create({
        name: recruiterData.name,
        email: recruiterData.email,
        password: recruiterData.password,
        phone: recruiterData.phone,
        companyName: recruiterData.companyName,
        employerType: recruiterData.employerType,
        isVerified: recruiterData.isVerified,
        isApproved: recruiterData.isApproved
      });
      
      console.log(`Created employer: ${employer.companyName}`);
      
      // Create employer profile
      const profile = await EmployerProfile.create({
        employerId: employer._id,
        companyName: employer.companyName,
        email: employer.email,
        phone: employer.phone,
        ...recruiterData.profile
      });
      
      console.log(`Created profile for: ${employer.companyName}`);
      
      // Create jobs for this employer
      for (const jobData of recruiterData.jobs) {
        const job = await Job.create({
          ...jobData,
          employerId: employer._id,
          companyName: employer.companyName,
          postedBy: 'Company'
        });
        
        console.log(`Created job: ${job.title} for ${employer.companyName}`);
      }
    }
    
    console.log('Additional recruiters data added successfully!');
    
    // Show final summary
    const totalEmployers = await Employer.countDocuments();
    const totalJobs = await Job.countDocuments();
    
    console.log('\nFinal Summary:');
    console.log(`Total Employers: ${totalEmployers}`);
    console.log(`Total Jobs: ${totalJobs}`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error adding recruiters data:', error);
    mongoose.disconnect();
  }
};

addMoreRecruiters();