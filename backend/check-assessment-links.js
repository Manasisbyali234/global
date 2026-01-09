const mongoose = require('mongoose');
const AssessmentAttempt = require('./models/AssessmentAttempt');
const Assessment = require('./models/Assessment');
const Employer = require('./models/Employer');
const Candidate = require('./models/Candidate');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkAssessmentLinks() {
  try {
    console.log('=== CHECKING ASSESSMENT LINKS ===\n');
    
    // 1. Get all assessment attempts
    const attempts = await AssessmentAttempt.find({
      status: { $in: ['completed', 'expired'] }
    }).populate('candidateId', 'name email');
    
    console.log(`Total completed attempts: ${attempts.length}\n`);
    
    // 2. Group by assessment ID
    const attemptsByAssessment = {};
    attempts.forEach(attempt => {
      const assessmentId = attempt.assessmentId.toString();
      if (!attemptsByAssessment[assessmentId]) {
        attemptsByAssessment[assessmentId] = [];
      }
      attemptsByAssessment[assessmentId].push(attempt);
    });
    
    console.log(`Unique assessment IDs with attempts: ${Object.keys(attemptsByAssessment).length}\n`);
    
    // 3. Check each assessment
    for (const [assessmentId, assessmentAttempts] of Object.entries(attemptsByAssessment)) {
      console.log(`Assessment ID: ${assessmentId}`);
      console.log(`Attempts: ${assessmentAttempts.length}`);
      
      // Get assessment details
      const assessment = await Assessment.findById(assessmentId).populate('employerId', 'companyName');
      if (assessment) {
        console.log(`Title: ${assessment.title}`);
        console.log(`Employer: ${assessment.employerId?.companyName || 'Unknown'}`);
        
        // Show sample attempts
        console.log('Sample attempts:');
        assessmentAttempts.slice(0, 3).forEach((attempt, index) => {
          console.log(`  ${index + 1}. ${attempt.candidateId?.name || 'N/A'} (${attempt.candidateId?.email || 'N/A'}) - Score: ${attempt.score}/${attempt.totalMarks}`);
        });
      } else {
        console.log('Assessment not found!');
      }
      console.log('---\n');
    }
    
    console.log('=== CHECK COMPLETE ===');
    
  } catch (error) {
    console.error('Check error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAssessmentLinks();