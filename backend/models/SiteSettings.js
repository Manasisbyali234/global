const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Tale Job Portal' },
  tagline: { type: String },
  description: { type: String },
  logo: { type: String },
  favicon: { type: String },
  contactInfo: {
    email: String,
    phone: String,
    address: String
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String
  },
  seoSettings: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    googleAnalytics: String
  },
  emailSettings: {
    smtpHost: String,
    smtpPort: Number,
    smtpUser: String,
    smtpPassword: String,
    fromEmail: String,
    fromName: String
  },
  maintenanceMode: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);