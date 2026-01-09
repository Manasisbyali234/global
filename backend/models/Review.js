const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true
  },
  reviewerName: {
    type: String,
    required: true,
    trim: true
  },
  reviewerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  image: {
    type: String,
    default: null
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
reviewSchema.index({ employerId: 1, createdAt: -1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ employerId: 1, reviewerEmail: 1 });

module.exports = mongoose.model('Review', reviewSchema);