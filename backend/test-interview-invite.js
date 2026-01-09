const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Test the interview invite functionality
async function testInterviewInvite() {
  console.log('=== TESTING INTERVIEW INVITE FUNCTIONALITY ===');
  
  // Test email configuration
  console.log('\n1. Testing Email Configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email configuration missing!');
    return;
  }
  
  // Test nodemailer
  console.log('\n2. Testing Nodemailer...');
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
    await transporter.verify();
    console.log('✅ Nodemailer connection successful');
  } catch (error) {
    console.error('❌ Nodemailer connection failed:', error.message);
    return;
  }
  
  // Test database connection
  console.log('\n3. Testing Database Connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return;
  }
  
  // Test sending a sample interview invite
  console.log('\n4. Testing Interview Invite Email...');
  const sampleEmailData = {
    candidateName: 'Test Candidate',
    candidateEmail: process.env.EMAIL_USER, // Send to self for testing
    jobTitle: 'Software Developer',
    companyName: 'TaleGlobal',
    interviewDate: '2024-01-15',
    interviewTime: '10:00 AM',
    meetingLink: 'https://meet.google.com/test-link',
    instructions: 'Please join 5 minutes early and have your resume ready.'
  };
  
  const mailOptions = {
    from: `"${sampleEmailData.companyName}" <${process.env.EMAIL_USER}>`,
    to: sampleEmailData.candidateEmail,
    subject: `📅 Interview Invitation - ${sampleEmailData.jobTitle} at ${sampleEmailData.companyName}`,
    html: `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-top: 4px solid #ff6600;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff6600; margin: 0; font-size: 28px;">📅 Interview Invitation</h1>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear <strong>${sampleEmailData.candidateName}</strong>,</p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We are pleased to invite you for an interview for the position of <strong style="color: #ff6600;">${sampleEmailData.jobTitle}</strong> at <strong>${sampleEmailData.companyName}</strong>.
          </p>
          
          <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6600;">
            <h3 style="color: #e65100; margin: 0 0 15px 0; font-size: 18px;">📋 Interview Details:</h3>
            <p style="margin: 10px 0; font-size: 16px; color: #bf360c;"><strong>📅 Preferred Date:</strong> ${new Date(sampleEmailData.interviewDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 10px 0; font-size: 16px; color: #bf360c;"><strong>🕐 Preferred Time:</strong> ${sampleEmailData.interviewTime}</p>
            <p style="margin: 10px 0; font-size: 16px; color: #bf360c;"><strong>🔗 Meeting Link:</strong> <a href="${sampleEmailData.meetingLink}" style="color: #ff6600; text-decoration: none;">${sampleEmailData.meetingLink}</a></p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">📋 Important Instructions:</h4>
            <p style="color: #856404; margin: 0; font-size: 14px;">${sampleEmailData.instructions}</p>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e9ecef;">
            <p style="color: #6c757d; font-size: 16px; margin: 0 0 5px 0; font-weight: 600;">Best regards,</p>
            <p style="color: #ff6600; font-size: 18px; margin: 0 0 5px 0; font-weight: 700;">${sampleEmailData.companyName}</p>
            <p style="color: #6c757d; font-size: 14px; margin: 0;">🌟 Connecting Talent with Opportunities 🌟</p>
          </div>
        </div>
      </div>
    `
  };
  
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Interview invite email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Sent to:', sampleEmailData.candidateEmail);
  } catch (error) {
    console.error('❌ Failed to send interview invite:', error.message);
    console.error('Error details:', error);
  }
  
  console.log('\n=== TEST COMPLETE ===');
  console.log('If the email was sent successfully, the interview invite feature should work in the application.');
  
  await mongoose.disconnect();
}

testInterviewInvite().catch(console.error);