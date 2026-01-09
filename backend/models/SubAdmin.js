const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const subAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  employerCode: { type: String, required: true },
  password: { type: String, required: true },
  permissions: [{ 
    type: String, 
    enum: ['employers', 'placement_officers', 'registered_candidates'],
    required: true 
  }],
  role: { type: String, default: 'sub-admin' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date }
}, {
  timestamps: true
});

// Email normalization for queries while preserving original email
subAdminSchema.index({ email: 1 }, { 
  collation: { locale: 'en', strength: 2 } // Case-insensitive index
});

// Static method for case-insensitive email lookup
subAdminSchema.statics.findByEmail = function(email) {
  if (!email || typeof email !== 'string') return null;
  return this.findOne({ 
    email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') 
  });
};

subAdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

subAdminSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('SubAdmin', subAdminSchema);