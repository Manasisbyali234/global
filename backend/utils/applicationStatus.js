const normalizeApplicationStatusValue = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const STATUS_KEY_ALIASES = new Map([
  ['accepted', 'accepted'],
  ['available', 'pending'],
  ['completed', 'completed'],
  ['expired', 'expired'],
  ['fail', 'failed'],
  ['failed', 'failed'],
  ['hired', 'hired'],
  ['in progress', 'in_progress'],
  ['interview completed', 'interview_completed'],
  ['interview scheduled', 'interview_scheduled'],
  ['no show', 'no_show'],
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

const PENDING_LIKE_INTERVIEW_STATUSES = new Set([
  '',
  'available',
  'not required',
  'not started',
  'pending'
]);

const normalizeAssessmentId = (value = '') => {
  if (!value) return '';
  if (typeof value === 'object') {
    return String(value?._id || value?.id || '').trim();
  }

  return String(value).trim();
};

const getCanonicalStatusKey = (value = '', fallback = 'pending') => {
  const normalizedStatus = normalizeApplicationStatusValue(value);
  if (!normalizedStatus) {
    return fallback;
  }

  return STATUS_KEY_ALIASES.get(normalizedStatus) || normalizedStatus.replace(/\s+/g, '_');
};

const resolveAssessmentAttemptStageStatus = (attempt = {}) => {
  const normalizedStatus = normalizeApplicationStatusValue(attempt?.status);
  const normalizedResult = normalizeApplicationStatusValue(attempt?.result);

  if (normalizedStatus === 'suspended') return 'suspended';
  if (normalizedStatus === 'in progress') return 'in_progress';
  if (normalizedStatus === 'not started') return 'pending';
  if (normalizedResult === 'pass' || normalizedStatus === 'passed') return 'passed';
  if (normalizedResult === 'fail' || normalizedStatus === 'failed') return 'failed';
  if (normalizedStatus === 'expired') return 'expired';
  if (normalizedStatus === 'completed') return 'completed';
  return attempt?.status || 'pending';
};

const isAssessmentAttemptDerivedStageStatus = (value = '') => {
  const normalizedStatus = normalizeApplicationStatusValue(value);
  if (!normalizedStatus) return false;

  return [
    'passed',
    'failed',
    'completed',
    'in progress',
    'expired',
    'suspended',
    'session expired',
    'no show'
  ].includes(normalizedStatus);
};

const shouldPreserveAssessmentStageStatus = (value = '') => {
  const normalizedStatus = normalizeApplicationStatusValue(value);
  if (!normalizedStatus) return false;

  return ![
    'pending',
    'scheduled',
    'available',
    'not started'
  ].includes(normalizedStatus) && !isAssessmentAttemptDerivedStageStatus(normalizedStatus);
};

const getLatestApplicationStatusHistoryEntry = (application = {}) => {
  const statusHistory = Array.isArray(application?.statusHistory) ? application.statusHistory : [];

  for (let index = statusHistory.length - 1; index >= 0; index -= 1) {
    if (statusHistory[index]?.status) {
      return statusHistory[index];
    }
  }

  return null;
};

const getInterviewInviteStatusKey = (application = {}) =>
  getCanonicalStatusKey(application?.interviewInvite?.status || '', '');

const getRejectedInterviewInviteDisplayStatus = (application = {}, baseStatus = '') => {
  const inviteStatusKey = getInterviewInviteStatusKey(application);
  if (!['pending', 'shortlisted', 'under_review'].includes(baseStatus)) {
    return '';
  }

  if (['expired', 'no_show'].includes(inviteStatusKey)) {
    return 'no_show';
  }

  if (inviteStatusKey === 'rejected') {
    return 'rejected';
  }

  return '';
};

const isRejectedInterviewProcessStatus = (value = '') => {
  const normalizedStatus = normalizeApplicationStatusValue(value);
  if (!normalizedStatus) return false;

  return [
    'rejected',
    'not advanced to next stage',
    'not advanced to next round',
    'failed',
    'fail',
    'field',
    'no show',
    'expired',
    'suspended',
    'session expired',
    'not eligibal for next round',
    'not eligible for next round'
  ].includes(normalizedStatus);
};

const isPositiveInterviewProcessStatus = (value = '') => {
  const normalizedStatus = normalizeApplicationStatusValue(value);
  if (!normalizedStatus) return false;

  return [
    'shortlisted',
    'shortlisted for next round',
    'selected'
  ].includes(normalizedStatus);
};

const isAutoRejectedFromInterviewStageStatus = (application = {}) => {
  if (normalizeApplicationStatusValue(application?.status) !== 'rejected') {
    return false;
  }

  const latestStatusEntry = getLatestApplicationStatusHistoryEntry(application);
  return normalizeApplicationStatusValue(latestStatusEntry?.status) === 'rejected'
    && normalizeApplicationStatusValue(latestStatusEntry?.notes).includes('auto updated from interview stage status');
};

const getPreferredTrackedProcesses = (application = {}, interviewProcess = null) => {
  const manualProcesses = Array.isArray(application?.interviewProcesses)
    ? application.interviewProcesses.filter(Boolean)
    : [];
  if (manualProcesses.length > 0) {
    return manualProcesses;
  }

  const stages = Array.isArray(interviewProcess?.stages)
    ? interviewProcess.stages
    : Array.isArray(application?.interviewProcess?.stages)
      ? application.interviewProcess.stages
      : [];

  return stages
    .filter(Boolean)
    .map((stage) => ({
      id: stage?._id,
      name: stage?.stageName,
      type: stage?.stageType,
      status: stage?.status
    }));
};

const getStageTrackedProcesses = (application = {}, interviewProcess = null) => {
  const stages = Array.isArray(interviewProcess?.stages)
    ? interviewProcess.stages
    : Array.isArray(application?.interviewProcess?.stages)
      ? application.interviewProcess.stages
      : [];

  return stages
    .filter(Boolean)
    .map((stage) => ({
      id: stage?._id,
      name: stage?.stageName,
      type: stage?.stageType,
      status: stage?.status,
      assessmentId: stage?.assessmentId,
      assessmentAttemptId: stage?.assessmentAttemptId,
      _source: 'stage'
    }));
};

const buildTrackedProcessLookupTokens = (process = {}) => {
  const tokens = new Set();
  const values = [
    process?.id,
    process?._id,
    process?.name,
    process?.stageName,
    process?.type,
    process?.stageType
  ];

  values.forEach((value) => {
    const rawValue = String(value || '').trim();
    if (!rawValue) return;

    tokens.add(rawValue.toLowerCase());
    tokens.add(rawValue.toLowerCase().replace(/[^a-z0-9]/g, ''));
  });

  return tokens;
};

const findMatchingStageProcess = (process = {}, stageProcesses = [], usedIndexes = new Set()) => {
  const manualTokens = buildTrackedProcessLookupTokens(process);
  if (manualTokens.size === 0) {
    return null;
  }

  for (let index = 0; index < stageProcesses.length; index += 1) {
    if (usedIndexes.has(index)) continue;
    const stageTokens = buildTrackedProcessLookupTokens(stageProcesses[index]);
    const hasMatch = [...manualTokens].some((token) => stageTokens.has(token));
    if (hasMatch) {
      usedIndexes.add(index);
      return stageProcesses[index];
    }
  }

  return null;
};

const getMergedTrackedProcesses = (application = {}, interviewProcess = null) => {
  const manualProcesses = Array.isArray(application?.interviewProcesses)
    ? application.interviewProcesses.filter(Boolean)
    : [];
  const stageProcesses = getStageTrackedProcesses(application, interviewProcess);

  if (manualProcesses.length === 0) {
    return stageProcesses;
  }

  const usedStageIndexes = new Set();
  const mergedProcesses = manualProcesses.map((process, index) => {
    const matchedStageProcess =
      findMatchingStageProcess(process, stageProcesses, usedStageIndexes) ||
      (stageProcesses[index] && !usedStageIndexes.has(index)
        ? (usedStageIndexes.add(index), stageProcesses[index])
        : null);
    const manualStatus = normalizeApplicationStatusValue(process?.status);
    const stageStatus = normalizeApplicationStatusValue(matchedStageProcess?.status);

    const shouldPreferStageStatus = (
      (!manualStatus || PENDING_LIKE_INTERVIEW_STATUSES.has(manualStatus)) &&
      stageStatus &&
      !PENDING_LIKE_INTERVIEW_STATUSES.has(stageStatus)
    );

    return {
      ...matchedStageProcess,
      ...process,
      id: process?.id || matchedStageProcess?.id,
      name: process?.name || matchedStageProcess?.name,
      type: process?.type || matchedStageProcess?.type,
      status: shouldPreferStageStatus
        ? matchedStageProcess?.status
        : (process?.status || matchedStageProcess?.status || 'pending'),
      assessmentId: process?.assessmentId || matchedStageProcess?.assessmentId || null,
      assessmentAttemptId: process?.assessmentAttemptId || matchedStageProcess?.assessmentAttemptId || null,
      _source: process?._source || 'manual'
    };
  });

  stageProcesses.forEach((stageProcess, index) => {
    if (!usedStageIndexes.has(index)) {
      mergedProcesses.push(stageProcess);
    }
  });

  return mergedProcesses;
};

const getAssessmentAttemptLookup = (application = {}, options = {}) => {
  if (options?.assessmentAttemptsByAssessmentId && typeof options.assessmentAttemptsByAssessmentId === 'object') {
    return options.assessmentAttemptsByAssessmentId;
  }

  if (application?.assessmentAttemptsByAssessmentId && typeof application.assessmentAttemptsByAssessmentId === 'object') {
    return application.assessmentAttemptsByAssessmentId;
  }

  return {};
};

const getLatestAssessmentAttempt = (application = {}, options = {}) => {
  if (options?.assessmentAttempt) {
    return options.assessmentAttempt;
  }

  if (application?.assessmentAttempt) {
    return application.assessmentAttempt;
  }

  const attempts = Object.values(getAssessmentAttemptLookup(application, options));
  return attempts[0] || null;
};

const resolveAssessmentOutcomeStatus = (status = '', result = '', fallback = 'pending') => {
  const normalizedStatus = normalizeApplicationStatusValue(status);
  const normalizedResult = normalizeApplicationStatusValue(result);

  if (normalizedStatus === 'suspended') return 'suspended';
  if (normalizedStatus === 'in progress') return 'in_progress';
  if (normalizedResult === 'pass' || normalizedStatus === 'passed') return 'passed';
  if (normalizedResult === 'fail' || normalizedStatus === 'failed') return 'failed';
  if (normalizedStatus === 'completed') return 'completed';
  if (normalizedStatus === 'expired') {
    return normalizedResult === 'pending' ? 'completed' : 'no_show';
  }
  if (normalizedStatus === 'session expired') {
    return normalizedResult === 'pending' ? 'completed' : 'no_show';
  }
  if (normalizedStatus === 'no show') return 'no_show';
  if (!normalizedStatus || ['available', 'not required', 'not started', 'pending', 'scheduled'].includes(normalizedStatus)) {
    return fallback;
  }

  return getCanonicalStatusKey(status, fallback);
};

const resolveTrackedProcessStatus = (process = {}, application = {}, options = {}) => {
  const processType = normalizeApplicationStatusValue(process?.type || process?.stageType);
  const rawStatus = String(process?.status || '').trim();

  if (processType !== 'assessment') {
    return getCanonicalStatusKey(rawStatus || 'pending');
  }

  if (shouldPreserveAssessmentStageStatus(rawStatus)) {
    return getCanonicalStatusKey(rawStatus);
  }

  const attemptsByAssessmentId = getAssessmentAttemptLookup(application, options);
  const processAssessmentId = normalizeAssessmentId(process?.assessmentId);
  const matchedAttempt = (
    (processAssessmentId && attemptsByAssessmentId[processAssessmentId]) ||
    getLatestAssessmentAttempt(application, options)
  );

  if (matchedAttempt) {
    return resolveAssessmentOutcomeStatus(
      resolveAssessmentAttemptStageStatus(matchedAttempt),
      matchedAttempt?.result,
      'pending'
    );
  }

  return resolveAssessmentOutcomeStatus(
    application?.assessmentStatus,
    application?.assessmentResult,
    getCanonicalStatusKey(rawStatus || 'pending')
  );
};

const getResolvedTrackedProcesses = (application = {}, options = {}) => {
  const interviewProcess = options?.interviewProcess || null;
  const trackedProcesses = getMergedTrackedProcesses(application, interviewProcess);

  return trackedProcesses.map((process) => ({
    ...process,
    status: resolveTrackedProcessStatus(process, application, options)
  }));
};

const getLatestMeaningfulTrackedStatus = (application = {}, options = {}) => {
  const trackedProcesses = getResolvedTrackedProcesses(application, options);

  for (let index = trackedProcesses.length - 1; index >= 0; index -= 1) {
    const statusKey = getCanonicalStatusKey(trackedProcesses[index]?.status || '', '');
    if (statusKey && !PENDING_LIKE_INTERVIEW_STATUSES.has(normalizeApplicationStatusValue(statusKey))) {
      return statusKey;
    }
  }

  return '';
};

const getEffectiveApplicationDisplayStatus = (application = {}, options = {}) => {
  const explicitDisplayStatus = String(
    application?.applicationStatus ||
    application?.applicationDisplayStatus ||
    application?.displayStatus ||
    ''
  ).trim();
  if (explicitDisplayStatus) {
    return getCanonicalStatusKey(explicitDisplayStatus);
  }

  const baseStatus = getCanonicalStatusKey(application?.status || '', 'pending');
  const fallbackBaseStatus = baseStatus === 'under_review' ? 'pending' : baseStatus;
  if (['accepted', 'hired', 'offer_sent'].includes(baseStatus)) {
    return baseStatus;
  }

  if (getRejectedInterviewInviteDisplayStatus(application, baseStatus)) {
    return 'rejected';
  }

  const trackedProcesses = getResolvedTrackedProcesses(application, options);
  const hasRejectedProcess = trackedProcesses.some((process) =>
    isRejectedInterviewProcessStatus(process?.status)
  );
  if (hasRejectedProcess) {
    return 'rejected';
  }

  const hasFailedRound = Array.isArray(application?.interviewRounds)
    && application.interviewRounds.some((round) => String(round?.status || '').toLowerCase() === 'failed');
  if (hasFailedRound) {
    return 'rejected';
  }

  const assessmentStatus = String(application?.assessmentStatus || '').toLowerCase();
  const assessmentResult = String(application?.assessmentResult || '').toLowerCase();
  const rejectedAssessmentStatuses = ['no_show', 'no show', 'suspended', 'session_expired', 'session expired'];
  const failedStatuses = ['failed', 'fail'];
  const isExpiredPendingEvaluation = assessmentStatus === 'expired' && assessmentResult === 'pending';
  if (!isExpiredPendingEvaluation && (
    rejectedAssessmentStatuses.includes(assessmentStatus) ||
    failedStatuses.includes(assessmentStatus) ||
    failedStatuses.includes(assessmentResult)
  )) {
    return 'rejected';
  }

  const attemptsByAssessmentId = application?.assessmentAttemptsByAssessmentId || {};
  const hasRejectedAttempt = Object.values(attemptsByAssessmentId).some((attempt) => {
    const status = String(attempt?.status || '').toLowerCase();
    const result = String(attempt?.result || '').toLowerCase();
    if (status === 'expired' && result === 'pending') return false;
    return rejectedAssessmentStatuses.includes(status)
      || failedStatuses.includes(status)
      || failedStatuses.includes(result);
  });
  if (hasRejectedAttempt) {
    return 'rejected';
  }

  if (
    baseStatus === 'rejected' &&
    isAutoRejectedFromInterviewStageStatus(application) &&
    trackedProcesses.length > 0 &&
    !hasRejectedProcess
  ) {
    return application?.isSelectedForProcess ? 'shortlisted' : 'pending';
  }

  if (baseStatus === 'pending' && application?.isSelectedForProcess) {
    return 'shortlisted';
  }

  return fallbackBaseStatus;
};

const getInterviewCurrentStatus = (application = {}, options = {}) => {
  const explicitInterviewStatus = String(
    application?.interviewCurrentStatus ||
    application?.currentInterviewStatus ||
    application?.interviewStatus ||
    ''
  ).trim();
  if (explicitInterviewStatus) {
    return getCanonicalStatusKey(explicitInterviewStatus);
  }

  const baseStatus = getCanonicalStatusKey(application?.status || '', 'pending');
  if (['accepted', 'hired', 'offer_sent'].includes(baseStatus)) {
    return baseStatus;
  }

  const rejectedInviteDisplayStatus = getRejectedInterviewInviteDisplayStatus(application, baseStatus);
  if (rejectedInviteDisplayStatus) {
    return rejectedInviteDisplayStatus;
  }

  const latestTrackedStatus = getLatestMeaningfulTrackedStatus(application, options);
  if (latestTrackedStatus) {
    return latestTrackedStatus === 'interviewed' ? 'interview_completed' : latestTrackedStatus;
  }

  if (baseStatus === 'shortlisted' || (baseStatus === 'pending' && application?.isSelectedForProcess)) {
    return 'shortlisted';
  }

  if (baseStatus === 'interviewed') {
    return 'interview_completed';
  }

  if (baseStatus === 'rejected') {
    return 'rejected';
  }

  return 'pending';
};

const buildApplicationStatusSnapshot = (application = {}, options = {}) => {
  const applicationStatus = getEffectiveApplicationDisplayStatus(application, options);

  return {
    applicationStatus,
    applicationDisplayStatus: applicationStatus,
    displayStatus: applicationStatus,
    interviewCurrentStatus: getInterviewCurrentStatus(application, options)
  };
};

module.exports = {
  normalizeApplicationStatusValue,
  normalizeAssessmentId,
  getCanonicalStatusKey,
  resolveAssessmentAttemptStageStatus,
  isAssessmentAttemptDerivedStageStatus,
  shouldPreserveAssessmentStageStatus,
  getLatestApplicationStatusHistoryEntry,
  isRejectedInterviewProcessStatus,
  isPositiveInterviewProcessStatus,
  isAutoRejectedFromInterviewStageStatus,
  getPreferredTrackedProcesses,
  getStageTrackedProcesses,
  getResolvedTrackedProcesses,
  getInterviewCurrentStatus,
  getEffectiveApplicationDisplayStatus,
  buildApplicationStatusSnapshot
};
