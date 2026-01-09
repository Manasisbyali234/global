/**
 * Migration Script: Auto-approve Existing Employers
 * 
 * This script auto-approves employers who have already posted jobs
 * before the approval flow was implemented.
 * 
 * Usage: node backend/scripts/migrateExistingEmployers.js
 */

const mongoose = require('mongoose');
const Employer = require('../models/Employer');
const Job = require('../models/Job');

// Load environment variables
require('dotenv').config();

const migrateExistingEmployers = async () => {
  try {
    console.log('🚀 Starting Employer Migration...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Find all employers who have posted jobs
    console.log('📋 Finding employers with existing jobs...');
    const employersWithJobs = await Job.distinct('employerId');
    console.log(`   Found ${employersWithJobs.length} employers with jobs\n`);

    if (employersWithJobs.length === 0) {
      console.log('   No employers with jobs found. Nothing to migrate.');
      return;
    }

    // Get details of these employers
    const employers = await Employer.find({ 
      _id: { $in: employersWithJobs },
      isApproved: false 
    });

    console.log(`   Found ${employers.length} unapproved employers with jobs\n`);

    if (employers.length === 0) {
      console.log('   All employers with jobs are already approved. Nothing to migrate.');
      return;
    }

    // Show employers that will be auto-approved
    console.log('📝 Employers to be auto-approved:');
    for (const employer of employers) {
      const jobCount = await Job.countDocuments({ employerId: employer._id });
      console.log(`   - ${employer.companyName} (${employer.email}) - ${jobCount} jobs`);
    }
    console.log('');

    // Ask for confirmation (in production, you might want to add a prompt here)
    console.log('⚠️  This will auto-approve the above employers.');
    console.log('   They have already posted jobs before the approval flow was implemented.\n');

    // Perform the migration
    console.log('🔄 Updating employers...');
    const result = await Employer.updateMany(
      { _id: { $in: employersWithJobs }, isApproved: false },
      { $set: { isApproved: true, status: 'active' } }
    );

    console.log(`   ✅ Updated ${result.modifiedCount} employers\n`);

    // Verify the migration
    console.log('🔍 Verifying migration...');
    const stillUnapproved = await Employer.find({ 
      _id: { $in: employersWithJobs },
      isApproved: false 
    });

    if (stillUnapproved.length === 0) {
      console.log('   ✅ All employers with jobs are now approved!\n');
    } else {
      console.log(`   ⚠️  ${stillUnapproved.length} employers still unapproved. Please check manually.\n`);
    }

    // Summary
    console.log('📊 Migration Summary:');
    console.log(`   Total employers with jobs: ${employersWithJobs.length}`);
    console.log(`   Auto-approved: ${result.modifiedCount}`);
    console.log(`   Already approved: ${employersWithJobs.length - employers.length}`);
    console.log('');

    console.log('✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the migration
migrateExistingEmployers();
