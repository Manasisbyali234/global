const path = require('path');
const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Application = require('../models/Application');
const Job = require('../models/Job');
const InterviewRound = require('../models/InterviewRound');
const InterviewProcess = require('../models/InterviewProcess');
const { sendAssessmentResultPublishedEmail } = require('../utils/emailService');
const { buildUtcDateTimeFromIst } = require('../utils/dateTime');
const { normalizeTimeFormat } = require('../utils/timeUtils');

const RESTRICTION_WARNING_LIMIT = 4;
const RESTRICTION_SUSPEND_THRESHOLD = 5;
const RESTRICTED_WARNING_VIOLATIONS = new Set([
  'tab_switch',
  'window_minimize',
  'window_blur',
  'screen_capture',
  'fullscreen_exit',
  'multi_screen'
]);
const IMMEDIATE_SUSPEND_VIOLATIONS = new Set([
  'screen_capture'
]);

const AUTO_REJECT_ASSESSMENT_SESSION_EXPIRED_NOTE = 'Auto-updated: assessment session expired';
const AUTO_REJECT_ASSESSMENT_SUSPENDED_NOTE = 'Auto-updated: assessment suspended';
const AUTO_REJECT_ASSESSMENT_FAILED_NOTE = 'Auto-updated: assessment failed';

const OBJECTIVE_QUESTION_TYPES = new Set([
  'mcq',
  'visual-mcq',
  'questionary-image-mcq',
  'image-mcq'
]);

const MANUAL_QUESTION_TYPES = new Set([
  'subjective',
  'image',
  'upload'
]);

const isObjectiveQuestionType = (questionType = '') =>
  OBJECTIVE_QUESTION_TYPES.has(String(questionType || '').trim());

const isManualQuestionType = (questionType = '') =>
  MANUAL_QUESTION_TYPES.has(String(questionType || '').trim());

const getDefaultAssignmentState = () => ({
  isAssigned: false,
  assignedJobsCount: 0,
  assignedJobTitles: []
});

const buildAssessmentAssignmentMap = async (employerId, assessmentIds = []) => {
  const normalizedAssessmentIds = Array.from(
    new Set(
      assessmentIds
        .map((assessmentId) => String(assessmentId || '').trim())
        .filter(Boolean)
    )
  );

  const assignmentMap = new Map(
    normalizedAssessmentIds.map((assessmentId) => [assessmentId, getDefaultAssignmentState()])
  );

  if (!employerId || normalizedAssessmentIds.length === 0) {
    return assignmentMap;
  }

  const employerJobs = await Job.find(
    { employerId },
    '_id title assessmentId interviewRoundDetails'
  ).lean();
  const employerJobIds = employerJobs.map((job) => job._id);
  const employerJobTitlesById = new Map(
    employerJobs.map((job) => [String(job._id), job.title || 'Untitled Job'])
  );
  const assignedJobIdsByAssessment = new Map();

  const addJobAssignment = (assessmentId, jobId) => {
    const normalizedAssessmentId = String(assessmentId || '').trim();
    const normalizedJobId = String(jobId || '').trim();

    if (!normalizedAssessmentId || !normalizedJobId || !assignmentMap.has(normalizedAssessmentId)) {
      return;
    }

    if (!assignedJobIdsByAssessment.has(normalizedAssessmentId)) {
      assignedJobIdsByAssessment.set(normalizedAssessmentId, new Set());
    }

    assignedJobIdsByAssessment.get(normalizedAssessmentId).add(normalizedJobId);
  };

  employerJobs.forEach((job) => {
    if (job.assessmentId) {
      addJobAssignment(job.assessmentId, job._id);
    }

    Object.values(job.interviewRoundDetails || {}).forEach((roundDetails) => {
      if (roundDetails?.assessmentId) {
        addJobAssignment(roundDetails.assessmentId, job._id);
      }
    });
  });

  if (employerJobIds.length > 0) {
    const roundAssignments = await InterviewRound.find(
      {
        assessmentId: { $in: normalizedAssessmentIds },
        jobId: { $in: employerJobIds }
      },
      'assessmentId jobId'
    ).lean();

    roundAssignments.forEach((round) => addJobAssignment(round.assessmentId, round.jobId));
  }

  assignedJobIdsByAssessment.forEach((jobIds, assessmentId) => {
    const assignedJobTitles = Array.from(jobIds)
      .map((jobId) => employerJobTitlesById.get(jobId))
      .filter(Boolean);

    assignmentMap.set(assessmentId, {
      isAssigned: jobIds.size > 0,
      assignedJobsCount: jobIds.size,
      assignedJobTitles
    });
  });

  return assignmentMap;
};

const getAssessmentAssignmentState = async (employerId, assessmentId) => {
  const assignmentMap = await buildAssessmentAssignmentMap(employerId, [assessmentId]);
  return assignmentMap.get(String(assessmentId || '').trim()) || getDefaultAssignmentState();
};

const hasCandidateResponse = (answer = {}) =>
  Boolean(
    (typeof answer?.textAnswer === 'string' && answer.textAnswer.trim()) ||
    answer?.uploadedFile?.path ||
    answer?.uploadedFile?.originalName ||
    answer?.uploadedFile?.filename ||
    answer?.uploadedFile?.data ||
    answer?.selectedAnswer === 0 ||
    answer?.selectedAnswer
  );

const normalizeMarksValue = (value, maxMarks) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  const cappedValue = Math.min(Math.max(numericValue, 0), Math.max(Number(maxMarks) || 0, 0));
  return Math.round(cappedValue * 100) / 100;
};

const buildAttemptEvaluationSummary = (assessment, attempt) => {
  const questions = Array.isArray(assessment?.questions) ? assessment.questions : [];
  const answers = Array.isArray(attempt?.answers) ? attempt.answers : [];

  let score = 0;
  let totalAnswered = 0;
  let correctAnswers = 0;
  let manualEvaluationRequiredCount = 0;
  let manualEvaluationCompletedCount = 0;
  let manualEvaluationPendingCount = 0;

  const normalizedAnswers = answers.map((answer) => {
    const question = questions[answer?.questionIndex];
    if (!question) {
      return answer;
    }

    const marks = Number(question?.marks) || 1;
    const normalizedQuestionType = String(question?.type || '').trim();

    if (isObjectiveQuestionType(normalizedQuestionType)) {
      const selectedAnswer = Number.parseInt(answer?.selectedAnswer, 10);
      const correctAnswer = Number.parseInt(question?.correctAnswer, 10);
      const isAnswered = !Number.isNaN(selectedAnswer);
      const isCorrect =
        isAnswered &&
        !Number.isNaN(correctAnswer) &&
        selectedAnswer === correctAnswer;
      const awardedMarks = isCorrect ? marks : 0;

      if (isAnswered) {
        totalAnswered += 1;
      }
      if (isCorrect) {
        correctAnswers += 1;
      }
      score += awardedMarks;

      return {
        ...answer,
        awardedMarks,
        evaluationStatus: 'auto_evaluated',
        evaluationFeedback: answer?.evaluationFeedback || '',
        evaluatedAt: answer?.evaluatedAt || null,
        evaluatedBy: answer?.evaluatedBy || null
      };
    }

    if (isManualQuestionType(normalizedQuestionType)) {
      const hasResponse = hasCandidateResponse(answer);
      if (hasResponse) {
        totalAnswered += 1;
        manualEvaluationRequiredCount += 1;
      }

      if (!hasResponse) {
        return {
          ...answer,
          awardedMarks: 0,
          evaluationStatus: 'auto_evaluated',
          evaluationFeedback: answer?.evaluationFeedback || '',
          evaluatedAt: answer?.evaluatedAt || null,
          evaluatedBy: answer?.evaluatedBy || null
        };
      }

      const awardedMarks = normalizeMarksValue(answer?.awardedMarks, marks);
      const isEvaluated = answer?.evaluationStatus === 'evaluated' && awardedMarks !== null;

      if (isEvaluated) {
        manualEvaluationCompletedCount += 1;
        score += awardedMarks;
      } else {
        manualEvaluationPendingCount += 1;
      }

      return {
        ...answer,
        awardedMarks: isEvaluated ? awardedMarks : null,
        evaluationStatus: isEvaluated ? 'evaluated' : 'pending',
        evaluationFeedback: answer?.evaluationFeedback || '',
        evaluatedAt: isEvaluated ? (answer?.evaluatedAt || null) : null,
        evaluatedBy: isEvaluated ? (answer?.evaluatedBy || null) : null
      };
    }

    if (hasCandidateResponse(answer)) {
      totalAnswered += 1;
    }

    return answer;
  });

  const totalMarks = questions.reduce((sum, question) => sum + (Number(question?.marks) || 1), 0);
  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
  const passingPercentage = Number(assessment?.passingPercentage) || 60;
  const result =
    manualEvaluationPendingCount > 0
      ? 'pending'
      : percentage >= passingPercentage
        ? 'pass'
        : 'fail';

  return {
    normalizedAnswers,
    score: Math.round(score * 100) / 100,
    totalMarks,
    percentage: Math.round(percentage * 100) / 100,
    result,
    correctAnswers,
    totalAnswered,
    manualEvaluationRequiredCount,
    manualEvaluationCompletedCount,
    manualEvaluationPendingCount
  };
};

const resolveAssessmentStageStatus = (attemptStatus, attemptResult) => {
  const normalizedStatus = String(attemptStatus || '').trim().toLowerCase();
  const normalizedResult = String(attemptResult || '').trim().toLowerCase();

  if (normalizedStatus === 'suspended') return 'suspended';
  if (normalizedStatus === 'in_progress') return 'in_progress';
  if (normalizedStatus === 'not_started') return 'pending';
  // If manual evaluation is pending, treat as completed regardless of attempt status
  if (normalizedResult === 'pending') return 'completed';
  if (normalizedResult === 'pass') return 'passed';
  if (normalizedResult === 'fail') return 'failed';
  if (normalizedStatus === 'expired') return 'expired';
  return 'completed';
};

const normalizeApplicationStatusValue = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const ensureApplicationRejectedFromAssessment = async (applicationId, note) => {
  if (!applicationId || !note) {
    return;
  }

  const application = await Application.findById(applicationId).select('status');
  if (!application) {
    return;
  }

  const currentStatus = normalizeApplicationStatusValue(application.status);
  if (['accepted', 'hired', 'offer sent', 'rejected'].includes(currentStatus)) {
    return;
  }

  await Application.findByIdAndUpdate(applicationId, {
    status: 'rejected',
    $push: {
      statusHistory: {
        status: 'rejected',
        changedAt: new Date(),
        notes: note
      }
    }
  });
};

const persistAssessmentOutcome = async ({ attempt, assessment }) => {
  const evaluation = buildAttemptEvaluationSummary(assessment, attempt);

  attempt.answers = evaluation.normalizedAnswers;
  attempt.score = evaluation.score;
  attempt.totalMarks = evaluation.totalMarks;
  attempt.percentage = evaluation.percentage;
  attempt.result = evaluation.result;
  attempt.manualEvaluationRequiredCount = evaluation.manualEvaluationRequiredCount;
  attempt.manualEvaluationCompletedCount = evaluation.manualEvaluationCompletedCount;
  attempt.manualEvaluationPendingCount = evaluation.manualEvaluationPendingCount;

  await attempt.save();

  const statusMap = {
    not_started: 'pending',
    in_progress: 'in_progress',
    completed: 'completed',
    expired: 'expired',
    suspended: 'suspended'
  };

  await Application.findByIdAndUpdate(attempt.applicationId, {
    assessmentStatus: statusMap[attempt.status] || 'pending',
    assessmentScore: evaluation.score,
    assessmentPercentage: evaluation.percentage,
    assessmentResult: evaluation.result,
    assessmentAttemptId: attempt._id
  });

  await updateInterviewProcessAssessmentStage(attempt.applicationId, attempt.assessmentId, {
    status: resolveAssessmentStageStatus(attempt.status, evaluation.result),
    assessmentResult: evaluation.result,
    assessmentScore: evaluation.score,
    assessmentPercentage: evaluation.percentage,
    assessmentCompletedAt: attempt.endTime || attempt.suspendedAt || new Date()
  });

  if (attempt.status === 'expired') {
    await ensureApplicationRejectedFromAssessment(
      attempt.applicationId,
      AUTO_REJECT_ASSESSMENT_SESSION_EXPIRED_NOTE
    );
  } else if (attempt.status === 'suspended') {
    await ensureApplicationRejectedFromAssessment(
      attempt.applicationId,
      AUTO_REJECT_ASSESSMENT_SUSPENDED_NOTE
    );
  } else if (evaluation.result === 'fail') {
    await ensureApplicationRejectedFromAssessment(
      attempt.applicationId,
      AUTO_REJECT_ASSESSMENT_FAILED_NOTE
    );
  }

  return evaluation;
};

const updateInterviewProcessAssessmentStage = async (applicationId, assessmentId, updates = {}) => {
  if (!applicationId || !assessmentId) {
    return;
  }

  const interviewProcess = await InterviewProcess.findOne({ applicationId });
  if (!interviewProcess?.stages?.length) {
    return;
  }

  const matchingStage = interviewProcess.stages.find((stage) =>
    stage?.stageType === 'assessment' &&
    stage?.assessmentId &&
    String(stage.assessmentId) === String(assessmentId)
  );

  if (!matchingStage) {
    return;
  }

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      matchingStage[key] = value;
    }
  });

  interviewProcess.markModified('stages');
  interviewProcess.updateProcessStatus();
  await interviewProcess.save();
};

const normalizeRoundLookupKey = (value = '') =>
  String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const parseScheduledTime = (timeValue = '') => {
  const normalized = normalizeTimeFormat(String(timeValue || '').trim());
  const match = normalized.match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  return {
    hours: Number(match[1]),
    minutes: Number(match[2])
  };
};

const buildScheduledDateTime = (dateValue, timeValue = '', boundary = 'start') => {
  const parsedTime = parseScheduledTime(timeValue);
  const normalizedTime = parsedTime
    ? `${String(parsedTime.hours).padStart(2, '0')}:${String(parsedTime.minutes).padStart(2, '0')}`
    : '';

  return buildUtcDateTimeFromIst(dateValue, normalizedTime, boundary);
};

const findAssessmentRoundDetails = (job = {}, assessmentId, matchedDbRound = null) => {
  const detailsMap = job?.interviewRoundDetails || {};
  if (!detailsMap || typeof detailsMap !== 'object') {
    return null;
  }

  const normalizedAssessmentId = String(assessmentId || '').trim();
  const exactAssessmentMatch = Object.values(detailsMap).find(
    (value) => String(value?.assessmentId || '').trim() === normalizedAssessmentId
  );

  if (exactAssessmentMatch) {
    return exactAssessmentMatch;
  }

  if (matchedDbRound?.key && detailsMap[matchedDbRound.key]) {
    return detailsMap[matchedDbRound.key];
  }

  const fallbackLookupKeys = Array.from(
    new Set(
      [
        matchedDbRound?.key,
        matchedDbRound?.roundType,
        matchedDbRound?.name,
        'assessment'
      ]
        .filter(Boolean)
        .map(normalizeRoundLookupKey)
    )
  );

  const matchedEntry = Object.entries(detailsMap).find(([key, value]) => {
    const detailKeys = [
      key,
      value?.key,
      value?.roundType,
      value?.name,
      value?.interviewRoundId
    ]
      .filter(Boolean)
      .map(normalizeRoundLookupKey);

    return detailKeys.some((detailKey) => fallbackLookupKeys.includes(detailKey));
  });

  return matchedEntry ? matchedEntry[1] : null;
};

const loadAssessmentTimingContext = async ({ applicationId, jobId, assessmentId }) => {
  let application = null;
  let job = null;

  if (applicationId) {
    application = await Application.findById(applicationId).populate({
      path: 'jobId',
      select: 'assessmentId assessmentStartDate assessmentEndDate assessmentStartTime assessmentEndTime interviewRoundDetails'
    });
    job = application?.jobId || null;
  }

  if (!job && jobId) {
    job = await Job.findById(jobId).select(
      'assessmentId assessmentStartDate assessmentEndDate assessmentStartTime assessmentEndTime interviewRoundDetails'
    );
  }

  const resolvedJobId = job?._id || application?.jobId || jobId || null;
  const matchedDbRound = resolvedJobId && assessmentId
    ? await InterviewRound.findOne({
        jobId: resolvedJobId,
        assessmentId
      }).sort({ fromdate: 1, createdAt: -1 })
    : null;

  const roundDetails = findAssessmentRoundDetails(job, assessmentId, matchedDbRound);
  const fromDate =
    matchedDbRound?.fromdate ||
    roundDetails?.fromDate ||
    roundDetails?.date ||
    job?.assessmentStartDate ||
    null;
  const toDate =
    matchedDbRound?.todate ||
    roundDetails?.toDate ||
    roundDetails?.fromDate ||
    roundDetails?.date ||
    job?.assessmentEndDate ||
    fromDate;
  const startTime =
    matchedDbRound?.startTime ||
    roundDetails?.startTime ||
    job?.assessmentStartTime ||
    '';
  const endTime =
    matchedDbRound?.endTime ||
    roundDetails?.endTime ||
    job?.assessmentEndTime ||
    '';

  const windowStartAt = buildScheduledDateTime(fromDate, startTime, 'start');
  const windowEndAt = buildScheduledDateTime(toDate || fromDate, endTime, 'end');
  const now = Date.now();

  return {
    application,
    job,
    matchedDbRound,
    roundDetails,
    windowStartAt,
    windowEndAt,
    isBeforeStart: Boolean(windowStartAt && now < windowStartAt.getTime()),
    isWindowClosed: Boolean(windowEndAt && now >= windowEndAt.getTime())
  };
};

const resolveAttemptTiming = async ({ attempt, assessment, applicationId, jobId }) => {
  const context = await loadAssessmentTimingContext({
    applicationId: applicationId || attempt?.applicationId,
    jobId: jobId || attempt?.jobId,
    assessmentId: attempt?.assessmentId || assessment?._id
  });

  const totalSeconds = Math.max(0, Number(assessment?.timer || 0) * 60);
  const startedAt = attempt?.startTime ? new Date(attempt.startTime) : null;
  const hasValidStartTime = startedAt && !Number.isNaN(startedAt.getTime());
  const durationEndAt = hasValidStartTime
    ? new Date(startedAt.getTime() + totalSeconds * 1000)
    : null;

  let deadlineAt = durationEndAt;
  if (context.windowEndAt && (!deadlineAt || context.windowEndAt.getTime() < deadlineAt.getTime())) {
    deadlineAt = context.windowEndAt;
  }

  const now = Date.now();
  const remainingSeconds = deadlineAt
    ? Math.max(0, Math.ceil((deadlineAt.getTime() - now) / 1000))
    : totalSeconds;

  return {
    ...context,
    totalSeconds,
    startedAt: hasValidStartTime ? startedAt : null,
    durationEndAt,
    deadlineAt,
    remainingSeconds,
    isBeforeStart: Boolean(context.windowStartAt && now < context.windowStartAt.getTime()),
    isExpired: Boolean(deadlineAt && now >= deadlineAt.getTime()),
    isWindowClosed: Boolean(context.windowEndAt && now >= context.windowEndAt.getTime())
  };
};

const expireAttemptAndPersist = async (attempt, endedAt = new Date()) => {
  attempt.status = 'expired';
  attempt.endTime = endedAt;
  attempt.timeRemaining = 0;
  await attempt.save();

  await Application.findByIdAndUpdate(attempt.applicationId, {
    assessmentStatus: 'expired',
    assessmentAttemptId: attempt._id
  });

  await updateInterviewProcessAssessmentStage(attempt.applicationId, attempt.assessmentId, {
    status: 'expired',
    assessmentCompletedAt: attempt.endTime
  });

  await ensureApplicationRejectedFromAssessment(
    attempt.applicationId,
    AUTO_REJECT_ASSESSMENT_SESSION_EXPIRED_NOTE
  );
};

// Employer: Create Assessment
exports.createAssessment = async (req, res) => {
  try {
    const { title, type, designation, description, instructions, timer, questions, passingPercentage, status } = req.body;
    const normalizedStatus = ['draft', 'published'].includes(String(status || '').toLowerCase())
      ? String(status).toLowerCase()
      : 'published';
    
    console.log('Assessment creation request:', {
      title,
      type,
      questionsCount: questions?.length,
      questions: questions?.map((q, i) => ({ index: i, type: q.type, question: q.question?.substring(0, 50) }))
    });
    
    // Additional server-side validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Assessment title is required' });
    }
    
    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required' });
    }
    
    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionType = question.type || 'mcq';
      
      const questionText = question.question ? question.question.replace(/<[^>]*>/g, '').trim() : '';
      if (!questionText && questionType !== 'image-mcq') {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} text is required` 
        });
      }
      
      if (questionType === 'image-mcq' && !question.imageUrl) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} requires an image upload` 
        });
      }
      
      // Validate question type is in allowed enum values
      const allowedTypes = ['mcq', 'visual-mcq', 'questionary-image-mcq', 'image-mcq', 'subjective', 'upload', 'image'];
      if (!allowedTypes.includes(questionType)) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} has invalid type: ${questionType}` 
        });
      }
      
      if (['mcq', 'visual-mcq', 'questionary-image-mcq', 'image-mcq'].includes(questionType)) {
        if (!question.options || question.options.length < 2) {
          return res.status(400).json({ 
            success: false, 
            message: `Question ${i + 1} must have at least 2 options` 
          });
        }
        
        // Check if all options are filled
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j] || question.options[j].trim().length === 0) {
            return res.status(400).json({ 
              success: false, 
              message: `Question ${i + 1}, Option ${String.fromCharCode(65 + j)} is required` 
            });
          }
        }
        
        if (question.correctAnswer === undefined || question.correctAnswer === null || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          return res.status(400).json({ 
            success: false, 
            message: `Question ${i + 1} must have a valid correct answer selected` 
          });
        }
      }
      
      if (!question.marks || question.marks < 1) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} must have at least 1 mark` 
        });
      }
    }
    
    // Generate serial number
    const lastAssessment = await Assessment.findOne({ employerId: req.user._id })
      .sort({ serialNumber: -1 })
      .select('serialNumber');
    
    let serialNumber = 1;
    if (lastAssessment && typeof lastAssessment.serialNumber === 'number' && !isNaN(lastAssessment.serialNumber)) {
      serialNumber = lastAssessment.serialNumber + 1;
    }
    
    const assessment = new Assessment({
      employerId: req.user._id,
      serialNumber,
      title: title.trim(),
      type: type || 'Aptitude Test',
      designation: designation ? designation.trim() : '',
      companyName: req.body.companyName ? req.body.companyName.trim() : '',
      description: description ? description.trim() : '',
      instructions: instructions ? instructions.trim() : '',
      timer: timer || 30,
      totalQuestions: questions.length,
      questions: questions.map(q => ({
        question: q.question ? q.question.trim() : '',
        type: q.type || 'mcq',
        options: (q.type === 'subjective' || q.type === 'upload' || q.type === 'image') ? [] : q.options.map(opt => opt.trim()),
        optionImages: ((q.type === 'visual-mcq' || q.type === 'questionary-image-mcq') && q.optionImages) ? q.optionImages : [],
        correctAnswer: (q.type === 'subjective' || q.type === 'upload' || q.type === 'image') ? null : q.correctAnswer,
        marks: q.marks || 1,
        explanation: q.explanation ? q.explanation.trim() : '',
        imageUrl: q.imageUrl || ''
      })),
      passingPercentage: typeof passingPercentage === 'number' ? passingPercentage : (parseInt(passingPercentage) || 60),
      status: normalizedStatus
    });

    await assessment.save();
    res.status(201).json({ success: true, assessment });
  } catch (error) {
    console.error('Assessment creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create assessment' });
  }
};

// Employer: Get All Assessments
exports.getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ employerId: req.user._id })
      .sort({ serialNumber: 1 });
    const assignmentMap = await buildAssessmentAssignmentMap(
      req.user._id,
      assessments.map((assessment) => assessment._id)
    );

    res.json({
      success: true,
      assessments: assessments.map((assessment) => ({
        ...assessment.toObject(),
        ...(assignmentMap.get(String(assessment._id)) || getDefaultAssignmentState())
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Get Assessment Details
exports.getAssessmentDetails = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      employerId: req.user._id
    });
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Update Assessment
exports.updateAssessment = async (req, res) => {
  try {
    const existingAssessment = await Assessment.findOne({
      _id: req.params.id,
      employerId: req.user._id
    }).select('_id');

    if (!existingAssessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const assignmentState = await getAssessmentAssignmentState(req.user._id, req.params.id);
    if (assignmentState.isAssigned) {
      return res.status(409).json({
        success: false,
        message: 'Assigned assessments cannot be edited.',
        ...assignmentState
      });
    }

    const { title, type, designation, description, instructions, timer, questions, passingPercentage, status } = req.body;
    const normalizedStatus = ['draft', 'published'].includes(String(status || '').toLowerCase())
      ? String(status).toLowerCase()
      : undefined;
    
    // Additional server-side validation (same as create)
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Assessment title is required' });
    }
    
    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required' });
    }
    
    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionType = question.type || 'mcq';
      
      const questionText = question.question ? question.question.replace(/<[^>]*>/g, '').trim() : '';
      if (!questionText && questionType !== 'image-mcq') {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} text is required` 
        });
      }
      
      if (questionType === 'image-mcq' && !question.imageUrl) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} requires an image upload` 
        });
      }
      
      // Validate question type is in allowed enum values
      const allowedTypes = ['mcq', 'visual-mcq', 'questionary-image-mcq', 'image-mcq', 'subjective', 'upload', 'image'];
      if (!allowedTypes.includes(questionType)) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} has invalid type: ${questionType}` 
        });
      }
      
      if (['mcq', 'visual-mcq', 'questionary-image-mcq', 'image-mcq'].includes(questionType)) {
        if (!question.options || question.options.length < 2) {
          return res.status(400).json({ 
            success: false, 
            message: `Question ${i + 1} must have at least 2 options` 
          });
        }
        
        // Check if all options are filled
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j] || question.options[j].trim().length === 0) {
            return res.status(400).json({ 
              success: false, 
              message: `Question ${i + 1}, Option ${String.fromCharCode(65 + j)} is required` 
            });
          }
        }
        
        if (question.correctAnswer === undefined || question.correctAnswer === null || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          return res.status(400).json({ 
            success: false, 
            message: `Question ${i + 1} must have a valid correct answer selected` 
          });
        }
      }
      
      if (!question.marks || question.marks < 1) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} must have at least 1 mark` 
        });
      }
    }
    
    const updateData = {
      title: title.trim(),
      type: type || 'Aptitude Test',
      designation: designation ? designation.trim() : '',
      companyName: req.body.companyName ? req.body.companyName.trim() : '',
      description: description ? description.trim() : '',
      instructions: instructions ? instructions.trim() : '',
      timer: timer || 30,
      totalQuestions: questions.length,
      questions: questions.map(q => ({
        question: q.question ? q.question.trim() : '',
        type: q.type || 'mcq',
        options: (q.type === 'subjective' || q.type === 'upload' || q.type === 'image') ? [] : q.options.map(opt => opt.trim()),
        optionImages: ((q.type === 'visual-mcq' || q.type === 'questionary-image-mcq') && q.optionImages) ? q.optionImages : [],
        correctAnswer: (q.type === 'subjective' || q.type === 'upload' || q.type === 'image') ? null : q.correctAnswer,
        marks: q.marks || 1,
        explanation: q.explanation ? q.explanation.trim() : '',
        imageUrl: q.imageUrl || ''
      })),
      passingPercentage: typeof passingPercentage === 'number' ? passingPercentage : (parseInt(passingPercentage) || 60),
      updatedAt: Date.now()
    };

    if (normalizedStatus) {
      updateData.status = normalizedStatus;
    }
    
    const assessment = await Assessment.findOneAndUpdate(
      { _id: req.params.id, employerId: req.user._id },
      updateData,
      { new: true }
    );

    res.json({ success: true, assessment });
  } catch (error) {
    console.error('Assessment update error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update assessment' });
  }
};

// Employer: Delete Assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      employerId: req.user._id
    });

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const assignmentState = await getAssessmentAssignmentState(req.user._id, req.params.id);
    if (assignmentState.isAssigned) {
      return res.status(409).json({
        success: false,
        message: 'Assigned assessments cannot be deleted.',
        ...assignmentState
      });
    }

    await Assessment.deleteOne({ _id: assessment._id });

    res.json({ success: true, message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Get Available Assessments
exports.getAvailableAssessments = async (req, res) => {
  try {
    const applications = await Application.find({
      candidateId: req.user._id,
      assessmentStatus: 'available'
    }).populate('jobId');
    
    const assessments = [];
    for (const app of applications) {
      if (app.jobId && app.jobId.assessmentId) {
        const assessment = await Assessment.findById(app.jobId.assessmentId)
          .select('-questions.correctAnswer -questions.explanation');
        
        if (assessment) {
          assessments.push({
            ...assessment.toObject(),
            jobTitle: app.jobId.title,
            applicationId: app._id,
            jobId: app.jobId._id
          });
        }
      }
    }
    
    res.json({ success: true, assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Get Assessment for Taking (without answers)
exports.getAssessmentForCandidate = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .select('-questions.correctAnswer -questions.explanation');
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const buildCandidateAttemptResponse = (attempt, assessment, timing = null) => {
  const totalSeconds = Number(assessment?.timer || 0) * 60;
  const startedAt = attempt?.startTime ? new Date(attempt.startTime).getTime() : null;
  const elapsedSeconds = startedAt ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000)) : 0;
  const computedTimeRemaining = Number.isFinite(Number(timing?.remainingSeconds))
    ? Math.max(0, Math.floor(Number(timing.remainingSeconds)))
    : (startedAt ? Math.max(0, totalSeconds - elapsedSeconds) : totalSeconds);

  return {
    _id: attempt._id,
    assessmentId: attempt.assessmentId,
    startTime: attempt.startTime,
    timeRemaining: computedTimeRemaining,
    totalMarks: attempt.totalMarks,
    currentQuestion: attempt.currentQuestion || 0,
    warningCount: attempt.restrictionWarningCount || 0,
    restrictionWarningCount: attempt.restrictionWarningCount || 0,
    status: attempt.status,
    deadlineAt: timing?.deadlineAt || null,
    windowEndAt: timing?.windowEndAt || null,
    answers: attempt.answers || [],
    captureCount: Array.isArray(attempt.captures) ? attempt.captures.length : 0
  };
};

const findLatestCandidateAssessmentAttempt = ({ assessmentId, applicationId, candidateId, jobId }) => {
  const query = {
    assessmentId,
    applicationId,
    candidateId
  };

  if (jobId) {
    query.jobId = jobId;
  }

  return AssessmentAttempt.findOne(query).sort({ createdAt: -1, _id: -1 });
};

exports.getCurrentCandidateAttempt = async (req, res) => {
  try {
    const { assessmentId, applicationId, jobId } = req.query;

    if (!assessmentId || !applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID and Application ID are required'
      });
    }

    const attempt = await findLatestCandidateAssessmentAttempt({
      assessmentId,
      applicationId,
      candidateId: req.user._id,
      jobId
    });

    if (!attempt) {
      return res.json({ success: true, attempt: null });
    }

    const assessment = await Assessment.findById(attempt.assessmentId).select('timer');
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const timing = await resolveAttemptTiming({ attempt, assessment });
    if (attempt.status === 'in_progress' && timing.isExpired) {
      await expireAttemptAndPersist(attempt, timing.deadlineAt || new Date());
    }

    return res.json({
      success: true,
      attempt: buildCandidateAttemptResponse(attempt, assessment, timing)
    });
  } catch (error) {
    console.error('Get current candidate attempt error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Start Assessment
exports.startAssessment = async (req, res) => {
  try {
    const { assessmentId, jobId, applicationId } = req.body;
    
    // Validate input
    if (!assessmentId || !jobId || !applicationId) {
      return res.status(400).json({ success: false, message: 'Assessment ID, Job ID, and Application ID are required' });
    }
    
    console.log(`Starting assessment for candidate ${req.user._id}:`, {
      assessmentId,
      jobId,
      applicationId,
      candidateId: req.user._id
    });
    
    // Check if already attempted
    let attempt = await findLatestCandidateAssessmentAttempt({
      assessmentId,
      applicationId,
      candidateId: req.user._id,
      jobId
    });
    
    if (attempt && attempt.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Assessment already completed. You cannot retake this assessment.' });
    }
    
    if (attempt && attempt.status === 'expired') {
      return res.status(400).json({ success: false, message: 'Assessment time expired. You cannot retake this assessment.' });
    }
    
    if (attempt && attempt.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Assessment access denied. This attempt has been suspended due to repeated rule violations.' });
    }
    
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    // Verify application exists and belongs to candidate
    const application = await Application.findOne({
      _id: applicationId,
      candidateId: req.user._id
    });
    
    if (!application) {
      console.error('Application not found:', {
        applicationId,
        candidateId: req.user._id,
        jobId,
        assessmentId
      });
      return res.status(404).json({ success: false, message: 'Application not found. Please ensure you have applied for this job.' });
    }

    if (application.assessmentStatus === 'suspended') {
      return res.status(403).json({ success: false, message: 'Assessment access denied. This application assessment has already been suspended.' });
    }
    
    // Verify the application is for the correct job
    if (application.jobId.toString() !== jobId.toString()) {
      console.error('Job ID mismatch:', {
        applicationJobId: application.jobId.toString(),
        providedJobId: jobId.toString()
      });
      return res.status(400).json({ success: false, message: 'Job ID mismatch. Please try again.' });
    }
    
    const timingContext = await loadAssessmentTimingContext({ applicationId, jobId, assessmentId });
    if (timingContext.isBeforeStart) {
      return res.status(400).json({
        success: false,
        message: 'Assessment has not started yet. Please wait for the scheduled start time.'
      });
    }

    if (timingContext.isWindowClosed) {
      return res.status(400).json({
        success: false,
        message: 'Assessment window has ended. You cannot start this assessment now.'
      });
    }

    if (!attempt) {
      const totalMarks = assessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
      attempt = new AssessmentAttempt({
        assessmentId,
        candidateId: req.user._id,
        jobId,
        applicationId,
        totalMarks,
        answers: [],
        violations: [],
        restrictionWarningCount: 0
      });
      
      console.log('Created new assessment attempt:', {
        attemptId: attempt._id,
        candidateId: attempt.candidateId,
        assessmentId: attempt.assessmentId,
        applicationId: attempt.applicationId,
        jobId: attempt.jobId
      });
    }

    const resumedTiming = await resolveAttemptTiming({ attempt, assessment, applicationId, jobId });

    if (attempt.status === 'in_progress' && attempt.startTime) {
      if (resumedTiming.isExpired) {
        await expireAttemptAndPersist(attempt, resumedTiming.deadlineAt || new Date());
        return res.status(400).json({
          success: false,
          message: 'Assessment time expired. You cannot retake this assessment.'
        });
      }

      return res.json({
        success: true,
        message: 'Assessment resumed successfully',
        attempt: buildCandidateAttemptResponse(attempt, assessment, resumedTiming)
      });
    }

    const attemptStartTime = new Date();
    const startedTiming = await resolveAttemptTiming({
      attempt: {
        assessmentId,
        applicationId,
        jobId,
        startTime: attemptStartTime
      },
      assessment,
      applicationId,
      jobId
    });

    if (startedTiming.isWindowClosed || startedTiming.isExpired || startedTiming.remainingSeconds <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Assessment window has ended. You cannot start this assessment now.'
      });
    }

    attempt.status = 'in_progress';
    attempt.startTime = attemptStartTime;
    attempt.timeRemaining = startedTiming.remainingSeconds;
    attempt.termsAccepted = true;
    attempt.termsAcceptedAt = new Date();
    attempt.currentQuestion = 0;
    
    await attempt.save();
    
    // Update application status
    await Application.findByIdAndUpdate(applicationId, {
      assessmentStatus: 'in_progress',
      assessmentAttemptId: attempt._id
    });

    await updateInterviewProcessAssessmentStage(applicationId, assessmentId, {
      status: 'in_progress',
      assessmentStartedAt: attempt.startTime
    });
    
    console.log(`Assessment started successfully for candidate ${req.user._id}, attempt ${attempt._id}`);
    
    res.json({ 
      success: true, 
      message: 'Assessment started successfully',
      attempt: buildCandidateAttemptResponse(attempt, assessment, startedTiming)
    });
  } catch (error) {
    console.error('Start assessment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start assessment. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getCandidateAttemptState = async (req, res) => {
  try {
    const attempt = await AssessmentAttempt.findOne({
      _id: req.params.attemptId,
      candidateId: req.user._id
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Assessment attempt not found' });
    }

    const assessment = await Assessment.findById(attempt.assessmentId).select('timer');
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const timing = await resolveAttemptTiming({ attempt, assessment });
    if (attempt.status === 'in_progress' && timing.isExpired) {
      await expireAttemptAndPersist(attempt, timing.deadlineAt || new Date());
    }

    res.json({
      success: true,
      attempt: buildCandidateAttemptResponse(attempt, assessment, timing)
    });
  } catch (error) {
    console.error('Get candidate attempt state error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Submit Answer
exports.submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionIndex, selectedAnswer, textAnswer, timeSpent } = req.body;
    
    // Validate input
    if (!attemptId) {
      return res.status(400).json({ success: false, message: 'Attempt ID is required' });
    }
    
    if (typeof questionIndex !== 'number' || questionIndex < 0) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Assessment attempt not found' });
    }
    
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Assessment is not in progress' });
    }
    
    // Validate question exists
    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment || !assessment.questions[questionIndex]) {
      return res.status(400).json({ success: false, message: 'Question not found' });
    }

    const timing = await resolveAttemptTiming({ attempt, assessment });
    if (timing.isExpired) {
      await expireAttemptAndPersist(attempt, timing.deadlineAt || new Date());
      return res.status(400).json({ success: false, message: 'Assessment time expired' });
    }
    
    const question = assessment.questions[questionIndex];
    
    // Validate answer based on question type
    if (question.type === 'mcq' || question.type === 'visual-mcq' || question.type === 'questionary-image-mcq' || question.type === 'image-mcq') {
      if (selectedAnswer === null || selectedAnswer === undefined) {
        return res.status(400).json({ success: false, message: 'Please select an answer' });
      }
      if (typeof selectedAnswer !== 'number' || selectedAnswer < 0 || selectedAnswer >= question.options.length) {
        return res.status(400).json({ success: false, message: 'Invalid answer option selected' });
      }
    }
    // For subjective, allow empty answers (user might be typing)
    
    // Update or add answer
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionIndex === questionIndex);
    const answerData = {
      questionIndex,
      selectedAnswer: (question.type === 'mcq' || question.type === 'visual-mcq' || question.type === 'questionary-image-mcq' || question.type === 'image-mcq') ? parseInt(selectedAnswer) : null,
      textAnswer: (question.type === 'subjective' || question.type === 'image' || question.type === 'upload') && textAnswer ? textAnswer : null,
      timeSpent: timeSpent || 0,
      answeredAt: new Date()
    };
    
    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }
    
    attempt.currentQuestion = Math.max(attempt.currentQuestion || 0, questionIndex + 1);
    attempt.markModified('answers');
    await attempt.save();
    
    console.log(`Answer submitted for question ${questionIndex} in attempt ${attemptId}:`, {
      questionType: question.type,
      selectedAnswer: answerData.selectedAnswer,
      hasTextAnswer: !!answerData.textAnswer,
      totalAnswers: attempt.answers.length
    });
    
    res.json({ 
      success: true, 
      message: 'Answer saved successfully',
      attempt: {
        _id: attempt._id,
        currentQuestion: attempt.currentQuestion,
        answersCount: attempt.answers.length
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save answer. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Candidate: Upload File Answer
exports.uploadFileAnswer = async (req, res) => {
  try {
    const { attemptId, questionIndex, timeSpent } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Assessment not in progress' });
    }
    
    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment || !assessment.questions[questionIndex]) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }

    const timing = await resolveAttemptTiming({ attempt, assessment });
    if (timing.isExpired) {
      await expireAttemptAndPersist(attempt, timing.deadlineAt || new Date());
      return res.status(400).json({ success: false, message: 'Assessment time expired' });
    }
    
    const question = assessment.questions[questionIndex];
    
    if (question.type !== 'upload' && question.type !== 'image') {
      return res.status(400).json({ success: false, message: 'Question is not an upload type' });
    }
    
    // Store a web-accessible upload path
    const filePath = req.file?.filename
      ? `/uploads/${req.file.filename}`
      : (req.file?.path ? `/uploads/${path.basename(req.file.path)}` : null);
    if (!filePath) {
      return res.status(500).json({ success: false, message: 'Failed to resolve upload path' });
    }
    
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionIndex === parseInt(questionIndex));
    const answerData = {
      questionIndex: parseInt(questionIndex),
      selectedAnswer: null,
      textAnswer: null,
      uploadedFile: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: filePath, // Store file path instead of Base64
        uploadedAt: new Date()
      },
      timeSpent: timeSpent || 0,
      answeredAt: new Date()
    };
    
    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }
    
    attempt.currentQuestion = Math.max(attempt.currentQuestion || 0, parseInt(questionIndex) + 1);
    attempt.markModified('answers');
    await attempt.save();
    
    res.json({ success: true, uploadedFile: answerData.uploadedFile });
  } catch (error) {
    console.error('Upload file answer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadCapture = async (req, res) => {
  try {
    const { attemptId, captureIndex } = req.body;
    
    console.log('📸 Upload capture request:', {
      attemptId,
      captureIndex,
      hasFile: !!req.file,
      fileSize: req.file?.size,
      candidateId: req.user._id
    });
    
    if (!req.file) {
      console.error('❌ No file in upload capture request');
      return res.status(400).json({ success: false, message: 'No capture uploaded' });
    }
    
    if (!attemptId) {
      console.error('❌ No attemptId in upload capture request');
      return res.status(400).json({ success: false, message: 'Attempt ID is required' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });
    
    if (!attempt) {
      console.error('❌ Assessment attempt not found:', {
        attemptId,
        candidateId: req.user._id
      });
      return res.status(404).json({ success: false, message: 'Assessment attempt not found' });
    }
    
    if (attempt.status !== 'in_progress') {
      console.error('❌ Assessment not in progress:', {
        attemptId,
        status: attempt.status
      });
      return res.status(400).json({ success: false, message: 'Assessment is not in progress' });
    }

    const assessment = await Assessment.findById(attempt.assessmentId).select('timer');
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const timing = await resolveAttemptTiming({ attempt, assessment });
    if (timing.isExpired) {
      await expireAttemptAndPersist(attempt, timing.deadlineAt || new Date());
      return res.status(400).json({ success: false, message: 'Assessment time expired' });
    }
    
    // Store a web-accessible upload path
    const filePath = req.file?.filename
      ? `/uploads/${req.file.filename}`
      : (req.file?.path ? `/uploads/${path.basename(req.file.path)}` : null);
    if (!filePath) {
      return res.status(500).json({ success: false, message: 'Failed to resolve capture path' });
    }
    
    if (!attempt.captures) {
      attempt.captures = [];
    }
    
    // Check if we already have 5 captures
    if (attempt.captures.length >= 5) {
      console.warn('⚠️ Maximum captures reached:', {
        attemptId,
        currentCount: attempt.captures.length
      });
      return res.status(400).json({ success: false, message: 'Maximum captures reached' });
    }
    
    attempt.captures.push(filePath);
    await attempt.save();
    
    console.log('✅ Capture uploaded successfully as file path:', {
      attemptId,
      totalCaptures: attempt.captures.length,
      fileSize: req.file.size
    });
    
    res.json({ 
      success: true, 
      captureData: filePath,
      captureCount: attempt.captures.length,
      message: `Capture ${attempt.captures.length}/5 uploaded successfully`
    });
  } catch (error) {
    console.error('❌ Upload capture error:', {
      message: error.message,
      stack: error.stack,
      attemptId: req.body?.attemptId,
      candidateId: req.user?._id
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload capture. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Candidate: Submit Complete Assessment
exports.submitAssessment = async (req, res) => {
  try {
    const { attemptId, violations } = req.body;
    
    // Validate input
    if (!attemptId) {
      return res.status(400).json({ success: false, message: 'Attempt ID is required' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Assessment attempt not found' });
    }
    
    // Check if already completed
    if (attempt.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Assessment already completed' });
    }

    if (attempt.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Assessment has been suspended and cannot be submitted.' });
    }
    
    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    const timing = await resolveAttemptTiming({ attempt, assessment });
    const isExpired = timing.isExpired;
    
    attempt.status = isExpired ? 'expired' : 'completed';
    attempt.endTime = isExpired ? (timing.deadlineAt || new Date()) : new Date();
    attempt.timeRemaining = isExpired ? 0 : Math.max(0, Number(timing.remainingSeconds || 0));
    
    // Merge violations from request with existing violations
    if (!attempt.violations) {
      attempt.violations = [];
    }
    
    if (violations && Array.isArray(violations) && violations.length > 0) {
      // Add new violations that don't already exist
      violations.forEach(v => {
        const exists = attempt.violations.some(existing => 
          existing.type === v.type && existing.timestamp === v.timestamp
        );
        if (!exists) {
          attempt.violations.push(v);
        }
      });
      console.log(`Total violations for attempt ${attemptId}: ${attempt.violations.length}`);
    } else {
      console.log(`No new violations in submission for attempt ${attemptId}, existing: ${attempt.violations.length}`);
    }
    
    attempt.markModified('violations');
    const evaluation = await persistAssessmentOutcome({ attempt, assessment });
    
    console.log(`Assessment submitted successfully for attempt ${attemptId}:`, {
      score: evaluation.score,
      totalMarks: evaluation.totalMarks,
      percentage: evaluation.percentage,
      result: evaluation.result,
      correctAnswers: evaluation.correctAnswers,
      totalAnswered: evaluation.totalAnswered,
      manualEvaluationPendingCount: evaluation.manualEvaluationPendingCount
    });
    
    res.json({ 
      success: true, 
      message: 'Assessment submitted successfully',
      result: {
        score: evaluation.score,
        totalMarks: evaluation.totalMarks,
        percentage: evaluation.percentage,
        result: evaluation.result,
        correctAnswers: evaluation.correctAnswers,
        totalQuestions: assessment.totalQuestions,
        totalAnswered: evaluation.totalAnswered,
        unanswered: assessment.totalQuestions - evaluation.totalAnswered,
        manualEvaluationPendingCount: evaluation.manualEvaluationPendingCount,
        attemptId: attempt._id
      }
    });
  } catch (error) {
    console.error('Assessment submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit assessment. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Candidate: Get Assessment Result
exports.getAssessmentResult = async (req, res) => {
  try {
    const attempt = await AssessmentAttempt.findOne({
      _id: req.params.attemptId,
      candidateId: req.user._id,
      status: { $in: ['completed', 'expired'] }
    }).populate('assessmentId');
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    const evaluation = buildAttemptEvaluationSummary(attempt.assessmentId, attempt);
    
    res.json({ 
      success: true, 
      result: {
        score: evaluation.score,
        totalMarks: evaluation.totalMarks,
        percentage: evaluation.percentage,
        result: evaluation.result,
        status: attempt.status,
        correctAnswers: evaluation.correctAnswers,
        totalQuestions: attempt.assessmentId.totalQuestions,
        violations: attempt.violations,
        manualEvaluationPendingCount: evaluation.manualEvaluationPendingCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Record Violation
exports.recordViolation = async (req, res) => {
  try {
    const { attemptId, type, details } = req.body;
    
    if (!attemptId || !type) {
      return res.status(400).json({ success: false, message: 'Attempt ID and violation type are required' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Assessment attempt not found' });
    }
    
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Assessment is not in progress' });
    }

    const assessment = await Assessment.findById(attempt.assessmentId).select('timer');
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const timing = await resolveAttemptTiming({ attempt, assessment });
    if (timing.isExpired) {
      await expireAttemptAndPersist(attempt, timing.deadlineAt || new Date());
      return res.status(400).json({ success: false, message: 'Assessment time expired' });
    }
    
    if (!attempt.violations) {
      attempt.violations = [];
    }
    
    attempt.violations.push({
      type,
      timestamp: new Date(),
      details: details || `${type} violation detected`
    });

    let suspended = false;
    let warningCount = attempt.restrictionWarningCount || 0;
    const isRestrictedViolation = RESTRICTED_WARNING_VIOLATIONS.has(type);
    const isImmediateSuspensionViolation = IMMEDIATE_SUSPEND_VIOLATIONS.has(type);

    if (isRestrictedViolation) {
      warningCount += 1;
      attempt.restrictionWarningCount = warningCount;

      if (isImmediateSuspensionViolation || warningCount >= RESTRICTION_SUSPEND_THRESHOLD) {
        suspended = true;
        attempt.status = 'suspended';
        attempt.suspendedAt = new Date();
        attempt.suspensionReason = type;

        await Application.findByIdAndUpdate(attempt.applicationId, {
          assessmentStatus: 'suspended',
          assessmentAttemptId: attempt._id
        });

        await updateInterviewProcessAssessmentStage(attempt.applicationId, attempt.assessmentId, {
          status: 'suspended',
          assessmentCompletedAt: attempt.suspendedAt
        });

        await ensureApplicationRejectedFromAssessment(
          attempt.applicationId,
          AUTO_REJECT_ASSESSMENT_SUSPENDED_NOTE
        );
      }
    }
    
    attempt.markModified('violations');
    await attempt.save();
    
    console.log(`Violation recorded for attempt ${attemptId}: ${type}, total: ${attempt.violations.length}, warnings: ${warningCount}, suspended: ${suspended}`);
    
    res.json({ 
      success: true, 
      message: suspended
        ? isImmediateSuspensionViolation
          ? 'Screen capture or recording detected. Assessment suspended immediately.'
          : 'Fifth rule violation detected. Assessment suspended.'
        : isRestrictedViolation
          ? `Violation recorded. Warning ${warningCount}/${RESTRICTION_WARNING_LIMIT}.`
          : 'Violation recorded',
      violationCount: attempt.violations.length,
      warningCount,
      suspended
    });
  } catch (error) {
    console.error('Record violation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record violation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Employer: Get Assessment Results
exports.getAssessmentResults = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      employerId: req.user._id
    });
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    const results = await AssessmentAttempt.find({
      assessmentId: req.params.id,
      status: { $in: ['completed', 'expired', 'suspended'] }
    }).populate('candidateId', 'name email phone')
      .populate('applicationId')
      .populate({
        path: 'jobId',
        select: 'title companyName employerId',
        populate: {
          path: 'employerId',
          select: 'companyName name'
        }
      })
      .sort({ endTime: -1 });
    
    console.log('Raw assessment results:', results.length);
    
    // Ensure violations array exists for each result and convert to plain objects
    const resultsWithViolations = results.map(r => {
      const resultObj = r.toObject();
      const evaluation = buildAttemptEvaluationSummary(assessment, resultObj);
      
      // Debug logging for applicationId and violations
      console.log('Processing result:', {
        attemptId: resultObj._id,
        applicationId: resultObj.applicationId?._id || resultObj.applicationId,
        candidateName: resultObj.candidateId?.name || 'N/A',
        violationsCount: resultObj.violations ? resultObj.violations.length : 0,
        hasViolations: !!resultObj.violations
      });
      
      return {
        ...resultObj,
        score: evaluation.score,
        totalMarks: evaluation.totalMarks,
        percentage: evaluation.percentage,
        result: evaluation.result,
        manualEvaluationRequiredCount: evaluation.manualEvaluationRequiredCount,
        manualEvaluationCompletedCount: evaluation.manualEvaluationCompletedCount,
        manualEvaluationPendingCount: evaluation.manualEvaluationPendingCount,
        violations: Array.isArray(resultObj.violations) ? resultObj.violations : [],
        // Ensure candidate data is available
        candidateId: resultObj.candidateId || {
          name: 'N/A',
          email: 'N/A',
          phone: 'N/A'
        },
        // Ensure applicationId is properly formatted
        applicationId: resultObj.applicationId?._id || resultObj.applicationId || null
      };
    });
    
    console.log('Assessment results with violations:', resultsWithViolations.map(r => ({ 
      id: r._id, 
      violations: r.violations.length,
      violationsArray: r.violations,
      candidateName: r.candidateId?.name || 'N/A',
      candidateEmail: r.candidateId?.email || 'N/A',
      applicationId: r.applicationId
    })));
    
    console.log('Sending response with', resultsWithViolations.length, 'results');
    console.log('Sample result structure:', JSON.stringify(resultsWithViolations[0], null, 2));

    const fallbackJob = results.find((result) => result?.jobId)?.jobId || null;
    const normalizedAssessment = {
      ...assessment.toObject(),
      companyName:
        assessment.companyName ||
        fallbackJob?.companyName ||
        fallbackJob?.employerId?.companyName ||
        fallbackJob?.employerId?.name ||
        '',
      designation:
        assessment.designation ||
        fallbackJob?.title ||
        ''
    };

    res.json({ success: true, assessment: normalizedAssessment, results: resultsWithViolations });
  } catch (error) {
    console.error('Error fetching assessment results:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Get Attempt Details
exports.getAttemptDetails = async (req, res) => {
  try {
    console.log('getAttemptDetails called with attemptId:', req.params.attemptId);
    console.log('Employer ID:', req.user._id);
    
    const attempt = await AssessmentAttempt.findById(req.params.attemptId)
      .populate('candidateId', 'name email phone')
      .populate('assessmentId');
    
    console.log('Found attempt:', !!attempt);
    
    if (!attempt) {
      console.log('Attempt not found for ID:', req.params.attemptId);
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    console.log('Assessment employerId:', attempt.assessmentId?.employerId);
    console.log('Current user ID:', req.user._id);
    
    if (attempt.assessmentId.employerId.toString() !== req.user._id.toString()) {
      console.log('Unauthorized access attempt');
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    console.log('Attempt details - Total answers:', attempt.answers?.length);
    console.log('Attempt details - Answers:', JSON.stringify(attempt.answers, null, 2));

    const attemptObj = attempt.toObject();
    const evaluation = buildAttemptEvaluationSummary(attempt.assessmentId, attemptObj);
    
    res.json({
      success: true,
      attempt: {
        ...attemptObj,
        answers: evaluation.normalizedAnswers,
        score: evaluation.score,
        totalMarks: evaluation.totalMarks,
        percentage: evaluation.percentage,
        result: evaluation.result,
        manualEvaluationRequiredCount: evaluation.manualEvaluationRequiredCount,
        manualEvaluationCompletedCount: evaluation.manualEvaluationCompletedCount,
        manualEvaluationPendingCount: evaluation.manualEvaluationPendingCount
      }
    });
  } catch (error) {
    console.error('Get attempt details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssessmentResultByApplication = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const candidateId = req.user._id;
    const assessmentId = req.query.assessmentId;
    
    console.log('[getAssessmentResultByApplication] Query params:', {
      applicationId,
      candidateId: candidateId.toString(),
      assessmentId: assessmentId || null,
      userRole: req.userRole
    });

    const attemptQuery = {
      applicationId,
      candidateId,
      status: { $in: ['completed', 'expired'] }
    };

    if (assessmentId) {
      attemptQuery.assessmentId = assessmentId;
    }

    const attempt = await AssessmentAttempt.findOne(attemptQuery)
      .sort({ createdAt: -1 })
      .populate('assessmentId');
    
    if (!attempt) {
      console.log('[getAssessmentResultByApplication] No attempt found, checking all records for this application...');
      const allAttempts = await AssessmentAttempt.find({ applicationId }).select('_id candidateId status');
      console.log('[getAssessmentResultByApplication] All attempts for app:', allAttempts);
      return res.status(404).json({ success: false, message: 'Assessment result not found for this application' });
    }
    
    console.log('[getAssessmentResultByApplication] Found attempt:', attempt._id);

    const evaluation = buildAttemptEvaluationSummary(attempt.assessmentId, attempt);
    
    res.json({ 
      success: true, 
      data: {
        result: {
          score: evaluation.score,
          totalMarks: evaluation.totalMarks,
          percentage: evaluation.percentage,
          result: evaluation.result,
          status: attempt.status,
          correctAnswers: evaluation.correctAnswers,
          totalQuestions: attempt.assessmentId.totalQuestions,
          violations: attempt.violations,
          manualEvaluationPendingCount: evaluation.manualEvaluationPendingCount
        },
        assessment: {
          title: attempt.assessmentId.title,
          description: attempt.assessmentId.description,
          passingPercentage: attempt.assessmentId.passingPercentage
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Save manual evaluation for non-MCQ answers
exports.saveManualEvaluation = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { evaluations } = req.body;

    if (!Array.isArray(evaluations)) {
      return res.status(400).json({ success: false, message: 'Evaluations must be an array' });
    }

    const attempt = await AssessmentAttempt.findById(attemptId)
      .populate('assessmentId')
      .populate('candidateId', 'name email')
      .populate({
        path: 'jobId',
        select: 'title companyName employerId',
        populate: {
          path: 'employerId',
          select: 'companyName name'
        }
      });
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Assessment attempt not found' });
    }

    if (!attempt.assessmentId || String(attempt.assessmentId.employerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const assessment = attempt.assessmentId;
    const previousEvaluation = buildAttemptEvaluationSummary(assessment, attempt);
    const evaluationMap = new Map(
      evaluations
        .filter((entry) => entry && Number.isInteger(Number(entry.questionIndex)))
        .map((entry) => [Number(entry.questionIndex), entry])
    );

    attempt.answers = (attempt.answers || []).map((answer) => {
      const question = assessment.questions?.[answer.questionIndex];
      if (!question || !isManualQuestionType(question.type)) {
        return answer;
      }

      const nextEvaluation = evaluationMap.get(Number(answer.questionIndex));
      if (!nextEvaluation) {
        return answer;
      }

      const hasResponse = hasCandidateResponse(answer);
      if (!hasResponse) {
        return {
          ...(answer.toObject?.() || answer),
          awardedMarks: 0,
          evaluationStatus: 'auto_evaluated',
          evaluationFeedback: '',
          evaluatedAt: null,
          evaluatedBy: null
        };
      }

      const awardedMarks = normalizeMarksValue(nextEvaluation.awardedMarks, question.marks || 1);
      if (awardedMarks === null) {
        throw new Error(`Awarded marks are required for question ${answer.questionIndex + 1}`);
      }

      return {
        ...(answer.toObject?.() || answer),
        awardedMarks,
        evaluationStatus: 'evaluated',
        evaluationFeedback: String(nextEvaluation.evaluationFeedback || ''),
        evaluatedAt: new Date(),
        evaluatedBy: req.user._id
      };
    });

    if (attempt.status === 'not_started') {
      attempt.status = 'completed';
    }
    if (!attempt.endTime) {
      attempt.endTime = new Date();
    }

    const evaluation = await persistAssessmentOutcome({ attempt, assessment });
    const shouldNotifyCandidate =
      previousEvaluation.manualEvaluationPendingCount > 0 &&
      evaluation.manualEvaluationPendingCount === 0 &&
      evaluation.result !== 'pending';

    let emailNotificationSent = false;
    if (shouldNotifyCandidate && attempt.candidateId?.email) {
      const assessmentId = attempt.assessmentId?._id || attempt.assessmentId;
      const resultUrl = `${process.env.FRONTEND_URL || 'https://taleglobal.net'}/candidate/assessment-result/${attempt.applicationId}?assessmentId=${assessmentId}`;
      const companyName =
        attempt.jobId?.companyName ||
        attempt.jobId?.employerId?.companyName ||
        attempt.jobId?.employerId?.name ||
        'the hiring company';

      try {
        await sendAssessmentResultPublishedEmail({
          email: attempt.candidateId.email,
          name: attempt.candidateId.name,
          jobTitle: attempt.jobId?.title || assessment?.title || 'your application',
          companyName,
          assessmentTitle: assessment?.title || 'Assessment',
          resultUrl
        });
        emailNotificationSent = true;
      } catch (emailError) {
        console.error('Assessment result notification email failed:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Manual evaluation saved successfully',
      emailNotificationSent,
      attempt: {
        ...attempt.toObject(),
        answers: evaluation.normalizedAnswers,
        score: evaluation.score,
        totalMarks: evaluation.totalMarks,
        percentage: evaluation.percentage,
        result: evaluation.result,
        manualEvaluationRequiredCount: evaluation.manualEvaluationRequiredCount,
        manualEvaluationCompletedCount: evaluation.manualEvaluationCompletedCount,
        manualEvaluationPendingCount: evaluation.manualEvaluationPendingCount
      }
    });
  } catch (error) {
    console.error('Save manual evaluation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to save manual evaluation' });
  }
};

// Upload Question Image
exports.uploadQuestionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload MCQ Option Image
exports.uploadOptionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
