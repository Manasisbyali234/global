require('dotenv').config();

async function testInterviewEmails() {
  console.log('=== Testing Interview Email System ===\n');
  
  // Email configuration
  console.log('Email Configuration:');
  console.log('- Host:', process.env.EMAIL_HOST || 'smtp.gmail.com');
  console.log('- Port:', process.env.EMAIL_PORT || 587);
  console.log('- User:', process.env.EMAIL_USER);
  console.log('- Pass:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
  console.log('');

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Test 1: Initial Interview Invitation
  console.log('Test 1: Sending Interview Invitation Email...');
  try {
    const inviteEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: 'TEST - Interview Invitation - Software Engineer',
      html: `
        <h2>Interview Invitation</h2>
        <p>Dear Test Candidate,</p>
        <p>We would like to invite you for an interview for the position of <strong>Software Engineer</strong>.</p>
        <p><strong>Preferred Date:</strong> January 15, 2025</p>
        <p><strong>Preferred Time:</strong> 10:00 AM</p>
        <p><strong>Meeting Link:</strong> <a href="https://meet.google.com/test">https://meet.google.com/test</a></p>
        <p><strong>Instructions:</strong> Please ensure stable internet connection</p>
        <p>Please log in to your dashboard to confirm your availability or suggest alternative time slots.</p>
        <p style="margin-top: 20px;">
          <a href="http://localhost:3000/candidate/status" 
             style="background-color: #ff6600; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Respond to Invitation
          </a>
        </p>
        <p>Best regards,<br>Test Company</p>
      `
    };

    const inviteResult = await transporter.sendMail(inviteEmail);
    console.log('✓ Interview Invitation sent successfully!');
    console.log('  Message ID:', inviteResult.messageId);
    console.log('');
  } catch (error) {
    console.log('✗ Failed to send Interview Invitation');
    console.log('  Error:', error.message);
    console.log('');
  }

  // Test 2: Candidate Response Notification to Employer
  console.log('Test 2: Sending Candidate Response Notification to Employer...');
  try {
    const responseEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'TEST - Interview Response - Software Engineer',
      html: `
        <h2>Candidate Interview Response</h2>
        <p>Dear Test Company,</p>
        <p>The candidate <strong>John Doe</strong> has responded to your interview invitation for the position of <strong>Software Engineer</strong>.</p>
        <p><strong>Candidate's Available Date:</strong> January 16, 2025</p>
        <p><strong>Candidate's Available Time:</strong> 2:00 PM</p>
        <p><strong>Message:</strong> I'm available on Tuesday afternoon. The proposed time on Monday doesn't work for me.</p>
        <p>Please log in to your dashboard to confirm the interview schedule.</p>
        <p>Best regards,<br>Job Portal Team</p>
      `
    };

    const responseResult = await transporter.sendMail(responseEmail);
    console.log('✓ Candidate Response Notification sent successfully!');
    console.log('  Message ID:', responseResult.messageId);
    console.log('');
  } catch (error) {
    console.log('✗ Failed to send Candidate Response Notification');
    console.log('  Error:', error.message);
    console.log('');
  }

  // Test 3: Final Confirmation Email to Candidate
  console.log('Test 3: Sending Final Confirmation Email to Candidate...');
  try {
    const confirmEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'TEST - ✓ Interview Confirmed - Software Engineer',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #28a745; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #28a745; margin: 0;">✓ Interview Confirmed!</h2>
          </div>
          <p style="font-size: 16px; color: #333;">Dear <strong>Test Candidate</strong>,</p>
          <p style="font-size: 16px; color: #333;">Great news! We are pleased to confirm your interview for the position of <strong style="color: #ff6600;">Software Engineer</strong> at <strong>Test Company</strong>.</p>
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin-top: 0;">Interview Details:</h3>
            <p style="margin: 10px 0; font-size: 16px;"><strong>📅 Date:</strong> Tuesday, January 16, 2025</p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>🕐 Time:</strong> 2:00 PM</p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>🔗 Meeting Link:</strong> <a href="https://meet.google.com/test" style="color: #ff6600;">https://meet.google.com/test</a></p>
          </div>
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">📋 Important Instructions:</h4>
            <p style="color: #856404; margin: 0;">Please ensure stable internet connection</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #333; margin-top: 0;">💡 Preparation Tips:</h4>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>Join the meeting 5 minutes early</li>
              <li>Ensure stable internet connection</li>
              <li>Test your camera and microphone beforehand</li>
              <li>Keep your resume and relevant documents ready</li>
              <li>Prepare questions about the role and company</li>
            </ul>
          </div>
          <p style="font-size: 16px; color: #333;">We are excited to meet you and discuss this opportunity further. If you have any questions or need to reschedule, please contact us immediately.</p>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; margin: 5px 0;">Best regards,</p>
            <p style="color: #333; font-weight: bold; margin: 5px 0;">Test Company</p>
          </div>
        </div>
      `
    };

    const confirmResult = await transporter.sendMail(confirmEmail);
    console.log('✓ Final Confirmation Email sent successfully!');
    console.log('  Message ID:', confirmResult.messageId);
    console.log('');
  } catch (error) {
    console.log('✗ Failed to send Final Confirmation Email');
    console.log('  Error:', error.message);
    console.log('');
  }

  console.log('=== Email Testing Complete ===');
  console.log('\nCheck your inbox at:', process.env.EMAIL_USER);
  console.log('You should receive 3 test emails if all tests passed.');
}

// Run the test
testInterviewEmails()
  .then(() => {
    console.log('\n✓ All tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  });
