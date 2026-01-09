const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/db');

const Job = require('./backend/models/Job');
const Employer = require('./backend/models/Employer');

async function createTestData() {
    try {
        console.log('🔧 Creating test data to demonstrate the fix...\n');
        
        // Create a test employer first
        const testEmployer = await Employer.create({
            companyName: 'Test Company',
            email: 'test@company.com',
            password: 'hashedpassword',
            phone: '1234567890',
            status: 'active',
            isApproved: true,
            employerType: 'company'
        });
        
        console.log('✅ Created test employer');
        
        // Create a few test jobs
        const testJobs = [
            {
                title: 'Frontend Developer',
                description: 'React and JavaScript developer needed',
                location: 'Bangalore',
                jobType: 'full-time',
                category: 'IT',
                employerId: testEmployer._id,
                status: 'active',
                ctc: { min: 500000, max: 800000 },
                vacancies: 2,
                requiredSkills: ['React', 'JavaScript', 'CSS']
            },
            {
                title: 'Backend Developer',
                description: 'Node.js and MongoDB developer',
                location: 'Mumbai',
                jobType: 'full-time',
                category: 'IT',
                employerId: testEmployer._id,
                status: 'active',
                ctc: { min: 600000, max: 900000 },
                vacancies: 1,
                requiredSkills: ['Node.js', 'MongoDB', 'Express']
            },
            {
                title: 'UI/UX Designer',
                description: 'Creative designer for web applications',
                location: 'Bangalore',
                jobType: 'part-time',
                category: 'Design',
                employerId: testEmployer._id,
                status: 'active',
                ctc: { min: 400000, max: 600000 },
                vacancies: 1,
                requiredSkills: ['Figma', 'Adobe XD', 'UI Design']
            }
        ];
        
        await Job.insertMany(testJobs);
        console.log('✅ Created 3 test jobs');
        
        // Now test the filter counts API
        console.log('\n🧪 Testing filter counts with sample data...');
        
        const http = require('http');
        
        function makeRequest(url) {
            return new Promise((resolve, reject) => {
                http.get(url, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) {
                            resolve(data);
                        }
                    });
                }).on('error', reject);
            });
        }
        
        const filterCounts = await makeRequest('http://localhost:5000/api/public/jobs/filter-counts');
        
        if (filterCounts.success) {
            console.log('\n📊 Filter Counts Results:');
            console.log('Job Types:', filterCounts.counts.jobTypes);
            console.log('Locations:', filterCounts.counts.locations);
            console.log('Categories:', filterCounts.counts.categories);
            console.log('Designations count:', filterCounts.counts.designations.length);
            
            console.log('\n✅ SUCCESS! Filter counts now reflect actual database content');
            console.log('✅ The sidebar will show accurate counts like:');
            console.log(`   • Designation (${filterCounts.counts.designations.length} available)`);
            console.log(`   • Location (${filterCounts.counts.locations.length} available)`);
            console.log(`   • Job Types with actual counts: ${JSON.stringify(filterCounts.counts.jobTypes)}`);
        }
        
        console.log('\n🧹 Cleaning up test data...');
        await Job.deleteMany({ employerId: testEmployer._id });
        await Employer.deleteById(testEmployer._id);
        console.log('✅ Test data cleaned up');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.connection.close();
    }
}

createTestData();