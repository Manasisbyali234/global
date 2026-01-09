const mongoose = require('mongoose');
const Application = require('./models/Application');

mongoose.connect('mongodb://localhost:27017/TestingJobs')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const applications = await Application.find().lean();
    
    console.log(`Total applications: ${applications.length}`);
    
    for (const app of applications) {
      if (!app.jobId) {
        console.log(`\n⚠ Application ${app._id} has NULL jobId`);
        console.log('  Candidate:', app.candidateId);
        console.log('  Status:', app.status);
      }
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
