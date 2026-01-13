const mongoose = require('mongoose');
require('dotenv').config({path: 'backend/.env'});
const Application = require('./backend/models/Application');
const Employer = require('./backend/models/Employer');

async function checkData() {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    const appCount = await Application.countDocuments();
    const empCount = await Employer.countDocuments();
    const appWithCreatedAt = await Application.countDocuments({createdAt: {$exists: true}});
    const appWithAppliedAt = await Application.countDocuments({appliedAt: {$exists: true}});
    const empWithCreatedAt = await Employer.countDocuments({createdAt: {$exists: true}});
    
    const latestApp = await Application.findOne().sort({createdAt: -1});
    const latestEmp = await Employer.findOne().sort({createdAt: -1});

    console.log({
      appCount, 
      empCount, 
      appWithCreatedAt, 
      appWithAppliedAt, 
      empWithCreatedAt,
      latestAppCreatedAt: latestApp ? latestApp.createdAt : null,
      latestEmpCreatedAt: latestEmp ? latestEmp.createdAt : null
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
