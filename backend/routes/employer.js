const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const employerController = require('../controllers/employerController');
const employerPasswordController = require('../controllers/employerPasswordController');
const { auth } = require('../middlewares/auth');
const { upload, uploadGallery, uploadQuestionImage } = require('../middlewares/upload');
const handleValidationErrors = require('../middlewares/validation');
const { mobileValidationRules } = require('../middlewares/phoneValidation');
const { validateEmailMiddleware } = require('../middlewares/emailValidation');

// Authentication Routes
router.post('/register', [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('companyName').notEmpty().trim().withMessage('Company name is required'),
  ...mobileValidationRules()
], validateEmailMiddleware, handleValidationErrors, employerController.registerEmployer);

router.post('/login', validateEmailMiddleware, employerController.loginEmployer);

router.post('/check-email', [
  body('email').isEmail().withMessage('Valid email is required')
], validateEmailMiddleware, handleValidationErrors, employerPasswordController.checkEmail);

router.post('/create-password', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateEmailMiddleware, handleValidationErrors, employerPasswordController.createPassword);

// Password Reset Routes (Public - before auth middleware)
router.post('/password/reset', [
  body('email').isEmail().withMessage('Valid email is required')
], handleValidationErrors, employerPasswordController.resetPassword);

router.post('/password/confirm-reset', [
  body('token').notEmpty().withMessage('Token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], handleValidationErrors, employerPasswordController.confirmResetPassword);

// OTP-based Password Reset Routes
router.post('/password/send-otp', [
  body('email').isEmail().withMessage('Valid email is required')
], handleValidationErrors, employerPasswordController.sendOTP);

router.post('/password/verify-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], handleValidationErrors, employerPasswordController.verifyOTPAndResetPassword);

router.post('/password/update-reset', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], handleValidationErrors, employerPasswordController.updatePasswordReset);

// Protected Routes
router.use(auth(['employer']));

// Profile Management Routes
router.get('/profile', employerController.getProfile);
router.put('/profile', employerController.updateProfile);
router.post('/profile/logo', upload.single('logo'), employerController.uploadLogo);
router.post('/profile/cover', upload.single('cover'), employerController.uploadCover);
router.post('/profile/document', upload.single('document'), employerController.uploadDocument);
router.post('/profile/authorization-letter', upload.single('document'), employerController.uploadAuthorizationLetter);
router.delete('/profile/authorization-letter/:documentId', employerController.deleteAuthorizationLetter);
router.put('/profile/update-authorization-companies', employerController.updateAuthorizationCompanies);
router.post('/profile/gallery', uploadGallery.array('gallery', 3), (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        success: false, 
        message: 'File too large. Maximum size is 10MB per image. Please compress your images and try again.' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        success: false, 
        message: 'Too many files. Maximum 3 images per batch allowed. Please upload fewer files at once.' 
      });
    }
    if (error.code === 'LIMIT_FIELD_VALUE') {
      return res.status(413).json({ 
        success: false, 
        message: 'Request too large. Please upload smaller files or fewer files at once.' 
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        success: false, 
        message: 'Unexpected file field. Please only upload gallery images.' 
      });
    }
  }
  if (error) {
    console.error('Gallery upload error:', error);
    return res.status(400).json({ 
      success: false, 
      message: error.message || 'Upload failed. Please try again with smaller files.' 
    });
  }
  next();
}, employerController.uploadGallery);
router.delete('/profile/gallery/:imageId', employerController.deleteGalleryImage);

// Job Management Routes
router.get('/jobs', employerController.getEmployerJobs);
router.get('/recent-jobs', employerController.getRecentJobs);
router.post('/jobs', [
  body('title').notEmpty().withMessage('Job title is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('jobType').isIn(['full-time', 'part-time', 'contract', 'internship', 'internship-(paid)', 'internship-(unpaid)', 'work-from-home']).withMessage('Invalid job type')
], handleValidationErrors, employerController.createJob);

router.get('/jobs/:jobId', employerController.getJob);
router.put('/jobs/:jobId', employerController.updateJob);
router.delete('/jobs/:jobId', employerController.deleteJob);
router.get('/jobs/:jobId/test-dates', employerController.testInterviewDates);
router.post('/jobs/:jobId/schedule-round', [
  body('roundKey').notEmpty().withMessage('Round key is required'),
  body('roundType').notEmpty().withMessage('Round type is required'),
  body('fromDate').isISO8601().withMessage('Valid from date is required'),
  body('toDate').isISO8601().withMessage('Valid to date is required')
], handleValidationErrors, employerController.scheduleInterviewRound);

// Application Management Routes
router.get('/applications', employerController.getEmployerApplications);
router.get('/jobs/:jobId/applications', employerController.getJobApplications);
router.get('/find-application', employerController.findApplicationByCandidateAndJob);
router.put('/applications/:applicationId/review', employerController.saveInterviewReview);
router.get('/applications/:applicationId/interview-status', employerController.getInterviewProcessStatus);
router.get('/applications/:applicationId', employerController.getApplicationDetails);
router.put('/applications/:applicationId/status', [
  body('status').isIn(['pending', 'shortlisted', 'interviewed', 'hired', 'rejected', 'not_attended', 'offer_shared']).withMessage('Invalid status')
], handleValidationErrors, employerController.updateApplicationStatus);

// Messaging Routes
router.post('/messages', [
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('message').notEmpty().withMessage('Message is required')
], handleValidationErrors, employerController.sendMessage);

router.get('/messages/:conversationId', employerController.getMessages);

// Dashboard Routes
router.get('/dashboard/stats', employerController.getDashboardStats);
router.get('/profile/completion', employerController.getProfileCompletion);
router.get('/recent-activity', employerController.getRecentActivity);

// Consultant Routes
router.get('/consultant/companies', employerController.getConsultantCompanies);
router.get('/approved-authorization-companies', employerController.getApprovedAuthorizationCompanies);

// GST API Routes
router.get('/gst/:gstNumber', employerController.getGSTInfo);

// Subscription Management Routes
router.post('/subscription', employerController.createSubscription);
router.get('/subscription', employerController.getSubscription);
router.put('/subscription', employerController.updateSubscription);

// Notification Routes
router.get('/notifications', employerController.getNotifications);
router.patch('/notifications/:id/read', employerController.markNotificationAsRead);
router.patch('/notifications/read-all', employerController.markAllNotificationsAsRead);

// Interview Process Routes
const interviewController = require('../controllers/interviewController');
router.post('/applications/:applicationId/interview-process', interviewController.createOrUpdateInterviewProcess);
router.get('/applications/:applicationId/interview-process', interviewController.getInterviewProcess);
router.put('/applications/:applicationId/interview-process/stages/:stageIndex/status', interviewController.updateStageStatus);
router.put('/applications/:applicationId/interview-process/stages/:stageIndex/schedule', [
  body('fromDate').optional().isISO8601().withMessage('Valid from date is required'),
  body('toDate').optional().isISO8601().withMessage('Valid to date is required')
], handleValidationErrors, interviewController.scheduleInterviewStage);

// Interview Email Routes
router.post('/send-interview-invite/:applicationId', [
  body('interviewDate').notEmpty().withMessage('Interview date is required'),
  body('interviewTime').notEmpty().withMessage('Interview time is required'),
  body('meetingLink').notEmpty().withMessage('Google Meet link is required')
], handleValidationErrors, employerController.sendInterviewInvite);
router.post('/confirm-interview/:applicationId', [
  body('confirmedDate').notEmpty().withMessage('Confirmed date is required'),
  body('confirmedTime').notEmpty().withMessage('Confirmed time is required')
], handleValidationErrors, employerController.confirmInterview);
router.get('/interview-responses/:applicationId', employerController.getInterviewResponse);

// Assessment Routes
const assessmentController = require('../controllers/assessmentController');
router.post('/assessments/upload-question-image', uploadQuestionImage.single('image'), assessmentController.uploadQuestionImage);
router.post('/assessments/upload-option-image', uploadQuestionImage.single('image'), assessmentController.uploadOptionImage);
router.post('/assessments', assessmentController.createAssessment);
router.get('/assessments', assessmentController.getAssessments);
router.get('/assessments/:id', assessmentController.getAssessmentDetails);
router.put('/assessments/:id', assessmentController.updateAssessment);
router.delete('/assessments/:id', assessmentController.deleteAssessment);
router.get('/assessments/:id/results', assessmentController.getAssessmentResults);
router.get('/assessment-attempts/:attemptId', assessmentController.getAttemptDetails);

module.exports = router;