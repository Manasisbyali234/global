const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    set: function(email) {
      // Store email as-is to preserve original formatting
      return email;
    }
  },
  password: { type: String, required: false },
  phone: { type: String },
  course: { type: String }, // Course/Branch from Excel data
  credits: { type: Number, default: 0 },
  registrationMethod: { type: String, enum: ['signup', 'admin', 'placement', 'email_signup'], default: 'signup' },
  placementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Placement' },
  fileId: { type: mongoose.Schema.Types.ObjectId }, // Reference to specific file in placement's fileHistory
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date }
}, {
  timestamps: true
});

// Email normalization for queries while preserving original email
candidateSchema.index({ email: 1 }, { 
  collation: { locale: 'en', strength: 2 } // Case-insensitive index
});

// Static method for case-insensitive email lookup
candidateSchema.statics.findByEmail = function(email) {
  if (!email || typeof email !== 'string') return null;
  return this.findOne({ 
    email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') 
  });
};

candidateSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  // Don't hash passwords for placement candidates
  if (this.registrationMethod === 'placement') {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

candidateSchema.methods.comparePassword = async function(password) {
  try {
    if (!this.password) return false;

    // Check if the stored password is a bcrypt hash
    const isHashed = this.password.startsWith('$2a$') || this.password.startsWith('$2b$');

    if (isHashed) {
      return await bcrypt.compare(password, this.password);
    } else {
      // If it's not a hash, it must be plain text (only allowed for placement candidates)
      if (this.registrationMethod === 'placement') {
        return password === this.password;
      }
      return false;
    }
  } catch (error) {
    return false;
  }
};

module.exports = mongoose.model('Candidate', candidateSchema);