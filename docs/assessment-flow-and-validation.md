# Assessment Flow And Status Lifecycle

## Purpose

This document describes the assessment flow from both the employer side and candidate side, with special focus on the full lifecycle of these statuses:

- `pending`
- `pass`
- `fail`
- `expired` (`session expired`)
- `suspended`
- `rejected`

It also separates where each status belongs, because the assessment module uses multiple status layers and they do not all mean the same thing.

## Main Actors

- `Employer`: creates, publishes, assigns, reviews, evaluates, and decides whether to advance or reject a candidate.
- `Candidate`: starts the assessment, answers questions, receives warnings, submits, and views the result or blocking status.
- `System`: tracks the timer, saves attempt state, calculates scores, applies suspension rules, and syncs status into application and interview process records.

## Status Layers

The assessment flow uses different status fields for different purposes.

| Layer | Field | Main Values | Meaning |
| --- | --- | --- | --- |
| Assessment master | `Assessment.status` | `draft`, `published` | Whether the employer has only saved the assessment or made it usable in hiring flow. |
| Candidate access state | `Application.assessmentStatus` | `not_required`, `pending`, `available`, `in_progress`, `completed`, `expired`, `suspended` | Candidate-facing operational state of the assessment inside the job application. |
| Attempt session state | `AssessmentAttempt.status` | `not_started`, `in_progress`, `completed`, `expired`, `suspended` | Technical state of the actual assessment session. |
| Assessment result state | `AssessmentAttempt.result`, `Application.assessmentResult`, `InterviewProcess.stages[].assessmentResult` | `pending`, `pass`, `fail` | Evaluation outcome after auto-checking and, if needed, manual review. |
| Interview stage state | `InterviewProcess.stages[].status` | `pending`, `scheduled`, `in_progress`, `completed`, `passed`, `failed`, `expired`, `suspended`, `cancelled` | Workflow state of the assessment stage in the overall hiring process. |
| Final hiring decision | `InterviewProcess.processStatus`, `InterviewProcess.finalDecision`, `Application.status` | includes `rejected` | Broader hiring decision layer. This is outside assessment-only review and should not be mixed with assessment status discussion. |

## Important Clarification

- `pass` and `fail` are result statuses, not session statuses.
- `expired` and `suspended` are session or operational statuses, not final business decisions by themselves.
- `rejected` is not an `AssessmentAttempt.status`.
- broader application decisions like `rejected` belong to non-assessment hiring flow and should be handled separately from assessment-only review.

## Employer End Flow

1. Employer creates an assessment and saves it as `draft` or `published`.
2. Employer assigns the assessment to a job or interview round.
3. Candidate application receives assessment access through the application flow.
4. System marks the assessment as `available` for the candidate when it should be taken.
5. Candidate starts the assessment and the session becomes `in_progress`.
6. Employer later sees the outcome in one of these broad groups:
   - submitted and fully scored
   - submitted but still `pending` manual evaluation
   - `expired`
   - `suspended`
7. If the assessment contains manual questions, employer reviews and saves marks.
8. Employer updates the candidate's assessment review state and only after that moves into separate non-assessment hiring decisions if needed.

## Candidate End Flow

1. Candidate applies for the job.
2. Candidate sees that an assessment is required or available.
3. Candidate starts the assessment.
4. Candidate session becomes `in_progress`.
5. Candidate answers objective and manual questions.
6. Candidate either:
   - submits successfully
   - gets `expired` because the timer runs out
   - gets `suspended` due to rule violations
7. Candidate sees the result when the system allows it:
   - immediate `pass` or `fail` for fully auto-evaluated assessments
   - `pending` if manual evaluation is still required
   - no normal result page for `suspended` attempts in the current flow

## End-To-End Lifecycle

Typical normal flow:

`draft -> published -> available -> in_progress -> completed -> pending/pass/fail -> passed/failed or employer decision`

Session-expired flow:

`published -> available -> in_progress -> expired -> pending/pass/fail -> employer decision`

Suspension flow:

`published -> available -> in_progress -> warning 1 -> warning 2 -> warning 3 -> warning 4 -> suspended -> employer assessment review -> manual closure or next decision`

## Pending Status Detailed Cycle

`pending` appears in more than one place. It should be read by scope.

### 1. Pending Before Candidate Starts

Where it appears:

- `Application.assessmentStatus = pending`
- `InterviewProcess.stages[].status = pending`
- `AssessmentAttempt.status = not_started`

Candidate end:

- Candidate has not started the assessment yet.
- Candidate may still be waiting for the employer or system to make the assessment available.
- Candidate cannot be treated as passed or failed at this stage.

Employer end:

- Employer has assessment configured, but the candidate has not begun the session.
- Employer may still be scheduling the assessment or keeping it queued within the hiring process.
- Employer should not interpret this as a result.

Next transitions:

- `available`
- `in_progress`
- `cancelled` at stage level if process changes

### 2. Pending After Candidate Submission

Where it appears:

- `AssessmentAttempt.result = pending`
- `Application.assessmentResult = pending`
- `InterviewProcess.stages[].assessmentResult = pending`

Trigger:

- Candidate submitted or expired with at least one manual-evaluation question still awaiting review.

Candidate end:

- Candidate has finished the session, but the final result is not ready.
- Candidate may see that evaluation is still pending.
- Candidate cannot retake the same attempt.
- Candidate receives the final non-pending result only after employer review is completed.

Employer end:

- Employer can open the attempt details.
- Employer must review subjective, image, or upload responses.
- Employer saves awarded marks and feedback.

Next transitions:

- `pass`
- `fail`

## Pass Status Detailed Cycle

Where it appears:

- `AssessmentAttempt.result = pass`
- `Application.assessmentResult = pass`
- `InterviewProcess.stages[].assessmentResult = pass`
- assessment stage usually becomes `passed`

Trigger:

- All required evaluations are complete.
- Final percentage is greater than or equal to the assessment passing percentage.

Candidate end:

- Candidate can see a passing result for a `completed` or `expired` attempt.
- If the assessment needed manual evaluation, the candidate receives the final result only after the employer finishes review.
- A pass does not mean the candidate is hired. It only means the assessment is cleared.

Employer end:

- Employer sees the score, percentage, and `pass` outcome.
- Employer can advance the candidate to the next interview stage or next hiring action.
- Employer should first complete assessment review before any broader non-assessment application decision.

System behavior:

- Attempt session stays `completed` or `expired`.
- Result becomes `pass`.
- Application assessment result becomes `pass`.
- Interview assessment stage normally becomes `passed`.

Next transitions:

- next interview round
- shortlist or selection workflow
- final offer workflow

## Fail Status Detailed Cycle

Where it appears:

- `AssessmentAttempt.result = fail`
- `Application.assessmentResult = fail`
- `InterviewProcess.stages[].assessmentResult = fail`
- assessment stage usually becomes `failed`

Trigger:

- All required evaluations are complete.
- Final percentage is below the assessment passing percentage.

Candidate end:

- Candidate can see the failed result for a `completed` or `expired` attempt.
- Candidate cannot reuse or restart the same attempt.
- Candidate is usually not advanced further in the assessment path.

Employer end:

- Employer sees the fail result with score and percentage.
- Employer typically stops the candidate from moving to the next stage.
- Employer should keep the candidate under assessment review handling first, instead of mixing it immediately with non-assessment application status.

System behavior:

- Attempt session stays `completed` or `expired`.
- Result becomes `fail`.
- Interview assessment stage becomes `failed`.

Next transitions:

- `pending` employer assessment review
- manual hold or employer exception flow if business rules allow

## Session Expired Status Detailed Cycle

`session expired` maps to the technical status `expired`.

Where it appears:

- `AssessmentAttempt.status = expired`
- `Application.assessmentStatus = expired`
- `InterviewProcess.stages[].status` can remain `expired` or later resolve through result mapping

Trigger:

- Candidate exceeds the allowed timer.
- The system detects expiry during submit, resume, or state-check operations.

Candidate end:

- Candidate can no longer continue the session.
- Candidate cannot resume or retake the same attempt.
- If answers were saved, the candidate may still later see a result for that expired attempt.
- That result can still be `pending`, `pass`, or `fail` depending on saved answers and manual evaluation.

Employer end:

- Employer sees the attempt in the results list as an expired session.
- Employer can still inspect saved answers.
- Employer can still manually evaluate manual questions if responses were saved before expiry.

System behavior:

- Attempt status becomes `expired`.
- Application assessment status becomes `expired`.
- Result is still calculated from whatever answers exist.
- If manual answers are still pending, result remains `pending`.
- If evaluation is complete, result can become `pass` or `fail` even though the session status is `expired`.
- At interview-stage level, the stage may stay `expired` while result is still pending, but may later resolve to `passed` or `failed` once final evaluation exists.

Assessment-only application review rule:

- If the session is `expired` but the result is `pass`, the candidate's application should stay in `pending` review from the employer assessment side.
- In this case, it should not be treated as a non-assessment `rejected` application state inside this document.

Important distinction:

- `expired` describes how the session ended.
- `pass` or `fail` describes what the submitted work achieved.
- An expired session can still produce `pass`, `fail`, or `pending`.

Next transitions:

- `pending`
- `pass`
- `fail`
- employer assessment review

## Suspended Status Detailed Cycle

Where it appears:

- `AssessmentAttempt.status = suspended`
- `Application.assessmentStatus = suspended`
- `InterviewProcess.stages[].status = suspended`

Trigger:

- Candidate commits restricted violations during the session.
- The current warning flow is: warnings accumulate for restricted events, and suspension happens on the fifth restricted warning event.

Restricted warning events:

- `tab_switch`
- `window_minimize`
- `window_blur`
- `screen_capture`
- `fullscreen_exit`
- `multi_screen`

Candidate end:

- Candidate may receive warning messages before suspension.
- After suspension, the session is blocked immediately.
- Candidate cannot continue, submit normally, or restart the same attempt.
- In the current result flow, suspended attempts are not treated like completed or expired result pages for the candidate.

Employer end:

- Employer can see suspended attempts in assessment results.
- Employer can inspect violations, warnings, and captured evidence.
- Employer should review the assessment event first and keep it inside assessment-only handling before any broader application decision.

System behavior:

- Attempt status becomes `suspended`.
- Suspension timestamp and reason are stored.
- Application assessment status becomes `suspended`.
- Interview assessment stage becomes `suspended`.

Next transitions:

- `pending` employer assessment review
- employer manual review or exception handling

## Employer Assessment Review Status

This document should use assessment-only review language for the candidate application, not broader non-assessment hiring status.

Recommended employer-side reading:

- `pass` means the assessment outcome is cleared.
- `fail` means the assessment outcome is not cleared.
- `expired` means the session ended due to time.
- `suspended` means the session was blocked due to violations.
- after any of the above, employer keeps the candidate in assessment review handling before taking separate overall application action.

Assessment-only review rule:

- `expired + pass -> pending` employer review on the candidate application assessment side.
- `expired + fail -> pending` employer review or assessment closure, depending on policy.
- `suspended -> pending` employer review of violations and evidence.
- overall application statuses like `rejected`, `hired`, or `accepted` should be documented separately from this assessment flow.

## Status Matrix By Actor

| Status | Candidate View | Employer View | Typical Next Step |
| --- | --- | --- | --- |
| `pending` | waiting to start or waiting for manual evaluation | waiting for candidate start or manual review | `available`, `in_progress`, `pass`, `fail` |
| `pass` | assessment cleared | candidate can be advanced | next round or selection flow |
| `fail` | assessment not cleared | employer reviews assessment outcome only | `pending` review or hold |
| `expired` | session ended due to time | inspect partial attempt and review assessment only | `pending`, `pass`, `fail` |
| `suspended` | blocked for violations | inspect violations and evidence under assessment review | `pending` review or manual action |

## Recommended Reading Of Statuses

When documenting or building UI, use this reading order:

1. Check whether the assessment is usable: `draft` or `published`.
2. Check whether the candidate can currently act: `Application.assessmentStatus`.
3. Check how the session ended: `AssessmentAttempt.status`.
4. Check the evaluation outcome: `result`.
5. If needed, separately check broader non-assessment hiring decision fields later.

This order avoids mixing operational assessment states like `expired` with broader application decisions that are outside this document.
