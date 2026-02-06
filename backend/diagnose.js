require('dotenv').config();
const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const Employer = require('./models/Employer');
const Job = require('./models/Job');

async function diagnose() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Check Candidates
    const candidates = await Candidate.find({}).select('name email status registrationMethod');
    console.log('=== CANDIDATES ===');
    console.log(`Total: ${candidates.length}`);
    candidates.forEach(c => {
      console.log(`  - ${c.name} (${c.email})`);
      console.log(`    Status: ${c.status}, Method: ${c.registrationMethod}`);
    });

    // Check Employers
    const employers = await Employer.find({}).select('companyName email status isApproved');
    console.log('\n=== EMPLOYERS ===');
    console.log(`Total: ${employers.length}`);
    employers.forEach(e => {
      console.log(`  - ${e.companyName} (${e.email})`);
      console.log(`    Status: ${e.status}, isApproved: ${e.isApproved}`);
    });

    // Check Jobs
    const jobs = await Job.find({}).select('title status location employerId');
    console.log('\n=== JOBS ===');
    console.log(`Total: ${jobs.length}`);
    jobs.forEach(j => {
      console.log(`  - ${j.title} (${j.location})`);
      console.log(`    Status: ${j.status}, Employer: ${j.employerId}`);
    });

    // Check if data is queryable
    console.log('\n=== QUERY TESTS ===');
    const activeJobs = await Job.find({ status: 'active' }).countDocuments();
    console.log(`Active Jobs: ${activeJobs}`);
    
    const activeCandidates = await Candidate.find({ status: 'active' }).countDocuments();
    console.log(`Active Candidates: ${activeCandidates}`);
    
    const approvedEmployers = await Employer.find({ isApproved: true }).countDocuments();
    console.log(`Approved Employers: ${approvedEmployers}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

diagnose();
