const mongoose = require('mongoose');
const AssessmentAttempt = require('./models/AssessmentAttempt');
const Candidate = require('./models/Candidate');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkViolationsData() {
  try {
    console.log('Checking violations data in assessment attempts...');
    
    // Get all assessment attempts
    const allAttempts = await AssessmentAttempt.find({})
      .populate('candidateId', 'name email')
      .select('_id candidateId violations status score percentage');
    
    console.log(`Total assessment attempts: ${allAttempts.length}`);
    
    // Check for attempts with violations
    const attemptsWithViolations = allAttempts.filter(a => a.violations && a.violations.length > 0);
    console.log(`Attempts with violations: ${attemptsWithViolations.length}`);
    
    if (attemptsWithViolations.length > 0) {
      console.log('\nAttempts with violations:');
      attemptsWithViolations.forEach(attempt => {
        console.log(`- ${attempt._id}: ${attempt.candidateId?.name || 'Unknown'} - ${attempt.violations.length} violations`);
        attempt.violations.forEach((v, i) => {
          console.log(`  ${i + 1}. ${v.type} at ${v.timestamp} - ${v.details}`);
        });
      });
    } else {
      console.log('\nNo attempts with violations found. Let me create a test violation...');
      
      // Find a completed attempt to add test violations
      const completedAttempt = await AssessmentAttempt.findOne({ status: 'completed' });
      
      if (completedAttempt) {
        console.log(`Adding test violations to attempt: ${completedAttempt._id}`);
        
        completedAttempt.violations = [
          {
            type: 'tab_switch',
            timestamp: new Date(),
            details: 'User switched to another tab during assessment'
          },
          {
            type: 'window_minimize',
            timestamp: new Date(),
            details: 'User minimized the browser window'
          }
        ];
        
        await completedAttempt.save();
        console.log('Test violations added successfully!');
      } else {
        console.log('No completed attempts found to add test violations');
      }
    }
    
    // Show sample of recent attempts
    console.log('\nRecent attempts (last 5):');
    const recentAttempts = await AssessmentAttempt.find({})
      .populate('candidateId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id candidateId violations status score percentage createdAt');
    
    recentAttempts.forEach(attempt => {
      console.log(`- ${attempt._id}: ${attempt.candidateId?.name || 'Unknown'} - Status: ${attempt.status}, Violations: ${attempt.violations?.length || 0}, Score: ${attempt.score || 0}`);
    });
    
    console.log('\nCheck completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error checking violations data:', error);
    process.exit(1);
  }
}

checkViolationsData();