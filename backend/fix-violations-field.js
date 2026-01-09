const mongoose = require('mongoose');
const AssessmentAttempt = require('./models/AssessmentAttempt');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixViolationsField() {
  try {
    console.log('Checking assessment attempts for missing violations field...');
    
    // Find all assessment attempts that don't have violations field or have null violations
    const attemptsWithoutViolations = await AssessmentAttempt.find({
      $or: [
        { violations: { $exists: false } },
        { violations: null },
        { violations: { $not: { $type: "array" } } }
      ]
    });
    
    console.log(`Found ${attemptsWithoutViolations.length} attempts without proper violations field`);
    
    if (attemptsWithoutViolations.length > 0) {
      // Update all attempts to have an empty violations array
      const result = await AssessmentAttempt.updateMany(
        {
          $or: [
            { violations: { $exists: false } },
            { violations: null },
            { violations: { $not: { $type: "array" } } }
          ]
        },
        { $set: { violations: [] } }
      );
      
      console.log(`Updated ${result.modifiedCount} assessment attempts with empty violations array`);
    }
    
    // Verify the fix
    const allAttempts = await AssessmentAttempt.find({}).select('_id violations');
    console.log(`Total attempts: ${allAttempts.length}`);
    
    const attemptsWithViolations = allAttempts.filter(a => Array.isArray(a.violations));
    console.log(`Attempts with proper violations array: ${attemptsWithViolations.length}`);
    
    // Show some sample data
    const sampleAttempts = await AssessmentAttempt.find({}).limit(5).select('_id violations');
    console.log('Sample attempts:');
    sampleAttempts.forEach(attempt => {
      console.log(`- Attempt ${attempt._id}: violations = ${JSON.stringify(attempt.violations)} (type: ${typeof attempt.violations}, isArray: ${Array.isArray(attempt.violations)})`);
    });
    
    console.log('Fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing violations field:', error);
    process.exit(1);
  }
}

fixViolationsField();