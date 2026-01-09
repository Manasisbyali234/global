const mongoose = require('mongoose');
require('dotenv').config();

const Employer = require('../models/Employer');
const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const updateAllToRealCompanies = async () => {
  try {
    await connectDB();
    console.log('Updating all to real companies...');
    
    // Remove old dummy companies
    const oldCompanies = ['TechCorp Solutions', 'Global Finance Corp', 'EduTech Innovations', 'Digital Marketing Pro'];
    
    for (const companyName of oldCompanies) {
      const employer = await Employer.findOne({ companyName });
      if (employer) {
        console.log(`Removing ${companyName}...`);
        await Job.deleteMany({ employerId: employer._id });
        await EmployerProfile.deleteOne({ employerId: employer._id });
        await Employer.deleteOne({ _id: employer._id });
        console.log(`Removed ${companyName}`);
      }
    }
    
    // Add new real companies
    const realCompanies = [
      {
        name: 'Wipro Limited',
        email: 'careers@wipro.com',
        password: 'password123',
        phone: '+91-8028440011',
        companyName: 'Wipro Limited',
        employerType: 'company',
        isVerified: true,
        isApproved: true,
        profile: {
          description: 'Leading global information technology, consulting and business process services company. We harness the power of cognitive computing, hyper-automation, robotics, cloud, analytics and emerging technologies.',
          location: 'Bangalore, Karnataka',
          industry: 'Information Technology Services',
          establishedSince: '1945',
          teamSize: '230,000+',
          website: 'https://www.wipro.com'
        },
        jobs: [
          {
            title: 'Senior Software Engineer',
            description: 'Develop and maintain enterprise applications using latest technologies for global clients',
            location: 'Bangalore',
            jobType: 'full-time',
            category: 'Technology',
            salary: { min: 800000, max: 1400000 },
            requiredSkills: ['Java', 'Spring Boot', 'React', 'Microservices']
          },
          {
            title: 'Cloud Engineer',
            description: 'Design and implement cloud solutions on AWS, Azure and Google Cloud platforms',
            location: 'Hyderabad',
            jobType: 'full-time',
            category: 'Technology',
            salary: { min: 900000, max: 1600000 },
            requiredSkills: ['AWS', 'Azure', 'Docker', 'Kubernetes']
          }
        ]
      },
      {
        name: 'HDFC Bank',
        email: 'careers@hdfcbank.com',
        password: 'password123',
        phone: '+91-2266316000',
        companyName: 'HDFC Bank',
        employerType: 'company',
        isVerified: true,
        isApproved: true,
        profile: {
          description: 'India largest private sector bank and leading banking and financial services company. We offer a wide range of commercial and transactional banking services.',
          location: 'Mumbai, Maharashtra',
          industry: 'Banking & Financial Services',
          establishedSince: '1994',
          teamSize: '120,000+',
          website: 'https://www.hdfcbank.com'
        },
        jobs: [
          {
            title: 'Relationship Manager',
            description: 'Manage high-value client relationships and provide comprehensive banking solutions',
            location: 'Mumbai',
            jobType: 'full-time',
            category: 'Banking',
            salary: { min: 600000, max: 1200000 },
            requiredSkills: ['Sales', 'Customer Relationship', 'Banking Products', 'Communication']
          },
          {
            title: 'Credit Analyst',
            description: 'Analyze credit applications and assess risk for loan approvals',
            location: 'Delhi',
            jobType: 'full-time',
            category: 'Finance',
            salary: { min: 500000, max: 900000 },
            requiredSkills: ['Credit Analysis', 'Risk Assessment', 'Financial Modeling', 'Excel']
          }
        ]
      },
      {
        name: 'BYJU\'S',
        email: 'careers@byjus.com',
        password: 'password123',
        phone: '+91-8061152000',
        companyName: 'BYJU\'S',
        employerType: 'company',
        isVerified: true,
        isApproved: true,
        profile: {
          description: 'World leading edtech company and the creator of India most loved school learning app. We make learning engaging, effective and accessible for millions of students.',
          location: 'Bangalore, Karnataka',
          industry: 'Education Technology',
          establishedSince: '2011',
          teamSize: '50,000+',
          website: 'https://byjus.com'
        },
        jobs: [
          {
            title: 'Product Manager',
            description: 'Drive product strategy and development for our learning platform used by millions of students',
            location: 'Bangalore',
            jobType: 'full-time',
            category: 'Product Management',
            salary: { min: 1500000, max: 2500000 },
            requiredSkills: ['Product Management', 'EdTech', 'User Research', 'Analytics']
          },
          {
            title: 'Content Developer',
            description: 'Create engaging educational content and curriculum for K-12 students',
            location: 'Bangalore',
            jobType: 'full-time',
            category: 'Content',
            salary: { min: 600000, max: 1200000 },
            requiredSkills: ['Content Creation', 'Curriculum Design', 'Subject Matter Expertise', 'Video Production']
          }
        ]
      },
      {
        name: 'Flipkart',
        email: 'careers@flipkart.com',
        password: 'password123',
        phone: '+91-8067178000',
        companyName: 'Flipkart',
        employerType: 'company',
        isVerified: true,
        isApproved: true,
        profile: {
          description: 'India leading e-commerce marketplace, transforming commerce in India through technology. We are committed to making commerce accessible, affordable and enjoyable for everyone.',
          location: 'Bangalore, Karnataka',
          industry: 'E-commerce',
          establishedSince: '2007',
          teamSize: '50,000+',
          website: 'https://www.flipkart.com'
        },
        jobs: [
          {
            title: 'Software Development Engineer',
            description: 'Build scalable systems and features for India largest e-commerce platform',
            location: 'Bangalore',
            jobType: 'full-time',
            category: 'Technology',
            salary: { min: 1200000, max: 2000000 },
            requiredSkills: ['Java', 'Python', 'System Design', 'Microservices']
          },
          {
            title: 'Product Manager',
            description: 'Drive product strategy for key e-commerce initiatives and customer experience',
            location: 'Bangalore',
            jobType: 'full-time',
            category: 'Product Management',
            salary: { min: 1800000, max: 3000000 },
            requiredSkills: ['Product Strategy', 'E-commerce', 'Analytics', 'User Experience']
          }
        ]
      }
    ];
    
    for (const companyData of realCompanies) {
      const existingEmployer = await Employer.findOne({ email: companyData.email });
      if (existingEmployer) {
        console.log(`${companyData.companyName} already exists, skipping...`);
        continue;
      }
      
      const employer = await Employer.create({
        name: companyData.name,
        email: companyData.email,
        password: companyData.password,
        phone: companyData.phone,
        companyName: companyData.companyName,
        employerType: companyData.employerType,
        isVerified: companyData.isVerified,
        isApproved: companyData.isApproved
      });
      
      console.log(`Created employer: ${employer.companyName}`);
      
      const profile = await EmployerProfile.create({
        employerId: employer._id,
        companyName: employer.companyName,
        email: employer.email,
        phone: employer.phone,
        ...companyData.profile
      });
      
      console.log(`Created profile for: ${employer.companyName}`);
      
      for (const jobData of companyData.jobs) {
        const job = await Job.create({
          ...jobData,
          employerId: employer._id,
          companyName: employer.companyName,
          status: 'active',
          vacancies: Math.floor(Math.random() * 5) + 1,
          applicationCount: Math.floor(Math.random() * 20),
          postedBy: employer.employerType
        });
        
        console.log(`Created job: ${job.title} for ${employer.companyName}`);
      }
    }
    
    console.log('All companies updated to real data!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
};

updateAllToRealCompanies();