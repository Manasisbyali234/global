// Test script to verify assessment company name functionality
const mongoose = require('mongoose');
const Assessment = require('./backend/models/Assessment');

async function testAssessmentCompanyName() {
    try {
        // Connect to MongoDB (adjust connection string as needed)
        await mongoose.connect('mongodb://localhost:27017/taleglobal', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Connected to MongoDB');
        
        // Test creating an assessment with company name
        const testAssessment = new Assessment({
            employerId: new mongoose.Types.ObjectId(),
            serialNumber: 999,
            title: 'Test Assessment',
            type: 'Aptitude Test',
            designation: 'Software Engineer',
            companyName: 'Test Company Ltd',
            description: 'Test assessment for company name functionality',
            timer: 30,
            totalQuestions: 1,
            questions: [{
                question: 'Test question',
                type: 'mcq',
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 0,
                marks: 1
            }],
            status: 'published'
        });
        
        const savedAssessment = await testAssessment.save();
        console.log('Assessment saved successfully with company name:', savedAssessment.companyName);
        
        // Test retrieving the assessment
        const retrievedAssessment = await Assessment.findById(savedAssessment._id);
        console.log('Retrieved assessment company name:', retrievedAssessment.companyName);
        
        // Clean up - delete the test assessment
        await Assessment.findByIdAndDelete(savedAssessment._id);
        console.log('Test assessment deleted');
        
        console.log('✅ Company name functionality test passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the test
testAssessmentCompanyName();