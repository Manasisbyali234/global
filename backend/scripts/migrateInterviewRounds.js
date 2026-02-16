const mongoose = require('mongoose');
const Job = require('../models/Job');
const InterviewRound = require('../models/InterviewRound');

async function migrateInterviewRounds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tale_jobportal');
    console.log('Connected to MongoDB');

    const jobs = await Job.find({ interviewRoundOrder: { $exists: true, $ne: [] } }).lean();
    console.log(`Found ${jobs.length} jobs with interview rounds`);

    for (const job of jobs) {
      console.log(`\nProcessing job: ${job._id} - ${job.title}`);
      
      // Check if rounds already exist
      const existingRounds = await InterviewRound.find({ jobId: job._id });
      if (existingRounds.length > 0) {
        console.log(`  Skipping - ${existingRounds.length} rounds already exist`);
        continue;
      }

      const roundsToCreate = [];

      // Process each round in interviewRoundOrder
      for (const roundKey of job.interviewRoundOrder) {
        const roundType = job.interviewRoundTypes?.[roundKey];
        
        if (roundType === 'assessment' && job.assessmentId) {
          // Create assessment round
          roundsToCreate.push({
            jobId: job._id,
            name: 'Assessment',
            date: job.assessmentStartDate || new Date(),
            startTime: job.assessmentStartTime || '09:00',
            endTime: job.assessmentEndTime || '10:00',
            applicationLimit: job.applicationLimit || 50
          });
        } else if (roundType) {
          // Create other interview rounds
          const roundNames = {
            technical: 'Technical',
            oneOnOne: 'One-to-One',
            panel: 'Panel',
            group: 'Group',
            situational: 'Situational / Behavioral',
            others: 'Others'
          };
          
          roundsToCreate.push({
            jobId: job._id,
            name: roundNames[roundType] || roundType,
            date: new Date(),
            startTime: '10:00',
            endTime: '11:00',
            applicationLimit: job.applicationLimit || 50
          });
        }
      }

      if (roundsToCreate.length > 0) {
        await InterviewRound.insertMany(roundsToCreate);
        console.log(`  Created ${roundsToCreate.length} interview rounds`);
      }
    }

    console.log('\nMigration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateInterviewRounds();
