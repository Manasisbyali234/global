const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('../models/Job');

async function migrateInterviewRounds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const jobs = await Job.find({ interviewRoundDetails: { $exists: true, $ne: {} } });
    console.log(`Found ${jobs.length} jobs with interviewRoundDetails to migrate`);

    let migratedCount = 0;

    for (const job of jobs) {
      const interviewRounds = [];
      
      if (job.interviewRoundDetails && typeof job.interviewRoundDetails === 'object') {
        Object.entries(job.interviewRoundDetails).forEach(([key, value]) => {
          if (value && typeof value === 'object') {
            interviewRounds.push({
              id: key,
              name: key.replace(/_\d+$/, ''),
              date: value.fromDate || value.date || null,
              startTime: value.startTime || value.time || '',
              endTime: value.endTime || ''
            });
          }
        });
      }

      if (interviewRounds.length > 0) {
        await Job.updateOne(
          { _id: job._id },
          { 
            $set: { interviewRounds },
            $unset: { interviewRoundDetails: 1 }
          }
        );
        migratedCount++;
        console.log(`Migrated job ${job._id}: ${job.title} - ${interviewRounds.length} rounds`);
      }
    }

    console.log(`\nMigration completed: ${migratedCount} jobs updated`);
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateInterviewRounds();
