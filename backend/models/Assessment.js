const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  serialNumber: { type: Number, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['Aptitude Test', 'Coding Assessment', 'Case Study Round', 'Group Discussion', 'Managerial Round', 'Panel Interview', 'Final HR Round', 'Leadership Interview'], default: 'Aptitude Test' },
  designation: { type: String },
  description: { type: String },
  instructions: { type: String },
  timer: { type: Number, default: 30 },
  totalQuestions: { type: Number, required: true },
  questions: [{
    question: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'visual-mcq', 'subjective', 'upload', 'image'], default: 'mcq' },
    options: [{ type: String }],
    optionImages: [{ type: String }],
    correctAnswer: { type: Number },
    marks: { type: Number, default: 1 },
    explanation: { type: String },
    imageUrl: { type: String }
  }],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  passingPercentage: { type: Number, default: 60 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

AssessmentSchema.index({ employerId: 1, status: 1 });
AssessmentSchema.index({ jobId: 1 });

module.exports = mongoose.model('Assessment', AssessmentSchema);
