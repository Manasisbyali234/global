const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Job = require('./models/Job');

async function testRolesAndResponsibilities() {
  try {
    console.log('=== TESTING ROLES & RESPONSIBILITIES STORAGE ===');
    
    // Find recent jobs to check if responsibilities are being saved
    const recentJobs = await Job.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title responsibilities createdAt employerId');
    
    console.log(`\nFound ${recentJobs.length} recent jobs:`);
    
    recentJobs.forEach((job, index) => {
      console.log(`\n${index + 1}. Job: ${job.title}`);
      console.log(`   Created: ${job.createdAt}`);
      console.log(`   Employer ID: ${job.employerId}`);
      console.log(`   Responsibilities field exists: ${job.responsibilities !== undefined}`);
      console.log(`   Responsibilities type: ${typeof job.responsibilities}`);
      console.log(`   Responsibilities length: ${job.responsibilities ? job.responsibilities.length : 0}`);
      
      if (job.responsibilities && job.responsibilities.length > 0) {
        console.log(`   Responsibilities content:`);
        job.responsibilities.forEach((resp, i) => {
          console.log(`     ${i + 1}. ${resp.substring(0, 100)}${resp.length > 100 ? '...' : ''}`);
        });
      } else {
        console.log(`   ❌ No responsibilities found for this job`);
      }
    });
    
    // Check if any jobs have responsibilities
    const jobsWithResponsibilities = await Job.countDocuments({
      responsibilities: { $exists: true, $ne: [], $not: { $size: 0 } }
    });
    
    const totalJobs = await Job.countDocuments({});
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total jobs in database: ${totalJobs}`);
    console.log(`Jobs with responsibilities: ${jobsWithResponsibilities}`);
    console.log(`Jobs without responsibilities: ${totalJobs - jobsWithResponsibilities}`);
    
    if (jobsWithResponsibilities === 0) {
      console.log(`\n❌ ISSUE CONFIRMED: No jobs have roles & responsibilities saved!`);
      console.log(`This indicates the field mapping issue between frontend and backend.`);
    } else {
      console.log(`\n✅ Some jobs have roles & responsibilities saved.`);
    }
    
  } catch (error) {
    console.error('Error testing roles & responsibilities:', error);
  } finally {
    mongoose.connection.close();
  }
}

testRolesAndResponsibilities();