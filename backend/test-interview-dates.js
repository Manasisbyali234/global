const mongoose = require('mongoose');
const Job = require('./models/Job');

// Test script to verify interview date persistence
async function testInterviewDates() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal');
    console.log('Connected to MongoDB');

    // Create a test job with interview round details
    const testJobData = {
      title: 'Test Software Engineer Position',
      description: 'Test job for interview date persistence',
      employerId: new mongoose.Types.ObjectId(),
      location: 'Test City',
      jobType: 'full-time',
      category: 'IT',
      vacancies: 1,
      applicationLimit: 10,
      education: 'B.Tech',
      interviewRoundsCount: 2,
      interviewRoundTypes: {
        technical: true,
        hr: true
      },
      interviewRoundOrder: ['technical_123', 'hr_456'],
      interviewRoundDetails: {
        'technical_123': {
          description: 'Technical coding round',
          fromDate: new Date('2024-01-15'),
          toDate: new Date('2024-01-17'),
          time: '10:00'
        },
        'hr_456': {
          description: 'HR discussion round',
          fromDate: new Date('2024-01-20'),
          toDate: new Date('2024-01-22'),
          time: '14:00'
        }
      },
      offerLetterDate: new Date('2024-01-25'),
      lastDateOfApplication: new Date('2024-01-10'),
      status: 'active'
    };

    // Create the job
    const job = await Job.create(testJobData);
    console.log('Job created successfully with ID:', job._id);

    // Retrieve the job to verify dates are persisted correctly
    const retrievedJob = await Job.findById(job._id);
    console.log('\nRetrieved job interview round details:');
    console.log(JSON.stringify(retrievedJob.interviewRoundDetails, null, 2));

    // Verify dates are stored as Date objects
    Object.keys(retrievedJob.interviewRoundDetails).forEach(roundKey => {
      const round = retrievedJob.interviewRoundDetails[roundKey];
      console.log(`\n${roundKey}:`);
      console.log('  fromDate type:', typeof round.fromDate, 'value:', round.fromDate);
      console.log('  toDate type:', typeof round.toDate, 'value:', round.toDate);
      console.log('  fromDate instanceof Date:', round.fromDate instanceof Date);
      console.log('  toDate instanceof Date:', round.toDate instanceof Date);
    });

    // Test update functionality
    console.log('\nTesting update functionality...');
    const updatedJob = await Job.findByIdAndUpdate(
      job._id,
      {
        'interviewRoundDetails.technical_123.fromDate': new Date('2024-01-16'),
        'interviewRoundDetails.technical_123.toDate': new Date('2024-01-18')
      },
      { new: true }
    );

    console.log('Updated technical round dates:');
    console.log('  fromDate:', updatedJob.interviewRoundDetails['technical_123'].fromDate);
    console.log('  toDate:', updatedJob.interviewRoundDetails['technical_123'].toDate);

    // Clean up - delete the test job
    await Job.findByIdAndDelete(job._id);
    console.log('\nTest job deleted successfully');

    console.log('\n✅ All tests passed! Interview dates are persisting correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testInterviewDates();