const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const placementController = require('../controllers/placementController');
const handleValidationErrors = require('../middlewares/validation');
const { upload } = require('../middlewares/upload');
const { auth } = require('../middlewares/auth');
const { requiredPhoneValidationRules, phoneValidationRules } = require('../middlewares/phoneValidation');

// Registration route without file upload
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('collegeName').notEmpty().withMessage('College name is required'),
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

// Get placement officer's student data
router.get('/students', auth(['placement']), placementController.getMyStudents);

// Get placement officer profile
router.get('/profile', auth(['placement']), async (req, res) => {
  try {
    const Placement = require('../models/Placement');
    const placementId = req.user._id || req.user.id;
    
    console.log('=== GET PROFILE REQUEST ===');
    console.log('Placement ID:', placementId);
    console.log('User object:', req.user);
    
    const placement = await Placement.findById(placementId)
      .select('name firstName lastName email phone collegeName collegeAddress collegeOfficialEmail collegeOfficialPhone status logo idCard fileHistory credits')
      .lean();
    
    if (!placement) {
      console.log('Placement not found:', placementId);
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
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

// Get placement data (for placement officers to view their own data)
router.get('/data', auth(['placement']), async (req, res) => {
  try {
    const Placement = require('../models/Placement');
    const Candidate = require('../models/Candidate');
    const XLSX = require('xlsx');
    const { base64ToBuffer } = require('../utils/base64Helper');
    
    const placementId = req.user.id;
    
    // Get placement record with file history
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    let students = [];
    const studentMap = new Map();

    // Get students from ALL uploaded files in file history
    if (placement.fileHistory && placement.fileHistory.length > 0) {
      for (const file of placement.fileHistory) {
        if (file && file.fileData) {
          try {
            const result = base64ToBuffer(file.fileData);
            const buffer = result.buffer;
            
            let workbook;
            if (file.fileType && file.fileType.includes('csv')) {
              const csvData = buffer.toString('utf8');
              workbook = XLSX.read(csvData, { type: 'string' });
            } else {
              workbook = XLSX.read(buffer, { type: 'buffer' });
            }
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // Parse and format student data from each uploaded file
            jsonData.forEach(row => {
              const email = row.Email || row.email || row.EMAIL || '';
              if (email && !studentMap.has(email.toLowerCase())) {
                // Extract credits from multiple possible column names
                let credits = 0;
                const creditsValue = row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || 
                                    row.Credits || row.credits || row.CREDITS || 
                                    row.Credit || row.credit || row.CREDIT ||
                                    row['Available Credits'] || row['available credits'] || row['AVAILABLE CREDITS'] ||
                                    file.credits || placement.credits || 0;
                
                // Parse credits value
                if (typeof creditsValue === 'number') {
                  credits = creditsValue;
                } else if (typeof creditsValue === 'string') {
                  const parsed = parseInt(creditsValue.replace(/[^0-9]/g, ''));
                  credits = isNaN(parsed) ? 0 : parsed;
                }
                
                studentMap.set(email.toLowerCase(), {
                  name: row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['Student Name'] || '',
                  email: email,
                  phone: row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '',
                  course: row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified',
                  credits: credits,
                  id: row.ID || row.id || row.Id || '',
                  fileName: file.fileName,
                  batch: file.batch || '',
                  university: file.university || placement.collegeName || ''
                });
              }
            });
          } catch (parseError) {
            console.error('Error parsing uploaded file:', parseError);
          }
        }
      }
      
      // Convert map to array
      students = Array.from(studentMap.values());
    }

    // If no students from files, try to get from Candidate model
    if (students.length === 0) {
      const candidates = await Candidate.find({ placementId })
        .select('name email phone course credits')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
      
      students = candidates.map(candidate => ({
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        course: candidate.course || 'Not Specified',
        credits: candidate.credits || 0
      }));
    } else {
      // Reverse the array so newest entries appear first
      students.reverse();
    }
    
    console.log(`Retrieved ${students.length} unique students from ${placement.fileHistory?.length || 0} files`);
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error getting placement data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save dashboard state
router.post('/save-dashboard-state', auth(['placement']), placementController.saveDashboardState);

// Upload logo
router.post('/upload-logo', auth(['placement']), placementController.uploadLogo);

// Upload ID card
router.post('/upload-id-card', auth(['placement']), placementController.uploadIdCard);

// Update placement profile
router.put('/profile', auth(['placement']), [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phone').isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10-15 digits'),
  body('collegeName').notEmpty().withMessage('College name is required'),
  body('collegeAddress').notEmpty().withMessage('College address is required'),
  body('collegeOfficialEmail').isEmail().withMessage('Valid college official email is required'),
  body('collegeOfficialPhone').isLength({ min: 10, max: 15 }).withMessage('College official phone must be between 10-15 digits')
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
      $or: [
        { role: 'placement', placementId: { $exists: false } }, // General placement notifications
        { role: 'placement', placementId: placementId } // Specific to this placement officer
      ]
    })
    .sort({ createdAt: -1 })
    .lean();
    
    const unreadCount = await Notification.countDocuments({
      $or: [
        { role: 'placement', placementId: { $exists: false }, isRead: false },
        { role: 'placement', placementId: placementId, isRead: false }
      ]
    });
    
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
    
    await Notification.updateMany(
      {
        $or: [
          { role: 'placement', placementId: { $exists: false }, isRead: false },
          { role: 'placement', placementId: placementId, isRead: false }
        ]
      },
      { isRead: true }
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
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
    
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({ success: true, message: 'Notification dismissed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;