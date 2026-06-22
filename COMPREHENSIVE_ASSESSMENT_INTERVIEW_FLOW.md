# Comprehensive Assessment & Interview Flow Document

**Version:** 1.0  
**Last Updated:** 2026-06-22  
**Scope:** Complete end-to-end flow from Assessment Creation to Evaluation (Employer & Candidate perspectives)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture & Models](#architecture--models)
3. [Assessment Creation Flow (Employer)](#assessment-creation-flow-employer)
4. [Job Posting & Interview Round Configuration](#job-posting--interview-round-configuration)
5. [Candidate Application & Pre-Assessment Flow](#candidate-application--pre-assessment-flow)
6. [Assessment Execution Flow (Candidate)](#assessment-execution-flow-candidate)
7. [Assessment Evaluation Flow (Employer)](#assessment-evaluation-flow-employer)
8. [Interview Process & Round Management](#interview-process--round-management)
9. [Non-Assessment Interview Rounds](#non-assessment-interview-rounds)
10. [Manual Tracking & Status Management](#manual-tracking--status-management)
11. [Status Transitions & State Machine](#status-transitions--state-machine)
12. [Proctoring, Violations & Auto-Actions](#proctoring-violations--auto-actions)
13. [Complete End-to-End Workflow](#complete-end-to-end-workflow)

---

## 1. System Overview

### 1.1 Dual-Layer Architecture

The TaleGlobal platform uses a **two-layer tracking system**:

| Layer | Component | Purpose |
|-------|-----------|---------|
| **Job-Level** | `InterviewRound` Model | Defines assessment/interview structure at job posting time |
| **Application-Level** | `InterviewProcess` + `Application` | Tracks individual candidate progress through the pipeline |
| **Assessment-Level** | `AssessmentAttempt` | Records candidate's test responses, score, and violations |

### 1.2 Key Participants

- **Employer**: Creates assessments, posts jobs, defines interview rounds, evaluates candidates
- **Candidate**: Applies for jobs, attempts assessments, participates in interviews
- **Admin**: Monitors overall platform health (optional)
- **System**: Automated actions (auto-submission, expiry handling, violation tracking)

### 1.3 Critical Status Dimensions

Every application has **3 parallel status dimensions**:

```
Application.status          → pending | shortlisted | interviewed | hired | rejected | offer_sent | accepted
Application.assessmentStatus → not_required | pending | available | in_progress | completed | expired | suspended | no_show
InterviewProcess.processStatus → not_started | in_progress | completed | rejected | hired
```

---

## 2. Architecture & Models

### 2.1 Data Model Relationships

```
Employer
  ├─ Assessment (many)
  │   ├─ questions[]
  │   ├─ AssessmentAttempt (many)
  │   │   ├─ answers[]
  │   │   ├─ violations[]
  │   │   └─ captures[] (proctoring)
  │   └─ InterviewRound (many)
  │
  ├─ Job (many)
  │   ├─ InterviewRound[] (job rounds)
  │   └─ Application[] (candidates)
  │
  └─ InterviewProcess (many)
      ├─ Application (1:1)
      └─ stages[] (rounds per candidate)

Candidate
  └─ Application[] (many)
      ├─ AssessmentAttempt[]
      └─ InterviewProcess[]
```

### 2.2 Core Models Schema

#### Assessment Model
```javascript
{
  employerId,           // Who created it
  jobId,               // Assigned to which job (optional)
  serialNumber,        // Auto-incremented per employer
  title,               // Assessment name
  type,                // e.g., "Aptitude Test", "Technical Assessment"
  description,         // Full details
  instructions,        // Candidate-facing instructions
  timer,               // Duration in minutes (e.g., 30)
  totalQuestions,      // Count of questions
  passingPercentage,   // e.g., 60%
  
  questions: [{
    question,          // Question text
    type,              // mcq | visual-mcq | image-mcq | questionary-image-mcq | subjective | upload | image
    options[],         // For MCQ
    optionImages[],    // For visual MCQ
    correctAnswer,     // Index of correct option (for objective)
    marks,             // Points for this question
    explanation,       // Post-attempt explanation
    imageUrl           // Question image (for image-based questions)
  }],
  
  status,              // 'draft' | 'published'
  createdAt,
  updatedAt
}
```

#### Assessment Attempt Model
```javascript
{
  candidateId,         // Who attempted
  assessmentId,        // Which assessment
  applicationId,       // Which job application
  jobId,               // Which job
  
  // Attempt tracking
  startedAt,           // When candidate started
  submittedAt,         // When candidate submitted
  durationSeconds,     // Time taken (null if ongoing)
  
  // Results
  answers: [{
    questionId,
    answer,            // String (MCQ index) or text (subjective)
    isCorrect,         // null if subjective (pending manual eval)
    marks              // Awarded marks
  }],
  
  totalMarks,          // Sum of all marks
  obtainedMarks,       // What candidate got
  percentage,          // (obtainedMarks / totalMarks) * 100
  result,              // 'pass' | 'fail' | 'pending' (if subjective pending)
  status,              // 'in_progress' | 'submitted' | 'expired' | 'suspended'
  
  // Proctoring
  violations: [{
    violationType,     // 'tab_switch', 'window_blur', 'fullscreen_exit', etc.
    severity,          // 'warning' | 'critical'
    timestamp,
    actionTaken        // 'warning_issued' | 'auto_submitted' | 'suspended'
  }],
  
  // Cheating prevention
  captures: [{
    timestamp,
    reason,            // 'violation', 'periodic_check'
    screenshotUrl      // Stored for review
  }],
  
  isSubmissionAuto,    // true if system submitted (time up, violations, etc)
  suspensionReason,    // Why suspended (if applicable)
  
  // Manual evaluation tracking
  subjectiveQuestionsReview: [{
    questionId,
    evaluatedAt,
    evaluatedBy,       // Employer ID
    marks,             // Manual marks awarded
    comments           // Feedback on answer
  }]
}
```

#### InterviewRound Model
```javascript
{
  jobId,               // Which job posting
  name,                // e.g., "Technical Assessment", "HR Interview"
  roundType,           // oneOnOne | panel | assessment | technical | managerial | hr | etc.
  
  // Timing
  fromdate,            // Round window start
  todate,              // Round window end
  startTime,           // Time of day window opens (HH:MM)
  endTime,             // Time of day window closes (HH:MM)
  
  // Assessment-specific
  assessmentId,        // If roundType is 'assessment'
  
  // Multi-day support
  subStages: [{
    fromDate,          // Specific day
    startTime,         // When this day's window opens
    endTime,           // When this day's window closes
    applicationLimit   // Slots available for this day
  }],
  
  // Interview scheduling (non-assessment)
  schedulesArray,      // Scheduler service payload
  daySchedulesArray,   // Per-day slot details
  roomsArray,          // Interview rooms/links
  numStudents,         // Candidate capacity
  numHRs,              // Interviewer capacity
  
  applicationLimit,    // Total slots available
  description,
  createdAt
}
```

#### InterviewProcess Model
```javascript
{
  applicationId,       // Which application
  jobId,               // Which job
  candidateId,         // Which candidate
  employerId,          // Which employer
  
  processStatus,       // not_started | in_progress | completed | rejected | hired
  processStartedAt,
  processCompletedAt,
  
  // The interview pipeline
  stages: [{
    stageType,         // oneOnOne | panel | assessment | technical | hr | etc.
    stageName,         // Display name
    stageOrder,        // Sequence (1, 2, 3...)
    
    // Scheduling
    scheduledDate,
    scheduledTime,
    location,
    meetingLink,
    interviewerName,
    interviewerEmail,
    
    // Status
    status,            // pending | scheduled | in_progress | completed | passed | failed | expired | suspended | no_show
    startedAt,
    completedAt,
    
    // Assessment stage specific
    assessmentId,
    assessmentScore,
    assessmentPercentage,
    assessmentResult,  // pass | fail | pending
    assessmentStartedAt,
    assessmentCompletedAt,
    
    // Interview feedback
    feedback,
    interviewerNotes,
    candidateNotes,
    rating,            // 1-5 stars
    
    // History
    statusHistory: [{
      status,
      changedAt,
      changedBy,       // Employer/Admin/System ID
      changedByModel,  // Who made change
      notes
    }]
  }],
  
  // Final decision
  finalDecision,       // pending | selected | rejected | on_hold
  finalFeedback,
  decisionMadeBy,
  decisionMadeAt,
  
  // Offer (if selected)
  offerDetails: {
    salary,
    currency,
    joiningDate,
    offerLetterSent,
    offerAccepted,
    offerAcceptedAt
  }
}
```

#### Application Model (Relevant Fields)
```javascript
{
  candidateId,
  jobId,
  employerId,
  
  // Top-level status
  status,              // pending | shortlisted | interviewed | hired | rejected | offer_sent | accepted
  
  // Assessment tracking
  assessmentStatus,    // not_required | pending | available | in_progress | completed | expired | suspended | no_show
  assessmentScore,
  assessmentPercentage,
  assessmentResult,    // pass | fail
  
  // Interview invite
  interviewInvite: {
    sentAt,
    status,            // pending | confirmed | rejected | expired
    confirmedAt
  },
  
  // Interview processes
  interviewProcesses: [{
    id,
    name,
    type,
    status,
    isCompleted,
    result
  }],
  
  // Tracking
  appliedAt,
  shortlistedAt,
  rejectedAt,
  statusHistory: [{
    status,
    changedAt,
    changedBy,
    changedByModel,
    notes
  }]
}
```

---

## 3. Assessment Creation Flow (Employer)

### 3.1 High-Level Flow

```
Employer Login
    ↓
Navigate to "Create Assessment"
    ↓
Fill Assessment Details
├─ Title, Type, Description
├─ Instructions
├─ Timer Duration
├─ Passing Percentage
└─ Total Question Count
    ↓
Add Questions
├─ Question 1: Type (MCQ/Visual/Subjective/Upload/Image)
│   ├─ If MCQ: Add options + Correct answer + Marks
│   ├─ If Visual MCQ: Add image options + Correct index
│   ├─ If Subjective: Mark as manual evaluation (no auto-score)
│   ├─ If Upload: Allow file upload, manual review
│   └─ If Image: Add image + Question text
│
├─ Question 2: ...
└─ Question N: ...
    ↓
Review Assessment
├─ Validate: Total marks, passing %, timer
├─ Preview: How it will appear to candidates
└─ Check: All mandatory questions filled
    ↓
Publish Assessment
├─ Status: draft → published
├─ Generate Serial Number (auto-increment per employer)
├─ Validation: Cannot edit once assigned to any job
└─ Success: Assessment ready for use
    ↓
Assessment Available in Library
└─ Can be reused across multiple jobs
```

### 3.2 Detailed Steps

#### Step 1: Create New Assessment

**Endpoint:** `POST /api/employer/assessment`

**Request Body:**
```json
{
  "title": "Advanced JavaScript Assessment",
  "type": "Technical Assessment",
  "description": "Test your JavaScript skills including ES6, async/await, and closures",
  "instructions": "Answer all 20 questions. You have 45 minutes. Do not refresh the page.",
  "timer": 45,
  "totalQuestions": 20,
  "passingPercentage": 70
}
```

**Response:**
```json
{
  "_id": "63a8f2c1b4e2d5f8g9h0i1j2",
  "employerId": "63a8f2c1b4e2d5f8g9h0i1j3",
  "serialNumber": 1,
  "status": "draft",
  "createdAt": "2026-06-22T10:30:00Z"
}
```

#### Step 2: Add Questions to Assessment

**Endpoint:** `PUT /api/employer/assessment/:id/questions`

**Question Type 1: Multiple Choice Question**
```json
{
  "question": "What is the output of console.log(typeof null)?",
  "type": "mcq",
  "options": ["object", "null", "undefined", "function"],
  "correctAnswer": 0,
  "marks": 1,
  "explanation": "typeof null returns 'object' due to a JavaScript quirk"
}
```

**Question Type 2: Visual MCQ (Image Options)**
```json
{
  "question": "Which is the correct syntax?",
  "type": "visual-mcq",
  "optionImages": [
    "https://..../option1.png",
    "https://..../option2.png",
    "https://..../option3.png"
  ],
  "correctAnswer": 1,
  "marks": 2
}
```

**Question Type 3: Subjective Question (Manual Evaluation)**
```json
{
  "question": "Explain the concept of closures in JavaScript with a code example",
  "type": "subjective",
  "marks": 5,
  "explanation": "Closures are functions that have access to variables from their outer scope"
}
```

**Question Type 4: Image Upload**
```json
{
  "question": "Upload a screenshot of your console output",
  "type": "upload",
  "marks": 3
}
```

**Question Type 5: Image-Based MCQ**
```json
{
  "question": "What should replace the ? mark?",
  "type": "image-mcq",
  "imageUrl": "https://..../sequence.png",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 2,
  "marks": 2
}
```

#### Step 3: Publish Assessment

**Endpoint:** `PUT /api/employer/assessment/:id/publish`

**Request:**
```json
{
  "status": "published"
}
```

**Validations:**
- ✓ All questions have been added
- ✓ Total marks > 0
- ✓ Passing percentage is 0-100
- ✓ Timer > 0
- ✓ Assessment not currently assigned to any job

**Post-Publish:**
- Assessment is read-only (cannot edit questions)
- Can still update general settings (description, instructions)
- Ready to assign to jobs/interview rounds

### 3.3 Assessment Question Types & Evaluation

| Type | Question Format | Answer Format | Auto-Evaluate | Manual Review |
|------|-----------------|---------------|---------------|---------------|
| **MCQ** | Text + 4 Options | Select 1 option | ✓ Yes | ✗ No |
| **Visual MCQ** | Text + Image Options | Click image | ✓ Yes | ✗ No |
| **Image MCQ** | Image + 4 Options | Select 1 option | ✓ Yes | ✗ No |
| **Questionary Image MCQ** | Image question with text | Click image | ✓ Yes | ✗ No |
| **Subjective** | Text question | Candidate types answer | ✗ No | ✓ Yes |
| **Upload** | Question asking for upload | Candidate uploads file | ✗ No | ✓ Yes |
| **Image** | Image-based question | Candidate types answer | Depends | Maybe |

### 3.4 Assessment Status

```
draft → published → [assigned to job] → [cannot be edited]
                 ↓
            ready for candidates
```

---

## 4. Job Posting & Interview Round Configuration

### 4.1 Job Creation with Interview Rounds

**Employer Flow:**

```
Create Job Posting
    ↓
Fill Job Details
├─ Title, Description, Location, Salary
├─ Requirements, Responsibilities
└─ Application deadline
    ↓
Define Interview Pipeline
├─ Round 1: Assessment
│   ├─ Select Assessment from library
│   ├─ Set window: fromDate, toDate, startTime, endTime
│   ├─ Option: Multi-day with subStages
│   └─ Application limit (slots available)
│
├─ Round 2: Technical Interview
│   ├─ Interview type: oneOnOne / panel / group
│   ├─ Schedule using Scheduler service
│   ├─ Set interview dates/times
│   ├─ Add interview room/meeting links
│   └─ Assign interviewers
│
├─ Round 3: HR Interview
│   ├─ Interview type: oneOnOne / hr
│   ├─ Schedule dates/times
│   └─ Add location / meeting link
│
└─ Round 4: Offer (if passed all)
    ├─ Salary negotiation round
    └─ Final offer details
    ↓
Publish Job
    ↓
Job Live → Candidates can apply
```

### 4.2 Interview Round Configuration

#### Round Type 1: Assessment Round

**Endpoint:** `POST /api/employer/job/:jobId/interview-round`

```json
{
  "name": "Online Assessment",
  "roundType": "assessment",
  "assessmentId": "63a8f2c1b4e2d5f8g9h0i1j2",
  "fromdate": "2026-06-25T00:00:00Z",
  "todate": "2026-06-27T23:59:59Z",
  "startTime": "09:00",
  "endTime": "17:00",
  "applicationLimit": 100,
  
  // Optional: Multi-day slots
  "subStages": [
    {
      "fromDate": "2026-06-25T00:00:00Z",
      "startTime": "09:00",
      "endTime": "17:00",
      "applicationLimit": 30
    },
    {
      "fromDate": "2026-06-26T00:00:00Z",
      "startTime": "09:00",
      "endTime": "17:00",
      "applicationLimit": 40
    },
    {
      "fromDate": "2026-06-27T00:00:00Z",
      "startTime": "09:00",
      "endTime": "17:00",
      "applicationLimit": 30
    }
  ]
}
```

#### Round Type 2: Technical Interview (One-on-One)

```json
{
  "name": "Technical Round - Round 1",
  "roundType": "oneOnOne",
  "fromdate": "2026-06-28T00:00:00Z",
  "todate": "2026-06-30T23:59:59Z",
  
  // Scheduler payload (from interview scheduling service)
  "schedulesArray": [
    {
      "date": "2026-06-28",
      "slots": [
        { "startTime": "10:00", "endTime": "10:45", "interviewerId": "emp123", "candidateId": "cand456" },
        { "startTime": "11:00", "endTime": "11:45", "interviewerId": "emp123", "candidateId": "cand457" }
      ]
    }
  ],
  
  "roomsArray": [
    {
      "roomId": "room1",
      "roomName": "Conference Room A",
      "capacity": 2,
      "type": "physical"
    }
  ],
  
  "numStudents": 30,
  "numHRs": 3,
  "applicationLimit": 30
}
```

#### Round Type 3: Panel Interview

```json
{
  "name": "Panel Discussion",
  "roundType": "panel",
  "fromdate": "2026-07-01T00:00:00Z",
  "todate": "2026-07-02T23:59:59Z",
  "startTime": "14:00",
  "endTime": "17:00",
  
  "schedulesArray": [
    {
      "date": "2026-07-01",
      "slots": [
        {
          "startTime": "14:00",
          "endTime": "14:30",
          "panelMembers": ["emp1", "emp2", "emp3"],
          "candidateGroups": [["cand1", "cand2", "cand3"]]
        }
      ]
    }
  ],
  "applicationLimit": 15
}
```

### 4.3 Complete Job Flow with Multiple Rounds

```
Job Posted with 4 Rounds:
│
├─ Round 1: Assessment (Mandatory)
│   └─ Status: pending (awaiting candidates to start)
│
├─ Round 2: Technical (For those who pass Round 1)
│   └─ Status: not_started (waiting for Round 1 completion)
│
├─ Round 3: HR (For those who pass Round 2)
│   └─ Status: not_started (waiting for Round 2 completion)
│
└─ Round 4: Final (For those who pass all)
    └─ Status: not_started (waiting for Round 3 completion)

Candidate applies
    ↓
Moved to Assessment (Round 1)
    ↓
✓ Pass Assessment → Moved to Technical (Round 2)
✗ Fail Assessment → Rejected
    ↓
✓ Pass Technical → Moved to HR (Round 3)
✗ Fail Technical → Rejected
    ↓
✓ Pass HR → Moved to Final (Round 4)
✗ Fail HR → Rejected
    ↓
✓ Pass Final → Hired / Offer Sent
✗ Fail Final → Rejected
```

---

## 5. Candidate Application & Pre-Assessment Flow

### 5.1 Candidate Sees Job & Applies

```
Candidate Browses Jobs
    ↓
Sees Job: "Senior JavaScript Developer"
├─ Reads job description
├─ Reviews interview pipeline
│   ├─ Round 1: Online Assessment (45 min)
│   ├─ Round 2: Technical Interview (30 min)
│   └─ Round 3: HR Interview (20 min)
└─ Checks eligibility
    ↓
Click "Apply Now"
    ↓
System Creates Application
├─ Application.status = "pending"
├─ Application.assessmentStatus = "pending"
└─ Stored in DB
    ↓
Application Submitted ✓
├─ Confirmation message shown
└─ Email sent to candidate
```

### 5.2 Assessment Becomes Available

**Timing Context Resolution:**

The system checks these sources in order of priority to determine when candidate can take assessment:

```
Priority 1: InterviewRound.fromdate / todate
            (Employer-set window for this specific round)
              ↓ If not found
Priority 2: InterviewRound.subStages[].fromDate / times
            (Multi-day slots if configured)
              ↓ If not found
Priority 3: Job.interviewRoundDetails.assessmentStartDate / EndDate
            (Fallback to job-level settings)
              ↓ If not found
Priority 4: Job.assessmentStartDate / EndDate
            (Last resort: job posting date + deadline)
              ↓ If still not found
            → Assessment always available (no time window)
```

### 5.3 Assessment Invite Flow

**Step 1: Assessment Window Opens**

```
Current time = 2026-06-25 09:05 AM
Round window = 2026-06-25 09:00 - 2026-06-27 17:00
    ↓
Assessment becomes "available"
    ↓
Application.assessmentStatus = "available"
```

**Step 2: Candidate Sees Assessment**

**Endpoint:** `GET /api/candidate/assessment/:applicationId`

**Response:**
```json
{
  "assessmentId": "63a8f2c1b4e2d5f8g9h0i1j2",
  "title": "Advanced JavaScript Assessment",
  "description": "Test your JavaScript skills...",
  "instructions": "Answer all 20 questions. You have 45 minutes...",
  "timer": 45,
  "totalQuestions": 20,
  "assessmentStatus": "available",
  "windowStatus": "open",
  "timeRemaining": 172800,  // seconds until window closes
  "canStart": true
}
```

**Step 3: Candidate Starts Assessment**

**Endpoint:** `POST /api/candidate/assessment/:applicationId/start`

```
Request: { }

Response:
{
  "attemptId": "63a8f2c1b4e2d5f8g9h0i1j20",
  "status": "in_progress",
  "startedAt": "2026-06-25T09:05:00Z",
  "endTime": "2026-06-25T09:50:00Z",
  "questions": [
    {
      "questionId": "q1",
      "questionText": "What is the output of console.log(typeof null)?",
      "type": "mcq",
      "options": ["object", "null", "undefined", "function"],
      "marks": 1
    },
    { ... }
  ]
}
```

**System Actions:**
- ✓ Create AssessmentAttempt record
- ✓ Application.assessmentStatus = "in_progress"
- ✓ Start proctoring monitoring (if enabled)
- ✓ Set auto-submit timer (45 minutes)

---

## 6. Assessment Execution Flow (Candidate)

### 6.1 Assessment Window

```
Candidate Taking Assessment
│
├─ UI Elements
│   ├─ Question counter: "Question 1 of 20"
│   ├─ Timer display: "44:30" (counting down)
│   ├─ Navigation: Previous/Next buttons
│   ├─ Question palette (jump to any question)
│   ├─ Unanswered indicator
│   └─ Submit button (greyed until all answered)
│
├─ Proctoring Active (if enabled)
│   ├─ Monitor tab switches
│   ├─ Monitor window focus
│   ├─ Monitor fullscreen exit
│   ├─ Monitor window minimize
│   ├─ Track mouse movements
│   └─ Take periodic screenshots
│
└─ Candidate Actions
    ├─ Select answer (MCQ)
    ├─ Type answer (Subjective)
    ├─ Upload file (Upload type)
    ├─ Review questions
    ├─ Flag for review
    └─ Submit assessment
```

### 6.2 Violation Tracking During Assessment

**Warning Violations (Accumulate):**

```
Tab Switch
├─ Severity: Warning
├─ Action: Log violation + display warning popup
├─ Count: Accumulates (4 warnings = 1 message, 5 = suspend)
└─ Example: Candidate switches to browser tab with solutions

Window Blur/Focus
├─ Severity: Warning
├─ Action: Log violation + display warning
└─ Example: Candidate minimizes window or switches to another app

Window Minimize
├─ Severity: Warning
├─ Action: Log violation + display warning
└─ Example: User minimizes entire browser/window

Fullscreen Exit
├─ Severity: Warning
├─ Action: Log violation
└─ Example: Candidate exits fullscreen mode (if required)

Multi-Screen Detection
├─ Severity: Warning
├─ Action: Log violation + may suspend
└─ Example: External monitor detected
```

**Critical Violations (Immediate Action):**

```
Tab Close
├─ Action: Auto-submit assessment immediately
├─ Result: Assessment marked as submitted
├─ Status: "submitted" (with auto_submitted flag)
└─ Evaluation: Uses answers provided so far

Assessment Page Close
├─ Action: Confirm with candidate "Are you sure?"
├─ If confirmed: Auto-submit immediately
└─ If cancelled: Resume assessment

Screen Capture Detection (Screenshot/Print Screen)
├─ Severity: Critical
├─ Action: Immediate suspension + application rejection
├─ Result: AssessmentAttempt.status = "suspended"
└─ Application.status = "rejected"
```

**Violation Accumulation Logic:**

```
Violation Count Tracker:
├─ 1st violation: ⚠️ "Don't switch tabs" warning
├─ 2nd violation: ⚠️ "Switching tabs is not allowed" warning
├─ 3rd violation: ⚠️ "One more violation will suspend" warning
├─ 4th violation: ⚠️ Message/notification shown
├─ 5th violation: 🛑 Assessment suspended + application rejected
└─ Any screen capture: 🛑 Immediate suspension + rejection
```

### 6.3 Assessment Submission

**Scenario A: Normal Completion**

```
Candidate answers all 20 questions
    ↓
Clicks "Submit Assessment"
    ↓
Confirmation: "Are you sure you want to submit?"
    ↓
Clicks "Confirm Submit"
    ↓
Endpoint: POST /api/candidate/assessment/:attemptId/submit
    ↓
System Actions:
├─ Save all answers
├─ Calculate objective scores
├─ Mark subjective questions as pending
├─ Calculate total percentage
├─ Determine pass/fail
└─ Update Application.assessmentStatus = "completed"
    ↓
Response:
{
  "status": "submitted",
  "submittedAt": "2026-06-25T09:48:30Z",
  "totalMarks": 20,
  "obtainedMarks": 16,
  "percentage": 80,
  "result": "pending",  // Pending manual evaluation of subjective
  "message": "Assessment submitted. Results pending review."
}
    ↓
Candidate Sees:
"Your assessment has been submitted successfully.
 Results will be available once evaluation is complete."
```

**Scenario B: Auto-Submit on Time Expiry**

```
Timer reaches 00:00
    ↓
System automatically submits
├─ AssessmentAttempt.isSubmissionAuto = true
├─ AssessmentAttempt.status = "submitted"
└─ Uses answers filled so far
    ↓
Candidate Notification:
⏰ "Time's up! Your assessment has been auto-submitted."
    ↓
Evaluation proceeds normally
```

**Scenario C: Auto-Submit on Critical Violation**

```
Candidate attempts screen capture
    ↓
System immediately suspends
├─ AssessmentAttempt.status = "suspended"
├─ AssessmentAttempt.suspensionReason = "screen_capture_detected"
├─ Application.assessmentStatus = "suspended"
└─ Application.status = "rejected"
    ↓
Candidate Sees:
"⛔ Assessment suspended due to policy violation.
 Your application has been rejected."
```

**Scenario D: Expired Without Starting**

```
Assessment window closes (2026-06-27 17:00)
    ↓
Candidate never started assessment
    ↓
System auto-action (no-show detection):
├─ Application.assessmentStatus = "no_show"
├─ Application.status = "rejected"
└─ InterviewProcess.stages[0].status = "no_show"
    ↓
Candidate Notification:
"Assessment window expired. You did not attempt the assessment.
 Your application has been rejected."
```

### 6.4 Score Calculation

**For Assessment with Objective + Subjective Questions:**

```
Total Questions: 20
Objective Questions (Auto-graded): 15
├─ Each worth 1 mark
└─ Subtotal: 15 marks

Subjective Questions (Manual-graded): 5
├─ Each worth 1-5 marks (varies)
└─ Subtotal: 15 marks (pending employer review)

Total Marks: 30
Passing Score: 60% = 18 marks

Candidate Scores:
├─ Objective: 14/15 (auto-graded)
├─ Subjective: pending (waiting for employer review)
└─ Current: 14/30 = 46.67% (incomplete)

After Employer Reviews Subjective:
├─ Objective: 14/15
├─ Subjective: 5/15 (employer awarded 5 out of 15)
└─ Final: 19/30 = 63.33% ✓ PASSED (> 60% threshold)
```

---

## 7. Assessment Evaluation Flow (Employer)

### 7.1 Evaluation Dashboard

**Endpoint:** `GET /api/employer/assessment/:assessmentId/submissions`

**Response: List of Submissions**

```json
[
  {
    "attemptId": "63a8f2c1b4e2d5f8g9h0i1j20",
    "candidateName": "John Doe",
    "candidateEmail": "john@example.com",
    "jobTitle": "Senior JavaScript Developer",
    "submittedAt": "2026-06-25T09:48:30Z",
    "objectiveScore": "14/15",
    "subjectiveScore": "pending",
    "totalScore": "pending",
    "status": "pending_review",
    "violation_count": 0
  },
  {
    "attemptId": "63a8f2c1b4e2d5f8g9h0i1j21",
    "candidateName": "Jane Smith",
    "candidateEmail": "jane@example.com",
    "jobTitle": "Senior JavaScript Developer",
    "submittedAt": "2026-06-25T10:15:00Z",
    "objectiveScore": "12/15",
    "subjectiveScore": "pending",
    "totalScore": "pending",
    "status": "pending_review",
    "violation_count": 3,
    "violationDetails": "3 tab switches (warnings)"
  }
]
```

### 7.2 Review Subjective Answers

**Endpoint:** `GET /api/employer/assessment/:attemptId/details`

**Response: Full Attempt Details**

```json
{
  "attemptId": "63a8f2c1b4e2d5f8g9h0i1j20",
  "candidateName": "John Doe",
  "candidateEmail": "john@example.com",
  "submittedAt": "2026-06-25T09:48:30Z",
  "durationSeconds": 180,
  "violations": [
    {
      "violationType": "tab_switch",
      "timestamp": "2026-06-25T09:15:00Z",
      "severity": "warning"
    }
  ],
  "answers": [
    {
      "questionId": "q1",
      "questionText": "What is the output of console.log(typeof null)?",
      "type": "mcq",
      "candidateAnswer": 0,
      "correctAnswer": 0,
      "isCorrect": true,
      "marks": 1
    },
    {
      "questionId": "q15",
      "questionText": "Explain the concept of closures in JavaScript with a code example",
      "type": "subjective",
      "candidateAnswer": "Closures are functions that retain access to variables from their outer scope... [full answer]",
      "marks": 0,  // Not yet evaluated
      "evaluationStatus": "pending",
      "placeholderForEvaluation": true
    },
    {
      "questionId": "q18",
      "questionText": "Upload a screenshot of your console output",
      "type": "upload",
      "candidateAnswer": "https://storage/.../uploaded_file.png",
      "marks": 0,
      "evaluationStatus": "pending"
    }
  ],
  "objectiveResults": {
    "totalObjective": 15,
    "correctAnswers": 14,
    "score": 14,
    "percentage": 93.33
  }
}
```

### 7.3 Manual Evaluation of Subjective Answers

**Endpoint:** `PUT /api/employer/assessment/:attemptId/evaluate`

**Request: Evaluate Each Subjective Question**

```json
{
  "subjectiveEvaluations": [
    {
      "questionId": "q15",
      "marks": 4,
      "comments": "Good explanation of closures. Code example is correct. Minor: could mention memory implications."
    },
    {
      "questionId": "q18",
      "marks": 3,
      "comments": "Screenshot shows correct output but lacks explanation."
    }
  ]
}
```

**Response: Updated Result**

```json
{
  "attemptId": "63a8f2c1b4e2d5f8g9h0i1j20",
  "evaluationComplete": true,
  "finalResults": {
    "objectiveScore": 14,
    "subjectiveScore": 7,
    "totalMarks": 30,
    "obtainedMarks": 21,
    "percentage": 70.0,
    "result": "pass"
  },
  "previousResult": "pending",
  "updatedResult": "pass",
  "qualificationForNextRound": true
}
```

**System Actions on Completion:**

```
✓ Mark all subjective questions as evaluated
✓ Calculate final percentage (70%)
✓ Determine pass/fail based on threshold (60%)
✓ Update Application.assessmentStatus = "completed"
✓ Update Application.assessmentResult = "pass"
✓ Create ApplicationStatusHistory entry
✓ If passed: Move candidate to InterviewProcess stage 2
✓ If failed: Application.status = "rejected"
✓ Send notification email to candidate
```

### 7.4 Assessment Evaluation Scenarios

**Scenario 1: Candidate Passes**

```
Objective: 14/15 = 93.33%
Subjective: 5/5 (employer evaluates as full marks)
Total: 19/20 = 95%
Passing Threshold: 60%

Result: ✓ PASSED
    ↓
Application.assessmentResult = "pass"
Application.assessmentStatus = "completed"
InterviewProcess.stages[0].status = "passed"
Candidate moved to next round
```

**Scenario 2: Candidate Fails**

```
Objective: 8/15 = 53.33%
Subjective: 3/5 (employer evaluates)
Total: 11/20 = 55%
Passing Threshold: 60%

Result: ✗ FAILED
    ↓
Application.assessmentResult = "fail"
Application.assessmentStatus = "completed"
Application.status = "rejected"
InterviewProcess.stages[0].status = "failed"
Candidate removed from pipeline
Email sent: "Unfortunately, you did not meet the assessment threshold."
```

**Scenario 3: Suspended (Policy Violation)**

```
Screen capture detected during assessment
    ↓
System immediately suspends
    ↓
Application.assessmentStatus = "suspended"
Application.assessmentResult = "suspended"
Application.status = "rejected"
Email sent: "Your assessment was suspended due to policy violation."
```

**Scenario 4: Assessment Expired (No Attempt)**

```
Assessment window: June 25-27 (closes at 17:00 on June 27)
Current time: June 28 10:00 AM
Candidate never started assessment
    ↓
Application.assessmentStatus = "expired"
Application.assessmentResult = "no_show"
Application.status = "rejected"
```

---

## 8. Interview Process & Round Management

### 8.1 Interview Process Initialization

**When:** After candidate passes assessment (or if assessment not required)

**Process:**

```
Assessment Passed / Assessment Not Required
    ↓
System creates InterviewProcess for the candidate
    ↓
InterviewProcess created:
{
  applicationId: "...",
  jobId: "...",
  candidateId: "...",
  employerId: "...",
  processStatus: "not_started",
  
  stages: [
    {
      stageType: "oneOnOne",
      stageName: "Technical Round 1",
      stageOrder: 1,
      status: "pending"  // Awaiting employer scheduling
    },
    {
      stageType: "oneOnOne",
      stageName: "Technical Round 2",
      stageOrder: 2,
      status: "pending"
    },
    {
      stageType: "hr",
      stageName: "HR Interview",
      stageOrder: 3,
      status: "pending"
    }
  ]
}
    ↓
Application.interviewProcesses.push(interviewProcess)
Application.status = "shortlisted"
    ↓
Notification to employer:
"X new candidates passed assessment and are ready for interviews."
```

### 8.2 Interview Round Scheduling (Non-Assessment)

**Employer Views Candidates**

```
Endpoint: GET /api/employer/job/:jobId/candidates?round=1

Response: List of shortlisted candidates
[
  {
    "candidateId": "cand1",
    "candidateName": "John Doe",
    "email": "john@example.com",
    "assessmentScore": "70%",
    "appliedAt": "2026-06-20",
    "shortlistedAt": "2026-06-25",
    "interviewStatus": "pending"
  },
  {
    "candidateId": "cand2",
    "candidateName": "Jane Smith",
    ...
  }
]
```

**Employer Schedules Interview**

```
Endpoint: POST /api/employer/job/:jobId/schedule-interview

Request:
{
  "applicationId": "app1",
  "stageId": "stage1",
  "scheduledDate": "2026-07-01",
  "scheduledTime": "10:00",
  "interviewerId": "emp1",
  "interviewerName": "Mr. Sharma",
  "interviewerEmail": "sharma@company.com",
  "meetingLink": "https://zoom.us/meeting/123456",
  "location": "Conference Room A",
  "notes": "Please prepare system design questions"
}
    ↓
Response:
{
  "interviewId": "int1",
  "status": "scheduled",
  "scheduledAt": "2026-06-30T14:30:00Z"
}
    ↓
System Actions:
├─ Update InterviewProcess.stages[0].status = "scheduled"
├─ Store scheduling details
├─ Set InterviewProcess.processStatus = "in_progress"
└─ Send email to candidate with meeting link
```

### 8.3 Interview Stages Lifecycle

#### Stage Status Flow

```
pending
  ↓ (employer schedules)
scheduled
  ↓ (interview date arrives)
in_progress
  ↓ (interview completes)
completed
  ↓ (employer evaluates)
passed / failed / expired / suspended / no_show / cancelled
```

#### Interview On Scheduled Date

**1 Hour Before:**
- Candidate receives reminder email
- Meeting link/location confirmation

**At Scheduled Time:**
- System marks stage as "in_progress"
- Interviewer joins meeting
- Candidate joins meeting

**During Interview:**
- Interviewer evaluates candidate
- Notes can be added live or after

**After Interview:**
- Employer marks stage as "completed"
- Adds feedback and rating
- Decides: pass / fail / hold

### 8.4 Interview Result Recording

**Endpoint:** `PUT /api/employer/interview/:stageId/result`

```json
{
  "status": "completed",
  "result": "passed",
  "rating": 4,
  "feedback": "Excellent problem-solving skills, good communication. Ready for next round.",
  "interviewerNotes": "- Asked about system design\n- Discussed distributed systems\n- Strong fundamentals",
  "candidateNotes": "Candidate seemed confident and well-prepared."
}
```

**Response & System Actions:**

```json
{
  "status": "updated",
  "stageName": "Technical Round 1",
  "newStatus": "passed",
  "nextAction": "Candidate moved to HR Interview"
}
```

**Database Updates:**
```
InterviewProcess.stages[0].status = "passed"
InterviewProcess.stages[0].feedback = "..."
InterviewProcess.stages[0].rating = 4
InterviewProcess.stages[0].completedAt = now
InterviewProcess.stages[0].statusHistory.push(...)

// Check if all stages completed
if (allStagespassed) {
  InterviewProcess.processStatus = "completed"
  InterviewProcess.finalDecision = "selected"
  Application.status = "shortlisted" → "hired" / "offer_sent"
}
else if (this_stage_failed) {
  InterviewProcess.processStatus = "rejected"
  Application.status = "rejected"
}
else {
  // Move to next pending stage
  InterviewProcess.stages[1].status = "scheduled"
}
```

---

## 9. Non-Assessment Interview Rounds

### 9.1 Different Interview Types

| Type | Format | Capacity | Interviewers | Use Case |
|------|--------|----------|--------------|----------|
| **One-on-One** | 1 Candidate + 1 Interviewer | 1:1 | Single | Initial screening, specific dept interviews |
| **Panel** | 1 Candidate + 3-5 Panel Members | 1:Many | Multiple | Final rounds, senior positions |
| **Group** | 4-6 Candidates + 2 Interviewers | Many:Many | Multiple | Group discussion, team fit assessment |
| **Technical** | 1 Candidate + 1 Technical Lead | 1:1 | Technical | Coding test, technical deep dive |
| **Managerial** | 1 Candidate + Manager | 1:1 | Manager | Leadership assessment |
| **HR** | 1 Candidate + HR | 1:1 | HR | Culture fit, benefits discussion |

### 9.2 Scheduler Integration

**Multi-Day Interview with Multiple Slots:**

```json
{
  "name": "Technical Round - Batch 1",
  "roundType": "oneOnOne",
  "schedulesArray": [
    {
      "date": "2026-07-01",
      "slots": [
        {
          "slotId": "slot1",
          "startTime": "10:00",
          "endTime": "10:45",
          "interviewerId": "emp1",
          "interviewer": "Alice Johnson",
          "assignedCandidateId": "cand1",
          "candidateName": "John Doe",
          "meetingLink": "zoom.com/123456"
        },
        {
          "slotId": "slot2",
          "startTime": "11:00",
          "endTime": "11:45",
          "interviewerId": "emp1",
          "assignedCandidateId": "cand2",
          "candidateName": "Jane Smith"
        }
      ]
    },
    {
      "date": "2026-07-02",
      "slots": [
        {
          "slotId": "slot3",
          "startTime": "09:00",
          "endTime": "09:45",
          "interviewerId": "emp2",
          "interviewer": "Bob Williams",
          "assignedCandidateId": "cand3",
          "candidateName": "Mike Chen"
        }
      ]
    }
  ]
}
```

### 9.3 Candidate's Interview Experience

**Candidate Receives Interview Invite:**

```
Email:
Subject: Interview Scheduled - Senior JavaScript Developer

Dear John,

Your interview for the position of Senior JavaScript Developer has been scheduled.

Interview Details:
├─ Round: Technical Round 1
├─ Date & Time: July 1, 2026 at 10:00 AM (IST)
├─ Duration: 45 minutes
├─ Interviewer: Alice Johnson
├─ Meeting Link: https://zoom.us/meeting/123456
└─ Location: Conference Room A (or virtual)

Please join 5 minutes early.

Best Regards,
TaleGlobal Recruitment Team
```

**Candidate Joins Interview:**

```
Timeline:
09:55 - Candidate logs in to Zoom
10:00 - Interviewer joins, interview starts
10:45 - Interview concludes
10:50 - Interviewer may add feedback immediately

System Actions:
├─ Record startTime
├─ Set stage status = "in_progress"
├─ Monitor for no-shows
└─ Record endTime when completed
```

---

## 10. Manual Tracking & Status Management

### 10.1 Employer Dashboard - Real-Time Tracking

**View All Candidates in Pipeline:**

```
Endpoint: GET /api/employer/job/:jobId/pipeline

Response:
{
  "jobTitle": "Senior JavaScript Developer",
  "totalApplications": 150,
  "pipeline": {
    "stage1_assessment": {
      "name": "Online Assessment",
      "totalCandidates": 150,
      "breakdown": {
        "pending": 25,          // Not yet started
        "in_progress": 5,       // Currently taking
        "passed": 45,           // Moved to next stage
        "failed": 60,           // Did not meet threshold
        "suspended": 2,         // Policy violation
        "expired": 13           // Didn't attempt in time
      }
    },
    "stage2_technical": {
      "name": "Technical Interview",
      "totalCandidates": 45,
      "breakdown": {
        "pending": 10,          // Not yet scheduled
        "scheduled": 20,        // Scheduled but not conducted
        "in_progress": 2,       // Interview happening now
        "passed": 8,            // Marked as passed
        "failed": 5,            // Marked as failed
        "no_show": 3,           // Didn't show up
        "cancelled": 2          // Candidate cancelled
      }
    },
    "stage3_hr": {
      "name": "HR Interview",
      "totalCandidates": 8,
      "breakdown": {
        "pending": 2,
        "scheduled": 4,
        "completed": 2
      }
    },
    "finalRound": {
      "name": "Final Decision",
      "totalCandidates": 2,
      "breakdown": {
        "pending": 2
      }
    }
  },
  "metrics": {
    "passRate": "30%",           // 45/150
    "averageAssessmentScore": "68%",
    "conversionRate": "1.3%"     // hired/total
  }
}
```

### 10.2 Manual Status Updates

**Update Candidate Status Manually:**

```
Scenario: Candidate Mark was unable to attend interview due to emergency

Employer Action:
├─ Navigate to candidate profile
├─ Click "Update Status" for the interview stage
└─ Select "Reschedule" / "Mark No-Show" / "Hold"

Endpoint: PUT /api/employer/interview/:stageId/manual-update

Request:
{
  "action": "reschedule",  // or "no_show", "pass", "fail", "hold"
  "newDate": "2026-07-08",
  "newTime": "14:00",
  "notes": "Rescheduled due to candidate request",
  "changedBy": "emp1"
}

Response:
{
  "stageId": "stage_id",
  "previousStatus": "scheduled",
  "newStatus": "scheduled",
  "rescheduleTime": "2026-07-08T14:00:00Z",
  "statusHistory": [
    {
      "status": "scheduled",
      "changedAt": "2026-07-01T10:30:00Z",
      "changedBy": "system"
    },
    {
      "status": "rescheduled",
      "changedAt": "2026-07-01T14:25:00Z",
      "changedBy": "emp1",
      "notes": "Rescheduled due to candidate request"
    }
  ]
}
```

### 10.3 Status History Tracking

**View Complete Status History for a Candidate:**

```
Endpoint: GET /api/candidate/:applicationId/status-history

Response:
{
  "applicationId": "app1",
  "candidateName": "John Doe",
  "jobTitle": "Senior JavaScript Developer",
  "statusTimeline": [
    {
      "timestamp": "2026-06-20T09:15:00Z",
      "status": "applied",
      "application_status": "pending",
      "changedBy": "system",
      "notes": "Application submitted successfully"
    },
    {
      "timestamp": "2026-06-24T16:30:00Z",
      "status": "assessment_available",
      "application_status": "pending",
      "assessment_status": "available",
      "changedBy": "system",
      "notes": "Assessment window opened"
    },
    {
      "timestamp": "2026-06-25T09:05:00Z",
      "status": "assessment_started",
      "application_status": "pending",
      "assessment_status": "in_progress",
      "changedBy": "system",
      "notes": "Candidate started assessment"
    },
    {
      "timestamp": "2026-06-25T09:48:30Z",
      "status": "assessment_submitted",
      "application_status": "pending",
      "assessment_status": "completed",
      "changedBy": "system",
      "notes": "Assessment submitted - auto-graded: 93%, subjective pending"
    },
    {
      "timestamp": "2026-06-25T14:20:00Z",
      "status": "assessment_evaluated",
      "application_status": "shortlisted",
      "assessment_status": "completed",
      "assessment_result": "pass",
      "changedBy": "emp1",
      "notes": "Subjective evaluation complete - Final: 70% - PASSED"
    },
    {
      "timestamp": "2026-06-26T10:00:00Z",
      "status": "interview_scheduled",
      "application_status": "shortlisted",
      "interview_stage": "Technical Round 1",
      "changedBy": "emp1",
      "notes": "Interview scheduled for July 1 at 10:00 AM"
    },
    {
      "timestamp": "2026-07-01T10:00:00Z",
      "status": "interview_in_progress",
      "interview_stage": "Technical Round 1",
      "changedBy": "system",
      "notes": "Interview started"
    },
    {
      "timestamp": "2026-07-01T10:45:00Z",
      "status": "interview_completed",
      "application_status": "shortlisted",
      "interview_stage": "Technical Round 1",
      "changedBy": "emp1",
      "notes": "Interview completed - Rating: 4/5 - Result: PASSED"
    }
  ]
}
```

### 10.4 Bulk Actions

**Employer can perform bulk operations on multiple candidates:**

```
Endpoint: POST /api/employer/job/:jobId/bulk-action

Request:
{
  "action": "send_interview_invite",
  "candidateIds": ["cand1", "cand2", "cand3", "cand4", "cand5"],
  "stageId": "stage2",
  "details": {
    "date": "2026-07-05",
    "time": "10:00",
    "meetingLink": "zoom.com/meeting/123456",
    "notes": "Technical round interview"
  }
}

Response:
{
  "action": "send_interview_invite",
  "successCount": 5,
  "failureCount": 0,
  "details": [
    { "candidateId": "cand1", "status": "invite_sent" },
    { "candidateId": "cand2", "status": "invite_sent" },
    ...
  ]
}
```

---

## 11. Status Transitions & State Machine

### 11.1 Application Status State Machine

```
┌──────────────────────────────────────────────────────────────────┐
│                     Application Status Machine                    │
└──────────────────────────────────────────────────────────────────┘

                          ▼ Candidate Applies
                       [pending]
                          ▼
          ┌───────────────┴───────────────┐
          ▼                                 ▼
    [rejected]←──── Employer ────→ [shortlisted]
    (Pass. Fail)    Reviews           ↓
       ↑            Submission    Interview
       │                          Scheduled
       └─────────────────────────────┘
                      ▼
                [interviewed]
                      ▼
          ┌───────────┴───────────┐
          ▼                        ▼
    [rejected]              [offer_sent]
    (Not Selected)              ↓
       ↑                    [accepted]
       └─ (Declined)  ──── [hired]
```

### 11.2 Assessment Status State Machine (On Application)

```
┌──────────────────────────────────────────────────────────────────┐
│                 Assessment Status State Machine                   │
└──────────────────────────────────────────────────────────────────┘

[not_required] → Assessment not part of process
    (Static)

[pending]
    ↓ (Window opens)
[available]
    ↓ (Candidate starts)
[in_progress]
    ├─ (Submitted) ────────→ [completed]
    ├─ (Time expires) ─────→ [expired]
    ├─ (Violations > 5) ───→ [suspended]
    └─ (Window closes) ────→ [no_show]

[completed] ──→ Result = pass → Next Round
             → Result = fail → [rejected]
             → Result = pending → Wait for manual eval

[suspended] / [expired] / [no_show] → [rejected]
```

### 11.3 InterviewProcess Status State Machine

```
┌──────────────────────────────────────────────────────────────────┐
│              InterviewProcess Status State Machine                │
└──────────────────────────────────────────────────────────────────┘

[not_started]
    ↓ (First stage starts)
[in_progress]
    ├─ Stage 1: [scheduled] → [in_progress] → [passed]
    │                                              ↓
    │                                      Stage 2: [pending]
    │
    ├─ Any stage → [failed] ────→ Process → [rejected]
    │
    └─ Any stage → [suspended] → Process → [rejected]

All stages [passed] 
    ↓
[completed]
    ↓ (Employer makes decision)
finalDecision = [selected] / [rejected] / [on_hold]
```

### 11.4 Complete Status Transition Map

```
ASSESSMENT PHASE:
  Candidate Applies
    ├─ App.status = "pending"
    ├─ App.assessmentStatus = "pending"
    └─ InterviewProcess.processStatus = "not_started"
  
  Assessment Available
    └─ App.assessmentStatus = "available"
  
  Candidate Starts
    └─ App.assessmentStatus = "in_progress"
  
  Candidate Submits / Time Up / Violation
    ├─ App.assessmentStatus = "completed" / "expired" / "suspended"
    └─ System evaluates
  
  Evaluation Complete
    ├─ Result: pass
    │   ├─ App.assessmentResult = "pass"
    │   ├─ App.status = "shortlisted"
    │   ├─ InterviewProcess[0].status = "passed"
    │   └─ InterviewProcess[1].status = "pending" (next stage)
    │
    └─ Result: fail / suspended / no-show
        ├─ App.status = "rejected"
        ├─ App.assessmentResult = "fail"
        └─ InterviewProcess.processStatus = "rejected"

INTERVIEW PHASES:
  Employer Schedules Stage N
    ├─ InterviewProcess.stages[N-1].status = "scheduled"
    ├─ InterviewProcess.processStatus = "in_progress"
    └─ Candidate receives invite
  
  Interview Date Arrives
    └─ Stage status = "in_progress"
  
  Interview Completes
    ├─ Stage status = "completed"
    ├─ Employer provides feedback & result (pass/fail)
    └─ Updates Stage with rating, notes
  
  Stage Passed
    ├─ Stage status = "passed"
    ├─ If more stages: Next stage = "pending"
    └─ Wait for employer to schedule
  
  Stage Failed
    ├─ Stage status = "failed"
    ├─ InterviewProcess.processStatus = "rejected"
    ├─ App.status = "rejected"
    └─ Candidate removed from pipeline

FINAL DECISION:
  All Stages Passed
    ├─ InterviewProcess.processStatus = "completed"
    ├─ InterviewProcess.finalDecision = "selected"
    ├─ Employer generates offer
    ├─ App.status = "offer_sent"
    └─ Await candidate acceptance

  Candidate Accepts Offer
    ├─ App.status = "accepted"
    ├─ InterviewProcess.offerDetails.offerAccepted = true
    └─ Hire complete
```

---

## 12. Proctoring, Violations & Auto-Actions

### 12.1 Proctoring System

**What Gets Monitored:**

```
Real-Time Monitoring:
├─ Tab/Window Activity
│   ├─ Tab switch (away from assessment tab)
│   ├─ Window blur (app loses focus)
│   ├─ Window minimize
│   └─ Fullscreen exit (if required)
│
├─ Hardware Detection
│   ├─ Multi-screen detection
│   ├─ External mouse/keyboard
│   └─ Copy-paste attempts
│
├─ Screen Capture Prevention
│   ├─ Print screen key press
│   ├─ Screenshot tool
│   └─ Screen recording
│
└─ Biometric (Optional)
    ├─ Face detection (webcam)
    └─ Eye gaze tracking
```

### 12.2 Violation Severity & Actions

| Violation Type | Severity | Count Limit | Action | Result |
|---|---|---|---|---|
| Tab Switch | ⚠️ Warning | 5 | Log + Alert | Auto-suspend at 5+ |
| Window Blur | ⚠️ Warning | 5 | Log + Alert | Auto-suspend at 5+ |
| Window Minimize | ⚠️ Warning | 5 | Log + Alert | Auto-suspend at 5+ |
| Fullscreen Exit | ⚠️ Warning | 5 | Log + Alert | Auto-suspend at 5+ |
| Multi-Screen | ⚠️ Warning | Unlimited | Log | Warning only |
| Tab Close | 🔴 Critical | 1 | Auto-submit | Submit immediately |
| Assessment Page Close | 🔴 Critical | 1 | Confirm dialog | If yes, submit |
| Screen Capture | 🔴 Critical | 1 | Suspend | Reject application |

### 12.3 Violation Tracking in AssessmentAttempt

```javascript
violations: [
  {
    violationType: "tab_switch",
    severity: "warning",
    timestamp: "2026-06-25T09:15:00Z",
    actionTaken: "warning_issued"
  },
  {
    violationType: "tab_switch",
    severity: "warning",
    timestamp: "2026-06-25T09:22:00Z",
    actionTaken: "warning_issued"
  },
  {
    violationType: "window_blur",
    severity: "warning",
    timestamp: "2026-06-25T09:35:00Z",
    actionTaken: "warning_issued"
  },
  {
    violationType: "tab_switch",
    severity: "warning",
    timestamp: "2026-06-25T09:45:00Z",
    actionTaken: "warning_issued"
  },
  {
    violationType: "tab_switch",
    severity: "warning",
    timestamp: "2026-06-25T09:48:00Z",
    actionTaken: "auto_submitted"  // 5th violation
  }
]

totalWarningViolations: 4 (before auto-submit)
autoSubmittedDueToViolations: true
```

### 12.4 Auto-Action Decision Tree

```
Violation Detected?
    │
    ├─ Screen Capture?
    │   └─ YES → 🛑 IMMEDIATE SUSPENSION
    │       ├─ Stop assessment
    │       ├─ Set status = "suspended"
    │       ├─ Application.status = "rejected"
    │       └─ No partial credit given
    │
    ├─ Tab Close / Page Close (confirmed)?
    │   └─ YES → ⏱️ AUTO-SUBMIT
    │       ├─ Submit current answers
    │       ├─ Mark isSubmissionAuto = true
    │       └─ Evaluate based on answers so far
    │
    └─ Warning Violation (Tab switch, blur, etc.)?
        ├─ Count >= 5?
        │   └─ YES → 🛑 AUTO-SUSPEND (same as screen capture)
        │
        └─ Count < 5?
            ├─ Show warning popup: "Please don't switch tabs"
            └─ Continue assessment
```

### 12.5 Violation Frequency Thresholds

```
Warning Accumulation:
├─ 1st violation: Alert Level 1 - "Warning: Please stay on the assessment tab"
├─ 2nd violation: Alert Level 2 - "Multiple violations detected. Continue responsibly."
├─ 3rd violation: Alert Level 3 - "Repeated violations. One more will suspend the assessment."
├─ 4th violation: Alert Level 4 - Message notification shown
├─ 5th+ violation: 🛑 AUTO-SUSPEND + AUTO-REJECT
└─ Any Screen Capture: 🛑 IMMEDIATE SUSPENSION

Special Rules:
├─ Screen capture = Instant suspension (1 violation limit)
├─ Tab close = Auto-submit (immediate)
└─ Page refresh = Disallowed (may trigger tab close behavior)
```

---

## 13. Complete End-to-End Workflow

### 13.1 Ideal Path (Candidate Passes & Gets Hired)

```
DAY 1: EMPLOYER SETUP
────────────────────
09:00 - Employer creates Assessment: "Advanced JavaScript"
        (20 questions, 45 min, 60% passing)
10:00 - Employer publishes Assessment
11:00 - Employer posts Job: "Senior JavaScript Developer"
12:00 - Employer creates Job Interview Pipeline:
        ├─ Round 1: Assessment (June 25-27)
        ├─ Round 2: Technical Interview (July 1-2)
        ├─ Round 3: HR Interview (July 5)
        └─ Round 4: Final Decision
14:00 - Employer schedules interviewers for Rounds 2 & 3
15:00 - JOB LIVE → Candidates can apply

DAY 2-3: CANDIDATE APPLICATION
────────────────────────────
June 20:
09:00 - John Doe sees job and applies
09:05 - Application created
        ├─ Application.status = "pending"
        ├─ Application.assessmentStatus = "pending"
        └─ Email confirmation sent

June 24:
10:00 - Assessment window opens (fromdate = June 25 09:00)
        └─ Application.assessmentStatus = "available"
        └─ Email: "Assessment is now available. Start anytime."

DAY 4: ASSESSMENT ATTEMPT
────────────────────────
June 25:
09:05 - John logs in and starts assessment
        ├─ AssessmentAttempt created
        ├─ Application.assessmentStatus = "in_progress"
        ├─ Proctoring enabled
        └─ 45-minute timer starts

09:15 - John switches tabs (checking email)
        ├─ Violation logged (warning 1)
        ├─ Popup: "Please stay on the assessment tab"
        └─ Assessment continues

09:48 - John submits all 20 answers
        ├─ System auto-grades 15 objective questions
        │  └─ Score: 14/15 = 93.33%
        ├─ 5 subjective questions marked pending
        ├─ Application.assessmentStatus = "completed"
        ├─ AssessmentAttempt.result = "pending"
        └─ Email: "Assessment submitted. Results pending review."

DAY 5: ASSESSMENT EVALUATION
──────────────────────────
June 25 14:00 - Employer reviews John's attempt:
  ├─ Views 14/15 objective score (93%)
  ├─ Reviews 5 subjective answers
  ├─ Evaluates each subjective question
  │  ├─ Q15 (Closure explanation): 4/5 - Excellent
  │  ├─ Q18 (Screenshot upload): 3/5 - Good
  │  ├─ Q19 (Theory): 5/5 - Perfect
  │  ├─ Q20 (Case study): 4/5 - Very good
  │  └─ Q21 (Open-ended): 4/5 - Good
  ├─ Final Score: 14 + 20 = 34/40 = 85% ✓ PASSED
  ├─ System updates:
  │  ├─ Application.assessmentStatus = "completed"
  │  ├─ Application.assessmentResult = "pass"
  │  ├─ InterviewProcess created
  │  ├─ InterviewProcess.stages[0].status = "passed"
  │  ├─ InterviewProcess.stages[1].status = "pending"
  │  ├─ Application.status = "shortlisted"
  │  └─ Email sent: "Congratulations! You've passed the assessment."

DAY 6: INTERVIEW SCHEDULING
──────────────────────────
June 26:
09:00 - Employer sees John in qualified candidates list
10:00 - Employer schedules Technical Round (Round 2) for John
        ├─ Date: July 1, 10:00 AM
        ├─ Interviewer: Alice Johnson
        ├─ Meeting Link: zoom.com/123456
        ├─ Duration: 45 min
        ├─ Topic: System Design
        └─ Email sent to John with details

June 30:
18:00 - John receives reminder email for interview tomorrow

DAY 7: TECHNICAL INTERVIEW
─────────────────────────
July 1:
09:55 - John joins Zoom call
10:00 - Alice joins
        ├─ Interview starts
        ├─ InterviewProcess.stages[1].status = "in_progress"
        ├─ System records startTime
        └─ Discussion begins

10:45 - Interview concludes
        ├─ Alice marks stage as "completed"
        ├─ Rating: 4/5 (Excellent)
        ├─ Feedback: "Strong technical knowledge, good communication"
        ├─ Decision: PASSED
        ├─ System updates:
        │  ├─ InterviewProcess.stages[1].status = "passed"
        │  ├─ InterviewProcess.stages[2].status = "pending" (next)
        │  └─ Ready for HR round

DAY 8: HR INTERVIEW SCHEDULING
─────────────────────────────
July 2:
14:00 - Employer schedules HR Round (Round 3) for John
        ├─ Date: July 5, 14:00
        ├─ Interviewer: HR Manager Bob
        ├─ Duration: 20 min
        └─ Email sent to John

DAY 9: HR INTERVIEW
──────────────────
July 5:
13:55 - John joins meeting
14:00 - Bob joins
        ├─ HR discussion begins
        ├─ Culture fit assessment
        ├─ Benefits discussion
        └─ Final questions

14:20 - HR concludes
        ├─ Bob marks as "completed"
        ├─ Rating: 5/5 (Excellent fit)
        ├─ Decision: PASSED
        ├─ System updates:
        │  ├─ InterviewProcess.stages[2].status = "passed"
        │  ├─ All stages passed
        │  ├─ InterviewProcess.processStatus = "completed"
        │  ├─ InterviewProcess.finalDecision = "selected"
        │  └─ Application.status = "shortlisted" → "offer_sent"

DAY 10: OFFER GENERATION
───────────────────────
July 6:
09:00 - Employer reviews John's complete profile:
        ├─ Assessment: 85% (PASSED)
        ├─ Technical: 4/5 (PASSED)
        ├─ HR: 5/5 (PASSED)
        └─ Overall: SELECTED FOR OFFER

10:00 - Employer generates and sends offer:
        ├─ Position: Senior JavaScript Developer
        ├─ Salary: 15,00,000 INR p.a.
        ├─ Joining Date: August 1, 2026
        ├─ Benefits: [Health, Leave, etc.]
        ├─ Email sent with offer letter
        └─ John receives: "Offer Letter - Please review and confirm"

DAY 11: OFFER ACCEPTANCE
───────────────────────
July 7:
10:30 - John reviews offer details
11:00 - John clicks "Accept Offer"
        ├─ InterviewProcess.offerDetails.offerAccepted = true
        ├─ InterviewProcess.offerDetails.offerAcceptedAt = now
        ├─ Application.status = "accepted"
        ├─ Application.status change added to history
        └─ Email: "Welcome aboard! Joining formalities to follow."

11:05 - HR receives notification: "Offer accepted by John Doe"
        └─ HR initiates onboarding process

RESULT: ✅ JOHN DOE HIRED SUCCESSFULLY
───────────────────────────────────────
Total Time: 18 days (Application → Hired)
Process Steps: 7 major stages
System Tracking: Full end-to-end status recorded
```

### 13.2 Non-Ideal Paths

#### Path 2A: Assessment Failed

```
June 25:
09:05 - John starts assessment
09:48 - John submits (Score: 35%)
        └─ Application.assessmentStatus = "completed"

June 25 14:00:
Employer reviews:
├─ Objective: 8/15 = 53%
├─ Subjective: 3/15 = 20%
└─ Total: 11/30 = 36% ✗ FAILED (< 60%)

System Updates:
├─ Application.assessmentResult = "fail"
├─ Application.status = "rejected"
├─ InterviewProcess.processStatus = "rejected"
├─ Email sent: "Unfortunately, you did not meet the assessment threshold."
└─ John removed from pipeline

Status: ❌ REJECTED AT ASSESSMENT STAGE
```

#### Path 2B: Assessment Suspended (Proctoring Violation)

```
June 25:
09:15 - Tab switch (warning 1)
09:22 - Tab switch (warning 2)
09:35 - Window blur (warning 3)
09:42 - Tab switch (warning 4)
09:48 - Tab switch (warning 5)

At warning 5:
├─ System immediately suspends assessment
├─ Application.assessmentStatus = "suspended"
├─ Application.status = "rejected"
├─ Email sent: "Assessment suspended due to policy violation."
└─ John removed from pipeline

Status: ❌ SUSPENDED - POLICY VIOLATION
```

#### Path 2C: Interview No-Show

```
July 1 10:00:
Scheduled Interview: Technical Round

System checks:
├─ Is candidate present? NO
├─ Wait 5 minutes... Still NO
├─ Mark as "no_show"

System Updates:
├─ InterviewProcess.stages[1].status = "no_show"
├─ InterviewProcess.processStatus = "rejected"
├─ Application.status = "rejected"
└─ Email: "You missed your scheduled interview."

Status: ❌ REJECTED - NO-SHOW
```

#### Path 2D: Failed Mid-Pipeline

```
July 1:
Technical Interview concludes:
├─ Alice's feedback: "Weak system design knowledge"
├─ Rating: 2/5
├─ Decision: FAILED

System Updates:
├─ InterviewProcess.stages[1].status = "failed"
├─ InterviewProcess.processStatus = "rejected"
├─ Application.status = "rejected"
└─ Email: "Thank you for your interest. We'll keep your profile active."

Status: ❌ REJECTED AT TECHNICAL ROUND
```

---

## Appendix A: API Endpoints Summary

### Assessment Management
```
POST   /api/employer/assessment              # Create assessment
PUT    /api/employer/assessment/:id          # Update (draft only)
PUT    /api/employer/assessment/:id/publish  # Publish assessment
GET    /api/employer/assessment              # List assessments
GET    /api/employer/assessment/:id          # Get assessment details

POST   /api/candidate/assessment/:appId/start        # Start assessment
GET    /api/candidate/assessment/:appId              # Get active assessment
PUT    /api/candidate/assessment/:appId/answer/:qId  # Save answer
POST   /api/candidate/assessment/:attemptId/submit   # Submit assessment

GET    /api/employer/assessment/:id/submissions      # View submissions
GET    /api/employer/assessment/:attemptId/details   # View attempt details
PUT    /api/employer/assessment/:attemptId/evaluate  # Evaluate subjective
```

### Interview Management
```
POST   /api/employer/job/:jobId/interview-round     # Create round
GET    /api/employer/job/:jobId/interview-rounds    # List rounds
PUT    /api/employer/interview/:roundId             # Update round

POST   /api/employer/job/:jobId/schedule-interview  # Schedule interview
PUT    /api/employer/interview/:stageId/result      # Record result
PUT    /api/employer/interview/:stageId/manual-update # Manual status update

GET    /api/candidate/interview/:stageId            # View interview details
POST   /api/candidate/interview/:stageId/confirm    # Confirm attendance
```

### Pipeline & Tracking
```
GET    /api/employer/job/:jobId/pipeline           # View full pipeline
GET    /api/employer/job/:jobId/candidates         # List candidates
GET    /api/candidate/:appId/status-history        # Status history

POST   /api/employer/job/:jobId/bulk-action        # Bulk operations
```

---

## Appendix B: Glossary

| Term | Definition |
|------|-----------|
| **Assessment** | A test with objective and/or subjective questions |
| **Assessment Attempt** | When a candidate takes an assessment; tracks answers, score, violations |
| **Interview Round** | Job-level definition of an interview stage (timing, type, etc.) |
| **Interview Process** | Application-level tracking of candidate through interview pipeline |
| **Application** | A candidate's application to a specific job |
| **Stage** | One round within an interview process (Assessment, Technical, HR, etc.) |
| **Violation** | Proctoring breach (tab switch, screen capture, etc.) |
| **Status History** | Complete log of all status changes for an application |
| **Passing Percentage** | Score threshold for assessment pass/fail (e.g., 60%) |
| **Subjective Question** | Question requiring manual evaluation by employer |
| **Objective Question** | Question with auto-grading (MCQ, multiple choice, etc.) |
| **No-Show** | Candidate didn't attend scheduled interview or attempt assessment |
| **Shortlisted** | Candidate passed assessment and is in interview pipeline |
| **Hired** | Final offer accepted; candidate is hired |

---

**Document End**
