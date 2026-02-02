const jwt = require('jsonwebtoken');
const Candidate = require('../models/Candidate');
const CandidateProfile = require('../models/CandidateProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Message = require('../models/Message');
const InterviewProcess = require('../models/InterviewProcess');
const { createProfileCompletionNotification } = require('./notificationController');
const { sendWelcomeEmail, sendJobApplicationConfirmationEmail } = require('../utils/emailService');
const { checkEmailExists } = require('../utils/authUtils');
const { sendSMS } = require('../utils/smsProvider');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Authentication Controllers
exports.registerCandidate = async (req, res) => {
  try {
    const { name, email, password, phone, sendWelcomeEmail: shouldSendWelcome } = req.body;
    console.log('Registration attempt:', { name, email, phone, shouldSendWelcome });

    const existingUser = await checkEmailExists(email);
    if (existingUser) {
      console.log('Email already exists:', email, 'Role:', existingUser.role);
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create candidate without password - they will create it via email link
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const candidate = await Candidate.create({ 
      name, 
      email: email.trim(), // Preserve original email format, just trim whitespace
      phone,
      registrationMethod: 'email_signup',
      credits: 0,
      status: 'pending',
      phoneOTP: otp,
      phoneOTPExpires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });
    console.log('Candidate created:', candidate._id);
    
    // Send SMS OTP
    await sendSMS(phone, otp, name);
    
    await CandidateProfile.create({ candidateId: candidate._id });
    console.log('Profile created for candidate');

    // Send welcome email with password creation link
    try {
      await sendWelcomeEmail(email, name, 'candidate');
      console.log('Welcome email sent successfully to:', email);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      return res.status(500).json({ success: false, message: 'Failed to send welcome email. Please try again.' });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to create your password and verify your mobile number via OTP sent to your phone.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginCandidate = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Removed console debug line for security;

    const candidate = await Candidate.findByEmail(email.trim());
    if (!candidate) {
      return res.status(401).json({ success: false, message: 'no account found with this email address' });
    }

    if (!candidate.password) {
      return res.status(401).json({ success: false, message: 'Please check your email to create your password first' });
    }

    const passwordMatch = await candidate.comparePassword(password);
    
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    if (candidate.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    const token = generateToken(candidate._id, 'candidate');

    res.json({
      success: true,
      token,
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        credits: candidate.credits || 0
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Profile Controllers
exports.getProfile = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ candidateId: req.user._id })
      .populate('candidateId', 'name email phone');
    
    if (!profile) {
      return res.json({ success: true, profile: null, profileCompletion: 0 });
    }

    const profileData = profile.toObject({ getters: true });
    
    // Calculate total experience from employment records
    const { calculateTotalExperienceFromEmployment } = require('../utils/experienceCalculator');
    const calculatedExperience = calculateTotalExperienceFromEmployment(profileData.employment);
    
    // Calculate profile completion
    const { calculateProfileCompletion, calculateProfileCompletionWithDetails } = require('../utils/profileCompletion');
    const profileCompletion = calculateProfileCompletion(profileData);
    const profileCompletionDetails = calculateProfileCompletionWithDetails(profileData);

    const currentEmployment = profileData.employment?.find(emp => emp.isCurrent || emp.current);
    const currentExp = profileData.experience?.find(exp => exp.current || exp.isCurrent);

    res.json({
      success: true,
      profile: {
        ...profileData,
        currentCompany: currentEmployment?.organization || currentEmployment?.company || currentExp?.company || currentExp?.organization,
        currentLocation: currentEmployment?.location || profileData.location,
        currentCTC: currentEmployment?.presentCTC,
        expectedCTC: currentEmployment?.expectedCTC || profileData.expectedSalary,
        noticePeriod: profileData.jobPreferences?.noticePeriod,
        preferredLocations: profileData.jobPreferences?.preferredLocations,
        resumeFileName: profileData.resumeFileName || null,
        resumeMimeType: profileData.resumeMimeType || null,
        totalExperience: calculatedExperience || profileData.totalExperience,
      },
      profileCompletion,
      profileCompletionDetails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Removed console debug line for security;
    // Removed console debug line for security;
    // Removed console debug line for security;
    
    const { name, phone, email, middleName, lastName, ...profileData } = req.body;
    
    console.log('=== UPDATE PROFILE DEBUG ===');
    console.log('Full req.body:', req.body);
    console.log('Pincode received:', req.body.pincode);
    console.log('Location received:', req.body.location);
    console.log('Profile data (spread):', profileData);
    
    // Validation for middleName and lastName
    const errors = [];
    
    if (middleName && middleName.trim()) {
      if (middleName.length > 30) {
        errors.push({ field: 'middleName', msg: 'Middle name cannot exceed 30 characters' });
      } else if (!/^[a-zA-Z\s]*$/.test(middleName)) {
        errors.push({ field: 'middleName', msg: 'Middle name can only contain letters and spaces' });
      }
    }
    
    if (lastName && lastName.trim()) {
      if (lastName.length > 30) {
        errors.push({ field: 'lastName', msg: 'Last name cannot exceed 30 characters' });
      } else if (!/^[a-zA-Z\s]*$/.test(lastName)) {
        errors.push({ field: 'lastName', msg: 'Last name can only contain letters and spaces' });
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    
    // Update candidate basic info
    if (name || phone || email) {
      const updatedCandidate = await Candidate.findByIdAndUpdate(req.user._id, {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email && { email })
      }, { new: true });
      // Removed console debug line for security;
    }
    
    // Prepare profile update data
    const updateData = { ...profileData };

    if (middleName !== undefined) updateData.middleName = middleName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (req.file) {
      const { fileToBase64 } = require('../middlewares/upload');
      updateData.profilePicture = fileToBase64(req.file);
    }
    
    // Handle skills validation - remove duplicates and empty values
    if (updateData.skills && Array.isArray(updateData.skills)) {
      const uniqueSkills = [...new Set(updateData.skills.filter(skill => skill && skill.trim()))];
      updateData.skills = uniqueSkills;
    }
    
    console.log('Update data before DB save:', updateData);
    console.log('Pincode in updateData:', updateData.pincode);
    
    // Handle job preferences updates
    if (updateData.jobPreferences) {
      console.log('Updating job preferences:', updateData.jobPreferences);
    }
    
    // Handle employment array updates with auto-calculated experience
    if (updateData.employment && Array.isArray(updateData.employment)) {
      const { calculateTotalExperienceFromEmployment } = require('../utils/experienceCalculator');
      const calculatedExperience = calculateTotalExperienceFromEmployment(updateData.employment);
      updateData.totalExperience = calculatedExperience;
    }
    
    // Handle education array updates with marksheet preservation and field normalization
    if (updateData.education && Array.isArray(updateData.education)) {
      const currentProfile = await CandidateProfile.findOne({ candidateId: req.user._id });
      if (currentProfile && currentProfile.education) {
        // Preserve existing marksheets when updating education and normalize field names
        updateData.education = updateData.education.map((newEdu, index) => {
          const existingEdu = currentProfile.education[index];
          return {
            ...newEdu,
            // Ensure consistent field naming for admin display
            passYear: newEdu.passYear || newEdu.yearOfPassing || newEdu.year,
            degreeName: newEdu.degreeName || newEdu.schoolName || newEdu.degree,
            collegeName: newEdu.collegeName || newEdu.location || newEdu.institution,
            percentage: newEdu.percentage || newEdu.score,
            specialization: newEdu.specialization || newEdu.courseName || newEdu.stream,
            registrationNumber: newEdu.registrationNumber || newEdu.enrollmentNumber,
            marksheet: existingEdu?.marksheet || newEdu.marksheet || null
          };
        });
      } else {
        // Normalize field names for new education entries
        updateData.education = updateData.education.map(newEdu => ({
          ...newEdu,
          passYear: newEdu.passYear || newEdu.yearOfPassing || newEdu.year,
          degreeName: newEdu.degreeName || newEdu.schoolName || newEdu.degree,
          collegeName: newEdu.collegeName || newEdu.location || newEdu.institution,
          percentage: newEdu.percentage || newEdu.score,
          specialization: newEdu.specialization || newEdu.courseName || newEdu.stream,
          registrationNumber: newEdu.registrationNumber || newEdu.enrollmentNumber
        }));
      }
    }
    
    // Update profile data
    const profile = await CandidateProfile.findOneAndUpdate(
      { candidateId: req.user._id },
      updateData,
      { new: true, upsert: true }
    ).populate('candidateId', 'name email phone');
    
    // Calculate total experience from employment records
    const { calculateTotalExperienceFromEmployment } = require('../utils/experienceCalculator');
    const profileObject = profile.toObject({ getters: true });
    const calculatedExperience = calculateTotalExperienceFromEmployment(profileObject.employment);
    
    // Calculate profile completion and create notification
    let completionPercentage = 0;
    let profileCompletionDetails = { missingSections: [] };
    try {
      const { calculateProfileCompletion, calculateProfileCompletionWithDetails } = require('../utils/profileCompletion');
      completionPercentage = calculateProfileCompletion(profile);
      profileCompletionDetails = calculateProfileCompletionWithDetails(profile);
      
      // Create notification for significant completion milestones
      if (completionPercentage === 100 || completionPercentage >= 50) {
        await createProfileCompletionNotification(req.user._id, completionPercentage);
      }
    } catch (notifError) {
      console.error('Profile completion notification error:', notifError);
    }
    
    // Return profile with calculated total experience
    const profileResponse = {
      ...profileObject,
      totalExperience: calculatedExperience || profileObject.totalExperience,
    };
    
    res.json({ success: true, profile: profileResponse, profileCompletion: completionPercentage, profileCompletionDetails });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    console.log('Resume upload request received');
    console.log('File info:', req.file ? { size: req.file.size, type: req.file.mimetype, name: req.file.originalname } : 'No file');
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Additional file validation - 15MB limit to account for Base64 encoding overhead
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        success: false, 
        message: 'File size must be less than 15MB. Please compress your file or choose a smaller one.' 
      });
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Only PDF, DOC, and DOCX files are allowed' });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const resumeBase64 = fileToBase64(req.file);

    const profile = await CandidateProfile.findOneAndUpdate(
      { candidateId: req.user._id },
      {
        resume: resumeBase64,
        resumeFileName: req.file.originalname,
        resumeMimeType: req.file.mimetype
      },
      { new: true, upsert: true }
    );

    // Calculate profile completion and create notification
    let completionPercentage = 0;
    let profileCompletionDetails = { missingSections: [] };
    try {
      const { calculateProfileCompletion, calculateProfileCompletionWithDetails } = require('../utils/profileCompletion');
      completionPercentage = calculateProfileCompletion(profile);
      profileCompletionDetails = calculateProfileCompletionWithDetails(profile);
      
      if (completionPercentage === 100 || completionPercentage >= 50) {
        await createProfileCompletionNotification(req.user._id, completionPercentage);
      }
    } catch (notifError) {
      console.error('Profile completion notification error:', notifError);
    }

    console.log('Resume upload successful');
    res.json({ success: true, resume: resumeBase64, profile, profileCompletion: completionPercentage, profileCompletionDetails });
  } catch (error) {
    console.error('Resume upload error:', error);
    
    // Handle multer errors
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
    
    if (error.message && (error.message.includes('too large') || error.message.includes('File size'))) {
      return res.status(400).json({ 
        success: false, 
        message: 'File size is too large. Please upload a file smaller than 15MB.' 
      });
    }
    
    if (error.message && error.message.includes('Only')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to upload resume. Please try again.' 
    });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOneAndUpdate(
      { candidateId: req.user._id },
      {
        $unset: {
          resume: 1,
          resumeFileName: 1,
          resumeMimeType: 1
        }
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Calculate updated profile completion
    let completionPercentage = 0;
    let profileCompletionDetails = { missingSections: [] };
    try {
      const { calculateProfileCompletion, calculateProfileCompletionWithDetails } = require('../utils/profileCompletion');
      completionPercentage = calculateProfileCompletion(profile);
      profileCompletionDetails = calculateProfileCompletionWithDetails(profile);
    } catch (error) {
      console.error('Profile completion calculation error:', error);
    }

    res.json({ 
      success: true, 
      message: 'Resume deleted successfully',
      profile, 
      profileCompletion: completionPercentage, 
      profileCompletionDetails 
    });
  } catch (error) {
    console.error('Resume delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadMarksheet = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Validate file type (but not size)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Only PDF and image files are allowed for marksheet' });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const marksheetBase64 = fileToBase64(req.file);

    res.json({ success: true, filePath: marksheetBase64 });
  } catch (error) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File uploaded successfully' }); // No size limit for marksheet
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadEducationDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Additional file validation - 50MB limit for education documents
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        success: false, 
        message: 'File size must be less than 50MB. Please compress your file or choose a smaller one.' 
      });
    }

    // Validate file type
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Only PDF files are allowed' });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const documentBase64 = fileToBase64(req.file);

    res.json({ success: true, document: documentBase64 });
  } catch (error) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File size must be less than 50MB' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// New endpoint to handle education with marksheet uploads
exports.updateEducationWithMarksheet = async (req, res) => {
  try {
    const { educationIndex, educationData } = req.body;
    let marksheetBase64 = null;

    if (req.file) {
      // Additional file validation - 50MB limit for education documents
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (req.file.size > maxSize) {
        return res.status(400).json({ 
          success: false, 
          message: 'File size must be less than 50MB. Please compress your file or choose a smaller one.' 
        });
      }

      const { fileToBase64 } = require('../middlewares/upload');
      marksheetBase64 = fileToBase64(req.file);
    }

    // Get current profile
    const profile = await CandidateProfile.findOne({ candidateId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Parse education data if it's a string
    let parsedEducationData;
    if (typeof educationData === 'string') {
      try {
        parsedEducationData = JSON.parse(educationData);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid education data format' });
      }
    } else {
      parsedEducationData = educationData;
    }

    // Add marksheet to education data if uploaded
    if (marksheetBase64) {
      parsedEducationData.marksheet = marksheetBase64;
    }

    // Update the specific education entry
    const educationArray = profile.education || [];
    const index = parseInt(educationIndex);
    
    if (index >= 0 && index < educationArray.length) {
      // Update existing education entry
      educationArray[index] = { ...educationArray[index].toObject(), ...parsedEducationData };
    } else {
      // Add new education entry
      educationArray.push(parsedEducationData);
    }

    // Update profile with new education array
    const updatedProfile = await CandidateProfile.findOneAndUpdate(
      { candidateId: req.user._id },
      { education: educationArray },
      { new: true, upsert: true }
    );

    res.json({ success: true, profile: updatedProfile, marksheet: marksheetBase64 });
  } catch (error) {
    console.error('Error updating education with marksheet:', error);
    
    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File size exceeds the 50MB limit. Please upload a smaller file.' 
      });
    }
    
    if (error.message && error.message.includes('Only PDF files are allowed')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// Job Controllers
exports.applyForJob = async (req, res) => {
  try {
    const { jobId: bodyJobId } = req.body;
    const jobId = req.params.jobId || bodyJobId;
    
    return res.status(400).json({ 
      success: false, 
      message: 'Direct application is no longer supported. Please apply through the job detail page with payment of ₹129.' 
    });
  } catch (error) {
    console.error('Error in applyForJob:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAppliedJobs = async (req, res) => {
  try {
    // Set cache-control headers to prevent browser caching
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const applications = await Application.find({ candidateId: req.user._id })
      .populate({
        path: 'jobId',
        select: 'title location jobType status interviewRoundsCount interviewRoundTypes employerId',
        options: { lean: false } // Ensure we get the latest data from DB
      })
      .populate('employerId', 'companyName name')
      .sort({ createdAt: -1 })
      .lean(); // Use lean for better performance

    // Removed console debug line for security;
    if (applications.length > 0) {
      // Removed console debug line for security;
      // Removed console debug line for security;
      // Removed console debug line for security;
    }

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Application Status Controller
exports.getApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.applicationId,
      candidateId: req.user._id
    })
    .populate('jobId', 'title interviewRoundsCount interviewRoundTypes')
    .populate('employerId', 'companyName');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

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
      senderModel: 'Candidate',
      receiverId,
      receiverModel: 'Employer',
      message,
      conversationId
    });

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.respondToInterviewInvite = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { availableDate, availableTime, message } = req.body;
    
    const application = await Application.findOne({
      _id: applicationId,
      candidateId: req.user._id
    })
    .populate('jobId', 'title')
    .populate('employerId', 'companyName email');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Update application with candidate response
    await Application.findByIdAndUpdate(applicationId, {
      candidateResponse: {
        availableDate,
        availableTime,
        message,
        respondedAt: new Date()
      },
      'interviewInvite.status': 'responded'
    });
    
    // Send email notification to employer
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: application.employerId.email,
        subject: `Interview Response - ${application.jobId.title}`,
        html: `
          <h2>Candidate Interview Response</h2>
          <p>Dear ${application.employerId.companyName},</p>
          <p>The candidate <strong>${req.user.name}</strong> has responded to your interview invitation for the position of <strong>${application.jobId.title}</strong>.</p>
          <p><strong>Candidate's Available Date:</strong> ${new Date(availableDate).toLocaleDateString()}</p>
          <p><strong>Candidate's Available Time:</strong> ${availableTime}</p>
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          <p>Please log in to your dashboard to confirm the interview schedule.</p>
          <p>Best regards,<br>Job Portal Team</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }
    
    res.json({ success: true, message: 'Response sent successfully' });
  } catch (error) {
    console.error('Error responding to interview invite:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name')
      .populate('receiverId', 'name companyName')
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Email Check Controller
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await checkEmailExists(email);
    
    res.json({ 
      success: true, 
      exists: !!existingUser 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Password Controller
exports.createPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const candidate = await Candidate.findByEmail(email.trim());
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'no account found with this email address' });
    }

    // For placement candidates, allow password reset instead of creation
    if (candidate.registrationMethod === 'placement') {
      // Update password for placement candidates (they already have one from Excel)
      candidate.password = password;
      candidate.registrationMethod = 'signup'; // Change to signup so password gets hashed
      candidate.status = 'active';
      await candidate.save();
      
      return res.json({ success: true, message: 'Password updated successfully. You can now log in with your new password.' });
    }

    if (candidate.password) {
      return res.status(400).json({ success: false, message: 'Password already set' });
    }

    candidate.password = password;
    candidate.status = 'active';
    candidate.registrationMethod = 'signup';
    await candidate.save();

    res.json({ success: true, message: 'Password created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Password Management Controllers
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const candidate = await Candidate.findByEmail(email.trim());
    
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'no account found with this email address' });
    }

    const resetToken = require('crypto').randomBytes(32).toString('hex');
    candidate.resetPasswordToken = resetToken;
    candidate.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await candidate.save();

    const { sendResetEmail } = require('../utils/emailService');
    await sendResetEmail(email, resetToken, 'candidate');

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.confirmResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const candidate = await Candidate.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!candidate) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    candidate.password = newPassword;
    candidate.resetPasswordToken = undefined;
    candidate.resetPasswordExpires = undefined;
    await candidate.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const candidate = await Candidate.findById(req.user._id);
    
    if (!(await candidate.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // For placement candidates, change registration method to 'signup' so password gets hashed
    if (candidate.registrationMethod === 'placement') {
      // Removed console debug line for security;
      candidate.registrationMethod = 'signup';
    }
    
    candidate.password = newPassword;
    await candidate.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePasswordReset = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }

    const candidate = await Candidate.findByEmail(email.trim());
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'no account found with this email address' });
    }
    
    // For placement candidates, change to signup method so password gets hashed
    if (candidate.registrationMethod === 'placement') {
      candidate.registrationMethod = 'signup';
    }
    
    candidate.password = newPassword;
    candidate.markModified('password');
    await candidate.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// OTP-based Password Reset
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const candidate = await Candidate.findByEmail(email.trim());
    
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'no account found with this email address' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    candidate.resetPasswordOTP = otp;
    candidate.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await candidate.save();

    const { sendOTPEmail } = require('../utils/emailService');
    await sendOTPEmail(email, otp, candidate.name);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const candidate = await Candidate.findByEmail(email.trim());

    if (!candidate || candidate.resetPasswordOTP !== otp || (candidate.resetPasswordOTPExpires && candidate.resetPasswordOTPExpires < Date.now())) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (candidate.registrationMethod === 'placement') {
      candidate.registrationMethod = 'signup';
    }

    candidate.password = newPassword;
    candidate.resetPasswordOTP = undefined;
    candidate.resetPasswordOTPExpires = undefined;
    await candidate.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyMobileOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const candidate = await Candidate.findByEmail(email.trim());

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'no account found with this email address' });
    }

    if (candidate.phoneOTP !== otp || (candidate.phoneOTPExpires && candidate.phoneOTPExpires < Date.now())) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    candidate.isPhoneVerified = true;
    candidate.phoneOTP = undefined;
    candidate.phoneOTPExpires = undefined;
    await candidate.save();

    res.json({ success: true, message: 'Mobile number verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const candidateId = req.user._id;
    
    const applied = await Application.countDocuments({ candidateId });
    const inProgress = await Application.countDocuments({ candidateId, status: { $in: ['pending', 'interviewed'] } });
    const shortlisted = await Application.countDocuments({ candidateId, status: 'shortlisted' });
    
    const recentApplications = await Application.find({ candidateId })
      .populate('jobId', 'title location')
      .populate('employerId', 'companyName name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get profile and calculate completion
    const profile = await CandidateProfile.findOne({ candidateId });
    let profileCompletion = 0;
    let profileCompletionDetails = { missingSections: [] };
    if (profile) {
      const { calculateProfileCompletion, calculateProfileCompletionWithDetails } = require('../utils/profileCompletion');
      profileCompletion = calculateProfileCompletion(profile);
      profileCompletionDetails = calculateProfileCompletionWithDetails(profile);
    }
    
    res.json({
      success: true,
      stats: { applied, inProgress, shortlisted },
      recentApplications,
      candidate: { 
        name: req.user.name,
        credits: req.user.credits || 0
      },
      profileCompletion,
      profileCompletionDetails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const candidateId = req.user._id;
    
    const applied = await Application.countDocuments({ candidateId });
    const inProgress = await Application.countDocuments({ candidateId, status: { $in: ['pending', 'interviewed'] } });
    const shortlisted = await Application.countDocuments({ candidateId, status: 'shortlisted' });
    const hired = await Application.countDocuments({ candidateId, status: 'hired' });
    
    const candidate = await Candidate.findById(candidateId)
      .select('name email credits registrationMethod placementId course')
      .populate('placementId', 'name collegeName');
    
    console.log('Dashboard stats - candidate data:', {
      id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      credits: candidate.credits,
      registrationMethod: candidate.registrationMethod,
      placementId: candidate.placementId
    });
    
    // Get profile and calculate completion
    const profile = await CandidateProfile.findOne({ candidateId });
    let profileCompletion = 0;
    let profileCompletionDetails = { missingSections: [] };
    if (profile) {
      const { calculateProfileCompletion, calculateProfileCompletionWithDetails } = require('../utils/profileCompletion');
      profileCompletion = calculateProfileCompletion(profile);
      profileCompletionDetails = calculateProfileCompletionWithDetails(profile);
    }
    
    const responseData = {
      success: true,
      stats: { applied, inProgress, shortlisted, hired },
      candidate: { 
        name: candidate.name,
        credits: candidate.credits || 0,
        registrationMethod: candidate.registrationMethod || 'signup',
        placement: candidate.placementId ? {
          name: candidate.placementId.name,
          collegeName: candidate.placementId.collegeName
        } : null
      },
      profileCompletion,
      profileCompletionDetails
    };
    
    console.log('Dashboard stats response:', responseData);
    
    res.json(responseData);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to get assessment timer information
function getAssessmentTimerInfo(job) {
  if (!job?.assessmentId || !job?.assessmentStartDate || !job?.assessmentEndDate) {
    return null;
  }

  const now = new Date();
  const startDate = new Date(job.assessmentStartDate);
  const endDate = new Date(job.assessmentEndDate);
  
  // Parse start and end times if available
  let startTime = null;
  let endTime = null;
  
  if (job.assessmentStartTime) {
    const [hours, minutes] = job.assessmentStartTime.split(':');
    startTime = { hours: parseInt(hours), minutes: parseInt(minutes) };
  }
  
  if (job.assessmentEndTime) {
    const [hours, minutes] = job.assessmentEndTime.split(':');
    endTime = { hours: parseInt(hours), minutes: parseInt(minutes) };
  }
  
  // Create full datetime objects for start and end
  let assessmentStart = new Date(startDate);
  let assessmentEnd = new Date(endDate);
  
  if (startTime) {
    assessmentStart.setHours(startTime.hours, startTime.minutes, 0, 0);
  }
  
  if (endTime) {
    assessmentEnd.setHours(endTime.hours, endTime.minutes, 0, 0);
  }
  
  const isBeforeStart = now < assessmentStart;
  const isAfterEnd = now > assessmentEnd;
  const isActive = !isBeforeStart && !isAfterEnd;
  
  let timeRemaining = null;
  let timeUntilStart = null;
  
  if (isBeforeStart) {
    timeUntilStart = Math.max(0, assessmentStart.getTime() - now.getTime());
  } else if (isActive) {
    timeRemaining = Math.max(0, assessmentEnd.getTime() - now.getTime());
  }
  
  return {
    startDate: assessmentStart,
    endDate: assessmentEnd,
    startTime: job.assessmentStartTime,
    endTime: job.assessmentEndTime,
    isBeforeStart,
    isAfterEnd,
    isActive,
    timeRemaining,
    timeUntilStart
  };
}

exports.getCandidateApplicationsWithInterviews = async (req, res) => {
  try {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    console.log(`Fetching applications for candidate: ${req.user._id}`);

    const applications = await Application.find({ candidateId: req.user._id })
      .populate({
        path: 'jobId',
        select: 'title location jobType status interviewRoundsCount interviewRoundTypes interviewRoundDetails interviewRoundOrder assessmentId assessmentStartDate assessmentEndDate assessmentStartTime assessmentEndTime assessmentInstructions assessmentPassingPercentage',
        options: { lean: true }
      })
      .populate('employerId', 'companyName name')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${applications.length} applications`);

    const applicationsWithInterviewProcess = await Promise.all(
      applications.map(async (app) => {
        const interviewProcess = await InterviewProcess.findOne({ applicationId: app._id }).lean();
        const assessmentTimerInfo = getAssessmentTimerInfo(app.jobId);
        
        // Log assessment ID for debugging
        if (app.jobId?.assessmentId) {
          console.log(`Job ${app.jobId._id} has assessmentId:`, app.jobId.assessmentId, 'Type:', typeof app.jobId.assessmentId);
        }
        
        // Check if there's an assessment attempt for this application
        let assessmentAttempt = null;
        if (app.jobId?.assessmentId) {
          const AssessmentAttempt = require('../models/AssessmentAttempt');
          assessmentAttempt = await AssessmentAttempt.findOne({
            applicationId: app._id,
            candidateId: req.user._id,
            assessmentId: app.jobId.assessmentId
          }).lean();
          
          if (assessmentAttempt) {
            console.log(`Found assessment attempt for app ${app._id}: status=${assessmentAttempt.status}`);
          }
        }
        
        return {
          ...app,
          assessmentStatus: app.assessmentStatus || 'not_required',
          assessmentScore: app.assessmentScore || null,
          assessmentPercentage: app.assessmentPercentage || null,
          assessmentResult: app.assessmentResult || null,
          assessmentAttempt: assessmentAttempt,
          assessmentTimerInfo,
          interviewProcess: interviewProcess
        };
      })
    );

    res.json({ success: true, applications: applicationsWithInterviewProcess });
  } catch (error) {
    console.error('Error fetching candidate applications:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get candidate's complete profile including Excel data
// Get all interview process details for candidate dashboard
exports.getAllInterviewProcessDetails = async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id })
      .populate({
        path: 'jobId',
        select: 'title interviewRoundTypes interviewRoundDetails interviewRoundOrder dynamicInterviewRounds assessmentId assessmentStartDate assessmentEndDate'
      })
      .populate('employerId', 'companyName name')
      .sort({ createdAt: -1 });

    const interviewProcesses = applications.map(application => {
      const job = application.jobId;
      if (!job) return null;

      const interviewProcess = {
        applicationId: application._id,
        jobTitle: job.title,
        companyName: application.employerId?.companyName,
        applicationStatus: application.status,
        rounds: []
      };

      // Process rounds based on the order they were added
      if (job.interviewRoundOrder && job.interviewRoundOrder.length > 0) {
        job.interviewRoundOrder.forEach((uniqueKey, index) => {
          const roundType = job.interviewRoundTypes[uniqueKey];
          
          if (roundType === 'assessment' && job.assessmentId) {
            // Add assessment round
            interviewProcess.rounds.push({
              type: 'Assessment',
              description: 'Technical Assessment',
              fromDate: job.assessmentStartDate,
              toDate: job.assessmentEndDate,
              time: null,
              status: application.assessmentStatus || 'not_required',
              order: index + 1
            });
          } else if (roundType && job.interviewRoundDetails[uniqueKey]) {
            // Add other interview rounds
            const details = job.interviewRoundDetails[uniqueKey];
            const roundTypeNames = {
              technical: 'Technical',
              oneOnOne: 'One – On – One',
              panel: 'Panel',
              group: 'Group',
              situational: 'Situational / Behavioral',
              others: 'Others – Specify.',
              assessment: 'Assessment'
            };
            
            if (details.description || details.fromDate || details.toDate) {
              interviewProcess.rounds.push({
                type: roundTypeNames[roundType] || roundType,
                description: details.description || '',
                fromDate: details.fromDate,
                toDate: details.toDate,
                time: details.time || '',
                status: 'scheduled',
                order: index + 1
              });
            }
          }
        });
      }

      // Sort rounds by order
      interviewProcess.rounds.sort((a, b) => a.order - b.order);
      
      return interviewProcess;
    }).filter(Boolean);

    res.json({ success: true, interviewProcesses });
  } catch (error) {
    console.error('Error getting all interview process details:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCandidateCompleteProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user._id)
      .select('name email phone course credits registrationMethod placementId fileId')
      .populate('placementId', 'name collegeName');
    
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'no account found with this email address' });
    }

    const profile = await CandidateProfile.findOne({ candidateId: req.user._id });
    
    // If candidate was created from placement Excel, get additional data
    let excelData = null;
    if ((candidate.registrationMethod === 'placement' || candidate.placementId) && candidate.fileId) {
      try {
        const Placement = require('../models/Placement');
        const placement = await Placement.findById(candidate.placementId);
        if (placement && placement.fileHistory) {
          const file = placement.fileHistory.id(candidate.fileId);
          if (file && file.fileData) {
            // Parse Excel data to get original candidate information
            const XLSX = require('xlsx');
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
            
            // Find this candidate's row in the Excel data
            const candidateRow = jsonData.find(row => {
              const rowEmail = row.Email || row.email || row.EMAIL;
              return rowEmail && rowEmail.toLowerCase() === candidate.email.toLowerCase();
            });
            
            if (candidateRow) {
              excelData = {
                id: candidateRow.ID || candidateRow.id || candidateRow.Id || '',
                originalName: candidateRow['Candidate Name'] || candidateRow['candidate name'] || candidateRow['CANDIDATE NAME'] || candidateRow.Name || candidateRow.name || candidateRow.NAME,
                collegeName: candidateRow['College Name'] || candidateRow['college name'] || candidateRow['COLLEGE NAME'] || candidateRow.College || candidateRow.college || candidateRow.COLLEGE,
                course: candidateRow.Course || candidateRow.course || candidateRow.COURSE || candidateRow.Branch || candidateRow.branch || candidateRow.BRANCH,
                originalCredits: parseInt(candidateRow['Credits Assigned'] || candidateRow['credits assigned'] || candidateRow['CREDITS ASSIGNED'] || candidateRow.Credits || candidateRow.credits || candidateRow.CREDITS || 0)
              };
            }
          }
        }
      } catch (excelError) {
        console.error('Error parsing Excel data for candidate:', excelError);
      }
    }
    
    res.json({
      success: true,
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        course: candidate.course,
        credits: candidate.credits,
        registrationMethod: candidate.registrationMethod,
        placement: candidate.placementId ? {
          name: candidate.placementId.name,
          collegeName: candidate.placementId.collegeName
        } : null
      },
      profile,
      excelData
    });
  } catch (error) {
    console.error('Error getting complete candidate profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get recommended jobs based on candidate skills
exports.getRecommendedJobs = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ candidateId: req.user._id });
    
    if (!profile || !profile.skills || profile.skills.length === 0) {
      return res.json({ success: true, jobs: [] });
    }

    // Get active jobs that match candidate skills
    const jobs = await Job.find({
      status: 'active',
      requiredSkills: { $in: profile.skills }
    })
    .populate('employerId', 'companyName')
    .sort({ createdAt: -1 })
    .limit(10);

    // Calculate skill match score for each job
    const jobsWithScore = jobs.map(job => {
      const jobObj = job.toObject();
      const matchingSkills = job.requiredSkills.filter(skill => 
        profile.skills.includes(skill)
      );
      const matchScore = Math.round((matchingSkills.length / job.requiredSkills.length) * 100);
      
      return {
        ...jobObj,
        matchingSkills,
        matchScore
      };
    });

    // Sort by match score (highest first)
    jobsWithScore.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, jobs: jobsWithScore });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Education Management Controllers
exports.addEducation = async (req, res) => {
  try {
    const { schoolName, location, passoutYear, percentage, cgpa, sgpa, grade } = req.body;
    
    if (!schoolName || !location || !passoutYear || !percentage) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    let marksheetBase64 = null;
    if (req.file) {
      // Additional file validation - 50MB limit for education documents
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (req.file.size > maxSize) {
        return res.status(400).json({ 
          success: false, 
          message: 'File size must be less than 50MB. Please compress your file or choose a smaller one.' 
        });
      }

      const { fileToBase64 } = require('../middlewares/upload');
      marksheetBase64 = fileToBase64(req.file);
    }

    const educationData = {
      degreeName: schoolName,
      collegeName: location,
      passYear: passoutYear,
      percentage,
      cgpa,
      sgpa,
      grade,
      marksheet: marksheetBase64
    };

    const profile = await CandidateProfile.findOneAndUpdate(
      { candidateId: req.user._id },
      { $push: { education: educationData } },
      { new: true, upsert: true }
    );

    res.json({ success: true, education: educationData, profile });
  } catch (error) {
    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File size exceeds the 50MB limit. Please upload a smaller file.' 
      });
    }
    
    if (error.message && error.message.includes('Only PDF files are allowed')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get interview process details for a specific application (enhanced version)
exports.getApplicationInterviewDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findOne({
      _id: applicationId,
      candidateId: req.user._id
    })
    .populate({
      path: 'jobId',
      select: 'title interviewRoundTypes interviewRoundDetails interviewRoundOrder dynamicInterviewRounds assessmentId assessmentStartDate assessmentEndDate'
    })
    .populate('employerId', 'companyName');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const job = application.jobId;
    const interviewDetails = {
      applicationId: application._id,
      jobTitle: job.title,
      companyName: application.employerId?.companyName,
      applicationStatus: application.status,
      appliedDate: application.createdAt || application.appliedAt,
      rounds: []
    };

    // Process rounds based on the order they were added
    if (job.interviewRoundOrder && job.interviewRoundOrder.length > 0) {
      job.interviewRoundOrder.forEach((uniqueKey, index) => {
        const roundType = job.interviewRoundTypes[uniqueKey];
        
        if (roundType === 'assessment' && job.assessmentId) {
          // Add assessment round with detailed info
          interviewDetails.rounds.push({
            type: 'Assessment',
            description: 'Technical Assessment - Complete the online assessment within the given timeframe',
            fromDate: job.assessmentStartDate,
            toDate: job.assessmentEndDate,
            time: 'Available 24/7 during the assessment period',
            status: application.assessmentStatus || 'not_required',
            order: index + 1,
            assessmentId: job.assessmentId,
            isAssessment: true
          });
        } else if (roundType && job.interviewRoundDetails[uniqueKey]) {
          // Add other interview rounds with detailed info
          const details = job.interviewRoundDetails[uniqueKey];
            const roundTypeNames = {
              technical: 'Technical',
              oneOnOne: 'One – On – One',
              panel: 'Panel',
              group: 'Group',
              situational: 'Situational / Behavioral',
              others: 'Others – Specify.',
              assessment: 'Assessment'
            };
          
          if (details.description || details.fromDate || details.toDate) {
            interviewDetails.rounds.push({
              type: roundTypeNames[roundType] || roundType,
              description: details.description || `${roundTypeNames[roundType]} - Please be prepared for this interview stage`,
              fromDate: details.fromDate,
              toDate: details.toDate,
              time: details.time || 'Time will be communicated separately',
              status: 'scheduled',
              order: index + 1,
              isAssessment: false
            });
          }
        }
      });
    }

    // Sort rounds by order
    interviewDetails.rounds.sort((a, b) => a.order - b.order);

    res.json({ success: true, interviewDetails });
  } catch (error) {
    console.error('Error getting application interview details:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEducation = async (req, res) => {
  try {
    const { educationId } = req.params;

    const profile = await CandidateProfile.findOneAndUpdate(
      { candidateId: req.user._id },
      { $pull: { education: { _id: educationId } } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Work Location Preferences Controller
exports.updateWorkLocationPreferences = async (req, res) => {
  try {
    const { preferredLocations, remoteWork, willingToRelocate, noticePeriod, jobType } = req.body;
    
    // Validation
    if (!preferredLocations || !Array.isArray(preferredLocations) || preferredLocations.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one preferred location is required' });
    }

    const updateData = {
      jobPreferences: {
        preferredLocations,
        remoteWork: Boolean(remoteWork),
        willingToRelocate: Boolean(willingToRelocate),
        noticePeriod: noticePeriod || '',
        jobType: jobType || ''
      }
    };

    const profile = await CandidateProfile.findOneAndUpdate(
      { candidateId: req.user._id },
      updateData,
      { new: true, upsert: true }
    ).populate('candidateId', 'name email phone');

    res.json({ success: true, profile, message: 'Work location preferences saved successfully' });
  } catch (error) {
    console.error('Work location preferences update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Work Location Preferences Controller
exports.getWorkLocationPreferences = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ candidateId: req.user._id })
      .select('jobPreferences expectedSalary')
      .populate('candidateId', 'name email phone');
    
    if (!profile) {
      return res.json({ 
        success: true, 
        workLocationData: {
          preferredLocations: [],
          remoteWork: false,
          willingToRelocate: false,
          noticePeriod: '',
          jobType: ''
        }
      });
    }

    const workLocationData = {
      preferredLocations: profile.jobPreferences?.preferredLocations || [],
      remoteWork: profile.jobPreferences?.remoteWork || false,
      willingToRelocate: profile.jobPreferences?.willingToRelocate || false,
      noticePeriod: profile.jobPreferences?.noticePeriod || '',
      jobType: profile.jobPreferences?.jobType || ''
    };

    res.json({ success: true, workLocationData });
  } catch (error) {
    console.error('Get work location preferences error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assessment violation logging
exports.logAssessmentViolation = async (req, res) => {
  try {
    const { attemptId, violationType, timestamp, details } = req.body;

    if (!attemptId || !violationType || !timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Attempt ID, violation type, and timestamp are required'
      });
    }

    const AssessmentAttempt = require('../models/AssessmentAttempt');

    // Verify the attempt belongs to the authenticated candidate
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Assessment attempt not found or access denied'
      });
    }

    // Add violation to the attempt
    const violation = {
      type: violationType,
      timestamp: new Date(timestamp),
      details: details || ''
    };

    attempt.violations.push(violation);

    // If this is a terminating violation, update status
    const terminatingViolations = ['tab_switch', 'window_minimize', 'copy_paste', 'right_click'];
    if (terminatingViolations.includes(violationType)) {
      attempt.status = 'terminated';
      attempt.endTime = new Date();
    }

    await attempt.save();

    res.json({
      success: true,
      message: 'Violation logged successfully',
      violation: violation,
      terminated: terminatingViolations.includes(violationType)
    });

  } catch (error) {
    console.error('Error logging assessment violation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log violation',
      error: error.message
    });
  }
};

// Get comprehensive interview process details for a specific application
exports.getInterviewProcessDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findOne({
      _id: applicationId,
      candidateId: req.user._id
    })
    .populate({
      path: 'jobId',
      select: 'title interviewRoundTypes interviewRoundDetails interviewRoundOrder dynamicInterviewRounds assessmentId assessmentStartDate assessmentEndDate'
    })
    .populate('employerId', 'companyName')
    .populate('interviewProcessId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // If we have a comprehensive interview process, return that
    if (application.interviewProcessId) {
      const interviewProcess = await InterviewProcess.findById(application.interviewProcessId)
        .populate('jobId', 'title')
        .populate('employerId', 'companyName name')
        .populate('candidateId', 'name email');
      
      if (interviewProcess) {
        return res.json({ 
          success: true, 
          interviewProcess: {
            ...interviewProcess.toObject(),
            completionPercentage: interviewProcess.completionPercentage
          }
        });
      }
    }

    // Fallback to legacy format for backward compatibility
    const job = application.jobId;
    const interviewProcess = {
      applicationId: application._id,
      jobTitle: job.title,
      companyName: application.employerId?.companyName,
      applicationStatus: application.status,
      processStatus: 'not_started',
      stages: [],
      totalStages: 0,
      completedStages: 0,
      completionPercentage: 0
    };

    // Convert legacy data to new format
    let stageOrder = 1;
    
    // Process rounds based on the order they were added
    if (job.interviewRoundOrder && job.interviewRoundOrder.length > 0) {
      job.interviewRoundOrder.forEach((uniqueKey) => {
        const roundType = job.interviewRoundTypes[uniqueKey];
        
        if (roundType === 'assessment' && job.assessmentId) {
          interviewProcess.stages.push({
            stageType: 'assessment',
            stageName: 'Technical Assessment',
            stageOrder: stageOrder++,
            fromDate: job.assessmentStartDate,
            toDate: job.assessmentEndDate,
            status: application.assessmentStatus || 'pending',
            assessmentId: job.assessmentId,
            assessmentScore: application.assessmentScore,
            assessmentPercentage: application.assessmentPercentage,
            assessmentResult: application.assessmentResult,
            description: 'Complete the technical assessment within the given timeframe'
          });
        } else if (roundType && job.interviewRoundDetails[uniqueKey]) {
          const details = job.interviewRoundDetails[uniqueKey];
            const roundTypeNames = {
              technical: 'Technical',
              oneOnOne: 'One – On – One',
              panel: 'Panel',
              group: 'Group',
              situational: 'Situational / Behavioral',
              others: 'Others – Specify.',
              assessment: 'Assessment'
            };
          
          if (details.description || details.fromDate || details.toDate) {
            interviewProcess.stages.push({
              stageType: roundType,
              stageName: roundTypeNames[roundType] || roundType,
              stageOrder: stageOrder++,
              fromDate: details.fromDate,
              toDate: details.toDate,
              scheduledTime: details.time,
              location: details.location,
              interviewerName: details.interviewerName,
              status: 'scheduled',
              description: details.description || `${roundTypeNames[roundType]} interview stage`
            });
          }
        }
      });
    }

    interviewProcess.totalStages = interviewProcess.stages.length;
    interviewProcess.completedStages = interviewProcess.stages.filter(stage => 
      stage.status === 'completed' || stage.status === 'passed'
    ).length;
    interviewProcess.completionPercentage = interviewProcess.totalStages > 0 ? 
      Math.round((interviewProcess.completedStages / interviewProcess.totalStages) * 100) : 0;

    res.json({ success: true, interviewProcess });
  } catch (error) {
    console.error('Error getting interview process details:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create or update interview process for an application
exports.createOrUpdateInterviewProcess = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { stages, processStatus, finalDecision, finalFeedback } = req.body;
    
    const application = await Application.findOne({
      _id: applicationId,
      candidateId: req.user._id
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const InterviewProcess = require('../models/InterviewProcess');
    
    let interviewProcess;
    if (application.interviewProcessId) {
      // Update existing process
      interviewProcess = await InterviewProcess.findById(application.interviewProcessId);
      if (stages) interviewProcess.stages = stages;
      if (processStatus) interviewProcess.processStatus = processStatus;
      if (finalDecision) interviewProcess.finalDecision = finalDecision;
      if (finalFeedback) interviewProcess.finalFeedback = finalFeedback;
      
      interviewProcess.updateProcessStatus();
      await interviewProcess.save();
    } else {
      // Create new process
      interviewProcess = new InterviewProcess({
        applicationId: application._id,
        jobId: application.jobId,
        candidateId: application.candidateId,
        employerId: application.employerId,
        stages: stages || [],
        processStatus: processStatus || 'not_started',
        finalDecision: finalDecision || 'pending',
        finalFeedback: finalFeedback || ''
      });
      
      interviewProcess.updateProcessStatus();
      await interviewProcess.save();
      
      // Link to application
      application.interviewProcessId = interviewProcess._id;
      await application.save();
    }

    res.json({ 
      success: true, 
      interviewProcess: {
        ...interviewProcess.toObject(),
        completionPercentage: interviewProcess.completionPercentage
      }
    });
  } catch (error) {
    console.error('Error creating/updating interview process:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all interview processes for the candidate
exports.getAllCandidateInterviewProcesses = async (req, res) => {
  try {
    const InterviewProcess = require('../models/InterviewProcess');
    
    const interviewProcesses = await InterviewProcess.find({ candidateId: req.user._id })
      .populate('jobId', 'title location')
      .populate('employerId', 'companyName name')
      .populate('applicationId', 'status createdAt')
      .sort({ createdAt: -1 });

    const processesWithCompletion = interviewProcesses.map(process => ({
      ...process.toObject(),
      completionPercentage: process.completionPercentage
    }));

    res.json({ success: true, interviewProcesses: processesWithCompletion });
  } catch (error) {
    console.error('Error getting candidate interview processes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update stage status in interview process
exports.updateInterviewStageStatus = async (req, res) => {
  try {
    const { applicationId, stageIndex } = req.params;
    const { status, feedback, notes } = req.body;
    
    const application = await Application.findOne({
      _id: applicationId,
      candidateId: req.user._id
    });

    if (!application || !application.interviewProcessId) {
      return res.status(404).json({ success: false, message: 'Interview process not found' });
    }

    const InterviewProcess = require('../models/InterviewProcess');
    const interviewProcess = await InterviewProcess.findById(application.interviewProcessId);
    
    if (!interviewProcess) {
      return res.status(404).json({ success: false, message: 'Interview process not found' });
    }

    const stageIdx = parseInt(stageIndex);
    if (stageIdx < 0 || stageIdx >= interviewProcess.stages.length) {
      return res.status(400).json({ success: false, message: 'Invalid stage index' });
    }

    // Update stage
    if (status) {
      interviewProcess.updateStageStatus(stageIdx, status, notes, req.user._id, 'Candidate');
    }
    if (feedback) {
      interviewProcess.stages[stageIdx].candidateNotes = feedback;
    }

    await interviewProcess.save();

    res.json({ 
      success: true, 
      interviewProcess: {
        ...interviewProcess.toObject(),
        completionPercentage: interviewProcess.completionPercentage
      }
    });
  } catch (error) {
    console.error('Error updating interview stage status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};