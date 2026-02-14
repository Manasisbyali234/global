const mongoose = require('mongoose');
const Job = require('../models/Job');
const InterviewRound = require('../models/InterviewRound');
require('dotenv').config();

async function migrateInterviewRoundsToNewStructure() {
  try {
    console.log('Starting migration of interview rounds to new structure...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    // Find all jobs with interview rounds
    const jobs = await Job.find({ 
      interviewRounds: { $exists: true, $ne: [] } 
    });
    
    console.log(`Found ${jobs.length} jobs with interview rounds to migrate`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const job of jobs) {
      try {
        console.log(`\nMigrating job: ${job._id} - ${job.title}`);
        
        // Check if rounds already migrated for this job
        const existingRounds = await InterviewRound.find({ job_id: job._id });
        if (existingRounds.length > 0) {
          console.log(`  Skipping - already has ${existingRounds.length} rounds in new structure`);
          continue;
        }
        
        // Create new interview rounds from embedded data
        for (const round of job.interviewRounds) {
          const newRound = await InterviewRound.create({
            job_id: job._id,
            name: round.name || round.id || 'Interview Round',
            date: round.date || new Date(),
            startTime: round.startTime || '09:00',
            endTime: round.endTime || '17:00',
            applicationLimit: job.applicationLimit || 50
          });
          
          console.log(`  Created round: ${newRound.name} on ${newRound.date}`);
          migratedCount++;
        }
        
        console.log(`  Successfully migrated ${job.interviewRounds.length} rounds for job ${job._id}`);
        
      } catch (error) {
        console.error(`  Error migrating job ${job._id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n=== Migration Summary ===');
    console.log(`Total jobs processed: ${jobs.length}`);
    console.log(`Total rounds migrated: ${migratedCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    console.log('Migration completed!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run migration
migrateInterviewRoundsToNewStructure();
