const mongoose = require('mongoose');
const Job = require('../models/Job');
const Employer = require('../models/Employer');
const EmployerProfile = require('../models/EmployerProfile');
require('dotenv').config();

const addJobGridSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taleglobal');
    console.log('Connected to MongoDB');

    // Check if sample employer exists
    let employer = await Employer.findOne({ email: 'sample@techcorp.com' });
    
    if (!employer) {
      // Create sample employer
      employer = await Employer.create({
        name: 'Tech Corp Admin',
        email: 'sample@techcorp.com',
        password: '$2b$10$example', // This is just a placeholder
        companyName: 'Tech Corp Solutions',
        phone: '+91-9876543210',
        status: 'active',
        isApproved: true,
        employerType: 'company'
      });

      // Create employer profile
      await EmployerProfile.create({
        employerId: employer._id,
        companyName: 'Tech Corp Solutions',
        industry: 'Information Technology',
        location: 'Bangalore',
        corporateAddress: 'Bangalore, Karnataka, India',
        description: 'Leading IT solutions provider specializing in web and mobile development.',
        teamSize: '50-100',
        establishedSince: '2015'
      });

      console.log('Sample employer created');
    }

    // Create sample jobs for job grid
    const jobs = [
      {
        title: 'Software Developer',
        description: 'We are looking for a skilled Software Developer to join our team. You will be responsible for developing and maintaining web applications using modern technologies like React, Node.js, and Python.',
        employerId: employer._id,
        companyName: 'Tech Corp Solutions',
        location: 'Bangalore',
        ctc: { min: 400000, max: 800000, currency: 'INR' },
        jobType: 'full-time',
        category: 'IT',
        status: 'active',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'Python'],
        vacancies: 3,
        applicationCount: 0,
        createdAt: new Date()
      },
      {
        title: 'Frontend Developer',
        description: 'Join our frontend team to build amazing user interfaces. Experience with React, Vue.js, and modern CSS frameworks required.',
        employerId: employer._id,
        companyName: 'Tech Corp Solutions',
        location: 'Mumbai',
        ctc: { min: 350000, max: 700000, currency: 'INR' },
        jobType: 'full-time',
        category: 'IT',
        status: 'active',
        requiredSkills: ['React', 'Vue.js', 'JavaScript', 'CSS'],
        vacancies: 2,
        applicationCount: 0,
        createdAt: new Date()
      },
      {
        title: 'Backend Developer',
        description: 'We need an experienced Backend Developer proficient in Node.js, Python, and database technologies to build scalable server-side applications.',
        employerId: employer._id,
        companyName: 'Tech Corp Solutions',
        location: 'Bangalore',
        ctc: { min: 500000, max: 900000, currency: 'INR' },
        jobType: 'full-time',
        category: 'IT',
        status: 'active',
        requiredSkills: ['Node.js', 'Python', 'MongoDB', 'PostgreSQL'],
        vacancies: 2,
        applicationCount: 0,
        createdAt: new Date()
      },
      {
        title: 'Full Stack Developer',
        description: 'Looking for a versatile Full Stack Developer with experience in both frontend and backend technologies. Must have knowledge of React, Node.js, and databases.',
        employerId: employer._id,
        companyName: 'Tech Corp Solutions',
        location: 'Hyderabad',
        ctc: { min: 600000, max: 1200000, currency: 'INR' },
        jobType: 'full-time',
        category: 'IT',
        status: 'active',
        requiredSkills: ['React', 'Node.js', 'JavaScript', 'MongoDB'],
        vacancies: 1,
        applicationCount: 0,
        createdAt: new Date()
      },
      {
        title: 'UI/UX Designer',
        description: 'Creative UI/UX Designer needed to design intuitive and engaging user interfaces. Experience with Figma, Adobe XD, and user research required.',
        employerId: employer._id,
        companyName: 'Tech Corp Solutions',
        location: 'Pune',
        ctc: { min: 300000, max: 600000, currency: 'INR' },
        jobType: 'full-time',
        category: 'Design',
        status: 'active',
        requiredSkills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research'],
        vacancies: 1,
        applicationCount: 0,
        createdAt: new Date()
      },
      {
        title: 'Data Analyst',
        description: 'Analyze complex datasets to provide business insights. Strong skills in Python, SQL, and data visualization tools required.',
        employerId: employer._id,
        companyName: 'Tech Corp Solutions',
        location: 'Chennai',
        ctc: { min: 400000, max: 700000, currency: 'INR' },
        jobType: 'full-time',
        category: 'Analytics',
        status: 'active',
        requiredSkills: ['Python', 'SQL', 'Tableau', 'Excel'],
        vacancies: 2,
        applicationCount: 0,
        createdAt: new Date()
      }
    ];

    // Remove existing sample jobs
    await Job.deleteMany({ employerId: employer._id });
    
    // Insert new jobs
    await Job.insertMany(jobs);
    
    console.log('Job grid sample data added successfully!');
    console.log(`Added ${jobs.length} jobs for employer: ${employer.companyName}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding job grid sample data:', error);
    process.exit(1);
  }
};

addJobGridSampleData();