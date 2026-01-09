const mongoose = require('mongoose');
require('dotenv').config();

const Candidate = require('../models/Candidate');

async function fixCandidateStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'candidate@gmail.com';
    
    const candidate = await Candidate.findOne({ email });
    
    if (!candidate) {
      console.log('Candidate not found');
      process.exit(1);
    }

    console.log('Current candidate status:', {
      email: candidate.email,
      hasPassword: !!candidate.password,
      status: candidate.status,
      registrationMethod: candidate.registrationMethod
    });

    if (candidate.password && candidate.status !== 'active') {
      candidate.status = 'active';
      await candidate.save();
      console.log('✓ Candidate status updated to active');
    } else if (!candidate.password) {
      console.log('✗ Candidate has no password set');
    } else {
      console.log('✓ Candidate is already active');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixCandidateStatus();
