const mongoose = require('mongoose');
const Application = require('./models/Application');
const Job = require('./models/Job');
const Candidate = require('./models/Candidate');
const Employer = require('./models/Employer');

mongoose.connect('mongodb://localhost:27017/TestingJobs')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const applications = await Application.find()
      .populate({
        path: 'jobId',
        options: { lean: false }
      })
      .populate('employerId', 'companyName')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log('\n=== API RESPONSE SIMULATION ===');
    console.log('Total applications:', applications.length);
    
    if (applications.length > 0) {
      const app = applications[0];
      console.log('\nFirst Application:');
      console.log('- Application ID:', app._id);
      console.log('- Status:', app.status);
      console.log('- JobId exists:', !!app.jobId);
      console.log('- JobId type:', typeof app.jobId);
      console.log('- Job Title:', app.jobId?.title);
      console.log('- Company Name:', app.employerId?.companyName);
      console.log('\nFull jobId object:', JSON.stringify(app.jobId, null, 2));
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
