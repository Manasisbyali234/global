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

const updateToRealCompanies = async () => {
  try {
    await connectDB();
    console.log('Updating to real companies...');
    
    // Remove old dummy companies
    const oldCompanies = ['HealthCare Plus', 'Manufacturing Excellence Ltd', 'Flipkart'];
    
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
        name: 'Apollo Hospitals',
        email: 'careers@apollohospitals.com',
        password: 'password123',
        phone: '+91-4428290200',
        companyName: 'Apollo Hospitals',
        employerType: 'company',
        isVerified: true,
        isApproved: true,
        profile: {
          description: 'Asia largest and most trusted multi-specialty chain of hospitals. Pioneer in bringing world-class healthcare to India with over 10,000 beds across 64+ hospitals.',
          location: 'Chennai, Tamil Nadu',
          industry: 'Healthcare',
          establishedSince: '1983',
          teamSize: '60,000+',
          website: 'https://www.apollohospitals.com'
        },
        jobs: [
          {
            title: 'Consultant Cardiologist',
            description: 'Join our team of expert cardiologists at Apollo Hospitals. Provide comprehensive cardiac care and perform advanced procedures.',
            location: 'Chennai',
            jobType: 'full-time',
            category: 'Healthcare',
            salary: { min: 2000000, max: 4000000 },
            requiredSkills: ['MD Cardiology', 'DM Cardiology', 'Interventional Cardiology', 'Patient Care']
          },
          {
            title: 'Staff Nurse',
            description: 'Provide quality nursing care to patients in our multi-specialty hospital environment.',
            location: 'Delhi',
            jobType: 'full-time',
            category: 'Healthcare',
            salary: { min: 300000, max: 500000 },
            requiredSkills: ['B.Sc Nursing', 'GNM', 'Patient Care', 'Medical Procedures']
          }
        ]
      },
      {
        name: 'Mahindra & Mahindra',
        email: 'careers@mahindra.com',
        password: 'password123',
        phone: '+91-2224901441',
        companyName: 'Mahindra & Mahindra',
        employerType: 'company',
        isVerified: true,
        isApproved: true,
        profile: {
          description: 'One of India largest multinational automotive manufacturing corporations. Part of the Mahindra Group, we are a leading manufacturer of tractors, commercial vehicles, and SUVs.',
          location: 'Mumbai, Maharashtra',
          industry: 'Automotive Manufacturing',
          establishedSince: '1945',
          teamSize: '240,000+',
          website: 'https://www.mahindra.com'
        },
        jobs: [
          {
            title: 'Production Engineer',
            description: 'Lead manufacturing operations for automotive production lines. Ensure quality standards and optimize production processes.',
            location: 'Chennai',
            jobType: 'full-time',
            category: 'Manufacturing',
            salary: { min: 600000, max: 1200000 },
            requiredSkills: ['Mechanical Engineering', 'Production Planning', 'Quality Control', 'Lean Manufacturing']
          },
          {
            title: 'Design Engineer',
            description: 'Design and develop automotive components and systems using CAD software and engineering principles.',
            location: 'Pune',
            jobType: 'full-time',
            category: 'Engineering',
            salary: { min: 500000, max: 1000000 },
            requiredSkills: ['AutoCAD', 'SolidWorks', 'Mechanical Design', 'Product Development']
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
    
    console.log('Update completed!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
};

updateToRealCompanies();