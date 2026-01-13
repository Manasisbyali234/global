const mongoose = require('mongoose');
const Application = require('./models/Application');
const Employer = require('./models/Employer');
require('dotenv').config();

async function checkData() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    const appCount = await Application.countDocuments();
    const empCount = await Employer.countDocuments();
    
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const recentApps = await Application.countDocuments({createdAt: {$gte: sixMonthsAgo}});
    const recentEmps = await Employer.countDocuments({createdAt: {$gte: sixMonthsAgo}});
    
    console.log({
      totalApplications: appCount,
      totalEmployers: empCount,
      applicationsLast6Months: recentApps,
      employersLast6Months: recentEmps,
      sixMonthsAgo: sixMonthsAgo.toISOString()
    });

    // Check for AppliedAt for applications
    const recentAppsAppliedAt = await Application.countDocuments({appliedAt: {$gte: sixMonthsAgo}});
    console.log('recentApps (using appliedAt):', recentAppsAppliedAt);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
