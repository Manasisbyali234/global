require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/database');
const Employer = require('./models/Employer');

async function testAdminData() {
  try {
    await connectDB();
    
    console.log('Testing admin employer data...');
    
    // Test the same query as admin controller
    const employers = await Employer.find({ isApproved: true })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    console.log(`Found ${employers.length} approved employers:`);
    employers.forEach(emp => {
      console.log(`- ${emp.companyName} (${emp.email}) - Status: ${emp.status}, Approved: ${emp.isApproved}`);
    });

    // Test pending approval
    const pending = await Employer.find({ isApproved: false })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`\nFound ${pending.length} pending employers:`);
    pending.forEach(emp => {
      console.log(`- ${emp.companyName} (${emp.email}) - Status: ${emp.status}, Approved: ${emp.isApproved}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAdminData();