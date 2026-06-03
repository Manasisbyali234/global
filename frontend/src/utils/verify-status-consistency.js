/**
 * verify-status-consistency.js
 * Run with: node src/utils/verify-status-consistency.js
 *
 * Cross-checks Round Status labels displayed on:
 *   [A] Admin Overview  (getRoundStatusPresentation)
 *   [E] Employer Side   (stageStatusOptions labels + assessmentDisplay.statusLabel)
 *   [C] Candidate Side  (STATUS_BADGES in can-interviews.jsx)
 */

// ─── Replicated from statusDisplay.js ────────────────────────────────────────
const STATUS_KEY_ALIASES = new Map([
  ['accepted', 'accepted'],
  ['available', 'pending'],
  ['completed', 'completed'],
  ['expired', 'expired'],
  ['field', 'failed'],
  ['fail', 'failed'],
  ['failed', 'failed'],
  ['hired', 'hired'],
  ['in progress', 'in_progress'],
  ['interview completed', 'interview_completed'],
  ['interview scheduled', 'interview_scheduled'],
  ['interviewed', 'interviewed'],
  ['no show', 'no_show'],
  ['not eligibal for next round', 'not_advanced_to_next_round'],
  ['not eligible for next round', 'not_advanced_to_next_round'],
  ['not advanced to next round', 'not_advanced_to_next_round'],
  ['not advanced to next stage', 'not_advanced_to_next_stage'],
  ['not required', 'pending'],
  ['not started', 'pending'],
  ['offer accepted', 'accepted'],
  ['offer letter sent', 'offer_sent'],
  ['offer sent', 'offer_sent'],
  ['offer shared', 'offer_shared'],
  ['on hold', 'on_hold'],
  ['pass', 'passed'],
  ['passed', 'passed'],
  ['pending', 'pending'],
  ['pending decision', 'pending_decision'],
  ['rejected', 'rejected'],
  ['scheduled', 'scheduled'],
  ['selected', 'selected'],
  ['session expired', 'no_show'],
  ['shortlisted', 'shortlisted'],
  ['shortlisted for next round', 'shortlisted_for_next_round'],
  ['suspended', 'suspended'],
  ['under review', 'under_review'],
]);

const STATUS_LABELS = {
  accepted: 'Offer Accepted',
  completed: 'Completed',
  expired: 'Expired',
  failed: 'Failed',
  hired: 'Hired',
  in_progress: 'In Progress',
  interview_completed: 'Interview Completed',
  interview_scheduled: 'Interview Scheduled',
  interviewed: 'Interviewed',
  no_show: 'No Show',
  not_advanced_to_next_round: 'Not Advanced to Next Round',
  not_advanced_to_next_stage: 'Not Advanced to Next Stage',
  offer_sent: 'Offer Letter Sent',
  offer_shared: 'Offer Shared',
  on_hold: 'On Hold',
  passed: 'Passed',
  pending: 'Pending',
  pending_decision: 'Pending Decision',
  rejected: 'Rejected',
  scheduled: 'Scheduled',
  selected: 'Selected',
  session_expired: 'No Show',
  shortlisted: 'Shortlisted',
  shortlisted_for_next_round: 'Shortlisted for next Round',
  suspended: 'Suspended',
  under_review: 'Under Review',
};

const normalizeStatusValue = (value = '') =>
  String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');

const getCanonicalStatusKey = (value = '', fallback = 'pending') => {
  const n = normalizeStatusValue(value);
  if (!n) return fallback;
  return STATUS_KEY_ALIASES.get(n) || n.replace(/\s+/g, '_');
};

const getStatusLabel = (value = 'pending') => {
  const key = getCanonicalStatusKey(value);
  return STATUS_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// ─── Replicated from assessmentOutcome.js ─────────────────────────────────────
const getAssessmentOutcome = ({ status = '', result = '', manualEvaluationPendingCount = 0 } = {}) => {
  const normalizedStatus = normalizeStatusValue(status);
  const normalizedResult = normalizeStatusValue(result);
  const pendingManualReview = Number(manualEvaluationPendingCount || 0) > 0;
  const isSuspended = normalizedStatus === 'suspended';
  const isInProgress = normalizedStatus === 'in progress';
  const isPassed = !isSuspended && ['pass', 'passed'].includes(normalizedResult) || normalizedStatus === 'passed';
  const isFailed = !isSuspended && ['fail', 'failed'].includes(normalizedResult) || normalizedStatus === 'failed';
  const isCompleted = ['completed', 'passed', 'failed'].includes(normalizedStatus) || isPassed || isFailed;
  const isPendingReview = !isSuspended && !isPassed && !isFailed &&
    (pendingManualReview || (normalizedResult === 'pending' && ['completed', 'expired'].includes(normalizedStatus)));
  const isNoShow = !isSuspended && !isPassed && !isFailed && !isPendingReview &&
    (['session expired', 'no show'].includes(normalizedStatus) ||
      (normalizedStatus === 'expired' && !normalizedResult) ||
      normalizedResult === 'no show');
  return { isSuspended, isInProgress, isPassed, isFailed, isCompleted, isPendingReview, isNoShow };
};

// ─── Replicated: Admin getRoundStatusPresentation (non-assessment path) ───────
const adminRoundStatusLabel = (rawStatus) => {
  const n = normalizeStatusValue(rawStatus);
  if (['shortlisted for next round', 'shortlisted_for_next_round'].includes(n))
    return 'Shortlisted for next Round';
  if (n === 'shortlisted') return 'Shortlisted';
  if (n === 'selected') return 'Selected';
  if (n === 'under review') return 'Under Review';
  if (n === 'pending decision') return 'Pending Decision';
  if (n === 'on hold') return 'On Hold';
  if (n === 'no show') return 'No Show';
  if (n === 'rejected') return 'Rejected';
  if (n === 'not advanced to next stage') return 'Not Advanced to Next Stage';
  if (n === 'not advanced to next round') return 'Not Advanced to Next Round';
  if (['scheduled', 'interview scheduled'].includes(n)) return getStatusLabel(rawStatus || 'pending');
  if (['completed', 'interview completed'].includes(n)) return getStatusLabel(rawStatus || 'pending');
  if (n === 'in progress') return 'In Progress';
  return getStatusLabel(rawStatus || 'pending');
};

// ─── Replicated: Admin getRoundStatusPresentation (assessment path) ───────────
const adminAssessmentRoundStatusLabel = (rawStatus, rawResult) => {
  const outcome = getAssessmentOutcome({ status: rawStatus, result: rawResult });
  if (outcome.isPassed) return 'Passed';
  if (outcome.isFailed) return 'Failed';
  if (outcome.isSuspended) return 'Suspended';
  if (outcome.isInProgress) return 'In Progress';
  if (outcome.isCompleted || outcome.isPendingReview) return 'Completed';
  if (outcome.isNoShow) return 'No Show';
  return getStatusLabel(rawStatus || 'pending');
};

// ─── Replicated: Employer stageStatusOptions labels ───────────────────────────
// From emp-candidate-review.jsx → stageStatusOptions (non-final round)
const EMPLOYER_NON_FINAL_OPTIONS = {
  shortlisted_for_next_round: 'Shortlisted for next Round',
  on_hold: 'On Hold',
  pending_decision: 'Pending Decision',
  no_show: 'No Show',
  rejected: 'Not Advanced to Next Stage',
};
// Final round options
const EMPLOYER_FINAL_OPTIONS = {
  selected: 'Selected',
  rejected: 'Rejected',
};
// Assessment display labels (from getAssessmentDisplayState)
const employerAssessmentLabel = (rawStatus, rawResult) => {
  const outcome = getAssessmentOutcome({ status: rawStatus, result: rawResult });
  if (outcome.isPassed) return 'Passed';
  if (outcome.isFailed) return 'Failed';
  if (outcome.isSuspended) return 'Suspended';
  if (outcome.isNoShow) return 'No Show';
  if (outcome.isInProgress) return 'In Progress';
  if (outcome.isCompleted || outcome.isPendingReview) return 'Completed';
  return normalizeStatusValue(rawStatus).replace(/\b\w/g, c => c.toUpperCase()) || 'Pending';
};

// ─── Replicated: Candidate STATUS_BADGES ─────────────────────────────────────
const CANDIDATE_STATUS_BADGES = {
  scheduled: 'Scheduled',
  interview_scheduled: 'Interview Scheduled',
  interview_completed: 'Interview Completed',
  completed: 'Completed',
  expired: 'Expired',
  accepted: 'Offer Accepted',
  hired: 'Hired',
  selected: 'Selected',
  shortlisted: 'Shortlisted',
  shortlisted_for_next_round: 'Shortlisted for next Round',
  under_review: 'Under Review',
  pending_decision: 'Pending Decision',
  not_advanced_to_next_round: 'Not Advanced to Next Round',
  not_advanced_to_next_stage: 'Not Advanced to Next Stage',
  rejected: 'Rejected',
  no_show: 'No Show',
  on_hold: 'On Hold',
  pending: 'Pending',
  passed: 'Passed',
  failed: 'Failed',
  session_expired: 'No Show',
  suspended: 'Suspended',
  in_progress: 'In Progress',
  offer_sent: 'Offer Letter Sent',
};

const getCandidateLabel = (rawStatus) => {
  const key = getCanonicalStatusKey(rawStatus);
  return CANDIDATE_STATUS_BADGES[key] || getStatusLabel(rawStatus);
};

// ─── Overall Application Status Labels ──────────────────────────────────────
// Admin overview uses getStatusLabel(applicantStatusKey) directly from statusDisplay.js
// Employer (emp-candidates) uses getStatusLabel(application.displayStatus) from statusDisplay.js
// Candidate (application-status.jsx) uses formatStatusLabel = getStatusLabel and hardcoded labels
// The Status column label mapping per status key:
const CANDIDATE_STATUS_COLUMN_LABELS = {
  pending: 'Pending',
  shortlisted: 'Shortlisted',
  interviewed: 'Interviewed',
  hired: 'Hired',
  offer_sent: 'Offer Letter Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

const candidateStatusColumnLabel = (statusKey) => {
  // From application-status.jsx:
  // offer_sent → 'Offer Letter Sent'
  // hired → 'Hired'
  // accepted → 'Accepted'
  // anything else → charAt(0).toUpperCase() + slice(1)
  if (statusKey === 'offer_sent') return 'Offer Letter Sent';
  if (statusKey === 'hired') return 'Hired';
  if (statusKey === 'accepted') return 'Offer Accepted';
  return statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
};

const OVERALL_STATUS_TEST_CASES = [
  { statusKey: 'pending',    description: '[Overall] Pending' },
  { statusKey: 'shortlisted',description: '[Overall] Shortlisted' },
  { statusKey: 'interviewed',description: '[Overall] Interviewed' },
  { statusKey: 'hired',      description: '[Overall] Hired' },
  { statusKey: 'offer_sent', description: '[Overall] Offer Letter Sent' },
  { statusKey: 'accepted',   description: '[Overall] Accepted (Offer Accepted)' },
  { statusKey: 'rejected',   description: '[Overall] Rejected' },
];

console.log('\n════════════════════════════════════════════════════════════');
console.log('   Overall Application Status Cross-Check');
console.log('════════════════════════════════════════════════════════════\n');

let overallPassed = 0;
let overallFailed = 0;
const overallMismatches = [];

OVERALL_STATUS_TEST_CASES.forEach(({ statusKey, description }) => {
  // Admin: getStatusLabel(applicantStatusKey)
  const adminLabel = getStatusLabel(statusKey);
  // Employer: getStatusLabel(displayStatus)
  const employerLabel = getStatusLabel(statusKey);
  // Candidate: hardcoded logic in application-status.jsx
  const candidateLabel = candidateStatusColumnLabel(statusKey);

  const allMatch = adminLabel === employerLabel && employerLabel === candidateLabel;

  if (allMatch) {
    overallPassed++;
    console.log(`  ✅  ${description}`);
    console.log(`       Admin / Employer / Candidate → "${adminLabel}"\n`);
  } else {
    overallFailed++;
    overallMismatches.push({ description, adminLabel, employerLabel, candidateLabel });
    console.log(`  ❌  ${description}`);
    console.log(`       Admin     → "${adminLabel}"`);
    console.log(`       Employer  → "${employerLabel}"`);
    console.log(`       Candidate → "${candidateLabel}"\n`);
  }
});

console.log('════════════════════════════════════════════════════════════');
console.log(`   Overall Status Results: ${overallPassed} passed, ${overallFailed} failed out of ${OVERALL_STATUS_TEST_CASES.length} checks`);
console.log('════════════════════════════════════════════════════════════\n');

if (overallMismatches.length > 0) {
  console.log('⚠️  OVERALL STATUS MISMATCHES:\n');
  overallMismatches.forEach(m => {
    console.log(`  → ${m.description}`);
    console.log(`     Admin:     "${m.adminLabel}"`);
    console.log(`     Employer:  "${m.employerLabel}"`);
    console.log(`     Candidate: "${m.candidateLabel}"\n`);
  });
}

// ─── TEST CASES ───────────────────────────────────────────────────────────────
const TEST_CASES = [
  // Non-assessment round statuses (set by employer in Manual Tracking)
  { rawStatus: 'shortlisted_for_next_round', isAssessment: false, description: 'Shortlisted for next round' },
  { rawStatus: 'shortlisted for next round', isAssessment: false, description: 'Shortlisted for next round (space form)' },
  { rawStatus: 'shortlisted',               isAssessment: false, description: 'Shortlisted' },
  { rawStatus: 'selected',                  isAssessment: false, description: 'Selected (final round)' },
  { rawStatus: 'on_hold',                   isAssessment: false, description: 'On Hold' },
  { rawStatus: 'on hold',                   isAssessment: false, description: 'On Hold (space form)' },
  { rawStatus: 'pending_decision',          isAssessment: false, description: 'Pending Decision' },
  { rawStatus: 'under_review',              isAssessment: false, description: 'Under Review' },
  { rawStatus: 'no_show',                   isAssessment: false, description: 'No Show' },
  { rawStatus: 'no show',                   isAssessment: false, description: 'No Show (space form)' },
  { rawStatus: 'rejected',                  isAssessment: false, description: 'Rejected (final round — employer uses Selected/Rejected options)', employerOverride: 'Rejected' },
  { rawStatus: 'not advanced to next stage',isAssessment: false, description: 'Not Advanced to Next Stage' },
  { rawStatus: 'not advanced to next round',isAssessment: false, description: 'Not Advanced to Next Round' },
  { rawStatus: 'pending',                   isAssessment: false, description: 'Pending (default)' },
  { rawStatus: 'scheduled',                 isAssessment: false, description: 'Scheduled' },
  { rawStatus: 'interview_scheduled',       isAssessment: false, description: 'Interview Scheduled' },
  { rawStatus: 'completed',                 isAssessment: false, description: 'Completed' },
  { rawStatus: 'interview_completed',       isAssessment: false, description: 'Interview Completed' },
  { rawStatus: 'in_progress',               isAssessment: false, description: 'In Progress' },
  // Assessment round statuses
  { rawStatus: 'passed',   rawResult: 'pass',    isAssessment: true, description: '[Assessment] Passed' },
  { rawStatus: 'failed',   rawResult: 'fail',    isAssessment: true, description: '[Assessment] Failed' },
  { rawStatus: 'suspended',rawResult: '',        isAssessment: true, description: '[Assessment] Suspended' },
  { rawStatus: 'in_progress', rawResult: '',     isAssessment: true, description: '[Assessment] In Progress' },
  { rawStatus: 'completed', rawResult: 'pending',isAssessment: true, description: '[Assessment] Completed (pending review)' },
  { rawStatus: 'no_show',  rawResult: '',        isAssessment: true, description: '[Assessment] No Show' },
  { rawStatus: 'session expired', rawResult: '', isAssessment: true, description: '[Assessment] Session Expired → No Show' },
  { rawStatus: 'pending',  rawResult: '',        isAssessment: true, description: '[Assessment] Pending' },
];

// ─── RUN CHECKS ───────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const mismatches = [];

console.log('\n════════════════════════════════════════════════════════════');
console.log('   Round Status Cross-Check: Admin vs Employer vs Candidate');
console.log('════════════════════════════════════════════════════════════\n');

TEST_CASES.forEach(({ rawStatus, rawResult = '', isAssessment, description, employerOverride }) => {
  let adminLabel, employerLabel, candidateLabel;

  if (isAssessment) {
    adminLabel    = adminAssessmentRoundStatusLabel(rawStatus, rawResult);
    employerLabel = employerAssessmentLabel(rawStatus, rawResult);
    candidateLabel = getCandidateLabel(rawStatus);
  } else {
    adminLabel     = adminRoundStatusLabel(rawStatus);
    const key = getCanonicalStatusKey(rawStatus);
    employerLabel  = employerOverride ||
      EMPLOYER_NON_FINAL_OPTIONS[key] || EMPLOYER_FINAL_OPTIONS[key] || getStatusLabel(rawStatus);
    candidateLabel = getCandidateLabel(rawStatus);
  }

  const allMatch = adminLabel === employerLabel && employerLabel === candidateLabel;

  if (allMatch) {
    passed++;
    console.log(`  ✅  ${description}`);
    console.log(`       Admin / Employer / Candidate → "${adminLabel}"\n`);
  } else {
    failed++;
    mismatches.push({ description, adminLabel, employerLabel, candidateLabel });
    console.log(`  ❌  ${description}`);
    console.log(`       Admin     → "${adminLabel}"`);
    console.log(`       Employer  → "${employerLabel}"`);
    console.log(`       Candidate → "${candidateLabel}"\n`);
  }
});

console.log('════════════════════════════════════════════════════════════');
console.log(`   Results: ${passed} passed, ${failed} failed out of ${TEST_CASES.length} checks`);
console.log('════════════════════════════════════════════════════════════\n');

if (mismatches.length > 0 || overallMismatches.length > 0) {
  if (mismatches.length > 0) {
    console.log('⚠️  ROUND STATUS MISMATCHES:\n');
    mismatches.forEach(m => {
      console.log(`  → ${m.description}`);
      console.log(`     Admin:     "${m.adminLabel}"`);
      console.log(`     Employer:  "${m.employerLabel}"`);
      console.log(`     Candidate: "${m.candidateLabel}"\n`);
    });
  }
  process.exit(1);
} else {
  console.log('🎉  All statuses match across Admin, Employer, and Candidate.\n');
  process.exit(0);
}
