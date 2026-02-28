const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('../models/Job');
const Application = require('../models/Application');
const Employer = require('../models/Employer');

async function checkJobStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get all active jobs
    const jobs = await Job.find({ status: { $in: ['active', 'pending'] } })
      .select('title vacancies applicationLimit employerId status')
      .lean();

    console.log(`Found ${jobs.length} active/pending jobs\n`);

    for (const job of jobs) {
      // Get application count
      const applicationCount = await Application.countDocuments({ jobId: job._id });
      
      // Get employer info
      const employer = await Employer.findById(job.employerId)
        .select('companyName status isApproved')
        .lean();

      const vacancies = parseInt(job.vacancies) || parseInt(job.applicationLimit) || 0;
      const hasAvailableVacancies = vacancies === 0 || applicationCount < vacancies;

      console.log('─'.repeat(80));
      console.log(`Job: ${job.title}`);
      console.log(`  ID: ${job._id}`);
      console.log(`  Vacancies: ${job.vacancies || 'N/A'}`);
      console.log(`  Application Limit: ${job.applicationLimit || 'N/A'}`);
      console.log(`  Final Vacancy Count: ${vacancies}`);
      console.log(`  Current Applications: ${applicationCount}`);
      console.log(`  Has Available Vacancies: ${hasAvailableVacancies ? '✓ YES' : '✗ NO'}`);
      
      if (employer) {
        console.log(`  Employer: ${employer.companyName}`);
        console.log(`  Employer Status: ${employer.status}`);
        console.log(`  Employer Approved: ${employer.isApproved ? '✓ YES' : '✗ NO'}`);
        
        const willDisplay = employer.status === 'active' && employer.isApproved && hasAvailableVacancies;
        console.log(`  Will Display on Job Grid: ${willDisplay ? '✓ YES' : '✗ NO'}`);
        
        if (!willDisplay) {
          console.log(`  Reason for not displaying:`);
          if (employer.status !== 'active') console.log(`    - Employer not active (status: ${employer.status})`);
          if (!employer.isApproved) console.log(`    - Employer not approved`);
          if (!hasAvailableVacancies) console.log(`    - No available vacancies (${applicationCount} >= ${vacancies})`);
        }
      } else {
        console.log(`  Employer: NOT FOUND`);
        console.log(`  Will Display on Job Grid: ✗ NO (Employer not found)`);
      }
      console.log('');
    }

    console.log('─'.repeat(80));
    console.log('\nSummary:');
    const displayableJobs = await Promise.all(jobs.map(async (job) => {
      const applicationCount = await Application.countDocuments({ jobId: job._id });
      const employer = await Employer.findById(job.employerId).select('status isApproved').lean();
      const vacancies = parseInt(job.vacancies) || parseInt(job.applicationLimit) || 0;
      const hasAvailableVacancies = vacancies === 0 || applicationCount < vacancies;
      return employer && employer.status === 'active' && employer.isApproved && hasAvailableVacancies;
    }));
    
    const displayCount = displayableJobs.filter(Boolean).length;
    console.log(`Total Jobs: ${jobs.length}`);
    console.log(`Jobs That Will Display: ${displayCount}`);
    console.log(`Jobs That Won't Display: ${jobs.length - displayCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkJobStatus();
