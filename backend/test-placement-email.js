const mongoose = require('mongoose');
const { sendPlacementCandidateWelcomeEmail } = require('./utils/emailService');
require('dotenv').config();

// Test the placement candidate welcome email
async function testPlacementEmail() {
  try {
    console.log('Testing placement candidate welcome email...');
    
    await sendPlacementCandidateWelcomeEmail(
      'test@example.com',
      'John Doe',
      'testpass123',
      'Dr. Smith',
      'ABC University'
    );
    
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Error sending test email:', error);
  }
}

// Run the test
testPlacementEmail();