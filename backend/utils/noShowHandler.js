/**
 * Shared utility: persist no-show / session-expired rejection to the database.
 * Called from:
 *   - the interview-expiry scheduler (server.js)
 *   - the candidate status endpoint (candidateController.js) as a safeguard
 *   - any explicit no-show detection logic
 */

const Application = require('../models/Application');
const { buildUtcDateTimeFromIst } = require('./dateTime');

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
    notes = 'Candidate no-show / session expired'
  } = options;

  const result = await Application.findOneAndUpdate(
    {
      _id: applicationId,
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
          changedAt: new Date()
        }
      }
    },
    { new: false }
  );

  return result !== null;
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
