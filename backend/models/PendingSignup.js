const mongoose = require('mongoose');

const pendingSignupSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['candidate', 'employer', 'placement'],
    required: true
  },
  email: { type: String, required: true },
  emailLower: { type: String, required: true },
  phone: { type: String, required: true },
  name: { type: String },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  phoneOTP: { type: String, required: true },
  phoneOTPExpires: { type: Date, required: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

pendingSignupSchema.index({ role: 1, emailLower: 1 }, { unique: true });
pendingSignupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

pendingSignupSchema.statics.findByRoleAndEmail = function(role, email) {
  if (!role || !email || typeof email !== 'string') return null;
  return this.findOne({ role, emailLower: email.trim().toLowerCase() });
};

module.exports = mongoose.model('PendingSignup', pendingSignupSchema);
