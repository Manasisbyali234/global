const mongoose = require('mongoose');
const Job = require('./models/Job');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name');

async function debugJobFields() {
  try {
    // Find a job with assessmentId
    const job = await Job.findOne({ assessmentId: { $exists: true } }).lean();
    
    if (job) {
      console.log('=== JOB DEBUG ===');
      console.log('Job ID:', job._id);
      console.log('Assessment ID:', job.assessmentId);
      console.log('Assessment Start Date:', job.assessmentStartDate);
      console.log('Assessment End Date:', job.assessmentEndDate);
      console.log('Assessment Start Time:', job.assessmentStartTime);
      console.log('Assessment End Time:', job.assessmentEndTime);
      console.log('Assessment Instructions:', job.assessmentInstructions);
      console.log('Interview Round Details:', job.interviewRoundDetails);
      console.log('Interview Round Types:', job.interviewRoundTypes);
      console.log('Interview Round Order:', job.interviewRoundOrder);
      console.log('All Job Fields:', Object.keys(job));
    } else {
      console.log('No job found with assessmentId');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugJobFields();