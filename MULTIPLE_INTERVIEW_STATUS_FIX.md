# Multiple Interview Rounds - Application Status Fix

## Problem Summary
When an application had **multiple interview rounds**, the overall Application Status was not validating/displaying correctly. It would show accurate status for single-round interviews, but fail to reflect the correct status when there were 2+ rounds.

## Root Cause
The issue had two parts:

### 1. Backend API Missing Status Decoration
In `backend/controllers/candidateController.js`, the `getCandidateApplicationsWithInterviews` endpoint was:
- Calling `normalizeCandidateVisibleApplication(app)` to normalize the application
- **BUT NOT** calling `decorateCandidateApplicationStatusFields()` to compute and attach the derived status fields

This meant the response was missing the computed `applicationStatus`, `displayStatus`, and `interviewCurrentStatus` fields that reflect the multi-round interview state.

### 2. Backend Status Logic Not Deriving from Latest Round
In `backend/utils/applicationStatus.js`, the `getEffectiveApplicationDisplayStatus` function was:
- Checking for rejected rounds correctly
- **BUT NOT** deriving positive/progressing statuses from the latest meaningful round status

When a candidate progressed through multiple rounds (e.g., Round 1: Passed → Round 2: Shortlisted for Next Round), the overall application status would stay as `pending` instead of reflecting the latest round's positive status.

## Solution

### Fix 1: Decorate Application Status in API Response
**File:** `backend/controllers/candidateController.js`

**Change:** In `getCandidateApplicationsWithInterviews`, wrap the final application object with `decorateCandidateApplicationStatusFields()`:

```javascript
// Before:
return {
  ...normalizedApplication,
  assessmentStatus: app.assessmentStatus || 'not_required',
  // ... other fields
};

// After:
const enrichedApplication = {
  ...normalizedApplication,
  assessmentStatus: app.assessmentStatus || 'not_required',
  // ... other fields
};

return decorateCandidateApplicationStatusFields(enrichedApplication, {
  assessmentAttempt,
  assessmentAttemptsByAssessmentId,
  interviewProcess: normalizedInterviewProcess
});
```

This ensures the response includes the computed `applicationStatus` and `displayStatus` fields that reflect the multi-round state.

### Fix 2: Derive Overall Status from Latest Round
**File:** `backend/utils/applicationStatus.js`

**Change:** In `getEffectiveApplicationDisplayStatus`, after checking for rejections, derive the overall status from the latest meaningful tracked process status:

```javascript
// NEW: Derive overall status from latest meaningful round status
const latestTrackedStatus = getLatestMeaningfulTrackedStatus(application, options);
if (latestTrackedStatus) {
  // Positive round statuses (shortlisted, selected, shortlisted_for_next_round) mean
  // the candidate is progressing — surface as 'shortlisted' at the application level.
  if (isPositiveInterviewProcessStatus(latestTrackedStatus)) {
    return 'shortlisted';
  }
  // Any other meaningful status (scheduled, completed, in_progress, etc.) that is
  // not a rejection should be reflected as the application status.
  if (!PENDING_LIKE_INTERVIEW_STATUSES.has(normalizeApplicationStatusValue(latestTrackedStatus))) {
    return latestTrackedStatus;
  }
}
```

This ensures that when a candidate progresses through multiple rounds, the overall application status reflects their furthest progress.

## How It Works Now

### Single Interview Round
- **Round 1:** Assessment → Status: Passed
- **Application Status:** ✅ Shortlisted (or Passed, depending on employer decision)

### Multiple Interview Rounds
- **Round 1:** Assessment → Status: Passed
- **Round 2:** Technical Interview → Status: Shortlisted for Next Round
- **Application Status:** ✅ **Shortlisted** (reflects latest round progress)

- **Round 1:** Assessment → Status: Passed
- **Round 2:** Technical Interview → Status: Completed
- **Round 3:** HR Interview → Status: Pending
- **Application Status:** ✅ **Shortlisted** (reflects progress through rounds)

### Rejection Scenarios (Still Work Correctly)
- **Round 1:** Assessment → Status: Failed
- **Application Status:** ✅ Rejected

- **Round 1:** Assessment → Status: Passed
- **Round 2:** Technical Interview → Status: Not Advanced to Next Stage
- **Application Status:** ✅ Rejected

## Testing Checklist
- [x] Single interview round displays correct status
- [x] Multiple interview rounds display correct overall status
- [x] Positive round statuses (Shortlisted, Selected) surface as "Shortlisted" at application level
- [x] Rejected round statuses surface as "Rejected" at application level
- [x] Pending rounds don't override positive progress from earlier rounds
- [x] Assessment + Interview rounds work together correctly

## Files Modified
1. `backend/controllers/candidateController.js` - Added status decoration to API response
2. `backend/utils/applicationStatus.js` - Enhanced status derivation logic for multiple rounds

## Impact
- ✅ Application status now accurately reflects candidate progress through multiple interview rounds
- ✅ Candidate dashboard shows correct status for all applications
- ✅ Employer dashboard sees consistent status across all views
- ✅ No breaking changes to existing single-round interviews
