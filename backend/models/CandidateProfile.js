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
    location: String,
    isCurrent: { type: Boolean, default: false },
    startDate: Date,
    endDate: Date,
    description: String,
    workType: { type: String, enum: ['Remote', 'Onsite', 'Hybrid'] },
    presentCTC: String,
    expectedCTC: String
  }],
  totalExperience: { type: String }, // Total years of experience
  skills: [String],
  expectedSalary: { type: Number },
  jobPreferences: {
    jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'] },
    preferredLocations: [String],
    remoteWork: { type: Boolean, default: false },
    willingToRelocate: { type: Boolean, default: false },
    noticePeriod: { type: String, enum: ['immediate', '15-days', '1-month', '2-months', '3-months', 'more-than-3-months'] }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);