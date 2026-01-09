const mongoose = require('mongoose');
const AssessmentAttempt = require('./models/AssessmentAttempt');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function testCaptureEndpoint() {
  try {
    console.log('\n🧪 Testing Capture Endpoint...\n');

    // Find a recent assessment attempt
    const attempt = await AssessmentAttempt.findOne({ status: 'in_progress' })
      .sort({ createdAt: -1 });

    if (!attempt) {
      console.log('⚠️  No in-progress assessment attempts found');
      console.log('💡 Start an assessment as a candidate first');
      process.exit(0);
    }

    console.log('📋 Found Assessment Attempt:');
    console.log(`   ID: ${attempt._id}`);
    console.log(`   Candidate: ${attempt.candidateId}`);
    console.log(`   Status: ${attempt.status}`);
    console.log(`   Current Captures: ${attempt.captures?.length || 0}`);

    // Check if captures field exists
    if (!attempt.captures) {
      console.log('\n⚠️  Captures field not initialized');
      attempt.captures = [];
      await attempt.save();
      console.log('✅ Initialized captures array');
    }

    console.log('\n📝 Capture Endpoint Details:');
    console.log('   POST /api/candidate/assessments/capture');
    console.log('   Headers: Authorization: Bearer <candidateToken>');
    console.log('   Body: FormData with:');
    console.log('     - capture: <image file>');
    console.log('     - attemptId: ' + attempt._id);
    console.log('     - captureIndex: 0');

    console.log('\n✅ Test Complete!');
    console.log('\n📌 Next Steps:');
    console.log('   1. Open test-camera-quick.html in browser');
    console.log('   2. Login as candidate and start an assessment');
    console.log('   3. Use the test page to capture and upload images');

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

testCaptureEndpoint();
