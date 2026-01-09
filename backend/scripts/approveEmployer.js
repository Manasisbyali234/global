const mongoose = require('mongoose');
const Employer = require('../models/Employer');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const approveEmployer = async (email) => {
  try {
    if (!email) {
      console.log('Usage: node approveEmployer.js <employer_email>');
      process.exit(1);
    }

    const employer = await Employer.findOne({ email: email });
    
    if (!employer) {
      console.log(`Employer with email ${email} not found`);
      process.exit(1);
    }

    if (employer.isApproved) {
      console.log(`Employer ${email} is already approved`);
      process.exit(0);
    }

    await Employer.findByIdAndUpdate(employer._id, { isApproved: true });
    
    console.log(`✅ Employer ${email} has been approved successfully!`);
    console.log(`Company: ${employer.companyName}`);
    console.log(`Name: ${employer.name}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error approving employer:', error);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];
approveEmployer(email);