const mongoose = require('mongoose');
const AssessmentAttempt = require('../models/AssessmentAttempt');

mongoose.connect('mongodb://localhost:27017/job-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function addTestViolations() {
  try {
    const attempts = await AssessmentAttempt.find({ status: { $in: ['completed', 'expired'] } });
    
    console.log(`Found ${attempts.length} completed attempts`);
    
    for (const attempt of attempts) {
      // Add sample violations if none exist
      if (!attempt.violations || attempt.violations.length === 0) {
        attempt.violations = [
          {
            type: 'tab_switch',
            timestamp: new Date(attempt.startTime.getTime() + 60000),
            details: 'User switched browser tabs'
          },
          {
            type: 'tab_switch',
            timestamp: new Date(attempt.startTime.getTime() + 120000),
            details: 'User switched browser tabs'
          },
          {
            type: 'window_blur',
            timestamp: new Date(attempt.startTime.getTime() + 180000),
            details: 'Browser window lost focus'
          }
        ];
        
        attempt.markModified('violations');
        await attempt.save();
        console.log(`Added 3 test violations to attempt ${attempt._id}`);
      } else {
        console.log(`Attempt ${attempt._id} already has ${attempt.violations.length} violations`);
      }
    }
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addTestViolations();
