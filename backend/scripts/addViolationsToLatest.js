const mongoose = require('mongoose');
const AssessmentAttempt = require('../models/AssessmentAttempt');

mongoose.connect('mongodb://localhost:27017/job-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function addViolations() {
  try {
    const attempts = await AssessmentAttempt.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('candidateId', 'name email');
    
    console.log(`\nFound ${attempts.length} recent attempts:\n`);
    
    for (const attempt of attempts) {
      console.log(`ID: ${attempt._id}`);
      console.log(`Candidate: ${attempt.candidateId?.name || 'N/A'}`);
      console.log(`Status: ${attempt.status}`);
      console.log(`Current violations: ${attempt.violations?.length || 0}`);
      
      if (!attempt.violations || attempt.violations.length === 0) {
        attempt.violations = [
          { type: 'tab_switch', timestamp: new Date(), details: 'User switched browser tabs' },
          { type: 'tab_switch', timestamp: new Date(), details: 'User switched browser tabs' },
          { type: 'window_blur', timestamp: new Date(), details: 'Browser window lost focus' }
        ];
        attempt.markModified('violations');
        await attempt.save();
        console.log(`✓ Added 3 violations\n`);
      } else {
        console.log(`✓ Already has violations\n`);
      }
    }
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addViolations();
