const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailAndFix() {
  console.log('=== EMAIL CONFIGURATION TEST ===');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email configuration is missing!');
    console.log('\n📋 To fix this issue:');
    console.log('1. Make sure EMAIL_USER and EMAIL_PASS are set in .env file');
    console.log('2. For Gmail, use an App Password instead of regular password');
    console.log('3. Enable 2-Factor Authentication on Gmail');
    console.log('4. Generate App Password: https://myaccount.google.com/apppasswords');
    return;
  }

  const transporter = nodemailer.createTransport({
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
    console.log('\n🔍 Testing email server connection...');
    await transporter.verify();
    console.log('✅ Email server connection successful!');
    
    console.log('\n📧 Sending test email...');
    const result = await transporter.sendMail({
      from: `"TaleGlobal Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: '✅ Interview Invite System Test - SUCCESS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #28a745; border-radius: 10px;">
          <h2 style="color: #28a745; text-align: center;">✅ Email System Working!</h2>
          <p>This test email confirms that the interview invite system is working correctly.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Email Service: Gmail SMTP</li>
            <li>From: ${process.env.EMAIL_USER}</li>
            <li>Test Time: ${new Date().toLocaleString()}</li>
          </ul>
          <p style="color: #28a745; font-weight: bold;">✅ Interview invites should now work properly!</p>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('\n🎉 EMAIL SYSTEM IS WORKING CORRECTLY!');
    console.log('The interview invite feature should now work properly.');
    
  } catch (error) {
    console.error('\n❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 AUTHENTICATION ERROR - How to fix:');
      console.log('1. ❌ Regular Gmail password won\'t work with 2FA enabled');
      console.log('2. ✅ You need to use Gmail App Password instead');
      console.log('3. 📱 Enable 2-Factor Authentication on your Gmail account');
      console.log('4. 🔑 Generate App Password: https://myaccount.google.com/apppasswords');
      console.log('5. 📝 Replace EMAIL_PASS in .env with the 16-character App Password');
      console.log('\nExample .env configuration:');
      console.log('EMAIL_USER=your-email@gmail.com');
      console.log('EMAIL_PASS=abcd efgh ijkl mnop  (16-character App Password)');
    }
    
    if (error.code === 'ECONNECTION') {
      console.log('\n🌐 CONNECTION ERROR - How to fix:');
      console.log('1. Check your internet connection');
      console.log('2. Make sure Gmail SMTP is not blocked by firewall');
      console.log('3. Try again in a few minutes');
    }
    
    if (error.code === 'EMESSAGE') {
      console.log('\n📧 MESSAGE ERROR - How to fix:');
      console.log('1. Check email format and content');
      console.log('2. Make sure recipient email is valid');
    }
  }
}

testEmailAndFix();