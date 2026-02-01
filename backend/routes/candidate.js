const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const { auth } = require('../middlewares/auth');
const { upload, uploadMarksheet, uploadAnswerFile, uploadEducation } = require('../middlewares/upload');
const handleValidationErrors = require('../middlewares/validation');
const { mobileValidationRules } = require('../middlewares/phoneValidation');
const { validateEmailMiddleware } = require('../middlewares/emailValidation');

// Authentication Routes
router.post('/register', [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  ...mobileValidationRules()
], validateEmailMiddleware, handleValidationErrors, candidateController.registerCandidate);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], validateEmailMiddleware, handleValidationErrors, candidateController.loginCandidate);

// Email Check Route (Public - before auth middleware)
router.post('/check-email', [
  body('email').isEmail().withMessage('Valid email is required')
], validateEmailMiddleware, handleValidationErrors, candidateController.checkEmail);

// Password Reset Routes (Public - before auth middleware)
router.post('/password/reset', [
  body('email').isEmail().withMessage('Valid email is required')
], handleValidationErrors, candidateController.resetPassword);

router.post('/password/confirm-reset', [
  body('token').notEmpty().withMessage('Token is required'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[@#!%$*?]/).withMessage('Password must contain at least one special character (@#!%$*?)')
], handleValidationErrors, candidateController.confirmResetPassword);

router.post('/password/update-reset', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[@#!%$*?]/).withMessage('Password must contain at least one special character (@#!%$*?)')
], handleValidationErrors, candidateController.updatePasswordReset);

// OTP-based Password Reset Routes
router.post('/password/send-otp', [
  body('email').isEmail().withMessage('Valid email is required')
], handleValidationErrors, candidateController.sendOTP);

router.post('/password/verify-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[@#!%$*?]/).withMessage('Password must contain at least one special character (@#!%$*?)')
], handleValidationErrors, candidateController.verifyOTPAndResetPassword);

router.post('/verify-mobile', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], handleValidationErrors, candidateController.verifyMobileOTP);

router.post('/create-password', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[@#!%$*?]/).withMessage('Password must contain at least one special character (@#!%$*?)')
], handleValidationErrors, candidateController.createPassword);

// Protected Routes
router.use(auth(['candidate']));

// Profile Management Routes
router.get('/profile', candidateController.getProfile);
router.get('/profile/complete', candidateController.getCandidateCompleteProfile);
router.put('/profile', upload.single('profilePicture'), (req, res, next) => {
  // Skip validation for specific field updates
  const isResumeHeadlineOnly = req.body.resumeHeadline && Object.keys(req.body).length === 1;
  const isProfileSummaryOnly = req.body.profileSummary && Object.keys(req.body).length === 1;
  const isSkillsOnly = req.body.skills && Object.keys(req.body).length === 1;
  const isEmploymentOnly = req.body.employment && Object.keys(req.body).length <= 2; // employment + totalExperience
  const isJobPreferencesOnly = req.body.jobPreferences && Object.keys(req.body).length <= 2; // jobPreferences + expectedSalary
  
  // Skip validation for personal details updates (contains multiple fields)
  const personalDetailsFields = ['dateOfBirth', 'gender', 'location', 'stateCode', 'pincode', 'fatherName', 'motherName', 'residentialAddress', 'permanentAddress', 'correspondenceAddress', 'education', 'employment', 'totalExperience', 'jobPreferences', 'expectedSalary'];
  const hasPersonalDetailsFields = personalDetailsFields.some(field => field in req.body);
  
  if (isResumeHeadlineOnly || isProfileSummaryOnly || isSkillsOnly || isEmploymentOnly || isJobPreferencesOnly || hasPersonalDetailsFields) {
    return candidateController.updateProfile(req, res);
  }
  
  // Apply validation for other profile updates
  const validations = [
    body('name')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    body('middleName')
      .optional()
      .isLength({ max: 30 })
      .withMessage('Middle name cannot exceed 30 characters')
      .matches(/^[a-zA-Z\s]*$/)
      .withMessage('Middle name can only contain letters and spaces'),
    body('lastName')
      .optional()
      .isLength({ max: 30 })
      .withMessage('Last name cannot exceed 30 characters')
      .matches(/^[a-zA-Z\s]*$/)
      .withMessage('Last name can only contain letters and spaces'),
    body('phone')
      .optional()
      .custom((value) => {
        if (!value) return true;
        const { validatePhoneNumber } = require('../utils/phoneValidation');
        const validation = validatePhoneNumber(value);
        if (!validation.isValid) {
          throw new Error(validation.message);
        }
        return true;
      }),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('location')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Location cannot exceed 100 characters')
      .matches(/^[a-zA-Z0-9\s,.-]*$/)
      .withMessage('Location contains invalid characters'),
    body('stateCode')
      .optional()
      .isLength({ max: 3 })
      .withMessage('State code cannot exceed 3 characters')
      .matches(/^[A-Z]*$/)
      .withMessage('State code can only contain uppercase letters'),
    body('pincode')
      .optional()
      .matches(/^\d{6}$/)
      .withMessage('Pincode must be 6 digits'),
    body('dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid date')
      .custom((value) => {
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 16 || age > 65) {
            throw new Error('Age must be between 16 and 65 years');
          }
        }
        return true;
      }),
    body('gender')
      .optional()
      .isIn(['male', 'female'])
      .withMessage('Gender must be either male or female'),
    body('fatherName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Father name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]*$/)
      .withMessage('Father name can only contain letters and spaces'),
    body('motherName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Mother name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]*$/)
      .withMessage('Mother name can only contain letters and spaces'),
    body('residentialAddress')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Residential address cannot exceed 200 characters'),
    body('permanentAddress')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Permanent address cannot exceed 200 characters'),
    body('correspondenceAddress')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Correspondence address cannot exceed 200 characters')
  ];
  
  // Apply validations and then handle validation errors
  Promise.all(validations.map(validation => validation.run(req)))
    .then(() => {
      handleValidationErrors(req, res, next);
    })
    .catch(next);
});
// Multer error handling middleware
const handleMulterError = (error, req, res, next) => {
  if (error) {
    console.error('Multer error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File size exceeds the limit. Please upload a file smaller than 15MB.' 
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        success: false, 
        message: 'Unexpected file field. Please use the correct form field name.' 
      });
    }
    
    if (error.message && error.message.includes('Only')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    return res.status(400).json({ 
      success: false, 
      message: error.message || 'File upload error. Please try again.' 
    });
  }
  next();
};

// Education document error handling middleware (50MB limit)
const handleEducationMulterError = (error, req, res, next) => {
  if (error) {
    console.error('Education document multer error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File size exceeds the 50MB limit. Please upload a smaller file.' 
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        success: false, 
        message: 'Unexpected file field. Please use the correct form field name.' 
      });
    }
    
    if (error.message && error.message.includes('Only PDF files are allowed')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only PDF files are allowed for education documents.' 
      });
    }
    
    return res.status(400).json({ 
      success: false, 
      message: error.message || 'Education document upload error. Please try again.' 
    });
  }
  next();
};

router.post('/upload-resume', upload.single('resume'), handleMulterError, candidateController.uploadResume);
router.delete('/delete-resume', candidateController.deleteResume);
router.post('/upload-marksheet', uploadMarksheet.single('marksheet'), [
  // File validation will be handled in the controller
], candidateController.uploadMarksheet);

// Dashboard Routes
router.get('/dashboard', candidateController.getDashboard);
router.get('/dashboard/stats', candidateController.getDashboardStats);
router.get('/recommended-jobs', candidateController.getRecommendedJobs);

// Job Application Routes
router.post('/jobs/:jobId/apply', [
  body('coverLetter').optional().isString()
], handleValidationErrors, candidateController.applyForJob);

router.post('/applications', candidateController.applyForJob);
router.post('/apply/:jobId', candidateController.applyForJob);
router.get('/applications/interviews', candidateController.getCandidateApplicationsWithInterviews);
router.get('/applications/:applicationId/status', candidateController.getApplicationStatus);
router.get('/applications', candidateController.getAppliedJobs);
router.get('/applications/:applicationId/interview-process', candidateController.getInterviewProcessDetails);
router.get('/applications/:applicationId/interview-details', candidateController.getApplicationInterviewDetails);
router.get('/interview-processes', candidateController.getAllInterviewProcessDetails);

// New comprehensive interview process routes
router.get('/interview-processes/all', candidateController.getAllCandidateInterviewProcesses);
router.post('/applications/:applicationId/interview-process', candidateController.createOrUpdateInterviewProcess);
router.put('/applications/:applicationId/interview-process/stage/:stageIndex', candidateController.updateInterviewStageStatus);

// Optimized endpoints
router.get('/applications/status/:jobId', async (req, res) => {
  try {
    const Application = require('../models/Application');
    const application = await Application.findOne({
      candidateId: req.user.id,
      jobId: req.params.jobId
    }).select('_id').lean();
    
    res.json({ success: true, hasApplied: !!application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/credits', async (req, res) => {
  try {
    const Candidate = require('../models/Candidate');
    const candidate = await Candidate.findById(req.user.id)
      .select('credits registrationMethod').lean();
    
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    
    res.json({
      success: true,
      credits: candidate.credits || 0,
      registrationMethod: candidate.registrationMethod
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Messaging Routes
router.post('/messages', [
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('message').notEmpty().withMessage('Message is required')
], handleValidationErrors, candidateController.sendMessage);

router.get('/messages/:conversationId', candidateController.getMessages);

// Password Management Routes
router.put('/password/change', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[@#!%$*?]/).withMessage('Password must contain at least one special character (@#!%$*?)')
], handleValidationErrors, candidateController.changePassword);

// Education Management Routes
router.post('/education', uploadEducation.single('marksheet'), handleEducationMulterError, [
  body('schoolName').notEmpty().withMessage('School name is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('passoutYear').notEmpty().withMessage('Passout year is required'),
  body('percentage').notEmpty().withMessage('Percentage is required')
], handleValidationErrors, candidateController.addEducation);

router.put('/education/marksheet', uploadEducation.single('marksheet'), handleEducationMulterError, candidateController.updateEducationWithMarksheet);

router.put('/education/document', uploadEducation.single('document'), handleEducationMulterError, candidateController.uploadEducationDocument);

router.delete('/education/:educationId', candidateController.deleteEducation);

// Work Location Preferences Routes
router.get('/work-location-preferences', candidateController.getWorkLocationPreferences);
router.put('/work-location-preferences', [
  body('preferredLocations')
    .isArray({ min: 1 })
    .withMessage('At least one preferred location is required'),
  body('remoteWork')
    .optional()
    .isBoolean()
    .withMessage('Remote work preference must be true or false'),
  body('willingToRelocate')
    .optional()
    .isBoolean()
    .withMessage('Willing to relocate must be true or false'),
  body('noticePeriod')
    .optional()
    .isIn(['immediate', '15-days', '1-month', '2-months', '3-months', 'more-than-3-months', ''])
    .withMessage('Invalid notice period'),
  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance', ''])
    .withMessage('Invalid job type'),

], handleValidationErrors, candidateController.updateWorkLocationPreferences);

// Assessment Routes
const assessmentController = require('../controllers/assessmentController');

// Debug middleware for assessment routes
const assessmentDebugMiddleware = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Assessment API: ${req.method} ${req.path}`);
  console.log('Headers:', req.headers.authorization ? 'Bearer token present' : 'No auth token');
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
};

router.get('/assessments/available', assessmentController.getAvailableAssessments);
router.get('/assessments/:id', assessmentController.getAssessmentForCandidate);
router.post('/assessments/start', assessmentDebugMiddleware, assessmentController.startAssessment);
router.post('/assessments/answer', assessmentDebugMiddleware, assessmentController.submitAnswer);
router.post('/assessments/upload-answer', uploadAnswerFile.single('answerFile'), assessmentController.uploadFileAnswer);
router.post('/assessments/capture', uploadAnswerFile.single('capture'), assessmentController.uploadCapture);
router.post('/assessments/submit', assessmentDebugMiddleware, assessmentController.submitAssessment);
router.get('/assessments/result/application/:applicationId', assessmentController.getAssessmentResultByApplication);
router.get('/assessments/result/:attemptId', assessmentController.getAssessmentResult);
router.post('/assessments/violation', assessmentDebugMiddleware, assessmentController.recordViolation);

// Interview Response Routes
router.post('/respond-interview/:applicationId', [
  body('availableDate').notEmpty().withMessage('Available date is required'),
  body('availableTime').notEmpty().withMessage('Available time is required')
], handleValidationErrors, candidateController.respondToInterviewInvite);

module.exports = router;