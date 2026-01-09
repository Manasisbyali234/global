const mongoose = require('mongoose');
const Assessment = require('./models/Assessment');
const AssessmentAttempt = require('./models/AssessmentAttempt');
const Candidate = require('./models/Candidate');
const Employer = require('./models/Employer');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function listAssessmentsWithResults() {
  try {
    console.log('=== ASSESSMENTS WITH RESULTS ===\n');
    
    // Get all assessments
    const assessments = await Assessment.find({}).populate('employerId', 'companyName').lean();
    
    console.log(`Total assessments: ${assessments.length}\n`);
    
    for (const assessment of assessments) {
      // Count completed attempts for this assessment
      const completedCount = await AssessmentAttempt.countDocuments({
        assessmentId: assessment._id,
        status: { $in: ['completed', 'expired'] }
      });
      
      console.log(`Assessment: ${assessment.title}`);
      console.log(`ID: ${assessment._id}`);
      console.log(`Employer: ${assessment.employerId?.companyName || 'Unknown'}`);
      console.log(`Completed Attempts: ${completedCount}`);
      
      if (completedCount > 0) {
        console.log('✅ HAS RESULTS - URL: http://localhost:3000/employer/assessment-results/' + assessment._id);
        
        // Show sample results
        const sampleResults = await AssessmentAttempt.find({
          assessmentId: assessment._id,
          status: { $in: ['completed', 'expired'] }
        }).populate('candidateId', 'name email').limit(3);
        
        console.log('Sample results:');
        sampleResults.forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.candidateId?.name || 'N/A'} - Score: ${result.score}/${result.totalMarks}`);
        });
      } else {
        console.log('❌ No results yet');
      }
      
      console.log('---\n');
    }
    
    console.log('=== SUMMARY ===');
    const assessmentsWithResults = await Assessment.aggregate([
      {
        $lookup: {
          from: 'assessmentattempts',
          localField: '_id',
          foreignField: 'assessmentId',
          as: 'attempts'
        }
      },
      {
        $addFields: {
          completedAttempts: {
            $size: {
              $filter: {
                input: '$attempts',
                cond: { $in: ['$$this.status', ['completed', 'expired']] }
              }
            }
          }
        }
      },
      {
        $match: { completedAttempts: { $gt: 0 } }
      }
    ]);
    
    console.log(`Assessments with results: ${assessmentsWithResults.length}/${assessments.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

listAssessmentsWithResults();