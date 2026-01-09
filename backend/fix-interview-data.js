const mongoose = require('mongoose');
const Job = require('./models/Job');

mongoose.connect('mongodb://localhost:27017/TestingJobs')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Find all jobs with interviewRoundOrder
    const jobs = await Job.find({ 
      interviewRoundOrder: { $exists: true, $ne: [] } 
    });
    
    console.log(`Found ${jobs.length} jobs to fix`);
    
    for (const job of jobs) {
      console.log(`\nFixing job: ${job.title} (${job._id})`);
      console.log('Current interviewRoundOrder:', job.interviewRoundOrder);
      console.log('Current interviewRoundTypes:', job.interviewRoundTypes);
      
      // Create new interviewRoundTypes mapping
      const newInterviewRoundTypes = {};
      
      job.interviewRoundOrder.forEach(uniqueKey => {
        // Extract round type from unique key (e.g., 'technical_1764388004810' -> 'technical')
        const roundType = uniqueKey.split('_')[0];
        newInterviewRoundTypes[uniqueKey] = roundType;
      });
      
      console.log('New interviewRoundTypes:', newInterviewRoundTypes);
      
      // Update the job
      job.interviewRoundTypes = newInterviewRoundTypes;
      await job.save();
      
      console.log('✓ Job updated successfully');
    }
    
    console.log('\n✓ All jobs fixed!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
