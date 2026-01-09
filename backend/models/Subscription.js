const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true, unique: true },
  plan: { type: String, enum: ['basic', 'premium', 'enterprise'], default: 'basic' },
  status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  features: {
    jobPostings: { type: Number, default: 5 },
    featuredJobs: { type: Number, default: 0 },
    candidateSearch: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false }
  },
  paymentHistory: [{
    amount: Number,
    currency: { type: String, default: 'USD' },
    paymentDate: { type: Date, default: Date.now },
    transactionId: String,
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);