const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const placementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    set: function(email) {
      return email; // Store as-is to preserve original formatting
    }
  },
  password: { type: String, required: false },
  phone: { type: String, required: true },
  collegeName: { type: String, required: true },
  collegeAddress: { type: String },
  collegeOfficialEmail: { type: String },
  collegeOfficialPhone: { type: String },
  logo: { type: String }, // Base64 encoded logo image
  idCard: { type: String }, // Base64 encoded ID card image
  studentData: { type: String }, // Base64 encoded Excel/CSV file
  fileName: { type: String },
  fileType: { type: String },
  credits: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'approvedByModel' },
  approvedByModel: { type: String, enum: ['Admin', 'SubAdmin'] },

  isProcessed: { type: Boolean, default: false },
  processedAt: { type: Date },
  candidatesCreated: { type: Number, default: 0 },
  fileHistory: [{
    fileName: String,
    customName: String, // Custom display name set by user
    university: String, // University name
    batch: String, // Batch information
    uploadedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'processed'], default: 'pending' },
    fileData: String, // Base64 encoded file data
    fileType: String, // MIME type
    processedAt: Date,
    candidatesCreated: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },
    structuredData: [{
      rowIndex: Number,
      id: String,
      candidateName: String,
      collegeName: String,
      email: String,
      phone: String,
      course: String,
      password: String,
      creditsAssigned: Number,
      originalRowData: mongoose.Schema.Types.Mixed,
      processedAt: Date,
      placementId: mongoose.Schema.Types.ObjectId,
      fileId: mongoose.Schema.Types.ObjectId
    }],
    dataStoredAt: Date,
    recordCount: { type: Number, default: 0 }
  }],
  lastDashboardState: {
    data: mongoose.Schema.Types.Mixed,
    timestamp: Date
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date }
}, {
  timestamps: true
});

// Email normalization for queries while preserving original email
placementSchema.index({ email: 1 }, { 
  collation: { locale: 'en', strength: 2 } // Case-insensitive index
});

// Static method for case-insensitive email lookup
placementSchema.statics.findByEmail = function(email) {
  if (!email || typeof email !== 'string') return null;
  return this.findOne({ 
    email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') 
  });
};

placementSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

placementSchema.methods.comparePassword = async function(password) {
  try {
    if (!this.password) return false;
    
    // Check if the stored password is a bcrypt hash
    const isHashed = this.password.startsWith('$2a$') || this.password.startsWith('$2b$');
    
    if (isHashed) {
      return await bcrypt.compare(password, this.password);
    } else {
      // If it's not a hash, it must be plain text (only allowed for placement officers)
      return password === this.password;
    }
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

module.exports = mongoose.model('Placement', placementSchema);