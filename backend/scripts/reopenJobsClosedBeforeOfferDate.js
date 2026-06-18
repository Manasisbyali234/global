require('dotenv').config();

const mongoose = require('mongoose');
const Job = require('../models/Job');
const Employer = require('../models/Employer');
const { getStartOfCurrentIstDayUtc } = require('../utils/dateTime');

const shouldApply = process.argv.includes('--apply');

const main = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const today = getStartOfCurrentIstDayUtc();
  const query = {
    status: 'closed',
    offerLetterDate: { $gte: today },
    lastDateOfApplication: { $lt: today }
  };

  const jobs = await Job.find(query)
    .select('_id title employerId lastDateOfApplication offerLetterDate status')
    .lean();

  const employerIds = [...new Set(jobs.map((job) => String(job.employerId)).filter(Boolean))];
  const approvedEmployers = await Employer.find({
    _id: { $in: employerIds },
    status: 'active',
    isApproved: true
  })
    .select('_id')
    .lean();

  const approvedEmployerIds = new Set(approvedEmployers.map((employer) => String(employer._id)));
  const repairableJobs = jobs.filter((job) => approvedEmployerIds.has(String(job.employerId)));

  console.log(`Found ${repairableJobs.length} closed jobs with a valid offer-letter date.`);

  repairableJobs.slice(0, 20).forEach((job) => {
    console.log(`- ${job._id} | ${job.title} | offerLetterDate=${job.offerLetterDate?.toISOString?.() || job.offerLetterDate}`);
  });

  if (!shouldApply) {
    console.log('\nDry run only. Re-run with --apply to reopen these jobs.');
    return;
  }

  if (repairableJobs.length === 0) {
    return;
  }

  const result = await Job.updateMany(
    { _id: { $in: repairableJobs.map((job) => job._id) } },
    { $set: { status: 'active' } }
  );

  console.log(`Reopened ${result.modifiedCount} jobs.`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
