const mongoose = require('mongoose');

const employerProfileSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true, unique: true },
  
  // Basic Information
  employerCategory: { type: String },
  companyName: { type: String },
  brandName: { type: String },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  establishedSince: { type: String },
  teamSize: { type: String },
  description: { 
    type: String, 
    default: 'We are a dynamic company focused on delivering excellent services and creating opportunities for talented professionals.' 
  },
  location: { 
    type: String, 
    default: 'Bangalore, India' 
  }, // Primary office location
  whyJoinUs: { type: String }, // Why candidates should join
  googleMapsEmbed: { type: String }, // Google Maps embed code
  
  // Company Details
  legalEntityCode: { type: String },
  corporateAddress: { type: String },
  branchLocations: { type: String },
  pincode: { type: String },
  city: { type: String },
  state: { type: String },
  officialEmail: { type: String },
  officialMobile: { type: String },
  companyType: { type: String },
  cin: { type: String },
  // GST number is collected during profile completion, not at initial signup
  gstNumber: { type: String },
  industrySector: { type: String },
  panNumber: { type: String },
  panCardImage: { type: String }, // File path to PAN card image
  cinImage: { type: String }, // File path to CIN image
  gstImage: { type: String }, // File path to GST image
  certificateOfIncorporation: { type: String }, // File path to incorporation document
  authorizationLetter: { type: String }, // File path to authorization letter (legacy)
  authorizationLetters: [{
    fileName: { type: String },
    fileData: { type: String }, // File path to authorization letter document
    uploadedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isResubmitted: { type: Boolean, default: false }, // Track if document was resubmitted after rejection
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    companyName: { type: String } // Company name for each authorization letter
  }], // Multiple authorization letters
  hiringCompanies: [{ type: String }],
  
  // Document verification status
  panCardVerified: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  panCardReuploadedAt: { type: Date },
  cinVerified: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  cinReuploadedAt: { type: Date },
  gstVerified: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  gstReuploadedAt: { type: Date },
  incorporationVerified: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  incorporationReuploadedAt: { type: Date },
  authorizationVerified: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  authorizationReuploadedAt: { type: Date },
  companyIdCardVerified: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  companyIdCardReuploadedAt: { type: Date },
  agreeTerms: { type: String },
  
  // Primary Contact
  contactFullName: { type: String },
  contactMiddleName: { type: String },
  contactLastName: { type: String },
  contactDesignation: { type: String },
  contactOfficialEmail: { type: String },
  contactMobile: { type: String },
  companyIdCardPicture: { type: String }, // File path to ID card image
  alternateContact: { type: String },
  employerCode: { type: String }, // Employer code for primary contact
  
  // Gallery
  gallery: [{
    url: { type: String },
    fileName: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Legacy fields
  companyDescription: { type: String },
  logo: { type: String }, // File path to logo image
  coverImage: { type: String }, // File path to cover image
  industry: { type: String },
  companySize: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] },
  location: { type: String },
  foundedYear: { type: Number },
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String
  }
}, {
  timestamps: true
});

// Optimized indexes for employer profile queries
employerProfileSchema.index({ employerId: 1 });
employerProfileSchema.index({ companyName: 1 });
employerProfileSchema.index({ industry: 1 });
employerProfileSchema.index({ location: 1 });

module.exports = mongoose.model('EmployerProfile', employerProfileSchema);
