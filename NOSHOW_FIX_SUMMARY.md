# Assessment No-Show Status Fix

## Problem Statement
When a candidate doesn't attend an assessment (session expired / no-show), the application status was not being updated to "Rejected" across all pages. The issue occurred when:
- Assessment window expired
- Candidate never started the assessment (no score/attempt data)
- `assessmentStatus = 'expired'` and `assessmentResult = 'pending'`

## Root Cause
The `getAssessmentOutcome` utility treats `expired + pending` as "Pending Review" (for subjective assessments awaiting manual evaluation) rather than "No Show". However, when a candidate never started the assessment (no score data), it should be treated as "No Show" → "Rejected".

## Solution
Enhanced the "No Show" detection logic to check if the assessment window has ended AND the candidate has no assessment activity (no score/percentage data). This distinguishes between:
1. **Completed assessment awaiting review**: `expired + pending + has score` → "Pending Review"
2. **Never started assessment**: `expired + pending + no score` → "No Show" → "Rejected"

## Files Modified

### 1. `frontend/src/app/pannels/employer/components/emp-candidates.jsx`
**Changes:**
- Enhanced `getAssessmentCompletionInfo()` to detect no-show when:
  - Assessment window has ended (`isAfterEnd`)
  - No assessment activity (no score/percentage)
  - Status is `expired` or `session expired`
- Updated `getApplicationDisplayStatus()` to pass `nowTimestamp` to `getAssessmentCompletionInfo()`
- Simplified `assessmentNoShow` logic to rely on enhanced `completionInfo.isNoShow`

**Impact:** Employer candidates list page now correctly shows "Rejected" badge for no-show assessments

### 2. `frontend/src/app/pannels/candidate/components/application-status.jsx`
**Changes:**
- Modified `getApplicationDisplayStatus()` to treat `expired` status as "No Show" when there's no assessment score
- Updated both application-level and attempt-level checks:
  - Application: `assessmentStatus === 'expired' && !hasAssessmentScore` → Rejected
  - Attempts: `attempt.status === 'expired' && !hasAttemptScore` → Rejected

**Impact:** Candidate status page now correctly shows "Rejected" for no-show assessments

## Testing Checklist
- [ ] Employer candidate review page (`/employer/emp-candidate-review/:applicationId`) shows "No Show" on assessment card
- [ ] Employer candidate review page shows "Rejected" application status for no-show
- [ ] Employer candidates list page (`/employer/candidates-list/:jobId`) shows "Rejected" badge instead of "Pending"
- [ ] Candidate status page (`/candidate/status`) shows "Rejected" for no-show assessments
- [ ] Completed assessments awaiting manual evaluation still show "Pending Review" (not affected)
- [ ] Assessments with scores but expired status still work correctly

## Edge Cases Handled
1. **Subjective assessments**: If candidate completed assessment but it expired before manual evaluation, still shows "Pending Review" (not "No Show")
2. **Multiple assessment rounds**: Each assessment is evaluated independently
3. **In-progress assessments**: Not affected by this fix
4. **Suspended assessments**: Continue to show as "Rejected" (existing behavior)

## No Hardcoding
All logic is dynamic and based on:
- Assessment window end time
- Presence of score/percentage data
- Assessment status from database
- No hardcoded values or assumptions
