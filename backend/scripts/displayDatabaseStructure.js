const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('../models/Job');

async function displayDatabaseStructure() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find a job with interview data
    const jobWithInterviews = await Job.findOne({
      $or: [
        { interviewRoundDetails: { $exists: true, $ne: {} } },
        { interviewRounds: { $exists: true, $ne: [] } }
      ]
    }).lean();

    if (!jobWithInterviews) {
      console.log('No jobs found with interview data.');
      
      // Show a sample job structure
      const sampleJob = await Job.findOne().lean();
      if (sampleJob) {
        console.log('\n=== SAMPLE JOB STRUCTURE ===');
        console.log('Job ID:', sampleJob._id);
        console.log('Title:', sampleJob.title);
        console.log('Has interviewRoundDetails:', !!sampleJob.interviewRoundDetails);
        console.log('Has interviewRounds:', !!sampleJob.interviewRounds);
        console.log('\nFull structure:');
        console.log(JSON.stringify(sampleJob, null, 2));
      }
    } else {
      console.log('=== JOB WITH INTERVIEW DATA ===');
      console.log('Job ID:', jobWithInterviews._id);
      console.log('Title:', jobWithInterviews.title);
      console.log('Status:', jobWithInterviews.status);
      
      console.log('\n--- OLD FORMAT (interviewRoundDetails) ---');
      if (jobWithInterviews.interviewRoundDetails) {
        console.log(JSON.stringify(jobWithInterviews.interviewRoundDetails, null, 2));
      } else {
        console.log('Not present');
      }
      
      console.log('\n--- NEW FORMAT (interviewRounds) ---');
      if (jobWithInterviews.interviewRounds) {
        console.log(JSON.stringify(jobWithInterviews.interviewRounds, null, 2));
      } else {
        console.log('Not present');
      }
      
      console.log('\n--- OTHER INTERVIEW FIELDS ---');
      console.log('interviewRoundsCount:', jobWithInterviews.interviewRoundsCount);
      console.log('interviewScheduled:', jobWithInterviews.interviewScheduled);
      console.log('interviewRoundOrder:', jobWithInterviews.interviewRoundOrder);
    }

    // Count statistics
    const totalJobs = await Job.countDocuments();
    const jobsWithOldFormat = await Job.countDocuments({ interviewRoundDetails: { $exists: true, $ne: {} } });
    const jobsWithNewFormat = await Job.countDocuments({ interviewRounds: { $exists: true, $ne: [] } });

    console.log('\n=== STATISTICS ===');
    console.log('Total jobs:', totalJobs);
    console.log('Jobs with OLD format (interviewRoundDetails):', jobsWithOldFormat);
    console.log('Jobs with NEW format (interviewRounds):', jobsWithNewFormat);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

displayDatabaseStructure();
