const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  name: { type: String, required: true },
  fromdate: { type: Date },
  todate: { type: Date },
  startTime: { type: String },
  endTime: { type: String },
  description: { type: String },
  applicationLimit: { type: Number }
}, {
  timestamps: true
});

// Index for faster queries
interviewRoundSchema.index({ jobId: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewRound', interviewRoundSchema);
