const { buildUtcDateTimeFromIst } = require('./dateTime');

const AUTO_REJECT_EXPIRED_SESSION_NOTE = 'Auto-rejected after application session expired';

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

const MANUAL_EVALUATION_QUESTION_TYPES = new Set([
  'subjective',
  'image',
  'upload'
]);

const getAssessmentRoundOrderKeys = (jobData = {}) => (
  (Array.isArray(jobData?.interviewRoundOrder) ? jobData.interviewRoundOrder : []).filter(
    (roundKey) => String(jobData?.interviewRoundTypes?.[roundKey] || '').toLowerCase() === 'assessment'
  )
);

const normalizeAssessmentId = (value = '') => {
  if (!value) return '';
  if (typeof value === 'object') {
    return String(value?._id || value?.id || '').trim();
  }

  return String(value).trim();
};

const getAssessmentScheduleSource = (jobData = {}, assessmentId = '') => {
  const requestedAssessmentId = normalizeAssessmentId(assessmentId);
  const assessmentRoundKeys = getAssessmentRoundOrderKeys(jobData);
  let roundDetails = null;

  if (requestedAssessmentId) {
    const matchedRoundKey = assessmentRoundKeys.find((roundKey) => (
      normalizeAssessmentId(roundKey) === requestedAssessmentId ||
      normalizeAssessmentId(jobData?.interviewRoundDetails?.[roundKey]?.assessmentId) === requestedAssessmentId
    ));

    if (matchedRoundKey) {
      roundDetails = jobData?.interviewRoundDetails?.[matchedRoundKey] || null;
    }
  }

  if (!roundDetails && assessmentRoundKeys.length > 0) {
    roundDetails = jobData?.interviewRoundDetails?.[assessmentRoundKeys[0]] || null;
  }

  return {
    startDate: roundDetails?.fromDate || roundDetails?.date || jobData?.assessmentStartDate || null,
    endDate: roundDetails?.toDate || roundDetails?.fromDate || roundDetails?.date || jobData?.assessmentEndDate || null,
    startTime: roundDetails?.startTime || jobData?.assessmentStartTime || null,
    endTime: roundDetails?.endTime || jobData?.assessmentEndTime || null
  };
};

const buildScheduledDateTime = (dateValue, timeValue = '', boundary = 'start') => {
  return buildUtcDateTimeFromIst(dateValue, timeValue, boundary);
};

const hasCandidateAssessmentResponse = (answer = {}) => Boolean(
  (typeof answer?.textAnswer === 'string' && answer.textAnswer.trim()) ||
  answer?.uploadedFile?.path ||
  answer?.uploadedFile?.originalName ||
  answer?.uploadedFile?.filename ||
  answer?.selectedAnswer === 0 ||
  answer?.selectedAnswer
);

const attemptHasSavedAnswerActivity = (attempt = {}) => (
  Array.isArray(attempt?.answers) && attempt.answers.some((answer) => hasCandidateAssessmentResponse(answer))
);

const assessmentHasManualEvaluationQuestions = (assessment = {}) => (
  Array.isArray(assessment?.questions) && assessment.questions.some((question) =>
    MANUAL_EVALUATION_QUESTION_TYPES.has(normalizeApplicationStatusValue(question?.type))
  )
);

const attemptContainsManualEvaluationQuestions = (attempt = {}) => {
  if (typeof attempt?.containsManualEvaluationQuestions === 'boolean') {
    return attempt.containsManualEvaluationQuestions;
  }

  if (
    Number(attempt?.manualEvaluationRequiredCount || 0) > 0 ||
    Number(attempt?.manualEvaluationPendingCount || 0) > 0 ||
    Number(attempt?.manualEvaluationCompletedCount || 0) > 0
  ) {
    return true;
  }

  return Boolean(
    attempt?.assessmentId &&
    typeof attempt.assessmentId === 'object' &&
    assessmentHasManualEvaluationQuestions(attempt.assessmentId)
  );
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
  // Result takes priority over session expiry — a passing score on auto-submit is a pass
  if (normalizedResult === 'pass' || normalizedStatus === 'passed') return 'passed';
  if (normalizedResult === 'fail' || normalizedStatus === 'failed') return 'failed';
  if (normalizedResult === 'pending' && ['completed', 'expired'].includes(normalizedStatus)) return 'completed';
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

const isAutoRejectedAfterExpiredSession = (application = {}) => {
  if (normalizeApplicationStatusValue(application?.status) !== 'rejected') {
    return false;
  }

  const latestStatusEntry = getLatestApplicationStatusHistoryEntry(application);
  return normalizeApplicationStatusValue(latestStatusEntry?.status) === 'rejected'
    && String(latestStatusEntry?.notes || '').trim() === AUTO_REJECT_EXPIRED_SESSION_NOTE;
};

const getStatusBeforeExpiredSessionAutoReject = (application = {}) => {
  const statusHistory = Array.isArray(application?.statusHistory) ? application.statusHistory : [];

  for (let index = statusHistory.length - 1; index >= 0; index -= 1) {
    const entry = statusHistory[index];
    const isAutoRejectedEntry = normalizeApplicationStatusValue(entry?.status) === 'rejected'
      && String(entry?.notes || '').trim() === AUTO_REJECT_EXPIRED_SESSION_NOTE;

    if (!isAutoRejectedEntry) {
      continue;
    }

    for (let previousIndex = index - 1; previousIndex >= 0; previousIndex -= 1) {
      const previousStatus = String(statusHistory[previousIndex]?.status || '').trim();
      if (previousStatus) {
        return previousStatus;
      }
    }

    return 'pending';
  }

  return application?.status || 'pending';
};

const getDisplayBaseStatus = (application = {}, options = {}, fallback = 'pending') => {
  const rawBaseStatus = (
    options?.respectExpiredSessionAutoRejectDisplay && isAutoRejectedAfterExpiredSession(application)
      ? getStatusBeforeExpiredSessionAutoReject(application)
      : application?.status
  );

  return getCanonicalStatusKey(rawBaseStatus || '', fallback);
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

const isAssessmentEmployerDecisionStatus = (value = '') => {
  const normalizedStatus = normalizeApplicationStatusValue(value);
  if (!normalizedStatus) return false;

  return [
    'shortlisted for next round',
    'shortlisted',
    'selected',
    'on hold',
    'pending decision',
    'no show',
    'rejected',
    'not advanced to next stage',
    'not advanced to next round'
  ].includes(normalizedStatus);
};

const shouldReflectTrackedStatusInApplicationDisplay = (process = {}, status = '') => {
  const statusKey = getCanonicalStatusKey(status, '');
  if (!statusKey) return false;

  if (PENDING_LIKE_INTERVIEW_STATUSES.has(normalizeApplicationStatusValue(statusKey))) {
    return false;
  }

  if (isPositiveInterviewProcessStatus(statusKey)) {
    return false;
  }

  const processType = normalizeApplicationStatusValue(process?.type || process?.stageType);
  if (processType === 'assessment') {
    return isAssessmentEmployerDecisionStatus(statusKey);
  }

  return true;
};

const isAutoRejectedFromInterviewStageStatus = (application = {}) => {
  if (normalizeApplicationStatusValue(application?.status) !== 'rejected') {
    return false;
  }

  const latestStatusEntry = getLatestApplicationStatusHistoryEntry(application);
  return normalizeApplicationStatusValue(latestStatusEntry?.status) === 'rejected'
    && normalizeApplicationStatusValue(latestStatusEntry?.notes).includes('auto updated from interview stage status');
};

const getManualAutoRejectedStageFallbackStatus = (application = {}, options = {}) => {
  if (!options?.respectManualStageStatusForAutoReject) {
    return '';
  }

  if (!isAutoRejectedFromInterviewStageStatus(application)) {
    return '';
  }

  const manualTrackedProcesses = Array.isArray(application?.interviewProcesses)
    ? application.interviewProcesses.filter(Boolean)
    : [];
  if (manualTrackedProcesses.length === 0) {
    return '';
  }

  const hasRejectedManualProcess = manualTrackedProcesses.some((process) =>
    isRejectedInterviewProcessStatus(process?.status)
  );
  if (hasRejectedManualProcess) {
    return '';
  }

  const rejectedAssessmentStatuses = new Set([
    'no show',
    'suspended',
    'session expired',
    'failed',
    'fail'
  ]);
  if (rejectedAssessmentStatuses.has(normalizeApplicationStatusValue(application?.assessmentStatus))) {
    return '';
  }

  return 'pending';
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

const getAssessmentContextCount = (application = {}, options = {}) => {
  const interviewProcess = options?.interviewProcess || null;
  const configuredAssessmentCount = getAssessmentRoundOrderKeys(application?.jobId || {}).length;
  const manualAssessmentCount = (Array.isArray(application?.interviewProcesses) ? application.interviewProcesses : [])
    .filter((process) => normalizeApplicationStatusValue(process?.type || process?.stageType) === 'assessment')
    .length;
  const stageAssessmentCount = getStageTrackedProcesses(application, interviewProcess)
    .filter((process) => normalizeApplicationStatusValue(process?.type || process?.stageType) === 'assessment')
    .length;
  const directAssessmentCount = application?.jobId?.assessmentId ? 1 : 0;

  return Math.max(
    configuredAssessmentCount,
    manualAssessmentCount,
    stageAssessmentCount,
    directAssessmentCount
  );
};

const hasSingleAssessmentContext = (application = {}, options = {}) =>
  getAssessmentContextCount(application, options) <= 1;

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

const getAssessmentAttemptForWindow = (application = {}, options = {}, assessmentId = '') => {
  const attemptsByAssessmentId = getAssessmentAttemptLookup(application, options);
  const requestedAssessmentId = normalizeAssessmentId(assessmentId);

  if (requestedAssessmentId && attemptsByAssessmentId[requestedAssessmentId]) {
    return attemptsByAssessmentId[requestedAssessmentId];
  }

  if (hasSingleAssessmentContext(application, options)) {
    return getLatestAssessmentAttempt(application, options);
  }

  return null;
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

const hasPendingAssessmentEvaluationAttempt = (application = {}, options = {}) => {
  const attempts = Object.values(getAssessmentAttemptLookup(application, options)).filter(Boolean);
  if (attempts.length === 0) {
    return false;
  }

  return attempts.some((attempt) => {
    const resolvedStatus = resolveAssessmentOutcomeStatus(
      resolveAssessmentAttemptStageStatus(attempt),
      attempt?.result,
      'pending'
    );

    return normalizeApplicationStatusValue(attempt?.result) === 'pending'
      && resolvedStatus === 'completed';
  });
};

const resolveAssessmentOutcomeStatus = (status = '', result = '', fallback = 'pending') => {
  const normalizedStatus = normalizeApplicationStatusValue(status);
  const normalizedResult = normalizeApplicationStatusValue(result);

  // Preserve explicit suspended/in-progress values
  if (normalizedStatus === 'suspended') return 'suspended';
  if (normalizedStatus === 'in progress') return 'in_progress';

  // CUSTOM MAPPING: map student assessment outcomes to admin display statuses
  // 1) Attended -> Passed  => show as 'pending' (manual processing by admin)
  // 2) Attended -> Failed  => show as 'failed' (treated as rejection)
  // 3) Expired  -> Passed  => show as 'pending' (manual submission required)
  // 4) Suspended           => keep 'suspended' (handled above)
  // 5) Expired  -> Failed  => treat as 'no_show' (auto-reject)
  // 6) Expired  -> Not Attended => treat as 'no_show'
  const isExpired = ['expired', 'session expired'].includes(normalizedStatus);
  const isPassed = normalizedResult === 'pass' || normalizedStatus === 'passed';
  const isFailed = normalizedResult === 'fail' || normalizedStatus === 'failed';

  // Attended (not expired) -> Passed => pending
  if (!isExpired && isPassed) return 'pending';

  // Attended (not expired) -> Failed => failed
  if (!isExpired && isFailed) return 'failed';

  // Expired -> Passed => pending (manual submission required)
  if (isExpired && isPassed) return 'pending';

  // Expired -> Failed OR expired with no attendance => no_show
  if (isExpired && (isFailed || !normalizedResult || normalizedResult === 'no show')) return 'no_show';

  // Fallback to previous behavior
  if (normalizedResult === 'pass' || normalizedStatus === 'passed') return 'passed';
  if (normalizedResult === 'fail' || normalizedStatus === 'failed') return 'failed';
  if (normalizedStatus === 'completed') return 'completed';
  if (normalizedStatus === 'expired' || normalizedStatus === 'session expired') {
    // Pending means the candidate submitted answers and is waiting on manual evaluation.
    return normalizedResult ? 'completed' : 'no_show';
  }
  if (normalizedStatus === 'no show') return 'no_show';
  if (!normalizedStatus || ['available', 'not required', 'not started', 'pending', 'scheduled'].includes(normalizedStatus)) {
    return fallback;
  }

  return getCanonicalStatusKey(status, fallback);
};

const getRejectedAssessmentOutcomeStatusKey = (status = '', result = '') => {
  const normalizedStatus = normalizeApplicationStatusValue(status);
  const normalizedResult = normalizeApplicationStatusValue(result);

  if (normalizedStatus === 'suspended') return 'suspended';
  if (['failed', 'fail'].includes(normalizedStatus) || ['failed', 'fail'].includes(normalizedResult)) {
    return 'failed';
  }
  if (['no show', 'session expired'].includes(normalizedStatus)) {
    return 'no_show';
  }

  return '';
};

const isAssessmentWindowClosed = (application = {}, assessmentId = '') => {
  const jobData = application?.jobId;
  if (!jobData || typeof jobData !== 'object') {
    return false;
  }

  const scheduleSource = getAssessmentScheduleSource(jobData, assessmentId);
  const assessmentEndAt = buildScheduledDateTime(scheduleSource.endDate, scheduleSource.endTime, 'end');
  if (assessmentEndAt) {
    return Date.now() > assessmentEndAt.getTime();
  }

  const assessmentStartAt = buildScheduledDateTime(scheduleSource.startDate, scheduleSource.startTime, 'start');
  if (assessmentStartAt) {
    return Date.now() > assessmentStartAt.getTime();
  }

  return false;
};

const getAssessmentWindowIdentifiers = (application = {}) => {
  const jobData = application?.jobId;
  if (!jobData || typeof jobData !== 'object') {
    return [];
  }

  const identifiers = [];
  const assessmentRoundKeys = getAssessmentRoundOrderKeys(jobData);
  assessmentRoundKeys.forEach((roundKey) => {
    const roundAssessmentId = normalizeAssessmentId(jobData?.interviewRoundDetails?.[roundKey]?.assessmentId);
    identifiers.push(roundAssessmentId || String(roundKey || '').trim());
  });

  if (identifiers.length === 0 && jobData?.assessmentId) {
    identifiers.push(normalizeAssessmentId(jobData.assessmentId));
  }

  return [...new Set(identifiers.filter(Boolean))];
};

const hasManualAssessmentAttemptActivityRequiringReview = (application = {}, options = {}, assessmentId = '') => {
  const matchedAttempt = getAssessmentAttemptForWindow(application, options, assessmentId);
  if (!matchedAttempt) {
    return false;
  }

  if (!attemptHasSavedAnswerActivity(matchedAttempt) || !attemptContainsManualEvaluationQuestions(matchedAttempt)) {
    return false;
  }

  const resolvedOutcome = resolveAssessmentOutcomeStatus(
    resolveAssessmentAttemptStageStatus(matchedAttempt),
    matchedAttempt?.result,
    'pending'
  );
  const normalizedResult = normalizeApplicationStatusValue(matchedAttempt?.result);

  return !['passed', 'failed', 'suspended'].includes(getCanonicalStatusKey(resolvedOutcome, 'pending'))
    && !['pass', 'fail'].includes(normalizedResult);
};

const hasExpiredManualAssessmentAttemptActivityRequiringReview = (application = {}, options = {}, assessmentId = '') => {
  if (!hasManualAssessmentAttemptActivityRequiringReview(application, options, assessmentId)) {
    return false;
  }

  const matchedAttempt = getAssessmentAttemptForWindow(application, options, assessmentId);
  const normalizedAttemptStatus = normalizeApplicationStatusValue(matchedAttempt?.status);
  if (['expired', 'completed'].includes(normalizedAttemptStatus)) {
    return true;
  }

  return isAssessmentWindowClosed(application, assessmentId);
};

const hasExpiredAssessmentWindowWithoutActivity = (application = {}, options = {}, assessmentId = '') => {
  const jobData = application?.jobId;
  if (!jobData || typeof jobData !== 'object') {
    return false;
  }

  const hasAssessmentRound = Boolean(jobData?.assessmentId) || getAssessmentRoundOrderKeys(jobData).length > 0;
  if (!hasAssessmentRound) {
    return false;
  }

  const requestedAssessmentId = normalizeAssessmentId(assessmentId);
  if (!requestedAssessmentId && !hasSingleAssessmentContext(application, options)) {
    return getAssessmentWindowIdentifiers(application).some((identifier) =>
      hasExpiredAssessmentWindowWithoutActivity(application, options, identifier)
    );
  }

  const matchedAttempt = getAssessmentAttemptForWindow(application, options, assessmentId);
  if (matchedAttempt) {
    const attemptResult = normalizeApplicationStatusValue(matchedAttempt?.result);
    const attemptStatus = normalizeApplicationStatusValue(matchedAttempt?.status);
    if (
      ['pass', 'passed', 'fail', 'failed', 'pending'].includes(attemptResult) ||
      ['completed', 'passed', 'failed', 'suspended', 'in progress'].includes(attemptStatus) ||
      matchedAttempt?.score !== null && matchedAttempt?.score !== undefined ||
      matchedAttempt?.percentage !== null && matchedAttempt?.percentage !== undefined ||
      attemptHasSavedAnswerActivity(matchedAttempt)
    ) {
      return false;
    }
  } else {
    if (hasSingleAssessmentContext(application, options)) {
      const applicationResult = normalizeApplicationStatusValue(application?.assessmentResult);
      const applicationStatus = normalizeApplicationStatusValue(application?.assessmentStatus);
      if (
        ['pass', 'passed', 'fail', 'failed', 'pending'].includes(applicationResult) ||
        ['completed', 'passed', 'failed', 'suspended', 'in progress'].includes(applicationStatus)
      ) {
        return false;
      }
    }
  }

  const resolvedOutcome = matchedAttempt
    ? resolveAssessmentOutcomeStatus(
        resolveAssessmentAttemptStageStatus(matchedAttempt),
        matchedAttempt?.result,
        'pending'
      )
    : (
      hasSingleAssessmentContext(application, options)
        ? resolveAssessmentOutcomeStatus(application?.assessmentStatus, application?.assessmentResult, 'pending')
        : 'pending'
    );

  if (resolvedOutcome !== 'pending') {
    return false;
  }

  if (hasSingleAssessmentContext(application, options) && application?.assessmentScore !== null && application?.assessmentScore !== undefined) {
    return false;
  }

  if (hasSingleAssessmentContext(application, options) && application?.assessmentPercentage !== null && application?.assessmentPercentage !== undefined) {
    return false;
  }

  if (hasExpiredManualAssessmentAttemptActivityRequiringReview(application, options, assessmentId)) {
    return false;
  }

  return isAssessmentWindowClosed(application, assessmentId);
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
  const singleAssessmentContext = hasSingleAssessmentContext(application, options);
  const matchedAttempt = (
    (processAssessmentId && attemptsByAssessmentId[processAssessmentId]) ||
    (singleAssessmentContext ? getLatestAssessmentAttempt(application, options) : null)
  );

  if (matchedAttempt) {
    if (hasExpiredManualAssessmentAttemptActivityRequiringReview(application, options, processAssessmentId)) {
      return 'completed';
    }

    return resolveAssessmentOutcomeStatus(
      resolveAssessmentAttemptStageStatus(matchedAttempt),
      matchedAttempt?.result,
      'pending'
    );
  }

  const defaultProcessStatus = getCanonicalStatusKey(rawStatus || 'pending');
  const applicationOutcomeStatus = singleAssessmentContext
    ? resolveAssessmentOutcomeStatus(
        application?.assessmentStatus,
        application?.assessmentResult,
        defaultProcessStatus
      )
    : defaultProcessStatus;

  if (
    getCanonicalStatusKey(applicationOutcomeStatus, 'pending') === 'pending' &&
    (processAssessmentId || singleAssessmentContext) &&
    hasExpiredAssessmentWindowWithoutActivity(application, options, processAssessmentId)
  ) {
    return 'no_show';
  }

  return applicationOutcomeStatus;
};

const getResolvedTrackedProcesses = (application = {}, options = {}) => {
  const interviewProcess = options?.interviewProcess || null;
  const trackedProcesses = getMergedTrackedProcesses(application, interviewProcess);

  return trackedProcesses.map((process) => ({
    ...process,
    status: resolveTrackedProcessStatus(process, application, options)
  }));
};

const getPendingEvaluationRecoveryStatus = (application = {}, options = {}) => {
  if (
    !hasPendingAssessmentEvaluationAttempt(application, options) &&
    !hasExpiredManualAssessmentAttemptActivityRequiringReview(application, options)
  ) {
    return '';
  }

  const trackedProcesses = getResolvedTrackedProcesses(application, options);
  const hasRejectedTrackedProcess = trackedProcesses.some((process) =>
    isRejectedInterviewProcessStatus(process?.status)
  );
  if (hasRejectedTrackedProcess) {
    return '';
  }

  const hasFailedRound = Array.isArray(application?.interviewRounds)
    && application.interviewRounds.some((round) => String(round?.status || '').toLowerCase() === 'failed');
  if (hasFailedRound) {
    return '';
  }

  return application?.isSelectedForProcess ? 'shortlisted' : 'pending';
};

const getLatestMeaningfulTrackedStatus = (application = {}, options = {}) => {
  const trackedProcesses = getResolvedTrackedProcesses(application, options);

  // Find the last round that has a meaningful (non-pending) status — this is the
  // furthest-progressed round the candidate has reached.
  for (let index = trackedProcesses.length - 1; index >= 0; index -= 1) {
    const statusKey = getCanonicalStatusKey(trackedProcesses[index]?.status || '', '');
    if (statusKey && !PENDING_LIKE_INTERVIEW_STATUSES.has(normalizeApplicationStatusValue(statusKey))) {
      return statusKey;
    }
  }

  // If all rounds are pending-like but at least one round exists, return empty
  // so the caller can fall back to the base application status.
  return '';
};

const hadOfferSentInStatusHistory = (application = {}) =>
  Array.isArray(application?.statusHistory) &&
  application.statusHistory.some((entry) => {
    const normalized = normalizeApplicationStatusValue(entry?.status);
    return normalized === 'offer sent' || normalized === 'offer_sent';
  });

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

  // If the application was auto-rejected only because the assessment session expired
  // (candidate never actually failed — the browser session timed out), treat it as
  // pending so it is not surfaced as a real rejection to either party.
  if (isAutoRejectedAfterExpiredSession(application)) {
    return getCanonicalStatusKey(getStatusBeforeExpiredSessionAutoReject(application) || 'pending');
  }

  const baseStatus = getDisplayBaseStatus(application, options, 'pending');
  const fallbackBaseStatus = baseStatus === 'under_review' ? 'pending' : baseStatus;
  if (['accepted', 'hired', 'offer_sent'].includes(baseStatus)) {
    return baseStatus;
  }

  // If candidate rejected an offer letter, always show as rejected
  if (baseStatus === 'rejected' && hadOfferSentInStatusHistory(application)) {
    return 'rejected';
  }

  if (getRejectedInterviewInviteDisplayStatus(application, baseStatus)) {
    return 'rejected';
  }

  const manualAutoRejectedStageFallbackStatus = getManualAutoRejectedStageFallbackStatus(application, options);
  if (manualAutoRejectedStageFallbackStatus) {
    return manualAutoRejectedStageFallbackStatus;
  }

  const pendingEvaluationRecoveryStatus = getPendingEvaluationRecoveryStatus(application, options);
  if (pendingEvaluationRecoveryStatus) {
    return pendingEvaluationRecoveryStatus;
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
  // expired + pass result means auto-submitted with passing score — NOT a rejection
  const isExpiredWithPass = assessmentStatus === 'expired' && assessmentResult === 'pass';
  const isExpiredPendingEvaluation = assessmentStatus === 'expired' && assessmentResult === 'pending';
  if (!isExpiredWithPass && !isExpiredPendingEvaluation && (
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
    // expired + pass result means auto-submitted with passing score — NOT a rejection
    if (status === 'expired' && result === 'pass') return false;
    if (status === 'expired' && result === 'pending') return false;
    return rejectedAssessmentStatuses.includes(status)
      || failedStatuses.includes(status)
      || failedStatuses.includes(result);
  });
  if (hasRejectedAttempt) {
    return 'rejected';
  }

  if (hasExpiredAssessmentWindowWithoutActivity(application, options)) {
    return 'rejected';
  }

  const latestTrackedKey = trackedProcesses.length > 0 ? getCanonicalStatusKey(trackedProcesses[trackedProcesses.length - 1]?.status || '', '') : '';
  const NON_REJECTED_EMPLOYER_DECISION_KEYS = new Set(['on_hold', 'pending_decision', 'under_review', 'shortlisted', 'shortlisted_for_next_round', 'selected', 'passed']);
  if (
    baseStatus === 'rejected' &&
    trackedProcesses.length > 0 &&
    !hasRejectedProcess &&
    (isAutoRejectedFromInterviewStageStatus(application) || NON_REJECTED_EMPLOYER_DECISION_KEYS.has(latestTrackedKey))
  ) {
    return application?.isSelectedForProcess ? 'shortlisted' : 'pending';
  }

  // For multiple interview rounds: derive overall status from the latest meaningful
  // tracked process status so the application status stays in sync with round progress.
  const trackedProcessesForStatus = getResolvedTrackedProcesses(application, options);
  const latestTrackedStatus = getLatestMeaningfulTrackedStatus(application, options);
  if (latestTrackedStatus) {
    // Only update Application Status to 'shortlisted' when the FINAL round has status 'selected'.
    // Intermediate positive statuses (shortlisted_for_next_round, shortlisted) do NOT
    // promote the application status — they only indicate round-level progression.
    const lastRoundWithMeaningfulStatus = (() => {
      for (let i = trackedProcessesForStatus.length - 1; i >= 0; i -= 1) {
        const statusKey = getCanonicalStatusKey(trackedProcessesForStatus[i]?.status || '', '');
        if (statusKey && !PENDING_LIKE_INTERVIEW_STATUSES.has(normalizeApplicationStatusValue(statusKey))) {
          return { process: trackedProcessesForStatus[i], index: i };
        }
      }
      return null;
    })();

    const isFinalRound = lastRoundWithMeaningfulStatus !== null &&
      lastRoundWithMeaningfulStatus.index === trackedProcessesForStatus.length - 1;
    const isFinalRoundSelected = isFinalRound &&
      getCanonicalStatusKey(lastRoundWithMeaningfulStatus.process?.status || '', '') === 'selected';

    if (isFinalRoundSelected) {
      return fallbackBaseStatus === 'shortlisted' ? 'shortlisted' : 'pending';
    }
    if (['shortlisted', 'shortlisted_for_next_round', 'on_hold', 'pending_decision', 'under_review', 'selected'].includes(latestTrackedStatus)) {
      return latestTrackedStatus;
    }
    if (
      shouldReflectTrackedStatusInApplicationDisplay(
        lastRoundWithMeaningfulStatus?.process,
        latestTrackedStatus
      ) &&
      isFinalRound
    ) {
      return latestTrackedStatus;
    }
    // Candidate passed a non-final round and next round not started yet.
    // Prevent the raw rejected base status from bleeding through.
    if (!isFinalRound && (latestTrackedStatus === 'passed' || latestTrackedStatus === 'shortlisted' || latestTrackedStatus === 'shortlisted_for_next_round')) {
      return 'pending';
    }
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

  // Same session-expiry guard as getEffectiveApplicationDisplayStatus
  if (isAutoRejectedAfterExpiredSession(application)) {
    return 'pending';
  }

  const baseStatus = getDisplayBaseStatus(application, options, 'pending');
  if (['accepted', 'hired', 'offer_sent'].includes(baseStatus)) {
    return baseStatus;
  }

  const rejectedInviteDisplayStatus = getRejectedInterviewInviteDisplayStatus(application, baseStatus);
  if (rejectedInviteDisplayStatus) {
    return rejectedInviteDisplayStatus;
  }

  const manualAutoRejectedStageFallbackStatus = getManualAutoRejectedStageFallbackStatus(application, options);
  if (manualAutoRejectedStageFallbackStatus) {
    return manualAutoRejectedStageFallbackStatus;
  }

  const pendingEvaluationRecoveryStatus = getPendingEvaluationRecoveryStatus(application, options);
  if (pendingEvaluationRecoveryStatus) {
    return pendingEvaluationRecoveryStatus === 'shortlisted' ? 'pending' : pendingEvaluationRecoveryStatus;
  }

  if (hasExpiredAssessmentWindowWithoutActivity(application, options)) {
    return 'no_show';
  }

  // Guard: if assessment-level fields directly indicate a terminal rejection outcome,
  // return it immediately so a stale/missing attempt lookup cannot flip it to pending.
  const _ics_assessmentOutcomeStatus = getRejectedAssessmentOutcomeStatusKey(
    application?.assessmentStatus,
    application?.assessmentResult
  );
  if (_ics_assessmentOutcomeStatus) {
    return _ics_assessmentOutcomeStatus;
  }
  const _ics_attemptsByAssessmentId = application?.assessmentAttemptsByAssessmentId || {};
  for (const attempt of Object.values(_ics_attemptsByAssessmentId)) {
    const rejectedAttemptStatus = getRejectedAssessmentOutcomeStatusKey(attempt?.status, attempt?.result);
    if (rejectedAttemptStatus) return rejectedAttemptStatus;
  }

  const trackedProcessesForStatus = getResolvedTrackedProcesses(application, options);
  const hasRejectedTrackedProcess = trackedProcessesForStatus.some((process) =>
    isRejectedInterviewProcessStatus(process?.status)
  );
  const latestTrackedKeyICS = trackedProcessesForStatus.length > 0 ? getCanonicalStatusKey(trackedProcessesForStatus[trackedProcessesForStatus.length - 1]?.status || '', '') : '';
  const NON_REJECTED_ICS_KEYS = new Set(['on_hold', 'pending_decision', 'under_review', 'shortlisted', 'shortlisted_for_next_round', 'selected', 'passed']);
  if (
    baseStatus === 'rejected' &&
    trackedProcessesForStatus.length > 0 &&
    !hasRejectedTrackedProcess &&
    (isAutoRejectedFromInterviewStageStatus(application) || NON_REJECTED_ICS_KEYS.has(latestTrackedKeyICS))
  ) {
    return application?.isSelectedForProcess ? 'shortlisted' : 'pending';
  }

  const latestTrackedStatus = getLatestMeaningfulTrackedStatus(application, options);
  if (latestTrackedStatus) {
    const lastRoundWithMeaningfulStatus = (() => {
      for (let i = trackedProcessesForStatus.length - 1; i >= 0; i -= 1) {
        const statusKey = getCanonicalStatusKey(trackedProcessesForStatus[i]?.status || '', '');
        if (statusKey && !PENDING_LIKE_INTERVIEW_STATUSES.has(normalizeApplicationStatusValue(statusKey))) {
          return { process: trackedProcessesForStatus[i], index: i };
        }
      }
      return null;
    })();

    const isFinalRound = lastRoundWithMeaningfulStatus !== null &&
      lastRoundWithMeaningfulStatus.index === trackedProcessesForStatus.length - 1;

    if (isFinalRound || ['shortlisted', 'shortlisted_for_next_round', 'on_hold', 'pending_decision', 'under_review', 'selected'].includes(latestTrackedStatus)) {
      return latestTrackedStatus === 'interviewed' ? 'interview_completed' : latestTrackedStatus;
    }
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
  getAssessmentRoundOrderKeys,
  getAssessmentScheduleSource,
  buildScheduledDateTime,
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
  buildApplicationStatusSnapshot,
  hasExpiredAssessmentWindowWithoutActivity
};
