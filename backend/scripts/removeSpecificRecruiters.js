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

const removeSpecificRecruiters = async () => {
  try {
    await connectDB();
    console.log('Removing specific recruiters...');
    
    const unwantedCompanies = [
      'Green Energy Solutions',
      'Food & Beverage Corp'
    ];
    
    for (const companyName of unwantedCompanies) {
      const employer = await Employer.findOne({ companyName });
      if (employer) {
        console.log(`Removing ${companyName}...`);
        
        await Job.deleteMany({ employerId: employer._id });
        console.log(`Removed jobs for ${companyName}`);
        
        await EmployerProfile.deleteOne({ employerId: employer._id });
        console.log(`Removed profile for ${companyName}`);
        
        await Employer.deleteOne({ _id: employer._id });
        console.log(`Removed employer ${companyName}`);
      } else {
        console.log(`${companyName} not found`);
      }
    }
    
    console.log('Cleanup completed!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
};

removeSpecificRecruiters();