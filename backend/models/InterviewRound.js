const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema({
  job_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  startTime: { 
    type: String, 
    required: true 
  },
  endTime: { 
    type: String, 
    required: true 
  },
  applicationLimit: { 
    type: Number, 
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

// Index for faster queries
interviewRoundSchema.index({ job_id: 1, date: 1 });

module.exports = mongoose.model('InterviewRound', interviewRoundSchema);
