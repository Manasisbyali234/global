const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema({
  candidateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Candidate', 
    required: [true, 'Candidate ID is required'], 
    unique: true,
    sparse: true,
    validate: {
      validator: function(v) {
        return v != null && mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Candidate ID must be a valid ObjectId'
    }
  },
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
  dateOfBirth: { type: Date },
  location: { type: String },
  stateCode: { type: String },
  pincode: { type: String },
  bio: { type: String },
  resume: { type: String }, // Base64 encoded document
  resumeFileName: { type: String },
  resumeMimeType: { type: String },
  profilePicture: { type: String }, // Base64 encoded image
  resumeHeadline: { type: String },
  profileSummary: { type: String },
  gender: { type: String },
  fatherName: { type: String },
  motherName: { type: String },
  residentialAddress: { type: String },
  permanentAddress: { type: String },
  correspondenceAddress: { type: String },
  collegeName: { type: String }, // College name from Excel data
  education: [{
    educationLevel: String,
    degreeName: String,
    specialization: String,
    collegeName: String,
    passYear: String,
    registrationNumber: String,
    state: String,
    scoreType: { type: String, enum: ['percentage', 'cgpa', 'sgpa', 'grade'], default: 'percentage' },
    scoreValue: String,
    percentage: String, // Keep for backward compatibility
    cgpa: String,
    sgpa: String,
    grade: String,
    marksheet: String // Base64 encoded document
  }],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String,
    current: { type: Boolean, default: false }
  }],
  employment: [{
    designation: { type: String },
    organization: { type: String },
    organizationName: { type: String },
    location: { type: String },
    hasWorkExperience: { type: String },
    isCurrentCompany: { type: Boolean, default: false },
    yearsOfExperience: { type: Number, default: 0 },
    monthsOfExperience: { type: Number, default: 0 },
    description: { type: String },
    projectDetails: { type: String },
    presentCTC: { type: String },
    expectedCTC: { type: String },
    noticePeriod: { type: String },
    customNoticePeriod: { type: String },
    totalExperienceManual: { type: String }
  }],
  totalExperience: { type: String },
  skills: [String],
  expectedSalary: { type: Number },
  jobPreferences: {
    jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'] },
    preferredLocations: [String],
    remoteWork: { type: Boolean, default: false },
    willingToRelocate: { type: Boolean, default: false },
    noticePeriod: { type: String }
  }
}, {
  timestamps: true
});

// Pre-save validation to ensure candidateId is never null
candidateProfileSchema.pre('save', function(next) {
  if (!this.candidateId) {
    return next(new Error('Candidate ID cannot be null or undefined'));
  }
  next();
});

// Pre-validate for upsert operations
candidateProfileSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  const candidateId = update?.candidateId || this.getQuery()?.candidateId;
  if (update && !candidateId && !update.$set?.candidateId) {
    // Allow updates that don't touch candidateId
  }
  next();
});

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);