const mongoose = require('mongoose');
const AssessmentAttempt = require('../models/AssessmentAttempt');

mongoose.connect('mongodb://localhost:27017/job-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkViolations() {
  try {
    const attempts = await AssessmentAttempt.find({ status: { $in: ['completed', 'expired'] } })
      .select('_id candidateId violations status')
      .populate('candidateId', 'name email');
    
    console.log('\n=== Assessment Attempts Violations Check ===\n');
    
    attempts.forEach(attempt => {
      console.log(`Attempt ID: ${attempt._id}`);
      console.log(`Candidate: ${attempt.candidateId?.name || 'N/A'}`);
      console.log(`Status: ${attempt.status}`);
      console.log(`Violations: ${attempt.violations?.length || 0}`);
      if (attempt.violations && attempt.violations.length > 0) {
        console.log('Violation details:', JSON.stringify(attempt.violations, null, 2));
      }
      console.log('---\n');
    });
    
    console.log(`Total attempts: ${attempts.length}`);
    console.log(`Attempts with violations: ${attempts.filter(a => a.violations && a.violations.length > 0).length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkViolations();
