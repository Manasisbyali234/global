const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Job = require('./models/Job');
const Employer = require('./models/Employer');
const EmployerProfile = require('./models/EmployerProfile');

const BASE_URL = 'http://localhost:3000';

async function testJobPostingAPI() {
  try {
    console.log('🔍 Testing Job Posting API Endpoint...\n');
    
    // Connect to database
    console.log('📡 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');
    
    // Find an approved employer with complete profile
    console.log('🔍 Finding approved employer with complete profile...');
    const approvedEmployers = await Employer.find({ isApproved: true });
    
    let testEmployer = null;
    let testProfile = null;
    
    for (const employer of approvedEmployers) {
      const profile = await EmployerProfile.findOne({ employerId: employer._id });
      if (profile) {
        const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
        const requiredDocuments = ['panCardImage', 'cinImage', 'gstImage', 'certificateOfIncorporation'];
        
        const missingFields = requiredFields.filter(field => !profile[field] || profile[field].trim() === '');
        const missingDocs = requiredDocuments.filter(field => !profile[field] || profile[field].trim() === '');
        
        if (missingFields.length === 0 && missingDocs.length === 0) {
          testEmployer = employer;
          testProfile = profile;
          break;
        }
      }
    }
    
    if (!testEmployer) {
      console.log('❌ No approved employer with complete profile found');
      console.log('📝 Creating a test employer with complete profile...');
      
      // Create test employer
      testEmployer = await Employer.create({
        name: 'Test Company',
        email: 'test@company.com',
        companyName: 'Test Company Ltd',
        employerType: 'company',
        isApproved: true,
        password: 'test123'
      });
      
      // Create complete profile
      testProfile = await EmployerProfile.create({
        employerId: testEmployer._id,
        companyName: 'Test Company Ltd',
        description: 'A test company for API testing',
        location: 'Mumbai, India',
        phone: '9876543210',
        email: 'test@company.com',
        panCardImage: 'data:image/jpeg;base64,test',
        cinImage: 'data:image/jpeg;base64,test',
        gstImage: 'data:image/jpeg;base64,test',
        certificateOfIncorporation: 'data:image/jpeg;base64,test'
      });
      
      console.log('✅ Test employer created');
    }
    
    console.log(`✅ Using employer: ${testEmployer.name} (${testEmployer.email})`);
    
    // Generate JWT token for testing
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: testEmployer._id, role: 'employer' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('🔑 Generated test token');
    
    // Test job posting data
    const testJobData = {
      title: 'Test Software Developer',
      description: 'This is a test job posting to verify API functionality',
      location: 'Bangalore, India',
      jobType: 'full-time',
      category: 'IT',
      typeOfEmployment: 'permanent',
      shift: 'day',
      ctc: '5-8',
      experienceLevel: 'freshers',
      minExperience: 0,
      maxExperience: 2,
      requiredSkills: ['JavaScript', 'React', 'Node.js'],
      responsibilities: ['Develop web applications', 'Write clean code', 'Collaborate with team'],
      benefits: ['Health insurance', 'Flexible hours'],
      vacancies: 2,
      education: 'Bachelor\'s degree in Computer Science',
      backlogsAllowed: false
    };
    
    console.log('\n🚀 Testing job posting API...');
    
    // Get job count before posting
    const jobCountBefore = await Job.countDocuments();
    console.log(`📊 Jobs before posting: ${jobCountBefore}`);
    
    try {
      // Make API request to post job
      const response = await axios.post(
        `${BASE_URL}/api/employer/jobs`,
        testJobData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Job posting API response:', response.status);
      console.log('📝 Response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        const jobId = response.data.job._id;
        console.log(`✅ Job created with ID: ${jobId}`);
        
        // Verify job was stored in database
        const storedJob = await Job.findById(jobId);
        if (storedJob) {
          console.log('✅ Job successfully stored in database');
          console.log(`   Title: ${storedJob.title}`);
          console.log(`   Location: ${storedJob.location}`);
          console.log(`   Status: ${storedJob.status}`);
          console.log(`   Created: ${storedJob.createdAt}`);
          
          // Check job count after posting
          const jobCountAfter = await Job.countDocuments();
          console.log(`📊 Jobs after posting: ${jobCountAfter}`);
          console.log(`📈 Jobs increased by: ${jobCountAfter - jobCountBefore}`);
          
        } else {
          console.log('❌ Job not found in database after posting');
        }
      } else {
        console.log('❌ Job posting failed:', response.data.message);
      }
      
    } catch (apiError) {
      console.log('❌ API Error:', apiError.response?.status, apiError.response?.data || apiError.message);
      
      if (apiError.response?.status === 403) {
        console.log('🔍 Checking employer approval status...');
        const employer = await Employer.findById(testEmployer._id);
        console.log(`   isApproved: ${employer.isApproved}`);
        console.log(`   profileSubmittedForReview: ${employer.profileSubmittedForReview}`);
      }
    }
    
    // Test backend server health
    console.log('\n🏥 Testing backend server health...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/public/health`);
      console.log('✅ Backend server is running');
    } catch (healthError) {
      console.log('❌ Backend server health check failed:', healthError.message);
      console.log('💡 Make sure the backend server is running on port 3000');
    }
    
  } catch (error) {
    console.error('❌ Error testing job posting API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from database');
  }
}

// Run the test
testJobPostingAPI();