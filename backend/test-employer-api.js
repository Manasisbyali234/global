const mongoose = require('mongoose');
const Assessment = require('./models/Assessment');
const AssessmentAttempt = require('./models/AssessmentAttempt');
const Candidate = require('./models/Candidate');
const Employer = require('./models/Employer');
const Application = require('./models/Application');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testEmployerAPI() {
  try {
    console.log('=== TESTING EMPLOYER ASSESSMENT RESULTS API ===\n');
    
    // 1. Find an assessment that has results
    const assessmentWithResults = await Assessment.findOne({}).lean();
    if (!assessmentWithResults) {
      console.log('No assessments found');
      return;
    }
    
    console.log(`Testing with assessment: ${assessmentWithResults.title} (ID: ${assessmentWithResults._id})`);
    
    // 2. Check if this assessment has any attempts
    const attemptCount = await AssessmentAttempt.countDocuments({
      assessmentId: assessmentWithResults._id,
      status: { $in: ['completed', 'expired'] }
    });
    
    console.log(`This assessment has ${attemptCount} completed attempts`);
    
    if (attemptCount === 0) {
      console.log('No completed attempts for this assessment. Finding one with results...');
      
      // Find an assessment that actually has results
      const assessmentIds = await AssessmentAttempt.distinct('assessmentId', {
        status: { $in: ['completed', 'expired'] }
      });
      
      if (assessmentIds.length === 0) {
        console.log('No assessments with completed attempts found');
        return;
      }
      
      const assessmentWithAttempts = await Assessment.findById(assessmentIds[0]);
      console.log(`Using assessment with results: ${assessmentWithAttempts.title} (ID: ${assessmentWithAttempts._id})`);
      
      // 3. Simulate the exact API call from assessmentController.getAssessmentResults
      console.log('\\n=== SIMULATING API CALL ===');
      
      const results = await AssessmentAttempt.find({
        assessmentId: assessmentWithAttempts._id,
        status: { $in: ['completed', 'expired'] }
      }).populate('candidateId', 'name email phone')
        .sort({ endTime: -1 });
      
      console.log(`Raw results count: ${results.length}`);
      
      // Process results like in the controller
      const resultsWithViolations = results.map(r => {
        const resultObj = r.toObject();
        return {
          ...resultObj,
          violations: resultObj.violations || [],
          // Ensure candidate data is available
          candidateId: resultObj.candidateId || {
            name: 'N/A',
            email: 'N/A',
            phone: 'N/A'
          }
        };
      });
      
      console.log('\\nProcessed results:');
      resultsWithViolations.forEach((result, index) => {
        console.log(`${index + 1}. Candidate: ${result.candidateId?.name || 'N/A'} (${result.candidateId?.email || 'N/A'})`);
        console.log(`   Score: ${result.score}/${result.totalMarks} (${result.percentage}%)`);
        console.log(`   Violations: ${result.violations.length}`);
        console.log(`   Raw candidateId type: ${typeof result.candidateId}`);
        console.log(`   Raw candidateId value:`, result.candidateId);
        console.log('');
      });
      
      // 4. Test the exact response structure
      const apiResponse = {
        success: true,
        assessment: assessmentWithAttempts,
        results: resultsWithViolations
      };
      
      console.log('\\n=== API RESPONSE STRUCTURE ===');
      console.log(`Success: ${apiResponse.success}`);
      console.log(`Assessment title: ${apiResponse.assessment.title}`);
      console.log(`Results count: ${apiResponse.results.length}`);
      console.log('First result candidate data:', {
        name: apiResponse.results[0]?.candidateId?.name,
        email: apiResponse.results[0]?.candidateId?.email,
        phone: apiResponse.results[0]?.candidateId?.phone
      });
    }
    
    console.log('\\n=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testEmployerAPI();