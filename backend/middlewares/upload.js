const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Disk storage for question images
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'question-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Store files in memory for Base64 conversion
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for resume'), false);
    }
  } else if (file.fieldname === 'document') {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files allowed for documents'), false);
    }
  } else if (file.fieldname === 'studentData') {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv'
    ];
    
    if (validTypes.includes(file.mimetype)) {
      // Basic size check for empty files
      if (file.size === 0) {
        cb(new Error('File is empty. Please upload a file with student data.'), false);
        return;
      }
      if (file.size < 50) {
        cb(new Error('File appears to be too small to contain valid student data.'), false);
        return;
      }
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xls, .xlsx) and CSV files are allowed for student data'), false);
    }
  } else if (file.fieldname === 'marksheet') {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files allowed for marksheet'), false);
    }
  } else {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
};

// Create different upload configurations for different file types
const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 20 * 1024 * 1024, // 20MB limit (to handle 15MB files with Base64 overhead)
    files: 1 // Only allow 1 file at a time
  }
});

// Special upload configuration for gallery with multiple files
const uploadGallery = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'gallery') {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type: ${file.originalname}. Only JPG, PNG, and SVG files are allowed for gallery.`), false);
      }
    } else {
      cb(new Error('Invalid field name for gallery upload'), false);
    }
  },
  limits: { 
    fileSize: 10 * 1024 * 1024, // Increased to 10MB per file
    files: 3, // Reduced to 3 files per batch to manage memory better
    fieldSize: 30 * 1024 * 1024, // Increased to 30MB total field size
    fieldNameSize: 100, // Field name size
    fields: 10 // Maximum number of non-file fields
  }
});

// Middleware to validate file content after upload
const validateFileContent = (req, res, next) => {
  if (req.file && req.file.fieldname === 'studentData') {
    // Additional validation will be done in the controller
    // This is just a placeholder for any pre-processing
  }
  next();
};

// Special upload configuration for marksheet with no size limit
const uploadMarksheet = multer({
  storage,
  fileFilter,
  limits: { 
    files: 1 // Only allow 1 file at a time, no size limit
  }
});

// Special upload configuration for support attachments with higher limit
const uploadSupport = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Allow common file types for support attachments
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Please upload PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, or image files only.'), false);
    }
  },
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 3, // Allow up to 3 files
    fieldSize: 30 * 1024 * 1024, // 30MB total field size
    fieldNameSize: 100,
    fields: 10
  }
});

// Helper function to convert file to Base64
const fileToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
};

// Helper function to validate Excel/CSV content
const validateExcelContent = (buffer, mimetype) => {
  try {
    const XLSX = require('xlsx');
    let workbook;
    
    if (mimetype.includes('csv')) {
      const csvData = buffer.toString('utf8');
      workbook = XLSX.read(csvData, { type: 'string' });
    } else {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Check if file has actual data rows
    if (!jsonData || jsonData.length === 0) {
      return { valid: false, message: 'The Excel sheet you have provided is empty' };
    }
    
    // Check if all rows are empty
    const hasValidData = jsonData.some(row => {
      return Object.values(row).some(value => 
        value !== null && value !== undefined && String(value).trim() !== ''
      );
    });
    
    if (!hasValidData) {
      return { valid: false, message: 'Your file only contains headers. Please add student data rows' };
    }
    
    // Check for duplicate emails and IDs within the file
    const emails = [];
    const ids = [];
    const duplicateEmails = [];
    const duplicateIds = [];
    
    jsonData.forEach((row, index) => {
      const email = (row.Email || row.email || row.EMAIL || '').toString().trim().toLowerCase();
      const id = (row.ID || row.id || row.Id || '').toString().trim();
      
      if (email) {
        if (emails.includes(email)) {
          if (!duplicateEmails.includes(email)) {
            duplicateEmails.push(email);
          }
        } else {
          emails.push(email);
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
    });
    
    if (duplicateEmails.length > 0 || duplicateIds.length > 0) {
      let message = 'Duplicates found in your file:';
      if (duplicateEmails.length > 0) {
        message += ` Emails: ${duplicateEmails.join(', ')}`;
      }
      if (duplicateIds.length > 0) {
        message += ` IDs: ${duplicateIds.join(', ')}`;
      }
      message += '. Please fix the duplicates and upload again.';
      
      return { 
        valid: false, 
        message: message,
        duplicateEmails: duplicateEmails,
        duplicateIds: duplicateIds
      };
    }
    
    // Validate only required fields: ID, Candidate Name, Email, Phone
    const missingFields = [];
    jsonData.forEach((row, index) => {
      const rowNum = index + 2; // +2 because Excel rows start at 1 and we have a header row
      const id = row.ID || row.id || row.Id || '';
      const name = row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['Student Name'] || '';
      const email = row.Email || row.email || row.EMAIL || '';
      const phone = row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '';
      
      const missing = [];
      if (!id || String(id).trim() === '') missing.push('ID');
      if (!name || String(name).trim() === '') missing.push('Candidate Name');
      if (!email || String(email).trim() === '') missing.push('Email');
      if (!phone || String(phone).trim() === '') missing.push('Phone');
      
      if (missing.length > 0) {
        missingFields.push(`Row ${rowNum}: Missing ${missing.join(', ')}`);
      }
    });
    
    if (missingFields.length > 0) {
      const totalRows = missingFields.length;
      const displayRows = missingFields.slice(0, 3);
      const moreMsg = totalRows > 3 ? ` and ${totalRows - 3} more rows` : '';
      
      return { 
        valid: false, 
        message: `⚠️ Missing Required Fields

Your Excel file has ${totalRows} row(s) with missing required information:

${displayRows.map(row => `• ${row}`).join('\n')}${moreMsg ? '\n• ' + moreMsg : ''}

📋 Required fields for ALL rows:
• ID
• Candidate Name
• Email
• Phone

Please fill in all required fields and upload again.`
      };
    }
    
    return { valid: true, rowCount: jsonData.length };
  } catch (error) {
    return { valid: false, message: 'Invalid file format or corrupted file' };
  }
};

// Upload configuration for question images (disk storage)
const uploadQuestionImage = multer({
  storage: diskStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, GIF, and WEBP images are allowed'), false);
    }
  },
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload configuration for education documents with 50MB limit
const uploadEducation = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'marksheet' || file.fieldname === 'document') {
      const allowedTypes = ['application/pdf'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for education documents'), false);
      }
    } else {
      cb(new Error('Invalid field name for education document upload'), false);
    }
  },
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB limit for education documents
    files: 1
  }
});

// Upload configuration for assessment answer files (memory storage for Base64 conversion)
const uploadAnswerFile = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and image files are allowed'), false);
    }
  },
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = { upload, uploadMarksheet, uploadSupport, uploadGallery, uploadQuestionImage, uploadAnswerFile, uploadEducation, fileToBase64, validateFileContent, validateExcelContent };