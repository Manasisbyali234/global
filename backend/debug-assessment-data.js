const mongoose = require('mongoose');
const AssessmentAttempt = require('./models/AssessmentAttempt');
const Candidate = require('./models/Candidate');
const Application = require('./models/Application');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function debugAssessmentData() {
  try {
    console.log('=== DEBUGGING ASSESSMENT DATA ===\n');
    
    // 1. Check all assessment attempts
    const attempts = await AssessmentAttempt.find({}).populate('candidateId', 'name email');
    console.log(`Total assessment attempts: ${attempts.length}`);
    
    // 2. Check for attempts with missing candidate data
    const attemptsWithMissingCandidates = attempts.filter(attempt => !attempt.candidateId);
    console.log(`Attempts with missing candidate data: ${attemptsWithMissingCandidates.length}`);
    
    if (attemptsWithMissingCandidates.length > 0) {
      console.log('Attempts with missing candidates:');
      attemptsWithMissingCandidates.forEach(attempt => {
        console.log(`- Attempt ID: ${attempt._id}, Candidate ID: ${attempt.candidateId}, Status: ${attempt.status}`);
      });
    }
    
    // 3. Check for completed/expired attempts
    const completedAttempts = attempts.filter(attempt => 
      attempt.status === 'completed' || attempt.status === 'expired'
    );
    console.log(`\nCompleted/Expired attempts: ${completedAttempts.length}`);
    
    // 4. Show sample of completed attempts with candidate info
    console.log('\nSample completed attempts:');
    completedAttempts.slice(0, 5).forEach(attempt => {
      console.log(`- Attempt ID: ${attempt._id}`);
      console.log(`  Candidate ID: ${attempt.candidateId?._id || 'MISSING'}`);
      console.log(`  Candidate Name: ${attempt.candidateId?.name || 'N/A'}`);
      console.log(`  Candidate Email: ${attempt.candidateId?.email || 'N/A'}`);
      console.log(`  Status: ${attempt.status}`);
      console.log(`  Score: ${attempt.score}/${attempt.totalMarks}`);
      console.log(`  Violations: ${attempt.violations?.length || 0}`);
      console.log('');
    });
    
    // 5. Check if there are orphaned candidate IDs
    const candidateIds = attempts.map(attempt => attempt.candidateId?._id || attempt.candidateId).filter(Boolean);
    const uniqueCandidateIds = [...new Set(candidateIds.map(id => id.toString()))];
    console.log(`Unique candidates with attempts: ${uniqueCandidateIds.length}`);
    
    // 6. Verify candidate records exist
    const existingCandidates = await Candidate.find({
      _id: { $in: uniqueCandidateIds }
    }).select('_id name email');
    
    console.log(`Existing candidate records: ${existingCandidates.length}`);
    
    if (existingCandidates.length !== uniqueCandidateIds.length) {
      console.log('WARNING: Some candidate records are missing!');
      const existingIds = existingCandidates.map(c => c._id.toString());
      const missingIds = uniqueCandidateIds.filter(id => !existingIds.includes(id));
      console.log('Missing candidate IDs:', missingIds);
    }
    
    // 7. Check applications
    const applications = await Application.find({
      assessmentStatus: { $in: ['completed', 'in_progress'] }
    }).populate('candidateId', 'name email');
    
    console.log(`\nApplications with assessment status: ${applications.length}`);
    
    console.log('\n=== DEBUG COMPLETE ===');
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugAssessmentData();