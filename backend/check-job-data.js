const mongoose = require('mongoose');
const Job = require('./models/Job');

mongoose.connect('mongodb://localhost:27017/TestingJobs')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get a sample job with interview rounds
    const job = await Job.findOne({ 
      interviewRoundOrder: { $exists: true, $ne: [] } 
    }).lean();
    
    if (job) {
      console.log('\n=== JOB DATA ===');
      console.log('Job ID:', job._id);
      console.log('Title:', job.title);
      console.log('\ninterviewRoundOrder:', JSON.stringify(job.interviewRoundOrder, null, 2));
      console.log('\ninterviewRoundTypes:', JSON.stringify(job.interviewRoundTypes, null, 2));
      console.log('\ninterviewRoundDetails:', JSON.stringify(job.interviewRoundDetails, null, 2));
      console.log('\nassessmentId:', job.assessmentId);
      console.log('assessmentStartDate:', job.assessmentStartDate);
      console.log('assessmentEndDate:', job.assessmentEndDate);
    } else {
      console.log('No job found with interviewRoundOrder');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
