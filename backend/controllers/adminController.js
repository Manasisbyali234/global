const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const SubAdmin = require('../models/SubAdmin');
const Candidate = require('../models/Candidate');
const CandidateProfile = require('../models/CandidateProfile');
const Employer = require('../models/Employer');
const Placement = require('../models/Placement');
const PlacementCandidate = require('../models/PlacementCandidate');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');
const Support = require('../models/Support');
const Testimonial = require('../models/Testimonial');
const FAQ = require('../models/FAQ');
const Partner = require('../models/Partner');
const SiteSettings = require('../models/SiteSettings');
const EmployerProfile = require('../models/EmployerProfile');
const { base64ToBuffer, generateFilename } = require('../utils/base64Helper');
const { createNotification } = require('./notificationController');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const { emitCreditUpdate, emitBulkCreditUpdate } = require('../utils/websocket');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

const checkSubAdminPermission = (userPermissions, requiredPermission) => {
  return userPermissions && userPermissions.includes(requiredPermission);
};

// Authentication Controller
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // First check if it's a regular admin
    let user = await Admin.findByEmail(email.trim());
    let userType = 'admin';
    
    // If not found in Admin, check SubAdmin
    if (!user) {
      user = await SubAdmin.findByEmail(email.trim());
      userType = 'sub-admin';
    }
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    const token = generateToken(user._id, userType);

    const responseData = {
      success: true,
      token,
      [userType === 'admin' ? 'admin' : 'subAdmin']: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(userType === 'sub-admin' && { permissions: user.permissions })
      }
    };

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dashboard Statistics Controller
exports.getDashboardStats = async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const candidatesWithProfile = await CandidateProfile.countDocuments();
    const approvedEmployers = await Employer.countDocuments({ isApproved: true });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const pendingJobs = await Job.countDocuments({ status: 'pending' });
    const pendingPlacements = await Placement.countDocuments({ status: 'pending' });
    const totalPlacements = await Placement.countDocuments();

    const stats = {
      totalCandidates,
      completedProfileCandidates: candidatesWithProfile,
      approvedEmployers,
      totalJobs,
      totalApplications,
      activeJobs,
      pendingJobs,
      pendingPlacements,
      totalPlacements
    };

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Chart Data Controller
exports.getChartData = async (req, res) => {
  try {
    // Get monthly application data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyApplications = await Application.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyEmployers = await Employer.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get top employers by job count
    const topEmployers = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'employers',
          localField: 'employerId',
          foreignField: '_id',
          as: 'employer'
        }
      },
      { $unwind: '$employer' },
      {
        $group: {
          _id: '$employerId',
          companyName: { $first: '$employer.companyName' },
          jobCount: { $sum: 1 }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      chartData: {
        monthlyApplications,
        monthlyEmployers,
        topEmployers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User Management Controllers
exports.getUsers = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    
    let users;
    if (type === 'candidates') {
      const candidates = await Candidate.find().select('-password')
        .limit(limit * 1).skip((page - 1) * limit);
      
      // Enhance candidates with profile completion status
      const { calculateProfileCompletionWithDetails } = require('../utils/profileCompletion');
      const enhancedCandidates = await Promise.all(
        candidates.map(async (candidate) => {
          const profile = await CandidateProfile.findOne({ candidateId: candidate._id }).lean();
          const profileCompletion = calculateProfileCompletionWithDetails(profile);
          
          return {
            ...candidate.toObject(),
            hasProfile: !!profile,
            isProfileComplete: profileCompletion.percentage === 100,
            profileCompletionPercentage: profileCompletion.percentage
          };
        })
      );
      users = enhancedCandidates;
    } else if (type === 'employers') {
      users = await Employer.find().select('-password')
        .limit(limit * 1).skip((page - 1) * limit);
    } else {
      const candidates = await Candidate.find().select('-password').limit(5);
      const employers = await Employer.find().select('-password').limit(5);
      users = { candidates, employers };
    }

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    
    if (userType === 'candidate') {
      await Candidate.findByIdAndDelete(userId);
    } else if (userType === 'employer') {
      await Employer.findByIdAndDelete(userId);
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    
    let user;
    if (userType === 'candidate') {
      user = await Candidate.findByIdAndUpdate(userId, req.body, { new: true }).select('-password');
    } else if (userType === 'employer') {
      user = await Employer.findByIdAndUpdate(userId, req.body, { new: true }).select('-password');
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Job Management Controllers
exports.approveJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.jobId,
      { status: 'active' },
      { new: true }
    );

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.jobId,
      { status: 'closed' },
      { new: true }
    );

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const jobs = await Job.find(query)
      .populate('employerId', 'companyName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllEmployers = async (req, res) => {
  try {
    const { status, page = 1, limit = 50, approvalStatus } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (approvalStatus === 'pending') {
      query.isApproved = false;
    }
    if (approvalStatus === 'approved') query.isApproved = true;

    const employers = await Employer.find(query)
      .select('-password')
      .populate('approvedBy', 'name username email role firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Enrich with profile completion status
    const employersWithProfile = await Promise.all(
      employers.map(async (employer) => {
        const profile = await EmployerProfile.findOne({ employerId: employer._id }).lean();
        const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
        const isProfileComplete = profile && requiredFields.every(field => profile[field]);
        
        return {
          ...employer,
          hasProfile: !!profile,
          isProfileComplete,
          profileCompletionPercentage: profile 
            ? Math.round((requiredFields.filter(field => profile[field]).length / requiredFields.length) * 100)
            : 0
        };
      })
    );

    res.json({ success: true, data: employersWithProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const candidates = await Candidate.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Enhance candidates with profile completion status
    const { calculateProfileCompletionWithDetails } = require('../utils/profileCompletion');
    const enhancedCandidates = await Promise.all(
      candidates.map(async (candidate) => {
        const profile = await require('../models/CandidateProfile').findOne({ candidateId: candidate._id }).lean();
        const profileCompletion = calculateProfileCompletionWithDetails(profile);
        
        return {
          ...candidate.toObject(),
          hasProfile: !!profile,
          isProfileComplete: profileCompletion.percentage === 100,
          profileCompletionPercentage: profileCompletion.percentage
        };
      })
    );

    res.json({ success: true, data: enhancedCandidates, candidates: enhancedCandidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEmployerStatus = async (req, res) => {
  try {
    const { status, isApproved } = req.body;

    // Check if employer has completed their profile before approving
    if (isApproved === true) {
      const profile = await EmployerProfile.findOne({ employerId: req.params.id });
      
      if (!profile) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot approve employer. Company profile not found. Employer must complete their profile first.' 
        });
      }

      // Check required profile fields
      const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
      const missingFields = requiredFields.filter(field => !profile[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot approve employer. Company profile is incomplete. Missing fields: ${missingFields.join(', ')}`,
          missingFields
        });
      }
    }

    const updateData = {};

    // Normalize and validate status to only 'active' | 'inactive'
    if (status !== undefined) {
      const normalized = String(status).toLowerCase();
      if (normalized === 'approved') {
        updateData.status = 'active';
      } else if (normalized === 'rejected') {
        updateData.status = 'inactive';
      } else if (normalized === 'active' || normalized === 'inactive') {
        updateData.status = normalized;
      }
      // Any other status values are ignored to prevent invalid writes
    }

    // Update approval flag
    if (isApproved !== undefined) {
      updateData.isApproved = !!isApproved;
      if (isApproved) {
        updateData.approvedBy = new mongoose.Types.ObjectId(req.user.id);
        updateData.approvedByModel = (req.user.role === 'admin' || req.user.role === 'super-admin') ? 'Admin' : 'SubAdmin';
      }
    }

    // If approving and no explicit status provided, ensure account is active
    if (updateData.isApproved === true && updateData.status === undefined) {
      updateData.status = 'active';
    }
    
    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }

    // Send approval email and create notification
    if (isApproved !== undefined) {
      try {
        if (isApproved) {
          const { sendEmployerAccountApprovalEmail } = require('../utils/emailService');
          await sendEmployerAccountApprovalEmail(employer.email, employer.name || employer.companyName);
        }
        
        const notificationData = {
          title: isApproved ? 'Profile Approved - You Can Now Post Jobs!' : 'Profile Rejected',
          message: isApproved 
            ? 'Congratulations! Your company profile has been approved by admin. You can now post jobs and start hiring candidates.' 
            : 'Your company profile has been rejected by admin. Please contact support for more information or resubmit your profile with the required corrections.',
          type: isApproved ? 'profile_approved' : 'profile_rejected',
          role: 'employer',
          relatedId: employer._id,
          createdBy: req.user.id
        };
        
        await createNotification(notificationData);
      } catch (notifError) {
        console.error('Failed to send approval email/notification:', notifError);
      }
    }

    res.json({ success: true, employer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEmployer = async (req, res) => {
  try {
    const employer = await Employer.findByIdAndDelete(req.params.id);
    
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }

    res.json({ success: true, message: 'Employer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployerProfile = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ employerId: req.params.id })
      .populate('employerId', 'name email phone companyName');
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEmployerProfile = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.params.id },
      req.body,
      { new: true }
    ).populate('employerId', 'name email phone companyName');
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    // Check if any document verification status was updated and create notification
    try {
      const verificationFields = {
        panCardVerified: 'PAN Card',
        cinVerified: 'CIN Document',
        gstVerified: 'GST Certificate',
        incorporationVerified: 'Certificate of Incorporation',
        authorizationVerified: 'Authorization Letter'
      };

      for (const [field, documentName] of Object.entries(verificationFields)) {
        if (req.body[field] && (req.body[field] === 'approved' || req.body[field] === 'rejected')) {
          const isApproved = req.body[field] === 'approved';
          const notificationData = {
            title: `${documentName} ${isApproved ? 'Approved' : 'Rejected'}`,
            message: `Your ${documentName} document has been ${req.body[field]} by admin. ${isApproved ? 'You can now proceed with the next steps.' : 'Please resubmit the document with correct information.'}`,
            type: isApproved ? 'document_approved' : 'document_rejected',
            role: 'employer',
            relatedId: new mongoose.Types.ObjectId(req.params.id),
            createdBy: new mongoose.Types.ObjectId(req.user.id)
          };
          
          console.log('Creating notification:', notificationData);
          const createdNotification = await createNotification(notificationData);
          console.log('Notification created:', createdNotification);
        }
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue execution even if notification fails
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Download Base64 document
exports.downloadDocument = async (req, res) => {
  try {
    const { employerId, documentType } = req.params;
    
    const profile = await EmployerProfile.findOne({ employerId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const base64Data = profile[documentType];
    if (!base64Data) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const { buffer, mimeType, extension } = base64ToBuffer(base64Data);
    const filename = generateFilename(documentType, extension);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// View Base64 document (for displaying images without downloading)
exports.viewDocument = async (req, res) => {
  try {
    const { employerId, documentType } = req.params;
    
    console.log(`Viewing document: ${documentType} for employer: ${employerId}`);
    
    const profile = await EmployerProfile.findOne({ employerId });
    if (!profile) {
      console.log('Profile not found for employer:', employerId);
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    let base64Data = profile[documentType];
    if (!base64Data) {
      console.log(`Document ${documentType} not found in profile`);
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    console.log(`Document found, data length: ${base64Data.length}`);
    console.log(`Document starts with: ${base64Data.substring(0, 50)}`);

    let buffer, mimeType;
    
    try {
      if (base64Data.startsWith('data:')) {
        const result = base64ToBuffer(base64Data);
        buffer = result.buffer;
        mimeType = result.mimeType;
        console.log(`Processed with base64ToBuffer, mimeType: ${mimeType}`);
      } else {
        // Handle legacy base64 without data URL prefix
        buffer = Buffer.from(base64Data, 'base64');
        mimeType = 'image/jpeg'; // Default fallback
        console.log('Processed as legacy base64, using default mimeType: image/jpeg');
      }

      console.log(`Buffer created, size: ${buffer.length} bytes`);

      // Validate buffer content
      if (buffer.length === 0) {
        console.error('Buffer is empty');
        return res.status(400).json({ 
          success: false, 
          message: 'Document data is empty' 
        });
      }

      // Set appropriate headers with CORS support
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      // For PDF files, add specific headers to ensure proper display
      if (mimeType === 'application/pdf') {
        res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
        res.setHeader('X-Content-Type-Options', 'nosniff');
      }
      
      console.log('Sending document response');
      res.send(buffer);
    } catch (bufferError) {
      console.error('Error processing document buffer:', bufferError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error processing document data',
        error: bufferError.message 
      });
    }
  } catch (error) {
    console.error('Error in viewDocument:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Content Management Controllers
exports.createContent = async (req, res) => {
  try {
    const { type } = req.params;
    let content;

    switch (type) {
      case 'blog':
        content = await Blog.create({ ...req.body, author: req.user._id });
        break;
      case 'testimonial':
        content = await Testimonial.create(req.body);
        break;
      case 'faq':
        content = await FAQ.create(req.body);
        break;
      case 'partner':
        content = await Partner.create(req.body);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid content type' });
    }

    res.status(201).json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const { type, contentId } = req.params;
    let content;

    switch (type) {
      case 'blog':
        content = await Blog.findByIdAndUpdate(contentId, req.body, { new: true });
        break;
      case 'testimonial':
        content = await Testimonial.findByIdAndUpdate(contentId, req.body, { new: true });
        break;
      case 'faq':
        content = await FAQ.findByIdAndUpdate(contentId, req.body, { new: true });
        break;
      case 'partner':
        content = await Partner.findByIdAndUpdate(contentId, req.body, { new: true });
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid content type' });
    }

    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const { type, contentId } = req.params;

    switch (type) {
      case 'blog':
        await Blog.findByIdAndDelete(contentId);
        break;
      case 'testimonial':
        await Testimonial.findByIdAndDelete(contentId);
        break;
      case 'faq':
        await FAQ.findByIdAndDelete(contentId);
        break;
      case 'partner':
        await Partner.findByIdAndDelete(contentId);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid content type' });
    }

    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Contact Form Management Controllers
exports.getContactForms = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteContactForm = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.contactId);
    res.json({ success: true, message: 'Contact form deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Site Settings Controllers
exports.updateSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true }
    );

    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const applications = await Application.find(filter)
      .populate('candidateId', 'name email phone')
      .populate('employerId', 'companyName email')
      .populate('jobId', 'title location')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRegisteredCandidates = async (req, res) => {
  try {
    // Remove pagination to load all candidates quickly
    const candidatesWithProfiles = await Candidate.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'candidateprofiles',
          localField: '_id',
          foreignField: 'candidateId',
          as: 'profile'
        }
      },
      {
        $addFields: {
          profile: { $arrayElemAt: ['$profile', 0] },
          hasProfile: { $gt: [{ $size: '$profile' }, 0] }
        }
      },
      {
        $project: {
          password: 0
        }
      }
    ]);

    // Calculate profile completion for each candidate
    const { calculateProfileCompletionWithDetails } = require('../utils/profileCompletion');
    const enhancedCandidates = candidatesWithProfiles.map(candidate => {
      const profileCompletion = calculateProfileCompletionWithDetails(candidate.profile);
      return {
        ...candidate,
        isProfileComplete: profileCompletion.percentage === 100,
        profileCompletionPercentage: profileCompletion.percentage,
        missingSections: profileCompletion.missingSections
      };
    });

    res.json({ success: true, data: enhancedCandidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCandidateDetails = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const candidate = await Candidate.findById(candidateId).select('-password');
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Fetch fresh profile data without caching
    const profile = await CandidateProfile.findOne({ candidateId }).lean();
    
    // Calculate profile completion status
    const { calculateProfileCompletionWithDetails } = require('../utils/profileCompletion');
    const profileCompletion = calculateProfileCompletionWithDetails(profile);
    const isProfileComplete = profileCompletion.percentage === 100;
    
    // Get candidate's job applications with company details
    const applications = await Application.find({ candidateId })
      .populate({
        path: 'jobId',
        select: 'title category location',
        populate: {
          path: 'employerId',
          select: 'companyName'
        }
      })
      .populate('employerId', 'companyName')
      .sort({ createdAt: -1 });

    // Format applications data for the frontend
    const formattedApplications = applications.map(app => ({
      companyName: app.jobId?.employerId?.companyName || app.employerId?.companyName || 'N/A',
      jobTitle: app.jobId?.title || 'N/A',
      jobCategory: app.jobId?.category || 'N/A',
      status: app.status || 'pending',
      shortlistedStatus: app.status === 'shortlisted' || app.status === 'interview_scheduled' || app.status === 'selected',
      currentRound: app.interviewRound || (app.status === 'applied' ? 'Initial' : app.status),
      selected: app.status === 'selected',
      appliedDate: app.createdAt,
      createdAt: app.createdAt
    }));
    
    // Ensure education data is properly formatted with the latest updates
    let formattedEducation = [];
    if (profile && profile.education && Array.isArray(profile.education)) {
      formattedEducation = profile.education.map((edu, index) => ({
        ...edu,
        // Ensure passYear is properly mapped for admin display
        passYear: edu.passYear || edu.yearOfPassing || edu.year,
        // Map different field names to consistent format
        degreeName: edu.degreeName || edu.schoolName || edu.degree,
        collegeName: edu.collegeName || edu.location || edu.institution,
        percentage: edu.percentage || edu.score,
        cgpa: edu.cgpa || edu.gpa,
        grade: edu.grade || edu.result,
        specialization: edu.specialization || edu.courseName || edu.stream,
        registrationNumber: edu.registrationNumber || edu.enrollmentNumber,
        state: edu.state || edu.location,
        marksheet: edu.marksheet || edu.document
      }));
    }
    
    const candidateWithProfile = {
      ...candidate.toObject(),
      ...profile,
      // Override education with properly formatted data
      education: formattedEducation,
      hasProfile: !!profile,
      isProfileComplete,
      profileCompletionPercentage: profileCompletion.percentage,
      missingSections: profileCompletion.missingSections,
      applications: formattedApplications
    };

    // Set cache headers to prevent stale data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({ success: true, candidate: candidateWithProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployerJobs = async (req, res) => {
  try {
    const employerId = req.params.id || req.params.employerId;
    
    const jobs = await Job.find({ employerId })
      .select('title status createdAt')
      .sort({ createdAt: -1 });

    const jobCount = jobs.length;

    res.json({ success: true, jobs, jobCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Placement Management Controllers
exports.getAllPlacements = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const placements = await Placement.find(query)
      .select('-password')
      .populate('approvedBy', 'name username email role firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    res.json({ success: true, data: placements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePlacementStatus = async (req, res) => {
  try {
    const { status, isApproved } = req.body;

    const updateData = {};
    if (status !== undefined) {
      const normalized = String(status).toLowerCase();
      if (normalized === 'approved') {
        updateData.status = 'active';
      } else if (normalized === 'rejected') {
        updateData.status = 'inactive';
      }
    }

    if (isApproved !== undefined) {
      updateData.isApproved = !!isApproved;
      if (isApproved) {
        updateData.approvedBy = new mongoose.Types.ObjectId(req.user.id);
        updateData.approvedByModel = (req.user.role === 'admin' || req.user.role === 'super-admin') ? 'Admin' : 'SubAdmin';
      }
    }
    if (updateData.isApproved === true && updateData.status === undefined) {
      updateData.status = 'active';
    }
    
    const placement = await Placement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    // Send approval email and create notification
    if (updateData.status === 'active') {
      try {
        const { sendPlacementOfficerApprovalEmail } = require('../utils/emailService');
        await sendPlacementOfficerApprovalEmail(placement.email, placement.name);
        
        await createNotification({
          title: 'Account Approved',
          message: 'Your placement officer account has been approved by admin. You can now sign in.',
          type: 'placement_approved',
          role: 'placement',
          relatedId: placement._id,
          createdBy: req.user.id
        });
      } catch (notifError) {
        console.error('Failed to send approval email/notification:', notifError);
      }
    }

    res.json({ success: true, placement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPlacementDetails = async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id).select('-password');
    
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    res.json({ success: true, placement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPlacementData = async (req, res) => {
  try {
    const placementId = req.params.id;
    
    const candidates = await Candidate.find({ placementId })
      .select('name email phone course credits')
      .lean();
    
    res.json({ success: true, students: candidates });
  } catch (error) {
    console.error('Error getting placement data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFileData = async (req, res) => {
  try {
    const { id: placementId, fileId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    const file = placement.fileHistory.id(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (!file.fileData) {
      return res.json({ success: true, students: [] });
    }

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
    
    if (!jsonData || jsonData.length === 0) {
      return res.json({ success: true, students: [] });
    }
    
    const students = jsonData.map(row => ({
      id: row.ID || row.id || row.Id || '',
      name: row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['full name'] || row['FULL NAME'] || row['Student Name'] || row['student name'] || row['STUDENT NAME'] || '',
      collegeName: row['College Name'] || row['college name'] || row['COLLEGE NAME'] || row.College || row.college || row.COLLEGE || '',
      email: row.Email || row.email || row.EMAIL || '',
      phone: row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '',
      course: row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified',
      password: row.Password || row.password || row.PASSWORD || '',
      credits: parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || file.credits || 0)
    }));
    
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error getting file data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadPlacementFile = async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id);
    if (!placement || !placement.studentData) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const { buffer, mimeType } = base64ToBuffer(placement.studentData);
    const filename = placement.fileName || 'student_data.xlsx';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignPlacementCredits = async (req, res) => {
  try {
    const { credits } = req.body;
    const creditsNum = Math.min(10000, Math.max(0, parseInt(credits) || 0));
    
    const placement = await Placement.findById(req.params.id);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    // Update all non-rejected files in fileHistory with the new credits
    if (placement.fileHistory && placement.fileHistory.length > 0) {
      for (let file of placement.fileHistory) {
        // Skip rejected files
        if (file.status === 'rejected') {
          continue;
        }
        file.credits = creditsNum;
        
        // Update the file data with new credits
        if (file.fileData) {
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
            
            // Update all rows with new credits
            const updatedData = jsonData.map(row => ({
              ...row,
              'Credits Assigned': creditsNum,
              'credits assigned': creditsNum,
              'CREDITS ASSIGNED': creditsNum,
              Credits: creditsNum,
              credits: creditsNum,
              CREDITS: creditsNum,
              Credit: creditsNum,
              credit: creditsNum
            }));
            
            // Convert back to Excel/CSV
            const newWorksheet = XLSX.utils.json_to_sheet(updatedData);
            const newWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
            
            let newBuffer;
            let mimeType;
            if (file.fileType && file.fileType.includes('csv')) {
              const csvOutput = XLSX.utils.sheet_to_csv(newWorksheet);
              newBuffer = Buffer.from(csvOutput, 'utf8');
              mimeType = 'text/csv';
            } else {
              newBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });
              mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            }
            
            file.fileData = `data:${mimeType};base64,${newBuffer.toString('base64')}`;
          } catch (fileError) {
            console.error('Error updating file data with credits:', fileError);
          }
        }
      }
    }
    
    // Update legacy studentData if it exists
    let updatedStudentData = placement.studentData;
    if (placement.studentData && placement.fileType) {
      try {
        const XLSX = require('xlsx');
        const { buffer } = base64ToBuffer(placement.studentData);
        
        let workbook;
        if (placement.fileType.includes('csv')) {
          const csvData = buffer.toString('utf8');
          workbook = XLSX.read(csvData, { type: 'string' });
        } else {
          workbook = XLSX.read(buffer, { type: 'buffer' });
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const updatedData = jsonData.map(row => ({
          ...row,
          'Credits Assigned': creditsNum
        }));
        
        const newWorksheet = XLSX.utils.json_to_sheet(updatedData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
        
        let newBuffer;
        let mimeType;
        if (placement.fileType.includes('csv')) {
          const csvOutput = XLSX.utils.sheet_to_csv(newWorksheet);
          newBuffer = Buffer.from(csvOutput, 'utf8');
          mimeType = 'text/csv';
        } else {
          newBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        
        updatedStudentData = `data:${mimeType};base64,${newBuffer.toString('base64')}`;
      } catch (fileError) {
        console.error('Error updating legacy file:', fileError);
      }
    }
    
    const updatedPlacement = await Placement.findByIdAndUpdate(
      req.params.id,
      { 
        credits: creditsNum,
        studentData: updatedStudentData,
        fileHistory: placement.fileHistory
      },
      { new: true, runValidators: true }
    ).select('-password');

    // Update all candidates linked to this placement with new credits
    const placementObjectId = new mongoose.Types.ObjectId(req.params.id);
    const candidatesToUpdate = await Candidate.find(
      { placementId: placementObjectId },
      { _id: 1 }
    );
    
    const updateResult = await Candidate.updateMany(
      { placementId: placementObjectId },
      { $set: { credits: creditsNum } }
    );

    // Emit real-time credit updates to affected candidates
    if (candidatesToUpdate.length > 0) {
      const candidateIds = candidatesToUpdate.map(c => c._id.toString());
      emitBulkCreditUpdate(candidateIds, creditsNum);
      // Removed console debug line for security
      
      // Add a small delay to ensure WebSocket messages are processed
      setTimeout(() => {
        // Removed console debug line for security
      }, 1000);
    }

    // Removed console debug line for security
    // Removed console debug line for security;

    res.json({ 
      success: true, 
      placement: updatedPlacement,
      message: `Credits updated successfully! ${updateResult.modifiedCount} candidates will see the updated credits in their dashboard immediately.`,
      candidatesUpdated: updateResult.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Credit Management Controllers
exports.updateCandidateCredits = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { creditsToAdd } = req.body;
    
    if (typeof creditsToAdd !== 'number') {
      return res.status(400).json({ success: false, message: 'Credits must be a number' });
    }
    
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    
    const newCredits = Math.max(0, (candidate.credits || 0) + creditsToAdd);
    
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { credits: newCredits },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, candidate: updatedCandidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkUpdateCandidateCredits = async (req, res) => {
  try {
    const { creditsToAdd, candidateIds } = req.body;
    
    if (typeof creditsToAdd !== 'number' || !Array.isArray(candidateIds)) {
      return res.status(400).json({ success: false, message: 'Invalid request data' });
    }
    
    // Get all candidates to calculate new credits
    const candidates = await Candidate.find({ _id: { $in: candidateIds } });
    
    // Update each candidate's credits
    const updatePromises = candidates.map(candidate => {
      const newCredits = Math.max(0, (candidate.credits || 0) + creditsToAdd);
      return Candidate.findByIdAndUpdate(
        candidate._id,
        { credits: newCredits },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    res.json({ 
      success: true, 
      message: `Successfully updated credits for ${candidates.length} candidates`,
      updatedCount: candidates.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCandidatesForCredits = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .select('name email credits registrationMethod placementId')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCandidate = async (req, res) => {
  try {
    const { firstName, lastName, email, password, collegeName, credits } = req.body;
    
    if (!firstName || !lastName || !email || !password || !collegeName) {
      return res.status(400).json({ 
        success: false, 
        message: 'First name, last name, email, password, and college name are required' 
      });
    }
    
    const existingCandidate = await Candidate.findByEmail(email.trim());
    if (existingCandidate) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const finalCredits = Math.max(0, Math.min(10000, parseInt(credits) || 0));
    
    const candidate = await Candidate.create({
      name: fullName,
      email: email.toLowerCase().trim(),
      password: password.trim(),
      credits: finalCredits,
      registrationMethod: 'admin',
      isVerified: true,
      status: 'active'
    });
    
    await CandidateProfile.create({ 
      candidateId: candidate._id,
      collegeName: collegeName.trim()
    });
    
    try {
      const { sendPlacementCandidateWelcomeEmail } = require('../utils/emailService');
      await sendPlacementCandidateWelcomeEmail(
        candidate.email,
        candidate.name,
        password.trim(),
        'Admin',
        collegeName.trim()
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Candidate created successfully and welcome email sent',
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        credits: candidate.credits
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sub Admin Management Controllers
exports.createSubAdmin = async (req, res) => {
  try {
    const { name, firstName, lastName, username, email, phone, employerCode, permissions, password } = req.body;
    
    // Check if username or email already exists
    const existingSubAdmin = await SubAdmin.findOne({ 
      $or: [
        { email: new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }, 
        { username: username.trim() }
      ] 
    });
    
    if (existingSubAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }
    
    const subAdmin = await SubAdmin.create({
      name,
      firstName,
      lastName,
      username,
      email,
      phone,
      employerCode,
      permissions,
      password,
      createdBy: req.user.id
    });
    
    const subAdminResponse = subAdmin.toObject();
    delete subAdminResponse.password;
    
    res.status(201).json({ success: true, subAdmin: subAdminResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllSubAdmins = async (req, res) => {
  try {
    const subAdmins = await SubAdmin.find()
      .select('-password')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, subAdmins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSubAdmin = async (req, res) => {
  try {
    const { name, firstName, lastName, username, email, phone, employerCode, permissions, password } = req.body;
    
    // Check if username or email already exists for other sub-admins
    const existingSubAdmin = await SubAdmin.findOne({ 
      $or: [
        { email: new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }, 
        { username: username.trim() }
      ],
      _id: { $ne: req.params.id }
    });
    
    if (existingSubAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }
    
    const updateData = {
      name,
      firstName,
      lastName,
      username,
      email,
      phone,
      employerCode,
      permissions,
      updatedAt: new Date() // Force update timestamp
    };
    
    // Only update password if provided
    if (password) {
      updateData.password = password;
    }
    
    const subAdmin = await SubAdmin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: 'Sub Admin not found' });
    }
    
    // Create notification for the sub-admin about profile update
    try {
      await createNotification({
        title: 'Profile Updated',
        message: 'Your sub-admin profile has been updated by the main admin. Please refresh your page to see the changes.',
        type: 'profile_updated',
        role: 'sub-admin',
        relatedId: subAdmin._id,
        createdBy: req.user.id
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }
    
    res.json({ 
      success: true, 
      subAdmin,
      message: 'Sub Admin updated successfully. They will need to refresh their page to see changes.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSubAdmin = async (req, res) => {
  try {
    const subAdmin = await SubAdmin.findByIdAndDelete(req.params.id);
    
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: 'Sub Admin not found' });
    }
    
    res.json({ success: true, message: 'Sub Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get employers pending approval with complete profiles
exports.getEmployersPendingApproval = async (req, res) => {
  try {
    const employers = await Employer.find({ 
      isApproved: false, 
      status: 'active',
      profileSubmittedForReview: true // Only show employers who have submitted complete profiles
    })
      .select('-password')
      .sort({ profileSubmittedAt: -1 }); // Sort by submission date

    // Filter employers with complete profiles
    const employersWithCompleteProfile = [];
    
    for (const employer of employers) {
      const profile = await EmployerProfile.findOne({ employerId: employer._id });
      const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
      const isProfileComplete = profile && requiredFields.every(field => profile[field]);
      
      if (isProfileComplete) {
        employersWithCompleteProfile.push({
          ...employer.toObject(),
          profile: profile.toObject(),
          isProfileComplete: true,
          profileSubmittedAt: employer.profileSubmittedAt
        });
      }
    }

    res.json({ 
      success: true, 
      data: employersWithCompleteProfile,
      count: employersWithCompleteProfile.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate login token for placement officer
exports.generatePlacementLoginToken = async (req, res) => {
  try {
    const { placementId } = req.body;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }
    
    if (placement.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Placement officer is not active' });
    }
    
    const token = generateToken(placement._id, 'placement');
    
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Authorization Letter Management
exports.approveAuthorizationLetter = async (req, res) => {
  try {
    const { employerId, letterId } = req.params;
    
    const profile = await EmployerProfile.findOne({ employerId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    // Find the authorization letter
    const letterIndex = profile.authorizationLetters.findIndex(letter => letter._id.toString() === letterId);
    if (letterIndex === -1) {
      return res.status(404).json({ success: false, message: 'Authorization letter not found' });
    }

    // Update the letter status
    profile.authorizationLetters[letterIndex].status = 'approved';
    profile.authorizationLetters[letterIndex].approvedAt = new Date();
    profile.authorizationLetters[letterIndex].approvedBy = req.user.id;
    
    await profile.save();

    // Create notification for employer
    try {
      const notificationData = {
        title: 'Authorization Letter Approved',
        message: `Your authorization letter "${profile.authorizationLetters[letterIndex].fileName}" has been approved by admin. You can now proceed with the next steps.`,
        type: 'document_approved',
        role: 'employer',
        relatedId: new mongoose.Types.ObjectId(employerId),
        createdBy: new mongoose.Types.ObjectId(req.user.id)
      };
      
      await createNotification(notificationData);
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    res.json({ success: true, message: 'Authorization letter approved successfully' });
  } catch (error) {
    console.error('Error approving authorization letter:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectAuthorizationLetter = async (req, res) => {
  try {
    const { employerId, letterId } = req.params;
    
    const profile = await EmployerProfile.findOne({ employerId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    // Find the authorization letter
    const letterIndex = profile.authorizationLetters.findIndex(letter => letter._id.toString() === letterId);
    if (letterIndex === -1) {
      return res.status(404).json({ success: false, message: 'Authorization letter not found' });
    }

    // Update the letter status
    profile.authorizationLetters[letterIndex].status = 'rejected';
    profile.authorizationLetters[letterIndex].rejectedAt = new Date();
    profile.authorizationLetters[letterIndex].rejectedBy = req.user.id;
    
    await profile.save();

    // Create notification for employer
    try {
      const notificationData = {
        title: 'Authorization Letter Rejected',
        message: `Your authorization letter "${profile.authorizationLetters[letterIndex].fileName}" has been rejected by admin. Please resubmit the document with correct information or contact support for assistance.`,
        type: 'document_rejected',
        role: 'employer',
        relatedId: new mongoose.Types.ObjectId(employerId),
        createdBy: new mongoose.Types.ObjectId(req.user.id)
      };
      
      await createNotification(notificationData);
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    res.json({ success: true, message: 'Authorization letter rejected successfully' });
  } catch (error) {
    console.error('Error rejecting authorization letter:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Individual file approval/rejection
exports.approveIndividualFile = async (req, res) => {
  try {
    const { id: placementId, fileId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement not found' });
    }

    // Find the file in history
    const fileIndex = placement.fileHistory.findIndex(file => file._id.toString() === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const file = placement.fileHistory[fileIndex];
    if (!file.fileData) {
      return res.status(400).json({ success: false, message: 'File data not available' });
    }

    // Process the file data
    const XLSX = require('xlsx');
    const { base64ToBuffer } = require('../utils/base64Helper');
    
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
      
      let createdCount = 0;
      let skippedCount = 0;
      let emailsSent = 0;
      let emailsFailed = 0;
      const errors = [];
      const createdCandidates = [];
      const skippedCandidates = [];
      
      // Process each row from Excel
      for (let index = 0; index < jsonData.length; index++) {
        try {
          const row = jsonData[index];
          let email = row.Email || row.email || row.EMAIL;
          let password = row.Password || row.password || row.PASSWORD;
          let name = row.Name || row.name || row.NAME || row['Full Name'] || row['full name'] || row['FULL NAME'] || row['Student Name'] || row['student name'] || row['STUDENT NAME'] || row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'];
          const phone = row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE;
          const course = row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH;
          const collegeName = row['College Name'] || row['college name'] || row['COLLEGE NAME'] || row.College || row.college || row.COLLEGE || placement.collegeName;
          
          // Auto-generate missing fields with proper validation
          if (!email || email.trim() === '') {
            email = `student${index + 1}@${placement.collegeName.toLowerCase().replace(/\s+/g, '')}.edu`;
          }
          if (!password || password.trim() === '') {
            password = `pwd${Math.random().toString(36).substr(2, 8)}`;
          }
          if (!name || name.trim() === '') {
            name = `Student ${index + 1}`;
          }
          
          // Validate required fields
          if (!email || !password || !name) {
            errors.push(`Row ${index + 1}: Missing required fields (email, password, or name)`);
            continue;
          }
          
          // Check if candidate already exists
          const existingCandidate = await Candidate.findByEmail(email.trim());
          if (existingCandidate) {
            skippedCount++;
            skippedCandidates.push({
              name: name.trim(),
              email: email.trim().toLowerCase(),
              reason: 'Already exists in database'
            });
            continue;
          }
          
          // Use file-specific credits or individual row credits
          const rowCredits = parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || 0);
          const finalCredits = rowCredits || file.credits || placement.credits || 0;
          
          // Create candidate with placement credentials
          const candidate = await Candidate.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password.trim(),
            phone: phone ? phone.toString().trim() : '',
            course: course ? course.trim() : '',
            credits: finalCredits,
            registrationMethod: 'placement',
            placementId: placement._id,
            fileId: file._id,
            isVerified: true,
            status: 'active'
          });
          
          // Create candidate profile
          await CandidateProfile.create({ 
            candidateId: candidate._id,
            collegeName: collegeName || placement.collegeName,
            education: [{
              degreeName: course ? course.trim() : '',
              collegeName: collegeName || placement.collegeName,
              scoreType: 'percentage',
              scoreValue: '0'
            }]
          });
          
          // Create placement candidate record with enhanced data
          const placementCandidate = await PlacementCandidate.create({
            candidateId: candidate._id,
            studentName: name.trim(),
            studentEmail: email.trim().toLowerCase(),
            studentPhone: phone ? phone.toString().trim() : '',
            course: course ? course.trim() : '',
            collegeName: collegeName || placement.collegeName,
            placementId: placement._id,
            placementOfficerName: placement.name,
            placementOfficerEmail: placement.email,
            placementOfficerPhone: placement.phone,
            fileId: file._id,
            fileName: file.customName || file.fileName,
            status: 'approved',
            approvedAt: new Date(),
            approvedBy: req.user.id,
            creditsAssigned: finalCredits,
            originalRowData: row
          });
          
          // Send welcome email with create password link
          try {
            const { sendCandidateDetailsUpdatedEmail } = require('../utils/emailService');
            await sendCandidateDetailsUpdatedEmail(
              email.trim().toLowerCase(),
              name.trim(),
              finalCredits
            );
            
            // Update placement candidate record to mark email as sent
            await PlacementCandidate.findByIdAndUpdate(
              placementCandidate._id,
              { 
                welcomeEmailSent: true,
                welcomeEmailSentAt: new Date()
              }
            );
            
            emailsSent++;
          } catch (emailError) {
            console.error(`Failed to send welcome email to ${email}:`, emailError);
            emailsFailed++;
            // Continue processing even if email fails
          }
          
          createdCandidates.push({
            name: candidate.name,
            email: candidate.email,
            password: password.trim(),
            credits: finalCredits,
            course: course || 'Not Specified',
            collegeName: collegeName || placement.collegeName
          });
          
          createdCount++;
        } catch (rowError) {
          console.error('Row processing error:', rowError);
          errors.push(`Row ${index + 1}: ${rowError.message}`);
        }
      }
      
      // Update file status to 'processed' after successful approval and processing
      await Placement.findOneAndUpdate(
        { _id: placementId, 'fileHistory._id': fileId },
        { 
          $set: { 
            'fileHistory.$.status': 'processed',
            'fileHistory.$.processedAt': new Date(),
            'fileHistory.$.candidatesCreated': createdCount
          }
        }
      );

      // Create comprehensive notification
      try {
        const displayName = file.customName || file.fileName;
        await createNotification({
          title: 'Students Approved - Welcome Emails Sent',
          message: `File "${displayName}" approved! ${createdCount} students can now create their passwords. ${emailsSent} welcome emails sent successfully.`,
          type: 'file_processed',
          role: 'admin',
          relatedId: placementId,
          createdBy: req.user.id
        });
      } catch (notifError) {
        console.error('Notification creation failed:', notifError);
      }
      
      const displayName = file.customName || file.fileName;
      let message;
      if (createdCount === 0 && skippedCount > 0) {
        message = `File "${displayName}" processed! ${skippedCount} students already exist in the system. Use "Resend Welcome Emails" to send emails to existing students.`;
      } else {
        message = `File "${displayName}" approved! ${createdCount} students created and ${emailsSent} welcome emails sent. All students can now create their passwords and access their accounts.`;
      }
      
      res.json({
        success: true,
        message,
        stats: { 
          created: createdCount, 
          skipped: skippedCount, 
          errors: errors.length,
          emailsSent: emailsSent,
          emailsFailed: emailsFailed
        },
        createdCandidates: createdCandidates.slice(0, 10),
        skippedCandidates: skippedCandidates.slice(0, 10),
        errors: errors.slice(0, 10),
        loginInstructions: {
          url: 'http://localhost:3000/',
          message: createdCount > 0 ? 'Students have received welcome emails with create password links. They can create their passwords and then login using Sign In → Candidate tab' : 'Students already exist. Use Resend Welcome Emails feature to send login credentials.'
        }
      });
      
    } catch (processError) {
      console.error('File processing error:', processError);
      res.status(400).json({ success: false, message: 'Failed to process file data' });
    }
  } catch (error) {
    console.error('Error approving file:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectIndividualFile = async (req, res) => {
  try {
    const { id: placementId, fileId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement not found' });
    }

    // Find the file in history
    const fileIndex = placement.fileHistory.findIndex(file => file._id.toString() === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const file = placement.fileHistory[fileIndex];
    
    // Update file status in history
    console.log(`Updating file ${fileId} status to rejected`);
    const updatedPlacement = await Placement.findOneAndUpdate(
      { _id: placementId, 'fileHistory._id': fileId },
      { $set: { 'fileHistory.$.status': 'rejected', 'fileHistory.$.processedAt': new Date() } },
      { new: true }
    );
    console.log(`File status updated to rejected for placement ${placementId}`);
    
    // Verify the update
    const verifyPlacement = await Placement.findById(placementId);
    const updatedFile = verifyPlacement.fileHistory.find(f => f._id.toString() === fileId);
    console.log(`Verified file status: ${updatedFile?.status}`);

    // Create notification
    try {
      const notification = await createNotification({
        title: 'File Rejected',
        message: `File "${file.customName || file.fileName}" has been rejected by admin.`,
        type: 'file_rejected',
        role: 'admin',
        relatedId: placementId,
        createdBy: req.user.id
      });
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
    }
    
    res.json({ success: true, message: 'File rejected successfully' });
  } catch (error) {
    console.error('Error rejecting file:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update credits for specific file
exports.updateFileCredits = async (req, res) => {
  try {
    const { id: placementId, fileId } = req.params;
    const { credits } = req.body;
    
    if (typeof credits !== 'number' || credits < 0 || credits > 10000) {
      return res.status(400).json({ success: false, message: 'Credits must be between 0 and 10000' });
    }
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    const file = placement.fileHistory.id(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if file is rejected
    if (file.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Cannot update credits for rejected files' });
    }

    // Update file credits
    file.credits = credits;
    
    // Update the file data with new credits
    if (file.fileData) {
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
        
        // Update all rows with new credits
        const updatedData = jsonData.map(row => ({
          ...row,
          'Credits Assigned': credits,
          'credits assigned': credits,
          'CREDITS ASSIGNED': credits,
          Credits: credits,
          credits: credits,
          CREDITS: credits,
          Credit: credits,
          credit: credits
        }));
        
        // Convert back to Excel/CSV
        const newWorksheet = XLSX.utils.json_to_sheet(updatedData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
        
        let newBuffer;
        let mimeType;
        if (file.fileType && file.fileType.includes('csv')) {
          const csvOutput = XLSX.utils.sheet_to_csv(newWorksheet);
          newBuffer = Buffer.from(csvOutput, 'utf8');
          mimeType = 'text/csv';
        } else {
          newBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        
        file.fileData = `data:${mimeType};base64,${newBuffer.toString('base64')}`;
      } catch (fileError) {
        console.error('Error updating file data with credits:', fileError);
      }
    }
    
    await placement.save();
    
    // Update all candidates linked to this specific file with new credits
    const candidatesToUpdate = await Candidate.find(
      { placementId: placementId, fileId: fileId },
      { _id: 1 }
    );
    
    const updateResult = await Candidate.updateMany(
      { placementId: placementId, fileId: fileId },
      { $set: { credits: credits } }
    );
    
    // Emit real-time credit updates to affected candidates
    if (candidatesToUpdate.length > 0) {
      const candidateIds = candidatesToUpdate.map(c => c._id.toString());
      emitBulkCreditUpdate(candidateIds, credits);
    }
    
    // Also update candidates who don't have fileId but belong to this placement
    // This handles legacy candidates created before fileId tracking
    const legacyCandidatesToUpdate = await Candidate.find(
      { placementId: placementId, fileId: { $exists: false } },
      { _id: 1 }
    );
    
    let legacyUpdateResult = { modifiedCount: 0 };
    if (legacyCandidatesToUpdate.length > 0) {
      legacyUpdateResult = await Candidate.updateMany(
        { placementId: placementId, fileId: { $exists: false } },
        { $set: { credits: credits } }
      );
      
      const legacyCandidateIds = legacyCandidatesToUpdate.map(c => c._id.toString());
      emitBulkCreditUpdate(legacyCandidateIds, credits);
    }
    
    res.json({
      success: true,
      message: `File credits updated successfully. ${updateResult.modifiedCount} candidates updated.`,
      file: {
        id: file._id,
        fileName: file.fileName,
        credits: file.credits
      },
      candidatesUpdated: updateResult.modifiedCount + legacyUpdateResult.modifiedCount
    });
    
  } catch (error) {
    console.error('Error updating file credits:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign credits to all files in a placement
exports.assignBulkFileCredits = async (req, res) => {
  try {
    const { id: placementId } = req.params;
    const { credits } = req.body;
    const creditsNum = Math.min(10000, Math.max(0, parseInt(credits) || 0));
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    let updatedFiles = 0;
    
    // Update only processed files in fileHistory with the new credits
    if (placement.fileHistory && placement.fileHistory.length > 0) {
      for (let file of placement.fileHistory) {
        // Only update processed files
        if (file.status !== 'processed') {
          continue;
        }
        file.credits = creditsNum;
        
        // Update the file data with new credits
        if (file.fileData) {
          try {
            const { base64ToBuffer } = require('../utils/base64Helper');
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
            
            // Update all rows with new credits
            const updatedData = jsonData.map(row => ({
              ...row,
              'Credits Assigned': creditsNum,
              'credits assigned': creditsNum,
              'CREDITS ASSIGNED': creditsNum,
              Credits: creditsNum,
              credits: creditsNum,
              CREDITS: creditsNum,
              Credit: creditsNum,
              credit: creditsNum
            }));
            
            // Convert back to Excel/CSV
            const newWorksheet = XLSX.utils.json_to_sheet(updatedData);
            const newWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
            
            let newBuffer;
            let mimeType;
            if (file.fileType && file.fileType.includes('csv')) {
              const csvOutput = XLSX.utils.sheet_to_csv(newWorksheet);
              newBuffer = Buffer.from(csvOutput, 'utf8');
              mimeType = 'text/csv';
            } else {
              newBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });
              mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            }
            
            file.fileData = `data:${mimeType};base64,${newBuffer.toString('base64')}`;
            updatedFiles++;
          } catch (fileError) {
            console.error('Error updating file data with credits:', fileError);
          }
        }
      }
    }
    
    await placement.save();
    
    // Update all candidates linked to this placement with new credits
    const placementObjectId = new mongoose.Types.ObjectId(placementId);
    const updateResult = await Candidate.updateMany(
      { placementId: placementObjectId },
      { $set: { credits: creditsNum } }
    );

    res.json({ 
      success: true, 
      message: `Credits updated successfully for ${updatedFiles} files and ${updateResult.modifiedCount} candidates`,
      stats: {
        filesUpdated: updatedFiles,
        candidatesUpdated: updateResult.modifiedCount,
        creditsAssigned: creditsNum
      }
    });
  } catch (error) {
    console.error('Error assigning bulk file credits:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Store complete Excel data in MongoDB
exports.storeExcelDataInMongoDB = async (req, res) => {
  try {
    const { id: placementId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    let totalRecordsStored = 0;
    const storedFiles = [];
    
    // Process all files in fileHistory
    if (placement.fileHistory && placement.fileHistory.length > 0) {
      for (let file of placement.fileHistory) {
        if (file.fileData) {
          try {
            const { base64ToBuffer } = require('../utils/base64Helper');
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
            
            // Store structured data in file object
            const structuredData = jsonData.map((row, index) => ({
              rowIndex: index + 1,
              id: row.ID || row.id || row.Id || '',
              candidateName: row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['full name'] || row['FULL NAME'] || row['Student Name'] || row['student name'] || row['STUDENT NAME'] || '',
              collegeName: row['College Name'] || row['college name'] || row['COLLEGE NAME'] || row.College || row.college || row.COLLEGE || '',
              email: row.Email || row.email || row.EMAIL || '',
              phone: row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '',
              course: row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified',
              password: row.Password || row.password || row.PASSWORD || '',
              creditsAssigned: parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || file.credits || 0),
              originalRowData: row, // Store complete original row data
              processedAt: new Date(),
              placementId: placement._id,
              fileId: file._id
            }));
            
            // Update file with structured data
            file.structuredData = structuredData;
            file.dataStoredAt = new Date();
            file.recordCount = structuredData.length;
            
            totalRecordsStored += structuredData.length;
            storedFiles.push({
              fileName: file.fileName,
              recordCount: structuredData.length,
              fileId: file._id
            });
            
          } catch (fileError) {
            console.error(`Error processing file ${file.fileName}:`, fileError);
          }
        }
      }
    }
    
    // Save placement with structured data
    await placement.save();
    
    res.json({ 
      success: true, 
      message: `Excel data stored successfully in MongoDB`,
      stats: {
        totalFilesProcessed: storedFiles.length,
        totalRecordsStored: totalRecordsStored,
        storedFiles: storedFiles
      }
    });
  } catch (error) {
    console.error('Error storing Excel data in MongoDB:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get stored Excel data from MongoDB
exports.getStoredExcelData = async (req, res) => {
  try {
    const { id: placementId, fileId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    if (fileId) {
      // Get data for specific file
      const file = placement.fileHistory.id(fileId);
      if (!file) {
        return res.status(404).json({ success: false, message: 'File not found' });
      }

      res.json({
        success: true,
        data: file.structuredData || [],
        fileInfo: {
          fileName: file.fileName,
          recordCount: file.recordCount || 0,
          dataStoredAt: file.dataStoredAt,
          status: file.status
        }
      });
    } else {
      // Get data for all files
      const allData = [];
      const fileInfos = [];

      placement.fileHistory.forEach(file => {
        if (file.structuredData && file.structuredData.length > 0) {
          allData.push(...file.structuredData);
          fileInfos.push({
            fileName: file.fileName,
            recordCount: file.recordCount || 0,
            dataStoredAt: file.dataStoredAt,
            status: file.status,
            fileId: file._id
          });
        }
      });

      res.json({
        success: true,
        data: allData,
        totalRecords: allData.length,
        files: fileInfos
      });
    }
  } catch (error) {
    console.error('Error getting stored Excel data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get all placement candidates with comprehensive details
exports.getAllPlacementCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, placementId, search } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (placementId) query.placementId = placementId;
    
    // Add search functionality
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { studentEmail: { $regex: search, $options: 'i' } },
        { placementOfficerName: { $regex: search, $options: 'i' } },
        { collegeName: { $regex: search, $options: 'i' } }
      ];
    }

    const placementCandidates = await PlacementCandidate.find(query)
      .populate('candidateId', 'name email phone credits status createdAt')
      .populate('placementId', 'name email collegeName phone')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCandidates = await PlacementCandidate.countDocuments(query);
    
    // Enhance data with additional information
    const enhancedCandidates = placementCandidates.map(pc => ({
      id: pc._id,
      studentName: pc.studentName,
      studentEmail: pc.studentEmail,
      studentPhone: pc.studentPhone,
      course: pc.course,
      collegeName: pc.collegeName,
      creditsAssigned: pc.creditsAssigned,
      
      // Placement Officer Details
      placementOfficer: {
        id: pc.placementId?._id,
        name: pc.placementOfficerName,
        email: pc.placementOfficerEmail,
        phone: pc.placementOfficerPhone,
        collegeName: pc.placementId?.collegeName
      },
      
      // File Information
      fileInfo: {
        id: pc.fileId,
        fileName: pc.fileName
      },
      
      // Status and Approval
      status: pc.status,
      approvedAt: pc.approvedAt,
      approvedBy: pc.approvedBy ? {
        name: pc.approvedBy.name,
        email: pc.approvedBy.email
      } : null,
      
      // Email Status
      welcomeEmailSent: pc.welcomeEmailSent,
      welcomeEmailSentAt: pc.welcomeEmailSentAt,
      
      // Candidate Account Status
      candidateAccount: pc.candidateId ? {
        id: pc.candidateId._id,
        name: pc.candidateId.name,
        email: pc.candidateId.email,
        phone: pc.candidateId.phone,
        credits: pc.candidateId.credits,
        status: pc.candidateId.status,
        createdAt: pc.candidateId.createdAt
      } : null,
      
      createdAt: pc.createdAt,
      updatedAt: pc.updatedAt
    }));

    res.json({ 
      success: true, 
      data: enhancedCandidates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCandidates / parseInt(limit)),
        totalCandidates,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting placement candidates:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resend welcome email to specific placement candidate
exports.resendWelcomeEmail = async (req, res) => {
  try {
    const { placementCandidateId } = req.params;
    
    const placementCandidate = await PlacementCandidate.findById(placementCandidateId)
      .populate('candidateId', 'password')
      .populate('placementId', 'name collegeName');
    
    if (!placementCandidate) {
      return res.status(404).json({ success: false, message: 'Placement candidate not found' });
    }

    if (!placementCandidate.candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate account not found' });
    }

    try {
      const { sendPlacementCandidateWelcomeEmail } = require('../utils/emailService');
      await sendPlacementCandidateWelcomeEmail(
        placementCandidate.studentEmail,
        placementCandidate.studentName,
        placementCandidate.candidateId.password,
        placementCandidate.placementOfficerName,
        placementCandidate.collegeName
      );
      
      // Update email sent status
      await PlacementCandidate.findByIdAndUpdate(
        placementCandidateId,
        { 
          welcomeEmailSent: true,
          welcomeEmailSentAt: new Date()
        }
      );
      
      res.json({ 
        success: true, 
        message: `Welcome email resent successfully to ${placementCandidate.studentEmail}` 
      });
    } catch (emailError) {
      console.error('Failed to resend welcome email:', emailError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send welcome email. Please try again.' 
      });
    }
  } catch (error) {
    console.error('Error resending welcome email:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Retry failed email sends for placement candidates
exports.retryFailedEmails = async (req, res) => {
  try {
    // Find placement candidates where email failed or wasn't sent
    const failedEmailCandidates = await PlacementCandidate.find({
      status: 'approved',
      $or: [
        { welcomeEmailSent: { $ne: true } },
        { emailRetryCount: { $gt: 0 } }
      ]
    })
    .populate('candidateId', 'password')
    .populate('placementId', 'name collegeName')
    .limit(50); // Process in batches
    
    let emailsSent = 0;
    let emailsFailed = 0;
    const results = [];

    for (const placementCandidate of failedEmailCandidates) {
      try {
        if (!placementCandidate.candidateId) {
          emailsFailed++;
          results.push({
            email: placementCandidate.studentEmail,
            status: 'failed',
            reason: 'Candidate account not found'
          });
          continue;
        }

        const { retryFailedEmail } = require('../utils/emailService');
        const retryResult = await retryFailedEmail(
          placementCandidate.studentEmail,
          placementCandidate.studentName,
          placementCandidate.candidateId.password,
          placementCandidate.placementOfficerName,
          placementCandidate.collegeName
        );
        
        if (retryResult.success) {
          // Update placement candidate record
          await PlacementCandidate.findByIdAndUpdate(
            placementCandidate._id,
            { 
              welcomeEmailSent: true,
              welcomeEmailSentAt: new Date(),
              emailRetryCount: (placementCandidate.emailRetryCount || 0) + 1,
              lastEmailAttempt: new Date()
            }
          );
          
          emailsSent++;
          results.push({
            email: placementCandidate.studentEmail,
            status: 'sent',
            attempts: retryResult.attempt,
            sentAt: new Date()
          });
        } else {
          // Update retry count even if failed
          await PlacementCandidate.findByIdAndUpdate(
            placementCandidate._id,
            { 
              emailRetryCount: (placementCandidate.emailRetryCount || 0) + retryResult.attempts,
              lastEmailAttempt: new Date()
            }
          );
          
          emailsFailed++;
          results.push({
            email: placementCandidate.studentEmail,
            status: 'failed',
            attempts: retryResult.attempts,
            reason: retryResult.error?.message || 'Unknown error'
          });
        }
      } catch (emailError) {
        console.error(`Failed to retry email for ${placementCandidate.studentEmail}:`, emailError);
        emailsFailed++;
        results.push({
          email: placementCandidate.studentEmail,
          status: 'failed',
          reason: emailError.message
        });
      }
    }
    
    res.json({ 
      success: true, 
      message: `Email retry completed. ${emailsSent} emails sent successfully, ${emailsFailed} failed.`,
      stats: {
        total: failedEmailCandidates.length,
        sent: emailsSent,
        failed: emailsFailed
      },
      results: results
    });
  } catch (error) {
    console.error('Error retrying failed emails:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk resend welcome emails to multiple placement candidates
exports.bulkResendWelcomeEmails = async (req, res) => {
  try {
    const { placementCandidateIds } = req.body;
    
    if (!Array.isArray(placementCandidateIds) || placementCandidateIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid candidate IDs provided' });
    }

    const placementCandidates = await PlacementCandidate.find({
      _id: { $in: placementCandidateIds }
    })
    .populate('candidateId', 'password')
    .populate('placementId', 'name collegeName');
    
    let emailsSent = 0;
    let emailsFailed = 0;
    const results = [];

    for (const placementCandidate of placementCandidates) {
      try {
        if (!placementCandidate.candidateId) {
          emailsFailed++;
          results.push({
            email: placementCandidate.studentEmail,
            status: 'failed',
            reason: 'Candidate account not found'
          });
          continue;
        }

        const { sendPlacementCandidateWelcomeEmail } = require('../utils/emailService');
        await sendPlacementCandidateWelcomeEmail(
          placementCandidate.studentEmail,
          placementCandidate.studentName,
          placementCandidate.candidateId.password,
          placementCandidate.placementOfficerName,
          placementCandidate.collegeName
        );
        
        // Update email sent status
        await PlacementCandidate.findByIdAndUpdate(
          placementCandidate._id,
          { 
            welcomeEmailSent: true,
            welcomeEmailSentAt: new Date()
          }
        );
        
        emailsSent++;
        results.push({
          email: placementCandidate.studentEmail,
          status: 'sent',
          sentAt: new Date()
        });
      } catch (emailError) {
        console.error(`Failed to send welcome email to ${placementCandidate.studentEmail}:`, emailError);
        emailsFailed++;
        results.push({
          email: placementCandidate.studentEmail,
          status: 'failed',
          reason: emailError.message
        });
      }
    }
    
    res.json({ 
      success: true, 
      message: `Bulk email operation completed. ${emailsSent} emails sent, ${emailsFailed} failed.`,
      stats: {
        total: placementCandidates.length,
        sent: emailsSent,
        failed: emailsFailed
      },
      results: results
    });
  } catch (error) {
    console.error('Error bulk resending welcome emails:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sync credits between Excel data and candidate dashboard
exports.syncExcelCreditsWithCandidates = async (req, res) => {
  try {
    const { id: placementId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    let syncedCandidates = 0;
    const syncResults = [];
    
    // Process all files in fileHistory
    if (placement.fileHistory && placement.fileHistory.length > 0) {
      for (let file of placement.fileHistory) {
        if (file.fileData) {
          try {
            const { base64ToBuffer } = require('../utils/base64Helper');
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
            
            // Sync each row with candidate data
            for (const row of jsonData) {
              const email = row.Email || row.email || row.EMAIL;
              const credits = parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || file.credits || 0);
              const course = row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified';
              
              if (email) {
                try {
                  const updateResult = await Candidate.findOneAndUpdate(
                    { 
                      email: email.toLowerCase(),
                      placementId: placement._id
                    },
                    { 
                      credits: credits,
                      course: course
                    },
                    { new: true }
                  );
                  
                  if (updateResult) {
                    syncedCandidates++;
                    syncResults.push({
                      email: email,
                      credits: credits,
                      course: course,
                      fileName: file.fileName
                    });
                  }
                } catch (syncError) {
                  console.error(`Error syncing credits for ${email}:`, syncError);
                }
              }
            }
            
          } catch (fileError) {
            console.error(`Error processing file ${file.fileName}:`, fileError);
          }
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: `Credits synchronized successfully for ${syncedCandidates} candidates`,
      syncedCandidates: syncedCandidates,
      syncResults: syncResults
    });
  } catch (error) {
    console.error('Error syncing Excel credits with candidates:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Download placement ID card
exports.downloadPlacementIdCard = async (req, res) => {
  try {
    const { id: placementId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    if (!placement.idCard) {
      return res.status(404).json({ success: false, message: 'ID card not found' });
    }

    const { buffer, mimeType, extension } = base64ToBuffer(placement.idCard);
    const filename = `${placement.name.replace(/\s+/g, '_')}_ID_Card${extension}`;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Support Ticket Management Controllers
exports.getSupportTickets = async (req, res) => {
  try {
    const { status, userType, priority, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (userType) query.userType = userType;
    if (priority) query.priority = priority;

    const tickets = await Support.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalTickets = await Support.countDocuments(query);
    const unreadCount = await Support.countDocuments({ ...query, isRead: false });

    res.json({ 
      success: true, 
      tickets: tickets,
      totalTickets,
      unreadCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalTickets / parseInt(limit))
    });
  } catch (error) {
    console.error('Error in getSupportTickets:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch support tickets' });
  }
};

exports.getSupportTicketById = async (req, res) => {
  try {
    const ticket = await Support.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    ).lean();
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Error in getSupportTicketById:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch ticket' });
  }
};

exports.updateSupportTicketStatus = async (req, res) => {
  try {
    const { status, response } = req.body;
    const ticketId = req.params.id;
    
    // Validate ticket ID
    if (!ticketId || !mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket ID provided' });
    }
    
    // Validate status
    const validStatuses = ['new', 'in-progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided' });
    }
    
    const updateData = { 
      status,
      isRead: true // Mark as read when admin updates
    };
    
    if (response && response.trim()) {
      updateData.response = response.trim();
      updateData.respondedAt = new Date();
      updateData.respondedBy = req.user.id;
    }

    const ticket = await Support.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email companyName').populate('respondedBy', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    // Create notification for user if responded or status changed
    if ((response && response.trim()) || status === 'resolved' || status === 'closed') {
      try {
        let notificationTitle = 'Support Ticket Updated';
        let notificationMessage = `Your support ticket "${ticket.subject}" has been updated by admin.`;
        
        if (response && response.trim()) {
          notificationTitle = 'Admin Response to Your Support Ticket';
          notificationMessage = `Subject: ${ticket.subject}\n\nStatus: ${status.toUpperCase()}\n\nAdmin Response:\n${response.trim()}`;
        } else if (status === 'resolved') {
          notificationTitle = 'Support Ticket Resolved';
          notificationMessage = `Subject: ${ticket.subject}\n\nYour support ticket has been resolved by admin.\n\nStatus: RESOLVED`;
        } else if (status === 'closed') {
          notificationTitle = 'Support Ticket Closed';
          notificationMessage = `Subject: ${ticket.subject}\n\nYour support ticket has been closed by admin.\n\nStatus: CLOSED`;
        }
        
        // Find user by email if userId not available
        let targetUserId = ticket.userId;
        if (!targetUserId && ticket.email) {
          const Employer = require('../models/Employer');
          const Candidate = require('../models/Candidate');
          
          if (ticket.userType === 'employer') {
            const employer = await Employer.findByEmail(ticket.email);
            targetUserId = employer?._id;
          } else if (ticket.userType === 'candidate') {
            const candidate = await Candidate.findByEmail(ticket.email);
            targetUserId = candidate?._id;
          }
        }
        
        if (targetUserId) {
          const notificationData = {
            title: notificationTitle,
            message: notificationMessage,
            type: 'support_response',
            role: ticket.userType === 'guest' ? 'candidate' : ticket.userType,
            createdBy: req.user.id
          };
          
          // Use candidateId for candidate notifications, relatedId for others
          if (ticket.userType === 'candidate' || ticket.userType === 'guest') {
            notificationData.candidateId = targetUserId;
          } else {
            notificationData.relatedId = targetUserId;
          }
          
          console.log('Creating support notification with full response:', {
            title: notificationTitle,
            messageLength: notificationMessage.length,
            hasResponse: !!(response && response.trim()),
            status: status,
            isCandidateNotif: ticket.userType === 'candidate' || ticket.userType === 'guest'
          });
          
          await createNotification(notificationData);
        }
      } catch (notifError) {
        console.error('Error creating support response notification:', notifError);
        // Don't fail the request if notification fails
      }
    } else {
      console.log('No notification created - no response or status change:', {
        hasResponse: !!(response && response.trim()),
        status: status,
        isResolved: status === 'resolved',
        isClosed: status === 'closed'
      });
    }

    res.json({ 
      success: true, 
      ticket,
      message: `Support ticket ${status === 'closed' ? 'closed' : 'updated'} successfully`
    });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSupportTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    // Validate ticket ID
    if (!ticketId || !mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket ID provided' });
    }
    
    const ticket = await Support.findByIdAndDelete(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    res.json({ success: true, message: 'Support ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadSupportAttachment = async (req, res) => {
  try {
    const { ticketId, attachmentIndex } = req.params;
    
    const ticket = await Support.findById(ticketId).lean();
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    const attachment = ticket.attachments[parseInt(attachmentIndex)];
    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    const { buffer, mimeType } = base64ToBuffer(attachment.data);
    
    if (req.query.download === '1') {
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
    }
    res.setHeader('Content-Type', mimeType);
    res.send(buffer);
  } catch (error) {
    console.error('Error in downloadSupportAttachment:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to download attachment' });
  }
};


// Get placement candidate statistics
exports.getPlacementCandidateStats = async (req, res) => {
  try {
    const totalCandidates = await PlacementCandidate.countDocuments();
    const approvedCandidates = await PlacementCandidate.countDocuments({ status: 'approved' });
    const pendingCandidates = await PlacementCandidate.countDocuments({ status: 'pending' });
    const rejectedCandidates = await PlacementCandidate.countDocuments({ status: 'rejected' });
    
    const emailsSent = await PlacementCandidate.countDocuments({ welcomeEmailSent: true });
    const emailsPending = await PlacementCandidate.countDocuments({ 
      status: 'approved',
      welcomeEmailSent: { $ne: true }
    });
    
    // Get placement officers with candidate counts
    const placementOfficerStats = await PlacementCandidate.aggregate([
      {
        $group: {
          _id: '$placementId',
          placementOfficerName: { $first: '$placementOfficerName' },
          collegeName: { $first: '$collegeName' },
          totalCandidates: { $sum: 1 },
          approvedCandidates: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          emailsSent: {
            $sum: { $cond: ['$welcomeEmailSent', 1, 0] }
          }
        }
      },
      { $sort: { totalCandidates: -1 } },
      { $limit: 10 }
    ]);
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivity = await PlacementCandidate.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    res.json({
      success: true,
      stats: {
        totalCandidates,
        approvedCandidates,
        pendingCandidates,
        rejectedCandidates,
        emailsSent,
        emailsPending,
        recentActivity
      },
      placementOfficerStats
    });
  } catch (error) {
    console.error('Error getting placement candidate stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk approve all students in a placement
exports.approveAllStudentsInPlacement = async (req, res) => {
  try {
    const { id: placementId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    let totalProcessed = 0;
    let totalEmailsSent = 0;
    let totalEmailsFailed = 0;
    let totalErrors = 0;
    const processedFiles = [];
    
    // Process all pending files in fileHistory
    if (placement.fileHistory && placement.fileHistory.length > 0) {
      for (let file of placement.fileHistory) {
        if (file.status === 'pending' && file.fileData) {
          try {
            const { base64ToBuffer } = require('../utils/base64Helper');
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
            
            let fileProcessed = 0;
            let fileEmailsSent = 0;
            let fileEmailsFailed = 0;
            
            // Process each row from Excel
            for (let index = 0; index < jsonData.length; index++) {
              try {
                const row = jsonData[index];
                let email = row.Email || row.email || row.EMAIL;
                let password = row.Password || row.password || row.PASSWORD;
                let name = row.Name || row.name || row.NAME || row['Full Name'] || row['Student Name'] || row['Candidate Name'];
                const phone = row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile;
                const course = row.Course || row.course || row.Branch || row.branch;
                const collegeName = row['College Name'] || row.College || placement.collegeName;
                
                // Auto-generate missing fields
                if (!email || email.trim() === '') {
                  email = `student${index + 1}@${placement.collegeName.toLowerCase().replace(/\s+/g, '')}.edu`;
                }
                if (!password || password.trim() === '') {
                  password = `pwd${Math.random().toString(36).substr(2, 8)}`;
                }
                if (!name || name.trim() === '') {
                  name = `Student ${index + 1}`;
                }
                
                // Check if candidate already exists
                const existingCandidate = await Candidate.findByEmail(email.trim());
                if (existingCandidate) {
                  continue;
                }
                
                const rowCredits = parseInt(row['Credits Assigned'] || row.Credits || file.credits || placement.credits || 0);
                
                // Create candidate
                const candidate = await Candidate.create({
                  name: name.trim(),
                  email: email.trim().toLowerCase(),
                  password: password.trim(),
                  phone: phone ? phone.toString().trim() : '',
                  course: course ? course.trim() : '',
                  credits: rowCredits,
                  registrationMethod: 'placement',
                  placementId: placement._id,
                  fileId: file._id,
                  isVerified: true,
                  status: 'active'
                });
                
                // Create candidate profile
                await CandidateProfile.create({ 
                  candidateId: candidate._id,
                  collegeName: collegeName || placement.collegeName,
                  education: [{
                    degreeName: course ? course.trim() : '',
                    collegeName: collegeName || placement.collegeName,
                    scoreType: 'percentage',
                    scoreValue: '0'
                  }]
                });
                
                // Create placement candidate record
                const placementCandidate = await PlacementCandidate.create({
                  candidateId: candidate._id,
                  studentName: name.trim(),
                  studentEmail: email.trim().toLowerCase(),
                  studentPhone: phone ? phone.toString().trim() : '',
                  course: course ? course.trim() : '',
                  collegeName: collegeName || placement.collegeName,
                  placementId: placement._id,
                  placementOfficerName: placement.name,
                  placementOfficerEmail: placement.email,
                  placementOfficerPhone: placement.phone,
                  fileId: file._id,
                  fileName: file.customName || file.fileName,
                  status: 'approved',
                  approvedAt: new Date(),
                  approvedBy: req.user.id,
                  creditsAssigned: rowCredits,
                  originalRowData: row
                });
                
                // Send welcome email
                try {
                  const { sendCandidateDetailsUpdatedEmail } = require('../utils/emailService');
                  await sendCandidateDetailsUpdatedEmail(
                    email.trim().toLowerCase(),
                    name.trim(),
                    rowCredits
                  );
                  
                  await PlacementCandidate.findByIdAndUpdate(
                    placementCandidate._id,
                    { 
                      welcomeEmailSent: true,
                      welcomeEmailSentAt: new Date()
                    }
                  );
                  
                  fileEmailsSent++;
                } catch (emailError) {
                  console.error(`Failed to send welcome email to ${email}:`, emailError);
                  fileEmailsFailed++;
                }
                
                fileProcessed++;
              } catch (rowError) {
                console.error('Row processing error:', rowError);
                totalErrors++;
              }
            }
            
            // Update file status
            await Placement.findOneAndUpdate(
              { _id: placementId, 'fileHistory._id': file._id },
              { 
                $set: { 
                  'fileHistory.$.status': 'processed',
                  'fileHistory.$.processedAt': new Date(),
                  'fileHistory.$.candidatesCreated': fileProcessed
                }
              }
            );
            
            processedFiles.push({
              fileName: file.customName || file.fileName,
              studentsProcessed: fileProcessed,
              emailsSent: fileEmailsSent,
              emailsFailed: fileEmailsFailed
            });
            
            totalProcessed += fileProcessed;
            totalEmailsSent += fileEmailsSent;
            totalEmailsFailed += fileEmailsFailed;
            
          } catch (fileError) {
            console.error(`Error processing file ${file.fileName}:`, fileError);
            totalErrors++;
          }
        }
      }
    }
    
    // Create comprehensive notification
    try {
      await createNotification({
        title: 'Bulk Student Approval Completed',
        message: `All pending students in ${placement.collegeName} have been processed. ${totalProcessed} students approved, ${totalEmailsSent} welcome emails sent successfully.`,
        type: 'bulk_approval_completed',
        role: 'admin',
        relatedId: placementId,
        createdBy: req.user.id
      });
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
    }
    
    res.json({
      success: true,
      message: `Bulk approval completed! ${totalProcessed} students approved and ${totalEmailsSent} welcome emails sent.`,
      stats: {
        totalStudentsProcessed: totalProcessed,
        totalEmailsSent: totalEmailsSent,
        totalEmailsFailed: totalEmailsFailed,
        totalErrors: totalErrors,
        filesProcessed: processedFiles.length
      },
      processedFiles: processedFiles,
      loginInstructions: {
        url: 'http://localhost:3000/',
        message: 'All approved students have received welcome emails with login credentials'
      }
    });
    
  } catch (error) {
    console.error('Error in bulk approval:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Sub Admin Profile
exports.getSubAdminProfile = async (req, res) => {
  try {
    const subAdmin = await SubAdmin.findById(req.user.id)
      .select('-password -resetPasswordOTP -resetPasswordOTPExpires')
      .populate('createdBy', 'name email')
      .lean();
    
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: 'Sub Admin not found' });
    }

    // Set cache headers to prevent stale data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({ success: true, subAdmin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Admin Profile
exports.getAdminProfile = async (req, res) => {
  try {
    let admin;
    if (req.user.role === 'admin' || req.user.role === 'super-admin') {
      admin = await Admin.findById(req.user.id).select('-password');
    } else {
      admin = await SubAdmin.findById(req.user.id).select('-password');
    }
    
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    res.json({ success: true, profile: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// OTP-based Password Reset for Admin/SubAdmin
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await Admin.findByEmail(email.trim());
    let userType = 'Admin';
    
    if (!user) {
      user = await SubAdmin.findByEmail(email.trim());
      userType = 'SubAdmin';
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const { sendOTPEmail } = require('../utils/emailService');
    await sendOTPEmail(email, otp, user.name);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    let user = await Admin.findByEmail(email.trim());
    
    if (!user || user.resetPasswordOTP !== otp || (user.resetPasswordOTPExpires && user.resetPasswordOTPExpires < Date.now())) {
      user = await SubAdmin.findByEmail(email.trim());
    }

    if (!user || user.resetPasswordOTP !== otp || (user.resetPasswordOTPExpires && user.resetPasswordOTPExpires < Date.now())) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};