const { sendPlacementCandidateWelcomeEmail } = require('./utils/emailService');

// Test email sending
async function testEmailSending() {
  try {
    console.log('Testing email sending...');
    
    await sendPlacementCandidateWelcomeEmail(
      'test@example.com',
      'Test Student',
      'testpass123',
      'Test Placement Officer',
      'Test College'
    );
    
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Email sending failed:', error);
  }
}

testEmailSending();