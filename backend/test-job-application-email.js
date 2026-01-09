const { sendJobApplicationConfirmationEmail } = require('./utils/emailService');

// Test the job application confirmation email
async function testJobApplicationEmail() {
  try {
    console.log('Testing job application confirmation email...');
    
    await sendJobApplicationConfirmationEmail(
      'test@example.com', // candidate email
      'John Doe', // candidate name
      'Software Developer', // job title
      'TechCorp Inc.', // company name
      new Date() // application date
    );
    
    console.log('✅ Job application confirmation email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send job application confirmation email:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testJobApplicationEmail();
}

module.exports = { testJobApplicationEmail };