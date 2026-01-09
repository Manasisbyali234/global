const mongoose = require('mongoose');
const Job = require('../models/Job');
const Employer = require('../models/Employer');
require('dotenv').config();

const addSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create sample employer
    const employer = await Employer.create({
      name: 'John Doe',
      email: 'employer@test.com',
      password: 'password123',
      companyName: 'Tech Corp',
      phone: '1234567890'
    });

    // Create sample jobs
    const jobs = [
      {
        title: 'Senior React Developer',
        description: 'We are looking for an experienced React developer...',
        employerId: employer._id,
        location: 'New York, NY',
        salary: { min: 80000, max: 120000, currency: 'USD' },
        jobType: 'full-time',
        category: 'Technology',
        status: 'active',
        skills: ['React', 'JavaScript', 'Node.js']
      },
      {
        title: 'UI/UX Designer',
        description: 'Join our design team to create amazing user experiences...',
        employerId: employer._id,
        location: 'San Francisco, CA',
        salary: { min: 70000, max: 100000, currency: 'USD' },
        jobType: 'full-time',
        category: 'Design',
        status: 'active',
        skills: ['Figma', 'Adobe XD', 'Sketch']
      },
      {
        title: 'Data Scientist',
        description: 'Analyze complex data to drive business decisions...',
        employerId: employer._id,
        location: 'Boston, MA',
        salary: { min: 90000, max: 130000, currency: 'USD' },
        jobType: 'full-time',
        category: 'Data Science',
        status: 'active',
        skills: ['Python', 'Machine Learning', 'SQL']
      }
    ];

    await Job.insertMany(jobs);
    console.log('Sample data added successfully!');
    console.log(`Added ${jobs.length} jobs`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample data:', error);
    process.exit(1);
  }
};

addSampleData();