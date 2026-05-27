const mongoose = require('mongoose');

const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;
const isNonEmptyObject = (value) => Boolean(
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.keys(value).length > 0
);

const normalizeRoundType = (roundType) => String(roundType || '').trim().toLowerCase();

const requiresSchedulerCompletion = (roundType) => {
  const normalizedRoundType = normalizeRoundType(roundType);
  return Boolean(normalizedRoundType) && normalizedRoundType !== 'assessment';
};

const hasPersistedSchedulerPayload = (round = {}) => {
  const scheduleObject = round.scheduleObject || round.schedule || round.Schedule || {};
  const nestedSchedule = scheduleObject.schedule || scheduleObject.Schedule || {};

  const schedules =
    round.schedulesArray ||
    round.schedules ||
    round.Schedules ||
    round.Schedule ||
    scheduleObject.schedulesArray ||
    scheduleObject.schedules ||
    scheduleObject.Schedules ||
    scheduleObject.Schedule ||
    nestedSchedule.schedules ||
    nestedSchedule.Schedules ||
    nestedSchedule.Schedule;

  const daySchedules =
    round.daySchedulesArray ||
    round.daySchedules ||
    scheduleObject.daySchedulesArray ||
    scheduleObject.daySchedules ||
    nestedSchedule.daySchedules;

  const rooms =
    round.roomsArray ||
    round.rooms ||
    scheduleObject.roomsArray ||
    scheduleObject.rooms ||
    nestedSchedule.rooms;

  return Boolean(round.savedAt) ||
    isNonEmptyArray(schedules) ||
    isNonEmptyArray(daySchedules) ||
    isNonEmptyArray(rooms) ||
    isNonEmptyObject(scheduleObject) ||
    isNonEmptyObject(round.formDataObject);
};

const hasUsableScheduleData = (round = {}) => {
  const subStages = round.subStages || round.subStagesArray || round.days || round.daysArray || [];
  const hasTimedSubStages = Array.isArray(subStages) && subStages.some((sub) =>
    (sub?.fromDate || sub?.fromdate || sub?.date) && sub?.startTime && sub?.endTime
  );
  const hasBasicTiming = Boolean(
    round?.fromdate ||
    round?.todate ||
    (typeof round?.startTime === 'string' && round.startTime.trim()) ||
    (typeof round?.endTime === 'string' && round.endTime.trim())
  );

  if (requiresSchedulerCompletion(round?.roundType)) {
    return hasPersistedSchedulerPayload(round);
  }

  return hasBasicTiming || hasTimedSubStages;
};

const interviewRoundSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  key: { type: String },
  name: { type: String },
  roundType: { type: String },
  fromdate: { type: Date },
  todate: { type: Date },
  startTime: { type: String },
  endTime: { type: String },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
  description: { type: String },
  applicationLimit: { type: Number },
  subStages: [{
    fromDate: { type: Date },
    startTime: { type: String },
    endTime: { type: String },
    applicationLimit: { type: Number }
  }],
  // Scheduler fields
  schedulesArray: [{ type: mongoose.Schema.Types.Mixed }],
  daySchedulesArray: [{ type: mongoose.Schema.Types.Mixed }],
  date: { type: mongoose.Schema.Types.Mixed },
  roomsArray: [{ type: mongoose.Schema.Types.Mixed }],
  numStudents: { type: Number },
  numHRs: { type: Number },
  remainingStudents: { type: Number },
  maxPossibleInterviews: { type: Number },
  schedule: { type: mongoose.Schema.Types.Mixed },
  scheduleObject: { type: Object },
  formDataObject: { type: Object },
  savedAt: { type: Date }
}, {
  timestamps: true
});

// Index for faster queries
interviewRoundSchema.index({ jobId: 1, createdAt: -1 });
interviewRoundSchema.index({ jobId: 1, key: 1 });

interviewRoundSchema.statics.requiresSchedulerCompletion = requiresSchedulerCompletion;
interviewRoundSchema.statics.hasPersistedSchedulerPayload = hasPersistedSchedulerPayload;
interviewRoundSchema.statics.hasUsableScheduleData = hasUsableScheduleData;

// Static method to check if job has scheduled rounds
interviewRoundSchema.statics.hasScheduledRounds = async function(jobId) {
  const rounds = await this.find({ jobId }).lean();
  return rounds.some((round) => this.hasUsableScheduleData(round));
};

module.exports = mongoose.model('InterviewRound', interviewRoundSchema);
