// Test script to verify the authorization letter approval flow
const mongoose = require('mongoose');
const EmployerProfile = require('./backend/models/EmployerProfile');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testAuthorizationFlow() {
  try {
    console.log('🔍 Testing Authorization Letter Approval Flow...\n');

    // Find an employer profile with authorization letters
    const profile = await EmployerProfile.findOne({
      'authorizationLetters.0': { $exists: true }
    }).populate('employerId', 'name email companyName');

    if (!profile) {
      console.log('❌ No employer profiles found with authorization letters');
      console.log('💡 To test this feature:');
      console.log('   1. Login as an employer');
      console.log('   2. Upload authorization letters in profile');
      console.log('   3. Admin approves the letters');
      console.log('   4. Then test job posting with approved companies\n');
      return;
    }

    console.log(`📋 Found employer profile: ${profile.employerId?.companyName || 'Unknown'}`);
    console.log(`📧 Email: ${profile.employerId?.email || 'Unknown'}`);
    console.log(`📄 Authorization letters: ${profile.authorizationLetters.length}\n`);

    // Show authorization letters status
    profile.authorizationLetters.forEach((letter, index) => {
      console.log(`📝 Letter ${index + 1}:`);
      console.log(`   Company: ${letter.companyName || 'Not specified'}`);
      console.log(`   Status: ${letter.status}`);
      console.log(`   Uploaded: ${letter.uploadedAt?.toLocaleDateString() || 'Unknown'}`);
      if (letter.approvedAt) {
        console.log(`   Approved: ${letter.approvedAt.toLocaleDateString()}`);
      }
      console.log('');
    });

    // Get approved companies
    const approvedCompanies = profile.authorizationLetters
      .filter(letter => letter.status === 'approved')
      .map(letter => letter.companyName)
      .filter(name => name && name.trim() !== '');

    console.log(`✅ Approved companies (${approvedCompanies.length}):`);
    if (approvedCompanies.length > 0) {
      approvedCompanies.forEach((company, index) => {
        console.log(`   ${index + 1}. ${company}`);
      });
      console.log('\n🎯 These companies will appear in the job posting dropdown!');
    } else {
      console.log('   None found');
      console.log('\n💡 To see companies in job posting:');
      console.log('   1. Admin needs to approve authorization letters');
      console.log('   2. Each letter should have a company name');
    }

    console.log('\n📊 API Endpoint Test:');
    console.log('   GET /api/employer/approved-authorization-companies');
    console.log(`   Expected response: { success: true, companies: [${approvedCompanies.map(c => `"${c}"`).join(', ')}] }`);

  } catch (error) {
    console.error('❌ Error testing authorization flow:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testAuthorizationFlow();