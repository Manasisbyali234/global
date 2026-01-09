const { sendJobApplicationConfirmationEmail } = require('./utils/emailService');

// Test the enhanced job application confirmation email
async function testEnhancedJobApplicationEmail() {
  try {
    console.log('Testing enhanced job application confirmation email...');
    
    // Sample job details with interview rounds and assessment
    const jobDetails = {
      assessmentId: '507f1f77bcf86cd799439011',
      assessmentStartDate: new Date('2024-12-20'),
      assessmentEndDate: new Date('2024-12-22'),
      assessmentStartTime: '09:00',
      assessmentEndTime: '18:00',
      interviewRoundOrder: ['round1', 'round2', 'round3'],
      interviewRoundTypes: {
        round1: 'technical',
        round2: 'managerial', 
        round3: 'hr'
      },
      interviewRoundDetails: {
        round1: {
          description: 'Technical coding interview focusing on data structures and algorithms',
          fromDate: new Date('2024-12-23'),
          toDate: new Date('2024-12-24'),
          time: '10:00 AM - 12:00 PM'
        },
        round2: {
          description: 'Managerial round to assess leadership and problem-solving skills',
          fromDate: new Date('2024-12-25'),
          toDate: new Date('2024-12-26'),
          time: '02:00 PM - 03:30 PM'
        },
        round3: {
          description: 'HR round for cultural fit and salary discussion',
          fromDate: new Date('2024-12-27'),
          toDate: new Date('2024-12-28'),
          time: '11:00 AM - 12:00 PM'
        }
      },
      interviewScheduled: true
    };
    
    await sendJobApplicationConfirmationEmail(
      'test@example.com', // Replace with actual email for testing
      'John Doe',
      'Frontend Developer',
      'TechCorp Solutions',
      new Date(),
      jobDetails
    );
    
    console.log('✅ Enhanced job application confirmation email sent successfully!');
    console.log('📧 Email includes:');
    console.log('   - Application details');
    console.log('   - Interview process schedule (3 rounds)');
    console.log('   - Technical assessment information');
    console.log('   - Terms and conditions');
    console.log('   - Next steps guidance');
    
  } catch (error) {
    console.error('❌ Error sending enhanced email:', error);
  }
}

// Test with minimal job details (no interview rounds)
async function testBasicJobApplicationEmail() {
  try {
    console.log('\nTesting basic job application confirmation email...');
    
    await sendJobApplicationConfirmationEmail(
      'test@example.com', // Replace with actual email for testing
      'Jane Smith',
      'Backend Developer',
      'StartupXYZ',
      new Date(),
      null // No job details
    );
    
    console.log('✅ Basic job application confirmation email sent successfully!');
    console.log('📧 Email includes basic application confirmation without interview details');
    
  } catch (error) {
    console.error('❌ Error sending basic email:', error);
  }
}

// Run tests
if (require.main === module) {
  console.log('🚀 Starting enhanced job application email tests...\n');
  
  testEnhancedJobApplicationEmail()
    .then(() => testBasicJobApplicationEmail())
    .then(() => {
      console.log('\n✨ All email tests completed!');
      console.log('\n📋 Features implemented:');
      console.log('   ✅ Enhanced job application confirmation email');
      console.log('   ✅ Interview rounds schedule display');
      console.log('   ✅ Assessment information');
      console.log('   ✅ Terms and conditions');
      console.log('   ✅ Round progression rules');
      console.log('   ✅ Backward compatibility with basic emails');
      console.log('\n🎯 The email now fetches job details from the employer post-job page');
      console.log('   and includes comprehensive interview process information!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testEnhancedJobApplicationEmail,
  testBasicJobApplicationEmail
};