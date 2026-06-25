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
  ['under review', 'under_review']
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
  under_review: 'Under Review'
};

const ADMIN_PENDING_LIKE_STATUS_KEYS = new Set([
  'pending',
  'pending_decision',
  'scheduled',
  'under_review',
  'on_hold'
]);

const ADMIN_NO_SHOW_LIKE_STATUS_KEYS = new Set([
  'expired',
  'no_show',
  'session_expired',
  'rejected',
  'not_advanced_to_next_stage',
  'not_advanced_to_next_round',
  'failed',
  'suspended'
]);

export const normalizeStatusValue = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

export const getCanonicalStatusKey = (value = '', fallback = 'pending') => {
  const normalizedStatus = normalizeStatusValue(value);
  if (!normalizedStatus) {
    return fallback;
  }

  return STATUS_KEY_ALIASES.get(normalizedStatus) || normalizedStatus.replace(/\s+/g, '_');
};

export const getStatusLabel = (value = 'pending') => {
  const statusKey = getCanonicalStatusKey(value);
  return STATUS_LABELS[statusKey] || statusKey.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const getAssessmentRejectedStatusKey = (application = {}) => {
  const assessmentStatusKey = getCanonicalStatusKey(
    application?.assessmentStatus ||
      application?.assessmentAttemptStatus ||
      application?.assessmentAttempt?.status ||
      '',
    ''
  );
  const assessmentResultKey = getCanonicalStatusKey(
    application?.assessmentResult ||
      application?.assessmentAttempt?.result ||
      '',
    ''
  );

  if (assessmentStatusKey === 'suspended') return 'suspended';
  if (assessmentStatusKey === 'failed' || assessmentResultKey === 'failed') return 'failed';
  if (['no_show', 'session_expired'].includes(assessmentStatusKey)) return 'no_show';

  const attemptsByAssessmentId = application?.assessmentAttemptsByAssessmentId || {};
  for (const attempt of Object.values(attemptsByAssessmentId)) {
    const attemptStatusKey = getCanonicalStatusKey(attempt?.status || '', '');
    const attemptResultKey = getCanonicalStatusKey(attempt?.result || '', '');

    if (attemptStatusKey === 'suspended') return 'suspended';
    if (attemptStatusKey === 'failed' || attemptResultKey === 'failed') return 'failed';
    if (['no_show', 'session_expired'].includes(attemptStatusKey)) return 'no_show';
  }

  return '';
};

const normalizeApplicationDisplayStatusKey = (statusKey = 'pending') => {
  switch (statusKey) {
    case 'under_review':
    case 'passed':
    case 'completed':
    case 'scheduled':
    case 'in_progress':
    case 'interview_scheduled':
    case 'interview_completed':
    case 'pending_decision':
    case 'on_hold':
      return 'pending';
    case 'shortlisted_for_next_round':
      return 'shortlisted';
    case 'no_show':
    case 'session_expired':
    case 'not_advanced_to_next_round':
    case 'not_advanced_to_next_stage':
      return 'rejected';
    default:
      return statusKey;
  }
};

export const isRejectedStatusKey = (value = '') => {
  const statusKey = getCanonicalStatusKey(value, '');
  return [
    'failed',
    'no_show',
    'not_advanced_to_next_round',
    'not_advanced_to_next_stage',
    'rejected',
    'session_expired',
    'suspended'
  ].includes(statusKey);
};

export const isPositiveInterviewStatusKey = (value = '') => {
  const statusKey = getCanonicalStatusKey(value, '');
  return [
    'selected',
    'shortlisted',
    'shortlisted_for_next_round'
  ].includes(statusKey);
};

export const getApplicationStatusKey = (application = {}, fallback = 'pending') => {
  const explicitApplicationStatusKey = getCanonicalStatusKey(
    application?.applicationStatus ||
      application?.applicationDisplayStatus ||
      application?.displayStatus ||
      '',
    ''
  );
  const rawStatusKey = explicitApplicationStatusKey ||
    getCanonicalStatusKey(application?.status || fallback, fallback);

  // If the raw DB status is a positive terminal state, honour it before normalizing
  const baseStatusKey = getCanonicalStatusKey(application?.status || '', '');
  if (['accepted', 'hired', 'offer_sent'].includes(baseStatusKey)) {
    return baseStatusKey;
  }

  if (rawStatusKey === 'shortlisted_for_next_round') {
    return rawStatusKey;
  }

  const applicationStatusKey = normalizeApplicationDisplayStatusKey(rawStatusKey);

  if (['accepted', 'hired', 'offer_sent', 'rejected'].includes(applicationStatusKey)) {
    return applicationStatusKey;
  }

  if (explicitApplicationStatusKey) {
    return applicationStatusKey;
  }

  const interviewStatusKey = getInterviewCurrentStatusKey(application, '');
  if (isRejectedStatusKey(interviewStatusKey)) {
    return 'rejected';
  }

  return applicationStatusKey;
};

export const getInterviewCurrentStatusKey = (application = {}, fallback = 'pending') => {
  const explicitInterviewStatusKey = getCanonicalStatusKey(
    application?.interviewCurrentStatus ||
      application?.currentInterviewStatus ||
      application?.interviewStatus ||
      '',
    ''
  );
  const assessmentRejectedStatusKey = getAssessmentRejectedStatusKey(application);
  if (assessmentRejectedStatusKey && assessmentRejectedStatusKey !== 'no_show') {
    return assessmentRejectedStatusKey;
  }

  if (explicitInterviewStatusKey) {
    return explicitInterviewStatusKey;
  }

  return assessmentRejectedStatusKey ||
    getCanonicalStatusKey(
      application?.applicationStatus ||
        application?.applicationDisplayStatus ||
        application?.displayStatus ||
        application?.status ||
        fallback,
      fallback
    );
};

export const getAdminApplicantTableStatusKey = (application = {}, fallback = 'pending') => {
  const statusHistory = Array.isArray(application?.statusHistory) ? application.statusHistory : [];
  for (let index = statusHistory.length - 1; index >= 0; index -= 1) {
    const historyStatusKey = getCanonicalStatusKey(statusHistory[index]?.status, '');
    if (!historyStatusKey) continue;
    if (ADMIN_PENDING_LIKE_STATUS_KEYS.has(historyStatusKey)) continue;
    if (ADMIN_NO_SHOW_LIKE_STATUS_KEYS.has(historyStatusKey)) return 'rejected';
    break;
  }

  const applicationStatusKey = getCanonicalStatusKey(
    application?.applicationStatus ||
      application?.applicationDisplayStatus ||
      application?.displayStatus ||
      application?.status ||
      fallback,
    fallback
  );

  // Terminal positive states are never overridden by round statuses
  if (['accepted', 'hired', 'offer_sent'].includes(applicationStatusKey)) {
    return applicationStatusKey;
  }

  const interviewRounds = Array.isArray(application?.interviewRounds) ? application.interviewRounds : [];

  // Check for any definitive rejection status on any round first — this always wins
  const hasRejectedRound = interviewRounds.some((round) => {
    const roundStatusKey = getCanonicalStatusKey(round?.status || '', '');
    return ADMIN_NO_SHOW_LIKE_STATUS_KEYS.has(roundStatusKey);
  });
  if (hasRejectedRound) return 'rejected';

  // Offer letter rejected or any definitive rejection — never override with round statuses
  if (applicationStatusKey === 'rejected') {
    return 'rejected';
  }

  for (let index = interviewRounds.length - 1; index >= 0; index -= 1) {
    const roundStatusKey = getCanonicalStatusKey(interviewRounds[index]?.status, '');
    if (ADMIN_NO_SHOW_LIKE_STATUS_KEYS.has(roundStatusKey)) return 'rejected';
    if (['passed', 'shortlisted', 'shortlisted_for_next_round', 'completed'].includes(roundStatusKey)) return 'pending';
  }

  const interviewStatusKey = getInterviewCurrentStatusKey(application, '');
  if (
    ['no_show', 'session_expired', 'expired'].includes(interviewStatusKey) &&
    !ADMIN_PENDING_LIKE_STATUS_KEYS.has(applicationStatusKey)
  ) {
    return 'rejected';
  }
  if (['failed', 'suspended'].includes(interviewStatusKey)) return interviewStatusKey;

  return applicationStatusKey;
};
