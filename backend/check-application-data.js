const mongoose = require('mongoose');
const Application = require('./models/Application');
const Job = require('./models/Job');
const Candidate = require('./models/Candidate');

mongoose.connect('mongodb://localhost:27017/TestingJobs')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const app = await Application.findOne()
      .populate('jobId')
      .populate('candidateId', 'name')
      .lean();
    
    if (app) {
      console.log('\n=== APPLICATION DATA ===');
      console.log('Candidate:', app.candidateId?.name);
      console.log('Job Title:', app.jobId?.title);
      console.log('Status:', app.status);
      console.log('\nJob interviewRoundOrder:', app.jobId?.interviewRoundOrder);
      console.log('Job interviewRoundTypes:', JSON.stringify(app.jobId?.interviewRoundTypes, null, 2));
    } else {
      console.log('No applications found');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
