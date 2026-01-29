const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Placement = require('../models/Placement');
const Candidate = require('../models/Candidate');
const CandidateProfile = require('../models/CandidateProfile');
const PlacementCandidate = require('../models/PlacementCandidate');
const { createNotification } = require('./notificationController');
const { sendWelcomeEmail, sendApprovalEmail, sendPlacementCandidateWelcomeEmail } = require('../utils/emailService');
const XLSX = require('xlsx');
const { base64ToBuffer } = require('../utils/base64Helper');
const { emitCreditUpdate, emitBulkCreditUpdate } = require('../utils/websocket');
const { checkEmailExists } = require('../utils/authUtils');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

exports.registerPlacement = async (req, res) => {
  try {
    const { name, email, password, phone, collegeName, collegeAddress, collegeOfficialEmail, collegeOfficialPhone, sendWelcomeEmail: shouldSendEmail } = req.body;

    const existingUser = await checkEmailExists(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // If sendWelcomeEmail is true, create placement without password
    if (shouldSendEmail) {
      if (!name || !email || !phone || !collegeName) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name, email, phone, and college name are required' 
        });
      }

      const placementData = { 
        name: name.trim(), 
        email: email.toLowerCase().trim(), 
        phone: phone.trim(), 
        collegeName: collegeName.trim()
      };
      const placement = await Placement.create(placementData);
      
      // Create notification for admin
      try {
        await createNotification({
          title: 'New Placement Officer Registration',
          message: `${placement.name} from ${placement.collegeName} has registered as a placement officer.`,
          type: 'placement_registered',
          role: 'admin',
          relatedId: placement._id,
          createdBy: placement._id
        });
      } catch (notifError) {
        console.error('Failed to create registration notification:', notifError);
      }

      // Send welcome email
      try {
        await sendWelcomeEmail(placement.email, placement.name, 'placement', placement.collegeName);
      } catch (emailError) {
        console.error('Welcome email failed for placement officer:', emailError);
        return res.status(500).json({ success: false, message: 'Failed to send welcome email' });
      }

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to create your password.'
      });
    }

    // Original registration with password
    if (!name || !email || !password || !phone || !collegeName) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required: name, email, password, phone, collegeName' 
      });
    }

    const placementData = { 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password: password.trim(), 
      phone: phone.trim(), 
      collegeName: collegeName.trim() 
    };
    const placement = await Placement.create(placementData);
    
    // Create notification for admin
    try {
      await createNotification({
        title: 'New Placement Officer Registration',
        message: `${placement.name} from ${placement.collegeName} has registered as a placement officer.`,
        type: 'placement_registered',
        role: 'admin',
        relatedId: placement._id,
        createdBy: placement._id
      });
    } catch (notifError) {
      console.error('Failed to create registration notification:', notifError);
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(placement.email, placement.name, 'placement', placement.collegeName);
    } catch (emailError) {
      console.error('Welcome email failed for placement officer:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please wait for admin approval before you can sign in.',
      placement: {
        id: placement._id,
        name: placement.name,
        email: placement.email,
        phone: placement.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const placement = await Placement.findByEmail(normalizedEmail);

    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    if (placement.password) {
      return res.status(400).json({ success: false, message: 'Password already set' });
    }

    placement.password = password;
    // Keep status as 'pending' - admin approval still required
    // placement.status remains 'pending' until admin approves
    await placement.save();

    res.json({ 
      success: true, 
      message: 'Password created successfully. Please wait for admin approval before you can sign in.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload student data file after registration
exports.uploadStudentData = async (req, res) => {
  try {
    console.log('=== UPLOAD STUDENT DATA ===');
    console.log('User ID:', req.user?.id);
    console.log('File info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');
    console.log('Body:', req.body);
    
    const placementId = req.user.id;
    const { customFileName, university, batch } = req.body;
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Check if placement officer has uploaded college logo
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }
    
    if (!placement.logo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please upload your College Logo to continue.',
        requiresLogo: true
      });
    }

    console.log('File upload:', {
      originalname: req.file.originalname,
      customFileName: customFileName,
      university: university,
      batch: batch,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Validate file content before processing
    const { validateExcelContent } = require('../middlewares/upload');
    const validation = validateExcelContent(req.file.buffer, req.file.mimetype);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: `${validation.message}. Please upload a file with actual student data.` 
      });
    }
    
    console.log(`File validation passed: ${validation.rowCount} rows found`);

    // Check for duplicate emails and IDs in the uploaded file
    const XLSX = require('xlsx');
    let workbook;
    if (req.file.mimetype.includes('csv')) {
      const csvData = req.file.buffer.toString('utf8');
      workbook = XLSX.read(csvData, { type: 'string' });
    } else {
      workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Extract emails and IDs and check for duplicates
    const emails = [];
    const ids = [];
    const duplicateEmails = [];
    const duplicateIds = [];
    const existingEmails = [];
    
    for (const row of jsonData) {
      const email = (row.Email || row.email || row.EMAIL || '').toString().trim().toLowerCase();
      const id = (row.ID || row.id || row.Id || '').toString().trim();
      
      if (email) {
        // Check for duplicates within file
        if (emails.includes(email)) {
          if (!duplicateEmails.includes(email)) {
            duplicateEmails.push(email);
          }
        } else {
          emails.push(email);
          // Check if email exists across platform
          const existingUser = await checkEmailExists(email);
          if (existingUser) {
            existingEmails.push(email);
          }
        }
      }
      
      if (id) {
        if (ids.includes(id)) {
          if (!duplicateIds.includes(id)) {
            duplicateIds.push(id);
          }
        } else {
          ids.push(id);
        }
      }
    }
    
    // If duplicates or existing emails found, return error
    if (duplicateEmails.length > 0 || duplicateIds.length > 0 || existingEmails.length > 0) {
      let message = '';
      if (duplicateEmails.length > 0) {
        message += `Duplicate emails found in file: ${duplicateEmails.slice(0, 3).join(', ')}${duplicateEmails.length > 3 ? ` and ${duplicateEmails.length - 3} more` : ''}. `;
      }
      if (duplicateIds.length > 0) {
        message += `Duplicate IDs found in file: ${duplicateIds.slice(0, 3).join(', ')}${duplicateIds.length > 3 ? ` and ${duplicateIds.length - 3} more` : ''}. `;
      }
      if (existingEmails.length > 0) {
        message += `Emails already registered on platform: ${existingEmails.slice(0, 3).join(', ')}${existingEmails.length > 3 ? ` and ${existingEmails.length - 3} more` : ''}. `;
      }
      message += 'Please fix these issues and upload again.';
      
      return res.status(400).json({ 
        success: false, 
        message: message,
        duplicateEmails: duplicateEmails,
        duplicateIds: duplicateIds,
        existingEmails: existingEmails
      });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const studentData = fileToBase64(req.file);
    
    // Removed console debug line for security;
    
    // Add to file history with file data, custom name, university, and batch
    const updatedPlacement = await Placement.findByIdAndUpdate(placementId, {
      $push: {
        fileHistory: {
          fileName: req.file.originalname,
          customName: customFileName && customFileName.trim() ? customFileName.trim() : null,
          university: university && university.trim() ? university.trim() : null,
          batch: batch && batch.trim() ? batch.trim() : null,
          uploadedAt: new Date(),
          status: 'pending',
          fileData: studentData,
          fileType: req.file.mimetype,
          credits: 0
        }
      }
    }, { new: true });
    
    console.log('File added to history, total files:', updatedPlacement.fileHistory.length);

    // Create notification for admin
    try {
      console.log('Creating notification for file upload...');
      const displayName = customFileName && customFileName.trim() ? customFileName.trim() : req.file.originalname;
      let notificationMessage = `${updatedPlacement.name} from ${updatedPlacement.collegeName} has uploaded a new Excel/CSV file: "${displayName}"${customFileName ? ` (${req.file.originalname})` : ''}`;
      
      if (university && university.trim()) {
        notificationMessage += ` - University: ${university.trim()}`;
      }
      if (batch && batch.trim()) {
        notificationMessage += ` - Batch: ${batch.trim()}`;
      }
      
      notificationMessage += '. File validated successfully and waiting for admin approval.';
      
      const notification = await createNotification({
        title: 'New Student Data Uploaded',
        message: notificationMessage,
        type: 'file_uploaded',
        role: 'admin',
        relatedId: placementId,
        createdBy: placementId
      });
      console.log('Notification created successfully:', notification._id);
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
    }

    res.json({
      success: true,
      message: 'Student data uploaded and validated successfully. Waiting for admin approval.',
      fileName: req.file.originalname,
      customName: customFileName && customFileName.trim() ? customFileName.trim() : null,
      university: university && university.trim() ? university.trim() : null,
      batch: batch && batch.trim() ? batch.trim() : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginPlacement = async (req, res) => {
  console.log('=== PLACEMENT LOGIN ===');
  console.log('Body:', req.body);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const placement = await Placement.findByEmail(email.trim());
    console.log('Found placement:', !!placement);
    
    if (!placement) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValid = await placement.comparePassword(password);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (placement.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account is pending admin approval. Please wait for approval before signing in.' 
      });
    }

    const token = generateToken(placement._id, 'placement');

    res.json({
      success: true,
      token,
      placement: {
        id: placement._id,
        name: placement.name,
        email: placement.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get parsed data from Excel/CSV file for viewing
exports.getPlacementData = async (req, res) => {
  try {
    const placementId = req.params.id;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    if (!placement.studentData) {
      return res.json({ success: true, students: [] });
    }

    // Always parse Excel file to show data
    const result = base64ToBuffer(placement.studentData);
    const buffer = result.buffer;

    let workbook;
    if (placement.fileType && placement.fileType.includes('csv')) {
      const csvData = buffer.toString('utf8');
      workbook = XLSX.read(csvData, { type: 'string' });
    } else {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Parse and format data with only required fields
    const students = jsonData.map(row => ({
      id: row.ID || row.id || row.Id || '',
      name: row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['full name'] || row['FULL NAME'] || row['Student Name'] || row['student name'] || row['STUDENT NAME'] || '',
      email: row.Email || row.email || row.EMAIL || '',
      phone: row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '',
      course: row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified',
      password: row.Password || row.password || row.PASSWORD || '',
      credits: parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || placement.credits || 0)
    }));
    
    res.json({
      success: true,
      students: students
    });
    
  } catch (error) {
    console.error('Error getting placement data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process Excel file and create candidates after placement approval
exports.processPlacementApproval = async (req, res) => {
  try {
    const placementId = req.params.id;
    console.log('Processing placement:', placementId);
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    console.log('Placement found:', placement.name);
    console.log('Has student data:', !!placement.studentData);

    if (!placement.studentData) {
      return res.status(400).json({ success: false, message: 'No student data file found' });
    }

    // Parse Excel file
    let buffer;
    try {
      const result = base64ToBuffer(placement.studentData);
      buffer = result.buffer;
    } catch (bufferError) {
      console.error('Buffer conversion error:', bufferError);
      return res.status(400).json({ success: false, message: 'Invalid file format' });
    }

    let workbook;
    try {
      if (placement.fileType && placement.fileType.includes('csv')) {
        const csvData = buffer.toString('utf8');
        workbook = XLSX.read(csvData, { type: 'string' });
      } else {
        workbook = XLSX.read(buffer, { type: 'buffer' });
      }
    } catch (xlsxError) {
      console.error('XLSX parsing error:', xlsxError);
      return res.status(400).json({ success: false, message: 'Failed to parse Excel file' });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Parsed rows:', jsonData.length);
    
    // Validate file has data
    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Oops! Your file seems to be empty. Please make sure your Excel/CSV file contains student information and try uploading again.' 
      });
    }
    
    // Check if all rows are empty
    const hasValidData = jsonData.some(row => {
      return Object.values(row).some(value => 
        value !== null && value !== undefined && String(value).trim() !== ''
      );
    });
    
    if (!hasValidData) {
      return res.status(400).json({ 
        success: false, 
        message: 'It looks like your file only contains headers without any student data. Please add student information to your file and upload again.' 
      });
    }
    
    let createdCount = 0;
    let skippedCount = 0;
    const errors = [];
    
    // Process each row from Excel
    for (const row of jsonData) {
      try {
        // Removed console debug line for security;
        // Extract data from Excel with new field structure (case-insensitive)
        const email = row.Email || row.email || row.EMAIL;
        const password = row.Password || row.password || row.PASSWORD;
        const name = row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['full name'] || row['FULL NAME'] || row['Student Name'] || row['student name'] || row['STUDENT NAME'];
        const phone = row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE;
        const course = row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH;
        const credits = parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || 0);
        
        // Removed console debug line for security;
        
        // Auto-generate missing fields
        if (!email) email = `student${createdCount + 1}@college.edu`;
        if (!password) password = `pwd${Math.random().toString(36).substr(2, 5)}`;
        if (!name) name = `Student ${createdCount + 1}`;
        
        // Check if user already exists in any role
        const existingUser = await checkEmailExists(email);
        if (existingUser) {
          skippedCount++;
          continue;
        }
        
        // Create candidate with file-specific credits
        const finalCredits = credits || placement.credits || 0;
        const collegeName = row['College Name'] || row['college name'] || row['COLLEGE NAME'] || row.College || row.college || row.COLLEGE || placement.collegeName;
        
        // Removed console debug line for security;
        const candidate = await Candidate.create({
          name: name ? name.trim() : '',
          email: email ? email.trim().toLowerCase() : '',
          password: password ? password.trim() : '',
          phone: phone ? phone.toString().trim() : '',
          course: course ? course.trim() : '',
          credits: finalCredits,
          registrationMethod: 'placement',
          placementId: placement._id,
          isVerified: true,
          status: 'active'
        });
        // Removed console debug line for security;
        
        // Create candidate profile with Excel data
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
        
        createdCount++;
      } catch (rowError) {
        console.error('Row processing error:', rowError);
        errors.push(`Error processing row: ${rowError.message}`);
      }
    }
    
    // Create notification
    try {
      console.log('Creating notification for placement processing...');
      const notification = await createNotification({
        title: 'Student Data Approved & Processed',
        message: `${createdCount} candidates have been successfully registered from ${placement.name}'s placement data. ${skippedCount} candidates were skipped (already exist).`,
        type: 'placement_processed',
        role: 'admin',
        relatedId: placementId,
        createdBy: placementId
      });
      console.log('Processing notification created successfully:', notification._id);
    } catch (notifError) {
      console.error('Processing notification creation failed:', notifError);
    }
    
    // Update placement
    await Placement.findByIdAndUpdate(placementId, { 
      isProcessed: true,
      processedAt: new Date(),
      candidatesCreated: createdCount
    });
    
    res.json({
      success: true,
      message: 'Placement data processed successfully',
      stats: {
        created: createdCount,
        skipped: skippedCount,
        errors: errors.length
      },
      errors: errors.slice(0, 10)
    });
    
  } catch (error) {
    console.error('Error processing placement approval:', error);
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};

// Get placement officer's students
exports.getMyStudents = async (req, res) => {
  try {
    const placementId = req.user.id;
    
    // Find candidates created by this placement officer
    const candidates = await Candidate.find({ placementId }).select('name email password phone credits');
    
    const students = candidates.map(candidate => ({
      name: candidate.name,
      email: candidate.email,
      password: candidate.password,
      phone: candidate.phone,
      credits: candidate.credits
    }));
    
    res.json({
      success: true,
      students
    });
    
  } catch (error) {
    console.error('Error getting placement students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get data from specific file
exports.getFileData = async (req, res) => {
  try {
    const { placementId, id, fileId } = req.params;
    const actualPlacementId = placementId || id;
    
    const placement = await Placement.findById(actualPlacementId);
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

    // Parse the specific file data
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
    
    // Handle empty files
    if (!jsonData || jsonData.length === 0) {
      return res.json({ success: true, students: [] });
    }
    
    // Parse and format data with only required fields
    const students = jsonData.map(row => ({
      id: row.ID || row.id || row.Id || '',
      name: row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['full name'] || row['FULL NAME'] || row['Student Name'] || row['student name'] || row['STUDENT NAME'] || '',
      email: row.Email || row.email || row.EMAIL || '',
      phone: row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '',
      course: row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified',
      password: row.Password || row.password || row.PASSWORD || '',
      credits: parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || file.credits || 0)
    }));
    
    res.json({
      success: true,
      students: students
    });
    
  } catch (error) {
    console.error('Error getting file data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update credits for specific file
exports.updateFileCredits = async (req, res) => {
  try {
    const { placementId, id, fileId } = req.params;
    const actualPlacementId = placementId || id;
    const { credits } = req.body;
    
    if (typeof credits !== 'number' || credits < 0 || credits > 10000) {
      return res.status(400).json({ success: false, message: 'Credits must be between 0 and 10000' });
    }
    
    const placement = await Placement.findById(actualPlacementId);
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
    
    // Update all candidates linked to this placement officer
    // Since fileId tracking may not be consistent, update all candidates from this placement
    const updateResult = await Candidate.updateMany(
      { placementId: actualPlacementId },
      { $set: { credits: credits } }
    );
    
    // Emit real-time credit updates to affected candidates
    if (updateResult.modifiedCount > 0) {
      const candidatesToUpdate = await Candidate.find(
        { placementId: actualPlacementId },
        { _id: 1 }
      );
      const candidateIds = candidatesToUpdate.map(c => c._id.toString());
      emitBulkCreditUpdate(candidateIds, credits);
    }
    
    res.json({
      success: true,
      message: `File credits updated successfully. ${updateResult.modifiedCount} candidates updated.`,
      file: {
        id: file._id,
        fileName: file.fileName,
        credits: file.credits
      },
      candidatesUpdated: updateResult.modifiedCount
    });
    
  } catch (error) {
    console.error('Error updating file credits:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process specific file and create candidates
exports.processFileApproval = async (req, res) => {
  try {
    const { id: placementId, fileId } = req.params;
    const { fileName } = req.body;
    
    console.log('=== PROCESS FILE APPROVAL ===');
    console.log('Placement ID:', placementId);
    console.log('File ID:', fileId);
    console.log('File Name:', fileName);
    
    // Validate ObjectId format
    if (!placementId || !mongoose.Types.ObjectId.isValid(placementId)) {
      return res.status(400).json({ success: false, message: `Invalid placement ID format: ${placementId}` });
    }
    
    let placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    const file = placement.fileHistory.id(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (!file.fileData) {
      return res.status(400).json({ success: false, message: 'No file data found' });
    }

    // Parse the specific file
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
    
    // Validate file has data
    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Oops! Your file seems to be empty. Please make sure your Excel/CSV file contains student information and try uploading again.' 
      });
    }
    
    // Check if all rows are empty
    const hasValidData = jsonData.some(row => {
      return Object.values(row).some(value => 
        value !== null && value !== undefined && String(value).trim() !== ''
      );
    });
    
    if (!hasValidData) {
      return res.status(400).json({ 
        success: false, 
        message: 'It looks like your file only contains headers without any student data. Please add student information to your file and upload again.' 
      });
    }
    
    let createdCount = 0;
    let skippedCount = 0;
    const errors = [];
    const createdCandidates = [];
    
    // Check for duplicate emails within the file before processing
    const emailsInFile = [];
    const duplicatesInFile = [];
    
    jsonData.forEach((row, index) => {
      const email = (row.Email || row.email || row.EMAIL || '').toString().trim().toLowerCase();
      if (email) {
        if (emailsInFile.includes(email)) {
          if (!duplicatesInFile.includes(email)) {
            duplicatesInFile.push(email);
          }
        } else {
          emailsInFile.push(email);
        }
      }
    });
    
    if (duplicatesInFile.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot process file: Duplicate emails found within the file: ${duplicatesInFile.join(', ')}. Please fix the duplicates and re-upload the file.`
      });
    }

    // Process each row from Excel
    for (let index = 0; index < jsonData.length; index++) {
      try {
        const row = jsonData[index];
        const email = row.Email || row.email || row.EMAIL;
        const password = row.Password || row.password || row.PASSWORD;
        const name = row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['full name'] || row['FULL NAME'] || row['Student Name'] || row['student name'] || row['STUDENT NAME'];
        const phone = row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE;
        const course = row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH;
        const collegeName = row['College Name'] || row['college name'] || row['COLLEGE NAME'] || row.College || row.college || row.COLLEGE || placement.collegeName;
        

        
        // Check if user already exists in any role
        const existingUser = await checkEmailExists(email);
        if (existingUser) {
          skippedCount++;
          continue;
        }
        
        // Use file-specific credits or individual row credits
        const rowCredits = parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || 0);
        const finalCredits = rowCredits || file.credits || placement.credits || 0;
        
        // Create candidate with plain text password for placement method
        const candidate = await Candidate.create({
          name: name ? name.trim() : '',
          email: email ? email.trim().toLowerCase() : '',
          password: password ? password.trim() : `pwd${Math.random().toString(36).substr(2, 8)}`, // Auto-generate if missing
          phone: phone ? phone.toString().trim() : '',
          course: course ? course.trim() : '',
          credits: finalCredits,
          registrationMethod: 'placement',
          placementId: placement._id,
          fileId: file._id,
          isVerified: true,
          status: 'active'
        });
        
        // Create candidate profile with complete Excel data
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
        await PlacementCandidate.create({
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
          creditsAssigned: finalCredits,
          originalRowData: row
        });
        
        // Send welcome email with login credentials only if password exists in Excel
        if (password && password.trim()) {
          try {
            await sendPlacementCandidateWelcomeEmail(
              email.trim().toLowerCase(),
              name.trim(),
              password.trim(),
              placement.name,
              placement.collegeName,
              finalCredits
            );
          
            // Update placement candidate record to mark email as sent
            await PlacementCandidate.findOneAndUpdate(
              { candidateId: candidate._id },
              { 
                welcomeEmailSent: true,
                welcomeEmailSentAt: new Date()
              }
            );
          } catch (emailError) {
            console.error(`Failed to send welcome email to ${email}:`, emailError);
            // Continue processing even if email fails
          }
        }
        
        createdCandidates.push({
          name: candidate.name,
          email: candidate.email,
          password: password ? password.trim() : 'N/A', // Show actual password from Excel or N/A
          credits: finalCredits
        });
        
        createdCount++;
        // Removed console debug line for security}`);
      } catch (rowError) {
        console.error('Row processing error:', rowError);
        errors.push(`Row ${index + 1}: ${rowError.message}`);
      }
    }
    
    // Update file status using direct MongoDB update
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
    
    // Create notification for successful processing
    try {
      const displayName = file.customName || fileName || file.fileName;
      await createNotification({
        title: 'File Processed Successfully - Candidates Can Login',
        message: `File "${displayName}" has been processed. ${createdCount} candidates created and can now login to candidate dashboard using their email and password from Excel file. ${skippedCount} candidates were skipped (already exist).`,
        type: 'file_processed',
        role: 'admin',
        relatedId: placementId,
        createdBy: placementId
      });
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
    }
    
    const displayName = file.customName || fileName || file.fileName;
    res.json({
      success: true,
      message: `File "${displayName}" processed successfully. ${createdCount} candidates created and can now login to candidate dashboard using their email and password. ${skippedCount} candidates were skipped.`,
      stats: {
        created: createdCount,
        skipped: skippedCount,
        errors: errors.length
      },
      createdCandidates: createdCandidates.slice(0, 10), // Show first 10 created candidates
      errors: errors.slice(0, 10),
      loginInstructions: {
        url: process.env.FRONTEND_URL || 'https://taleglobal.net',
        message: 'Candidates can now login using their email and password from the Excel file (Sign In → Candidate tab)'
      }
    });
    
  } catch (error) {
    console.error('Error processing file approval:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject specific file
exports.rejectFile = async (req, res) => {
  try {
    const { id: placementId, fileId } = req.params;
    const { rejectionReason } = req.body;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    const file = placement.fileHistory.id(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Update file status using direct MongoDB update
    await Placement.findOneAndUpdate(
      { _id: placementId, 'fileHistory._id': fileId },
      { 
        $set: { 
          'fileHistory.$.status': 'rejected',
          'fileHistory.$.rejectionReason': rejectionReason || 'No reason provided',
          'fileHistory.$.processedAt': new Date()
        }
      }
    );
    
    // Create notification for placement officer
    try {
      const displayName = file.customName || file.fileName;
      await createNotification({
        title: 'File Rejected',
        message: `Your uploaded file "${displayName}" has been rejected. Reason: ${rejectionReason || 'No reason provided'}. You can resubmit a corrected version.`,
        type: 'file_rejected',
        role: 'placement',
        placementId: placementId,
        relatedId: placementId,
        createdBy: req.user?.id || 'admin'
      });
    } catch (notifError) {
      console.error('Failed to create rejection notification:', notifError);
    }
    
    const displayName = file.customName || file.fileName;
    res.json({
      success: true,
      message: `File "${displayName}" rejected successfully`
    });
    
  } catch (error) {
    console.error('Error rejecting file:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resubmit rejected file
exports.resubmitFile = async (req, res) => {
  try {
    const placementId = req.user.id;
    const { fileId } = req.params;
    const { customFileName, university, batch } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    const file = placement.fileHistory.id(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.status !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Only rejected files can be resubmitted' });
    }

    // Validate file content
    const { validateExcelContent } = require('../middlewares/upload');
    const validation = validateExcelContent(req.file.buffer, req.file.mimetype);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: `${validation.message}. Please upload a file with actual student data.` 
      });
    }

    // Check for duplicate emails and IDs
    const XLSX = require('xlsx');
    let workbook;
    if (req.file.mimetype.includes('csv')) {
      const csvData = req.file.buffer.toString('utf8');
      workbook = XLSX.read(csvData, { type: 'string' });
    } else {
      workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    const emails = [];
    const ids = [];
    const duplicateEmails = [];
    const duplicateIds = [];
    const existingEmails = [];
    
    for (const row of jsonData) {
      const email = (row.Email || row.email || row.EMAIL || '').toString().trim().toLowerCase();
      const id = (row.ID || row.id || row.Id || '').toString().trim();
      
      if (email) {
        if (emails.includes(email)) {
          if (!duplicateEmails.includes(email)) {
            duplicateEmails.push(email);
          }
        } else {
          emails.push(email);
          const existingUser = await checkEmailExists(email);
          if (existingUser) {
            existingEmails.push(email);
          }
        }
      }
      
      if (id) {
        if (ids.includes(id)) {
          if (!duplicateIds.includes(id)) {
            duplicateIds.push(id);
          }
        } else {
          ids.push(id);
        }
      }
    }
    
    if (duplicateEmails.length > 0 || duplicateIds.length > 0 || existingEmails.length > 0) {
      let message = '';
      if (duplicateEmails.length > 0) {
        message += `Duplicate emails found in file: ${duplicateEmails.slice(0, 3).join(', ')}${duplicateEmails.length > 3 ? ` and ${duplicateEmails.length - 3} more` : ''}. `;
      }
      if (duplicateIds.length > 0) {
        message += `Duplicate IDs found in file: ${duplicateIds.slice(0, 3).join(', ')}${duplicateIds.length > 3 ? ` and ${duplicateIds.length - 3} more` : ''}. `;
      }
      if (existingEmails.length > 0) {
        message += `Emails already registered on platform: ${existingEmails.slice(0, 3).join(', ')}${existingEmails.length > 3 ? ` and ${existingEmails.length - 3} more` : ''}. `;
      }
      message += 'Please fix these issues and resubmit.';
      
      return res.status(400).json({ 
        success: false, 
        message: message,
        duplicateEmails,
        duplicateIds,
        existingEmails
      });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const studentData = fileToBase64(req.file);
    
    // Update the rejected file with new data
    await Placement.findOneAndUpdate(
      { _id: placementId, 'fileHistory._id': fileId },
      { 
        $set: { 
          'fileHistory.$.fileName': req.file.originalname,
          'fileHistory.$.customName': customFileName && customFileName.trim() ? customFileName.trim() : file.customName,
          'fileHistory.$.university': university && university.trim() ? university.trim() : file.university,
          'fileHistory.$.batch': batch && batch.trim() ? batch.trim() : file.batch,
          'fileHistory.$.fileData': studentData,
          'fileHistory.$.fileType': req.file.mimetype,
          'fileHistory.$.status': 'pending',
          'fileHistory.$.isResubmitted': true,
          'fileHistory.$.rejectionReason': null,
          'fileHistory.$.uploadedAt': new Date()
        }
      }
    );
    
    // Create notification for admin
    try {
      const displayName = customFileName && customFileName.trim() ? customFileName.trim() : file.customName || req.file.originalname;
      await createNotification({
        title: 'File Resubmitted',
        message: `${placement.name} has resubmitted the file "${displayName}" after corrections. Please review.`,
        type: 'file_resubmitted',
        role: 'admin',
        relatedId: placementId,
        createdBy: placementId
      });
    } catch (notifError) {
      console.error('Failed to create resubmission notification:', notifError);
    }

    res.json({
      success: true,
      message: 'File resubmitted successfully. Waiting for admin approval.',
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Error resubmitting file:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// View file data for placement officer
exports.viewFileData = async (req, res) => {
  try {
    const placementId = req.user.id; // Get from authenticated user
    const { fileId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    const file = placement.fileHistory.id(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (!file.fileData) {
      return res.json({ success: true, fileData: [] });
    }

    // Parse the specific file data
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
    
    // Handle empty files
    if (!jsonData || jsonData.length === 0) {
      return res.json({ 
        success: true, 
        fileData: [],
        fileName: file.fileName,
        customName: file.customName,
        uploadedAt: file.uploadedAt,
        status: file.status
      });
    }
    
    // Format the data to show only required fields
    const formattedData = jsonData.map(row => ({
      'ID': row.ID || row.id || row.Id || '',
      'Candidate Name': row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['Student Name'] || '',
      'Email': row.Email || row.email || row.EMAIL || '',
      'Phone': row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '',
      'Course': row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified',
      'Password': row.Password || row.password || row.PASSWORD || '',
      'Credits Assigned': row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || '0'
    }));
    
    res.json({
      success: true,
      fileData: formattedData,
      fileName: file.fileName,
      customName: file.customName,
      uploadedAt: file.uploadedAt,
      status: file.status
    });
    
  } catch (error) {
    console.error('Error viewing file data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save dashboard state
exports.saveDashboardState = async (req, res) => {
  try {
    const placementId = req.user.id;
    const { dashboardData } = req.body;
    
    await Placement.findByIdAndUpdate(placementId, {
      $set: {
        lastDashboardState: {
          data: dashboardData,
          timestamp: new Date()
        }
      }
    });
    
    res.json({ success: true, message: 'Dashboard state saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get placement dashboard stats
exports.getPlacementDashboard = async (req, res) => {
  try {
    const placementId = req.user._id || req.user.id;
    
    const placement = await Placement.findById(placementId).select('name collegeName fileHistory');
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }
    
    // Count files by status
    const totalFiles = placement.fileHistory?.length || 0;
    const pendingFiles = placement.fileHistory?.filter(f => f.status === 'pending').length || 0;
    const processedFiles = placement.fileHistory?.filter(f => f.status === 'processed').length || 0;
    
    // Count total candidates created
    let totalCandidates = 0;
    try {
      totalCandidates = await Candidate.countDocuments({ placementId });
    } catch (e) {
      console.error('Error counting candidates:', e);
    }
    
    res.json({
      success: true,
      stats: {
        totalFiles,
        pendingFiles,
        processedFiles,
        totalCandidates
      },
      placementInfo: {
        name: placement.name,
        collegeName: placement.collegeName
      }
    });
  } catch (error) {
    console.error('Error getting placement dashboard:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all candidates created from placement Excel files
exports.getPlacementCandidates = async (req, res) => {
  try {
    const placementId = req.params.id;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }
    
    // Get all candidates created from this placement
    const candidates = await Candidate.find({ placementId })
      .select('name email phone course credits fileId createdAt')
      .sort({ createdAt: -1 });
    
    // Get candidate profiles
    const candidatesWithProfiles = await Promise.all(
      candidates.map(async (candidate) => {
        const profile = await CandidateProfile.findOne({ candidateId: candidate._id })
          .select('collegeName education');
        
        return {
          id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          course: candidate.course,
          credits: candidate.credits,
          createdAt: candidate.createdAt,
          collegeName: profile?.collegeName || placement.collegeName,
          education: profile?.education || []
        };
      })
    );
    
    res.json({
      success: true,
      placement: {
        name: placement.name,
        collegeName: placement.collegeName,
        email: placement.email
      },
      candidates: candidatesWithProfiles,
      totalCandidates: candidatesWithProfiles.length
    });
    
  } catch (error) {
    console.error('Error getting placement candidates:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload logo
exports.uploadLogo = async (req, res) => {
  try {
    const placementId = req.user.id;
    const { logo } = req.body;
    
    if (!logo) {
      return res.status(400).json({ success: false, message: 'Logo data is required' });
    }
    
    await Placement.findByIdAndUpdate(placementId, {
      $set: { logo: logo }
    });
    
    res.json({ success: true, message: 'Logo uploaded successfully' });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload ID card
exports.uploadIdCard = async (req, res) => {
  try {
    const placementId = req.user.id;
    const { idCard } = req.body;
    
    if (!idCard) {
      return res.status(400).json({ success: false, message: 'ID card data is required' });
    }
    
    await Placement.findByIdAndUpdate(placementId, {
      $set: { idCard: idCard }
    });
    
    res.json({ success: true, message: 'ID card uploaded successfully' });
  } catch (error) {
    console.error('Error uploading ID card:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update placement profile
exports.updateProfile = async (req, res) => {
  try {
    const placementId = req.user.id;
    const { name, firstName, lastName, phone, collegeName, collegeAddress, collegeOfficialEmail, collegeOfficialPhone } = req.body;
    
    console.log('=== PROFILE UPDATE REQUEST ===');
    console.log('Placement ID:', placementId);
    console.log('Request body:', { name, firstName, lastName, phone, collegeName, collegeAddress, collegeOfficialEmail, collegeOfficialPhone });
    console.log('User object:', req.user);
    
    // Validate required fields
    if (!firstName || !lastName || !phone || !collegeName || !collegeAddress || !collegeOfficialEmail || !collegeOfficialPhone) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'First name, last name, phone, college name, college address, college official email, and college official phone are required' 
      });
    }
    
    const updateData = {};
    
    // Handle name field - construct from firstName and lastName if provided
    if (firstName && lastName) {
      updateData.name = `${firstName.trim()} ${lastName.trim()}`;
      updateData.firstName = firstName.trim();
      updateData.lastName = lastName.trim();
    } else if (name) {
      updateData.name = name.trim();
    }
    
    if (phone) updateData.phone = phone.trim();
    if (collegeName) updateData.collegeName = collegeName.trim();
    if (collegeAddress) updateData.collegeAddress = collegeAddress.trim();
    if (collegeOfficialEmail) updateData.collegeOfficialEmail = collegeOfficialEmail.toLowerCase().trim();
    if (collegeOfficialPhone) updateData.collegeOfficialPhone = collegeOfficialPhone.trim();
    
    console.log('Constructed update data:', updateData);
    
    // Check if placement exists first
    const existingPlacement = await Placement.findById(placementId);
    if (!existingPlacement) {
      console.log('Placement not found:', placementId);
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }
    
    console.log('Found existing placement:', existingPlacement.name);
    
    const placement = await Placement.findByIdAndUpdate(
      placementId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    console.log('Profile updated successfully:', {
      id: placement._id,
      name: placement.name,
      firstName: placement.firstName,
      lastName: placement.lastName,
      phone: placement.phone,
      collegeName: placement.collegeName
    });
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      placement: {
        _id: placement._id,
        name: placement.name,
        firstName: placement.firstName,
        lastName: placement.lastName,
        email: placement.email,
        phone: placement.phone,
        collegeName: placement.collegeName,
        status: placement.status,
        logo: placement.logo,
        idCard: placement.idCard,
        fileHistory: placement.fileHistory,
        credits: placement.credits
      }
    });
  } catch (error) {
    console.error('=== PROFILE UPDATE ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};


// OTP-based Password Reset for Placement
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const placement = await Placement.findByEmail(email.trim());
    
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    placement.resetPasswordOTP = otp;
    placement.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await placement.save();

    const { sendOTPEmail } = require('../utils/emailService');
    await sendOTPEmail(email, otp, placement.name);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const placement = await Placement.findByEmail(email.trim());

    if (!placement || placement.resetPasswordOTP !== otp || (placement.resetPasswordOTPExpires && placement.resetPasswordOTPExpires < Date.now())) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    placement.password = newPassword;
    placement.resetPasswordOTP = undefined;
    placement.resetPasswordOTPExpires = undefined;
    await placement.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

exports.updatePasswordReset = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }

    const placement = await Placement.findByEmail(email.trim());
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }
    
    placement.password = newPassword;
    placement.markModified('password');
    await placement.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
