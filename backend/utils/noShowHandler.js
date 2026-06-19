/**
 * Shared utility: persist no-show / session-expired rejection to the database.
 * Called from:
 *   - the interview-expiry scheduler (server.js)
 *   - the candidate status endpoint (candidateController.js) as a safeguard
 *   - any explicit no-show detection logic
 */

const Application = require('../models/Application');
const InterviewProcess = require('../models/InterviewProcess');
const { buildUtcDateTimeFromIst } = require('./dateTime');

const normalizeValue = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const normalizeId = (value = '') => {
  if (!value) return '';
  if (typeof value === 'object') {
    return String(value?._id || value?.id || '').trim();
  }

  return String(value).trim();
};

const isNonAssessmentRoundType = (value = '') => {
  const normalizedType = normalizeValue(value);
  return Boolean(normalizedType) && normalizedType !== 'assessment';
};

const hasNonAssessmentInterviewRound = (application = {}) => {
  const trackedProcesses = Array.isArray(application?.interviewProcesses)
    ? application.interviewProcesses
    : [];
  if (trackedProcesses.some((process) => isNonAssessmentRoundType(process?.type || process?.stageType))) {
    return true;
  }

  const stages = Array.isArray(application?.interviewProcess?.stages)
    ? application.interviewProcess.stages
    : [];
  if (stages.some((stage) => isNonAssessmentRoundType(stage?.stageType || stage?.type))) {
    return true;
  }

  const roundTypes = application?.jobId?.interviewRoundTypes;
  if (roundTypes && typeof roundTypes === 'object') {
    return Object.values(roundTypes).some((roundType) => isNonAssessmentRoundType(roundType));
  }

  return false;
};

const shouldMarkAssessmentStageNoShow = (stage = {}) => {
  const status = normalizeValue(stage?.status);
  const result = normalizeValue(stage?.assessmentResult);

  if (status === 'expired') {
    return !['pass', 'pending'].includes(result);
  }

  return ![
    'completed',
    'passed',
    'failed',
    'suspended',
    'cancelled',
    'no show'
  ].includes(status);
};

const markAssessmentStageNoShow = async (applicationId, options = {}) => {
  const {
    assessmentId = null,
    notes = 'Candidate no-show / session expired',
    changedAt = new Date()
  } = options;

  const interviewProcess = await InterviewProcess.findOne({ applicationId });
  if (!interviewProcess?.stages?.length) {
    return false;
  }

  const targetAssessmentId = normalizeId(assessmentId);
  const assessmentStagesToUpdate = interviewProcess.stages.filter((stage) => (
    stage?.stageType === 'assessment' &&
    (!targetAssessmentId || normalizeId(stage.assessmentId) === targetAssessmentId) &&
    shouldMarkAssessmentStageNoShow(stage)
  ));

  if (!targetAssessmentId && assessmentStagesToUpdate.length !== 1) {
    return false;
  }
  if (assessmentStagesToUpdate.length === 0) {
    return false;
  }

  assessmentStagesToUpdate.forEach((stage) => {
    stage.status = 'no show';
    stage.assessmentCompletedAt = stage.assessmentCompletedAt || changedAt;
    stage.statusHistory = Array.isArray(stage.statusHistory) ? stage.statusHistory : [];
    stage.statusHistory.push({
      status: 'no show',
      changedAt,
      changedByModel: 'System',
      notes
    });
  });

  interviewProcess.markModified('stages');
  interviewProcess.updateProcessStatus();
  await interviewProcess.save();
  return true;
};

/**
 * Atomically update an application to the no-show / expired state.
 * Safe to call multiple times — skips if already rejected with no_show.
 *
 * @param {string|ObjectId} applicationId
 * @returns {Promise<boolean>} true if the document was actually updated
 */
const applyNoShowRejection = async (applicationId, options = {}) => {
  const {
    expireInterviewInvite = true,
    notes = 'Candidate no-show / session expired',
    assessmentId = null,
    updateAssessmentStage = true
  } = options;

  const changedAt = new Date();
  const result = await Application.findOneAndUpdate(
    {
      _id: applicationId,
      status: { $nin: ['accepted', 'hired', 'offer_sent'] },
      // Do not overwrite applications where the assessment was already submitted
      assessmentStatus: { $nin: ['completed', 'passed', 'failed'] },
      $or: [
        { status: { $ne: 'rejected' } },
        { assessmentStatus: { $ne: 'no_show' } }
      ]
    },
    {
      $set: {
        status: 'rejected',
        assessmentStatus: 'no_show',
        ...(expireInterviewInvite ? { 'interviewInvite.status': 'expired' } : {})
      },
      $push: {
        statusHistory: {
          status: 'rejected',
          notes,
          changedAt
        }
      }
    },
    { new: false }
  );

  if (result === null) {
    const existingApplication = await Application.findById(applicationId)
      .select('status assessmentStatus')
      .lean();
    const existingStatus = normalizeValue(existingApplication?.status);

    if (!existingApplication || ['accepted', 'hired', 'offer sent'].includes(existingStatus)) {
      return false;
    }
  }

  const stageUpdated = updateAssessmentStage
    ? await markAssessmentStageNoShow(applicationId, { assessmentId, notes, changedAt })
    : false;

  return result !== null || stageUpdated;
};

/**
 * Determine whether an application whose interview window has passed
 * should be treated as a no-show.
 *
 * Rules:
 *  - application must still be 'pending' or 'shortlisted'
 *  - interviewInvite must have been sent (sentAt exists)
 *  - the proposed/confirmed interview date+time is in the past
 *  - candidate has NOT attended (no interviewInvite.status === 'confirmed' with a future date,
 *    and application status is not 'interviewed' / 'hired' / 'offer_sent' / 'accepted')
 */
const isNoShowCandidate = (application) => {
  const safeStatus = String(application?.status || '').toLowerCase();
  if (!['pending', 'shortlisted'].includes(safeStatus)) return false;

  if (hasNonAssessmentInterviewRound(application)) return false;

  const invite = application?.interviewInvite;
  if (!invite?.sentAt) return false;

  // Keep repairing stale records where only the invite was expired.
  const inviteStatus = String(invite.status || '').toLowerCase();
  if (inviteStatus === 'expired') return true;

  const interviewDateStr = invite.confirmedDate || invite.proposedDate;
  const interviewTimeStr = invite.confirmedTime || invite.proposedTime;
  if (!interviewDateStr) return false;

  const interviewDateTime = buildUtcDateTimeFromIst(
    interviewDateStr,
    interviewTimeStr || '23:59',
    'start'
  );
  if (!interviewDateTime || isNaN(interviewDateTime.getTime())) return false;

  // Add a 30-minute grace period before marking as no-show
  const gracePeriodMs = 30 * 60 * 1000;
  return Date.now() > interviewDateTime.getTime() + gracePeriodMs;
};

module.exports = { applyNoShowRejection, isNoShowCandidate };
