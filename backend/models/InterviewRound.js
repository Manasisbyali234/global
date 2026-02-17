const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  key: { type: String }, // Store unique key (e.g., technical_123456)
  name: { type: String },
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

// Static method to check if job has scheduled rounds
interviewRoundSchema.statics.hasScheduledRounds = async function(jobId) {
  const count = await this.countDocuments({
    jobId,
    $or: [
      { fromdate: { $exists: true, $ne: null } },
      { todate: { $exists: true, $ne: null } },
      { startTime: { $exists: true, $ne: null } },
      { endTime: { $exists: true, $ne: null } }
    ]
  });
  return count > 0;
};

module.exports = mongoose.model('InterviewRound', interviewRoundSchema);
