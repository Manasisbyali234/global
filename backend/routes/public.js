const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const publicController = require('../controllers/publicController');
const handleValidationErrors = require('../middlewares/validation');
const { upload, uploadSupport } = require('../middlewares/upload');
const performanceMiddleware = require('../middlewares/performance');
const { phoneValidationRules } = require('../middlewares/phoneValidation');

// Apply performance monitoring to all routes
router.use(performanceMiddleware);

// Job Routes
router.get('/jobs', publicController.getJobs);
router.get('/jobs/search', publicController.searchJobs);
router.get('/jobs/filter-counts', publicController.getJobFilterCounts);
router.get('/jobs/:id', publicController.getJobById);
router.get('/jobs/category/:category', publicController.getJobsByCategory);

// Blog Routes
router.get('/blogs', publicController.getBlogs);
router.get('/blogs/:id', publicController.getBlogById);

// Contact Route
router.post('/contact', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').notEmpty().withMessage('Message is required'),
  ...phoneValidationRules()
], handleValidationErrors, publicController.submitContactForm);

// Support Route with error handling
router.post('/support', (req, res, next) => {
  uploadSupport.array('attachments', 3)(req, res, (err) => {
    if (err) {
      console.error('Support upload error:', err);
      // Handle multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: 'File size too large. Each file must be under 10MB. Please compress your files before uploading.'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 3 files allowed.'
        });
      }
      if (err.code === 'LIMIT_FIELD_SIZE') {
        return res.status(413).json({
          success: false,
          message: 'Total upload size too large. Combined file size must be under 30MB. Please compress your files or reduce the number of files.'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field. Please use the correct form field name "attachments".'
        });
      }
      if (err.message && err.message.includes('File type not supported')) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      if (err.message) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'File upload error. Please try again with smaller files.'
      });
    }
    next();
  });
}, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('userType').isIn(['employer', 'candidate', 'guest']).withMessage('Valid user type is required'),
  body('category').optional().isIn(['technical', 'billing', 'account', 'job-posting', 'application', 'general']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
  // Removed phone validation to make it truly optional
], handleValidationErrors, publicController.submitSupportTicket);

// Content Routes
router.get('/testimonials', publicController.getTestimonials);
router.get('/partners', publicController.getPartners);
router.get('/faqs', publicController.getFAQs);

// Public Stats
router.get('/stats', publicController.getPublicStats);

// Employer Profile
router.get('/employers/:id', publicController.getEmployerProfile);
router.get('/employers', publicController.getEmployers);
router.get('/top-recruiters', publicController.getTopRecruiters);

// Apply for job without login
router.post('/apply-job', upload.single('resume'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required').custom((value) => {
    const { validatePhoneNumber } = require('../utils/phoneValidation');
    const validation = validatePhoneNumber(value);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    return true;
  }),
  body('jobId').notEmpty().withMessage('Job ID is required')
], handleValidationErrors, publicController.applyForJob);

// Review Routes
router.get('/employers/:employerId/reviews', publicController.getEmployerReviews);
router.post('/employers/:employerId/reviews', [
  body('reviewerName').notEmpty().withMessage('Name is required'),
  body('reviewerEmail').isEmail().withMessage('Valid email is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('description').notEmpty().withMessage('Review description is required')
], handleValidationErrors, publicController.submitEmployerReview);
router.get('/employers/:employerId/submitted-reviews', publicController.getSubmittedReviews);

module.exports = router;