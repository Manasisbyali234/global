const mongoose = require('mongoose');

const InterviewProcessSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
  
  // Overall process status
  processStatus: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed', 'rejected', 'hired'], 
    default: 'not_started' 
  },
  
  // Interview stages/rounds
  stages: [{
    stageType: { 
      type: String, 
      enum: ['assessment', 'technical', 'hr', 'managerial', 'final', 'nonTechnical', 'custom'],
      required: true 
    },
    stageName: { type: String, required: true }, // e.g., "Technical Round", "HR Interview"
    stageOrder: { type: Number, required: true }, // Order of the stage
    
    // Stage scheduling
    scheduledDate: { type: Date },
    scheduledTime: { type: String },
    fromDate: { type: Date },
    toDate: { type: Date },
    location: { type: String },
    interviewerName: { type: String },
    interviewerEmail: { type: String },
    meetingLink: { type: String },
    
    // Stage status and results
    status: { 
      type: String, 
      enum: ['pending', 'scheduled', 'in_progress', 'completed', 'passed', 'failed', 'cancelled'], 
      default: 'pending' 
    },
    
    // Assessment specific fields
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
    assessmentScore: { type: Number },
    assessmentPercentage: { type: Number },
    assessmentResult: { type: String, enum: ['pass', 'fail', 'pending'] },
    assessmentStartedAt: { type: Date },
    assessmentCompletedAt: { type: Date },
    
    // Interview feedback and notes
    feedback: { type: String },
    interviewerNotes: { type: String },
    candidateNotes: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    
    // Stage completion tracking
    startedAt: { type: Date },
    completedAt: { type: Date },
    
    // Additional stage details
    description: { type: String },
    instructions: { type: String },
    requirements: [{ type: String }],
    
    // Status history for this stage
    statusHistory: [{
      status: String,
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'stages.statusHistory.changedByModel' },
      changedByModel: { type: String, enum: ['Employer', 'Admin', 'System'] },
      notes: String
    }]
  }],
  
  // Overall process tracking
  processStartedAt: { type: Date },
  processCompletedAt: { type: Date },
  
  // Final decision
  finalDecision: { 
    type: String, 
    enum: ['pending', 'selected', 'rejected', 'on_hold'], 
    default: 'pending' 
  },
  finalFeedback: { type: String },
  decisionMadeBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer' },
  decisionMadeAt: { type: Date },
  
  // Offer details (if selected)
  offerDetails: {
    salary: { type: Number },
    currency: { type: String, default: 'INR' },
    joiningDate: { type: Date },
    offerLetterSent: { type: Boolean, default: false },
    offerAccepted: { type: Boolean, default: false },
    offerAcceptedAt: { type: Date }
  },
  
  // Process metadata
  totalStages: { type: Number, default: 0 },
  completedStages: { type: Number, default: 0 },
  currentStage: { type: Number, default: 0 },
  
  // Communication logs
  communications: [{
    type: { type: String, enum: ['email', 'sms', 'call', 'notification'], required: true },
    subject: { type: String },
    message: { type: String, required: true },
    sentBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'communications.sentByModel' },
    sentByModel: { type: String, enum: ['Employer', 'Admin', 'System'] },
    sentAt: { type: Date, default: Date.now },
    delivered: { type: Boolean, default: false },
    read: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
InterviewProcessSchema.index({ applicationId: 1 });
InterviewProcessSchema.index({ candidateId: 1 });
InterviewProcessSchema.index({ jobId: 1 });
InterviewProcessSchema.index({ employerId: 1 });
InterviewProcessSchema.index({ processStatus: 1 });
InterviewProcessSchema.index({ 'stages.status': 1 });

// Virtual for process completion percentage
InterviewProcessSchema.virtual('completionPercentage').get(function() {
  if (this.totalStages === 0) return 0;
  return Math.round((this.completedStages / this.totalStages) * 100);
});

// Method to update stage status
InterviewProcessSchema.methods.updateStageStatus = function(stageIndex, newStatus, notes = '', changedBy = null, changedByModel = 'System') {
  if (this.stages[stageIndex]) {
    const stage = this.stages[stageIndex];
    const oldStatus = stage.status;
    
    stage.status = newStatus;
    stage.statusHistory.push({
      status: newStatus,
      changedAt: new Date(),
      changedBy: changedBy,
      changedByModel: changedByModel,
      notes: notes
    });
    
    // Update completion tracking
    if (newStatus === 'completed' || newStatus === 'passed') {
      stage.completedAt = new Date();
      if (oldStatus !== 'completed' && oldStatus !== 'passed') {
        this.completedStages += 1;
      }
    } else if ((oldStatus === 'completed' || oldStatus === 'passed') && 
               (newStatus !== 'completed' && newStatus !== 'passed')) {
      this.completedStages = Math.max(0, this.completedStages - 1);
    }
    
    // Update current stage
    if (newStatus === 'in_progress') {
      this.currentStage = stageIndex + 1;
    }
    
    // Update overall process status
    this.updateProcessStatus();
  }
};

// Method to update overall process status
InterviewProcessSchema.methods.updateProcessStatus = function() {
  const totalStages = this.stages.length;
  const completedStages = this.stages.filter(stage => 
    stage.status === 'completed' || stage.status === 'passed'
  ).length;
  const failedStages = this.stages.filter(stage => stage.status === 'failed').length;
  
  this.totalStages = totalStages;
  this.completedStages = completedStages;
  
  if (failedStages > 0) {
    this.processStatus = 'rejected';
    this.finalDecision = 'rejected';
  } else if (completedStages === totalStages && totalStages > 0) {
    this.processStatus = 'completed';
    if (this.finalDecision === 'pending') {
      this.finalDecision = 'selected';
    }
  } else if (completedStages > 0) {
    this.processStatus = 'in_progress';
  }
};

// Method to add communication log
InterviewProcessSchema.methods.addCommunication = function(type, message, subject = '', sentBy = null, sentByModel = 'System') {
  this.communications.push({
    type: type,
    subject: subject,
    message: message,
    sentBy: sentBy,
    sentByModel: sentByModel,
    sentAt: new Date()
  });
};

module.exports = mongoose.model('InterviewProcess', InterviewProcessSchema);