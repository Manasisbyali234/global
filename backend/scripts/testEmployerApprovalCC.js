require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { sendEmployerAccountApprovalEmail } = require('../utils/emailService');

async function testEmployerApprovalEmailCC() {
    const employerEmail = 'aryanmaurya1947@gmail.com'; // primary employer email
    const employerName = 'Test Employer';
    const companyName = 'Test Company';
    const contactOfficialEmail = 'aryanmaurya1947@gmail.com'; // primary contact official email

    console.log('=== Testing Employer Approval Email with CC ===');
    console.log('Employer Email:', employerEmail);
    console.log('Contact Official Email:', contactOfficialEmail);
    console.log('Sending...');

    try {
        await sendEmployerAccountApprovalEmail(employerEmail, employerName, companyName, contactOfficialEmail);
        console.log('✅ Email sent successfully to both:', `${employerEmail}, ${contactOfficialEmail}`);
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
    }
}

testEmployerApprovalEmailCC();
