const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const placementController = require('../controllers/placementController');
const handleValidationErrors = require('../middlewares/validation');
const { upload } = require('../middlewares/upload');
const { auth } = require('../middlewares/auth');
const { requiredPhoneValidationRules, phoneValidationRules } = require('../middlewares/phoneValidation');

const coercePlacementCredits = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const resolvePlacementDisplayCredits = ({ candidate, placementCandidate, fileCredits } = {}) => {
  const candidateCredits = coercePlacementCredits(candidate?.credits);
  if (candidateCredits !== null) {
    return candidateCredits;
  }

  const assignedCredits = coercePlacementCredits(placementCandidate?.creditsAssigned);
  if (assignedCredits !== null) {
    return assignedCredits;
  }

  const fallbackCredits = coercePlacementCredits(fileCredits);
  if (fallbackCredits !== null) {
    return fallbackCredits;
  }

  return 0;
};

// Registration route without file upload
router.post('/register', [
  body('name')
    .notEmpty().withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('collegeName')
    .notEmpty().withMessage('College name is required')
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage('College name must be between 3 and 150 characters')
    .matches(/^[a-zA-Z0-9\s\-&.,()]+$/).withMessage('College name contains invalid characters'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[@#!%$*?]/).withMessage('Password must contain at least one special character (@#!%$*?)'),
  ...requiredPhoneValidationRules()
], handleValidationErrors, placementController.registerPlacement);

router.post('/create-password', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[@#!%$*?]/).withMessage('Password must contain at least one special character (@#!%$*?)')
], handleValidationErrors, placementController.createPassword);

// Login route
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], handleValidationErrors, placementController.loginPlacement);

router.post('/check-email', [
  body('email').isEmail().withMessage('Valid email is required')
], handleValidationErrors, placementController.checkEmail);

router.post('/password/send-otp', [
  body('email').isEmail().withMessage('Valid email is required')
], handleValidationErrors, placementController.sendOTP);

router.post('/password/verify-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').notEmpty().withMessage('OTP is required'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[@#!%$*?]/).withMessage('Password must contain at least one special character (@#!%$*?)')
], handleValidationErrors, placementController.verifyOTPAndResetPassword);

router.post('/verify-mobile', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], handleValidationErrors, placementController.verifyMobileOTP);

router.post('/resend-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required')
], handleValidationErrors, placementController.resendMobileOTP);

router.post('/password/update-reset', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[@#!%$*?]/).withMessage('Password must contain at least one special character (@#!%$*?)')
], handleValidationErrors, placementController.updatePasswordReset);

// Get Placement Dean's student data
router.get('/students', auth(['placement']), placementController.getMyStudents);

// Get Placement Dean profile
router.get('/profile', auth(['placement']), async (req, res) => {
  try {
    const Placement = require('../models/Placement');
    const placementId = req.user._id || req.user.id;
    
    console.log('=== GET PROFILE REQUEST ===');
    console.log('Placement ID:', placementId);
    console.log('User object:', req.user);
    
    const placement = await Placement.findById(placementId)
      .select('name firstName lastName email phone collegeName collegeAddress collegeOfficialEmail additionalOfficialEmail collegeOfficialPhone status logo idCard fileHistory credits')
      .lean();
    
    if (!placement) {
      console.log('Placement not found:', placementId);
      return res.status(404).json({ success: false, message: 'Placement Dean not found' });
    }
    
    // Ensure firstName and lastName are populated from name if they don't exist
    if (placement.name && (!placement.firstName || !placement.lastName)) {
      const nameParts = placement.name.split(' ');
      if (nameParts.length >= 2) {
        placement.firstName = placement.firstName || nameParts[0];
        placement.lastName = placement.lastName || nameParts.slice(1).join(' ');
      } else {
        placement.firstName = placement.firstName || placement.name;
        placement.lastName = placement.lastName || '';
      }
    }
    
    console.log('Placement profile data:', {
      id: placement._id,
      name: placement.name,
      firstName: placement.firstName,
      lastName: placement.lastName,
      email: placement.email,
      phone: placement.phone,
      collegeName: placement.collegeName,
      hasLogo: !!placement.logo,
      hasIdCard: !!placement.idCard,
      fileHistoryCount: placement.fileHistory?.length || 0
    });
    
    res.json({ success: true, placement });
  } catch (error) {
    console.error('=== GET PROFILE ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get placement dashboard stats
router.get('/dashboard', auth(['placement']), placementController.getPlacementDashboard);

// Upload student data file
router.post('/upload-student-data', auth(['placement']), upload.single('studentData'), placementController.uploadStudentData);

// View specific file data
router.get('/files/:fileId/view', auth(['placement']), placementController.viewFileData);

// Resubmit rejected file
router.post('/files/:fileId/resubmit', auth(['placement']), upload.single('studentData'), placementController.resubmitFile);

// Delete rejected file
router.delete('/files/:fileId', auth(['placement']), placementController.deleteRejectedFile);

// Get placement data (for Placement Dean to view their own data)
router.get('/data', auth(['placement']), async (req, res) => {
  try {
    const Placement = require('../models/Placement');
    const Candidate = require('../models/Candidate');
    const PlacementCandidate = require('../models/PlacementCandidate');
    
    const placementId = req.user.id;
    
    // Get placement record with file history
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement Dean not found' });
    }

    let students = [];
    const fileInfoMap = new Map(
      (placement.fileHistory || []).map(file => [
        String(file._id),
        {
          fileName: file.fileName || '',
          batch: file.batch || '',
          university: file.university || placement.collegeName || '',
          credits: coercePlacementCredits(file.credits) ?? 0
        }
      ])
    );

    const placementCandidates = await PlacementCandidate.find({
      placementId,
      status: 'approved'
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    if (placementCandidates.length > 0) {
      const candidateIds = placementCandidates
        .map(record => record.candidateId)
        .filter(Boolean);
      const linkedCandidates = candidateIds.length > 0
        ? await Candidate.find({ _id: { $in: candidateIds } })
          .select('name email phone course credits fileId placementId registrationMethod')
          .lean()
        : [];

      const candidateMap = new Map(
        linkedCandidates.map(candidate => [String(candidate._id), candidate])
      );
      const studentMap = new Map();

      placementCandidates.forEach(record => {
        const candidate = record.candidateId ? candidateMap.get(String(record.candidateId)) : null;
        if (candidate && (candidate.registrationMethod !== 'placement' || String(candidate.placementId || '') !== String(placementId))) {
          return;
        }

        const email = String(candidate?.email || record.studentEmail || '').trim();
        const normalizedEmail = email.toLowerCase();

        if (!normalizedEmail || studentMap.has(normalizedEmail)) {
          return;
        }

        const fileId = String(candidate?.fileId || record.fileId || '');
        const fileInfo = fileInfoMap.get(fileId) || {};
        const sourceRow = record.originalRowData || {};
        const credits = resolvePlacementDisplayCredits({
          candidate,
          placementCandidate: record,
          fileCredits: fileInfo.credits
        });

        studentMap.set(normalizedEmail, {
          name: candidate?.name || record.studentName || '',
          email,
          phone: candidate?.phone || record.studentPhone || '',
          course: candidate?.course || record.course || sourceRow.Course || sourceRow.course || sourceRow.COURSE || sourceRow.Branch || sourceRow.branch || sourceRow.BRANCH || 'Not Specified',
          credits,
          id: sourceRow.ID || sourceRow.id || sourceRow.Id || '',
          fileName: fileInfo.fileName || record.fileName || '',
          batch: fileInfo.batch || '',
          university: fileInfo.university || record.collegeName || placement.collegeName || ''
        });
      });

      students = Array.from(studentMap.values());
    }

    // If no students from files, try to get from Candidate model
    if (students.length === 0) {
      const candidates = await Candidate.find({ placementId })
        .select('name email phone course credits fileId')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      const studentMap = new Map();
      candidates.forEach(candidate => {
        const email = String(candidate.email || '').trim();
        const normalizedEmail = email.toLowerCase();
        if (!normalizedEmail || studentMap.has(normalizedEmail)) {
          return;
        }

        const fileInfo = fileInfoMap.get(String(candidate.fileId || '')) || {};
        studentMap.set(normalizedEmail, {
          name: candidate.name,
          email,
          phone: candidate.phone,
          course: candidate.course || 'Not Specified',
          credits: resolvePlacementDisplayCredits({
            candidate,
            fileCredits: fileInfo.credits
          }),
          fileName: fileInfo.fileName || '',
          batch: fileInfo.batch || '',
          university: fileInfo.university || placement.collegeName || ''
        });
      });

      students = Array.from(studentMap.values());
    }
    
    console.log(`Retrieved ${students.length} actual students for placement ${placementId}`);
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error getting placement data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save dashboard state
router.post('/save-dashboard-state', auth(['placement']), placementController.saveDashboardState);

// Upload logo
router.post('/upload-logo', auth(['placement']), upload.single('logo'), placementController.uploadLogo);

// Upload ID card
router.post('/upload-id-card', auth(['placement']), upload.single('idCard'), placementController.uploadIdCard);

// Update placement profile
router.put('/profile', auth(['placement']), [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('Phone number must be exactly 10 digits'),
  body('collegeName').notEmpty().withMessage('College name is required'),
  body('collegeAddress').notEmpty().withMessage('College address is required'),
  body('collegeOfficialEmail').isEmail().withMessage('Valid college official email is required'),
  body('collegeOfficialPhone').isLength({ min: 10, max: 10 }).withMessage('Phone number must be exactly 10 digits')
], handleValidationErrors, placementController.updateProfile);

// Get placement notifications
router.get('/notifications', auth(['placement']), async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const mongoose = require('mongoose');
    const placementId = new mongoose.Types.ObjectId(req.user._id || req.user.id);
    
    console.log('=== PLACEMENT NOTIFICATIONS REQUEST ===');
    console.log('Placement ID:', placementId);
    
    const notifications = await Notification.find({
      role: 'placement',
      $or: [
        { placementId: { $exists: false } }, // General placement notifications (no specific placementId)
        { placementId: placementId } // Specific to this Placement Dean only
      ]
    })
    .sort({ createdAt: -1 })
    .lean();
    
    const unreadCount = await Notification.countDocuments({
      role: 'placement',
      $or: [
        { placementId: { $exists: false }, isRead: false },
        { placementId: placementId, isRead: false }
      ]
    });
    
    console.log(`Retrieved ${notifications.length} notifications for Placement Dean`);
    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all placement notifications as read (specific route BEFORE parameterized route)
router.patch('/notifications/read-all', auth(['placement']), async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const mongoose = require('mongoose');
    const placementId = new mongoose.Types.ObjectId(req.user._id || req.user.id);
    
    console.log('=== MARK ALL NOTIFICATIONS AS READ ===');
    console.log('Placement ID:', placementId);
    
    const result = await Notification.updateMany(
      {
        role: 'placement',
        $or: [
          { placementId: { $exists: false }, isRead: false },
          { placementId: placementId, isRead: false }
        ]
      },
      { isRead: true }
    );
    
    console.log(`Updated ${result.modifiedCount} notifications`);
    res.json({ success: true, message: 'All notifications marked as read', modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark placement notification as read
router.patch('/notifications/:id/read', auth(['placement']), async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dismiss/delete placement notification
router.put('/notifications/:id/dismiss', auth(['placement']), async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const mongoose = require('mongoose');
    const placementId = new mongoose.Types.ObjectId(req.user._id || req.user.id);
    
    // Verify the notification belongs to this Placement Dean or is a general notification
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    // Check authorization: notification must be either general or belong to this Placement Dean
    const isAuthorized = 
      notification.role === 'placement' && 
      (!notification.placementId || notification.placementId.equals(placementId));
    
    if (!isAuthorized) {
      console.warn(`Unauthorized attempt to dismiss notification ${req.params.id} by Placement Dean ${placementId}`);
      return res.status(403).json({ success: false, message: 'Unauthorized to dismiss this notification' });
    }
    
    // Delete the notification
    await Notification.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Notification dismissed' });
  } catch (error) {
    console.error('Error dismissing notification:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
