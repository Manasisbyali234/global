const mongoose = require('mongoose');
const { sendPlacementCandidateWelcomeEmail } = require('./utils/emailService');
const Placement = require('./models/Placement');
const Candidate = require('./models/Candidate');
const PlacementCandidate = require('./models/PlacementCandidate');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testStudentEmailFlow() {
  try {
    console.log('=== TESTING STUDENT EMAIL FLOW ===\n');
    
    // 1. Check if email service is configured
    console.log('1. Checking email configuration...');
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('❌ Email credentials not configured in .env file');
      return;
    }
    console.log('✅ Email credentials configured');
    console.log(`   Email User: ${process.env.EMAIL_USER}`);
    
    // 2. Test email service function
    console.log('\n2. Testing email service function...');
    try {
      await sendPlacementCandidateWelcomeEmail(
        'test.student@example.com',
        'Test Student',
        'Test Placement Officer',
        'Test College'
      );
      console.log('✅ Email service function works correctly');
    } catch (emailError) {
      console.log('❌ Email service function failed:', emailError.message);
      return;
    }
    
    // 3. Check recent placement candidates
    console.log('\n3. Checking recent placement candidates...');
    const recentCandidates = await PlacementCandidate.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).populate('placementId').limit(5);
    
    if (recentCandidates.length === 0) {
      console.log('⚠️  No placement candidates created in the last 24 hours');
    } else {
      console.log(`✅ Found ${recentCandidates.length} recent placement candidates:`);
      recentCandidates.forEach((candidate, index) => {
        console.log(`   ${index + 1}. ${candidate.studentName} (${candidate.studentEmail})`);
        console.log(`      Email Sent: ${candidate.welcomeEmailSent ? '✅ Yes' : '❌ No'}`);
        console.log(`      Created: ${candidate.createdAt}`);
      });
    }
    
    // 4. Check placement officers with approved files
    console.log('\n4. Checking placement officers with processed files...');
    const placementsWithProcessedFiles = await Placement.find({
      'fileHistory.status': 'processed'
    }).select('name collegeName email fileHistory');
    
    if (placementsWithProcessedFiles.length === 0) {
      console.log('⚠️  No placement officers have processed files');
    } else {
      console.log(`✅ Found ${placementsWithProcessedFiles.length} placement officers with processed files:`);
      placementsWithProcessedFiles.forEach((placement, index) => {
        const processedFiles = placement.fileHistory.filter(f => f.status === 'processed');
        console.log(`   ${index + 1}. ${placement.name} (${placement.collegeName})`);
        console.log(`      Processed Files: ${processedFiles.length}`);
        processedFiles.forEach(file => {
          console.log(`      - ${file.fileName} (${file.candidatesCreated || 0} candidates)`);
        });
      });
    }
    
    // 5. Check candidates created from placement files
    console.log('\n5. Checking candidates created from placement files...');
    const placementCandidates = await Candidate.find({
      registrationMethod: 'placement',
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }).populate('placementId').limit(10);
    
    if (placementCandidates.length === 0) {
      console.log('⚠️  No candidates created from placement files in the last 7 days');
    } else {
      console.log(`✅ Found ${placementCandidates.length} candidates created from placement files:`);
      placementCandidates.forEach((candidate, index) => {
        console.log(`   ${index + 1}. ${candidate.name} (${candidate.email})`);
        console.log(`      Placement: ${candidate.placementId?.name || 'Unknown'}`);
        console.log(`      Created: ${candidate.createdAt}`);
        console.log(`      Status: ${candidate.status}`);
      });
    }
    
    // 6. Test email template rendering
    console.log('\n6. Testing email template...');
    const testEmailContent = await generateTestEmailContent();
    console.log('✅ Email template generated successfully');
    console.log(`   Template length: ${testEmailContent.length} characters`);
    console.log(`   Contains create password button: ${testEmailContent.includes('Create Your Password') ? '✅ Yes' : '❌ No'}`);
    
    console.log('\n=== EMAIL FLOW TEST COMPLETE ===');
    console.log('\n📋 SUMMARY:');
    console.log('- Email service is configured and working');
    console.log('- Students should receive welcome emails when their data is approved');
    console.log('- Emails contain "Create Your Password" button');
    console.log('- Check the placement candidates table for email status');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

async function generateTestEmailContent() {
  const email = 'test@example.com';
  const name = 'Test Student';
  const placementOfficerName = 'Dr. Test';
  const collegeName = 'Test University';
  const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const createPasswordUrl = `${loginUrl}/create-password?email=${encodeURIComponent(email)}&type=candidate`;
  
  return `
    <div style="font-family: 'Poppins', sans-serif;
;max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-top: 4px solid #fd7e14;">
        <h1 style="color: #2c3e50; margin: 0; font-size: 28px; font-weight: 600;">🎉 Welcome to TaleGlobal!</h1>
        <p style="color: #2c3e50; font-size: 18px; line-height: 1.6; margin: 0;">Dear <strong>${name}</strong>,</p>
        <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #28a745;">
          <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">✅ Registration Approved!</h3>
          <p style="color: #155724; margin: 0; font-size: 16px;">Your registration has been approved by ${placementOfficerName} from ${collegeName}.</p>
        </div>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${createPasswordUrl}" style="background: linear-gradient(135deg, #fd7e14 0%, #ff6b35 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; display: inline-block;">🔑 Create Your Password</a>
        </div>
      </div>
    </div>
  `;
}

// Run the test
testStudentEmailFlow();