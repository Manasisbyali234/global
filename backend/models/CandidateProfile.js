const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true, unique: true },
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
    designation: String,
    organization: String,
    organizationName: String, // Added for consistency with new requirements
    location: String,
    hasWorkExperience: String,
    isCurrentCompany: { type: Boolean, default: false },
    yearsOfExperience: { type: Number, min: 0, max: 50 },
    monthsOfExperience: { type: Number, min: 0, max: 11 },
    description: String,
    projectDetails: String,
    presentCTC: String,
    expectedCTC: String,
    noticePeriod: String,
    customNoticePeriod: String,
    totalExperienceManual: String
  }],
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

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);