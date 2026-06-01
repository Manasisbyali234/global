# Interview Status Updates — Flow & API Reference

---

## 1. Overview

The interview system has **two parallel layers**:

| Layer | Model | Purpose |
|---|---|---|
| **Job-level rounds** | `InterviewRound` | Employer defines rounds when posting a job (dates, slots, scheduler) |
| **Application-level process** | `InterviewProcess` + `Application` | Per-candidate tracking of each stage's status |

Both layers write back into `Application` to produce the final display status shown to candidates and employers.

---

## 2. Key Models & Their Status Fields

### 2.1 `Application` — top-level candidate status

```
status                  pending | shortlisted | interviewed | hired | rejected | offer_sent | accepted
assessmentStatus        not_required | pending | available | in_progress | completed | expired | suspended | no_show
interviewInvite.status  pending | confirmed | rejected | expired
interviewProcesses[]    { id, name, type, status, isCompleted, result, assessmentId, ... }
statusHistory[]         { status, changedAt, changedBy, changedByModel, notes }
```

### 2.2 `InterviewProcess` — per-application stage tracker

```
processStatus           not_started | in_progress | completed | rejected | hired
finalDecision           pending | selected | rejected | on_hold
stages[].status         pending | scheduled | in_progress | completed | passed | failed | expired | suspended | cancelled | no show
stages[].statusHistory  { status, changedAt, changedBy, changedByModel, notes }
```

### 2.3 `InterviewRound` — job-level round definition

```
roundType   oneOnOne | panel | oneOnOnePanel | group | technical | managerial | hr | situational | others | assessment | custom
fromdate / todate / startTime / endTime
subStages[] — day-level slots for multi-day rounds
scheduleObject / schedulesArray / daySchedulesArray / roomsArray — scheduler payload
```

---

## 3. Status Flow Diagram

```
Candidate Applies
       │
       ▼
Application.status = "pending"
       │
       ▼ Employer shortlists
Application.status = "shortlisted"
       │
       ├──► Employer sends Interview Invite
       │         interviewInvite.status = "pending"
       │         Candidate confirms → "confirmed"
       │         Candidate rejects / expires → "rejected" / "expired"
       │
       ▼ Employer creates InterviewProcess (stages)
InterviewProcess.processStatus = "not_started"
       │
       ▼ Stage 1 scheduled
stages[0].status = "scheduled"
       │
       ├──► Assessment stage
       │         Candidate starts → assessmentStatus = "in_progress"
       │         Candidate submits → assessmentStatus = "completed"
       │         Result pass  → stages[0].status = "passed"
       │         Result fail  → stages[0].status = "failed"
       │         No show      → stages[0].status = "no show"
       │         Suspended    → stages[0].status = "suspended"
       │
       ├──► Interview stage
       │         Employer marks → stages[0].status = "passed" | "failed" | "completed"
       │
       ▼ All stages passed
InterviewProcess.processStatus = "completed"
InterviewProcess.finalDecision = "selected"
Application.status = "shortlisted" → "hired" / "offer_sent"
       │
       ▼ Any stage failed / suspended
InterviewProcess.processStatus = "rejected"
Application.status = "rejected"
```

---

## 4. API Endpoints

All employer routes require `Authorization: Bearer <token>` (JWT, role = `employer`).

---

### 4.1 Interview Round APIs (Job-level)

Base path: `/api/interview-rounds`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/interview-rounds` | Create a new interview round for a job |
| `GET` | `/api/interview-rounds/job/:jobId` | Get all rounds for a job |
| `GET` | `/api/interview-rounds/:id` | Get a single round |
| `PUT` | `/api/interview-rounds/:id` | Update a round |
| `DELETE` | `/api/interview-rounds/:id` | Delete a round |

Also available under employer job routes:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/employer/jobs/:jobId/schedule-round` | Schedule / update a specific round key |
| `POST` | `/api/employer/jobs/:jobId/interview-rounds` | Bulk create rounds (legacy) |
| `GET` | `/api/employer/jobs/:jobId/interview-rounds` | Get rounds (legacy) |
| `PUT` | `/api/employer/interview-rounds/:roundId` | Update round (legacy) |
| `DELETE` | `/api/employer/interview-rounds/:roundId` | Delete round (legacy) |

#### POST `/api/interview-rounds` — Request Body

```json
{
  "jobId": "<ObjectId>",
  "key": "technical_1",
  "name": "Technical Round",
  "roundType": "technical",
  "fromdate": "2025-07-01",
  "todate": "2025-07-03",
  "startTime": "10:00",
  "endTime": "17:00",
  "applicationLimit": 50,
  "description": "Technical screening round",
  "subStages": [
    { "fromDate": "2025-07-01", "startTime": "10:00", "endTime": "13:00" }
  ]
}
```

#### DB Write — `InterviewRound` collection

```
InterviewRound.create({
  jobId, key, name, roundType,
  fromdate, todate, startTime, endTime,
  applicationLimit, description, subStages,
  scheduleObject, schedulesArray, ...
})
```

---

### 4.2 Interview Process APIs (Application-level)

Base path: `/api/employer/applications/:applicationId`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/interview-process` | Create or replace the full interview process |
| `GET` | `/interview-process` | Get the interview process for an application |
| `PUT` | `/interview-process/stages/:stageIndex/status` | Update a single stage's status |
| `PUT` | `/interview-process/stages/:stageIndex/schedule` | Schedule a single stage |

---

#### POST `/interview-process` — Create / Update Process

**Request Body:**
```json
{
  "stages": [
    {
      "stageType": "technical",
      "stageName": "Technical Round",
      "stageOrder": 1,
      "status": "pending",
      "scheduledDate": "2025-07-10",
      "scheduledTime": "10:00",
      "interviewerName": "John Doe",
      "interviewerEmail": "john@company.com",
      "meetingLink": "https://meet.google.com/xxx"
    },
    {
      "stageType": "assessment",
      "stageName": "Online Test",
      "stageOrder": 2,
      "assessmentId": "<ObjectId>",
      "status": "pending"
    }
  ],
  "processStatus": "not_started",
  "finalDecision": "pending"
}
```

**DB Write:**
```
InterviewProcess.findOneAndUpdate / create({
  applicationId, jobId, candidateId, employerId,
  stages, processStatus, finalDecision,
  processStartedAt: new Date()
})
// then calls interviewProcess.updateProcessStatus()
// which recalculates processStatus based on stage outcomes
```

---

#### PUT `/interview-process/stages/:stageIndex/status` — Update Stage Status

**Request Body:**
```json
{
  "status": "passed",
  "feedback": "Strong technical skills",
  "notes": "Recommended for next round"
}
```

**DB Write:**
```
stage.status = status
stage.feedback = feedback
stage.interviewerNotes = notes
stage.statusHistory.push({ status, changedAt, changedBy, changedByModel: 'Employer', notes })
interviewProcess.updateProcessStatus()   // recalculates processStatus + finalDecision
interviewProcess.save()
```

**Stage status transitions:**
```
pending → scheduled → in_progress → passed / failed / completed / no show / suspended / cancelled / expired
```

---

#### PUT `/interview-process/stages/:stageIndex/schedule` — Schedule a Stage

**Request Body:**
```json
{
  "scheduledDate": "2025-07-15",
  "scheduledTime": "14:00",
  "fromDate": "2025-07-15",
  "toDate": "2025-07-15",
  "location": "Online",
  "interviewerName": "Jane Smith",
  "interviewerEmail": "jane@company.com",
  "meetingLink": "https://meet.google.com/yyy",
  "instructions": "Please join 5 minutes early"
}
```

**DB Write:**
```
stage.scheduledDate = buildUtcDateTimeFromIst(scheduledDate, scheduledTime)
stage.scheduledTime = normalizeTimeFormat(scheduledTime)
stage.fromDate / toDate / location / interviewerName / interviewerEmail / meetingLink / instructions
stage.status = "scheduled"
interviewProcess.save()
```

---

### 4.3 Application Status APIs

| Method | Endpoint | Description |
|---|---|---|
| `PUT` | `/api/employer/applications/:applicationId/status` | Direct status update |
| `PUT` | `/api/employer/applications/:applicationId/review` | Save interview round results |
| `GET` | `/api/employer/applications/:applicationId/interview-status` | Get interview process + remarks |

---

#### PUT `/applications/:applicationId/status` — Direct Status Update

**Request Body:**
```json
{
  "status": "shortlisted",
  "notes": "Strong candidate"
}
```

**Valid values:** `pending | shortlisted | interviewed | hired | rejected | not_attended | offer_shared | offer_sent`

**DB Write:**
```
Application.findOneAndUpdate({
  status,
  $push: {
    statusHistory: { status, changedBy, changedByModel: 'Employer', notes }
  }
})
```

**Side effects:**
- Sends notification to candidate
- Sends shortlist email if `status === 'shortlisted'`
- Sends offer letter email if `status === 'offer_sent'`

---

#### PUT `/applications/:applicationId/review` — Save Interview Round Results

**Request Body:**
```json
{
  "interviewProcesses": [
    {
      "id": "round_1",
      "name": "Technical Round",
      "type": "technical",
      "status": "shortlisted for next round",
      "isCompleted": true,
      "result": null
    },
    {
      "id": "round_2",
      "name": "HR Round",
      "type": "hr",
      "status": "selected",
      "isCompleted": true,
      "result": null
    }
  ],
  "processRemarks": {
    "round_1": "Good technical skills",
    "round_2": "Culture fit confirmed"
  },
  "remarks": "Overall strong candidate",
  "isSelected": true
}
```

**DB Write:**
```
Application.findOneAndUpdate({
  interviewProcesses: [...sanitized],
  processRemarks: Map { "round_1" → "...", "round_2" → "..." },
  employerRemarks: remarks,
  isSelectedForProcess: isSelected,
  reviewedAt: new Date(),
  // Auto-sets status = 'rejected' if any stage is rejected/failed/suspended
  // Auto-restores status = 'pending' if previously auto-rejected and now cleared
})
```

**Auto-rejection logic:**
- If any `interviewProcesses[].status` is `rejected | failed | no show | suspended | session expired` → `Application.status = 'rejected'`
- If `assessmentStatus === 'suspended'` or `assessmentResult === 'fail'` → same

---

### 4.4 Interview Invite APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/employer/send-interview-invite/:applicationId` | Send invite email to candidate |
| `POST` | `/api/employer/confirm-interview/:applicationId` | Confirm interview date/time |
| `GET` | `/api/employer/interview-responses/:applicationId` | Get candidate's response |

#### POST `/send-interview-invite/:applicationId`

**Request Body:**
```json
{
  "interviewDate": "2025-07-20",
  "interviewTime": "11:00",
  "meetingLink": "https://meet.google.com/abc",
  "instructions": "Bring your portfolio"
}
```

**DB Write:**
```
Application.findByIdAndUpdate({
  interviewInvite: {
    sentAt: new Date(),
    proposedDate, proposedTime, meetingLink, instructions,
    status: "pending"
  }
})
```

#### POST `/confirm-interview/:applicationId`

**Request Body:**
```json
{
  "confirmedDate": "2025-07-20",
  "confirmedTime": "11:00"
}
```

**DB Write:**
```
Application.findByIdAndUpdate({
  'interviewInvite.status': 'confirmed',
  'interviewInvite.confirmedDate': confirmedDate,
  'interviewInvite.confirmedTime': confirmedTime,
  'interviewInvite.confirmedAt': new Date()
})
```

---

## 5. Status Resolution Logic (`applicationStatus.js`)

The `buildApplicationStatusSnapshot()` utility computes the **display status** shown in the UI. It is called on every application fetch.

### Resolution priority (highest → lowest):

```
1. explicitDisplayStatus (applicationStatus / displayStatus field if set)
2. accepted / hired / offer_sent  → return as-is
3. Rejected offer letter          → "rejected"
4. Rejected interview invite      → "rejected"
5. Auto-reject expired session recovery → "pending"
6. Pending manual evaluation recovery  → "shortlisted" / "pending"
7. Any rejected tracked process   → "rejected"
8. Any failed interviewRound      → "rejected"
9. Assessment no_show / suspended / failed → "rejected"
10. Expired assessment window without activity → "rejected"
11. Latest meaningful tracked stage status (final round only)
12. isSelectedForProcess = true   → "shortlisted"
13. Base application status
```

### `interviewCurrentStatus` (shown on candidate dashboard):

Similar logic but maps `interviewed` → `interview_completed` and `selected` → `shortlisted`.

---

## 6. No-Show Auto-Rejection

Handled by `noShowHandler.js` and called from:
- Server-side scheduler (cron)
- Candidate status endpoint (safeguard)

**Trigger conditions:**
- `application.status` is `pending` or `shortlisted`
- `interviewInvite.sentAt` exists
- Interview date + time is in the past (+ 30-minute grace period)
- OR `interviewInvite.status === 'expired'`

**DB Write:**
```
Application.findOneAndUpdate({
  $set: {
    status: 'rejected',
    assessmentStatus: 'no_show',
    'interviewInvite.status': 'expired'
  },
  $push: {
    statusHistory: { status: 'rejected', notes: 'Candidate no-show / session expired' }
  }
})
```

---

## 7. Database Collections Summary

| Collection | Key Fields Written During Interview Flow |
|---|---|
| `applications` | `status`, `assessmentStatus`, `interviewInvite`, `interviewProcesses`, `processRemarks`, `statusHistory`, `interviewProcessId` |
| `interviewprocesses` | `processStatus`, `finalDecision`, `stages[].status`, `stages[].statusHistory`, `completedStages`, `currentStage` |
| `interviewrounds` | `fromdate`, `todate`, `startTime`, `endTime`, `subStages`, `scheduleObject`, `schedulesArray`, `savedAt` |

---

## 8. Stage Type → Round Type Mapping

| `stageType` / `roundType` | Display Name |
|---|---|
| `oneOnOne` | One-to-One |
| `panel` | Panel |
| `oneOnOnePanel` | One-to-One / Panel |
| `group` | Group |
| `technical` | Technical |
| `managerial` | Managerial Round |
| `hr` | HR Round |
| `situational` | Situational / Behavioral |
| `assessment` | Assessment |
| `others` / `custom` | Others – Specify |

---

## 9. Notifications Triggered

| Event | Recipient | Type |
|---|---|---|
| Application shortlisted | Candidate (email + notification) | `application_status_updated` |
| Offer letter sent | Candidate (email + notification) | `application_status_updated` |
| Interview round scheduled | All applicants of the job | `interview_scheduled` |
| Interview schedule updated | All applicants of the job | `interview_updated` |
| Stage status changed | Candidate | `interview_updated` |
| Any status update | Employer (self) | `application_status_updated` |
