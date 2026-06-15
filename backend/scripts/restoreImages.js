const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const EmployerProfile = require('./models/EmployerProfile');

const restoreImages = async () => {
  try {
    console.log('🔄 Starting image restoration process...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    const backupDir = path.join(__dirname, 'image-backup');
    const uploadsDir = path.join(__dirname, 'uploads');
    
    // Ensure uploads directory exists
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }

    // Read backup report
    let backupReport;
    try {
      const reportData = await fs.readFile(path.join(backupDir, 'backup-report.json'), 'utf8');
      backupReport = JSON.parse(reportData);
    } catch (err) {
      console.error('❌ Could not read backup report. Run backup script first.');
      return;
    }

    console.log(`📁 Found ${backupReport.backedUpImages.length} backed up images`);

    let restoredCount = 0;
    let failedCount = 0;

    // Restore each backed up image
    for (const imageInfo of backupReport.backedUpImages) {
      try {
        const originalFileName = path.basename(imageInfo.originalPath);
        const restorePath = path.join(uploadsDir, originalFileName);
        
        // Copy from backup to uploads directory
        await fs.copyFile(imageInfo.backupPath, restorePath);
        
        console.log(`✅ Restored: ${originalFileName}`);
        restoredCount++;
        
      } catch (err) {
        console.error(`❌ Failed to restore ${imageInfo.originalPath}:`, err.message);
        failedCount++;
      }
    }

    console.log('\n=== RESTORATION SUMMARY ===');
    console.log(`✅ Successfully restored: ${restoredCount} images`);
    console.log(`❌ Failed to restore: ${failedCount} images`);
    
    // Verify database references
    console.log('\n🔍 Verifying database references...');
    
    const profiles = await EmployerProfile.find({
      $or: [
        { logo: { $exists: true, $ne: null } },
        { coverImage: { $exists: true, $ne: null } },
        { 'gallery.url': { $exists: true } }
      ]
    });

    let validRefs = 0;
    let brokenRefs = 0;

    for (const profile of profiles) {
      if (profile.logo) {
        const logoPath = path.join(uploadsDir, profile.logo);
        try {
          await fs.access(logoPath);
          validRefs++;
        } catch {
          console.log(`❌ Missing logo for ${profile.companyName}: ${profile.logo}`);
          brokenRefs++;
        }
      }
      
      if (profile.coverImage) {
        const coverPath = path.join(uploadsDir, profile.coverImage);
        try {
          await fs.access(coverPath);
          validRefs++;
        } catch {
          console.log(`❌ Missing cover for ${profile.companyName}: ${profile.coverImage}`);
          brokenRefs++;
        }
      }
    }

    console.log(`\n📊 Database Reference Check:`);
    console.log(`✅ Valid references: ${validRefs}`);
    console.log(`❌ Broken references: ${brokenRefs}`);

    if (brokenRefs > 0) {
      console.log('\n⚠️  You have broken image references in your database.');
      console.log('   Consider updating the database to remove broken references or');
      console.log('   implement cloud storage to prevent future image loss.');
    }

    await mongoose.disconnect();
    console.log('\n🎉 Image restoration process completed!');
    
  } catch (error) {
    console.error('❌ Restoration failed:', error);
    process.exit(1);
  }
};

// Run restoration
restoreImages();