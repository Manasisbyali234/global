const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super-admin', 'admin'], default: 'admin' },
  permissions: [String],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date }
}, {
  timestamps: true
});

// Email normalization for queries while preserving original email
adminSchema.index({ email: 1 }, { 
  collation: { locale: 'en', strength: 2 } // Case-insensitive index
});

// Static method for case-insensitive email lookup
adminSchema.statics.findByEmail = function(email) {
  if (!email || typeof email !== 'string') return null;
  return this.findOne({ 
    email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') 
  });
};

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);