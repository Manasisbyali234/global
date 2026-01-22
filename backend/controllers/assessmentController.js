const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Application = require('../models/Application');
const Job = require('../models/Job');

// Employer: Create Assessment
exports.createAssessment = async (req, res) => {
  try {
    const { title, type, designation, description, instructions, timer, questions } = req.body;
    
    // Additional server-side validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Assessment type is required' });
    }
    
    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required' });
    }
    
    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      const questionText = question.question ? question.question.replace(/<[^>]*>/g, '').trim() : '';
      if (!questionText) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} text is required` 
        });
      }
      
      // Only validate options and correctAnswer for MCQ questions
      const questionType = question.type || 'mcq';
      if (questionType === 'mcq' || questionType === 'visual-mcq') {
        if (!question.options || question.options.length < 2) {
          return res.status(400).json({ 
            success: false, 
            message: `Question ${i + 1} must have at least 2 options` 
          });
        }
        
        // Check if all options are filled
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j] || question.options[j].trim().length === 0) {
            return res.status(400).json({ 
              success: false, 
              message: `Question ${i + 1}, Option ${String.fromCharCode(65 + j)} is required` 
            });
          }
        }
        
        if (question.correctAnswer === undefined || question.correctAnswer === null || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          return res.status(400).json({ 
            success: false, 
            message: `Question ${i + 1} must have a valid correct answer selected` 
          });
        }
      }
      
      if (!question.marks || question.marks < 1) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} must have at least 1 mark` 
        });
      }
    }
    
    // Generate serial number
    const lastAssessment = await Assessment.findOne({ employerId: req.user._id })
      .sort({ serialNumber: -1 })
      .select('serialNumber');
    
    let serialNumber = 1;
    if (lastAssessment && typeof lastAssessment.serialNumber === 'number' && !isNaN(lastAssessment.serialNumber)) {
      serialNumber = lastAssessment.serialNumber + 1;
    }
    
    const assessment = new Assessment({
      employerId: req.user._id,
      serialNumber,
      title: title.trim(),
      type: type || 'Aptitude Test',
      designation: designation ? designation.trim() : '',
      companyName: req.body.companyName ? req.body.companyName.trim() : '',
      description: description ? description.trim() : '',
      instructions: instructions ? instructions.trim() : '',
      timer: timer || 30,
      totalQuestions: questions.length,
      questions: questions.map(q => ({
        question: q.question.trim(),
        type: q.type || 'mcq',
        options: (q.type === 'subjective' || q.type === 'upload' || q.type === 'image') ? [] : q.options.map(opt => opt.trim()),
        optionImages: (q.type === 'visual-mcq' && q.optionImages) ? q.optionImages : [],
        correctAnswer: (q.type === 'subjective' || q.type === 'upload' || q.type === 'image') ? null : q.correctAnswer,
        marks: q.marks || 1,
        explanation: q.explanation ? q.explanation.trim() : '',
        imageUrl: q.imageUrl || ''
      })),
      status: 'published'
    });

    await assessment.save();
    res.status(201).json({ success: true, assessment });
  } catch (error) {
    console.error('Assessment creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create assessment' });
  }
};

// Employer: Get All Assessments
exports.getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ employerId: req.user._id })
      .sort({ serialNumber: 1 });
    res.json({ success: true, assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Get Assessment Details
exports.getAssessmentDetails = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      employerId: req.user._id
    });
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Update Assessment
exports.updateAssessment = async (req, res) => {
  try {
    const { title, type, designation, description, instructions, timer, questions } = req.body;
    
    // Additional server-side validation (same as create)
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Assessment type is required' });
    }
    
    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required' });
    }
    
    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      const questionText = question.question ? question.question.replace(/<[^>]*>/g, '').trim() : '';
      if (!questionText) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} text is required` 
        });
      }
      
      const questionType = question.type || 'mcq';
      if (questionType === 'mcq' || questionType === 'visual-mcq') {
        if (!question.options || question.options.length < 2) {
          return res.status(400).json({ 
            success: false, 
            message: `Question ${i + 1} must have at least 2 options` 
          });
        }
        
        // Check if all options are filled
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j] || question.options[j].trim().length === 0) {
            return res.status(400).json({ 
              success: false, 
              message: `Question ${i + 1}, Option ${String.fromCharCode(65 + j)} is required` 
            });
          }
        }
        
        if (question.correctAnswer === undefined || question.correctAnswer === null || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          return res.status(400).json({ 
            success: false, 
            message: `Question ${i + 1} must have a valid correct answer selected` 
          });
        }
      }
      
      if (!question.marks || question.marks < 1) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} must have at least 1 mark` 
        });
      }
    }
    
    const updateData = {
      title: title.trim(),
      type: type || 'Aptitude Test',
      designation: designation ? designation.trim() : '',
      companyName: req.body.companyName ? req.body.companyName.trim() : '',
      description: description ? description.trim() : '',
      instructions: instructions ? instructions.trim() : '',
      timer: timer || 30,
      totalQuestions: questions.length,
      questions: questions.map(q => ({
        question: q.question.trim(),
        type: q.type || 'mcq',
        options: (q.type === 'subjective' || q.type === 'upload' || q.type === 'image') ? [] : q.options.map(opt => opt.trim()),
        optionImages: (q.type === 'visual-mcq' && q.optionImages) ? q.optionImages : [],
        correctAnswer: (q.type === 'subjective' || q.type === 'upload' || q.type === 'image') ? null : q.correctAnswer,
        marks: q.marks || 1,
        explanation: q.explanation ? q.explanation.trim() : '',
        imageUrl: q.imageUrl || ''
      })),
      updatedAt: Date.now()
    };
    
    const assessment = await Assessment.findOneAndUpdate(
      { _id: req.params.id, employerId: req.user._id },
      updateData,
      { new: true }
    );
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    res.json({ success: true, assessment });
  } catch (error) {
    console.error('Assessment update error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update assessment' });
  }
};

// Employer: Delete Assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOneAndDelete({
      _id: req.params.id,
      employerId: req.user._id
    });
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    res.json({ success: true, message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Get Available Assessments
exports.getAvailableAssessments = async (req, res) => {
  try {
    const applications = await Application.find({
      candidateId: req.user._id,
      assessmentStatus: 'available'
    }).populate('jobId');
    
    const assessments = [];
    for (const app of applications) {
      if (app.jobId && app.jobId.assessmentId) {
        const assessment = await Assessment.findById(app.jobId.assessmentId)
          .select('-questions.correctAnswer -questions.explanation');
        
        if (assessment) {
          assessments.push({
            ...assessment.toObject(),
            jobTitle: app.jobId.title,
            applicationId: app._id,
            jobId: app.jobId._id
          });
        }
      }
    }
    
    res.json({ success: true, assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Get Assessment for Taking (without answers)
exports.getAssessmentForCandidate = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .select('-questions.correctAnswer -questions.explanation');
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Start Assessment
exports.startAssessment = async (req, res) => {
  try {
    const { assessmentId, jobId, applicationId } = req.body;
    
    // Validate input
    if (!assessmentId || !jobId || !applicationId) {
      return res.status(400).json({ success: false, message: 'Assessment ID, Job ID, and Application ID are required' });
    }
    
    console.log(`Starting assessment for candidate ${req.user._id}:`, {
      assessmentId,
      jobId,
      applicationId,
      candidateId: req.user._id
    });
    
    // Check if already attempted
    let attempt = await AssessmentAttempt.findOne({
      assessmentId,
      candidateId: req.user._id,
      applicationId
    });
    
    if (attempt && attempt.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Assessment already completed. You cannot retake this assessment.' });
    }
    
    if (attempt && attempt.status === 'expired') {
      return res.status(400).json({ success: false, message: 'Assessment time expired. You cannot retake this assessment.' });
    }
    
    // Check if attempt has violations - prevent re-entry if violations exist
    if (attempt && attempt.violations && attempt.violations.length > 0) {
      return res.status(403).json({ success: false, message: 'Assessment access denied due to previous violations. You cannot continue this assessment.' });
    }
    
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    // Verify application exists and belongs to candidate
    const application = await Application.findOne({
      _id: applicationId,
      candidateId: req.user._id
    });
    
    if (!application) {
      console.error('Application not found:', {
        applicationId,
        candidateId: req.user._id,
        jobId,
        assessmentId
      });
      return res.status(404).json({ success: false, message: 'Application not found. Please ensure you have applied for this job.' });
    }
    
    // Verify the application is for the correct job
    if (application.jobId.toString() !== jobId.toString()) {
      console.error('Job ID mismatch:', {
        applicationJobId: application.jobId.toString(),
        providedJobId: jobId.toString()
      });
      return res.status(400).json({ success: false, message: 'Job ID mismatch. Please try again.' });
    }
    
    if (!attempt) {
      const totalMarks = assessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
      attempt = new AssessmentAttempt({
        assessmentId,
        candidateId: req.user._id,
        jobId,
        applicationId,
        totalMarks,
        answers: [],
        violations: [] // Explicitly initialize violations as empty array
      });
      
      console.log('Created new assessment attempt:', {
        attemptId: attempt._id,
        candidateId: attempt.candidateId,
        assessmentId: attempt.assessmentId,
        applicationId: attempt.applicationId,
        jobId: attempt.jobId
      });
    }
    
    attempt.status = 'in_progress';
    attempt.startTime = new Date();
    attempt.timeRemaining = assessment.timer * 60;
    attempt.termsAccepted = true;
    attempt.termsAcceptedAt = new Date();
    attempt.currentQuestion = 0;
    
    await attempt.save();
    
    // Update application status
    await Application.findByIdAndUpdate(applicationId, {
      assessmentStatus: 'in_progress',
      assessmentAttemptId: attempt._id
    });
    
    console.log(`Assessment started successfully for candidate ${req.user._id}, attempt ${attempt._id}`);
    
    res.json({ 
      success: true, 
      message: 'Assessment started successfully',
      attempt: {
        _id: attempt._id,
        assessmentId: attempt.assessmentId,
        startTime: attempt.startTime,
        timeRemaining: attempt.timeRemaining,
        totalMarks: attempt.totalMarks,
        currentQuestion: attempt.currentQuestion
      }
    });
  } catch (error) {
    console.error('Start assessment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start assessment. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Candidate: Submit Answer
exports.submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionIndex, selectedAnswer, textAnswer, timeSpent } = req.body;
    
    // Validate input
    if (!attemptId) {
      return res.status(400).json({ success: false, message: 'Attempt ID is required' });
    }
    
    if (typeof questionIndex !== 'number' || questionIndex < 0) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Assessment attempt not found' });
    }
    
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Assessment is not in progress' });
    }
    
    // Validate question exists
    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment || !assessment.questions[questionIndex]) {
      return res.status(400).json({ success: false, message: 'Question not found' });
    }
    
    const question = assessment.questions[questionIndex];
    
    // Validate answer based on question type
    if (question.type === 'mcq' || question.type === 'visual-mcq') {
      if (selectedAnswer === null || selectedAnswer === undefined) {
        return res.status(400).json({ success: false, message: 'Please select an answer' });
      }
      if (typeof selectedAnswer !== 'number' || selectedAnswer < 0 || selectedAnswer >= question.options.length) {
        return res.status(400).json({ success: false, message: 'Invalid answer option selected' });
      }
    }
    // For subjective, allow empty answers (user might be typing)
    
    // Update or add answer
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionIndex === questionIndex);
    const answerData = {
      questionIndex,
      selectedAnswer: question.type === 'mcq' || question.type === 'visual-mcq' ? parseInt(selectedAnswer) : null,
      textAnswer: (question.type === 'subjective' || question.type === 'image' || question.type === 'upload') && textAnswer ? textAnswer : null,
      timeSpent: timeSpent || 0,
      answeredAt: new Date()
    };
    
    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }
    
    attempt.currentQuestion = Math.max(attempt.currentQuestion || 0, questionIndex + 1);
    attempt.markModified('answers');
    await attempt.save();
    
    console.log(`Answer submitted for question ${questionIndex} in attempt ${attemptId}:`, {
      questionType: question.type,
      selectedAnswer: answerData.selectedAnswer,
      hasTextAnswer: !!answerData.textAnswer,
      totalAnswers: attempt.answers.length
    });
    
    res.json({ 
      success: true, 
      message: 'Answer saved successfully',
      attempt: {
        _id: attempt._id,
        currentQuestion: attempt.currentQuestion,
        answersCount: attempt.answers.length
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save answer. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Candidate: Upload File Answer
exports.uploadFileAnswer = async (req, res) => {
  try {
    const { attemptId, questionIndex, timeSpent } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Assessment not in progress' });
    }
    
    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment || !assessment.questions[questionIndex]) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }
    
    const question = assessment.questions[questionIndex];
    
    if (question.type !== 'upload' && question.type !== 'image') {
      return res.status(400).json({ success: false, message: 'Question is not an upload type' });
    }
    
    // Convert file to Base64
    const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionIndex === parseInt(questionIndex));
    const answerData = {
      questionIndex: parseInt(questionIndex),
      selectedAnswer: null,
      textAnswer: null,
      uploadedFile: {
        filename: req.file.originalname,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        data: base64File, // Store Base64 data instead of path
        uploadedAt: new Date()
      },
      timeSpent: timeSpent || 0,
      answeredAt: new Date()
    };
    
    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }
    
    attempt.currentQuestion = Math.max(attempt.currentQuestion || 0, parseInt(questionIndex) + 1);
    attempt.markModified('answers');
    await attempt.save();
    
    res.json({ success: true, uploadedFile: answerData.uploadedFile });
  } catch (error) {
    console.error('Upload file answer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadCapture = async (req, res) => {
  try {
    const { attemptId, captureIndex } = req.body;
    
    console.log('📸 Upload capture request:', {
      attemptId,
      captureIndex,
      hasFile: !!req.file,
      fileSize: req.file?.size,
      candidateId: req.user._id
    });
    
    if (!req.file) {
      console.error('❌ No file in upload capture request');
      return res.status(400).json({ success: false, message: 'No capture uploaded' });
    }
    
    if (!attemptId) {
      console.error('❌ No attemptId in upload capture request');
      return res.status(400).json({ success: false, message: 'Attempt ID is required' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });
    
    if (!attempt) {
      console.error('❌ Assessment attempt not found:', {
        attemptId,
        candidateId: req.user._id
      });
      return res.status(404).json({ success: false, message: 'Assessment attempt not found' });
    }
    
    if (attempt.status !== 'in_progress') {
      console.error('❌ Assessment not in progress:', {
        attemptId,
        status: attempt.status
      });
      return res.status(400).json({ success: false, message: 'Assessment is not in progress' });
    }
    
    // Convert image to Base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    if (!attempt.captures) {
      attempt.captures = [];
    }
    
    // Check if we already have 5 captures
    if (attempt.captures.length >= 5) {
      console.warn('⚠️ Maximum captures reached:', {
        attemptId,
        currentCount: attempt.captures.length
      });
      return res.status(400).json({ success: false, message: 'Maximum captures reached' });
    }
    
    attempt.captures.push(base64Image);
    await attempt.save();
    
    console.log('✅ Capture uploaded successfully as Base64:', {
      attemptId,
      totalCaptures: attempt.captures.length,
      fileSize: req.file.size
    });
    
    res.json({ 
      success: true, 
      captureData: base64Image,
      captureCount: attempt.captures.length,
      message: `Capture ${attempt.captures.length}/5 uploaded successfully`
    });
  } catch (error) {
    console.error('❌ Upload capture error:', {
      message: error.message,
      stack: error.stack,
      attemptId: req.body?.attemptId,
      candidateId: req.user?._id
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload capture. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Candidate: Submit Complete Assessment
exports.submitAssessment = async (req, res) => {
  try {
    const { attemptId, violations } = req.body;
    
    // Validate input
    if (!attemptId) {
      return res.status(400).json({ success: false, message: 'Attempt ID is required' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Assessment attempt not found' });
    }
    
    // Check if already completed
    if (attempt.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Assessment already completed' });
    }
    
    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    // Calculate score with enhanced validation
    let score = 0;
    let correctAnswers = 0;
    let totalAnswered = 0;
    
    // Validate all answers before scoring
    for (const answer of attempt.answers) {
      const question = assessment.questions[answer.questionIndex];
      if (!question) {
        console.warn(`Question not found for index: ${answer.questionIndex}`);
        continue;
      }
      
      totalAnswered++;
      
      // Handle different question types
      if (question.type === 'mcq' || question.type === 'visual-mcq') {
        // Ensure both values are integers for accurate comparison
        const selectedAnswer = parseInt(answer.selectedAnswer);
        const correctAnswer = parseInt(question.correctAnswer);
        
        // Validate answer is within valid range and not null/undefined
        if (!isNaN(selectedAnswer) && selectedAnswer >= 0 && selectedAnswer < question.options.length) {
          if (selectedAnswer === correctAnswer) {
            score += (question.marks || 1);
            correctAnswers++;
          }
        } else {
          console.warn(`Invalid MCQ answer ${selectedAnswer} for question ${answer.questionIndex}`);
        }
      } else if (question.type === 'subjective' || question.type === 'image' || question.type === 'upload') {
        // For subjective, image, and upload questions, check for text answers or uploaded files
        if ((answer.textAnswer && answer.textAnswer.trim()) || answer.uploadedFile) {
          // Give full marks for answered questions (manual evaluation may be needed)
          score += (question.marks || 1);
          correctAnswers++;
        }
      }
    }
    
    // Ensure totalMarks is valid - calculate from all questions, not just answered ones
    const totalMarks = assessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const passingPercentage = assessment.passingPercentage || 60; // Default 60%
    const result = percentage >= passingPercentage ? 'pass' : 'fail';
    
    // Check if time expired
    const timeElapsed = (new Date() - new Date(attempt.startTime)) / 1000; // in seconds
    const timeLimit = assessment.timer * 60; // in seconds
    const isExpired = timeElapsed > timeLimit;
    
    // Update attempt with results
    attempt.score = score;
    attempt.percentage = Math.round(percentage * 100) / 100; // Round to 2 decimal places
    attempt.result = result;
    attempt.status = isExpired ? 'expired' : 'completed';
    attempt.endTime = new Date();
    attempt.totalMarks = totalMarks; // Ensure totalMarks is set
    
    // Merge violations from request with existing violations
    if (!attempt.violations) {
      attempt.violations = [];
    }
    
    if (violations && Array.isArray(violations) && violations.length > 0) {
      // Add new violations that don't already exist
      violations.forEach(v => {
        const exists = attempt.violations.some(existing => 
          existing.type === v.type && existing.timestamp === v.timestamp
        );
        if (!exists) {
          attempt.violations.push(v);
        }
      });
      console.log(`Total violations for attempt ${attemptId}: ${attempt.violations.length}`);
    } else {
      console.log(`No new violations in submission for attempt ${attemptId}, existing: ${attempt.violations.length}`);
    }
    
    attempt.markModified('violations');
    await attempt.save();
    
    // Update application with assessment results
    const updateData = {
      assessmentStatus: 'completed',
      assessmentScore: score,
      assessmentPercentage: attempt.percentage,
      assessmentResult: result,
      assessmentAttemptId: attempt._id
    };
    
    await Application.findByIdAndUpdate(attempt.applicationId, updateData);
    
    console.log(`Assessment submitted successfully for attempt ${attemptId}:`, {
      score,
      totalMarks,
      percentage: attempt.percentage,
      result,
      correctAnswers,
      totalAnswered
    });
    
    res.json({ 
      success: true, 
      message: 'Assessment submitted successfully',
      result: {
        score,
        totalMarks,
        percentage: attempt.percentage,
        result,
        correctAnswers,
        totalQuestions: assessment.totalQuestions,
        totalAnswered,
        unanswered: assessment.totalQuestions - totalAnswered,
        attemptId: attempt._id
      }
    });
  } catch (error) {
    console.error('Assessment submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit assessment. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Candidate: Get Assessment Result
exports.getAssessmentResult = async (req, res) => {
  try {
    const attempt = await AssessmentAttempt.findOne({
      _id: req.params.attemptId,
      candidateId: req.user._id,
      status: 'completed'
    }).populate('assessmentId');
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    
    res.json({ 
      success: true, 
      result: {
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        result: attempt.result,
        correctAnswers: attempt.answers.filter(a => {
          const question = attempt.assessmentId.questions[a.questionIndex];
          if (!question) return false;

          if (question.type === 'mcq' || question.type === 'visual-mcq') {
            return !isNaN(parseInt(a.selectedAnswer)) && parseInt(a.selectedAnswer) === parseInt(question.correctAnswer);
          } else if (question.type === 'subjective' || question.type === 'image' || question.type === 'upload') {
            return (a.textAnswer && a.textAnswer.trim()) || a.uploadedFile;
          }
          return false;
        }).length,
        totalQuestions: attempt.assessmentId.totalQuestions,
        violations: attempt.violations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Record Violation
exports.recordViolation = async (req, res) => {
  try {
    const { attemptId, type, details } = req.body;
    
    if (!attemptId || !type) {
      return res.status(400).json({ success: false, message: 'Attempt ID and violation type are required' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Assessment attempt not found' });
    }
    
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Assessment is not in progress' });
    }
    
    if (!attempt.violations) {
      attempt.violations = [];
    }
    
    attempt.violations.push({
      type,
      timestamp: new Date(),
      details: details || `${type} violation detected`
    });
    
    attempt.markModified('violations');
    await attempt.save();
    
    console.log(`Violation recorded for attempt ${attemptId}: ${type}, total: ${attempt.violations.length}`);
    
    res.json({ 
      success: true, 
      message: 'Violation recorded',
      violationCount: attempt.violations.length
    });
  } catch (error) {
    console.error('Record violation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record violation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Employer: Get Assessment Results
exports.getAssessmentResults = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      employerId: req.user._id
    });
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    const results = await AssessmentAttempt.find({
      assessmentId: req.params.id,
      status: { $in: ['completed', 'expired'] }
    }).populate('candidateId', 'name email phone')
      .populate('applicationId')
      .sort({ endTime: -1 });
    
    console.log('Raw assessment results:', results.length);
    
    // Ensure violations array exists for each result and convert to plain objects
    const resultsWithViolations = results.map(r => {
      const resultObj = r.toObject();
      
      // Debug logging for applicationId and violations
      console.log('Processing result:', {
        attemptId: resultObj._id,
        applicationId: resultObj.applicationId?._id || resultObj.applicationId,
        candidateName: resultObj.candidateId?.name || 'N/A',
        violationsCount: resultObj.violations ? resultObj.violations.length : 0,
        hasViolations: !!resultObj.violations
      });
      
      return {
        ...resultObj,
        violations: Array.isArray(resultObj.violations) ? resultObj.violations : [],
        // Ensure candidate data is available
        candidateId: resultObj.candidateId || {
          name: 'N/A',
          email: 'N/A',
          phone: 'N/A'
        },
        // Ensure applicationId is properly formatted
        applicationId: resultObj.applicationId?._id || resultObj.applicationId || null
      };
    });
    
    console.log('Assessment results with violations:', resultsWithViolations.map(r => ({ 
      id: r._id, 
      violations: r.violations.length,
      violationsArray: r.violations,
      candidateName: r.candidateId?.name || 'N/A',
      candidateEmail: r.candidateId?.email || 'N/A',
      applicationId: r.applicationId
    })));
    
    console.log('Sending response with', resultsWithViolations.length, 'results');
    console.log('Sample result structure:', JSON.stringify(resultsWithViolations[0], null, 2));
    
    res.json({ success: true, assessment, results: resultsWithViolations });
  } catch (error) {
    console.error('Error fetching assessment results:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Get Attempt Details
exports.getAttemptDetails = async (req, res) => {
  try {
    console.log('getAttemptDetails called with attemptId:', req.params.attemptId);
    console.log('Employer ID:', req.user._id);
    
    const attempt = await AssessmentAttempt.findById(req.params.attemptId)
      .populate('candidateId', 'name email phone')
      .populate('assessmentId');
    
    console.log('Found attempt:', !!attempt);
    
    if (!attempt) {
      console.log('Attempt not found for ID:', req.params.attemptId);
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    console.log('Assessment employerId:', attempt.assessmentId?.employerId);
    console.log('Current user ID:', req.user._id);
    
    if (attempt.assessmentId.employerId.toString() !== req.user._id.toString()) {
      console.log('Unauthorized access attempt');
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    console.log('Attempt details - Total answers:', attempt.answers?.length);
    console.log('Attempt details - Answers:', JSON.stringify(attempt.answers, null, 2));
    
    res.json({ success: true, attempt });
  } catch (error) {
    console.error('Get attempt details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssessmentResultByApplication = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const candidateId = req.user._id;
    
    console.log('[getAssessmentResultByApplication] Query params:', {
      applicationId,
      candidateId: candidateId.toString(),
      userRole: req.userRole
    });
    
    const attempt = await AssessmentAttempt.findOne({
      applicationId,
      candidateId,
      status: 'completed'
    }).populate('assessmentId');
    
    if (!attempt) {
      console.log('[getAssessmentResultByApplication] No attempt found, checking all records for this application...');
      const allAttempts = await AssessmentAttempt.find({ applicationId }).select('_id candidateId status');
      console.log('[getAssessmentResultByApplication] All attempts for app:', allAttempts);
      return res.status(404).json({ success: false, message: 'Assessment result not found for this application' });
    }
    
    console.log('[getAssessmentResultByApplication] Found attempt:', attempt._id);
    
    res.json({ 
      success: true, 
      data: {
        result: {
          score: attempt.score,
          totalMarks: attempt.totalMarks,
          percentage: attempt.percentage,
          result: attempt.result,
          correctAnswers: attempt.answers.filter(a => {
            const question = attempt.assessmentId.questions[a.questionIndex];
            return question && parseInt(a.selectedAnswer) === parseInt(question.correctAnswer);
          }).length,
          totalQuestions: attempt.assessmentId.totalQuestions,
          violations: attempt.violations
        },
        assessment: {
          title: attempt.assessmentId.title,
          description: attempt.assessmentId.description
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload Question Image
exports.uploadQuestionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    
    const fs = require('fs');
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;
    fs.unlinkSync(req.file.path);
    const imageUrl = base64Image;
    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload MCQ Option Image
exports.uploadOptionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    
    const fs = require('fs');
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;
    fs.unlinkSync(req.file.path);
    const imageUrl = base64Image;
    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
