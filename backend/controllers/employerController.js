const jwt = require('jsonwebtoken');
const Employer = require('../models/Employer');
const EmployerProfile = require('../models/EmployerProfile');
const EmployerPublicProfile = require('../models/EmployerPublicProfile');
const EmployerAdminProfile = require('../models/EmployerAdminProfile');
const Job = require('../models/Job');
const InterviewRound = require('../models/InterviewRound');
const Application = require('../models/Application');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
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
const { formatDate } = require('../utils/dateFormatter');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

const dedupeAuthorizationLetters = (letters = []) => {
  const latestByKey = new Map();
  const lettersWithoutCompany = [];

  for (const letter of letters) {
    if (!letter) continue;
    const companyKey = (letter.companyName || '').trim().toLowerCase();
    if (!companyKey) {
      lettersWithoutCompany.push(letter);
      continue;
    }

    const key = `company:${companyKey}`;

    if (!latestByKey.has(key)) {
      latestByKey.set(key, letter);
      continue;
    }

    const existing = latestByKey.get(key);
    const existingTime = new Date(existing.uploadedAt || 0).getTime();
    const currentTime = new Date(letter.uploadedAt || 0).getTime();
    if (currentTime >= existingTime) {
      latestByKey.set(key, letter);
    }
  }

  return [...Array.from(latestByKey.values()), ...lettersWithoutCompany];
};

const dedupeHiringCompanies = (companies = []) => (
  Array.from(
    new Map(
      companies
        .map(company => String(company || '').trim())
        .filter(Boolean)
        .map(company => [company.toLowerCase(), company])
    ).values()
  )
);

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
    
    await EmployerPublicProfile.create({
      employerId: employer._id,
      companyName: companyName,
      email: email,
      phone: phone,
      description: 'We are a dynamic company focused on delivering excellent services and creating opportunities for talented professionals.',
      location: 'Bangalore, India'
    });
    
    await EmployerAdminProfile.create({
      employerId: employer._id,
      employerCategory: employerCategory || finalEmployerType
    });
    
    await Subscription.create({ employerId: employer._id });

    // If OTP verification is skipped, send welcome email immediately
    if (skipOtpVerification) {
      try {
        await sendWelcomeEmail(employer.email, employer.companyName || employer.name || 'Employer', employer.employerType);
        console.log('Welcome email sent successfully to:', employer.email);
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
      }
    }

    const message = skipOtpVerification 
      ? 'Sign up successful. Please check your email to set your password and sign in to complete your profile..'
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
    const [publicProfile, adminProfile, employer, employerProfile] = await Promise.all([
      EmployerPublicProfile.findOne({ employerId: req.user._id }),
      EmployerAdminProfile.findOne({ employerId: req.user._id }),
      Employer.findById(req.user._id).select('isApproved profileSubmittedForReview employerType'),
      EmployerProfile.findOne({ employerId: req.user._id })
    ]);
    
    if (!publicProfile && !adminProfile) {
      return res.json({ success: true, profile: null });
    }

    const publicProfileObj = publicProfile?.toObject() || {};
    const adminProfileObj = adminProfile?.toObject() || {};
    const fallbackAuthorizationLetters = Array.isArray(employerProfile?.authorizationLetters)
      ? employerProfile.authorizationLetters
      : [];
    const fallbackHiringCompanies = Array.isArray(employerProfile?.hiringCompanies)
      ? employerProfile.hiringCompanies
      : [];
    const mergedAuthorizationLetters = dedupeAuthorizationLetters(
      Array.isArray(adminProfileObj.authorizationLetters) && adminProfileObj.authorizationLetters.length > 0
        ? adminProfileObj.authorizationLetters
        : fallbackAuthorizationLetters
    );
    const mergedHiringCompanies = dedupeHiringCompanies(
      [
        ...(Array.isArray(adminProfileObj.hiringCompanies) ? adminProfileObj.hiringCompanies : fallbackHiringCompanies),
        ...mergedAuthorizationLetters.map(letter => letter?.companyName)
      ]
    );

    const profile = {
      ...publicProfileObj,
      ...adminProfileObj,
      authorizationLetters: mergedAuthorizationLetters,
      hiringCompanies: mergedHiringCompanies,
      panCardVerified: employerProfile?.panCardVerified,
      panCardReuploadedAt: employerProfile?.panCardReuploadedAt,
      cinVerified: employerProfile?.cinVerified,
      cinReuploadedAt: employerProfile?.cinReuploadedAt,
      gstVerified: employerProfile?.gstVerified,
      gstReuploadedAt: employerProfile?.gstReuploadedAt,
      incorporationVerified: employerProfile?.incorporationVerified,
      incorporationReuploadedAt: employerProfile?.incorporationReuploadedAt,
      authorizationVerified: employerProfile?.authorizationVerified,
      authorizationReuploadedAt: employerProfile?.authorizationReuploadedAt,
      companyIdCardVerified: employerProfile?.companyIdCardVerified,
      companyIdCardReuploadedAt: employerProfile?.companyIdCardReuploadedAt,
      employerId: employer ? {
        _id: employer._id,
        isApproved: employer.isApproved,
        profileSubmittedForReview: employer.profileSubmittedForReview,
        employerType: employer.employerType
      } : null
    };

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
    delete updateData._id; // Remove _id to prevent immutable field error
    
    // Explicitly preserve text fields that should be saved
    // Use $set operator to ensure fields are actually updated
    const textFieldsToPreserve = ['whyJoinUs', 'googleMapsEmbed', 'description', 'location'];
    const setOperations = {};
    
    const sanitizeRichTextHtml = (html) => {
      if (typeof html !== 'string') return '';
      return html
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
        .replace(/\son\w+="[^"]*"/gi, '')
        .replace(/\son\w+='[^']*'/gi, '')
        .replace(/\s(href|src)=("|\')javascript:[^"\']*\2/gi, '')
        .trim();
    };

    textFieldsToPreserve.forEach(field => {
      if (req.body[field] !== undefined) {
        let value = req.body[field];
        if (typeof value === 'string') {
          // For googleMapsEmbed, preserve the HTML iframe code
          if (field === 'googleMapsEmbed') {
            // Just trim whitespace, don't strip HTML tags
            value = value.trim();
          } else if (field === 'description' || field === 'whyJoinUs') {
            value = value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
            value = sanitizeRichTextHtml(value);
          } else {
            // For other fields, decode HTML entities and strip tags
            value = value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
            value = value.replace(/<[^>]*>/g, '').trim();
          }
        }
        setOperations[field] = value;
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
      updateData.whyJoinUs = setOperations.whyJoinUs !== undefined ? setOperations.whyJoinUs : '';
    }
    if (req.body.hasOwnProperty('googleMapsEmbed')) {
      // Preserve HTML iframe code for Google Maps embed
      updateData.googleMapsEmbed = typeof req.body.googleMapsEmbed === 'string' ? req.body.googleMapsEmbed.trim() : '';
    }
    
    // Ensure description and location always have default values ONLY if they are undefined or null
    if (req.body.hasOwnProperty('description')) {
      updateData.description = setOperations.description !== undefined ? setOperations.description : 'We are a dynamic company focused on delivering excellent services and creating opportunities for talented professionals.';
    }
    if (req.body.hasOwnProperty('location')) {
      updateData.location = setOperations.location !== undefined ? setOperations.location : 'Bangalore, India';
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

    const publicFields = ['companyName', 'brandName', 'phone', 'email', 'website', 'establishedSince', 'teamSize', 'description', 'location', 'whyJoinUs', 'googleMapsEmbed'];
    const publicData = {};
    const adminData = {};
    
    Object.keys(updateData).forEach(key => {
      if (publicFields.includes(key)) {
        publicData[key] = updateData[key];
      } else {
        adminData[key] = updateData[key];
      }
    });

    if (Object.prototype.hasOwnProperty.call(updateData, 'brandName')) {
      await Employer.findByIdAndUpdate(
        req.user._id,
        { brandName: updateData.brandName },
        { new: false }
      );
    }
    
    const [publicProfile, adminProfile] = await Promise.all([
      EmployerPublicProfile.findOneAndUpdate(
        { employerId: req.user._id },
        publicData,
        { new: true, upsert: true, runValidators: false }
      ),
      EmployerAdminProfile.findOneAndUpdate(
        { employerId: req.user._id },
        adminData,
        { new: true, upsert: true, runValidators: false }
      )
    ]);
    
    const profile = {
      ...publicProfile.toObject(),
      ...adminProfile.toObject()
    };
    
    await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      updateData,
      { new: true, upsert: true, runValidators: false }
    );

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
        const isConsultancyEmployer = adminProfile?.employerCategory === 'consultancy' || req.user?.employerType === 'consultant';
        const recentNotificationCutoff = new Date(Date.now() - 30000);
        const [recentHiringCompanyNotification, recentDocumentResubmissionNotification] = await Promise.all([
          isConsultancyEmployer
            ? Notification.findOne({
                role: 'admin',
                type: 'hiring_company_added',
                createdBy: req.user._id,
                createdAt: { $gte: recentNotificationCutoff }
              }).sort({ createdAt: -1 })
            : Promise.resolve(null),
          Notification.findOne({
            role: 'admin',
            type: 'document_resubmitted',
            createdBy: req.user._id,
            createdAt: { $gte: recentNotificationCutoff }
          }).sort({ createdAt: -1 })
        ]);

        if (!recentHiringCompanyNotification && !recentDocumentResubmissionNotification) {
          await createNotification({
            title: 'Company Profile Updated',
            message: `${profile.companyName || 'A company'} has updated their profile`,
            type: 'profile_updated',
            role: 'admin',
            relatedId: profile._id,
            createdBy: req.user._id
          });
        }
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

    const logoPath = `/uploads/${req.file.filename}`;

    await Promise.all([
      EmployerPublicProfile.findOneAndUpdate(
        { employerId: req.user._id },
        { logo: logoPath },
        { new: true, upsert: true }
      ),
      EmployerProfile.findOneAndUpdate(
        { employerId: req.user._id },
        { logo: logoPath },
        { new: true, upsert: true }
      )
    ]);

    cacheInvalidation.clearEmployerGridCaches();

    res.json({ success: true, logo: logoPath });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const coverPath = `/uploads/${req.file.filename}`;

    await Promise.all([
      EmployerPublicProfile.findOneAndUpdate(
        { employerId: req.user._id },
        { coverImage: coverPath },
        { new: true, upsert: true }
      ),
      EmployerProfile.findOneAndUpdate(
        { employerId: req.user._id },
        { coverImage: coverPath },
        { new: true, upsert: true }
      )
    ]);

    cacheInvalidation.clearEmployerGridCaches();

    res.json({ success: true, coverImage: coverPath });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

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

    const documentPath = `/uploads/${req.file.filename}`;
    const updateData = { [fieldName]: documentPath };

    if (documentStatusMap[fieldName]) {
      const { status, reuploadedAt } = documentStatusMap[fieldName];
      // Always set status to pending when document is uploaded/reuploaded
      updateData[status] = 'pending';
      // Track reupload timestamp if document was previously rejected
      if (existingProfile && existingProfile[status] === 'rejected') {
        updateData[reuploadedAt] = new Date();
      }
    }

    const [updatedAdminProfile] = await Promise.all([
      EmployerAdminProfile.findOneAndUpdate(
        { employerId: req.user._id },
        updateData,
        { new: true, upsert: true }
      ),
      EmployerProfile.findOneAndUpdate(
        { employerId: req.user._id },
        updateData,
        { new: true, upsert: true }
      )
    ]);

    // Create notification for admin when document is resubmitted after rejection
    if (existingProfile && existingProfile[documentStatusMap[fieldName]?.status] === 'rejected') {
      try {
        const documentNames = {
          'panCardImage': 'PAN Card',
          'cinImage': 'CIN Document',
          'gstImage': 'GST Certificate',
          'certificateOfIncorporation': 'Certificate of Incorporation',
          'authorizationLetter': 'Authorization Letter',
          'companyIdCardPicture': 'Company ID Card'
        };
        
        await createNotification({
          title: 'Document Resubmitted for Review',
          message: `${req.user.companyName || 'An employer'} has resubmitted their ${documentNames[fieldName]} after rejection. Please review the updated document.`,
          type: 'document_resubmitted',
          role: 'admin',
          relatedId: req.user._id,
          createdBy: req.user._id
        });
      } catch (notifError) {
        console.error('Failed to create resubmission notification:', notifError);
      }
    }

    cacheInvalidation.clearEmployerGridCaches();

    res.json({ success: true, filePath: documentPath });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadAuthorizationLetter = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const documentPath = `/uploads/${req.file.filename}`;
    const companyName = req.body.companyName || '';
    
    const adminProfile = await EmployerAdminProfile.findOne({ employerId: req.user._id });
    const existingLetters = dedupeAuthorizationLetters(adminProfile?.authorizationLetters || []);
    const normalizedCompanyName = companyName.trim().toLowerCase();
    const previousHiringCompanies = dedupeHiringCompanies([
      ...(adminProfile?.hiringCompanies || []),
      ...existingLetters.map(letter => letter?.companyName)
    ]);
    const isConsultancyEmployer = adminProfile?.employerCategory === 'consultancy' || req.user?.employerType === 'consultant';
    const isNewHiringCompany = normalizedCompanyName
      ? !previousHiringCompanies.some(existingCompany => existingCompany.toLowerCase() === normalizedCompanyName)
      : false;

    const existingDocIndex = normalizedCompanyName ? existingLetters.findIndex(letter => {
      const letterCompany = (letter.companyName || '').trim().toLowerCase();
      return letterCompany === normalizedCompanyName;
    }) : -1;

    if (existingDocIndex !== -1 && existingLetters[existingDocIndex]?.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Approved authorization letter cannot be overwritten.'
      });
    }

    const sharedLetterId = existingDocIndex !== -1 && existingLetters[existingDocIndex]?._id
      ? existingLetters[existingDocIndex]._id
      : new mongoose.Types.ObjectId();
    const updatedDocument = {
      _id: sharedLetterId,
      fileName: req.file.originalname,
      fileData: documentPath,
      uploadedAt: new Date(),
      companyName: companyName,
      status: 'pending',
      isResubmitted: existingDocIndex !== -1 && existingLetters[existingDocIndex]?.status === 'rejected'
    };

    const nextLetters = [...existingLetters];
    if (existingDocIndex !== -1) {
      nextLetters[existingDocIndex] = updatedDocument;
    } else {
      nextLetters.push(updatedDocument);
    }
    const nextHiringCompanies = dedupeHiringCompanies([
      ...(adminProfile?.hiringCompanies || []),
      companyName
    ]);

    const [updatedAdminProfile] = await Promise.all([
      EmployerAdminProfile.findOneAndUpdate(
        { employerId: req.user._id },
        { $set: { authorizationLetters: nextLetters, hiringCompanies: nextHiringCompanies } },
        { new: true, upsert: true }
      ),
      EmployerProfile.findOneAndUpdate(
        { employerId: req.user._id },
        { $set: { authorizationLetters: nextLetters, hiringCompanies: nextHiringCompanies } },
        { new: true, upsert: true }
      )
    ]);

    const isRejectedLetterResubmission = existingDocIndex !== -1 && existingLetters[existingDocIndex]?.status === 'rejected';

    if (isRejectedLetterResubmission) {
      try {
        const companyLabel = companyName.trim() ? ` for ${companyName.trim()}` : '';
        await createNotification({
          title: 'Document Resubmitted for Review',
          message: `${req.user.companyName || 'An employer'} has resubmitted their Authorization Letter${companyLabel} after rejection. Please review the updated document.`,
          type: 'document_resubmitted',
          role: 'admin',
          relatedId: req.user._id,
          createdBy: req.user._id
        });
      } catch (notificationError) {
        console.error('Authorization letter resubmission notification failed:', notificationError);
      }
    }

    res.json({
      success: true,
      document: updatedDocument,
      profile: {
        authorizationLetters: updatedAdminProfile?.authorizationLetters || [],
        hiringCompanies: updatedAdminProfile?.hiringCompanies || nextHiringCompanies
      }
    });

    if (isConsultancyEmployer && isNewHiringCompany) {
      try {
        await createNotification({
          title: 'Added One More Company',
          message: companyName.trim()
            ? `${req.user.companyName || 'A consultant'} added one more company: ${companyName.trim()}`
            : `${req.user.companyName || 'A consultant'} added one more company.`,
          type: 'hiring_company_added',
          role: 'admin',
          relatedId: req.user._id,
          createdBy: req.user._id
        });
      } catch (notificationError) {
        console.error('Hiring company notification failed:', notificationError);
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAuthorizationLetter = async (req, res) => {
  try {
    const { documentId } = req.params;

    const [adminProfile, employerProfile] = await Promise.all([
      EmployerAdminProfile.findOne({ employerId: req.user._id }),
      EmployerProfile.findOne({ employerId: req.user._id })
    ]);

    if (!adminProfile && !employerProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const adminLetter = adminProfile?.authorizationLetters?.id(documentId);
    const employerLetter = employerProfile?.authorizationLetters?.id(documentId);
    const letter = adminLetter || employerLetter;

    if (!letter) {
      return res.status(404).json({ success: false, message: 'Authorization letter not found' });
    }

    if (letter.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This authorization letter has already been approved and cannot be deleted. Please contact support if you need to change it.'
      });
    }
    const targetCompanyName = String(letter.companyName || '').trim().toLowerCase();
    const targetFileData = String(letter.fileData || '').trim();
    const shouldRemoveLetter = (currentLetter) => {
      if (!currentLetter) return false;
      const currentId = currentLetter._id ? currentLetter._id.toString() : '';
      if (currentId === documentId) return true;

      const currentCompanyName = String(currentLetter.companyName || '').trim().toLowerCase();
      const currentFileData = String(currentLetter.fileData || '').trim();

      if (targetCompanyName && targetFileData) {
        return currentCompanyName === targetCompanyName && currentFileData === targetFileData;
      }

      if (targetCompanyName) {
        return currentCompanyName === targetCompanyName;
      }

      if (targetFileData) {
        return currentFileData === targetFileData;
      }

      return false;
    };

    if (adminProfile) {
      adminProfile.authorizationLetters = (adminProfile.authorizationLetters || []).filter(currentLetter => !shouldRemoveLetter(currentLetter));
    }

    if (employerProfile) {
      employerProfile.authorizationLetters = (employerProfile.authorizationLetters || []).filter(currentLetter => !shouldRemoveLetter(currentLetter));
    }

    const [updatedAdminProfile] = await Promise.all([
      adminProfile ? adminProfile.save() : null,
      employerProfile ? employerProfile.save() : null
    ]);

    res.json({
      success: true,
      message: 'Authorization letter deleted successfully',
      profile: {
        authorizationLetters: updatedAdminProfile?.authorizationLetters || employerProfile?.authorizationLetters || [],
        hiringCompanies: updatedAdminProfile?.hiringCompanies || employerProfile?.hiringCompanies || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAuthorizationCompanies = async (req, res) => {
  try {
    const { authorizationLetters, hiringCompanies } = req.body;
    const [existingEmployerProfile, existingAdminProfile] = await Promise.all([
      EmployerProfile.findOne({ employerId: req.user._id }).select('authorizationLetters hiringCompanies employerCategory companyName'),
      EmployerAdminProfile.findOne({ employerId: req.user._id }).select('authorizationLetters hiringCompanies employerCategory companyName')
    ]);
    const isConsultancyEmployer = existingAdminProfile?.employerCategory === 'consultancy'
      || existingEmployerProfile?.employerCategory === 'consultancy'
      || req.user?.employerType === 'consultant';
    const existingHiringCompanies = dedupeHiringCompanies([
      ...(existingAdminProfile?.hiringCompanies || []),
      ...(existingEmployerProfile?.hiringCompanies || []),
      ...(existingAdminProfile?.authorizationLetters || []).map(letter => letter?.companyName),
      ...(existingEmployerProfile?.authorizationLetters || []).map(letter => letter?.companyName)
    ]);

    const nextAuthorizationLetters = dedupeAuthorizationLetters(
      Array.isArray(authorizationLetters) ? authorizationLetters : []
    );
    const nextHiringCompanies = dedupeHiringCompanies([
      ...(Array.isArray(hiringCompanies) ? hiringCompanies : []),
      ...nextAuthorizationLetters.map(letter => letter?.companyName)
    ]);
    const newlyAddedCompanies = nextHiringCompanies.filter(company => (
      company && !existingHiringCompanies.some(existingCompany => existingCompany.toLowerCase() === company.toLowerCase())
    ));

    const [profile, adminProfile] = await Promise.all([
      EmployerProfile.findOneAndUpdate(
        { employerId: req.user._id },
        { authorizationLetters: nextAuthorizationLetters, hiringCompanies: nextHiringCompanies },
        { new: true, upsert: true }
      ),
      EmployerAdminProfile.findOneAndUpdate(
        { employerId: req.user._id },
        { authorizationLetters: nextAuthorizationLetters, hiringCompanies: nextHiringCompanies },
        { new: true, upsert: true }
      )
    ]);

    if (isConsultancyEmployer && newlyAddedCompanies.length > 0) {
      try {
        const addedCount = newlyAddedCompanies.length;
        const title = addedCount === 1 ? 'Added One More Company' : 'Companies Added';
        const actorName = profile?.companyName || adminProfile?.companyName || existingEmployerProfile?.companyName || req.user.companyName || 'A consultant';
        const message = addedCount === 1
          ? `${actorName} added one more company: ${newlyAddedCompanies[0]}`
          : `${actorName} added ${addedCount} companies.`;

        await createNotification({
          title,
          message,
          type: 'hiring_company_added',
          role: 'admin',
          relatedId: req.user._id,
          createdBy: req.user._id
        });
      } catch (notificationError) {
        console.error('Hiring company notification failed:', notificationError);
      }
    }

    res.json({
      success: true,
      message: 'Authorization company names updated successfully',
      profile: {
        ...(profile?.toObject ? profile.toObject() : {}),
        authorizationLetters: adminProfile?.authorizationLetters || profile?.authorizationLetters || [],
        hiringCompanies: adminProfile?.hiringCompanies || profile?.hiringCompanies || nextHiringCompanies
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadGallery = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const oversizedFiles = req.files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      return res.status(413).json({ 
        success: false, 
        message: `Files too large: ${oversizedFiles.map(f => f.originalname).join(', ')}. Maximum size is 10MB per file.` 
      });
    }

    const publicProfile = await EmployerPublicProfile.findOne({ employerId: req.user._id });
    const currentGallery = publicProfile?.gallery || [];

    if (currentGallery.length + req.files.length > 10) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot upload ${req.files.length} images. Maximum 10 images allowed. Current: ${currentGallery.length}` 
      });
    }

    const newImages = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      fileName: file.originalname,
      uploadedAt: new Date(),
      fileSize: file.size
    }));

    const [updatedPublicProfile] = await Promise.all([
      EmployerPublicProfile.findOneAndUpdate(
        { employerId: req.user._id },
        { $push: { gallery: { $each: newImages } } },
        { new: true, upsert: true }
      ),
      EmployerProfile.findOneAndUpdate(
        { employerId: req.user._id },
        { $push: { gallery: { $each: newImages } } },
        { new: true, upsert: true }
      )
    ]);

    res.json({ 
      success: true, 
      gallery: updatedPublicProfile.gallery,
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
    
    await Promise.all([
      EmployerPublicProfile.findOneAndUpdate(
        { employerId: req.user._id },
        { $pull: { gallery: { _id: imageId } } },
        { new: true }
      ),
      EmployerProfile.findOneAndUpdate(
        { employerId: req.user._id },
        { $pull: { gallery: { _id: imageId } } },
        { new: true }
      )
    ]);

    const publicProfile = await EmployerPublicProfile.findOne({ employerId: req.user._id });

    res.json({ success: true, message: 'Gallery image deleted successfully', gallery: publicProfile?.gallery || [] });
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

    const jobData = { ...req.body, employerId: req.user._id, status: 'draft' };
    
    console.log('=== FULL REQUEST BODY DEBUG ===');
    console.log('Full req.body:', JSON.stringify(req.body, null, 2));
    console.log('Job title received:', req.body.title);
    console.log('interviewRoundDetails received:', req.body.interviewRoundDetails);
    console.log('interviewRoundOrder received:', req.body.interviewRoundOrder);
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
            .map(line => line.replace(/^[\u2022\-\*â€¢]\s*/, '')); // Remove bullet points
        } else if (cleanText.includes('.') && cleanText.split('.').length > 2) {
          // Split by periods if multiple sentences
          responsibilities = cleanText
            .split('.')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[\u2022\-\*â€¢]\s*/, ''));
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

    // Process interview rounds into new format
    if (jobData.interviewRoundDetails && typeof jobData.interviewRoundDetails === 'object') {
      console.log('[createJob] Processing interviewRoundDetails:', JSON.stringify(jobData.interviewRoundDetails));
      const interviewRounds = [];
      Object.entries(jobData.interviewRoundDetails).forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          // Determine round type from key or interviewRoundTypes
          const roundType = jobData.interviewRoundTypes?.[key] || key.replace(/_\d+$/, '');
          
          // For assessment rounds, only require date/time (description is optional)
          // For oneOnOnePanel and group types, description is optional (scheduled via scheduler)
          // For other types, require at least description OR date/time info
          const isAssessment = roundType === 'assessment' || String(key).startsWith('assessment_');
          const isSchedulableType = roundType === 'oneOnOnePanel' || roundType === 'group' || String(roundType).toLowerCase().includes('group');
          
          const hasData = isAssessment || isSchedulableType 
            ? ((value.fromDate && value.fromDate !== '') || (value.startTime && value.startTime !== '') || (value.endTime && value.endTime !== ''))
            : ((value.description && value.description.trim() !== '') || (value.customType && value.customType.trim() !== '') || (value.fromDate && value.fromDate !== '') || (value.startTime && value.startTime !== '') || (value.endTime && value.endTime !== ''));
          
          if (!hasData) {
            console.log(`[createJob] Skipping empty round: ${key}`);
            return;
          }

          // Normalize dates
          let fromDate = value.fromDate || value.date || null;
          
          if (fromDate && typeof fromDate === 'string' && fromDate !== '') fromDate = new Date(fromDate);

          interviewRounds.push({
            key: key,
            name: value.customType || (isAssessment ? 'Assessment' : key.replace(/_\d+$/, '')),
            roundType: roundType,
            fromdate: fromDate,
            todate: value.toDate || value.todate || fromDate,
            startTime: normalizeTimeFormat(String(value.startTime || value.time || '')),
            endTime: normalizeTimeFormat(String(value.endTime || '')),
            assessmentId: value.assessmentId || null,
            description: value.description || '',
            applicationLimit: parseInt(jobData.applicationLimit) || 50,
            subStages: value.subStages || value.subStagesArray || value.days || value.daysArray || [],
            // Preserve scheduler fields if they exist in the incoming data
            scheduleObject: value.scheduleObject,
            formDataObject: value.formDataObject,
            savedAt: value.savedAt
          });
        }
      });
      
      console.log(`[createJob] Built ${interviewRounds.length} interview rounds`);
      
      // Save to new InterviewRound collection
      if (interviewRounds.length > 0) {
        jobData.interviewRounds = interviewRounds;
      }
      // Explicitly ensure interviewRoundDetails is kept for the Job model
      jobData.interviewRoundDetails = jobData.interviewRoundDetails || {};
    }
    
    // Ensure interviewRoundOrder is properly handled
    if (!jobData.interviewRoundOrder) {
      jobData.interviewRoundOrder = [];
    }
    
    // Parse CTC from string format to proper structure
    if (jobData.ctc && typeof jobData.ctc === 'string') {
      const ctcStr = jobData.ctc.trim();
      const rangeMatch = ctcStr.match(/(\d+(?:\.\d+)?)\s*[-â€“â€”]\s*(\d+(?:\.\d+)?)/i);
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
      jobType: jobData.jobType
    });
    console.log('Parsed CTC:', jobData.ctc);
    console.log('Parsed Net Salary:', jobData.netSalary);
    
    const job = await Job.create(jobData);
    console.log('Job created successfully with typeOfEmployment:', job.typeOfEmployment);
    console.log('Job created:', JSON.stringify(job, null, 2));

    // Create interview rounds in new collection
    if (jobData.interviewRounds && jobData.interviewRounds.length > 0) {
      console.log('[createJob] Creating interview rounds in DB:', jobData.interviewRounds);
      for (const round of jobData.interviewRounds) {
        try {
          const createdRound = await InterviewRound.create({
            jobId: job._id,
            key: round.key,
            name: round.name,
            roundType: round.roundType,
            fromdate: round.fromdate,
            todate: round.todate,
            startTime: round.startTime,
            endTime: round.endTime,
            assessmentId: round.assessmentId || null,
            description: (round.description && round.description.trim()) ? round.description : (round.key !== 'assessment' ? `Interview round for ${round.name || 'candidate evaluation'}.` : ''),
            applicationLimit: round.applicationLimit,
            subStages: (round.subStages || round.subStagesArray || []).map(sub => ({
              fromDate: sub.fromDate || sub.fromdate || sub.date,
              startTime: normalizeTimeFormat(sub.startTime),
              endTime: normalizeTimeFormat(sub.endTime),
              breakTime: sub.breakTime || 0
            })),
            // Include scheduler fields
            scheduleObject: round.scheduleObject,
            formDataObject: round.formDataObject,
            savedAt: round.savedAt
          });
          console.log('[createJob] Interview round created successfully:', {
            id: createdRound._id,
            key: createdRound.key,
            name: createdRound.name,
            fromdate: createdRound.fromdate,
            todate: createdRound.todate
          });
        } catch (roundError) {
          console.error('[createJob] Error creating interview round:', roundError.message, roundError.stack);
          // Don't fail the entire job creation if round creation fails
        }
      }
      
      // Update job with interviewScheduled flag
      const hasScheduledRounds = await InterviewRound.hasScheduledRounds(job._id);
      if (hasScheduledRounds) {
        await Job.findByIdAndUpdate(job._id, { interviewScheduled: true });
        job.interviewScheduled = true;
      }
    } else {
      console.log('[createJob] No interview rounds to create');
    }

    // Notify all candidates about new job posting (broadcast)
    try {
      await createNotification({
        title: 'New Job Posted',
        message: `${req.user.companyName} posted a new job: ${job.title} in ${job.location}`,
        type: 'job_posted',
        role: 'candidate',
        // NO candidateId or relatedId - broadcasts to ALL candidates
        createdBy: req.user._id
      });
    } catch (notifError) {
      console.error('Job posted notification failed:', notifError);
    }

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
    
    if (req.body.rolesAndResponsibilities !== undefined) {
      if (typeof req.body.rolesAndResponsibilities === 'string') {
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
              .map(line => line.replace(/^[\u2022\-\*â€¢]\s*/, '')); // Remove bullet points
          } else if (cleanText.includes('.') && cleanText.split('.').length > 2) {
            // Split by periods if multiple sentences
            responsibilities = cleanText
              .split('.')
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .map(line => line.replace(/^[\u2022\-\*â€¢]\s*/, ''));
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
      const rangeMatch = ctcStr.match(/(\d+(?:\.\d+)?)\s*[-â€“â€”]\s*(\d+(?:\.\d+)?)/i);
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
    
    // Check if interview rounds are scheduled in database
    const hasScheduledRounds = await InterviewRound.hasScheduledRounds(req.params.jobId);
    
    console.log('Update job - Interview rounds scheduled check:', {
      hasScheduledRounds,
      interviewRoundDetails: req.body.interviewRoundDetails
    });
    
    const wasScheduled = oldJob.interviewScheduled;
    
    console.log('[updateJob] req.body keys:', Object.keys(req.body));
    if (req.body.interviewRoundDetails) {
      console.log('[updateJob] interviewRoundDetails found in request:', Object.keys(req.body.interviewRoundDetails));
    } else {
      console.log('[updateJob] interviewRoundDetails NOT found in request - preserving existing data if any');
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
    
    // Process interview rounds into new format
    if (req.body.interviewRoundDetails && typeof req.body.interviewRoundDetails === 'object') {
      console.log('[updateJob] Processing interviewRoundDetails:', JSON.stringify(req.body.interviewRoundDetails));
      const interviewRounds = [];
      Object.entries(req.body.interviewRoundDetails).forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          // Determine round type from value, key or interviewRoundTypes
          const roundType = value.roundType || req.body.interviewRoundTypes?.[key] || key.replace(/_\d+$/, '');
          
          // For assessment rounds, only require date/time (description is optional)
          // For oneOnOnePanel and group types, description is optional (scheduled via scheduler)
          // For other types, require at least description OR date/time info
          const isAssessment = roundType === 'assessment' || String(key).startsWith('assessment_');
          const isSchedulableType = roundType === 'oneOnOnePanel' || roundType === 'group' || String(roundType).toLowerCase().includes('group');
          
          const hasData = isAssessment || isSchedulableType 
            ? ((value.fromDate && value.fromDate !== '') || (value.startTime && value.startTime !== '') || (value.endTime && value.endTime !== ''))
            : ((value.description && value.description.trim() !== '') || (value.customType && value.customType.trim() !== '') || (value.fromDate && value.fromDate !== '') || (value.startTime && value.startTime !== '') || (value.endTime && value.endTime !== ''));
          
          if (!hasData) {
            console.log(`[updateJob] Skipping empty round: ${key}`);
            return;
          }

          // Normalize dates
          let fromDate = value.fromDate || value.date || null;
          
          if (fromDate && typeof fromDate === 'string' && fromDate !== '') fromDate = new Date(fromDate);

          interviewRounds.push({
            key: key,
            name: value.customType || value.name || (isAssessment ? 'Assessment' : key.replace(/_\d+$/, '')),
            roundType: roundType,
            fromdate: fromDate,
            todate: value.toDate || value.todate || fromDate,
            startTime: normalizeTimeFormat(String(value.startTime || value.time || '')),
            endTime: normalizeTimeFormat(String(value.endTime || '')),
            assessmentId: value.assessmentId || null,
            description: value.description || '',
            applicationLimit: parseInt(req.body.applicationLimit) || parseInt(value.applicationLimit) || 50,
            subStages: value.subStages || value.subStagesArray || value.days || value.daysArray || [],
            _id: value._id || value.id, // Preserve existing ID if present
            // Preserve scheduler fields if they exist in the incoming data
            scheduleObject: value.scheduleObject,
            formDataObject: value.formDataObject,
            savedAt: value.savedAt
          });
        }
      });
      
      console.log(`[updateJob] Built ${interviewRounds.length} interview rounds`);
      
      // Get existing rounds to update instead of deleting
      const existingRounds = await InterviewRound.find({ jobId: oldJob._id });
      console.log('[updateJob] Existing rounds from DB:', existingRounds.map(r => ({ id: r._id, key: r.key, name: r.name })));
      
      const existingRoundsByKey = {};
      existingRounds.forEach(round => {
        if (round.key) {
          existingRoundsByKey[round.key] = round;
        }
      });
      console.log('[updateJob] Existing rounds by key:', Object.keys(existingRoundsByKey));
      console.log('[updateJob] Incoming round keys:', interviewRounds.map(r => r.key));
      
      // Track which rounds are being updated
      const updatedKeys = new Set();
      const updatedIds = new Set();

      if (interviewRounds.length > 0) {
        // Update existing rounds or create new ones
        for (const round of interviewRounds) {
          try {
            if (!round.key) {
              console.error('[updateJob] Round missing key field:', round);
              continue;
            }
            
            updatedKeys.add(round.key);
            
            // Try to match by _id first, then by key
            let existingRound = null;
            if (round._id) {
              existingRound = existingRounds.find(r => r._id.toString() === round._id.toString());
            }
            
            if (!existingRound && round.key) {
              existingRound = existingRoundsByKey[round.key];
            }

            // Fallback matching: if only one round of this name exists, match it
            if (!existingRound && round.name) {
              const matches = existingRounds.filter(r => r.name === round.name && !updatedIds.has(r._id.toString()));
              if (matches.length === 1) {
                existingRound = matches[0];
                console.log(`[updateJob] Matched by name fallback: ${round.name}, _id: ${existingRound._id}`);
              }
            }

            // More aggressive fallback: match by base key (type)
            if (!existingRound && round.key) {
              const baseKey = round.key.split('_')[0];
              const matches = existingRounds.filter(r => {
                const rBaseKey = (r.key && r.key.split('_')[0]) || r.roundType;
                return rBaseKey === baseKey && !updatedIds.has(r._id.toString());
              });
              if (matches.length === 1) {
                existingRound = matches[0];
                console.log(`[updateJob] Matched by base key fallback: ${baseKey}, _id: ${existingRound._id}`);
              }
            }

            // Last resort: match by roundType
            if (!existingRound && round.roundType) {
              const matches = existingRounds.filter(r => r.roundType === round.roundType && !updatedIds.has(r._id.toString()));
              if (matches.length === 1) {
                existingRound = matches[0];
                console.log(`[updateJob] Matched by roundType fallback: ${round.roundType}, _id: ${existingRound._id}`);
              }
            }
            
            if (existingRound) {
              updatedIds.add(existingRound._id.toString());
              console.log(`[updateJob] UPDATING existing round with _id: ${existingRound._id}, key: ${round.key}`);
              // Update existing round to preserve _id
              existingRound.name = round.name;
              existingRound.roundType = round.roundType || existingRound.roundType;
              existingRound.fromdate = round.fromdate;
              existingRound.todate = round.todate;
              existingRound.startTime = round.startTime;
              existingRound.endTime = round.endTime;
              existingRound.assessmentId = round.assessmentId || null;
              existingRound.description = (round.description && round.description.trim()) ? round.description : (round.key !== 'assessment' ? `Interview round for ${round.name || 'candidate evaluation'}.` : existingRound.description);
              existingRound.applicationLimit = round.applicationLimit;
              existingRound.subStages = (round.subStages || round.days || round.daysArray || []).map(sub => ({
                fromDate: sub.fromDate || sub.fromdate || sub.date,
                startTime: normalizeTimeFormat(sub.startTime),
                endTime: normalizeTimeFormat(sub.endTime),
                breakTime: sub.breakTime || 0
              }));

              // Preserve or update scheduler fields
              // Only update if the incoming field is NOT undefined and has content (for arrays/objects)
              const hasContent = (val) => {
                if (val === undefined || val === null) return false;
                if (Array.isArray(val)) return val.length > 0;
                if (typeof val === 'object') return Object.keys(val).length > 0;
                return true;
              };

              if (hasContent(round.scheduleObject)) {
                existingRound.scheduleObject = round.scheduleObject;
                existingRound.markModified('scheduleObject');
              }
              if (hasContent(round.formDataObject)) {
                existingRound.formDataObject = round.formDataObject;
                existingRound.markModified('formDataObject');
              }
              if (round.savedAt !== undefined) existingRound.savedAt = round.savedAt;

              await existingRound.save();
              console.log('[updateJob] Interview round UPDATED successfully - _id preserved:', {
                id: existingRound._id,
                key: existingRound.key,
                name: existingRound.name
              });
            } else {
              console.log(`[updateJob] CREATING new round with key: ${round.key}`);
              // Create new round
              const createdRound = await InterviewRound.create({
                jobId: oldJob._id,
                key: round.key,
                name: round.name,
                roundType: round.roundType,
                fromdate: round.fromdate,
                todate: round.todate,
                startTime: round.startTime,
                endTime: round.endTime,
                assessmentId: round.assessmentId || null,
                description: (round.description && round.description.trim()) ? round.description : (round.key !== 'assessment' ? `Interview round for ${round.name || 'candidate evaluation'}.` : ''),
                applicationLimit: round.applicationLimit,
                subStages: (round.subStages || round.days || round.daysArray || []).map(sub => ({
                  fromDate: sub.fromDate || sub.fromdate || sub.date,
                  startTime: normalizeTimeFormat(sub.startTime),
                  endTime: normalizeTimeFormat(sub.endTime),
                  breakTime: sub.breakTime || 0
                })),
                // Include scheduler fields
                scheduleObject: round.scheduleObject,
                formDataObject: round.formDataObject,
                savedAt: round.savedAt
              });
              console.log('[updateJob] Interview round CREATED successfully - new _id:', {
                id: createdRound._id,
                key: createdRound.key,
                name: createdRound.name
              });
            }
          } catch (roundError) {
            console.error('[updateJob] Error updating/creating interview round:', roundError);
          }
        }
        
        // Delete rounds that are no longer in the update
        for (const existingRound of existingRounds) {
          const roundId = existingRound._id.toString();
          // Match by ID if possible, otherwise by key
          if (!updatedIds.has(roundId) && !updatedKeys.has(existingRound.key)) {
            await InterviewRound.findByIdAndDelete(existingRound._id);
            console.log('[updateJob] Deleted removed round:', existingRound.key, 'ID:', roundId);
          }
        }
      } else {
        // If no rounds provided, delete all existing rounds
        await InterviewRound.deleteMany({ jobId: oldJob._id });
        console.log('[updateJob] Deleted all interview rounds (no new rounds provided)');
      }
    }

    const shouldActivateJob = String(req.body.status || '').toLowerCase() === 'active';
    if (shouldActivateJob) {
      const interviewRoundOrderForValidation = Array.isArray(req.body.interviewRoundOrder)
        ? req.body.interviewRoundOrder
        : (oldJob.interviewRoundOrder || []);
      const interviewRoundTypesForValidation = req.body.interviewRoundTypes || oldJob.interviewRoundTypes || {};
      const requiredNonAssessmentRounds = interviewRoundOrderForValidation.filter((roundKey) =>
        String(interviewRoundTypesForValidation[roundKey] || '').toLowerCase() !== 'assessment'
      );

      if (requiredNonAssessmentRounds.length > 0) {
        const dbRoundsForValidation = await InterviewRound.find({ jobId: oldJob._id }).lean();
        const hasSchedulePayload = (round) => {
          const hasItems = (val) => Array.isArray(val) && val.length > 0;
          const scheduleObject = round?.scheduleObject || round?.schedule || {};
          const nestedSchedule = scheduleObject?.schedule || {};
          const schedules = round?.schedulesArray || round?.schedules || scheduleObject?.schedulesArray || scheduleObject?.schedules || nestedSchedule?.schedules;
          const daySchedules = round?.daySchedulesArray || round?.daySchedules || scheduleObject?.daySchedulesArray || scheduleObject?.daySchedules || nestedSchedule?.daySchedules;
          const rooms = round?.roomsArray || round?.rooms || scheduleObject?.roomsArray || scheduleObject?.rooms || nestedSchedule?.rooms;
          const subStages = round?.subStages || round?.subStagesArray || [];
          const hasTimedSubStages = Array.isArray(subStages) && subStages.some((sub) =>
            (sub?.fromDate || sub?.fromdate || sub?.date) && sub?.startTime && sub?.endTime
          );
          return hasItems(schedules) || hasItems(daySchedules) || hasItems(rooms) || hasTimedSubStages;
        };

        const scheduledNonAssessmentCount = dbRoundsForValidation.filter((round) =>
          String(round?.roundType || '').toLowerCase() !== 'assessment' && hasSchedulePayload(round)
        ).length;

        if (scheduledNonAssessmentCount < requiredNonAssessmentRounds.length) {
          return res.status(400).json({
            success: false,
            message: 'Kindly complete the interview scheduling process before posting the job.'
          });
        }
      }
    }
    
    // Update interviewScheduled flag based on database
    const hasScheduledRoundsAfterUpdate = await InterviewRound.hasScheduledRounds(oldJob._id);
    req.body.interviewScheduled = hasScheduledRoundsAfterUpdate;
    
    // Ensure interviewRoundOrder and interviewRoundDetails are not cleared if missing from request
    if (req.body.interviewRoundOrder === undefined) {
      delete req.body.interviewRoundOrder;
    }
    if (req.body.interviewRoundDetails === undefined) {
      delete req.body.interviewRoundDetails;
    }
    if (req.body.interviewRoundTypes === undefined) {
      delete req.body.interviewRoundTypes;
    }
    
    // Use findOne and save instead of findOneAndUpdate to ensure Mixed types are properly marked as modified
    const job = await Job.findOne({ _id: req.params.jobId, employerId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Apply updates from req.body to the job document
    Object.keys(req.body).forEach(key => {
      job[key] = req.body[key];
    });

    // Explicitly mark Mixed types as modified
    if (req.body.interviewRoundDetails) {
      job.markModified('interviewRoundDetails');
      console.log('[updateJob] Marked interviewRoundDetails as modified');
    }
    if (req.body.interviewRoundTypes) {
      job.markModified('interviewRoundTypes');
      console.log('[updateJob] Marked interviewRoundTypes as modified');
    }
    if (req.body.ctc) {
      job.markModified('ctc');
    }
    if (req.body.netSalary) {
      job.markModified('netSalary');
    }

    await job.save();
    console.log('[updateJob] Job saved successfully with save()');

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
    if (hasScheduledRoundsAfterUpdate) {
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
    const jobs = await Job.find({
      employerId: req.user._id,
      status: { $ne: 'draft' }
    })
      .populate('employerId', 'companyName')
      .sort({ createdAt: -1 })
      .lean();
    
    // Fetch interview rounds for all jobs and update application counts
    const jobsWithRounds = await Promise.all(jobs.map(async (job) => {
      if (!job.companyName && job.employerId?.companyName) {
        job.companyName = job.employerId.companyName;
      }
      
      // Get actual application count from database
      const actualApplicationCount = await Application.countDocuments({ jobId: job._id });
      job.applicationCount = actualApplicationCount;
      
      // Remove old embedded interviewRounds
      delete job.interviewRounds;
      
      // Get interview rounds from new collection
      const interviewRounds = await InterviewRound.find({ jobId: job._id }).sort({ fromdate: 1, startTime: 1 });
      
      // If no rounds in new collection, try to build from old format
      if (interviewRounds.length === 0) {
        if (job.interviewRoundOrder && job.interviewRoundOrder.length > 0) {
          job.interviewRounds = job.interviewRoundOrder.map((key) => {
            const details = job.interviewRoundDetails?.[key];
            const roundType = job.interviewRoundTypes?.[key];
            
            const roundNames = {
              technical: 'Technical',
              oneOnOne: 'One-to-One',
              panel: 'Panel',
              group: 'Group',
              situational: 'Situational / Behavioral',
              others: 'Others',
              assessment: 'Assessment'
            };
            
            return {
              id: key,
              key: key,
              name: details?.customType || roundNames[roundType] || roundType || key.replace(/_\d+$/, ''),
              fromdate: details?.fromDate || details?.date || null,
              todate: details?.toDate || details?.fromDate || details?.date || null,
              startTime: details?.startTime || details?.time || null,
              endTime: details?.endTime || null,
              description: details?.description || null,
              applicationLimit: details?.applicationLimit || job.applicationLimit || 50
            };
          });
        } else {
          job.interviewRounds = [];
        }
      } else {
        // Format interview rounds for frontend compatibility
        job.interviewRounds = interviewRounds.map(round => ({
          id: round._id.toString(),
          key: round.key,
          name: round.name,
          roundType: round.roundType || 'others',
          fromdate: round.fromdate,
          todate: round.todate,
          startTime: round.startTime,
          endTime: round.endTime,
          description: round.description,
          applicationLimit: round.applicationLimit,
          subStages: round.subStages || [],
          subStagesArray: round.subStages || [],
          days: round.subStages || [],
          daysArray: round.subStages || [],
          // Scheduler fields
          scheduleObject: round.scheduleObject,
          schedulesArray: round.schedulesArray,
          daySchedulesArray: round.daySchedulesArray,
          date: round.date,
          roomsArray: round.roomsArray,
          numStudents: round.numStudents,
          numHRs: round.numHRs,
          remainingStudents: round.remainingStudents,
          maxPossibleInterviews: round.maxPossibleInterviews,
          formDataObject: round.formDataObject,
          savedAt: round.savedAt
        }));
      }
      
      return job;
    }));
    
    res.json({ success: true, jobs: jobsWithRounds });
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
    const job = await Job.findOne({ _id: req.params.jobId, employerId: req.user._id }).lean();
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    // Get actual application count from database
    const actualApplicationCount = await Application.countDocuments({ jobId: req.params.jobId });
    job.applicationCount = actualApplicationCount;
    
    // Get interview rounds from new collection
    const { ObjectId } = require('mongoose').Types;
    const interviewRounds = await InterviewRound.find({ jobId: new ObjectId(req.params.jobId) }).sort({ fromdate: 1, startTime: 1 });
    console.log('[getJob] Fetching rounds for jobId:', req.params.jobId);
    console.log('[getJob] Found rounds from collection:', JSON.stringify(interviewRounds));
    
    // If no rounds in new collection, try to build from old format
    if (interviewRounds.length === 0) {
      console.log('[getJob] No rounds in collection, checking old format');
      console.log('[getJob] interviewRoundOrder:', job.interviewRoundOrder);
      console.log('[getJob] interviewRoundDetails:', job.interviewRoundDetails);
      console.log('[getJob] interviewRoundTypes:', job.interviewRoundTypes);
      
      // Build rounds array from available data
      if (job.interviewRoundOrder && job.interviewRoundOrder.length > 0) {
        job.interviewRounds = job.interviewRoundOrder.map((key) => {
          const details = job.interviewRoundDetails?.[key];
          const roundType = job.interviewRoundTypes?.[key];
          
          const roundNames = {
            technical: 'Technical',
            oneOnOne: 'One-to-One',
            panel: 'Panel',
            group: 'Group',
            situational: 'Situational / Behavioral',
            others: 'Others',
            assessment: 'Assessment'
          };
          
          return {
            id: key,
            name: details?.customType || roundNames[roundType] || roundType || key.replace(/_\d+$/, ''),
            fromdate: details?.fromDate || details?.date || null,
            todate: details?.toDate || details?.fromDate || details?.date || null,
            startTime: details?.startTime || details?.time || null,
            endTime: details?.endTime || null,
            description: details?.description || null,
            applicationLimit: details?.applicationLimit || job.applicationLimit || null
          };
        });
      } else {
        job.interviewRounds = [];
      }
    } else {
      // Format interview rounds for frontend compatibility
      job.interviewRounds = interviewRounds.map(round => ({
        id: round._id.toString(),
        key: round.key,
        name: round.name,
        roundType: round.roundType || 'others',
        fromdate: round.fromdate,
        todate: round.todate,
        startTime: round.startTime,
        endTime: round.endTime,
        description: round.description,
        applicationLimit: round.applicationLimit,
        subStages: round.subStages || [],
        subStagesArray: round.subStages || [],
        days: round.subStages || [],
        daysArray: round.subStages || [],
        // Scheduler fields
        scheduleObject: round.scheduleObject,
        schedulesArray: round.schedulesArray,
        daySchedulesArray: round.daySchedulesArray,
        date: round.date,
        roomsArray: round.roomsArray,
        numStudents: round.numStudents,
        numHRs: round.numHRs,
        remainingStudents: round.remainingStudents,
        maxPossibleInterviews: round.maxPossibleInterviews,
        formDataObject: round.formDataObject,
        savedAt: round.savedAt
      }));
    }
    
    console.log('[getJob] Final interviewRounds:', job.interviewRounds);
    
    res.json({ success: true, job });
  } catch (error) {
    console.error('[getJob] Error:', error);
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
        offer_shared: 'Offer Shared',
        offer_sent: 'Offer Letter Sent',
        accepted: 'Offer Accepted'
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
              subject: `ðŸŽ‰ Congratulations! You've been shortlisted for ${jobTitle}`,
              html: `
                <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa;">
                  <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="color: #28a745; text-align: center; margin-bottom: 30px;">ðŸŽ‰ Congratulations!</h1>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${candidateName},</p>
                    <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #28a745;">
                      <p style="color: #155724; margin: 0; font-size: 18px; line-height: 1.6; font-weight: 600;">âœ… You have been shortlisted for the position of <strong>${jobTitle}</strong>!</p>
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
            console.log('âœ“ Shortlist email sent successfully:', emailResult.messageId);
          } catch (emailError) {
            console.error('âœ— Shortlist email failed:', emailError.message);
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
        relatedId: req.user._id,
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
    .populate('candidateId', 'name email phone profilePicture profileImage')
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
    const candidateProfile = await CandidateProfile.findOne({ 
      candidateId: application.candidateId._id || application.candidateId 
    });
    
    // Get assessment attempt details if job has assessment
    let assessmentAttempt = null;
    if (application.jobId?.assessmentId) {
      assessmentAttempt = await AssessmentAttempt.findOne({
        applicationId: application._id
      }).populate('assessmentId', 'title timer totalQuestions passingPercentage');
    }
    
    // Get interview process if exists
    const interviewProcess = await InterviewProcess.findOne({ applicationId: application._id });
    
    // Merge candidate and profile data
    const candidateProfileObj = candidateProfile ? candidateProfile.toObject() : {};
    const currentEmployment = candidateProfileObj.employment?.find(emp => emp.isCurrentCompany || emp.isCurrent || emp.current);
    const currentExp = candidateProfileObj.experience?.find(exp => exp.current || exp.isCurrent);
    
    const candidateData = {
      ...application.candidateId.toObject(),
      ...candidateProfileObj,
      currentCompany: currentEmployment?.organizationName || currentEmployment?.organization || currentEmployment?.company || currentExp?.company || currentExp?.organization,
      currentCTC: currentEmployment?.presentCTC,
      expectedCTC: currentEmployment?.expectedCTC || candidateProfileObj.expectedSalary,
      noticePeriod: currentEmployment?.noticePeriod || candidateProfileObj.jobPreferences?.noticePeriod,
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
    const [profile, adminProfile] = await Promise.all([
      EmployerProfile.findOne({ employerId: req.user._id }).select('authorizationLetters'),
      EmployerAdminProfile.findOne({ employerId: req.user._id }).select('authorizationLetters')
    ]);

    const fallbackAuthorizationLetters = Array.isArray(profile?.authorizationLetters)
      ? profile.authorizationLetters
      : [];
    const mergedAuthorizationLetters = dedupeAuthorizationLetters(
      Array.isArray(adminProfile?.authorizationLetters) && adminProfile.authorizationLetters.length > 0
        ? adminProfile.authorizationLetters
        : fallbackAuthorizationLetters
    );

    if (!mergedAuthorizationLetters.length) {
      return res.json({ success: true, companies: [] });
    }
    
    // Filter approved authorization letters and extract company names
    const approvedCompanies = mergedAuthorizationLetters
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
        icon: 'ðŸ‘¤'
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
        icon: 'ðŸ’¼'
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
    const { roundKey, roundType, description, fromDate, toDate, time, assessmentId, subStages, subStagesArray, days, daysArray } = req.body;
    
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
    
    // Create or update interview round in the new collection
    let interviewRound = await InterviewRound.findOne({ jobId: job._id, key: roundKey });
    
    if (interviewRound) {
      interviewRound.name = roundKey.replace(/_\d+$/, '');
      interviewRound.fromdate = new Date(fromDate);
      interviewRound.todate = new Date(toDate);
      interviewRound.startTime = normalizeTimeFormat(time || '');
      interviewRound.assessmentId = roundType === 'assessment' ? assessmentId : interviewRound.assessmentId;
      interviewRound.description = (description && description.trim()) ? description : (roundType !== 'assessment' ? `Interview round for ${roundKey.replace(/_\d+$/, '') || 'candidate evaluation'}.` : interviewRound.description);
      if (subStages || subStagesArray || days || daysArray) {
        const stagesToUse = subStages || subStagesArray || days || daysArray || [];
        interviewRound.subStages = stagesToUse.map(sub => ({
          fromDate: sub.fromDate || sub.fromdate || sub.date,
          startTime: normalizeTimeFormat(sub.startTime),
          endTime: normalizeTimeFormat(sub.endTime)
        }));
      }

      // Preserve or update scheduler fields
      if (req.body.scheduleObject !== undefined) {
        interviewRound.scheduleObject = req.body.scheduleObject;
        interviewRound.markModified('scheduleObject');
      }
      if (req.body.schedulesArray !== undefined) {
        interviewRound.schedulesArray = req.body.schedulesArray;
        interviewRound.markModified('schedulesArray');
      }
      if (req.body.daySchedulesArray !== undefined) {
        interviewRound.daySchedulesArray = req.body.daySchedulesArray;
        interviewRound.markModified('daySchedulesArray');
      }
      if (req.body.date !== undefined) interviewRound.date = req.body.date;
      if (req.body.roomsArray !== undefined) {
        interviewRound.roomsArray = req.body.roomsArray;
        interviewRound.markModified('roomsArray');
      }
      if (req.body.numStudents !== undefined) interviewRound.numStudents = req.body.numStudents;
      if (req.body.numHRs !== undefined) interviewRound.numHRs = req.body.numHRs;
      if (req.body.remainingStudents !== undefined) interviewRound.remainingStudents = req.body.remainingStudents;
      if (req.body.maxPossibleInterviews !== undefined) interviewRound.maxPossibleInterviews = req.body.maxPossibleInterviews;
      if (req.body.formDataObject !== undefined) {
        interviewRound.formDataObject = req.body.formDataObject;
        interviewRound.markModified('formDataObject');
      }
      if (req.body.savedAt !== undefined) interviewRound.savedAt = req.body.savedAt;

      await interviewRound.save();
    } else {
      interviewRound = await InterviewRound.create({
        jobId: job._id,
        key: roundKey,
        name: roundKey.replace(/_\d+$/, ''),
        fromdate: new Date(fromDate),
        todate: new Date(toDate),
        startTime: normalizeTimeFormat(time || ''),
        assessmentId: roundType === 'assessment' ? assessmentId : null,
        description: (description && description.trim()) ? description : (roundType !== 'assessment' ? `Interview round for ${roundKey.replace(/_\d+$/, '') || 'candidate evaluation'}.` : ''),
        applicationLimit: job.applicationLimit || 50,
        subStages: (subStages || subStagesArray || days || daysArray || []).map(sub => ({
          fromDate: sub.fromDate || sub.fromdate || sub.date,
          startTime: normalizeTimeFormat(sub.startTime),
          endTime: normalizeTimeFormat(sub.endTime)
        })),
        // Include scheduler fields
        scheduleObject: req.body.scheduleObject,
        schedulesArray: req.body.schedulesArray,
        daySchedulesArray: req.body.daySchedulesArray,
        date: req.body.date,
        roomsArray: req.body.roomsArray,
        numStudents: req.body.numStudents,
        numHRs: req.body.numHRs,
        remainingStudents: req.body.remainingStudents,
        maxPossibleInterviews: req.body.maxPossibleInterviews,
        formDataObject: req.body.formDataObject,
        savedAt: req.body.savedAt
      });
    }
    
    const updateData = {
      interviewScheduled: true
    };
    
    // If it's an assessment round, also update assessment fields
    if (roundType === 'assessment') {
      updateData.assessmentId = assessmentId;
      updateData.assessmentStartDate = new Date(fromDate);
      updateData.assessmentEndDate = new Date(toDate);
      updateData.assessmentStartTime = normalizeTimeFormat(time || '');
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
        managerial: 'Managerial Round',
        hr: 'HR Round',
        oneOnOne: 'One-to-One',
        oneOnOnePanel: 'One-to-One / Panel',
        panel: 'Panel',
        group: 'Group',
        situational: 'Situational / Behavioral',
        others: 'Others â€“ Specify.',
        assessment: 'Assessment'
      };
      
      const roundName = roundNames[roundType] || roundType;
      const applications = await Application.find({ jobId: job._id }).select('candidateId');
      
      for (const app of applications) {
        await createNotification({
          title: `${roundName} Scheduled`,
          message: `${roundName} has been scheduled for ${job.title} position from ${formatDate(fromDate)} to ${formatDate(toDate)}`,
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
          oneOnOne: 'One-to-One',
          panel: 'Panel',
          group: 'Group',
          situational: 'Situational / Behavioral',
          others: 'Others â€“ Specify.',
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
        <p><strong>Preferred Date:</strong> ${formatDate(interviewDate)}</p>
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
    
    const formattedDate = formatDate(confirmedDate);
    
    const mailOptions = {
      from: `"TaleGlobal Team" <${process.env.EMAIL_USER}>`,
      to: application.candidateId.email,
      subject: `âœ“ Interview Confirmed - ${application.jobId.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #28a745; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #28a745; margin: 0;">âœ“ Interview Confirmed!</h2>
          </div>
          <p style="font-size: 16px; color: #333;">Dear <strong>${application.candidateId.name}</strong>,</p>
          <p style="font-size: 16px; color: #333;">Great news! We are pleased to confirm your interview for the position of <strong style="color: #ff6600;">${application.jobId.title}</strong> at <strong>${req.user.companyName}</strong>.</p>
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin-top: 0;">Interview Details:</h3>
            <p style="margin: 10px 0; font-size: 16px;"><strong>ðŸ“… Date:</strong> ${formattedDate}</p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>ðŸ• Time:</strong> ${confirmedTime}</p>
            ${application.interviewInvite?.meetingLink ? `<p style="margin: 10px 0; font-size: 16px;"><strong>ðŸ”— Meeting Link:</strong> <a href="${application.interviewInvite.meetingLink}" style="color: #ff6600;">${application.interviewInvite.meetingLink}</a></p>` : ''}
          </div>
          ${application.interviewInvite?.instructions ? `<div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;"><h4 style="color: #856404; margin-top: 0;">ðŸ“‹ Important Instructions:</h4><p style="color: #856404; margin: 0;">${application.interviewInvite.instructions}</p></div>` : ''}
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #333; margin-top: 0;">ðŸ’¡ Preparation Tips:</h4>
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

    const shouldNotifyInterviewStatusUpdates = Array.isArray(interviewProcesses);
    let previousInterviewProcesses = null;

    if (shouldNotifyInterviewStatusUpdates) {
      const existingApplication = await Application.findOne({
        _id: applicationId,
        employerId: req.user._id
      }).select('interviewProcesses').lean();

      if (!existingApplication) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      previousInterviewProcesses = existingApplication.interviewProcesses || [];
    }
    
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

    if (shouldNotifyInterviewStatusUpdates && previousInterviewProcesses) {
      try {
        const candidateId = application.candidateId?._id;
        if (candidateId) {
          const previousStatusById = new Map(
            previousInterviewProcesses
              .filter((p) => p && p.id)
              .map((p) => [String(p.id).trim(), String(p.status || '').trim()])
          );

          const statusLabels = {
            pending: 'Pending',
            shortlisted_for_next_round: 'Shortlisted for next Round',
            on_hold: 'On Hold',
            pending_decision: 'Pending Decision',
            no_show: 'No Show',
            rejected: 'Not Advanced to Next Stage',
            selected: 'Selected',
            // Legacy value used by older UIs for the final "Selected" state
            shortlisted: 'Selected',
            under_review: 'Under Review',
            interview_scheduled: 'Interview Scheduled',
            interview_completed: 'Interview Completed'
          };

          const formatStatusLabel = (rawStatus) => {
            const normalized = String(rawStatus || '').trim();
            if (!normalized) return '';
            return statusLabels[normalized] || normalized.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
          };

          const jobTitle = application.jobId?.title || 'the position';
          const updatedProcesses = Array.isArray(application.interviewProcesses) ? application.interviewProcesses : [];
          const changedStages = updatedProcesses
            .map((process, index) => {
              const id = String(process?.id || '').trim();
              const newStatus = String(process?.status || '').trim();
              const oldStatus = previousStatusById.get(id);
              return { id, newStatus, oldStatus, process, index };
            })
            .filter(({ id, newStatus, oldStatus }) => {
              if (!id) return false;
              if (!newStatus) return false;
              if (newStatus === oldStatus) return false;
              if (oldStatus === undefined && newStatus === 'pending') return false;
              return true;
            });

          for (const { process, index, newStatus } of changedStages) {
            const stageName = String(process?.name || '').trim();
            let statusLabel = formatStatusLabel(newStatus);
            if (newStatus === 'rejected' && index === updatedProcesses.length - 1) {
              statusLabel = 'Rejected';
            }
            const stageLabel = stageName ? `Stage ${index + 1} (${stageName})` : `Stage ${index + 1}`;

            await createNotification({
              title: 'Interview Status Updated',
              message: `Your interview status for ${jobTitle} - ${stageLabel} is now ${statusLabel}.`,
              type: 'interview_updated',
              role: 'candidate',
              relatedId: application._id,
              candidateId,
              createdBy: req.user._id
            });
          }
        }
      } catch (notificationError) {
        console.error('Interview status notification failed:', notificationError);
      }
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
      await sendWelcomeEmail(employer.email, employer.companyName || employer.name || 'Employer', employer.employerType);
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


// Interview Rounds Management - New Structure
exports.createInterviewRounds = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { rounds } = req.body;
    
    console.log('[createInterviewRounds] Received for jobId:', jobId);
    console.log('[createInterviewRounds] Incoming rounds data:', JSON.stringify(rounds, null, 2));
    
    // Verify job belongs to employer
    const job = await Job.findOne({ _id: jobId, employerId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    // Validate rounds data
    if (!rounds || !Array.isArray(rounds) || rounds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid rounds data' });
    }
    
    // Create interview rounds
    const createdRounds = [];
    for (const round of rounds) {
      console.log('[createInterviewRounds] Processing round:', round.name);
      console.log('[createInterviewRounds] Round subStages:', JSON.stringify(round.subStages));
      console.log('[createInterviewRounds] Round subStagesArray:', JSON.stringify(round.subStagesArray));
      console.log('[createInterviewRounds] Round days:', JSON.stringify(round.days));
      console.log('[createInterviewRounds] Round daysArray:', JSON.stringify(round.daysArray));
      
      const interviewRound = await InterviewRound.create({
        jobId: jobId,
        key: round.key || `${round.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        name: round.name,
        roundType: round.roundType || 'others',
        fromdate: round.fromdate || round.fromDate || round.date,
        todate: round.todate || round.toDate || round.fromdate || round.fromDate || round.date,
        startTime: normalizeTimeFormat(round.startTime),
        endTime: normalizeTimeFormat(round.endTime),
        description: (round.description && round.description.trim()) ? round.description : (round.roundType !== 'assessment' ? `Interview round for ${round.name || 'candidate evaluation'}.` : ''),
        applicationLimit: round.applicationLimit || job.applicationLimit || 50,
        subStages: (round.subStages || round.subStagesArray || round.days || round.daysArray || []).map(sub => ({
          fromDate: sub.fromDate || sub.fromdate || sub.date,
          startTime: normalizeTimeFormat(sub.startTime),
          endTime: normalizeTimeFormat(sub.endTime),
          breakTime: sub.breakTime || 0
        })),
        // Include scheduler fields
        scheduleObject: round.scheduleObject,
        schedulesArray: round.schedulesArray,
        daySchedulesArray: round.daySchedulesArray,
        date: round.date,
        roomsArray: round.roomsArray,
        numStudents: round.numStudents,
        numHRs: round.numHRs,
        remainingStudents: round.remainingStudents,
        maxPossibleInterviews: round.maxPossibleInterviews,
        formDataObject: round.formDataObject,
        savedAt: round.savedAt
      });
      createdRounds.push(interviewRound);
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Interview rounds created successfully',
      rounds: createdRounds.map(round => ({
        ...round.toObject(),
        days: round.subStages || [],
        daysArray: round.subStages || []
      }))
    });
  } catch (error) {
    console.error('Create interview rounds error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInterviewRounds = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Verify job belongs to employer
    const job = await Job.findOne({ _id: jobId, employerId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    // Get interview rounds for this job
    const rounds = await InterviewRound.find({ jobId: jobId }).sort({ fromdate: 1, startTime: 1 });
    
    const roundsWithDayAliases = rounds.map(round => ({
      ...round.toObject(),
      days: round.subStages || [],
      daysArray: round.subStages || []
    }));
    res.json({ success: true, rounds: roundsWithDayAliases });
  } catch (error) {
    console.error('Get interview rounds error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateInterviewRound = async (req, res) => {
  try {
    const { roundId } = req.params;
    const { name, date, startTime, endTime, applicationLimit, roundType, subStages, subStagesArray, days, daysArray } = req.body;
    
    console.log('[updateInterviewRound] Received for roundId:', roundId);
    console.log('[updateInterviewRound] Incoming body:', JSON.stringify(req.body, null, 2));
    console.log('[updateInterviewRound] subStages received:', JSON.stringify(subStages));
    console.log('[updateInterviewRound] subStagesArray received:', JSON.stringify(subStagesArray));
    console.log('[updateInterviewRound] days received:', JSON.stringify(days));
    console.log('[updateInterviewRound] daysArray received:', JSON.stringify(daysArray));
    
    // Find the round and verify it belongs to employer's job
    const round = await InterviewRound.findById(roundId).populate('jobId');
    if (!round) {
      return res.status(404).json({ success: false, message: 'Interview round not found' });
    }
    
    if (round.jobId.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Update round
    if (name) round.name = name;
    if (roundType) round.roundType = roundType;
    if (date) {
      round.fromdate = date;
      round.todate = date;
    }
    if (startTime) round.startTime = normalizeTimeFormat(startTime);
    if (endTime) round.endTime = normalizeTimeFormat(endTime);
    if (applicationLimit) round.applicationLimit = applicationLimit;
    if (subStages || subStagesArray || days || daysArray) {
      const stagesToUse = subStages || subStagesArray || days || daysArray || [];
      round.subStages = stagesToUse.map(sub => ({
        fromDate: sub.fromDate || sub.fromdate || sub.date,
        startTime: normalizeTimeFormat(sub.startTime),
        endTime: normalizeTimeFormat(sub.endTime),
        breakTime: sub.breakTime || 0
      }));
    }
    if (req.body.description !== undefined) round.description = req.body.description;
    if (req.body.fromdate) round.fromdate = req.body.fromdate;
    if (req.body.todate) round.todate = req.body.todate;
    if (req.body.fromDate) round.fromdate = req.body.fromDate;
    if (req.body.toDate) round.todate = req.body.toDate;
    
    await round.save();
    
    const roundWithDayAliases = {
      ...round.toObject(),
      days: round.subStages || [],
      daysArray: round.subStages || []
    };
    res.json({ success: true, message: 'Interview round updated successfully', round: roundWithDayAliases });
  } catch (error) {
    console.error('Update interview round error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteInterviewRound = async (req, res) => {
  try {
    const { roundId } = req.params;
    
    // Find the round and verify it belongs to employer's job
    const round = await InterviewRound.findById(roundId).populate('job_id');
    if (!round) {
      return res.status(404).json({ success: false, message: 'Interview round not found' });
    }
    
    if (round.job_id.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    await InterviewRound.findByIdAndDelete(roundId);
    
    res.json({ success: true, message: 'Interview round deleted successfully' });
  } catch (error) {
    console.error('Delete interview round error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
