require('dotenv').config();
const mongoose = require('mongoose');
const Employer = require('./models/Employer');
const Job = require('./models/Job');

async function fixData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Fix employer approval status
    const employer = await Employer.findOne({ email: 'basavarajkasbi@gmail.com' });
    if (employer) {
      employer.isApproved = true;
      employer.status = 'active';
      await employer.save();
      console.log('✓ Employer approved:', employer.companyName);
      console.log('  Email:', employer.email);
      console.log('  Status:', employer.status);
      console.log('  isApproved:', employer.isApproved);
    }

    // Check if jobs exist
    const jobCount = await Job.countDocuments();
    console.log(`\n✓ Current job count: ${jobCount}`);

    if (jobCount === 0 && employer) {
      console.log('\n⚠ No jobs found. Would you like to add a sample job?');
      console.log('Run this script with "add-sample-job" argument to add one.');
      
      // If argument provided, add sample job
      if (process.argv[2] === 'add-sample-job') {
        const sampleJob = await Job.create({
          title: 'Software Developer',
          employerId: employer._id,
          location: 'Bangalore',
          jobType: 'Full-time',
          experience: '2-5 years',
          salary: '₹6-10 LPA',
          description: 'Looking for a skilled software developer with experience in Node.js and React.',
          requiredSkills: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
          status: 'active',
          lastDateOfApplication: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        });
        console.log('\n✓ Sample job created:', sampleJob.title);
      }
    }

    await mongoose.connection.close();
    console.log('\n✓ Done!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixData();
