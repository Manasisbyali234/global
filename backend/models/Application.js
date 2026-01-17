const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: false },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: false },
  
  // Guest application fields
  isGuestApplication: { type: Boolean, default: false },
  applicantName: { type: String, required: false },
  applicantEmail: { type: String, required: false },
  applicantPhone: { type: String, required: false },
  
  status: { 
    type: String, 
    enum: ['pending', 'shortlisted', 'interviewed', 'hired', 'rejected'], 
    default: 'pending' 
  },
  coverLetter: { type: String },
  resume: { 
    filename: String,
    originalName: String,
    data: String, // Base64 encoded file data
    size: Number,
    mimetype: String
  },
  notes: { type: String },
  appliedAt: { type: Date, default: Date.now },
  
  // Assessment fields
  assessmentStatus: { 
    type: String, 
    enum: ['not_required', 'pending', 'available', 'in_progress', 'completed', 'expired'], 
    default: 'not_required' 
  },
  assessmentReminderSent: { type: Boolean, default: false },
  assessmentStartAlertSent: { type: Boolean, default: false },
  assessmentScore: { type: Number },
  assessmentPercentage: { type: Number },
  assessmentResult: { type: String, enum: ['pass', 'fail', 'pending'] },
  
  // Interview process reference
  interviewProcessId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewProcess' },
  
  // Legacy interview review fields (kept for backward compatibility)
  interviewRounds: [{
    round: { type: Number, required: true },
    name: { type: String, required: true },
    status: { type: String, enum: ['pending', 'passed', 'failed'], default: 'pending' },
    feedback: { type: String, default: '' }
  }],
  employerRemarks: { type: String, default: '' },
  isSelectedForProcess: { type: Boolean, default: false },
  reviewedAt: { type: Date },
  
  // Interview processes and remarks
  interviewProcesses: [{
    id: { type: String },
    name: { type: String },
    type: { type: String },
    status: { type: String },
    isCompleted: { type: Boolean, default: false },
    result: { type: String, default: null }
  }],
  processRemarks: { type: Map, of: String },
  
  // Interview invite fields
  interviewInvite: {
    sentAt: { type: Date },
    proposedDate: { type: String },
    proposedTime: { type: String },
    meetingLink: { type: String },
    instructions: { type: String },
    status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
    confirmedDate: { type: String },
    confirmedTime: { type: String },
    confirmedAt: { type: Date }
  },
  
  // Candidate response to interview invite
  candidateResponse: {
    availableDate: { type: String },
    availableTime: { type: String },
    message: { type: String },
    respondedAt: { type: Date }
  },
  
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'statusHistory.changedByModel' },
    changedByModel: { type: String, enum: ['Employer', 'Admin'] },
    notes: String
  }],
  
  // Payment fields
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  paymentId: { type: String },
  orderId: { type: String },
  paymentAmount: { type: Number },
  paymentCurrency: { type: String, default: 'INR' }
}, {
  timestamps: true
});

// Create compound index but allow null candidateId for guest applications
applicationSchema.index({ candidateId: 1, jobId: 1 }, { 
  unique: true, 
  partialFilterExpression: { candidateId: { $exists: true } } 
});

module.exports = mongoose.model('Application', applicationSchema);