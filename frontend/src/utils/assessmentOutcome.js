const normalizeAssessmentValue = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const normalizeAssessmentProcessStatus = (value = '') => {
  const normalized = normalizeAssessmentValue(value);
  if (!normalized || normalized === 'not started') {
    return 'pending';
  }

  return normalized.replace(/\s+/g, '_');
};

export const getAssessmentOutcome = ({
  status = '',
  result = '',
  manualEvaluationPendingCount = 0,
} = {}) => {
  const rawStatus = String(status || '').trim().toLowerCase();
  const rawResult = String(result || '').trim().toLowerCase();
  const normalizedStatus = normalizeAssessmentValue(status);
  const normalizedResult = normalizeAssessmentValue(result);
  const pendingManualReview = Number(manualEvaluationPendingCount || 0) > 0;

  const isSuspended = normalizedStatus === 'suspended';
  const isInProgress = normalizedStatus === 'in progress';
  const isPassed =
    !isSuspended &&
    (normalizedResult === 'pass' ||
      normalizedResult === 'passed' ||
      normalizedStatus === 'passed');
  const isFailed =
    !isSuspended &&
    (normalizedResult === 'fail' ||
      normalizedResult === 'failed' ||
      normalizedStatus === 'failed');
  const isCompleted =
    ['completed', 'passed', 'failed'].includes(normalizedStatus) || isPassed || isFailed;
  const isExpired = ['expired', 'session expired'].includes(normalizedStatus);
  const isPendingReview =
    !isSuspended &&
    !isPassed &&
    !isFailed &&
    (pendingManualReview ||
      (normalizedResult === 'pending' && ['completed', 'expired'].includes(normalizedStatus)));
  const isNoShow =
    !isSuspended &&
    !isPassed &&
    !isFailed &&
    !isPendingReview &&
    ['expired', 'session expired', 'no show'].includes(normalizedStatus);

  let outcomeKey = 'pending';
  if (isSuspended) {
    outcomeKey = 'suspended';
  } else if (isPendingReview) {
    outcomeKey = 'pending_review';
  } else if (isPassed) {
    outcomeKey = 'passed';
  } else if (isFailed) {
    outcomeKey = 'failed';
  } else if (isNoShow) {
    outcomeKey = 'no_show';
  } else if (isInProgress) {
    outcomeKey = 'in_progress';
  } else if (isCompleted) {
    outcomeKey = 'completed';
  } else if (normalizedStatus) {
    outcomeKey = normalizedStatus.replace(/\s+/g, '_');
  }

  return {
    rawStatus,
    rawResult,
    normalizedStatus,
    normalizedResult,
    isSuspended,
    isInProgress,
    isPassed,
    isFailed,
    isCompleted,
    isExpired,
    isPendingReview,
    isNoShow,
    outcomeKey,
  };
};

export const getAssessmentOutcomeLabel = (details = {}) => {
  const outcome = getAssessmentOutcome(details);

  switch (outcome.outcomeKey) {
    case 'suspended':
      return 'Suspended';
    case 'pending_review':
      return 'Pending Review';
    case 'passed':
      return 'Passed';
    case 'failed':
      return 'Failed';
    case 'no_show':
      return 'No Show';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    default:
      return 'Pending';
  }
};

export const isAssessmentOutcomeRejected = (details = {}) => {
  const outcome = getAssessmentOutcome(details);
  return outcome.isFailed || outcome.isSuspended || outcome.isNoShow;
};

export const getAssessmentProcessStatus = (details = {}, fallbackStatus = 'pending') => {
  const outcome = getAssessmentOutcome(details);

  if (outcome.isSuspended) {
    return 'suspended';
  }

  if (outcome.isPassed) {
    return 'passed';
  }

  if (outcome.isFailed) {
    return 'failed';
  }

  if (outcome.isNoShow) {
    return 'no_show';
  }

  if (outcome.isInProgress) {
    return 'in_progress';
  }

  if (outcome.isCompleted || outcome.isPendingReview) {
    return 'completed';
  }

  return normalizeAssessmentProcessStatus(fallbackStatus);
};
