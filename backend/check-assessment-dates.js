const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('./models/Job');

async function checkAssessmentDates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all jobs with assessments
    const jobsWithAssessments = await Job.find({ 
      assessmentId: { $exists: true, $ne: null } 
    }).select('title assessmentId assessmentStartDate assessmentEndDate');

    console.log(`\nFound ${jobsWithAssessments.length} jobs with assessments:\n`);

    jobsWithAssessments.forEach((job, index) => {
      console.log(`${index + 1}. Job: ${job.title}`);
      console.log(`   Assessment ID: ${job.assessmentId}`);
      console.log(`   Start Date: ${job.assessmentStartDate || 'NOT SET'}`);
      console.log(`   End Date: ${job.assessmentEndDate || 'NOT SET'}`);
      console.log('');
    });

    // Check if any jobs are missing assessment dates
    const missingDates = jobsWithAssessments.filter(job => 
      !job.assessmentStartDate || !job.assessmentEndDate
    );

    if (missingDates.length > 0) {
      console.log(`\n⚠️  WARNING: ${missingDates.length} jobs have assessments but missing dates:`);
      missingDates.forEach(job => {
        console.log(`   - ${job.title} (ID: ${job._id})`);
      });
    } else {
      console.log('\n✓ All jobs with assessments have proper dates set');
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAssessmentDates();
