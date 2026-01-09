const mongoose = require('mongoose');
require('dotenv').config();

const Candidate = require('./backend/models/Candidate');
const Placement = require('./backend/models/Placement');

async function syncCreditsFromExcel() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔄 Syncing credits from Excel files...');

    const placements = await Placement.find({
      fileHistory: { $exists: true, $ne: [] }
    });

    let totalUpdated = 0;

    for (const placement of placements) {
      console.log(`\n📋 Processing placement: ${placement.name} (${placement.collegeName})`);
      
      for (const file of placement.fileHistory) {
        if (file.credits > 0) {
          console.log(`  📄 File: ${file.fileName} - Credits: ${file.credits}`);
          
          // Update all candidates from this placement with file credits
          const updateResult = await Candidate.updateMany(
            { 
              placementId: placement._id,
              registrationMethod: 'placement'
            },
            { 
              $set: { credits: file.credits }
            }
          );
          
          console.log(`    ✅ Updated ${updateResult.modifiedCount} candidates`);
          totalUpdated += updateResult.modifiedCount;
        }
      }
    }

    console.log(`\n🎉 Sync completed! Total candidates updated: ${totalUpdated}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

syncCreditsFromExcel();