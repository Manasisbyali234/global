const mongoose = require('mongoose');
require('dotenv').config();
const Job = require('../models/Job');

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updateJobSalaries() {
  try {
    const jobs = await Job.find({});
    
    for (const job of jobs) {
      const updateData = {};
      
      // Add CTC and net salary if not present
      if (!job.ctc || !job.netSalary) {
        // Generate random CTC between 3L to 15L
        const minCTC = Math.floor(Math.random() * 200000) + 300000; // 3L to 5L
        const maxCTC = Math.floor(Math.random() * 700000) + 800000; // 8L to 15L
        
        updateData.ctc = { min: minCTC, max: maxCTC };
        updateData.netSalary = { 
          min: Math.round(minCTC * 0.8), 
          max: Math.round(maxCTC * 0.8) 
        };
        
        await Job.findByIdAndUpdate(job._id, updateData);
        console.log(`Updated job: ${job.title} with CTC: ${minCTC/100000}L - ${maxCTC/100000}L`);
      }
    }
    
    console.log('All jobs updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating jobs:', error);
    process.exit(1);
  }
}

updateJobSalaries();