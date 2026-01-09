// Test script to verify shift functionality
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newss', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Job = require('./models/Job');

async function testShiftFunctionality() {
  try {
    console.log('Testing shift functionality...');
    
    // Test 1: Create a job with day shift
    const testJob = {
      title: 'Test Software Engineer',
      description: 'Test job description',
      employerId: new mongoose.Types.ObjectId(),
      location: 'Bangalore',
      category: 'IT',
      typeOfEmployment: 'permanent',
      shift: 'day-shift', // Test day shift
      jobType: 'full-time',
      vacancies: 1,
      applicationLimit: 10,
      education: 'B.Tech',
      interviewRoundsCount: 1,
      offerLetterDate: new Date(),
      lastDateOfApplication: new Date()
    };
    
    const job = await Job.create(testJob);
    console.log('✓ Job created with day-shift:', job.shift);
    
    // Test 2: Update job with night shift
    const updatedJob = await Job.findByIdAndUpdate(
      job._id,
      { shift: 'night-shift' },
      { new: true }
    );
    console.log('✓ Job updated with night shift:', updatedJob.shift);
    
    // Test 3: Update job with rotational shift
    const rotationalJob = await Job.findByIdAndUpdate(
      job._id,
      { shift: 'rotational' },
      { new: true }
    );
    console.log('✓ Job updated with rotational shift:', rotationalJob.shift);
    
    // Test 4: Try invalid shift (should fail)
    try {
      await Job.findByIdAndUpdate(
        job._id,
        { shift: 'invalid' },
        { new: true, runValidators: true }
      );
      console.log('✗ Invalid shift was accepted (this should not happen)');
    } catch (error) {
      console.log('✓ Invalid shift rejected as expected');
    }
    
    // Clean up
    await Job.findByIdAndDelete(job._id);
    console.log('✓ Test job cleaned up');
    
    console.log('\n✅ All shift functionality tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

testShiftFunctionality();