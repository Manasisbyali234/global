const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// Import models
const Job = require('./backend/models/Job');
const Employer = require('./backend/models/Employer');
const EmployerProfile = require('./backend/models/EmployerProfile');

async function testJobPosting() {
  try {
    console.log('🔍 Testing Job Posting Data Storage...\n');
    
    // Connect to database
    console.log('📡 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');
    
    // Check recent jobs
    console.log('📋 Checking recent job postings:');
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employerId', 'name companyName email');
    
    if (recentJobs.length === 0) {
      console.log('❌ No jobs found in database');
    } else {
      console.log(`✅ Found ${recentJobs.length} recent jobs:\n`);
      
      recentJobs.forEach((job, index) => {
        console.log(`${index + 1}. Job ID: ${job._id}`);
        console.log(`   Title: ${job.title}`);
        console.log(`   Company: ${job.companyName || job.employerId?.companyName || 'N/A'}`);
        console.log(`   Location: ${job.location}`);
        console.log(`   Status: ${job.status}`);
        console.log(`   Created: ${job.createdAt}`);
        console.log(`   Employer: ${job.employerId?.name} (${job.employerId?.email})`);
        console.log('   ---');
      });
    }
    
    // Check total job count
    const totalJobs = await Job.countDocuments();
    console.log(`\n📊 Total jobs in database: ${totalJobs}`);
    
    // Check active jobs
    const activeJobs = await Job.countDocuments({ status: 'active' });
    console.log(`📊 Active jobs: ${activeJobs}`);
    
    // Check employers
    const totalEmployers = await Employer.countDocuments();
    console.log(`📊 Total employers: ${totalEmployers}`);
    
    // Check approved employers
    const approvedEmployers = await Employer.countDocuments({ isApproved: true });
    console.log(`📊 Approved employers: ${approvedEmployers}`);
    
    // Test job creation endpoint simulation
    console.log('\n🧪 Testing job creation process...');
    
    // Find an approved employer
    const approvedEmployer = await Employer.findOne({ isApproved: true });
    if (!approvedEmployer) {
      console.log('❌ No approved employers found. Cannot test job creation.');
    } else {
      console.log(`✅ Found approved employer: ${approvedEmployer.name} (${approvedEmployer.email})`);
      
      // Check their profile
      const profile = await EmployerProfile.findOne({ employerId: approvedEmployer._id });
      if (!profile) {
        console.log('❌ Employer profile not found');
      } else {
        console.log('✅ Employer profile found');
        
        // Check required fields
        const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
        const requiredDocuments = ['panCardImage', 'cinImage', 'gstImage', 'certificateOfIncorporation'];
        
        const missingFields = requiredFields.filter(field => !profile[field] || profile[field].trim() === '');
        const missingDocs = requiredDocuments.filter(field => !profile[field] || profile[field].trim() === '');
        
        console.log(`   Missing fields: ${missingFields.length > 0 ? missingFields.join(', ') : 'None'}`);
        console.log(`   Missing documents: ${missingDocs.length > 0 ? missingDocs.join(', ') : 'None'}`);
        
        if (missingFields.length === 0 && missingDocs.length === 0) {
          console.log('✅ Employer profile is complete and can post jobs');
        } else {
          console.log('❌ Employer profile is incomplete');
        }
      }
    }
    
    // Check database connection health
    console.log('\n🏥 Database Health Check:');
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'Disconnected',
      1: 'Connected', 
      2: 'Connecting',
      3: 'Disconnecting'
    };
    console.log(`   Connection State: ${states[dbState]} (${dbState})`);
    console.log(`   Database Name: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    
  } catch (error) {
    console.error('❌ Error testing job posting:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from database');
  }
}

// Run the test
testJobPosting();