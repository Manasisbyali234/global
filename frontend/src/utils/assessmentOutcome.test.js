import {
  getAssessmentOutcome,
  getAssessmentProcessStatus,
  isAssessmentOutcomeRejected,
} from './assessmentOutcome';

test('expired passed assessments stay passed and are not treated as rejected', () => {
  const details = { status: 'expired', result: 'pass' };

  expect(getAssessmentOutcome(details).isPassed).toBe(true);
  expect(getAssessmentProcessStatus(details, 'pending')).toBe('passed');
  expect(isAssessmentOutcomeRejected(details)).toBe(false);
});

test('expired incomplete assessments are treated as no show and rejected', () => {
  const details = { status: 'expired', result: '' };

  expect(getAssessmentOutcome(details).isNoShow).toBe(true);
  expect(getAssessmentProcessStatus(details, 'pending')).toBe('no_show');
  expect(isAssessmentOutcomeRejected(details)).toBe(true);
});

test('expired submissions pending manual review stay completed and not rejected', () => {
  const details = {
    status: 'expired',
    result: 'pending',
    manualEvaluationPendingCount: 2,
  };

  expect(getAssessmentOutcome(details).isPendingReview).toBe(true);
  expect(getAssessmentProcessStatus(details, 'pending')).toBe('completed');
  expect(isAssessmentOutcomeRejected(details)).toBe(false);
});
