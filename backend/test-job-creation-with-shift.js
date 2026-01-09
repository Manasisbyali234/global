// Test script to verify job creation with shift field
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newss', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Job = require('./models/Job');

async function testJobCreationWithShift() {
  try {
    console.log('Testing job creation with shift field...');
    
    // Test job data similar to what frontend sends
    const testJobData = {
      title: 'Test Software Engineer',
      description: 'Test job description',
      employerId: new mongoose.Types.ObjectId(),
      location: 'Bangalore',
      category: 'IT',
      typeOfEmployment: 'permanent',
      shift: 'day-shift', // Frontend sends this value
      workMode: 'work-from-home',
      jobType: 'full-time',
      vacancies: 1,
      applicationLimit: 10,
      education: 'B.Tech',
      interviewRoundsCount: 1,
      offerLetterDate: new Date(),
      lastDateOfApplication: new Date()
    };
    
    console.log('Creating job with shift:', testJobData.shift);
    const job = await Job.create(testJobData);
    console.log('✓ Job created successfully with shift:', job.shift);
    
    // Test updating shift
    const updatedJob = await Job.findByIdAndUpdate(
      job._id,
      { shift: 'night-shift' },
      { new: true }
    );
    console.log('✓ Job updated with night-shift:', updatedJob.shift);
    
    // Test rotational shift
    const rotationalJob = await Job.findByIdAndUpdate(
      job._id,
      { shift: 'rotational' },
      { new: true }
    );
    console.log('✓ Job updated with rotational shift:', rotationalJob.shift);
    
    // Clean up
    await Job.findByIdAndDelete(job._id);
    console.log('✓ Test job cleaned up');
    
    console.log('\n✅ Job creation with shift field test passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    mongoose.connection.close();
  }
}

testJobCreationWithShift();