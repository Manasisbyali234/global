/**
 * fixApplicationStatusForManualStages.js
 *
 * Fixes applications where Application.status was incorrectly set to "rejected"
 * because of old logic that treated non-assessment stage statuses like
 * "on_hold", "no_show", "expired" etc. as a full rejection.
 *
 * Rule (matching the fixed computeEffectiveStatus logic):
 *   - Non-assessment stages: only explicit "rejected" counts as rejection
 *   - Assessment stages:     all rejected-like statuses count
 *
 * If Application.status === "rejected" AND the saved interviewProcesses show
 * that the rejection came from a non-assessment stage with a non-rejected
 * status (e.g. on_hold, no_show set manually), revert to "pending".
 *
 * Run: node backend/scripts/fixApplicationStatusForManualStages.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Application = require('../models/Application');
const InterviewProcess = require('../models/InterviewProcess');

const REJECTED_LIKE_STATUSES = new Set([
  'rejected', 'not_advanced_to_next_stage', 'not_advanced_to_next_round',
  'failed', 'fail', 'no_show', 'no show', 'expired', 'suspended',
  'session_expired', 'session expired', 'not eligible for next round',
  'not eligibal for next round'
]);

const normalize = (v = '') =>
  String(v || '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');

const isAssessmentProcess = (p = {}) =>
  normalize(p?.type || p?.stageType) === 'assessment';

const isRejectedNonAssessment = (p = {}) => {
  if (isAssessmentProcess(p)) return false;
  return normalize(p?.status) === 'rejected';
};

const isRejectedAssessment = (p = {}) => {
  if (!isAssessmentProcess(p)) return false;
  return REJECTED_LIKE_STATUSES.has(normalize(p?.status));
};

const hadOfferSent = (app) =>
  Array.isArray(app.statusHistory) &&
  app.statusHistory.some((h) => {
    const s = normalize(h?.status);
    return s === 'offer sent' || s === 'offer_sent';
  });

const isAutoRejectedFromStageStatus = (app) => {
  if (normalize(app.status) !== 'rejected') return false;
  const history = Array.isArray(app.statusHistory) ? app.statusHistory : [];
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i]?.status) {
      return normalize(history[i].status) === 'rejected' &&
        normalize(history[i].notes || '').includes('auto updated from interview stage status');
    }
  }
  return false;
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  // Only look at applications currently marked rejected
  const applications = await Application.find({ status: 'rejected' })
    .select('_id status statusHistory interviewProcesses assessmentStatus assessmentResult')
    .lean();

  console.log(`Found ${applications.length} rejected applications to evaluate\n`);

  const interviewProcessDocs = await InterviewProcess.find({
    applicationId: { $in: applications.map((a) => a._id) }
  }).select('applicationId stages').lean();

  const processMap = new Map(
    interviewProcessDocs.map((doc) => [String(doc.applicationId), doc])
  );

  let fixedCount = 0;
  let skippedCount = 0;
  const results = [];

  for (const app of applications) {
    const appId = String(app._id);

    // Skip: offer was sent then rejected — that's a genuine rejection
    if (hadOfferSent(app)) {
      skippedCount++;
      continue;
    }

    // Gather tracked processes: prefer interviewProcesses, fall back to stages
    const manualProcesses = Array.isArray(app.interviewProcesses)
      ? app.interviewProcesses.filter(Boolean)
      : [];

    const interviewProcessDoc = processMap.get(appId);
    const stageProcesses = Array.isArray(interviewProcessDoc?.stages)
      ? interviewProcessDoc.stages.map((s) => ({
          type: s.stageType,
          status: s.status
        }))
      : [];

    const trackedProcesses = manualProcesses.length > 0 ? manualProcesses : stageProcesses;

    if (trackedProcesses.length === 0) {
      skippedCount++;
      continue;
    }

    // Check if any NON-assessment stage is explicitly rejected
    const hasNonAssessmentRejected = trackedProcesses.some(isRejectedNonAssessment);
    // Check if any assessment stage is rejected-like
    const hasAssessmentRejected = trackedProcesses.some(isRejectedAssessment);

    // Also check raw assessment fields
    const aStatus = normalize(app.assessmentStatus || '');
    const aResult = normalize(app.assessmentResult || '');
    const isExpiredWithPassResult = aStatus === 'expired' && aResult === 'pass';
    const isExpiredPendingEval = aStatus === 'expired' && aResult === 'pending';
    const assessmentFieldRejected =
      !isExpiredWithPassResult &&
      !isExpiredPendingEval &&
      (
        ['no show', 'suspended', 'session expired', 'no_show', 'session_expired'].includes(aStatus) ||
        ['failed', 'fail'].includes(aStatus) ||
        ['failed', 'fail'].includes(aResult)
      );

    const shouldStayRejected = hasNonAssessmentRejected || hasAssessmentRejected || assessmentFieldRejected;

    if (shouldStayRejected) {
      skippedCount++;
      continue;
    }

    // At this point: application is "rejected" but NO stage actually justifies it
    // Revert to "pending" (same as fixed computeEffectiveStatus logic)
    const newStatus = app.isSelectedForProcess ? 'shortlisted' : 'pending';

    await Application.updateOne(
      { _id: app._id },
      {
        $set: { status: newStatus },
        $push: {
          statusHistory: {
            status: newStatus,
            changedAt: new Date(),
            notes: 'Status corrected by fixApplicationStatusForManualStages script — previous rejection was not justified by any stage'
          }
        }
      }
    );

    fixedCount++;
    results.push({ appId, oldStatus: 'rejected', newStatus });
    console.log(`  Fixed: ${appId}  rejected → ${newStatus}`);
  }

  console.log('\n════════════════════════════════════════════');
  console.log(`  Fixed  : ${fixedCount}`);
  console.log(`  Skipped: ${skippedCount} (genuine rejections or no stages)`);
  console.log(`  Total  : ${applications.length}`);
  console.log('════════════════════════════════════════════\n');

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
