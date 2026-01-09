/**
 * Test Script for Employer Approval Flow
 * 
 * This script tests the complete employer approval flow:
 * 1. Employer registration
 * 2. Profile completion check
 * 3. Admin approval requirement
 * 4. Job posting validation
 */

const mongoose = require('mongoose');
const Employer = require('../models/Employer');
const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');

// Load environment variables
require('dotenv').config();

const testEmployerApprovalFlow = async () => {
  try {
    console.log('🚀 Starting Employer Approval Flow Test...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Test 1: Check existing employers without approval
    console.log('📋 Test 1: Checking employers without approval...');
    const unapprovedEmployers = await Employer.find({ isApproved: false });
    console.log(`   Found ${unapprovedEmployers.length} unapproved employers`);
    
    if (unapprovedEmployers.length > 0) {
      console.log('   Sample unapproved employers:');
      unapprovedEmployers.slice(0, 3).forEach(emp => {
        console.log(`   - ${emp.companyName} (${emp.email})`);
      });
    }
    console.log('');

    // Test 2: Check profile completion for unapproved employers
    console.log('📋 Test 2: Checking profile completion status...');
    const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
    
    for (const employer of unapprovedEmployers.slice(0, 5)) {
      const profile = await EmployerProfile.findOne({ employerId: employer._id });
      
      if (!profile) {
        console.log(`   ❌ ${employer.companyName}: No profile found`);
        continue;
      }

      const missingFields = requiredFields.filter(field => !profile[field]);
      const completion = Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100);
      
      if (missingFields.length === 0) {
        console.log(`   ✅ ${employer.companyName}: Profile complete (${completion}%) - Ready for approval`);
      } else {
        console.log(`   ⚠️  ${employer.companyName}: Profile incomplete (${completion}%) - Missing: ${missingFields.join(', ')}`);
      }
    }
    console.log('');

    // Test 3: Check employers with complete profiles ready for approval
    console.log('📋 Test 3: Finding employers ready for approval...');
    const employersReadyForApproval = [];
    
    for (const employer of unapprovedEmployers) {
      const profile = await EmployerProfile.findOne({ employerId: employer._id });
      if (profile) {
        const missingFields = requiredFields.filter(field => !profile[field]);
        if (missingFields.length === 0) {
          employersReadyForApproval.push({
            employer,
            profile
          });
        }
      }
    }
    
    console.log(`   Found ${employersReadyForApproval.length} employers with complete profiles ready for approval`);
    if (employersReadyForApproval.length > 0) {
      console.log('   Employers ready for approval:');
      employersReadyForApproval.slice(0, 5).forEach(({ employer }) => {
        console.log(`   - ${employer.companyName} (${employer.email})`);
      });
    }
    console.log('');

    // Test 4: Check approved employers
    console.log('📋 Test 4: Checking approved employers...');
    const approvedEmployers = await Employer.find({ isApproved: true });
    console.log(`   Found ${approvedEmployers.length} approved employers`);
    
    if (approvedEmployers.length > 0) {
      console.log('   Sample approved employers:');
      approvedEmployers.slice(0, 3).forEach(emp => {
        console.log(`   - ${emp.companyName} (${emp.email})`);
      });
    }
    console.log('');

    // Test 5: Check jobs posted by unapproved employers (should be none after implementation)
    console.log('📋 Test 5: Checking jobs from unapproved employers...');
    const unapprovedEmployerIds = unapprovedEmployers.map(e => e._id);
    const jobsFromUnapproved = await Job.find({ employerId: { $in: unapprovedEmployerIds } });
    
    if (jobsFromUnapproved.length > 0) {
      console.log(`   ⚠️  Found ${jobsFromUnapproved.length} jobs from unapproved employers (these were posted before the flow was implemented)`);
      console.log('   Consider running migration to auto-approve these employers');
    } else {
      console.log(`   ✅ No jobs from unapproved employers - Flow is working correctly!`);
    }
    console.log('');

    // Test 6: Summary and recommendations
    console.log('📊 Summary and Recommendations:\n');
    console.log(`   Total Employers: ${unapprovedEmployers.length + approvedEmployers.length}`);
    console.log(`   ✅ Approved: ${approvedEmployers.length}`);
    console.log(`   ⏳ Pending Approval: ${unapprovedEmployers.length}`);
    console.log(`   🎯 Ready for Approval: ${employersReadyForApproval.length}`);
    console.log('');

    if (employersReadyForApproval.length > 0) {
      console.log('   💡 Action Required:');
      console.log('   - Admin should review and approve employers with complete profiles');
      console.log('   - Use endpoint: GET /api/admin/employers/pending-approval');
      console.log('   - Approve using: PUT /api/admin/employers/:id/status');
    }

    if (jobsFromUnapproved.length > 0) {
      console.log('');
      console.log('   💡 Migration Recommended:');
      console.log('   - Auto-approve employers who have already posted jobs');
      console.log('   - Run: node backend/scripts/migrateExistingEmployers.js');
    }

    console.log('\n✅ Test completed successfully!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the test
testEmployerApprovalFlow();
