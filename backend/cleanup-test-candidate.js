require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tale_jobportal';

async function cleanupTestCandidate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Candidate = require('./models/Candidate');
    const CandidateProfile = require('./models/CandidateProfile');

    // Get email from command line argument
    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node cleanup-test-candidate.js <email>');
      process.exit(1);
    }

    const candidate = await Candidate.findOne({ email });
    
    if (!candidate) {
      console.log(`No candidate found with email: ${email}`);
      process.exit(0);
    }

    console.log(`Found candidate: ${candidate.name} (${candidate.email})`);
    console.log(`Status: ${candidate.status}`);
    console.log(`Has password: ${!!candidate.password}`);

    // Delete profile
    await CandidateProfile.deleteOne({ candidateId: candidate._id });
    console.log('Deleted candidate profile');

    // Delete candidate
    await Candidate.deleteOne({ _id: candidate._id });
    console.log('Deleted candidate');

    console.log('Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupTestCandidate();
