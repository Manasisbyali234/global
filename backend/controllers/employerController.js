const jwt = require('jsonwebtoken');
const Employer = require('../models/Employer');
const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Message = require('../models/Message');
const Subscription = require('../models/Subscription');
const Support = require('../models/Support');
const mongoose = require('mongoose');
const { createNotification } = require('./notificationController');
const { sendWelcomeEmail } = require('../utils/emailService');
const { checkEmailExists } = require('../utils/authUtils');
const { cacheInvalidation } = require('../utils/cacheInvalidation');
const { sendSMS } = require('../utils/smsProvider');
const { validateGSTFormat, fetchGSTInfo, mapGSTToProfile } = require('../utils/gstService');
const { normalizeTimeFormat, formatTimeToAMPM } = require('../utils/timeUtils');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Authentication Controllers
exports.registerEmployer = async (req, res) => {
  try {
    console.log('=== EMPLOYER REGISTRATION ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const { name, email, password, phone, companyName, employerCategory, employerType, sendWelcomeEmail: shouldSendEmail, skipOtpVerification } = req.body;

    const existingUser = await checkEmailExists(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const finalEmployerType = employerType || (employerCategory === 'consultancy' ? 'consultant' : 'company');

    // Create employer without password - they will create it via email link
    const employerData = { 
      name, 
      email: email.trim(), // Preserve original email format, just trim whitespace
      phone, 
      companyName,
      employerType: finalEmployerType
    };

    // If OTP verification is skipped, mark phone as verified
    if (skipOtpVerification) {
      employerData.isPhoneVerified = true;
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      employerData.phoneOTP = otp;
      employerData.phoneOTPExpires = Date.now() + 10 * 60 * 1000;
      // Send SMS OTP
      await sendSMS(phone, otp, name);
    }

    const employer = await Employer.create(employerData);

    await EmployerProfile.create({ 
      employerId: employer._id,
      employerCategory: employerCategory || finalEmployerType,
      companyName: companyName,
      email: email,
      phone: phone,
      description: 'We are a dynamic company focused on delivering excellent services and creating opportunities for talented professionals.',
      location: 'Bangalore, India'
    });
    
    await Subscription.create({ employerId: employer._id });

    // If OTP verification is skipped, send welcome email immediately
    if (skipOtpVerification) {
      try {
        await sendWelcomeEmail(employer.email, employer.companyName || employer.name, employer.employerType);
        console.log('Welcome email sent successfully to:', employer.email);
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
      }
    }

    const message = skipOtpVerification 
      ? 'Registration successful! Please check your registered email inbox to create your password.'
      : 'Registration successful! Please verify your mobile number via OTP sent to your phone.';

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginEmployer = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    // Removed console debug line for security

    const employer = await Employer.findByEmail(email.trim());
    if (!employer) {
      return res.status(401).json({ success: false, message: 'no account found with this email address' });
    }

    const isPasswordValid = await employer.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    if (employer.status !== 'active') {
      // Removed console debug line for security;
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    const token = generateToken(employer._id, 'employer');
    // Removed console debug line for security;

    res.json({
      success: true,
      token,
      employer: {
        id: employer._id,
        name: employer.name,
        email: employer.email,
        companyName: employer.companyName,
        employerType: employer.employerType
      }
    });
  } catch (error) {
    console.error('Employer login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Profile Controllers
exports.getProfile = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ employerId: req.user._id })
      .populate('employerId', 'name email phone companyName isApproved');
    
    if (!profile) {
      return res.json({ success: true, profile: null });
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Log request size for debugging
    const requestSize = JSON.stringify(req.body).length;
    // Removed console debug line for security;
    
    // Remove employerCategory from update data to prevent modification
    const updateData = { ...req.body };
    delete updateData.employerCategory;
    
    // Explicitly preserve text fields that should be saved
    // Use $set operator to ensure fields are actually updated
    const textFieldsToPreserve = ['whyJoinUs', 'googleMapsEmbed', 'description', 'location'];
    const setOperations = {};
    
    textFieldsToPreserve.forEach(field => {
      if (req.body[field] !== undefined) {
        setOperations[field] = req.body[field];
      }
    });
    
    // Remove any Base64 data that should not be in profile updates
    // (these should be uploaded via separate endpoints)
    const fieldsToExclude = ['logo', 'coverImage', 'panCardImage', 'cinImage', 'gstImage', 'certificateOfIncorporation', 'companyIdCardPicture', 'authorizationLetters', 'gallery'];
    fieldsToExclude.forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string' && updateData[field].startsWith('data:')) {
        console.log(`Excluding Base64 field: ${field}`);
        delete updateData[field];
      }
    });
    
    // Merge the text field set operations into updateData to ensure they're saved
    Object.assign(updateData, setOperations);
    
    // Force include whyJoinUs and googleMapsEmbed even if empty strings
    if (req.body.hasOwnProperty('whyJoinUs')) {
      updateData.whyJoinUs = req.body.whyJoinUs || '';
    }
    if (req.body.hasOwnProperty('googleMapsEmbed')) {
      updateData.googleMapsEmbed = req.body.googleMapsEmbed || '';
    }
    
    // Ensure description and location always have default values ONLY if they are undefined or null
    if (req.body.hasOwnProperty('description')) {
      updateData.description = req.body.description !== undefined ? req.body.description : 'We are a dynamic company focused on delivering excellent services and creating opportunities for talented professionals.';
    }
    if (req.body.hasOwnProperty('location')) {
      updateData.location = req.body.location !== undefined ? req.body.location : 'Bangalore, India';
    }

    // Verify that text fields are included in updateData
    console.log('=== PROFILE UPDATE DEBUG ===');
    console.log('Profile update - companyName:', updateData.companyName);
    console.log('Profile update - description:', updateData.description?.substring(0, 50));
    console.log('Profile update - location:', updateData.location?.substring(0, 50));
    console.log('Profile update - whyJoinUs:', updateData.whyJoinUs?.substring(0, 50));
    console.log('Profile update - googleMapsEmbed:', updateData.googleMapsEmbed?.substring(0, 50));
    console.log('Profile update - teamSize:', updateData.teamSize);
    console.log('Profile update - establishedSince:', updateData.establishedSince);
    console.log('Profile update - industrySector:', updateData.industrySector);
    console.log('Profile update - companyType:', updateData.companyType);
    console.log('Profile update - website:', updateData.website);
    console.log('Profile update - corporateAddress:', updateData.corporateAddress);
    console.log('Profile update - all updateData keys:', Object.keys(updateData));
    console.log('=== END DEBUG ===');

    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      updateData,
      { new: true, upsert: true, runValidators: false }
    ).populate('employerId', 'name email phone companyName');

    // Verify fields were saved to database
    console.log('=== SAVED PROFILE DEBUG ===');
    console.log('Saved profile - companyName:', profile.companyName);
    console.log('Saved profile - description:', profile.description?.substring(0, 50));
    console.log('Saved profile - location:', profile.location?.substring(0, 50));
    console.log('Saved profile - whyJoinUs:', profile.whyJoinUs?.substring(0, 50));
    console.log('Saved profile - googleMapsEmbed:', profile.googleMapsEmbed?.substring(0, 50));
    console.log('Saved profile - teamSize:', profile.teamSize);
    console.log('Saved profile - establishedSince:', profile.establishedSince);
    console.log('Saved profile - industrySector:', profile.industrySector);
    console.log('Saved profile - companyType:', profile.companyType);
    console.log('Saved profile - website:', profile.website);
    console.log('Saved profile - corporateAddress:', profile.corporateAddress);
    console.log('=== END SAVED DEBUG ===');

    // Check if profile is now complete and notify admin for approval
    try {
      const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
      const requiredDocuments = ['panCardImage', 'gstImage', 'certificateOfIncorporation'];
      const allRequiredItems = [...requiredFields, ...requiredDocuments];
      
      const isProfileComplete = allRequiredItems.every(field => {
        const value = profile[field];
        return value && (typeof value !== 'string' || value.trim() !== '');
      });
      
      if (isProfileComplete && !req.user.isApproved) {
        // Profile is complete but not yet approved - notify admin
        await createNotification({
          title: 'Company Profile Ready for Review',
          message: `${profile.companyName || 'A company'} has completed their profile with all required documents and is ready for admin approval to post jobs.`,
          type: 'profile_submitted',
          role: 'admin',
          relatedId: profile._id,
          createdBy: req.user._id
        });
        
        // Update employer status to indicate profile is submitted for review
        await Employer.findByIdAndUpdate(req.user._id, { 
          profileSubmittedForReview: true,
          profileSubmittedAt: new Date()
        });
        
        // Send profile submission email to employer
        try {
          const { sendEmployerProfileSubmissionEmail } = require('../utils/emailService');
          const employer = await Employer.findById(req.user._id);
          await sendEmployerProfileSubmissionEmail(employer.email, employer.name || employer.companyName);
        } catch (emailError) {
          console.error('Failed to send profile submission email:', emailError);
        }
      } else {
        // Regular profile update notification
        await createNotification({
          title: 'Company Profile Updated',
          message: `${profile.companyName || 'A company'} has updated their profile`,
          type: 'profile_updated',
          role: 'admin',
          relatedId: profile._id,
          createdBy: req.user._id
        });
      }
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
    }

    // Clear employer-related caches when profile is updated
    cacheInvalidation.clearEmployerGridCaches();

    // Check if this is the first time profile is being completed
    const employer = await Employer.findById(req.user._id);
    const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
    const requiredDocuments = ['panCardImage', 'gstImage', 'certificateOfIncorporation'];
    const allRequiredItems = [...requiredFields, ...requiredDocuments];
    
    const isProfileComplete = allRequiredItems.every(field => {
      const value = profile[field];
      return value && (typeof value !== 'string' || value.trim() !== '');
    });
    
    let message = 'Profile updated successfully!';
    if (isProfileComplete && !employer.isApproved && !employer.profileSubmittedForReview) {
      message = 'Profile completed successfully! Your profile has been submitted for admin review. You will be able to post jobs once approved.';
    } else if (isProfileComplete && employer.profileSubmittedForReview && !employer.isApproved) {
      message = 'Profile updated successfully! Your profile is currently under admin review.';
    } else if (isProfileComplete && employer.isApproved) {
      message = 'Profile updated successfully! You can now post jobs.';
    }
    
    res.json({ 
      success: true, 
      profile,
      message,
      isProfileComplete,
      isApproved: employer.isApproved,
      profileSubmittedForReview: employer.profileSubmittedForReview
    });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.type === 'entity.too.large') {
      res.status(413).json({ success: false, message: 'Request too large. Please upload files individually and try again.' });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const logoBase64 = fileToBase64(req.file);

    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      { logo: logoBase64 },
      { new: true, upsert: true }
    );

    // Clear employer grid caches when logo is updated
    cacheInvalidation.clearEmployerGridCaches();

    res.json({ success: true, logo: logoBase64, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const coverBase64 = fileToBase64(req.file);

    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      { coverImage: coverBase64 },
      { new: true, upsert: true }
    );

    // Clear employer grid caches when cover image is updated
    cacheInvalidation.clearEmployerGridCaches();

    res.json({ success: true, coverImage: coverBase64, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const { fieldName } = req.body;
    
    // Mapping for document verification fields and reupload timestamps
    const documentStatusMap = {
      'panCardImage': { status: 'panCardVerified', reuploadedAt: 'panCardReuploadedAt' },
      'cinImage': { status: 'cinVerified', reuploadedAt: 'cinReuploadedAt' },
      'gstImage': { status: 'gstVerified', reuploadedAt: 'gstReuploadedAt' },
      'certificateOfIncorporation': { status: 'incorporationVerified', reuploadedAt: 'incorporationReuploadedAt' },
      'authorizationLetter': { status: 'authorizationVerified', reuploadedAt: 'authorizationReuploadedAt' },
      'companyIdCardPicture': { status: 'companyIdCardVerified', reuploadedAt: 'companyIdCardReuploadedAt' }
    };

    // Check if current document is already approved
    const existingProfile = await EmployerProfile.findOne({ employerId: req.user._id });
    if (existingProfile && documentStatusMap[fieldName]) {
      const { status } = documentStatusMap[fieldName];
      if (existingProfile[status] === 'approved') {
        return res.status(400).json({ 
          success: false, 
          message: 'This document has already been approved and cannot be updated. Please contact support if you need to change it.' 
        });
      }
    }

    const documentBase64 = fileToBase64(req.file);
    const updateData = { [fieldName]: documentBase64 };

    // If it's a verifiable document, reset status to pending and set reuploadedAt timestamp
    if (documentStatusMap[fieldName]) {
      const { status, reuploadedAt } = documentStatusMap[fieldName];
      updateData[status] = 'pending';
      // Only set reuploadedAt if the document was previously rejected
      if (existingProfile && existingProfile[fieldName] && existingProfile[status] === 'rejected') {
        updateData[reuploadedAt] = new Date();
      }
    }

    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      updateData,
      { new: true, upsert: true }
    );

    // Clear employer grid caches when document is updated
    cacheInvalidation.clearEmployerGridCaches();

    res.json({ success: true, filePath: documentBase64, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadAuthorizationLetter = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const documentBase64 = fileToBase64(req.file);
    const companyName = req.body.companyName || '';
    
    const profile = await EmployerProfile.findOne({ employerId: req.user._id });
    
    // Check if there's an existing rejected document for the same company
    let existingDocIndex = -1;
    if (profile && profile.authorizationLetters) {
      existingDocIndex = profile.authorizationLetters.findIndex(
        letter => letter.companyName === companyName && letter.status === 'rejected'
      );
    }
    
    if (existingDocIndex !== -1) {
      // Replace the existing rejected document
      const updatedDocument = {
        fileName: req.file.originalname,
        fileData: documentBase64,
        uploadedAt: new Date(),
        companyName: companyName,
        status: 'pending',
        isResubmitted: true
      };
      
      const updatedProfile = await EmployerProfile.findOneAndUpdate(
        { employerId: req.user._id },
        { $set: { [`authorizationLetters.${existingDocIndex}`]: updatedDocument } },
        { new: true, upsert: true }
      );
      
      res.json({ success: true, document: updatedDocument, profile: updatedProfile });
    } else {
      // Create new document
      const newDocument = {
        fileName: req.file.originalname,
        fileData: documentBase64,
        uploadedAt: new Date(),
        companyName: companyName,
        status: 'pending',
        isResubmitted: false
      };

      const updatedProfile = await EmployerProfile.findOneAndUpdate(
        { employerId: req.user._id },
        { $push: { authorizationLetters: newDocument } },
        { new: true, upsert: true }
      );

      res.json({ success: true, document: newDocument, profile: updatedProfile });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAuthorizationLetter = async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // First find the profile to check if the document is approved
    const profile = await EmployerProfile.findOne({ employerId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const letter = profile.authorizationLetters.id(documentId);
    if (letter && letter.status === 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'This authorization letter has already been approved and cannot be deleted. Please contact support if you need to change it.' 
      });
    }
    
    // If not approved or doesn't exist, proceed with deletion
    const updatedProfile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      { $pull: { authorizationLetters: { _id: documentId } } },
      { new: true }
    );

    res.json({ success: true, message: 'Authorization letter deleted successfully', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAuthorizationCompanies = async (req, res) => {
  try {
    const { authorizationLetters } = req.body;
    
    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      { authorizationLetters },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, message: 'Authorization company names updated successfully', profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadGallery = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // Check file sizes before processing
    const oversizedFiles = req.files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      return res.status(413).json({ 
        success: false, 
        message: `Files too large: ${oversizedFiles.map(f => f.originalname).join(', ')}. Maximum size is 10MB per file.` 
      });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const profile = await EmployerProfile.findOne({ employerId: req.user._id });
    const currentGallery = profile?.gallery || [];

    if (currentGallery.length + req.files.length > 10) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot upload ${req.files.length} images. Maximum 10 images allowed. Current: ${currentGallery.length}` 
      });
    }

    // Process files one by one to manage memory better
    const newImages = [];
    for (const file of req.files) {
      try {
        const base64Data = fileToBase64(file);
        newImages.push({
          url: base64Data,
          fileName: file.originalname,
          uploadedAt: new Date(),
          fileSize: file.size
        });
      } catch (conversionError) {
        console.error(`Error converting file ${file.originalname}:`, conversionError);
        return res.status(500).json({ 
          success: false, 
          message: `Failed to process file: ${file.originalname}. Please try with a smaller file.` 
        });
      }
    }

    const updatedProfile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      { $push: { gallery: { $each: newImages } } },
      { new: true, upsert: true }
    );

    res.json({ 
      success: true, 
      gallery: updatedProfile.gallery,
      message: `Successfully uploaded ${newImages.length} image(s)` 
    });
  } catch (error) {
    console.error('Gallery upload error:', error);
    if (error.message && error.message.includes('too large')) {
      res.status(413).json({ success: false, message: 'Files too large. Please compress your images and try again.' });
    } else {
      res.status(500).json({ success: false, message: 'Upload failed. Please try again with smaller files.' });
    }
  }
};

exports.deleteGalleryImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      { $pull: { gallery: { _id: imageId } } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, message: 'Gallery image deleted successfully', gallery: profile.gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Job Management Controllers
exports.createJob = async (req, res) => {
  try {
    // Check if company profile is complete
    const profile = await EmployerProfile.findOne({ employerId: req.user._id });
    
    if (!profile) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please complete your company profile before posting jobs.',
        requiresProfile: true
      });
    }

    // Check required profile fields and documents
    const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
    const requiredDocuments = ['panCardImage', 'gstImage', 'certificateOfIncorporation'];
    
    const missingFields = requiredFields.filter(field => {
      const value = profile[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    const missingDocuments = requiredDocuments.filter(field => {
      const value = profile[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    const allMissingItems = [...missingFields, ...missingDocuments];
    
    // Log for debugging
    console.log('Profile validation check:', {
      companyName: profile.companyName,
      description: profile.description,
      location: profile.location,
      phone: profile.phone,
      email: profile.email,
      panCardImage: profile.panCardImage ? 'Present' : 'Missing',
      gstImage: profile.gstImage ? 'Present' : 'Missing',
      certificateOfIncorporation: profile.certificateOfIncorporation ? 'Present' : 'Missing',
      missingFields,
      missingDocuments,
      allMissingItems
    });
    
    if (allMissingItems.length > 0) {
      const documentLabels = {
        panCardImage: 'PAN Card Image',
        gstImage: 'GST Certificate',
        certificateOfIncorporation: 'Certificate of Incorporation'
      };
      
      const missingLabels = allMissingItems.map(item => 
        documentLabels[item] || item
      );
      
      return res.status(403).json({ 
        success: false, 
        message: `Please complete your company profile. Missing: ${missingLabels.join(', ')}`,
        requiresProfile: true,
        missingFields: allMissingItems
      });
    }

    // Check if employer is approved by admin
    if (!req.user.isApproved) {
      const employer = await Employer.findById(req.user._id);
      if (!employer.profileSubmittedForReview) {
        return res.status(403).json({ 
          success: false, 
          message: 'Please complete and save your company profile first to submit it for admin review.',
          requiresProfile: true
        });
      }
      return res.status(403).json({ 
        success: false, 
        message: 'Your company profile is under admin review. You can post jobs once approved by admin.',
        requiresApproval: true
      });
    }

    const jobData = { ...req.body, employerId: req.user._id, status: 'active' };
    
    console.log('=== FULL REQUEST BODY DEBUG ===');
    console.log('Full req.body:', JSON.stringify(req.body, null, 2));
    console.log('Job title received:', req.body.title);
    console.log('jobData keys:', Object.keys(jobData));
    console.log('=== END FULL DEBUG ===');
    
    // Handle rolesAndResponsibilities field conversion
    console.log('=== DEBUG ROLES & RESPONSIBILITIES ===');
    console.log('rolesAndResponsibilities field:', jobData.rolesAndResponsibilities);
    console.log('rolesAndResponsibilities type:', typeof jobData.rolesAndResponsibilities);
    console.log('rolesAndResponsibilities length:', jobData.rolesAndResponsibilities ? jobData.rolesAndResponsibilities.length : 0);
    
    if (jobData.rolesAndResponsibilities && typeof jobData.rolesAndResponsibilities === 'string') {
      // Convert rich text to array of responsibilities
      // Remove HTML tags and split by line breaks or bullet points
      let cleanText = jobData.rolesAndResponsibilities
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
        .replace(/&amp;/g, '&') // Replace HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      
      console.log('Clean text after processing:', cleanText);
      console.log('Clean text length:', cleanText.length);
      
      if (cleanText && cleanText.length > 0) {
        // Try multiple splitting strategies
        let responsibilities = [];
        
        // First try splitting by common patterns
        if (cleanText.includes('\n')) {
          // Split by line breaks
          responsibilities = cleanText
            .split(/\n|\r\n|\r/)
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[\u2022\-\*•]\s*/, '')); // Remove bullet points
        } else if (cleanText.includes('.') && cleanText.split('.').length > 2) {
          // Split by periods if multiple sentences
          responsibilities = cleanText
            .split('.')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[\u2022\-\*•]\s*/, ''));
        } else {
          // Use the entire text as a single responsibility
          responsibilities = [cleanText];
        }
        
        console.log('Final responsibilities array:', responsibilities);
        jobData.responsibilities = responsibilities;
      } else {
        console.log('Clean text is empty, setting empty responsibilities array');
        jobData.responsibilities = [];
      }
      
      // Remove the original field to avoid confusion
      delete jobData.rolesAndResponsibilities;
    } else {
      console.log('No valid rolesAndResponsibilities field found in jobData');
      jobData.responsibilities = [];
    }
    console.log('Final jobData.responsibilities:', jobData.responsibilities);
    console.log('=== END DEBUG ===');
    
    // Map assignedAssessment to assessmentId
    if (jobData.assignedAssessment) {
      jobData.assessmentId = jobData.assignedAssessment;
      delete jobData.assignedAssessment;
    }
    
    // Handle nested assessment object from frontend
    if (jobData.assessment && jobData.assessment.assessmentId) {
      jobData.assessmentId = jobData.assessment.assessmentId;
      if (jobData.assessment.fromDate) {
        jobData.assessmentStartDate = new Date(jobData.assessment.fromDate);
      }
      if (jobData.assessment.toDate) {
        jobData.assessmentEndDate = new Date(jobData.assessment.toDate);
      }
      delete jobData.assessment;
    }
    
    // Also handle direct assessment date fields
    if (jobData.assessmentStartDate && typeof jobData.assessmentStartDate === 'string') {
      jobData.assessmentStartDate = new Date(jobData.assessmentStartDate);
    }
    if (jobData.assessmentEndDate && typeof jobData.assessmentEndDate === 'string') {
      jobData.assessmentEndDate = new Date(jobData.assessmentEndDate);
    }

    // Handle assessment time fields (startTime and endTime)
    // These remain as strings in HH:MM format and are applied to all days
    if (jobData.assessmentStartTime) {
      jobData.assessmentStartTime = normalizeTimeFormat(String(jobData.assessmentStartTime));
    }
    if (jobData.assessmentEndTime) {
      jobData.assessmentEndTime = normalizeTimeFormat(String(jobData.assessmentEndTime));
    }

    // If assessment is selected, automatically enable technical interview round
    if (jobData.assessmentId) {
      if (!jobData.interviewRoundTypes) {
        jobData.interviewRoundTypes = {
          technical: false,
          oneOnOne: false,
          panel: false,
          group: false,
          situational: false,
          others: false
        };
      }
      jobData.interviewRoundTypes.technical = true;
      // Set interview rounds count if not set
      if (!jobData.interviewRoundsCount || jobData.interviewRoundsCount < 1) {
        jobData.interviewRoundsCount = 1;
      }
    }

    // Remove assessment from interviewRoundTypes (it's stored separately in assessmentId)
    if (jobData.interviewRoundTypes && jobData.interviewRoundTypes.assessment) {
      delete jobData.interviewRoundTypes.assessment;
    }
    
    // Ensure interviewRoundOrder is properly handled
    if (!jobData.interviewRoundOrder) {
      jobData.interviewRoundOrder = [];
    }
    
    // Process and validate interview round details dates
    if (jobData.interviewRoundDetails) {
      Object.keys(jobData.interviewRoundDetails).forEach(roundKey => {
        const roundDetails = jobData.interviewRoundDetails[roundKey];
        if (roundDetails) {
          // Convert date strings to Date objects for proper storage
          if (roundDetails.fromDate && typeof roundDetails.fromDate === 'string') {
            roundDetails.fromDate = new Date(roundDetails.fromDate);
          }
          
          // If toDate is missing, use fromDate
          if (!roundDetails.toDate && roundDetails.fromDate) {
            roundDetails.toDate = roundDetails.fromDate;
          } else if (roundDetails.toDate && typeof roundDetails.toDate === 'string') {
            roundDetails.toDate = new Date(roundDetails.toDate);
          }
          
          if (roundDetails.startTime) {
            roundDetails.startTime = normalizeTimeFormat(String(roundDetails.startTime));
          }
          if (roundDetails.endTime) {
            roundDetails.endTime = normalizeTimeFormat(String(roundDetails.endTime));
          }
          
          // Backward compatibility for 'time' field
          if (roundDetails.startTime && !roundDetails.time) {
            roundDetails.time = roundDetails.startTime;
          } else if (roundDetails.time) {
            roundDetails.time = normalizeTimeFormat(String(roundDetails.time));
          }
          
          // Store custom type for "Others" rounds
          if (roundDetails.customType) {
            roundDetails.customType = String(roundDetails.customType).trim();
          }
        }
      });
    }
    
    // Parse CTC from string format to proper structure
    if (jobData.ctc && typeof jobData.ctc === 'string') {
      const ctcStr = jobData.ctc.trim();
      const rangeMatch = ctcStr.match(/(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)/i);
      if (rangeMatch) {
        jobData.ctc = {
          min: parseFloat(rangeMatch[1]) * 100000,
          max: parseFloat(rangeMatch[2]) * 100000
        };
      } else {
        const singleValue = parseFloat(ctcStr.replace(/[^\d.]/g, ''));
        if (singleValue && singleValue > 0) {
          jobData.ctc = {
            min: singleValue * 100000,
            max: singleValue * 100000
          };
        }
      }
    }
    
    if (jobData.netSalary && typeof jobData.netSalary === 'string') {
      const netMatch = jobData.netSalary.match(/(\d+(?:,\d+)*)\s*(?:-|to)?\s*(\d+(?:,\d+)*)?/i);
      if (netMatch) {
        jobData.netSalary = {
          min: parseInt(netMatch[1].replace(/,/g, '')),
          max: parseInt((netMatch[2] || netMatch[1]).replace(/,/g, ''))
        };
      }
    }
    
    // Validate time format if provided
    if (jobData.lastDateOfApplicationTime) {
      jobData.lastDateOfApplicationTime = normalizeTimeFormat(String(jobData.lastDateOfApplicationTime));
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(jobData.lastDateOfApplicationTime)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid time format for Last Date of Application. Please use HH:MM format (24-hour) or HH:MM AM/PM.' 
        });
      }
    }
    
    console.log('Creating job with data:', JSON.stringify(jobData, null, 2)); // Debug log
    console.log('Company fields:', {
      companyLogo: jobData.companyLogo ? 'Present' : 'Missing',
      companyName: jobData.companyName,
      companyDescription: jobData.companyDescription ? 'Present' : 'Missing',
      category: jobData.category,
      typeOfEmployment: jobData.typeOfEmployment
    });
    console.log('Parsed CTC:', jobData.ctc);
    console.log('Parsed Net Salary:', jobData.netSalary);
    
    // Check if interview rounds are scheduled
    const hasScheduledRounds = jobData.interviewRoundDetails && 
      Object.values(jobData.interviewRoundDetails).some(round => 
        round && (round.date || round.fromDate) && round.time && round.description
      );
    
    console.log('Interview rounds scheduled check:', {
      hasScheduledRounds,
      interviewRoundDetails: jobData.interviewRoundDetails
    });
    
    if (hasScheduledRounds) {
      jobData.interviewScheduled = true;
    }
    
    const job = await Job.create(jobData);
    console.log('Job created successfully with typeOfEmployment:', job.typeOfEmployment);
    console.log('Job created:', JSON.stringify(job, null, 2));

    // If job has assessment, update existing applications to set assessmentStatus to 'available'
    if (job.assessmentId) {
      try {
        await Application.updateMany(
          { jobId: job._id },
          { assessmentStatus: 'available' }
        );
        console.log('Updated existing applications with assessment status');
      } catch (updateError) {
        console.error('Error updating existing applications:', updateError);
        // Don't fail job creation if this update fails
      }
    }

    // Clear job-related caches immediately
    cacheInvalidation.clearJobCaches();

    // Notifications are sent to candidates when they apply for jobs
    // No need to create general notifications here

    res.status(201).json({ success: true, job });
  } catch (error) {
    console.error('Job creation error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`);
      return res.status(400).json({ success: false, message: `Validation failed: ${validationErrors.join(', ')}` });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    console.log('Update job request body:', req.body);
    console.log('Job ID:', req.params.jobId);
    console.log('Job title received:', req.body.title);
    
    const oldJob = await Job.findOne({ _id: req.params.jobId, employerId: req.user._id });
    if (!oldJob) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    // Handle rolesAndResponsibilities field conversion
    console.log('=== UPDATE JOB - DEBUG ROLES & RESPONSIBILITIES ===');
    console.log('rolesAndResponsibilities field:', req.body.rolesAndResponsibilities);
    console.log('rolesAndResponsibilities type:', typeof req.body.rolesAndResponsibilities);
    console.log('rolesAndResponsibilities length:', req.body.rolesAndResponsibilities ? req.body.rolesAndResponsibilities.length : 0);
    
    if (req.body.rolesAndResponsibilities && typeof req.body.rolesAndResponsibilities === 'string') {
      // Convert rich text to array of responsibilities
      // Remove HTML tags and split by line breaks or bullet points
      let cleanText = req.body.rolesAndResponsibilities
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
        .replace(/&amp;/g, '&') // Replace HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      
      console.log('Clean text after processing:', cleanText);
      console.log('Clean text length:', cleanText.length);
      
      if (cleanText && cleanText.length > 0) {
        // Try multiple splitting strategies
        let responsibilities = [];
        
        // First try splitting by common patterns
        if (cleanText.includes('\n')) {
          // Split by line breaks
          responsibilities = cleanText
            .split(/\n|\r\n|\r/)
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[\u2022\-\*•]\s*/, '')); // Remove bullet points
        } else if (cleanText.includes('.') && cleanText.split('.').length > 2) {
          // Split by periods if multiple sentences
          responsibilities = cleanText
            .split('.')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[\u2022\-\*•]\s*/, ''));
        } else {
          // Use the entire text as a single responsibility
          responsibilities = [cleanText];
        }
        
        console.log('Final responsibilities array:', responsibilities);
        req.body.responsibilities = responsibilities;
      } else {
        console.log('Clean text is empty, setting empty responsibilities array');
        req.body.responsibilities = [];
      }
      
      // Remove the original field to avoid confusion
      delete req.body.rolesAndResponsibilities;
    } else {
      console.log('No valid rolesAndResponsibilities field found in req.body');
      req.body.responsibilities = [];
    }
    console.log('Final req.body.responsibilities:', req.body.responsibilities);
    console.log('=== END UPDATE DEBUG ===');
    
    // Validate time format if provided
    if (req.body.lastDateOfApplicationTime) {
      req.body.lastDateOfApplicationTime = normalizeTimeFormat(String(req.body.lastDateOfApplicationTime));
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(req.body.lastDateOfApplicationTime)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid time format for Last Date of Application. Please use HH:MM format (24-hour) or HH:MM AM/PM.' 
        });
      }
    }
    
    // Parse CTC from string format to proper structure
    if (req.body.ctc && typeof req.body.ctc === 'string') {
      const ctcStr = req.body.ctc.trim();
      const rangeMatch = ctcStr.match(/(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)/i);
      if (rangeMatch) {
        req.body.ctc = {
          min: parseFloat(rangeMatch[1]) * 100000,
          max: parseFloat(rangeMatch[2]) * 100000
        };
      } else {
        const singleValue = parseFloat(ctcStr.replace(/[^\d.]/g, ''));
        if (singleValue && singleValue > 0) {
          req.body.ctc = {
            min: singleValue * 100000,
            max: singleValue * 100000
          };
        }
      }
    }
    
    if (req.body.netSalary && typeof req.body.netSalary === 'string') {
      const netMatch = req.body.netSalary.match(/(\d+(?:,\d+)*)\s*(?:-|to)?\s*(\d+(?:,\d+)*)?/i);
      if (netMatch) {
        req.body.netSalary = {
          min: parseInt(netMatch[1].replace(/,/g, '')),
          max: parseInt((netMatch[2] || netMatch[1]).replace(/,/g, ''))
        };
      }
    }
    
    // Check if interview rounds are being scheduled/updated
    const hasScheduledRounds = req.body.interviewRoundDetails && 
      Object.values(req.body.interviewRoundDetails).some(round => 
        round && round.fromDate && (round.startTime || round.time) && round.description
      );
    
    console.log('Update job - Interview rounds scheduled check:', {
      hasScheduledRounds,
      interviewRoundDetails: req.body.interviewRoundDetails
    });
    
    const wasScheduled = oldJob.interviewScheduled;
    
    if (hasScheduledRounds) {
      req.body.interviewScheduled = true;
    }
    
    // Map assignedAssessment to assessmentId
    if (req.body.assignedAssessment) {
      req.body.assessmentId = req.body.assignedAssessment;
      delete req.body.assignedAssessment;
    }
    
    // Handle nested assessment object from frontend
    if (req.body.assessment && req.body.assessment.assessmentId) {
      req.body.assessmentId = req.body.assessment.assessmentId;
      if (req.body.assessment.fromDate) {
        req.body.assessmentStartDate = new Date(req.body.assessment.fromDate);
      }
      if (req.body.assessment.toDate) {
        req.body.assessmentEndDate = new Date(req.body.assessment.toDate);
      }
      delete req.body.assessment;
    }
    
    // Also handle direct assessment date fields
    if (req.body.assessmentStartDate && typeof req.body.assessmentStartDate === 'string') {
      req.body.assessmentStartDate = new Date(req.body.assessmentStartDate);
    }
    if (req.body.assessmentEndDate && typeof req.body.assessmentEndDate === 'string') {
      req.body.assessmentEndDate = new Date(req.body.assessmentEndDate);
    }

    if (req.body.assessmentStartTime) {
      req.body.assessmentStartTime = normalizeTimeFormat(String(req.body.assessmentStartTime));
    }
    if (req.body.assessmentEndTime) {
      req.body.assessmentEndTime = normalizeTimeFormat(String(req.body.assessmentEndTime));
    }
    
    // Remove assessment from interviewRoundTypes (it's stored separately in assessmentId)
    if (req.body.interviewRoundTypes && req.body.interviewRoundTypes.assessment) {
      delete req.body.interviewRoundTypes.assessment;
    }
    
    // Ensure interviewRoundOrder is included in the update
    if (req.body.interviewRoundOrder) {
      // Keep the interview round order as provided from frontend
    }
    
    // Ensure interviewRoundDetails is properly set
    if (req.body.interviewRoundDetails) {
      // Process and validate interview round details dates
      Object.keys(req.body.interviewRoundDetails).forEach(key => {
        const round = req.body.interviewRoundDetails[key];
        if (!round || (!round.description && !round.fromDate && !round.toDate && !round.startTime && !round.time)) {
          delete req.body.interviewRoundDetails[key];
        } else {
          // Convert date strings to Date objects for proper storage
          if (round.fromDate && typeof round.fromDate === 'string') {
            round.fromDate = new Date(round.fromDate);
          }
          
          // If toDate is missing, use fromDate
          if (!round.toDate && round.fromDate) {
            round.toDate = round.fromDate;
          } else if (round.toDate && typeof round.toDate === 'string') {
            round.toDate = new Date(round.toDate);
          }
          
          if (round.startTime) {
            round.startTime = normalizeTimeFormat(String(round.startTime));
          }
          if (round.endTime) {
            round.endTime = normalizeTimeFormat(String(round.endTime));
          }
          
          // Backward compatibility for 'time' field
          if (round.startTime && !round.time) {
            round.time = round.startTime;
          } else if (round.time) {
            round.time = normalizeTimeFormat(String(round.time));
          }
          
          // Store custom type for "Others" rounds
          if (round.customType) {
            round.customType = String(round.customType).trim();
          }
        }
      });
    }
    
    const job = await Job.findOneAndUpdate(
      { _id: req.params.jobId, employerId: req.user._id },
      req.body,
      { new: true, runValidators: false }
    );

    // If assessment was added to the job, update existing applications
    if (!oldJob.assessmentId && job.assessmentId) {
      try {
        await Application.updateMany(
          { jobId: job._id },
          { assessmentStatus: 'available' }
        );
        console.log('Updated existing applications with assessment status after job update');
      } catch (updateError) {
        console.error('Error updating existing applications after job update:', updateError);
      }
    }

    // Clear job-related caches immediately
    cacheInvalidation.clearJobCaches();
    // Also clear candidate application caches to ensure they see updated job data
    cacheInvalidation.clearCandidateApplicationCaches();

    // Notify only candidates who have applied for this job
    if (hasScheduledRounds) {
      try {
        const applications = await Application.find({ jobId: job._id }).select('candidateId');
        
        for (const app of applications) {
          await createNotification({
            title: wasScheduled ? 'Interview Schedule Updated' : 'Interview Rounds Scheduled',
            message: wasScheduled ? `Interview schedule has been updated for ${job.title} position at ${req.user.companyName}` : `Interview rounds have been scheduled for ${job.title} position at ${req.user.companyName}`,
            type: wasScheduled ? 'interview_updated' : 'interview_scheduled',
            role: 'candidate',
            relatedId: job._id,
            candidateId: app.candidateId,
            createdBy: req.user._id
          });
        }
      } catch (notifError) {
        console.error('Notification creation failed:', notifError);
      }
    }

    console.log('Updated job with typeOfEmployment:', job.typeOfEmployment);
    console.log('Updated job:', job);
    res.json({ success: true, job });
  } catch (error) {
    console.error('Update job error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`);
      return res.status(400).json({ success: false, message: `Validation failed: ${validationErrors.join(', ')}` });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ 
      _id: req.params.jobId, 
      employerId: req.user._id 
    });
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Clear job-related caches immediately
    cacheInvalidation.clearJobCaches();

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id })
      .populate('employerId', 'companyName')
      .sort({ createdAt: -1 });
    
    // Ensure all jobs have a companyName field for search functionality
    const jobsWithCompanyName = jobs.map(job => {
      const jobObj = job.toObject();
      // If job doesn't have companyName (for regular companies), use employer's companyName
      if (!jobObj.companyName && job.employerId?.companyName) {
        jobObj.companyName = job.employerId.companyName;
      }
      return jobObj;
    });
    
    res.json({ success: true, jobs: jobsWithCompanyName });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecentJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, employerId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Application Management Controllers
exports.reviewApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.applicationId,
      employerId: req.user._id
    })
    .populate('candidateId', 'name email phone')
    .populate('jobId', 'title interviewRoundOrder');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const application = await Application.findOneAndUpdate(
      { _id: req.params.applicationId, employerId: req.user._id },
      { 
        status,
        $push: {
          statusHistory: {
            status,
            changedBy: req.user._id,
            changedByModel: 'Employer',
            notes
          }
        }
      },
      { new: true }
    ).populate('candidateId', 'name email')
    .populate('jobId', 'title');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    try {
      const statusLabels = {
        pending: 'Pending',
        shortlisted: 'Shortlisted',
        interviewed: 'Interviewed',
        hired: 'Hired',
        rejected: 'Rejected',
        not_attended: 'Not Attended',
        offer_shared: 'Offer Shared'
      };
      const statusLabel = statusLabels[status] || status;
      const trimmedNotes = typeof notes === 'string' ? notes.trim() : '';
      const jobTitle = application.jobId?.title || 'the position';
      const candidateName = application.candidateId?.name || 'Candidate';

      if (application.candidateId?._id) {
        let candidateMessage = `Your application for ${jobTitle} is now ${statusLabel}.`;
        if (trimmedNotes) {
          candidateMessage += ` Employer note: ${trimmedNotes}`;
        }
        await createNotification({
          title: 'Application Status Updated',
          message: candidateMessage,
          type: 'application_status_updated',
          role: 'candidate',
          relatedId: application._id,
          candidateId: application.candidateId._id,
          createdBy: req.user._id
        });
        
        if (status === 'shortlisted' && application.candidateId?.email) {
          console.log('=== SENDING SHORTLIST EMAIL ===');
          console.log('Candidate email:', application.candidateId.email);
          console.log('Job title:', jobTitle);
          try {
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
              tls: { rejectUnauthorized: false }
            });
            const emailResult = await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: application.candidateId.email,
              subject: `🎉 Congratulations! You've been shortlisted for ${jobTitle}`,
              html: `
                <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa;">
                  <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="color: #28a745; text-align: center; margin-bottom: 30px;">🎉 Congratulations!</h1>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${candidateName},</p>
                    <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #28a745;">
                      <p style="color: #155724; margin: 0; font-size: 18px; line-height: 1.6; font-weight: 600;">✅ You have been shortlisted for the position of <strong>${jobTitle}</strong>!</p>
                    </div>
                    ${trimmedNotes ? `<div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0;"><p style="color: #856404; margin: 0; font-size: 14px;"><strong>Employer Note:</strong> ${trimmedNotes}</p></div>` : ''}
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">Please check your dashboard for next steps and interview details.</p>
                    <div style="text-align: center; margin: 35px 0;">
                      <a href="${process.env.FRONTEND_URL}/candidate/status" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; display: inline-block;">View Application Status</a>
                    </div>
                    <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">Best regards,<br>The TaleGlobal Team</p>
                  </div>
                </div>
              `
            });
            console.log('✓ Shortlist email sent successfully:', emailResult.messageId);
          } catch (emailError) {
            console.error('✗ Shortlist email failed:', emailError.message);
          }
        }
      }

      let employerMessage = `${candidateName}'s application for ${jobTitle} is now ${statusLabel}.`;
      if (trimmedNotes) {
        employerMessage += ` Notes: ${trimmedNotes}`;
      }
      await createNotification({
        title: 'Application Status Updated',
        message: employerMessage,
        type: 'application_status_updated',
        role: 'employer',
        relatedId: application._id,
        createdBy: req.user._id
      });
    } catch (notificationError) {
      console.error('Application status notification failed:', notificationError);
    }

    console.log('Application status updated to:', status, 'for application:', req.params.applicationId);
    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Message Controllers
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const conversationId = [req.user._id, receiverId].sort().join('-');
    
    const newMessage = await Message.create({
      senderId: req.user._id,
      senderModel: 'Employer',
      receiverId,
      receiverModel: 'Candidate',
      message,
      conversationId
    });

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name companyName')
      .populate('receiverId', 'name')
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Subscription Management Controllers
exports.createSubscription = async (req, res) => {
  try {
    const { plan, paymentData } = req.body;
    
    const subscription = await Subscription.findOneAndUpdate(
      { employerId: req.user._id },
      { 
        plan,
        $push: { paymentHistory: paymentData }
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ employerId: req.user._id });
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { employerId: req.user._id },
      req.body,
      { new: true }
    );

    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const employerId = req.user._id;
    
    const totalJobs = await Job.countDocuments({ employerId });
    const activeJobs = await Job.countDocuments({ employerId, status: 'active' });
    const totalApplications = await Application.countDocuments({ employerId });
    const shortlisted = await Application.countDocuments({ employerId, status: 'shortlisted' });
    
    res.json({
      success: true,
      stats: { totalJobs, activeJobs, totalApplications, shortlisted },
      employer: { companyName: req.user.companyName }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployerApplications = async (req, res) => {
  try {
    const CandidateProfile = require('../models/CandidateProfile');
    const { companyName } = req.query;
    
    let query = { employerId: req.user._id };
    
    if (companyName && companyName.trim() !== '') {
      const jobs = await Job.find({ 
        employerId: req.user._id, 
        companyName: new RegExp(companyName, 'i') 
      }).select('_id');
      const jobIds = jobs.map(job => job._id);
      query.jobId = { $in: jobIds };
    }
    
    const applications = await Application.find(query)
      .populate('candidateId', 'name email phone')
      .populate('jobId', 'title location companyName')
      .sort({ createdAt: -1 });

    const applicationsWithProfiles = await Promise.all(
      applications.map(async (application) => {
        // Handle guest applications that don't have candidateId
        if (!application.candidateId) {
          return {
            ...application.toObject(),
            candidateId: null
          };
        }
        
        const candidateProfile = await CandidateProfile.findOne({ candidateId: application.candidateId._id });
        return {
          ...application.toObject(),
          candidateId: {
            ...application.candidateId.toObject(),
            profilePicture: candidateProfile?.profilePicture
          }
        };
      })
    );

    res.json({ success: true, applications: applicationsWithProfiles.filter(app => app !== null) });
  } catch (error) {
    console.error('Get employer applications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const CandidateProfile = require('../models/CandidateProfile');
    const { jobId } = req.params;
    
    // Verify job belongs to employer
    const job = await Job.findOne({ _id: jobId, employerId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    const applications = await Application.find({ jobId, employerId: req.user._id })
      .populate('candidateId', 'name email phone')
      .populate('jobId', 'title location companyName')
      .sort({ createdAt: -1 });

    // Add profile pictures to applications
    const applicationsWithProfiles = await Promise.all(
      applications.map(async (application) => {
        // Handle guest applications that don't have candidateId
        if (!application.candidateId) {
          return {
            ...application.toObject(),
            candidateId: null
          };
        }
        
        const candidateProfile = await CandidateProfile.findOne({ candidateId: application.candidateId._id });
        return {
          ...application.toObject(),
          candidateId: {
            ...application.candidateId.toObject(),
            profilePicture: candidateProfile?.profilePicture
          }
        };
      })
    );

    res.json({ success: true, applications: applicationsWithProfiles, job });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const CandidateProfile = require('../models/CandidateProfile');
    const AssessmentAttempt = require('../models/AssessmentAttempt');
    const InterviewProcess = require('../models/InterviewProcess');
    
    const application = await Application.findOne({
      _id: applicationId,
      employerId: req.user._id
    })
    .populate('candidateId', 'name email phone')
    .populate('jobId', 'title location interviewRoundsCount interviewRoundTypes interviewRoundOrder interviewRoundDetails assessmentId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Handle guest applications that don't have candidateId
    if (!application.candidateId) {
      const responseApplication = {
        ...application.toObject(),
        candidateId: null,
        assessmentAttempt: null,
        interviewProcess: null
      };
      return res.json({ success: true, application: responseApplication });
    }

    // Get candidate profile data with job preferences
    const candidateProfile = await CandidateProfile.findOne({ candidateId: application.candidateId });
    
    // Get assessment attempt details if job has assessment
    let assessmentAttempt = null;
    if (application.jobId?.assessmentId) {
      assessmentAttempt = await AssessmentAttempt.findOne({
        candidateId: application.candidateId._id,
        assessmentId: application.jobId.assessmentId
      }).populate('assessmentId', 'title timer totalQuestions passingPercentage');
    }
    
    // Get interview process if exists
    const interviewProcess = await InterviewProcess.findOne({ applicationId: application._id });
    
    // Merge candidate and profile data
    const candidateProfileObj = candidateProfile ? candidateProfile.toObject() : {};
    const currentEmployment = candidateProfileObj.employment?.find(emp => emp.isCurrent || emp.current);
    const currentExp = candidateProfileObj.experience?.find(exp => exp.current || exp.isCurrent);
    
    const candidateData = {
      ...application.candidateId.toObject(),
      ...candidateProfileObj,
      currentCompany: currentEmployment?.organization || currentEmployment?.company || currentExp?.company || currentExp?.organization,
      currentCTC: currentEmployment?.presentCTC,
      expectedCTC: currentEmployment?.expectedCTC || candidateProfileObj.expectedSalary,
      noticePeriod: candidateProfileObj.jobPreferences?.noticePeriod,
      preferredLocations: candidateProfileObj.jobPreferences?.preferredLocations,
      // Ensure dateOfBirth is properly set from profile
      dateOfBirth: candidateProfileObj.dateOfBirth || null
    };

    const responseApplication = {
      ...application.toObject(),
      candidateId: candidateData,
      assessmentAttempt: assessmentAttempt,
      interviewProcess: interviewProcess,
      jobId: {
        ...application.jobId.toObject(),
        assessmentId: application.jobId.assessmentId
      }
    };

    res.json({ success: true, application: responseApplication });
  } catch (error) {
    console.error('Get application details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConsultantCompanies = async (req, res) => {
  try {
    const companies = await Job.distinct('companyName', { 
      employerId: req.user._id,
      companyName: { $exists: true, $ne: null, $ne: '' }
    });
    
    res.json({ success: true, companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApprovedAuthorizationCompanies = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ employerId: req.user._id });
    
    if (!profile || !profile.authorizationLetters) {
      return res.json({ success: true, companies: [] });
    }
    
    // Filter approved authorization letters and extract company names
    const approvedCompanies = profile.authorizationLetters
      .filter(letter => letter.status === 'approved')
      .map(letter => letter.companyName)
      .filter(name => name && name.trim() !== '');
    
    res.json({ success: true, companies: approvedCompanies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.getProfileCompletion = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ employerId: req.user._id });
    const employer = await Employer.findById(req.user._id);
    
    if (!profile) {
      return res.json({ 
        success: true, 
        completion: 0, 
        missingFields: ['All profile fields'],
        isApproved: employer?.isApproved || false,
        profileSubmittedForReview: employer?.profileSubmittedForReview || false,
        canPostJobs: false,
        message: 'Please complete your company profile to post jobs.'
      });
    }
    
    // Comprehensive list of fields for profile completion calculation
    const profileFields = {
      // Basic required fields (weight: 2 each)
      companyName: { weight: 2, required: true },
      description: { weight: 2, required: true },
      location: { weight: 2, required: true },
      phone: { weight: 2, required: true },
      email: { weight: 2, required: true },
      
      // Required documents (weight: 2 each)
      panCardImage: { weight: 2, required: true },
      gstImage: { weight: 2, required: true },
      certificateOfIncorporation: { weight: 2, required: true },
      
      // Important additional fields (weight: 1.5 each)
      website: { weight: 1.5, required: false },
      establishedSince: { weight: 1.5, required: false },
      teamSize: { weight: 1.5, required: false },
      industrySector: { weight: 1.5, required: false },
      companyType: { weight: 1.5, required: false },
      corporateAddress: { weight: 1.5, required: false },
      
      // Optional fields (weight: 1 each)
      whyJoinUs: { weight: 1, required: false },
      logo: { weight: 1, required: false },
      coverImage: { weight: 1, required: false },
      
      // Contact details (weight: 1 each)
      contactFullName: { weight: 1, required: false },
      contactDesignation: { weight: 1, required: false },
      contactOfficialEmail: { weight: 1, required: false },
      contactMobile: { weight: 1, required: false }
    };
    
    let totalWeight = 0;
    let completedWeight = 0;
    const missingFields = [];
    const missingRequiredFields = [];
    
    // Calculate completion based on weighted fields
    Object.keys(profileFields).forEach(field => {
      const fieldConfig = profileFields[field];
      const value = profile[field];
      const isCompleted = value && (typeof value !== 'string' || value.trim() !== '');
      
      totalWeight += fieldConfig.weight;
      
      if (isCompleted) {
        completedWeight += fieldConfig.weight;
      } else {
        missingFields.push(field);
        if (fieldConfig.required) {
          missingRequiredFields.push(field);
        }
      }
    });
    
    // Calculate percentage based on weighted completion
    const completion = Math.round((completedWeight / totalWeight) * 100);
    
    // Log for debugging
    console.log('Profile completion check:', {
      companyName: profile.companyName ? 'Present' : 'Missing',
      description: profile.description ? 'Present' : 'Missing',
      location: profile.location ? 'Present' : 'Missing',
      phone: profile.phone ? 'Present' : 'Missing',
      email: profile.email ? 'Present' : 'Missing',
      panCardImage: profile.panCardImage ? 'Present' : 'Missing',
      gstImage: profile.gstImage ? 'Present' : 'Missing',
      certificateOfIncorporation: profile.certificateOfIncorporation ? 'Present' : 'Missing',
      completedWeight,
      totalWeight,
      completion,
      missingRequiredFields,
      totalMissingFields: missingFields.length
    });
    
    const isProfileComplete = missingRequiredFields.length === 0;
    const isApproved = employer?.isApproved || false;
    const profileSubmittedForReview = employer?.profileSubmittedForReview || false;
    const canPostJobs = isProfileComplete && isApproved;
    
    let message = '';
    if (missingRequiredFields.length > 0) {
      const documentLabels = {
        panCardImage: 'PAN Card Image',
        gstImage: 'GST Certificate',
        certificateOfIncorporation: 'Certificate of Incorporation'
      };
      
      const missingLabels = missingRequiredFields.map(field => 
        documentLabels[field] || field
      );
      
      message = `Please complete your profile by uploading: ${missingLabels.join(', ')}. Then wait for admin approval.`;
    } else if (!profileSubmittedForReview) {
      message = 'Your profile is complete. Save your profile to submit it for admin review.';
    } else if (profileSubmittedForReview && !isApproved) {
      message = 'Thank you for completing your profile! Your profile has been submitted for admin review.';
    } else {
      message = 'Thank you for completing your profile! Your profile is approved and you can now post jobs.';
    }
    
    res.json({ 
      success: true, 
      completion, 
      missingFields: missingRequiredFields, // Only return required missing fields for UI
      allMissingFields: missingFields, // All missing fields for reference
      isProfileComplete,
      isApproved,
      profileSubmittedForReview,
      canPostJobs,
      message
    });
  } catch (error) {
    console.error('Profile completion error:', error);
    res.json({ 
      success: true, 
      completion: 0, 
      missingFields: ['Profile data'],
      isApproved: false,
      profileSubmittedForReview: false,
      canPostJobs: false,
      message: 'Error loading profile status.'
    });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const activities = [];
    
    // Recent applications
    const recentApplications = await Application.find({ employerId: req.user._id })
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .limit(3);
    
    recentApplications.forEach(app => {
      activities.push({
        type: 'application',
        title: 'New application received',
        description: `Application for ${app.jobId?.title || 'Unknown Job'}`,
        time: app.createdAt,
        icon: '👤'
      });
    });
    
    // Recent job posts
    const recentJobs = await Job.find({ employerId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(2);
    
    recentJobs.forEach(job => {
      activities.push({
        type: 'job',
        title: 'Job post created',
        description: `${job.title} position posted`,
        time: job.createdAt,
        icon: '💼'
      });
    });
    
    // Sort by time and limit to 5
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const limitedActivities = activities.slice(0, 5);
    
    res.json({ success: true, activities: limitedActivities });
  } catch (error) {
    res.json({ success: true, activities: [] });
  }
};

// Notification Controllers
exports.getNotifications = async (req, res) => {
  try {
    const { getNotificationsByRole } = require('./notificationController');
    req.params.role = 'employer';
    return getNotificationsByRole(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { markAsRead } = require('./notificationController');
    return markAsRead(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const { markAllAsRead } = require('./notificationController');
    req.params.role = 'employer';
    return markAllAsRead(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Test endpoint to verify interview date persistence
exports.testInterviewDates = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Find the job and return its interview round details
    const job = await Job.findOne({ _id: jobId, employerId: req.user._id });
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    // Return detailed information about the stored dates
    const dateInfo = {};
    if (job.interviewRoundDetails) {
      Object.keys(job.interviewRoundDetails).forEach(roundKey => {
        const round = job.interviewRoundDetails[roundKey];
        dateInfo[roundKey] = {
          description: round.description,
          fromDate: {
            value: round.fromDate,
            type: typeof round.fromDate,
            isDate: round.fromDate instanceof Date,
            formatted: round.fromDate ? new Date(round.fromDate).toISOString().split('T')[0] : null
          },
          toDate: {
            value: round.toDate,
            type: typeof round.toDate,
            isDate: round.toDate instanceof Date,
            formatted: round.toDate ? new Date(round.toDate).toISOString().split('T')[0] : null
          },
          time: round.time
        };
      });
    }
    
    res.json({ 
      success: true, 
      jobId: job._id,
      jobTitle: job.title,
      interviewRoundOrder: job.interviewRoundOrder,
      dateInfo 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.scheduleInterviewRound = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { roundKey, roundType, description, fromDate, toDate, time, assessmentId } = req.body;
    
    // Find the job
    const job = await Job.findOne({ _id: jobId, employerId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    // Validate required fields
    if (!roundKey || !roundType) {
      return res.status(400).json({ success: false, message: 'Round key and type are required' });
    }
    
    if (!fromDate || !toDate) {
      return res.status(400).json({ success: false, message: 'From date and to date are required' });
    }
    
    // Validate date range
    if (new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({ success: false, message: 'From date cannot be after to date' });
    }
    
    // For non-assessment rounds, require description and time
    if (roundType !== 'assessment') {
      if (!description?.trim()) {
        return res.status(400).json({ success: false, message: 'Description is required for interview rounds' });
      }
      if (!time) {
        return res.status(400).json({ success: false, message: 'Time is required for interview rounds' });
      }
    }
    
    // For assessment rounds, require assessment ID
    if (roundType === 'assessment' && !assessmentId) {
      return res.status(400).json({ success: false, message: 'Assessment ID is required for assessment rounds' });
    }
    
    // Update the job with the scheduled round details
    const updateData = {
      [`interviewRoundDetails.${roundKey}`]: {
        description: description || '',
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        time: time || ''
      },
      interviewScheduled: true
    };
    
    // If it's an assessment round, also update assessment fields
    if (roundType === 'assessment') {
      updateData.assessmentId = assessmentId;
      updateData.assessmentStartDate = new Date(fromDate);
      updateData.assessmentEndDate = new Date(toDate);
    }
    
    const updatedJob = await Job.findOneAndUpdate(
      { _id: jobId, employerId: req.user._id },
      updateData,
      { new: true }
    );
    
    // Notify only candidates who have applied for this job
    try {
      const roundNames = {
        technical: 'Technical',
        oneOnOne: 'One – On – One',
        panel: 'Panel',
        group: 'Group',
        situational: 'Situational / Behavioral',
        others: 'Others – Specify.',
        assessment: 'Assessment'
      };
      
      const roundName = roundNames[roundType] || roundType;
      const applications = await Application.find({ jobId: job._id }).select('candidateId');
      
      for (const app of applications) {
        await createNotification({
          title: `${roundName} Scheduled`,
          message: `${roundName} has been scheduled for ${job.title} position from ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`,
          type: 'interview_scheduled',
          role: 'candidate',
          relatedId: job._id,
          candidateId: app.candidateId,
          createdBy: req.user._id
        });
      }
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
    }
    
    res.json({ 
      success: true, 
      message: `${roundType === 'assessment' ? 'Assessment' : 'Interview round'} scheduled successfully`,
      job: updatedJob,
      formattedMessage: (() => {
        const roundNames = {
          technical: 'Technical',
          oneOnOne: 'One – On – One',
          panel: 'Panel',
          group: 'Group',
          situational: 'Situational / Behavioral',
          others: 'Others – Specify.',
          assessment: 'Assessment'
        };
        
        const roundName = roundNames[roundType] || roundType;
        let message = `${roundName} scheduled Successfully!!`;
        
        const formatDate = (date) => {
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };
        
        message += ` From: ${formatDate(new Date(fromDate))} | To: ${formatDate(new Date(toDate))}`;
        
        if (time) {
          message += ` | Time: ${time}`;
        }
        
        return message;
      })()
    });
  } catch (error) {
    console.error('Schedule interview round error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Interview Email Controllers
exports.sendInterviewInvite = async (req, res) => {
  try {
    const { applicationId } = req.params;
    let { interviewDate, interviewTime, meetingLink, instructions } = req.body;
    
    // Normalize time
    interviewTime = normalizeTimeFormat(interviewTime);
    if (!interviewDate || !interviewTime) {
      return res.status(400).json({ success: false, message: 'Interview date and time are required' });
    }
    
    if (!meetingLink || !meetingLink.trim()) {
      return res.status(400).json({ success: false, message: 'Google Meet link is mandatory' });
    }
    
    const application = await Application.findOne({
      _id: applicationId,
      employerId: req.user._id
    })
    .populate('candidateId', 'name email')
    .populate('jobId', 'title');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Send email using nodemailer
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    const mailOptions = {
      from: `"TaleGlobal Team" <${process.env.EMAIL_USER}>`,
      to: application.candidateId.email,
      subject: `Interview Invitation - ${application.jobId.title}`,
      html: `
        <h2>Interview Invitation</h2>
        <p>Dear ${application.candidateId.name},</p>
        <p>We would like to invite you for an interview for the position of <strong>${application.jobId.title}</strong>.</p>
        <p><strong>Preferred Date:</strong> ${new Date(interviewDate).toLocaleDateString('en-GB')}</p>
        <p><strong>Preferred Time:</strong> ${formatTimeToAMPM(interviewTime)}</p>
        ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
        ${instructions ? `<p><strong>Instructions:</strong> ${instructions}</p>` : ''}
        <p>Please log in to your dashboard to confirm your availability or suggest alternative time slots.</p>
        <p>Best regards,<br>${req.user.companyName}</p>
      `
    };
    
    console.log('Attempting to send interview invite email to:', application.candidateId.email);
    const emailResult = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', emailResult.messageId);
    
    // Save interview invite details to application
    await Application.findByIdAndUpdate(applicationId, {
      interviewInvite: {
        sentAt: new Date(),
        proposedDate: interviewDate,
        proposedTime: interviewTime,
        meetingLink,
        instructions,
        status: 'pending'
      }
    });
    
    res.json({ success: true, message: 'Interview invite sent successfully' });
  } catch (error) {
    console.error('Send interview invite error:', error);
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      return res.status(500).json({ success: false, message: 'Email authentication failed. Please check email configuration.' });
    }
    if (error.code === 'ECONNECTION') {
      return res.status(500).json({ success: false, message: 'Failed to connect to email server. Please try again later.' });
    }
    if (error.message && error.message.includes('Invalid login')) {
      return res.status(500).json({ success: false, message: 'Email service authentication failed.' });
    }
    
    res.status(500).json({ success: false, message: error.message || 'Failed to send interview invite. Please try again.' });
  }
};

exports.confirmInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    let { confirmedDate, confirmedTime } = req.body;
    
    // Normalize time
    confirmedTime = normalizeTimeFormat(confirmedTime);
    const application = await Application.findOne({
      _id: applicationId,
      employerId: req.user._id
    })
    .populate('candidateId', 'name email')
    .populate('jobId', 'title');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Send confirmation email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const formattedDate = new Date(confirmedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const mailOptions = {
      from: `"TaleGlobal Team" <${process.env.EMAIL_USER}>`,
      to: application.candidateId.email,
      subject: `✓ Interview Confirmed - ${application.jobId.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #28a745; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #28a745; margin: 0;">✓ Interview Confirmed!</h2>
          </div>
          <p style="font-size: 16px; color: #333;">Dear <strong>${application.candidateId.name}</strong>,</p>
          <p style="font-size: 16px; color: #333;">Great news! We are pleased to confirm your interview for the position of <strong style="color: #ff6600;">${application.jobId.title}</strong> at <strong>${req.user.companyName}</strong>.</p>
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin-top: 0;">Interview Details:</h3>
            <p style="margin: 10px 0; font-size: 16px;"><strong>📅 Date:</strong> ${formattedDate}</p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>🕐 Time:</strong> ${confirmedTime}</p>
            ${application.interviewInvite?.meetingLink ? `<p style="margin: 10px 0; font-size: 16px;"><strong>🔗 Meeting Link:</strong> <a href="${application.interviewInvite.meetingLink}" style="color: #ff6600;">${application.interviewInvite.meetingLink}</a></p>` : ''}
          </div>
          ${application.interviewInvite?.instructions ? `<div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;"><h4 style="color: #856404; margin-top: 0;">📋 Important Instructions:</h4><p style="color: #856404; margin: 0;">${application.interviewInvite.instructions}</p></div>` : ''}
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #333; margin-top: 0;">💡 Preparation Tips:</h4>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>Join the meeting 5 minutes early</li>
              <li>Ensure stable internet connection</li>
              <li>Test your camera and microphone beforehand</li>
              <li>Keep your resume and relevant documents ready</li>
              <li>Prepare questions about the role and company</li>
            </ul>
          </div>
          <p style="font-size: 16px; color: #333;">We are excited to meet you and discuss this opportunity further. If you have any questions or need to reschedule, please contact us immediately.</p>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; margin: 5px 0;">Best regards,</p>
            <p style="color: #333; font-weight: bold; margin: 5px 0;">${req.user.companyName}</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    // Update application with confirmed schedule
    await Application.findByIdAndUpdate(applicationId, {
      'interviewInvite.status': 'confirmed',
      'interviewInvite.confirmedDate': confirmedDate,
      'interviewInvite.confirmedTime': confirmedTime,
      'interviewInvite.confirmedAt': new Date()
    });
    
    res.json({ success: true, message: 'Interview schedule confirmed and email sent' });
  } catch (error) {
    console.error('Confirm interview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInterviewResponse = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findOne({
      _id: applicationId,
      employerId: req.user._id
    }).select('interviewInvite candidateResponse');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    res.json({ 
      success: true, 
      interviewInvite: application.interviewInvite,
      candidateResponse: application.candidateResponse 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Find application by candidate and job (fallback for missing applicationId)
exports.findApplicationByCandidateAndJob = async (req, res) => {
  try {
    const { candidateId, jobId } = req.query;
    
    if (!candidateId || !jobId) {
      return res.status(400).json({ success: false, message: 'Candidate ID and Job ID are required' });
    }
    
    const application = await Application.findOne({
      candidateId,
      jobId,
      employerId: req.user._id
    });
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    res.json({ success: true, applicationId: application._id });
  } catch (error) {
    console.error('Error finding application:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveInterviewReview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { interviewRounds, remarks, isSelected, interviewProcesses, processRemarks } = req.body;
    
    const updateData = { 
      reviewedAt: new Date()
    };
    
    if (interviewRounds) updateData.interviewRounds = interviewRounds;
    if (remarks) updateData.employerRemarks = remarks;
    if (typeof isSelected === 'boolean') updateData.isSelectedForProcess = isSelected;
    
    if (interviewProcesses && Array.isArray(interviewProcesses)) {
      updateData.interviewProcesses = interviewProcesses.map(p => ({
        id: String(p.id || ''),
        name: String(p.name || ''),
        type: String(p.type || ''),
        status: String(p.status || ''),
        isCompleted: Boolean(p.isCompleted),
        result: p.result ? String(p.result) : null
      }));
    }
    
    if (processRemarks && typeof processRemarks === 'object') {
      const remarksMap = {};
      for (const [key, value] of Object.entries(processRemarks)) {
        remarksMap[key] = String(value || '');
      }
      updateData.processRemarks = remarksMap;
    }
    
    const application = await Application.findOneAndUpdate(
      { _id: applicationId, employerId: req.user._id },
      updateData,
      { new: true }
    ).populate('candidateId', 'name email')
    .populate('jobId', 'title');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    res.json({ success: true, message: 'Interview review saved successfully', application });
  } catch (error) {
    console.error('Error saving interview review:', error);
    res.status(500).json({ success: false, message: error.message, details: error.toString() });
  }
};

// Get interview process status and remarks for an application
exports.getInterviewProcessStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findOne({
      _id: applicationId,
      employerId: req.user._id
    }).select('interviewProcesses processRemarks employerRemarks reviewedAt');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Convert processRemarks Map to plain object for JSON response
    const processRemarksObj = {};
    if (application.processRemarks) {
      for (const [key, value] of application.processRemarks.entries()) {
        processRemarksObj[key] = value;
      }
    }
    
    res.json({ 
      success: true, 
      data: {
        interviewProcesses: application.interviewProcesses || [],
        processRemarks: processRemarksObj,
        employerRemarks: application.employerRemarks || '',
        reviewedAt: application.reviewedAt
      }
    });
  } catch (error) {
    console.error('Error getting interview process status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GST API Controller
exports.getGSTInfo = async (req, res) => {
  try {
    const { gstNumber } = req.params;
    
    // Validate GST number format
    if (!validateGSTFormat(gstNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GST number format. Please enter a valid 15-digit GST number.'
      });
    }
    
    console.log('Fetching GST info for:', gstNumber);
    
    // Fetch GST information
    const gstInfo = await fetchGSTInfo(gstNumber);
    
    // Map GST info to profile fields
    const profileData = mapGSTToProfile(gstInfo);
    
    console.log('GST Info fetched successfully:', {
      companyName: profileData.companyName,
      state: profileData.state,
      city: profileData.city,
      isActive: gstInfo.isActive
    });
    
    res.json({
      success: true,
      message: 'GST number is valid'
    });
    
  } catch (error) {
    console.error('GST API Error:', error);
    
    // Return appropriate error message
    if (error.message.includes('Invalid GST number')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GST number format. Please check and try again.'
      });
    }
    
    if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
      return res.status(503).json({
        success: false,
        message: 'GST service is temporarily unavailable. Please try again later or fill the details manually.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Unable to fetch GST information. Please fill the details manually.'
    });
  }
};

// Support Ticket Controllers
exports.getSupportTickets = async (req, res) => {
  try {
    const { status, userType, priority, page = 1, limit = 20 } = req.query;
    const employerId = req.user.id;
    
    let query = { 
      receiverRole: 'employer',
      receiverId: employerId
    };
    
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
    const employerId = req.user.id;
    const ticket = await Support.findOneAndUpdate(
      { _id: req.params.id, receiverId: employerId },
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
    const employerId = req.user.id;
    
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
      isRead: true
    };
    
    if (response && response.trim()) {
      updateData.response = response.trim();
      updateData.respondedAt = new Date();
      updateData.respondedBy = employerId;
    }

    const ticket = await Support.findOneAndUpdate(
      { _id: ticketId, receiverId: employerId },
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email companyName');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found or unauthorized' });
    }

    // Create notification for user if responded or status changed
    if ((response && response.trim()) || status === 'resolved' || status === 'closed') {
      try {
        let notificationTitle = 'Support Ticket Updated';
        let notificationMessage = `Your support ticket "${ticket.subject}" has been updated by the employer.`;
        
        if (response && response.trim()) {
          notificationTitle = 'Employer Response to Your Support Ticket';
          notificationMessage = `Subject: ${ticket.subject}\n\nStatus: ${status.toUpperCase()}\n\nEmployer Response:\n${response.trim()}`;
        } else if (status === 'resolved') {
          notificationTitle = 'Support Ticket Resolved';
          notificationMessage = `Subject: ${ticket.subject}\n\nYour support ticket has been resolved by the employer.\n\nStatus: RESOLVED`;
        } else if (status === 'closed') {
          notificationTitle = 'Support Ticket Closed';
          notificationMessage = `Subject: ${ticket.subject}\n\nYour support ticket has been closed by the employer.\n\nStatus: CLOSED`;
        }
        
        let targetUserId = ticket.userId;
        if (!targetUserId && ticket.email) {
          const Candidate = require('../models/Candidate');
          const candidate = await Candidate.findOne({ email: ticket.email });
          targetUserId = candidate?._id;
        }
        
        if (targetUserId) {
          const notificationData = {
            title: notificationTitle,
            message: notificationMessage,
            type: 'support_response',
            role: 'candidate',
            candidateId: targetUserId,
            createdBy: employerId
          };
          
          await createNotification(notificationData);
        }
      } catch (notifError) {
        console.error('Error creating support response notification:', notifError);
      }
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
    const employerId = req.user.id;
    
    if (!ticketId || !mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket ID provided' });
    }
    
    const ticket = await Support.findOneAndDelete({ _id: ticketId, receiverId: employerId });
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found or unauthorized' });
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
    const employerId = req.user.id;
    
    const ticket = await Support.findOne({ _id: ticketId, receiverId: employerId }).lean();
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found or unauthorized' });
    }

    if (!ticket.attachments || !ticket.attachments[attachmentIndex]) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    const attachment = ticket.attachments[attachmentIndex];
    res.json({
      success: true,
      filename: attachment.filename,
      mimetype: attachment.mimetype,
      data: attachment.data
    });
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyMobileOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const employer = await Employer.findByEmail(email.trim());

    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }

    if (employer.phoneOTP !== otp || (employer.phoneOTPExpires && employer.phoneOTPExpires < Date.now())) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    employer.isPhoneVerified = true;
    employer.phoneOTP = undefined;
    employer.phoneOTPExpires = undefined;
    await employer.save();

    // Send welcome email with password creation link only after OTP verification
    try {
      await sendWelcomeEmail(employer.email, employer.companyName || employer.name, employer.employerType);
      console.log('Welcome email sent successfully to:', employer.email);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Don't fail the verification if email fails, just log it
    }

    res.json({ success: true, message: 'Mobile number verified successfully! Please check your registered email inbox to create your password.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resendMobileOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const employer = await Employer.findByEmail(email.trim());

    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    employer.phoneOTP = otp;
    employer.phoneOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await employer.save();

    // Send SMS OTP
    await sendSMS(phone, otp, employer.name);

    res.json({ success: true, message: 'New OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
