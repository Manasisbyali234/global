const mongoose = require('mongoose');

const employerAdminProfileSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true, unique: true },
  
  // Company Details (ADMIN ONLY)
  employerCategory: { type: String },
  corporateAddress: { type: String },
  branchLocations: { type: String },
  pincode: { type: String },
  city: { type: String },
  state: { type: String },
  officialEmail: { type: String },
  officialMobile: { type: String },
  companyType: { type: String },
  cin: { type: String },
  gstNumber: { type: String },
  industrySector: { type: String },
  panNumber: { type: String },
  
  // Documents (ADMIN ONLY)
  panCardImage: { type: String },
  cinImage: { type: String },
  gstImage: { type: String },
  certificateOfIncorporation: { type: String },
  
  // Document verification status
  panCardVerified: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  panCardReuploadedAt: { type: Date },
  cinVerified: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  cinReuploadedAt: { type: Date },
  gstVerified: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  gstReuploadedAt: { type: Date },
  incorporationVerified: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  incorporationReuploadedAt: { type: Date },
  companyIdCardVerified: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  companyIdCardReuploadedAt: { type: Date },
  
  // Authorization Letters (ADMIN ONLY)
  authorizationLetters: [{
    fileName: { type: String },
    fileData: { type: String },
    uploadedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isResubmitted: { type: Boolean, default: false },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    companyName: { type: String }
  }],
  
  // Primary Contact (ADMIN ONLY)
  contactFullName: { type: String },
  contactMiddleName: { type: String },
  contactLastName: { type: String },
  contactDesignation: { type: String },
  contactOfficialEmail: { type: String },
  contactMobile: { type: String },
  companyIdCardPicture: { type: String },
  alternateContact: { type: String },
  employerCode: { type: String },
  agreeTerms: { type: String }
}, {
  timestamps: true
});

employerAdminProfileSchema.index({ employerId: 1 });
employerAdminProfileSchema.index({ gstNumber: 1 });
employerAdminProfileSchema.index({ panNumber: 1 });

module.exports = mongoose.model('EmployerAdminProfile', employerAdminProfileSchema);
