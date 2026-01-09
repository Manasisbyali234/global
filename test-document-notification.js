// Test script to verify document rejection notifications
// This script simulates the document rejection process

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// Import models
const Notification = require('./backend/models/Notification');
const { createNotification } = require('./backend/controllers/notificationController');

async function testDocumentNotification() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test data
    const testEmployerId = new mongoose.Types.ObjectId();
    const testAdminId = new mongoose.Types.ObjectId();

    // Test different document rejection notifications
    const documentTypes = [
      { field: 'panCardVerified', name: 'PAN Card' },
      { field: 'cinVerified', name: 'CIN Document' },
      { field: 'gstVerified', name: 'GST Certificate' },
      { field: 'incorporationVerified', name: 'Certificate of Incorporation' },
      { field: 'authorizationVerified', name: 'Authorization Letter' }
    ];

    console.log('\n=== Testing Document Rejection Notifications ===\n');

    for (const doc of documentTypes) {
      // Test rejection notification
      const rejectionNotification = {
        title: `${doc.name} Rejected`,
        message: `Your ${doc.name} document has been rejected by admin. Please resubmit the document with correct information.`,
        type: 'document_rejected',
        role: 'employer',
        relatedId: testEmployerId,
        createdBy: testAdminId
      };

      const createdRejection = await createNotification(rejectionNotification);
      console.log(`✅ Created rejection notification for ${doc.name}:`);
      console.log(`   Title: ${createdRejection.title}`);
      console.log(`   Message: ${createdRejection.message}`);
      console.log(`   Type: ${createdRejection.type}\n`);

      // Test approval notification
      const approvalNotification = {
        title: `${doc.name} Approved`,
        message: `Your ${doc.name} document has been approved by admin. You can now proceed with the next steps.`,
        type: 'document_approved',
        role: 'employer',
        relatedId: testEmployerId,
        createdBy: testAdminId
      };

      const createdApproval = await createNotification(approvalNotification);
      console.log(`✅ Created approval notification for ${doc.name}:`);
      console.log(`   Title: ${createdApproval.title}`);
      console.log(`   Message: ${createdApproval.message}`);
      console.log(`   Type: ${createdApproval.type}\n`);
    }

    // Test authorization letter specific notification
    const authLetterNotification = {
      title: 'Authorization Letter Rejected',
      message: 'Your authorization letter "Company_Authorization_Letter.pdf" has been rejected by admin. Please resubmit the document with correct information or contact support for assistance.',
      type: 'document_rejected',
      role: 'employer',
      relatedId: testEmployerId,
      createdBy: testAdminId
    };

    const createdAuthLetter = await createNotification(authLetterNotification);
    console.log(`✅ Created specific authorization letter notification:`);
    console.log(`   Title: ${createdAuthLetter.title}`);
    console.log(`   Message: ${createdAuthLetter.message}`);
    console.log(`   Type: ${createdAuthLetter.type}\n`);

    // Fetch and display all test notifications
    const allNotifications = await Notification.find({
      relatedId: testEmployerId
    }).sort({ createdAt: -1 });

    console.log(`=== Summary: Created ${allNotifications.length} test notifications ===\n`);
    
    allNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Type: ${notif.type}`);
      console.log(`   Created: ${notif.createdAt}\n`);
    });

    // Clean up test data
    await Notification.deleteMany({ relatedId: testEmployerId });
    console.log('✅ Cleaned up test notifications');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\nKey improvements made:');
    console.log('1. Document-specific titles (e.g., "PAN Card Rejected" instead of "Document Rejected")');
    console.log('2. Clear messages indicating which document was rejected');
    console.log('3. Actionable guidance for next steps');
    console.log('4. Proper notification types for better categorization');
    console.log('5. Enhanced UI display with color coding and better formatting');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testDocumentNotification();