const mongoose = require('mongoose');
const AssessmentAttempt = require('./models/AssessmentAttempt');
const Candidate = require('./models/Candidate');
const Application = require('./models/Application');
const Assessment = require('./models/Assessment');
const Job = require('./models/Job');
const Employer = require('./models/Employer');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testAssessmentFlow() {
  try {
    console.log('=== TESTING ASSESSMENT DATA FLOW ===\n');
    
    // 1. Find a sample assessment with results
    const sampleAssessment = await Assessment.findOne({}).populate('employerId', 'companyName');
    if (!sampleAssessment) {
      console.log('No assessments found in database');
      return;
    }
    
    console.log(`Testing with assessment: ${sampleAssessment.title} (ID: ${sampleAssessment._id})`);
    console.log(`Employer: ${sampleAssessment.employerId?.companyName || 'Unknown'}\n`);
    
    // 2. Find assessment attempts for this assessment
    const attempts = await AssessmentAttempt.find({
      assessmentId: sampleAssessment._id,
      status: { $in: ['completed', 'expired'] }
    }).populate('candidateId', 'name email phone')
      .populate('applicationId', '_id');
    
    console.log(`Found ${attempts.length} completed assessment attempts\n`);
    
    // 3. Test the employer's assessment results endpoint logic
    console.log('=== SIMULATING EMPLOYER ASSESSMENT RESULTS ===');
    
    const resultsWithViolations = attempts.map(r => {
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
    
    console.log('Assessment results summary:');
    resultsWithViolations.forEach((result, index) => {
      console.log(`${index + 1}. Attempt ID: ${result._id}`);
      console.log(`   Candidate: ${result.candidateId?.name || 'N/A'} (${result.candidateId?.email || 'N/A'})`);
      console.log(`   Score: ${result.score}/${result.totalMarks} (${result.percentage}%)`);
      console.log(`   Result: ${result.result}`);
      console.log(`   Violations: ${result.violations.length}`);
      console.log(`   Status: ${result.status}`);
      console.log('');
    });
    
    // 4. Test candidate status page logic
    console.log('=== SIMULATING CANDIDATE STATUS PAGE ===');
    
    // Find applications that have assessments
    const applicationsWithAssessments = await Application.find({
      assessmentStatus: { $exists: true, $ne: 'not_required' }
    }).populate({
      path: 'jobId',
      select: 'title assessmentId assessmentStartDate assessmentEndDate'
    }).populate('candidateId', 'name email')
      .populate('employerId', 'companyName')
      .limit(5);
    
    console.log(`Found ${applicationsWithAssessments.length} applications with assessments\n`);
    
    for (const app of applicationsWithAssessments) {
      console.log(`Application ID: ${app._id}`);
      console.log(`Candidate: ${app.candidateId?.name || 'N/A'} (${app.candidateId?.email || 'N/A'})`);
      console.log(`Job: ${app.jobId?.title || 'N/A'}`);
      console.log(`Company: ${app.employerId?.companyName || 'N/A'}`);
      console.log(`Assessment Status: ${app.assessmentStatus}`);
      
      // Check if there's an assessment attempt
      if (app.jobId?.assessmentId) {
        const attempt = await AssessmentAttempt.findOne({
          applicationId: app._id,
          candidateId: app.candidateId?._id,
          assessmentId: app.jobId.assessmentId
        });
        
        if (attempt) {
          console.log(`Assessment Attempt: ${attempt._id} (Status: ${attempt.status})`);
          console.log(`Score: ${attempt.score}/${attempt.totalMarks}`);
        } else {
          console.log('No assessment attempt found');
        }
      }
      console.log('---');
    }
    
    // 5. Check for data consistency issues
    console.log('\n=== CHECKING DATA CONSISTENCY ===');
    
    const inconsistentApplications = await Application.find({
      assessmentStatus: 'completed',
      $or: [
        { assessmentScore: { $exists: false } },
        { assessmentScore: null },
        { assessmentPercentage: { $exists: false } },
        { assessmentPercentage: null }
      ]
    });
    
    console.log(`Applications with completed assessment but missing scores: ${inconsistentApplications.length}`);
    
    const orphanedAttempts = await AssessmentAttempt.find({
      candidateId: { $exists: false }
    });
    
    console.log(`Assessment attempts with missing candidate ID: ${orphanedAttempts.length}`);
    
    console.log('\n=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAssessmentFlow();