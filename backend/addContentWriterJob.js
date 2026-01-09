const mongoose = require('mongoose');
const Job = require('./models/Job');
const Employer = require('./models/Employer');

mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function addContentWriterJob() {
  try {
    // Find an active employer to assign the job to
    const employer = await Employer.findOne({ status: 'active', isApproved: true });
    
    if (!employer) {
      console.log('No active employer found. Creating a test employer...');
      const testEmployer = await Employer.create({
        name: 'Content Agency',
        email: 'hr@contentagency.com',
        password: 'password123',
        companyName: 'Content Agency',
        phone: '9876543213',
        status: 'active',
        isApproved: true,
        employerType: 'company'
      });
      
      // Create the Content Writer job
      const contentWriterJob = await Job.create({
        title: 'Content Writer',
        description: 'We are looking for a talented Content Writer to join our team. You will be responsible for creating engaging content for blogs, websites, and social media platforms.',
        employerId: testEmployer._id,
        location: 'Mumbai',
        category: 'Content',
        jobType: 'full-time',
        status: 'active',
        requiredSkills: ['Writing', 'SEO', 'Content Marketing', 'Research'],
        experienceLevel: 'minimum',
        minExperience: 1,
        salary: { min: 300000, max: 600000, currency: 'INR' },
        vacancies: 2,
        applicationLimit: 50,
        education: 'Any',
        backlogsAllowed: true,
        interviewRoundsCount: 2,
        interviewRoundTypes: {
          technical: false,
          managerial: true,
          nonTechnical: true,
          final: false,
          hr: true
        },
        transportation: {
          oneWay: false,
          twoWay: true,
          noCab: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Content Writer job created successfully!');
      console.log('Job ID:', contentWriterJob._id);
      console.log('Title:', contentWriterJob.title);
      console.log('Category:', contentWriterJob.category);
      console.log('Status:', contentWriterJob.status);
    } else {
      // Use existing employer
      const contentWriterJob = await Job.create({
        title: 'Content Writer',
        description: 'We are looking for a talented Content Writer to join our team. You will be responsible for creating engaging content for blogs, websites, and social media platforms.',
        employerId: employer._id,
        location: 'Mumbai',
        category: 'Content',
        jobType: 'full-time',
        status: 'active',
        requiredSkills: ['Writing', 'SEO', 'Content Marketing', 'Research'],
        experienceLevel: 'minimum',
        minExperience: 1,
        salary: { min: 300000, max: 600000, currency: 'INR' },
        vacancies: 2,
        applicationLimit: 50,
        education: 'Any',
        backlogsAllowed: true,
        interviewRoundsCount: 2,
        interviewRoundTypes: {
          technical: false,
          managerial: true,
          nonTechnical: true,
          final: false,
          hr: true
        },
        transportation: {
          oneWay: false,
          twoWay: true,
          noCab: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Content Writer job created successfully!');
      console.log('Job ID:', contentWriterJob._id);
      console.log('Title:', contentWriterJob.title);
      console.log('Category:', contentWriterJob.category);
      console.log('Status:', contentWriterJob.status);
      console.log('Employer:', employer.companyName);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating Content Writer job:', error);
    process.exit(1);
  }
}

addContentWriterJob();