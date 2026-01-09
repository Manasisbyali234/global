const mongoose = require('mongoose');
const AssessmentAttempt = require('./models/AssessmentAttempt');
const Candidate = require('./models/Candidate');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function addTestViolations() {
  try {
    console.log('Adding test violations to recent assessment attempts...');
    
    // Get the 3 most recent completed attempts
    const recentAttempts = await AssessmentAttempt.find({ status: 'completed' })
      .populate('candidateId', 'name email')
      .sort({ createdAt: -1 })
      .limit(3);
    
    console.log(`Found ${recentAttempts.length} recent completed attempts`);
    
    for (let i = 0; i < recentAttempts.length; i++) {
      const attempt = recentAttempts[i];
      const violationCount = i + 1; // First attempt gets 1 violation, second gets 2, etc.
      
      console.log(`Adding ${violationCount} violations to attempt ${attempt._id} (${attempt.candidateId?.name || 'Unknown'})`);
      
      const testViolations = [];
      for (let j = 0; j < violationCount; j++) {
        const violationTypes = ['tab_switch', 'window_minimize', 'copy_paste', 'right_click'];
        const violationType = violationTypes[j % violationTypes.length];
        
        testViolations.push({
          type: violationType,
          timestamp: new Date(Date.now() - (j * 60000)), // Spread violations over time
          details: `Test ${violationType.replace('_', ' ')} violation ${j + 1}`
        });
      }
      
      attempt.violations = testViolations;
      await attempt.save();
      
      console.log(`✓ Added ${violationCount} violations to attempt ${attempt._id}`);
    }
    
    // Verify the changes
    console.log('\nVerifying violations were added:');
    const updatedAttempts = await AssessmentAttempt.find({ status: 'completed' })
      .populate('candidateId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id candidateId violations');
    
    updatedAttempts.forEach(attempt => {
      console.log(`- ${attempt._id}: ${attempt.candidateId?.name || 'Unknown'} - ${attempt.violations?.length || 0} violations`);
    });
    
    console.log('\nTest violations added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding test violations:', error);
    process.exit(1);
  }
}

addTestViolations();