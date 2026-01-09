const mongoose = require('mongoose');
const Employer = require('../models/Employer');
const EmployerProfile = require('../models/EmployerProfile');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkEmployerStatus = async (email) => {
  try {
    if (!email) {
      console.log('Usage: node checkEmployerStatus.js <employer_email>');
      process.exit(1);
    }

    const employer = await Employer.findOne({ email: email });
    
    if (!employer) {
      console.log(`❌ Employer with email ${email} not found`);
      process.exit(1);
    }

    const profile = await EmployerProfile.findOne({ employerId: employer._id });

    console.log('\n=== EMPLOYER STATUS ===');
    console.log(`Email: ${employer.email}`);
    console.log(`Name: ${employer.name}`);
    console.log(`Company: ${employer.companyName}`);
    console.log(`Type: ${employer.employerType}`);
    console.log(`Status: ${employer.status}`);
    console.log(`Approved: ${employer.isApproved ? '✅ YES' : '❌ NO'}`);
    console.log(`Verified: ${employer.isVerified ? '✅ YES' : '❌ NO'}`);

    if (profile) {
      console.log('\n=== PROFILE STATUS ===');
      const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
      const missingFields = requiredFields.filter(field => {
        const value = profile[field];
        return !value || (typeof value === 'string' && value.trim() === '');
      });
      
      console.log(`Profile exists: ✅ YES`);
      console.log(`Company Name: ${profile.companyName || '❌ Missing'}`);
      console.log(`Description: ${profile.description ? '✅ Present' : '❌ Missing'}`);
      console.log(`Location: ${profile.location || '❌ Missing'}`);
      console.log(`Phone: ${profile.phone || '❌ Missing'}`);
      console.log(`Email: ${profile.email || '❌ Missing'}`);
      
      if (missingFields.length === 0) {
        console.log(`\n✅ Profile is COMPLETE`);
      } else {
        console.log(`\n❌ Profile is INCOMPLETE. Missing: ${missingFields.join(', ')}`);
      }
      
      const canPostJobs = employer.isApproved && missingFields.length === 0;
      console.log(`\nCan post jobs: ${canPostJobs ? '✅ YES' : '❌ NO'}`);
      
      if (!canPostJobs) {
        if (missingFields.length > 0) {
          console.log(`Reason: Profile incomplete (missing: ${missingFields.join(', ')})`);
        } else if (!employer.isApproved) {
          console.log(`Reason: Not approved by admin`);
        }
      }
    } else {
      console.log('\n❌ No profile found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking employer status:', error);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];
checkEmployerStatus(email);