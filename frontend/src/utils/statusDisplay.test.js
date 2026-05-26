import { getAdminApplicantTableStatusKey } from './statusDisplay';

test('admin overview prefers rejected application status over a no-show interview status', () => {
  expect(
    getAdminApplicantTableStatusKey({
      status: 'no_show',
      applicationStatus: 'rejected',
      interviewCurrentStatus: 'no_show'
    })
  ).toBe('rejected');
});

test('admin overview still shows no show when the application is not terminally rejected', () => {
  expect(
    getAdminApplicantTableStatusKey({
      status: 'pending',
      applicationStatus: 'pending',
      interviewCurrentStatus: 'expired'
    })
  ).toBe('no_show');
});
