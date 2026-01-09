require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tale_jobportal';

async function checkCandidate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB:', MONGODB_URI);

    const Candidate = require('./models/Candidate');

    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node check-candidate.js <email>');
      console.log('\nListing all candidates:');
      const allCandidates = await Candidate.find({}).select('name email status password');
      console.log(allCandidates);
      process.exit(0);
    }

    const candidate = await Candidate.findOne({ email: email.toLowerCase().trim() });
    
    if (!candidate) {
      console.log(`No candidate found with email: ${email}`);
      console.log('\nSearching with case-insensitive...');
      const candidateInsensitive = await Candidate.findOne({ email: new RegExp(`^${email}$`, 'i') });
      if (candidateInsensitive) {
        console.log('Found with case-insensitive search:', candidateInsensitive);
      }
    } else {
      console.log('Candidate found:');
      console.log('Name:', candidate.name);
      console.log('Email:', candidate.email);
      console.log('Status:', candidate.status);
      console.log('Has password:', !!candidate.password);
      console.log('Registration method:', candidate.registrationMethod);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCandidate();
