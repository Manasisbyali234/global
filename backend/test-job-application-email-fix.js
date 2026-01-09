const { sendJobApplicationConfirmationEmail } = require('./utils/emailService');

// Test the job application confirmation email with proper interview rounds
async function testJobApplicationEmailFix() {
  try {
    console.log('Testing job application confirmation email with proper interview rounds...');
    
    // Mock job details with interview rounds (similar to what would come from database)
    const mockJobDetails = {
      assessmentEnabled: false,
      assessmentId: null,
      assessmentStartDate: null,
      assessmentEndDate: null,
      assessmentStartTime: null,
      assessmentEndTime: null,
      interviewRoundOrder: ['round1', 'round2', 'round3'],
      interviewRoundTypes: {
        'round1': 'technical',
        'round2': 'hr',
        'round3': 'final'
      },
      interviewRoundDetails: {
        'round1': {
          description: 'Technical coding interview focusing on data structures and algorithms',
          fromDate: new Date('2026-01-10'),
          toDate: new Date('2026-01-15'),
          time: '10:00 AM - 12:00 PM'
        },
        'round2': {
          description: 'HR interview to assess cultural fit and communication skills',
          fromDate: new Date('2026-01-16'),
          toDate: new Date('2026-01-20'),
          time: '2:00 PM - 3:00 PM'
        },
        'round3': {
          description: 'Final round with senior management',
          fromDate: new Date('2026-01-21'),
          toDate: new Date('2026-01-25'),
          time: '11:00 AM - 12:30 PM'
        }
      },
      interviewScheduled: true
    };
    
    await sendJobApplicationConfirmationEmail(
      'test@example.com', // candidate email
      'John Doe', // candidate name
      'Full Stack Developer', // job title
      'TechCorp Inc.', // company name
      new Date(), // application date
      mockJobDetails // job details with proper interview rounds
    );
    
    console.log('✅ Job application confirmation email sent successfully with proper interview rounds!');
    console.log('📧 Check the email to verify that it shows:');
    console.log('   - Round 1: Technical Round');
    console.log('   - Round 2: HR Round');
    console.log('   - Round 3: Final Round');
    console.log('   Instead of the default "Technical Assessment"');
    
  } catch (error) {
    console.error('❌ Failed to send job application confirmation email:', error);
  }
}

// Test with assessment enabled
async function testJobApplicationEmailWithAssessment() {
  try {
    console.log('\nTesting job application confirmation email with assessment...');
    
    const mockJobDetailsWithAssessment = {
      assessmentEnabled: true,
      assessmentId: 'assessment123',
      assessmentStartDate: new Date('2026-01-05'),
      assessmentEndDate: new Date('2026-01-07'),
      assessmentStartTime: '09:00',
      assessmentEndTime: '18:00',
      interviewRoundOrder: ['assessment1', 'round1', 'round2'],
      interviewRoundTypes: {
        'assessment1': 'assessment',
        'round1': 'technical',
        'round2': 'hr'
      },
      interviewRoundDetails: {
        'round1': {
          description: 'Technical interview after assessment',
          fromDate: new Date('2026-01-10'),
          toDate: new Date('2026-01-15'),
          time: '10:00 AM - 11:30 AM'
        },
        'round2': {
          description: 'Final HR interview',
          fromDate: new Date('2026-01-16'),
          toDate: new Date('2026-01-20'),
          time: '2:00 PM - 3:00 PM'
        }
      },
      interviewScheduled: true
    };
    
    await sendJobApplicationConfirmationEmail(
      'test2@example.com',
      'Jane Smith',
      'Software Engineer',
      'InnovateTech',
      new Date(),
      mockJobDetailsWithAssessment
    );
    
    console.log('✅ Job application confirmation email with assessment sent successfully!');
    console.log('📧 Check the email to verify that it shows:');
    console.log('   - Round 1: Technical Assessment (with dates)');
    console.log('   - Round 2: Technical Round');
    console.log('   - Round 3: HR Round');
    
  } catch (error) {
    console.error('❌ Failed to send job application confirmation email with assessment:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testJobApplicationEmailFix()
    .then(() => testJobApplicationEmailWithAssessment())
    .then(() => {
      console.log('\n🎉 All tests completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testJobApplicationEmailFix, testJobApplicationEmailWithAssessment };