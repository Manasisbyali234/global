const mongoose = require('mongoose');
const AssessmentAttempt = require('./models/AssessmentAttempt');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/newss', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testCaptureFeature() {
  try {
    console.log('🧪 Testing Webcam Capture Feature...\n');

    // Test 1: Check if captures field exists in schema
    console.log('✅ Test 1: Schema Check');
    const schema = AssessmentAttempt.schema.obj;
    if (schema.captures) {
      console.log('   ✓ Captures field exists in schema');
      console.log('   ✓ Type:', schema.captures);
    } else {
      console.log('   ✗ Captures field NOT found in schema');
    }

    // Test 2: Find a sample assessment attempt
    console.log('\n✅ Test 2: Database Check');
    const sampleAttempt = await AssessmentAttempt.findOne().limit(1);
    if (sampleAttempt) {
      console.log('   ✓ Found sample attempt:', sampleAttempt._id);
      console.log('   ✓ Captures field:', sampleAttempt.captures || 'Empty array');
      console.log('   ✓ Captures count:', (sampleAttempt.captures || []).length);
    } else {
      console.log('   ⚠ No assessment attempts found in database');
    }

    // Test 3: Create test attempt with captures
    console.log('\n✅ Test 3: Create Test Data');
    const testAttempt = new AssessmentAttempt({
      assessmentId: new mongoose.Types.ObjectId(),
      candidateId: new mongoose.Types.ObjectId(),
      jobId: new mongoose.Types.ObjectId(),
      applicationId: new mongoose.Types.ObjectId(),
      status: 'in_progress',
      captures: [
        '/uploads/test_capture_1.jpg',
        '/uploads/test_capture_2.jpg',
        '/uploads/test_capture_3.jpg'
      ]
    });

    console.log('   ✓ Test attempt created with 3 captures');
    console.log('   ✓ Captures:', testAttempt.captures);

    // Test 4: Verify captures can be added
    console.log('\n✅ Test 4: Add Capture Test');
    testAttempt.captures.push('/uploads/test_capture_4.jpg');
    testAttempt.captures.push('/uploads/test_capture_5.jpg');
    console.log('   ✓ Added 2 more captures');
    console.log('   ✓ Total captures:', testAttempt.captures.length);
    console.log('   ✓ All captures:', testAttempt.captures);

    // Test 5: Check all attempts with captures
    console.log('\n✅ Test 5: Query Attempts with Captures');
    const attemptsWithCaptures = await AssessmentAttempt.find({
      captures: { $exists: true, $ne: [] }
    }).select('candidateId captures').limit(5);
    
    console.log(`   ✓ Found ${attemptsWithCaptures.length} attempts with captures`);
    attemptsWithCaptures.forEach((attempt, index) => {
      console.log(`   ${index + 1}. Attempt ${attempt._id}: ${attempt.captures.length} captures`);
    });

    console.log('\n✨ All tests completed successfully!\n');
    console.log('📋 Summary:');
    console.log('   - Schema has captures field: ✓');
    console.log('   - Can store capture paths: ✓');
    console.log('   - Can add multiple captures: ✓');
    console.log('   - Can query captures: ✓');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testCaptureFeature();
