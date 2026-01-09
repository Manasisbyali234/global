const mongoose = require('mongoose');

const placementCandidateSchema = new mongoose.Schema({
  // Student Information
  candidateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Candidate',
    required: true 
  },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true, lowercase: true },
  studentPhone: { type: String },
  course: { type: String },
  collegeName: { type: String },
  
  // Placement Officer Information
  placementId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Placement',
    required: true 
  },
  placementOfficerName: { type: String, required: true },
  placementOfficerEmail: { type: String, required: true, lowercase: true },
  placementOfficerPhone: { type: String },
  
  // File Information
  fileId: { type: mongoose.Schema.Types.ObjectId },
  fileName: { type: String },
  
  // Status and Approval
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  approvedAt: { type: Date },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
  },
  rejectedAt: { type: Date },
  rejectedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
  },
  
  // Credits and Academic Info
  creditsAssigned: { type: Number, default: 0 },
  
  // Email Status
  welcomeEmailSent: { type: Boolean, default: false },
  welcomeEmailSentAt: { type: Date },
  emailRetryCount: { type: Number, default: 0 },
  lastEmailAttempt: { type: Date },
  
  // Password Management
  passwordCreated: { type: Boolean, default: false },
  passwordCreatedAt: { type: Date },
  
  // Additional Data
  originalRowData: { type: mongoose.Schema.Types.Mixed },
  
}, {
  timestamps: true
});

// Index for efficient queries
placementCandidateSchema.index({ placementId: 1, status: 1 });
placementCandidateSchema.index({ candidateId: 1 });
placementCandidateSchema.index({ studentEmail: 1 });
placementCandidateSchema.index({ welcomeEmailSent: 1 });
placementCandidateSchema.index({ approvedAt: 1 });
placementCandidateSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PlacementCandidate', placementCandidateSchema);