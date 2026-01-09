const mongoose = require('mongoose');
const Application = require('./models/Application');
const Job = require('./models/Job');
const Employer = require('./models/Employer');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/TestingJobs');

async function testApplicationsData() {
  try {
    console.log('Testing applications data...');
    
    // Get a sample application
    const application = await Application.findOne().populate('jobId').populate('employerId');
    
    if (!application) {
      console.log('No applications found');
      return;
    }
    
    console.log('Sample Application:', {
      id: application._id,
      jobId: application.jobId ? {
        id: application.jobId._id,
        title: application.jobId.title,
        location: application.jobId.location,
        employerId: application.jobId.employerId
      } : 'No job data',
      employerId: application.employerId ? {
        id: application.employerId._id,
        companyName: application.employerId.companyName
      } : 'No employer data',
      status: application.status
    });
    
    // Check if job has employer reference
    if (application.jobId && application.jobId.employerId) {
      const employer = await Employer.findById(application.jobId.employerId);
      console.log('Job\'s Employer:', employer ? {
        id: employer._id,
        companyName: employer.companyName
      } : 'Employer not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testApplicationsData();