const mongoose = require('mongoose');

const employerPublicProfileSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true, unique: true },
  
  // Basic Information (PUBLIC)
  companyName: { type: String },
  brandName: { type: String },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  establishedSince: { type: String },
  teamSize: { type: String },
  description: { type: String, default: 'We are a dynamic company focused on delivering excellent services and creating opportunities for talented professionals.' },
  location: { type: String, default: 'Bangalore, India' },
  whyJoinUs: { type: String },
  googleMapsEmbed: { type: String },
  
  // Images (PUBLIC)
  logo: { type: String },
  coverImage: { type: String },
  
  // Gallery (PUBLIC)
  gallery: [{
    url: { type: String },
    fileName: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

employerPublicProfileSchema.index({ employerId: 1 });
employerPublicProfileSchema.index({ companyName: 1 });

module.exports = mongoose.model('EmployerPublicProfile', employerPublicProfileSchema);
