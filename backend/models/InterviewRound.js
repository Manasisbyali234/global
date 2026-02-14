const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  applicationLimit: { type: Number }
}, {
  timestamps: true
});

// Index for faster queries
interviewRoundSchema.index({ jobId: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewRound', interviewRoundSchema);
