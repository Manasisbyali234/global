const mongoose = require('mongoose');

const AssessmentAttemptSchema = new mongoose.Schema({
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed', 'expired'], default: 'not_started' },
  startTime: { type: Date },
  endTime: { type: Date },
  timeRemaining: { type: Number },
  currentQuestion: { type: Number, default: 0 },
  answers: [{
    questionIndex: { type: Number, required: true },
    selectedAnswer: { type: Number },
    textAnswer: { type: String },
    uploadedFile: {
      filename: { type: String },
      originalName: { type: String },
      mimetype: { type: String },
      size: { type: Number },
      path: { type: String },
      uploadedAt: { type: Date }
    },
    timeSpent: { type: Number },
    answeredAt: { type: Date }
  }],
  score: { type: Number, default: 0 },
  totalMarks: { type: Number },
  percentage: { type: Number },
  result: { type: String, enum: ['pass', 'fail', 'pending'], default: 'pending' },
  termsAccepted: { type: Boolean, default: false },
  termsAcceptedAt: { type: Date },
  violations: [{
    type: { type: String, enum: ['tab_switch', 'window_minimize', 'copy_paste', 'right_click'] },
    timestamp: { type: Date },
    details: { type: String }
  }],
  captures: [{ type: String }]
}, { timestamps: true });

AssessmentAttemptSchema.index({ candidateId: 1, assessmentId: 1 });
AssessmentAttemptSchema.index({ applicationId: 1 });

module.exports = mongoose.model('AssessmentAttempt', AssessmentAttemptSchema);
