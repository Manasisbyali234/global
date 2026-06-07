import {
  getAdminApplicantTableStatusKey,
  getApplicationStatusKey,
  getInterviewCurrentStatusKey,
} from './statusDisplay';

test('admin overview prefers rejected application status over a no-show interview status', () => {
  expect(
    getAdminApplicantTableStatusKey({
      status: 'no_show',
      applicationStatus: 'rejected',
      interviewCurrentStatus: 'no_show'
    })
  ).toBe('rejected');
});

test('admin overview keeps pending when application status is pending and interview status is expired', () => {
  expect(
    getAdminApplicantTableStatusKey({
      status: 'pending',
      applicationStatus: 'pending',
      interviewCurrentStatus: 'expired'
    })
  ).toBe('pending');
});

test('admin overview resolves shared status rules for backend no-show values', () => {
  expect(
    getAdminApplicantTableStatusKey({
      status: 'no_show',
      applicationStatus: 'pending'
    })
  ).toBe('pending');
});

test('admin overview keeps passed assessment applications pending despite stale no-show interview status', () => {
  expect(
    getAdminApplicantTableStatusKey({
      status: 'pending',
      applicationStatus: 'pending',
      applicationDisplayStatus: 'pending',
      displayStatus: 'pending',
      interviewCurrentStatus: 'no_show',
      assessmentStatus: 'completed',
      assessmentResult: 'pass',
      interviewRounds: [
        {
          name: 'Assessment',
          type: 'assessment',
          status: 'passed',
          assessmentResult: 'Passed'
        },
        {
          name: 'One-on-One / Panel',
          type: 'oneOnOnePanel',
          status: 'pending'
        }
      ]
    })
  ).toBe('pending');
});

test('candidate interview status preserves suspended assessments over stale no-show values', () => {
  const application = {
    status: 'rejected',
    applicationStatus: 'rejected',
    interviewCurrentStatus: 'no_show',
    assessmentStatus: 'suspended',
  };

  expect(getApplicationStatusKey(application)).toBe('rejected');
  expect(getInterviewCurrentStatusKey(application)).toBe('suspended');
});

test('candidate interview status preserves suspended assessment attempts', () => {
  expect(
    getInterviewCurrentStatusKey({
      status: 'rejected',
      interviewCurrentStatus: 'no_show',
      assessmentAttemptsByAssessmentId: {
        assessmentA: { status: 'suspended' },
      },
    })
  ).toBe('suspended');
});
