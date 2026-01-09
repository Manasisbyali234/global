const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Candidate = require('../models/Candidate');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');

mongoose.connect('mongodb://localhost:27017/job-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createTestData() {
  try {
    // Find or create employer
    let employer = await Employer.findOne({});
    if (!employer) {
      console.log('No employer found. Please create an employer first.');
      process.exit(1);
    }
    console.log(`Using employer: ${employer.companyName}`);

    // Find or create candidate
    let candidate = await Candidate.findOne({});
    if (!candidate) {
      console.log('No candidate found. Please create a candidate first.');
      process.exit(1);
    }
    console.log(`Using candidate: ${candidate.name}`);

    // Find or create job
    let job = await Job.findOne({ employerId: employer._id });
    if (!job) {
      console.log('No job found. Please create a job first.');
      process.exit(1);
    }
    console.log(`Using job: ${job.title}`);

    // Find or create assessment
    let assessment = await Assessment.findOne({ employerId: employer._id });
    if (!assessment) {
      console.log('No assessment found. Please create an assessment first.');
      process.exit(1);
    }
    console.log(`Using assessment: ${assessment.title}`);

    // Create application if doesn't exist
    let application = await Application.findOne({ candidateId: candidate._id, jobId: job._id });
    if (!application) {
      application = new Application({
        candidateId: candidate._id,
        jobId: job._id,
        employerId: employer._id,
        status: 'pending'
      });
      await application.save();
      console.log('Created application');
    }

    // Create assessment attempt with violations
    const attempt = new AssessmentAttempt({
      assessmentId: assessment._id,
      candidateId: candidate._id,
      jobId: job._id,
      applicationId: application._id,
      status: 'completed',
      startTime: new Date(Date.now() - 1800000), // 30 mins ago
      endTime: new Date(),
      timeRemaining: 0,
      currentQuestion: assessment.questions.length,
      answers: assessment.questions.map((q, idx) => ({
        questionIndex: idx,
        selectedAnswer: 0,
        timeSpent: 60,
        answeredAt: new Date()
      })),
      score: 5,
      totalMarks: assessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0),
      percentage: 50,
      result: 'pass',
      violations: [
        { type: 'tab_switch', timestamp: new Date(Date.now() - 1500000), details: 'User switched browser tabs' },
        { type: 'tab_switch', timestamp: new Date(Date.now() - 1200000), details: 'User switched browser tabs' },
        { type: 'window_blur', timestamp: new Date(Date.now() - 900000), details: 'Browser window lost focus' },
        { type: 'tab_switch', timestamp: new Date(Date.now() - 600000), details: 'User switched browser tabs' },
        { type: 'copy_attempt', timestamp: new Date(Date.now() - 300000), details: 'Copy action attempted' }
      ]
    });

    await attempt.save();
    console.log(`\n✓ Created assessment attempt with 5 violations`);
    console.log(`  Attempt ID: ${attempt._id}`);
    console.log(`  Assessment ID: ${assessment._id}`);
    console.log(`\nNow visit: http://localhost:3000/employer/assessment-results/${assessment._id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestData();
