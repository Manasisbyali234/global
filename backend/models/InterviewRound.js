const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  key: { type: String },
  name: { type: String },
  roundType: { type: String },
  fromdate: { type: Date },
  todate: { type: Date },
  startTime: { type: String },
  endTime: { type: String },
  description: { type: String },
  applicationLimit: { type: Number },
  subStages: [{
    fromDate: { type: Date },
    startTime: { type: String },
    endTime: { type: String },
    applicationLimit: { type: Number }
  }],
  // Scheduler fields
  scheduleObject: { type: Object },
  schedulesArray: { type: Array },
  daySchedulesArray: { type: Array },
  date: { type: String },
  roomsArray: { type: Array },
  numStudents: { type: Number },
  numHRs: { type: Number },
  remainingStudents: { type: Number },
  maxPossibleInterviews: { type: Number },
  formDataObject: { type: Object },
  savedAt: { type: Date }
}, {
  timestamps: true
});

// Index for faster queries
interviewRoundSchema.index({ jobId: 1, createdAt: -1 });
interviewRoundSchema.index({ jobId: 1, key: 1 });

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
