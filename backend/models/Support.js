const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  userType: { type: String, enum: ['employer', 'candidate', 'guest'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel' },
  userModel: { type: String, enum: ['Employer', 'Candidate'] },
  subject: { type: String, required: true },
  category: { type: String, enum: ['technical', 'billing', 'account', 'job-posting', 'application', 'general'], default: 'general' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'in-progress', 'resolved', 'closed'], default: 'new' },
  isRead: { type: Boolean, default: false },
  response: { type: String },
  respondedAt: { type: Date },
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  attachments: [{
    filename: String,
    originalName: String,
    data: String,
    size: Number,
    mimetype: String
  }]
}, {
  timestamps: true
});

// Index for better query performance
supportSchema.index({ status: 1, createdAt: -1 });
supportSchema.index({ userType: 1, status: 1 });
supportSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Support', supportSchema);