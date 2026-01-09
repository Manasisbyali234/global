const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
  
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    // Test the connection
    await transporter.verify();
    console.log('✓ Email server connection successful');
    
    // Send a test email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: 'Test Email - Interview Invite System',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify the interview invite system is working.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `
    });
    
    console.log('✓ Test email sent successfully');
    console.log('Message ID:', result.messageId);
    
  } catch (error) {
    console.error('✗ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check:');
      console.error('1. Email address is correct');
      console.error('2. Password is correct (use App Password for Gmail)');
      console.error('3. 2-Factor Authentication is enabled and App Password is generated');
    }
    
    if (error.code === 'ECONNECTION') {
      console.error('Connection failed. Please check internet connection.');
    }
  }
}

testEmail();