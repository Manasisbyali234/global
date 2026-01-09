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

const sampleRecruiters = [
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
  },
  {
    name: 'Infosys Limited',
    email: 'careers@infosys.com',
    password: 'password123',
    phone: '+91-8067461000',
    companyName: 'Infosys Limited',
    employerType: 'company',
    isVerified: true,
    isApproved: true,
    profile: {
      description: 'Global leader in next-generation digital services and consulting. We enable clients in 46+ countries to navigate their digital transformation.',
      location: 'Bangalore, Karnataka',
      industry: 'Information Technology Services',
      establishedSince: '1981',
      teamSize: '250,000+',
      website: 'https://www.infosys.com'
    },
    jobs: [
      {
        title: 'Software Engineer',
        description: 'Join our team to work on cutting-edge technology solutions for global clients',
        location: 'Bangalore',
        jobType: 'full-time',
        category: 'Technology',
        salary: { min: 400000, max: 800000 },
        requiredSkills: ['Java', 'Python', 'Spring Boot', 'Microservices']
      },
      {
        title: 'Data Scientist',
        description: 'Analyze complex data sets to drive business insights and AI solutions',
        location: 'Pune',
        jobType: 'full-time',
        category: 'Data Science',
        salary: { min: 800000, max: 1500000 },
        requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Tableau']
      }
    ]
  },
  {
    name: 'Tata Consultancy Services',
    email: 'careers@tcs.com',
    password: 'password123',
    phone: '+91-2266578000',
    companyName: 'Tata Consultancy Services',
    employerType: 'company',
    isVerified: true,
    isApproved: true,
    profile: {
      description: 'Leading global IT services, consulting and business solutions organization. Part of the Tata Group, serving clients across 46 countries.',
      location: 'Mumbai, Maharashtra',
      industry: 'Information Technology Services',
      establishedSince: '1968',
      teamSize: '500,000+',
      website: 'https://www.tcs.com'
    },
    jobs: [
      {
        title: 'System Engineer',
        description: 'Entry-level position for fresh graduates to start their IT career with comprehensive training',
        location: 'Chennai',
        jobType: 'full-time',
        category: 'Technology',
        salary: { min: 350000, max: 600000 },
        requiredSkills: ['Programming', 'Database', 'Web Technologies', 'Communication']
      },
      {
        title: 'Business Analyst',
        description: 'Analyze business requirements and translate them into technical solutions',
        location: 'Hyderabad',
        jobType: 'full-time',
        category: 'Business Analysis',
        salary: { min: 600000, max: 1200000 },
        requiredSkills: ['Business Analysis', 'Requirements Gathering', 'SQL', 'Agile']
      }
    ]
  }
];

const addRecruitersData = async () => {
  try {
    console.log('Adding sample recruiters data...');
    
    for (const recruiterData of sampleRecruiters) {
      // Check if employer already exists
      const existingEmployer = await Employer.findOne({ email: recruiterData.email });
      if (existingEmployer) {
        console.log(`Employer ${recruiterData.companyName} already exists, skipping...`);
        continue;
      }
      
      // Create employer
      const employer = await Employer.create({
        name: recruiterData.name,
        email: recruiterData.email,
        password: recruiterData.password,
        phone: recruiterData.phone,
        companyName: recruiterData.companyName,
        employerType: recruiterData.employerType,
        isVerified: recruiterData.isVerified,
        isApproved: recruiterData.isApproved
      });
      
      console.log(`Created employer: ${employer.companyName}`);
      
      // Create employer profile
      const profile = await EmployerProfile.create({
        employerId: employer._id,
        companyName: employer.companyName,
        email: employer.email,
        phone: employer.phone,
        ...recruiterData.profile
      });
      
      console.log(`Created profile for: ${employer.companyName}`);
      
      // Create jobs for this employer
      for (const jobData of recruiterData.jobs) {
        const job = await Job.create({
          ...jobData,
          employerId: employer._id,
          companyName: employer.companyName,
          status: 'active',
          vacancies: Math.floor(Math.random() * 5) + 1, // Random vacancies 1-5
          applicationCount: Math.floor(Math.random() * 20), // Random application count
          postedBy: employer.employerType
        });
        
        console.log(`Created job: ${job.title} for ${employer.companyName}`);
      }
    }
    
    console.log('Sample recruiters data added successfully!');
    
    // Display summary
    const totalEmployers = await Employer.countDocuments();
    const totalJobs = await Job.countDocuments();
    console.log(`\nSummary:`);
    console.log(`Total Employers: ${totalEmployers}`);
    console.log(`Total Jobs: ${totalJobs}`);
    
  } catch (error) {
    console.error('Error adding recruiters data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
connectDB().then(() => {
  addRecruitersData();
});