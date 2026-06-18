const mongoose = require('mongoose');

const AssessmentAttemptSchema = new mongoose.Schema({
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed', 'expired', 'suspended'], default: 'not_started' },
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
    answeredAt: { type: Date },
    awardedMarks: { type: Number, default: null },
    evaluationStatus: { type: String, enum: ['pending', 'auto_evaluated', 'evaluated'], default: 'pending' },
    evaluationFeedback: { type: String, default: '' },
    evaluatedAt: { type: Date },
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer' }
  }],
  score: { type: Number, default: 0 },
  totalMarks: { type: Number },
  percentage: { type: Number },
  result: { type: String, enum: ['pass', 'fail', 'pending'], default: 'pending' },
  manualEvaluationRequiredCount: { type: Number, default: 0 },
  manualEvaluationCompletedCount: { type: Number, default: 0 },
  manualEvaluationPendingCount: { type: Number, default: 0 },
  termsAccepted: { type: Boolean, default: false },
  termsAcceptedAt: { type: Date },
  restrictionWarningCount: { type: Number, default: 0 },
  suspendedAt: { type: Date },
  suspensionReason: { type: String },
  violations: [{
    type: { type: String, enum: ['tab_switch', 'window_minimize', 'window_blur', 'copy_paste', 'copy_attempt', 'right_click', 'time_expired', 'screen_capture', 'fullscreen_exit', 'multi_screen', 'assessment_close_confirmed', 'tab_close'] },
    timestamp: { type: Date },
    details: { type: String }
  }],
  captures: [{ type: String }]
}, { timestamps: true });

AssessmentAttemptSchema.index({ candidateId: 1, assessmentId: 1 });
AssessmentAttemptSchema.index({ applicationId: 1 });

module.exports = mongoose.model('AssessmentAttempt', AssessmentAttemptSchema);
