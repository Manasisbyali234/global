require('dotenv').config();
const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');

async function addSerialNumbers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('Connected to database');
    
    // Update all assessments that don't have serialNumber
    const assessmentsWithoutSerial = await Assessment.find({ serialNumber: { $exists: false } });
    console.log(`Found ${assessmentsWithoutSerial.length} assessments without serial numbers`);
    
    // Get all unique employer IDs
    const employerIds = await Assessment.distinct('employerId');
    console.log(`Processing ${employerIds.length} employers`);
    
    for (const employerId of employerIds) {
      // Get all assessments for this employer, sorted by creation date
      const assessments = await Assessment.find({ employerId })
        .sort({ createdAt: 1 })
        .select('_id serialNumber');
      
      // Update each assessment with sequential serial number
      for (let i = 0; i < assessments.length; i++) {
        await Assessment.findByIdAndUpdate(assessments[i]._id, {
          serialNumber: i + 1
        });
      }
      
      console.log(`Updated ${assessments.length} assessments for employer ${employerId}`);
    }
    
    console.log('Serial number migration completed successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addSerialNumbers();