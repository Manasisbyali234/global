const mongoose = require('mongoose');
const Notification = require('./Notification');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
  location: { type: String, required: true },
  // Consultant-specific fields
  companyLogo: { type: String }, // Base64 encoded image (only for consultants)
  companyName: { type: String }, // Company name (only for consultants)
  companyDescription: { type: String }, // Company description (only for consultants)
  category: { type: String }, // Job category (IT, Sales, Marketing, etc.)
  typeOfEmployment: { type: String, enum: ['permanent', 'temporary', 'freelance', 'consultant', 'trainee'] }, // Type of employment
  shift: { type: String, enum: ['day-shift', 'night-shift', 'rotational'] }, // Work shift
  workMode: { type: String, enum: ['work-from-home', 'remote', 'hybrid'] }, // Work mode
  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'INR' }
  },
  ctc: {
    min: { type: Number },
    max: { type: Number }
  },
  netSalary: {
    min: { type: Number },
    max: { type: Number }
  },
  jobType: { type: String, enum: ['full-time', 'part-time', 'remote', 'hybrid', 'contract', 'freelance', 'temporary', 'permanent', 'apprenticeship', 'consultant'], required: true },
  vacancies: { type: Number },
  applicationLimit: { type: Number },
  education: [String],
  backlogsAllowed: { type: Boolean, default: false },
  requiredSkills: [String],
  experienceLevel: { type: String, enum: ['freshers', 'minimum', 'both', 'entry', 'mid', 'senior', 'executive'] },
  minExperience: { type: Number, default: 0 },
  maxExperience: { type: Number, default: 0 },
  responsibilities: [String],
  benefits: [String],
  interviewRoundsCount: { type: Number },
  interviewRoundTypes: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      technical: false,
      managerial: false,
      nonTechnical: false,
      final: false,
      hr: false,
      aptitude: false,
      coding: false
    }
  },
  interviewRoundDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Dynamic interview rounds for multiple instances
  dynamicInterviewRounds: [{
    roundType: { type: String, enum: ['technical', 'nonTechnical', 'managerial', 'final', 'hr', 'assessment', 'aptitude', 'coding'] },
    description: { type: String },
    fromDate: { type: Date },
    toDate: { type: Date },
    time: { type: String },
    location: { type: String },
    interviewerName: { type: String },
    order: { type: Number }
  }],
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
  assessmentStartDate: { type: Date },
  assessmentEndDate: { type: Date },
  assessmentStartTime: { type: String },
  assessmentEndTime: { type: String },
  assessmentInstructions: { type: String },
  assessmentPassingPercentage: { type: Number, default: 60 },
  offerLetterDate: { type: Date },
  lastDateOfApplication: { type: Date },
  lastDateOfApplicationTime: { type: String }, // Time in HH:MM format (24-hour)
  transportation: {
    oneWay: { type: Boolean, default: false },
    twoWay: { type: Boolean, default: false },
    noCab: { type: Boolean, default: false }
  },
  status: { type: String, enum: ['active', 'inactive', 'draft', 'pending', 'closed'], default: 'active' },
  applicationCount: { type: Number, default: 0 },
  interviewScheduled: { type: Boolean, default: false },
  // Store the order of interview rounds
  interviewRoundOrder: [String]
}, {
  timestamps: true
});

// Pre-save middleware to validate interview round dates
jobSchema.pre('save', function(next) {
  if (this.interviewRoundDetails) {
    for (const [roundType, details] of Object.entries(this.interviewRoundDetails)) {
      if (details && details.fromDate && details.toDate) {
        if (new Date(details.fromDate) > new Date(details.toDate)) {
          return next(new Error(`Invalid date range for ${roundType}: From Date cannot be after To Date`));
        }
      }
    }
  }
  next();
});

// Pre-update middleware to validate interview round dates
jobSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.interviewRoundDetails) {
    for (const [roundType, details] of Object.entries(update.interviewRoundDetails)) {
      if (details && details.fromDate && details.toDate) {
        if (new Date(details.fromDate) > new Date(details.toDate)) {
          return next(new Error(`Invalid date range for ${roundType}: From Date cannot be after To Date`));
        }
      }
    }
  }
  next();
});

// Optimized compound indexes for faster queries
jobSchema.index({ status: 1, createdAt: -1 }); // Most common sort
jobSchema.index({ status: 1, employerId: 1, createdAt: -1 }); // Employer jobs
jobSchema.index({ status: 1, category: 1, createdAt: -1 }); // Category filter
jobSchema.index({ status: 1, location: 1, createdAt: -1 }); // Location filter
jobSchema.index({ status: 1, jobType: 1, createdAt: -1 }); // Job type filter
jobSchema.index({ status: 1, category: 1, location: 1, createdAt: -1 }); // Combined filters
jobSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' }); // Text search
jobSchema.index({ 'ctc.min': 1, 'ctc.max': 1 }); // Salary sorting
jobSchema.index({ employerId: 1 }); // Employer lookup

module.exports = mongoose.model('Job', jobSchema);