const mongoose = require('mongoose');
const AssessmentAttempt = require('../models/AssessmentAttempt');

mongoose.connect('mongodb://localhost:27017/job-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function listAttempts() {
  try {
    const attempts = await AssessmentAttempt.find({})
      .populate('candidateId', 'name email')
      .populate('assessmentId', 'title')
      .sort({ createdAt: -1 });
    
    console.log(`\n=== ALL Assessment Attempts (${attempts.length}) ===\n`);
    
    attempts.forEach((attempt, index) => {
      console.log(`${index + 1}. Attempt ID: ${attempt._id}`);
      console.log(`   Assessment: ${attempt.assessmentId?.title || 'N/A'}`);
      console.log(`   Candidate: ${attempt.candidateId?.name || 'N/A'} (${attempt.candidateId?.email || 'N/A'})`);
      console.log(`   Status: ${attempt.status}`);
      console.log(`   Violations: ${attempt.violations?.length || 0}`);
      if (attempt.violations && attempt.violations.length > 0) {
        attempt.violations.forEach((v, i) => {
          console.log(`      ${i + 1}. ${v.type} at ${v.timestamp}`);
        });
      }
      console.log(`   Created: ${attempt.createdAt}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listAttempts();
