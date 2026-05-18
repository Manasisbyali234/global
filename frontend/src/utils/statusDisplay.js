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
    case 'selected':
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

export const getApplicationStatusKey = (application = {}, fallback = 'pending') =>
  normalizeApplicationDisplayStatusKey(
    getCanonicalStatusKey(
      application?.applicationStatus ||
        application?.applicationDisplayStatus ||
        application?.displayStatus ||
        application?.status ||
        fallback,
      fallback
    )
  );

export const getInterviewCurrentStatusKey = (application = {}, fallback = 'pending') =>
  getCanonicalStatusKey(
    application?.interviewCurrentStatus ||
      application?.currentInterviewStatus ||
      application?.interviewStatus ||
      application?.applicationStatus ||
      application?.applicationDisplayStatus ||
      application?.displayStatus ||
      application?.status ||
      fallback,
    fallback
  );

export const getAdminApplicantTableStatusKey = (application = {}, fallback = 'pending') => {
  const interviewStatusKey = getInterviewCurrentStatusKey(application, '');
  if (['no_show', 'session_expired', 'expired'].includes(interviewStatusKey)) {
    return 'no_show';
  }
  if (['failed', 'suspended'].includes(interviewStatusKey)) {
    return interviewStatusKey;
  }

  return getCanonicalStatusKey(
    application?.status ||
      application?.applicationStatus ||
      application?.applicationDisplayStatus ||
      application?.displayStatus ||
      fallback,
    fallback
  );
};
