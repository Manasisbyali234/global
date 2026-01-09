const mongoose = require('mongoose');
const AssessmentAttempt = require('./models/AssessmentAttempt');
const Candidate = require('./models/Candidate');
const Application = require('./models/Application');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixAssessmentCandidates() {
  try {
    console.log('=== FIXING ASSESSMENT CANDIDATE REFERENCES ===\n');
    
    // 1. Find all assessment attempts with missing or invalid candidate references
    const attempts = await AssessmentAttempt.find({});
    console.log(`Total assessment attempts: ${attempts.length}`);
    
    let fixedCount = 0;
    
    for (const attempt of attempts) {
      // Check if candidate exists
      const candidate = await Candidate.findById(attempt.candidateId);
      
      if (!candidate) {
        console.log(`Attempt ${attempt._id} has invalid candidate ID: ${attempt.candidateId}`);
        
        // Try to find the candidate through the application
        if (attempt.applicationId) {
          const application = await Application.findById(attempt.applicationId).populate('candidateId');
          
          if (application && application.candidateId) {
            console.log(`  Found candidate through application: ${application.candidateId.name} (${application.candidateId.email})`);
            
            // Update the assessment attempt with correct candidate ID
            await AssessmentAttempt.findByIdAndUpdate(attempt._id, {
              candidateId: application.candidateId._id
            });
            
            console.log(`  Fixed attempt ${attempt._id} with candidate ${application.candidateId._id}`);
            fixedCount++;
          } else {
            console.log(`  Could not find candidate for attempt ${attempt._id}`);
          }
        }
      }
    }
    
    console.log(`\nFixed ${fixedCount} assessment attempts`);
    
    // 2. Verify the fix
    console.log('\n=== VERIFICATION ===');
    const attemptsAfterFix = await AssessmentAttempt.find({
      status: { $in: ['completed', 'expired'] }
    }).populate('candidateId', 'name email');
    
    const stillMissing = attemptsAfterFix.filter(attempt => !attempt.candidateId);
    console.log(`Completed attempts still missing candidate data: ${stillMissing.length}`);
    
    if (stillMissing.length > 0) {
      console.log('Still missing:');
      stillMissing.forEach(attempt => {
        console.log(`- Attempt ID: ${attempt._id}, Application ID: ${attempt.applicationId}`);
      });
    }
    
    console.log('\n=== FIX COMPLETE ===');
    
  } catch (error) {
    console.error('Fix error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixAssessmentCandidates();