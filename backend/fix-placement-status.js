const mongoose = require('mongoose');
const Placement = require('./models/Placement');

// Script to fix placement officers that may have been incorrectly approved
async function fixPlacementStatus() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taleglobal');
    console.log('Connected to database');

    // Find all placement officers
    const allPlacements = await Placement.find({}).select('name email status createdAt');
    console.log(`\nFound ${allPlacements.length} placement officers in database:`);

    allPlacements.forEach((placement, index) => {
      console.log(`${index + 1}. ${placement.name} (${placement.email}) - Status: ${placement.status} - Created: ${placement.createdAt}`);
    });

    // Find placement officers that might need status correction
    // (Those created recently and are 'active' without explicit admin approval)
    const recentActiveCount = await Placement.countDocuments({
      status: 'active',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    console.log(`\nFound ${recentActiveCount} placement officers with 'active' status created in the last 24 hours.`);

    if (recentActiveCount > 0) {
      console.log('\n⚠️  WARNING: Some placement officers may have been auto-approved due to the bug.');
      console.log('Please review these accounts manually in the admin dashboard.');
      console.log('If they should not be approved, change their status to "pending" in the admin panel.');
    } else {
      console.log('\n✅ No recently auto-approved placement officers found.');
    }

    // Show pending placement officers
    const pendingPlacements = await Placement.find({ status: 'pending' }).select('name email createdAt');
    console.log(`\nPending placement officers (${pendingPlacements.length}):`);
    pendingPlacements.forEach((placement, index) => {
      console.log(`${index + 1}. ${placement.name} (${placement.email}) - Created: ${placement.createdAt}`);
    });

    console.log('\n✅ Status check completed. The bug has been fixed in the code.');
    console.log('New placement officers will now require admin approval before they can login.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run the script
fixPlacementStatus();