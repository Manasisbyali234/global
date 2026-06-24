# Assessment Status Updates & Evaluation Logic
**Scope:** Assessment round statuses, evaluation criteria, and non-assessment round status logic  
**Across:** Candidate · Employer · Admin  
**Source Files:** `applicationStatus.js`, `assessmentController.js`, `assessmentOutcome.js`, `statusDisplay.js`, `noShowHandler.js`

---

## Table of Contents

1. [Status Dimensions Overview](#1-status-dimensions-overview)
2. [Assessment Attempt Status Machine](#2-assessment-attempt-status-machine)
3. [Evaluation Logic per Question Type](#3-evaluation-logic-per-question-type)
4. [Assessment Outcome Resolution](#4-assessment-outcome-resolution)
5. [Application Display Status Resolution](#5-application-display-status-resolution)
6. [Non-Assessment Round Status Logic](#6-non-assessment-round-status-logic)
7. [Status per User Role](#7-status-per-user-role)
8. [Auto-Rejection Rules](#8-auto-rejection-rules)
9. [No-Show Detection](#9-no-show-detection)
10. [Status Alias & Normalization Map](#10-status-alias--normalization-map)

---

## 1. Status Dimensions Overview

Every application carries **three parallel status dimensions** that are computed independently and then merged for display:

| Field | Enum Values | Who Sets It |
|---|---|---|
| `Application.status` | `pending \| shortlisted \| interviewed \| hired \| rejected \| offer_sent \| accepted` | Employer / System |
| `Application.assessmentStatus` | `not_required \| pending \| available \| in_progress \| completed \| expired \| suspended \| no_show` | System (driven by `AssessmentAttempt`) |
| `Application.assessmentResult` | `pass \| fail \| pending` | System (`buildAttemptEvaluationSummary`) |
| `InterviewProcess.stages[].status` | `pending \| scheduled \| in_progress \| completed \| passed \| failed \| expired \| suspended \| cancelled \| no show` | Employer / System |
| `AssessmentAttempt.status` | `not_started \| in_progress \| completed \| expired \| suspended` | System (driven by candidate actions) |
| `AssessmentAttempt.result` | `pass \| fail \| pending` | System (auto) / Employer (manual eval) |

---

## 2. Assessment Attempt Status Machine

### 2.1 State Transitions

```
[not_started]
     │
     │  candidate calls startAssessment()
     ▼
[in_progress]
     │
     ├── candidate submits all answers → [completed]
     │
     ├── timer / window deadline reached (expireAttemptAndPersist) → [expired]
     │
     ├── 5th warning violation OR screen_capture → [suspended]
     │
     └── tab_close / assessment_close_confirmed → [completed] (auto-submit)
```

### 2.2 Triggers for Each Transition

| Transition | Trigger | System Action |
|---|---|---|
| `not_started → in_progress` | `startAssessment()` called | Sets `startTime`, creates attempt, sets `Application.assessmentStatus = in_progress`, updates InterviewProcess stage to `in_progress` |
| `in_progress → completed` | Candidate submits OR tab/page close | Calls `persistAssessmentOutcome()`, evaluates score, updates `Application.assessmentStatus` and `assessmentResult` |
| `in_progress → expired` | `resolveAttemptTiming()` detects deadline passed | Calls `expireAttemptAndPersist()`, evaluates score, rejects if result is `fail` |
| `in_progress → suspended` | `recordViolation()` reaches threshold 5 OR `screen_capture` | Sets `Application.assessmentStatus = suspended`, calls `ensureApplicationRejectedFromAssessment()` |
| Expired + pass result | Auto-submit with passing score at deadline | NOT treated as rejection — candidate passed |
| Expired + fail result | Time ran out with failing score | Calls `ensureApplicationRejectedFromAssessment()` |

### 2.3 Window Closed Before Attempt Started

If the assessment window closes and the candidate never started:

```
isAssessmentWindowClosed() = true
hasExpiredAssessmentWindowWithoutActivity() = true
    ↓
Resolved outcome = "no_show"
    ↓
Application display status = "rejected"
```

This is triggered lazily on fetch (not by a cron) via `resolveTrackedProcessStatus()` / `getEffectiveApplicationDisplayStatus()`.

---

## 3. Evaluation Logic per Question Type

### 3.1 Question Type Categories

| Category | Types | Auto-Graded | Manual Review |
|---|---|---|---|
| **Objective** | `mcq`, `visual-mcq`, `questionary-image-mcq`, `image-mcq` | ✓ Yes | ✗ No |
| **Manual** | `subjective`, `image`, `upload` | ✗ No | ✓ Yes |

### 3.2 `buildAttemptEvaluationSummary()` — Full Scoring Logic

**Source:** `assessmentController.js → buildAttemptEvaluationSummary()`

#### Objective Questions (MCQ family)

```
selectedAnswer (int) === correctAnswer (int)?
    YES → awardedMarks = question.marks
    NO  → awardedMarks = 0
evaluationStatus = "auto_evaluated"
```

Counters updated:
- `totalAnswered += 1` (if answered)
- `correctAnswers += 1` (if correct)
- `score += awardedMarks`

#### Manual Questions (subjective / image / upload)

```
hasCandidateResponse(answer)?
    NO  → awardedMarks = 0, evaluationStatus = "auto_evaluated"
    YES → manualEvaluationRequiredCount += 1
          totalAnswered += 1

          answer.evaluationStatus === "evaluated" AND awardedMarks !== null?
              YES → manualEvaluationCompletedCount += 1
                    score += awardedMarks
                    evaluationStatus = "evaluated"
              NO  → manualEvaluationPendingCount += 1
                    awardedMarks = null
                    evaluationStatus = "pending"
```

#### Final Result Determination

```
totalMarks = sum of all question.marks
percentage = (score / totalMarks) * 100

result =
    manualEvaluationPendingCount > 0  → "pending"   (awaiting employer review)
    percentage >= passingPercentage   → "pass"
    percentage < passingPercentage    → "fail"
```

### 3.3 `hasCandidateResponse()` — Answer Presence Check

An answer is considered responded if ANY of these is truthy:

- `answer.textAnswer` is a non-empty string
- `answer.uploadedFile.path` exists
- `answer.uploadedFile.originalName` exists
- `answer.uploadedFile.filename` exists
- `answer.selectedAnswer === 0` (zero is a valid option index)
- `answer.selectedAnswer` is truthy

### 3.4 `saveManualEvaluation()` — Employer Grades Subjective Answers

**Source:** `assessmentController.js → saveManualEvaluation()`

```
Employer submits evaluations: [{ questionIndex, awardedMarks, evaluationFeedback }]
    ↓
For each manual question with a candidate response:
    normalizeMarksValue(awardedMarks, question.marks)  → caps at maxMarks, rounds to 2dp
    Sets evaluationStatus = "evaluated"
    Sets evaluatedAt, evaluatedBy = req.user._id
    ↓
persistAssessmentOutcome() re-runs full scoring
    ↓
If manualEvaluationPendingCount was > 0 before and is now 0:
    → Email candidate: result published notification
```

**Marks Normalization (`normalizeMarksValue`):**

```
value must be finite number
capped: min=0, max=question.marks
rounded to 2 decimal places
```

---

## 4. Assessment Outcome Resolution

### 4.1 `resolveAssessmentAttemptStageStatus()` — Raw Status → Stage Status

**Source:** `applicationStatus.js`

```
attempt.status = "suspended"         → "suspended"
attempt.status = "in_progress"       → "in_progress"
attempt.status = "not_started"       → "pending"
result = "pass" OR status = "passed" → "passed"   (result takes priority over expiry)
result = "fail" OR status = "failed" → "failed"
result = "pending" AND status in ["completed","expired"] → "completed"
status = "expired"                   → "expired"
status = "completed"                 → "completed"
fallback                             → attempt.status or "pending"
```

### 4.2 `resolveAssessmentOutcomeStatus()` — For Application Display

**Source:** `applicationStatus.js`

This is the critical mapping that converts attempt outcomes to **admin/employer-visible statuses**:

| Attempt State | Result | Display Outcome | Rationale |
|---|---|---|---|
| Not expired | `pass` | `pending` | Passed → admin must process manually |
| Not expired | `fail` | `failed` | Direct rejection |
| Expired | `pass` | `pending` | Auto-submit passed → admin must still process |
| Expired | `fail` | `no_show` | Failed after expiry → treated as no-show |
| Expired | no result / `no show` | `no_show` | Never submitted |
| `suspended` | any | `suspended` | Policy violation |
| `in_progress` | any | `in_progress` | Currently active |
| `completed` | any (non-pass/fail) | `completed` | Submitted, awaiting |

### 4.3 `getAssessmentOutcome()` — Frontend Outcome Object

**Source:** `assessmentOutcome.js`

Computes a rich outcome object from `{ status, result, manualEvaluationPendingCount }`:

| Flag | Condition |
|---|---|
| `isSuspended` | `status === "suspended"` |
| `isInProgress` | `status === "in progress"` |
| `isPassed` | `result === "pass/passed"` OR `status === "passed"` (and not suspended) |
| `isFailed` | `result === "fail/failed"` OR `status === "failed"` (and not suspended) |
| `isExpired` | `status in ["expired", "session expired"]` |
| `isPendingReview` | Not suspended/passed/failed AND (`manualEvaluationPendingCount > 0` OR `result="pending"` with `status in ["completed","expired"]`) |
| `isNoShow` | Not suspended/passed/failed/pendingReview AND (`status in ["session expired","no show"]` OR `status="expired"` with no result) |

**`outcomeKey` priority:** `suspended > pending_review > passed > failed > no_show > in_progress > completed > other`

**Labels returned by `getAssessmentOutcomeLabel()`:**

| outcomeKey | Label |
|---|---|
| `suspended` | Suspended |
| `pending_review` | Pending Review |
| `passed` | Pass |
| `failed` | Fail |
| `no_show` | No Show |
| `in_progress` | In Progress |
| `completed` | Completed |
| default | Pending |

---

## 5. Application Display Status Resolution

### 5.1 `getEffectiveApplicationDisplayStatus()` — Final Display Status

**Source:** `applicationStatus.js`

Priority chain (first match wins):

```
1. Base status is "accepted", "hired", or "offer_sent"
       → return as-is (never overridden)

2. Explicit displayStatus / applicationStatus field set on document
       → use it (but convert to "rejected" if expired no-show)

3. hasExpiredAssessmentWindowWithoutActivity() = true
       → "rejected"

4. isAutoRejectedAfterExpiredSession() = true
       → restore pre-rejection status (browser session timeout, not a real fail)

5. Base status is "rejected" AND offer was previously sent
       → "rejected" (candidate declined offer)

6. holdForPendingFinalNonAssessmentRound
       → "pending" (last round is non-assessment with pending status, earlier rounds passed)

7. getRejectedInterviewInviteDisplayStatus() returns a value
       → "rejected" (candidate rejected or no-showed on invite)

8. getManualAutoRejectedStageFallbackStatus() returns a value
       → "pending" (auto-rejected from stage but no real manual rejection)

9. getPendingEvaluationRecoveryStatus() returns a value
       → "shortlisted" or "pending" (manual eval pending, protect from premature rejection)

10. Any tracked process has rejected status
        → "rejected"

11. Any interviewRound has failed status
        → "rejected"

12. assessmentStatus / assessmentResult indicates hard rejection
        (no_show, suspended, session_expired, failed/fail)
        Exception: expired + pass = NOT rejection
        → "rejected"

13. Any attempt in assessmentAttemptsByAssessmentId is rejected
        → "rejected"

14. Base status is "rejected" BUT tracked processes are positive
    AND (auto-rejected from stage OR last tracked key is non-rejected employer decision)
        → isSelectedForProcess ? "shortlisted" : "pending"

15. Latest meaningful tracked status (last round with non-pending status):
    - Final round, status = "selected"           → "selected"
    - Non-final round with positive status       → "pending"
    - Final round with shortlisted/on_hold/etc.  → return that status
    - shouldReflectTrackedStatusInApplicationDisplay AND final round → return status

16. isSelectedForProcess AND base is "pending"
        → "shortlisted"

17. Base status (under_review normalized to "pending")
```

### 5.2 `getInterviewCurrentStatus()` — Interview Tab Status

**Source:** `applicationStatus.js`

Similar to above but used for the "Interview Current Status" field shown on interview tabs. Key differences:

- `pendingEvaluationRecoveryStatus = "shortlisted"` maps back to `"pending"` here
- `interviewed` base status → `"interview_completed"`
- Returns `"no_show"` (not `"rejected"`) when assessment window expired without activity

### 5.3 `getApplicationStatusKey()` — Frontend Canonical Status

**Source:** `statusDisplay.js`

Maps raw statuses to display keys:

```
under_review / passed / completed / scheduled / in_progress
interview_scheduled / interview_completed / pending_decision / on_hold
    → "pending"

shortlisted_for_next_round
    → "shortlisted" (for display only; not in getEffectiveApplicationDisplayStatus)

no_show / session_expired / not_advanced_to_next_round / not_advanced_to_next_stage
    → "rejected"

accepted / hired / offer_sent → as-is
```

---

## 6. Non-Assessment Round Status Logic

### 6.1 Stage Status Values (InterviewProcess.stages[].status)

```
pending → scheduled → in_progress → completed
                                   ↘ passed
                                   ↘ failed
                                   ↘ no show
                                   ↘ suspended
                                   ↘ cancelled
                                   ↘ expired
```

### 6.2 How Non-Assessment Stage Status Affects Application

**Source:** `applicationStatus.js → resolveTrackedProcessStatus()`

For a non-assessment process type:

```
rawStatus = process.status

shouldPreserveAssessmentStageStatus(rawStatus)?
    YES → return getCanonicalStatusKey(rawStatus)   // employer-set terminal status
    NO  → return getCanonicalStatusKey(rawStatus || "pending")
```

The `shouldPreserveAssessmentStageStatus()` returns `true` for statuses that are:
- Not `pending / scheduled / available / not_started`
- Not derived from an assessment attempt (passed/failed/completed/in_progress/expired/suspended/session_expired/no_show)

This means statuses like `shortlisted`, `shortlisted for next round`, `on hold`, `pending decision`, `selected`, `not advanced to next round` are **preserved as-is** from employer's manual input.

### 6.3 How Multiple Round Statuses Combine

**Source:** `getEffectiveApplicationDisplayStatus()`

```
trackedProcesses = getMergedTrackedProcesses()
    (merges application.interviewProcesses + InterviewProcess.stages)

For each process, status is resolved via resolveTrackedProcessStatus()

Final logic:
    Any process.status is rejected-like?      → application = "rejected"
    Last round is "selected" (final round)?   → application = "selected"
    Non-final round with positive status?     → application = "pending"
    Last round has shortlisted/on_hold/etc.?  → application = that status
    All rounds pending-like?                  → fall through to base status
```

### 6.4 `shouldReflectTrackedStatusInApplicationDisplay()` — Which Stage Statuses Propagate

**Source:** `applicationStatus.js`

For **non-assessment** rounds, all meaningful statuses propagate to application display.

For **assessment** rounds, only **employer decision statuses** propagate:

| Status | Propagates to Application? |
|---|---|
| `shortlisted for next round` | ✓ Yes |
| `shortlisted` | ✓ Yes |
| `selected` | ✓ Yes |
| `on hold` | ✓ Yes |
| `pending decision` | ✓ Yes |
| `no show` | ✓ Yes |
| `rejected` | ✓ Yes |
| `not advanced to next stage` | ✓ Yes |
| `not advanced to next round` | ✓ Yes |
| `passed` | ✗ No (intermediate) |
| `failed` | ✗ No (handled via auto-reject) |
| `pending / available / not started` | ✗ No |

### 6.5 `hasPendingFinalNonAssessmentRoundAfterProgress()` — Hold Logic

This guard prevents the application from showing "rejected" when the final non-assessment round has not yet been decided but earlier rounds show progress:

```
Conditions to hold as "pending":
1. Last tracked process is non-assessment type
2. Last tracked process status is pending-like
3. At least one earlier process has a positive status
   (completed / passed / selected / shortlisted / shortlisted_for_next_round)
4. No rejected process exists
5. Not a latest-manual rejection
6. No hard-rejected assessment outcome
```

---

## 7. Status per User Role

### 7.1 Candidate View

**Source:** `statusDisplay.js → getApplicationStatusKey()` + `getInterviewCurrentStatusKey()`

The candidate sees a simplified status derived from `applicationStatus / displayStatus / status` fields:

| Internal Status | Candidate Sees |
|---|---|
| `pending` | Pending |
| `shortlisted` | Shortlisted |
| `shortlisted_for_next_round` | Shortlisted for next Round |
| `under_review / passed / completed / on_hold / pending_decision / in_progress / scheduled` | Pending |
| `rejected / no_show / not_advanced_to_next_round / not_advanced_to_next_stage` | Rejected |
| `selected` | Selected |
| `offer_sent` | Offer Letter Sent |
| `accepted` | Offer Accepted |
| `hired` | Hired |
| `suspended` | Suspended |

**Assessment-specific display (`getAssessmentOutcomeLabel()`):**

| outcomeKey | Candidate Label |
|---|---|
| `suspended` | Suspended |
| `pending_review` | Pending Review |
| `passed` | Pass |
| `failed` | Fail |
| `no_show` | No Show |
| `in_progress` | In Progress |
| `completed` | Completed |
| default | Pending |

### 7.2 Employer View

**Source:** `statusDisplay.js → getInterviewCurrentStatusKey()` + full `getEffectiveApplicationDisplayStatus()`

Employers see the full resolved status including:
- Round-level statuses (`shortlisted for next round`, `on hold`, `pending decision`)
- Assessment details (attempt score, result, manual eval pending count)
- Violation counts and type

Key difference from candidate: employers see `no_show` directly where candidates see `rejected`.

### 7.3 Admin View

**Source:** `statusDisplay.js → getAdminApplicantTableStatusKey()`

Admin sees a status that is cleaned of intermediate noise:

```
1. Walk statusHistory from newest to oldest
   If any non-pending entry in history is in ADMIN_NO_SHOW_LIKE_STATUS_KEYS
       → return "rejected"
   Stop at first non-pending entry

2. Check applicationStatus from explicit fields

3. Terminal positive states (accepted / hired / offer_sent) → as-is

4. Any interviewRound with rejected/failed/no_show status → "rejected"

5. Any assessment round that passed (with no rejection) → "pending"

6. Walk interviewRounds from newest:
   - ADMIN_NO_SHOW_LIKE status → "rejected"
   - passed / shortlisted / completed → "pending"

7. interviewCurrentStatus indicates no_show/expired (not pending-like) → "rejected"
8. interviewCurrentStatus = failed / suspended → return that status

9. Final: applicationStatusKey
```

**ADMIN_NO_SHOW_LIKE statuses** (mapped to "rejected"):
`expired, no_show, session_expired, rejected, not_advanced_to_next_stage, not_advanced_to_next_round, failed, suspended`

**ADMIN_PENDING_LIKE statuses** (skipped in history walk):
`pending, pending_decision, scheduled, under_review, on_hold`

---

## 8. Auto-Rejection Rules

### 8.1 From Assessment Outcome

**Source:** `assessmentController.js → persistAssessmentOutcome()` and `expireAttemptAndPersist()`

| Scenario | Auto-Rejection Triggered? | Note |
|---|---|---|
| attempt.status = `expired` AND result = `fail` | ✓ Yes | `AUTO_REJECT_ASSESSMENT_FAILED_NOTE` |
| attempt.status = `expired` AND result = `pass` | ✗ No | Passed despite expiry |
| attempt.status = `expired` AND result = `pending` | ✗ No | Manual eval pending |
| attempt.status = `suspended` | ✓ Yes | `AUTO_REJECT_ASSESSMENT_SUSPENDED_NOTE` |
| result = `fail` (completed normally) | ✓ Yes | `AUTO_REJECT_ASSESSMENT_FAILED_NOTE` |

`ensureApplicationRejectedFromAssessment()` only updates if current status is NOT in `['accepted', 'hired', 'offer sent', 'rejected']`.

### 8.2 From Violation Thresholds

| Violation Type | Category | Threshold | Action |
|---|---|---|---|
| `tab_switch` | Warning | 5 accumulated | Auto-suspend |
| `window_minimize` | Warning | 5 accumulated | Auto-suspend |
| `window_blur` | Warning | 5 accumulated | Auto-suspend |
| `fullscreen_exit` | Warning | 5 accumulated | Auto-suspend |
| `multi_screen` | Warning | 5 accumulated | Auto-suspend |
| `screen_capture` | Immediate | 1 | Immediate suspend + reject |
| `assessment_close_confirmed` | Auto-submit | 1 | Submit current answers |
| `tab_close` | Auto-submit | 1 | Submit current answers |

Constants: `RESTRICTION_WARNING_LIMIT = 4` (show warning), `RESTRICTION_SUSPEND_THRESHOLD = 5` (suspend).

### 8.3 From Expired Assessment Window (No Activity)

**Source:** `hasExpiredAssessmentWindowWithoutActivity()`

Returns `true` (triggers "no_show" / "rejected") when ALL conditions are met:

```
1. Job has an assessment round configured
2. Assessment window is closed (isAssessmentWindowClosed = true)
3. No attempt exists OR attempt has no meaningful data:
   - No completed/passed/failed/suspended/in_progress status
   - No score / percentage recorded
   - No saved answer activity
4. resolvedOutcome = "pending" (not already in a terminal state)
5. No hasExpiredManualAssessmentAttemptActivityRequiringReview
```

---

## 9. No-Show Detection

### 9.1 Interview Invite No-Show (`isNoShowCandidate()`)

**Source:** `noShowHandler.js`

```
application.status must be "pending" or "shortlisted"
AND hasNonAssessmentInterviewRound() = false (skip if non-assessment rounds exist)
AND interviewInvite.sentAt exists
AND (
    interviewInvite.status === "expired"
    OR interview date+time (confirmed or proposed) is > 30 minutes in the past
)
    → Candidate is a no-show
```

### 9.2 `applyNoShowRejection()` — Persist No-Show

**Source:** `noShowHandler.js`

Atomically updates application using `$nin` guard to avoid overwriting advanced statuses:

```
Skips if: status in [accepted, hired, offer_sent]
Skips if: assessmentStatus in [completed, passed, failed]
Skips if: already (status=rejected AND assessmentStatus=no_show)

Sets:
    status = "rejected"
    assessmentStatus = "no_show"
    interviewInvite.status = "expired" (if expireInterviewInvite option)
    statusHistory.push({ status: "rejected", notes: <context> })

Then: markAssessmentStageNoShow() updates InterviewProcess.stages
```

### 9.3 Assessment Window No-Show

Called from `startAssessment()` when window is already closed at start attempt:

```
timingContext.isWindowClosed = true
    → applyNoShowRejection(applicationId, { assessmentId, notes: AUTO_REJECT_ASSESSMENT_NO_SHOW_NOTE })
    → 400 response: "Assessment window has ended"
```

---

## 10. Status Alias & Normalization Map

### 10.1 Canonical Key Map (both frontend and backend)

Raw / display value → canonical key used in logic:

| Raw Value | Canonical Key |
|---|---|
| `available`, `not required`, `not started` | `pending` |
| `offer accepted` | `accepted` |
| `offer letter sent`, `offer sent`, `offer shared` | `offer_sent` |
| `pass`, `passed` | `passed` |
| `fail`, `failed`, `field` | `failed` |
| `no show`, `session expired` | `no_show` |
| `in progress` | `in_progress` |
| `shortlisted for next round` | `shortlisted_for_next_round` |
| `not advanced to next round`, `not eligibal for next round`, `not eligible for next round` | `not_advanced_to_next_round` |
| `not advanced to next stage` | `not_advanced_to_next_stage` |
| `interview completed` | `interview_completed` |
| `interview scheduled` | `interview_scheduled` |
| `under review` | `under_review` |
| `on hold` | `on_hold` |
| `pending decision` | `pending_decision` |

### 10.2 Normalization Function

All status comparisons run through:

```javascript
normalizeApplicationStatusValue(value):
    String(value).trim().toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
```

This ensures `in_progress`, `in-progress`, `In Progress` all resolve the same way.

---

## Summary Decision Tree

```
                    Candidate Submits / Time Expires / Violation
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
              [suspended]          [expired]           [completed]
                    │                   │                   │
             Reject always    result=pass? result=fail?  result=pending?
                              → pending   → reject      → Employer
                              (not reject)               evaluates
                                                              │
                                                   ┌─────────┴─────────┐
                                                   ▼                   ▼
                                               All manual           Still pending
                                               evaluated               manual Q
                                                   │
                                         ┌─────────┴─────────┐
                                         ▼                   ▼
                                    result=pass          result=fail
                                         │                   │
                                   → pending             → rejected
                                   (admin must             (auto-reject
                                    process)               triggered)
```

---

*Generated from code review of: `backend/utils/applicationStatus.js`, `backend/controllers/assessmentController.js`, `backend/models/Assessment.js`, `backend/models/AssessmentAttempt.js`, `backend/models/Application.js`, `backend/utils/noShowHandler.js`, `frontend/src/utils/assessmentOutcome.js`, `frontend/src/utils/statusDisplay.js`*
