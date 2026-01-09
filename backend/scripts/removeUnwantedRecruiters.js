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

const removeUnwantedRecruiters = async () => {
  try {
    await connectDB();
    console.log('Removing unwanted recruiters...');
    
    const unwantedCompanies = [
      'Logistics Express',
      'Fashion Forward', 
      'Real Estate Ventures'
    ];
    
    for (const companyName of unwantedCompanies) {
      // Find employer
      const employer = await Employer.findOne({ companyName });
      if (employer) {
        console.log(`Removing ${companyName}...`);
        
        // Remove jobs
        await Job.deleteMany({ employerId: employer._id });
        console.log(`Removed jobs for ${companyName}`);
        
        // Remove profile
        await EmployerProfile.deleteOne({ employerId: employer._id });
        console.log(`Removed profile for ${companyName}`);
        
        // Remove employer
        await Employer.deleteOne({ _id: employer._id });
        console.log(`Removed employer ${companyName}`);
      } else {
        console.log(`${companyName} not found in database`);
      }
    }
    
    console.log('Cleanup completed!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error removing recruiters:', error);
    mongoose.disconnect();
  }
};

removeUnwantedRecruiters();