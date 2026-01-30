const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth } = require('../middlewares/auth');

const { body } = require('express-validator');
const handleValidationErrors = require('../middlewares/validation');

router.post('/login', adminController.loginAdmin);
router.post('/send-otp', adminController.sendOTP);
router.post('/verify-otp-reset', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').notEmpty().withMessage('OTP is required'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[@#!%$*?]/).withMessage('Password must contain at least one special character (@#!%$*?)')
], handleValidationErrors, adminController.verifyOTPAndResetPassword);

// Sub Admin Profile Route (must be before auth middleware)
router.get('/sub-admin/profile', auth(['sub-admin']), adminController.getSubAdminProfile);

router.use(auth(['admin', 'sub-admin']));

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/charts', adminController.getChartData);
router.get('/profile', adminController.getAdminProfile);
router.get('/users', adminController.getUsers);
router.delete('/users/:userId/:userType', adminController.deleteUser);
router.put('/users/:userId/:userType', adminController.updateUser);

router.get('/jobs', adminController.getAllJobs);
router.delete('/jobs/:id', adminController.deleteJob);
router.put('/jobs/:jobId/approve', adminController.approveJob);
router.put('/jobs/:jobId/reject', adminController.rejectJob);

router.get('/employers', adminController.getAllEmployers);
router.get('/employers/pending', adminController.getEmployersPendingApproval);
router.get('/employers/:id/jobs', adminController.getEmployerJobs);
router.get('/employers/:id/profile', adminController.getEmployerProfile);
router.put('/employers/:id/profile', adminController.updateEmployerProfile);
router.put('/employers/:id/status', adminController.updateEmployerStatus);
router.delete('/employers/:id', adminController.deleteEmployer);
router.get('/employers/:employerId/documents/:documentType', adminController.downloadDocument);
router.get('/employers/:employerId/view-document/:documentType', adminController.viewDocument);
router.put('/employers/:employerId/authorization-letters/:letterId/approve', adminController.approveAuthorizationLetter);
router.put('/employers/:employerId/authorization-letters/:letterId/reject', adminController.rejectAuthorizationLetter);

router.get('/candidates', adminController.getAllCandidates);
router.get('/candidates/registered', adminController.getRegisteredCandidates);
router.get('/candidates/:candidateId', adminController.getCandidateDetails);
router.post('/candidates/create', [
  body('name').notEmpty().withMessage('Name is required'),
  body('mobileNumber').notEmpty().withMessage('Mobile number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('credits').isNumeric().withMessage('Credits must be a number')
], handleValidationErrors, adminController.createCandidate);
router.delete('/candidates/:id', adminController.deleteCandidate);
router.put('/candidates/:candidateId/credits', adminController.updateCandidateCredits);
router.post('/candidates/credits/bulk', adminController.bulkUpdateCandidateCredits);
router.get('/candidates/credits/list', adminController.getCandidatesForCredits);

router.get('/placements', adminController.getAllPlacements);
router.get('/placements/:id', adminController.getPlacementDetails);
router.put('/placements/:id/status', adminController.updatePlacementStatus);
router.get('/placements/:id/download', adminController.downloadPlacementFile);
router.put('/placements/:id/credits', adminController.assignPlacementCredits);
router.get('/placements/:id/id-card', adminController.downloadPlacementIdCard);
router.put('/placements/:id/files/:fileId/approve', adminController.approveIndividualFile);
router.put('/placements/:id/files/:fileId/reject', adminController.rejectIndividualFile);
router.post('/placements/:id/files/:fileId/process', adminController.approveIndividualFile);
router.put('/placements/:placementId/files/credits', adminController.assignBulkFileCredits);
router.put('/placements/:id/files/:fileId/credits', adminController.updateFileCredits);
router.put('/placements/:id/bulk-credits', adminController.assignBulkFileCredits);
router.post('/placements/:id/store-excel', adminController.storeExcelDataInMongoDB);
router.post('/placements/:id/store-excel-data', adminController.storeExcelDataInMongoDB);
router.get('/placements/:id/excel-data', adminController.getStoredExcelData);
router.get('/placements/:id/excel-data/:fileId', adminController.getStoredExcelData);
router.get('/placements/:id/stored-excel-data', adminController.getStoredExcelData);
router.get('/placements/:id/data', adminController.getPlacementData);
router.get('/placements/:id/files/:fileId/data', adminController.getFileData);
router.get('/placements/:id/download-id-card', adminController.downloadPlacementIdCard);
router.get('/placement-candidates', adminController.getAllPlacementCandidates);
router.post('/placement-candidates/:placementCandidateId/resend-email', adminController.resendWelcomeEmail);
router.post('/placement-candidates/retry-failed-emails', adminController.retryFailedEmails);
router.post('/placement-candidates/bulk-resend-emails', adminController.bulkResendWelcomeEmails);
router.get('/placement-candidates/stats', adminController.getPlacementCandidateStats);
router.post('/placements/:id/sync-credits', adminController.syncExcelCreditsWithCandidates);
router.post('/placements/:id/approve-all', adminController.approveAllStudentsInPlacement);

router.get('/applications', adminController.getApplications);

router.get('/support-tickets', adminController.getSupportTickets);
router.get('/support-tickets/:id', adminController.getSupportTicketById);
router.put('/support-tickets/:id', adminController.updateSupportTicketStatus);
router.delete('/support-tickets/:id', adminController.deleteSupportTicket);
router.get('/support-tickets/:ticketId/attachments/:attachmentIndex', adminController.downloadSupportAttachment);

router.post('/content/:type', adminController.createContent);
router.put('/content/:type/:contentId', adminController.updateContent);
router.delete('/content/:type/:contentId', adminController.deleteContent);

router.get('/contacts', adminController.getContactForms);
router.delete('/contacts/:contactId', adminController.deleteContactForm);

router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Sub Admin Management (Admin only)
router.get('/sub-admins', auth(['admin']), adminController.getAllSubAdmins);
router.post('/sub-admins', auth(['admin']), [
  body('name').notEmpty().withMessage('Name is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[@#!%$*?]/).withMessage('Password must contain at least one special character (@#!%$*?)')
], handleValidationErrors, adminController.createSubAdmin);
router.put('/sub-admins/:id', auth(['admin']), [
  body('name').notEmpty().withMessage('Name is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[@#!%$*?]/).withMessage('Password must contain at least one special character (@#!%$*?)')
], handleValidationErrors, adminController.updateSubAdmin);
router.delete('/sub-admins/:id', auth(['admin']), adminController.deleteSubAdmin);

router.post('/placement/generate-token', adminController.generatePlacementLoginToken);

module.exports = router;
