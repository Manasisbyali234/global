# Comprehensive 5-Round Interview Process Documentation

**Version:** 1.0  
**Last Updated:** December 2024  
**Scope:** Complete 5-round interview process with status update logics

---

## Table of Contents

1. [Overview](#overview)
2. [5-Round Interview Structure](#5-round-interview-structure)
3. [Status Management System](#status-management-system)
4. [Round-by-Round Process](#round-by-round-process)
5. [Status Update Logic](#status-update-logic)
6. [Candidate Journey](#candidate-journey)
7. [Employer Actions](#employer-actions)
8. [System Automations](#system-automations)

---

## 1. Overview

### 1.1 Interview Process Framework

The 5-round interview process is designed to comprehensively evaluate candidates across multiple dimensions:

```
Round 1: Online Assessment (Technical Skills)
Round 2: Technical Interview (Problem Solving)
Round 3: System Design Interview (Architecture Skills)
Round 4: Behavioral Interview (Cultural Fit)
Round 5: Final Interview (Leadership & Vision)
```

### 1.2 Key Status Dimensions

Each candidate has multiple parallel status trackers:

```
Application.status          → pending | shortlisted | interviewed | hired | rejected | offer_sent | accepted
Application.currentRound    → 1 | 2 | 3 | 4 | 5 | completed
InterviewProcess.processStatus → not_started | in_progress | completed | rejected | hired
RoundN.status              → pending | scheduled | in_progress | completed | passed | failed | no_show | cancelled
```

---

## 2. 5-Round Interview Structure

### 2.1 Round Definitions

#### Round 1: Online Assessment
- **Type:** Assessment
- **Duration:** 60 minutes
- **Format:** Online proctored test
- **Content:** Technical questions, coding problems, aptitude
- **Evaluation:** Auto-graded + Manual review
- **Pass Criteria:** 70% minimum score

#### Round 2: Technical Interview
- **Type:** One-on-One Technical
- **Duration:** 45 minutes
- **Format:** Live coding + technical discussion
- **Interviewer:** Senior Developer/Tech Lead
- **Focus:** Problem-solving, coding skills, algorithms
- **Pass Criteria:** Rating ≥ 3/5

#### Round 3: System Design Interview
- **Type:** One-on-One Design
- **Duration:** 60 minutes
- **Format:** Whiteboard/screen sharing design session
- **Interviewer:** Senior Architect/Principal Engineer
- **Focus:** System architecture, scalability, design patterns
- **Pass Criteria:** Rating ≥ 3/5

#### Round 4: Behavioral Interview
- **Type:** HR/Cultural Fit
- **Duration:** 30 minutes
- **Format:** Behavioral questions, culture assessment
- **Interviewer:** HR Manager/Team Lead
- **Focus:** Team fit, communication, values alignment
- **Pass Criteria:** Rating ≥ 3/5

#### Round 5: Final Interview
- **Type:** Leadership/Strategic
- **Duration:** 45 minutes
- **Format:** Strategic discussion, vision alignment
- **Interviewer:** Department Head/VP
- **Focus:** Leadership potential, strategic thinking, company fit
- **Pass Criteria:** Rating ≥ 4/5

### 2.2 Process Flow

```
Application Received
        ↓
    Round 1: Assessment
        ↓ (Pass)
    Round 2: Technical
        ↓ (Pass)
    Round 3: System Design
        ↓ (Pass)
    Round 4: Behavioral
        ↓ (Pass)
    Round 5: Final
        ↓ (Pass)
    Offer Extended
        ↓ (Accept)
      HIRED
```

---

## 3. Status Management System

### 3.1 Application Status Hierarchy

```javascript
{
  applicationId: "app_123",
  candidateId: "cand_456",
  jobId: "job_789",
  
  // Primary Status
  status: "shortlisted", // pending | shortlisted | interviewed | hired | rejected | offer_sent | accepted
  
  // Current Round Tracking
  currentRound: 2, // 1-5, null if not started
  
  // Round-specific statuses
  rounds: {
    round1: {
      type: "assessment",
      status: "completed",
      result: "passed",
      score: 85,
      completedAt: "2024-12-15T10:30:00Z"
    },
    round2: {
      type: "technical_interview",
      status: "in_progress",
      scheduledDate: "2024-12-16T14:00:00Z",
      interviewer: "emp_123"
    },
    round3: {
      type: "system_design",
      status: "pending"
    },
    round4: {
      type: "behavioral",
      status: "pending"
    },
    round5: {
      type: "final",
      status: "pending"
    }
  },
  
  // Status History
  statusHistory: [
    {
      status: "pending",
      changedAt: "2024-12-10T09:00:00Z",
      changedBy: "system",
      notes: "Application submitted"
    },
    {
      status: "shortlisted",
      changedAt: "2024-12-15T10:30:00Z",
      changedBy: "system",
      notes: "Round 1 assessment passed with 85%"
    }
  ]
}
```

### 3.2 Round Status States

```
Round Status Flow:
pending → scheduled → in_progress → completed → [passed | failed | no_show]
                                              ↓
                                         Next Round or Final Decision
```

---

## 4. Round-by-Round Process

### 4.1 Round 1: Online Assessment

#### Initiation Logic
```javascript
// When candidate applies
Application.create({
  status: "pending",
  currentRound: 1,
  rounds: {
    round1: { status: "pending", type: "assessment" }
  }
});

// Assessment becomes available
if (assessmentWindow.isOpen()) {
  Application.update({
    "rounds.round1.status": "available",
    "rounds.round1.availableAt": new Date()
  });
  sendNotification("assessment_available");
}
```

#### Candidate Starts Assessment
```javascript
// POST /api/candidate/assessment/start
{
  applicationId: "app_123"
}

// System Response
Application.update({
  "rounds.round1.status": "in_progress",
  "rounds.round1.startedAt": new Date(),
  "rounds.round1.endTime": addMinutes(new Date(), 60)
});

AssessmentAttempt.create({
  applicationId: "app_123",
  startedAt: new Date(),
  status: "in_progress"
});
```

#### Assessment Completion & Evaluation
```javascript
// Auto-submit or manual submit
Application.update({
  "rounds.round1.status": "completed",
  "rounds.round1.completedAt": new Date()
});

// After employer evaluation
if (finalScore >= 70) {
  Application.update({
    "rounds.round1.result": "passed",
    "rounds.round1.score": finalScore,
    currentRound: 2,
    "rounds.round2.status": "pending",
    status: "shortlisted"
  });
  addStatusHistory("shortlisted", "Round 1 passed with " + finalScore + "%");
  scheduleNextRound();
} else {
  Application.update({
    "rounds.round1.result": "failed",
    status: "rejected"
  });
  addStatusHistory("rejected", "Round 1 failed with " + finalScore + "%");
}
```

### 4.2 Round 2: Technical Interview

#### Scheduling
```javascript
// Employer schedules interview
// PUT /api/employer/schedule-interview
{
  applicationId: "app_123",
  round: 2,
  scheduledDate: "2024-12-16T14:00:00Z",
  interviewerId: "emp_123",
  meetingLink: "https://zoom.us/j/123456789"
}

Application.update({
  "rounds.round2.status": "scheduled",
  "rounds.round2.scheduledDate": scheduledDate,
  "rounds.round2.interviewer": interviewerId,
  "rounds.round2.meetingLink": meetingLink
});

addStatusHistory("interviewed", "Round 2 technical interview scheduled");
sendNotification("interview_scheduled");
```

#### Interview Conduct
```javascript
// Interview starts (system auto-detects or manual update)
Application.update({
  "rounds.round2.status": "in_progress",
  "rounds.round2.actualStartTime": new Date()
});

// Interview completion
// PUT /api/employer/interview/complete
{
  applicationId: "app_123",
  round: 2,
  rating: 4,
  feedback: "Strong problem-solving skills, good coding practices",
  result: "passed"
}

Application.update({
  "rounds.round2.status": "completed",
  "rounds.round2.result": "passed",
  "rounds.round2.rating": 4,
  "rounds.round2.feedback": feedback,
  "rounds.round2.completedAt": new Date(),
  currentRound: 3,
  "rounds.round3.status": "pending"
});

addStatusHistory("shortlisted", "Round 2 passed - Rating: 4/5");
```

#### Failure Handling
```javascript
if (result === "failed" || rating < 3) {
  Application.update({
    "rounds.round2.result": "failed",
    status: "rejected"
  });
  addStatusHistory("rejected", "Round 2 failed - Rating: " + rating + "/5");
  sendNotification("application_rejected");
}
```

### 4.3 Round 3: System Design Interview

#### Similar pattern to Round 2, with specific focus:

```javascript
// Scheduling and conduct logic similar to Round 2
// Specific evaluation criteria for system design

const evaluateSystemDesign = (interviewData) => {
  const criteria = {
    scalability: interviewData.scalabilityRating,
    architecture: interviewData.architectureRating,
    tradeoffs: interviewData.tradeoffAnalysis,
    communication: interviewData.communicationRating
  };
  
  const averageRating = Object.values(criteria).reduce((a, b) => a + b) / 4;
  
  if (averageRating >= 3) {
    return { result: "passed", rating: averageRating };
  } else {
    return { result: "failed", rating: averageRating };
  }
};
```

### 4.4 Round 4: Behavioral Interview

```javascript
// HR/Cultural fit assessment
const evaluateBehavioral = (interviewData) => {
  const criteria = {
    communication: interviewData.communicationSkills,
    teamwork: interviewData.teamworkAbility,
    cultureFit: interviewData.culturalAlignment,
    adaptability: interviewData.adaptabilityScore
  };
  
  const averageRating = Object.values(criteria).reduce((a, b) => a + b) / 4;
  
  Application.update({
    "rounds.round4.status": "completed",
    "rounds.round4.result": averageRating >= 3 ? "passed" : "failed",
    "rounds.round4.cultureFitScore": criteria.cultureFit,
    "rounds.round4.communicationScore": criteria.communication
  });
  
  if (averageRating >= 3) {
    moveToRound(5);
  } else {
    rejectApplication("Cultural fit assessment failed");
  }
};
```

### 4.5 Round 5: Final Interview

```javascript
// Final decision round with senior leadership
const evaluateFinalRound = (interviewData) => {
  const criteria = {
    leadership: interviewData.leadershipPotential,
    vision: interviewData.visionAlignment,
    strategic: interviewData.strategicThinking,
    overall: interviewData.overallImpression
  };
  
  const averageRating = Object.values(criteria).reduce((a, b) => a + b) / 4;
  
  if (averageRating >= 4) {
    Application.update({
      "rounds.round5.result": "passed",
      status: "offer_sent",
      currentRound: null,
      processStatus: "completed"
    });
    generateOffer();
  } else {
    Application.update({
      "rounds.round5.result": "failed", 
      status: "rejected"
    });
    rejectApplication("Final round assessment did not meet threshold");
  }
};
```

---

## 5. Status Update Logic

### 5.1 Automatic Status Updates

```javascript
class InterviewStatusManager {
  
  static updateApplicationStatus(applicationId, roundNumber, roundResult) {
    const application = Application.findById(applicationId);
    
    switch(roundNumber) {
      case 1:
        if (roundResult === "passed") {
          this.moveToNextRound(application, 2);
          this.updateStatus(application, "shortlisted");
        } else {
          this.rejectApplication(application, "Assessment failed");
        }
        break;
        
      case 2:
        if (roundResult === "passed") {
          this.moveToNextRound(application, 3);
        } else {
          this.rejectApplication(application, "Technical interview failed");
        }
        break;
        
      case 3:
        if (roundResult === "passed") {
          this.moveToNextRound(application, 4);
        } else {
          this.rejectApplication(application, "System design interview failed");
        }
        break;
        
      case 4:
        if (roundResult === "passed") {
          this.moveToNextRound(application, 5);
        } else {
          this.rejectApplication(application, "Behavioral interview failed");
        }
        break;
        
      case 5:
        if (roundResult === "passed") {
          this.processToOffer(application);
        } else {
          this.rejectApplication(application, "Final interview failed");
        }
        break;
    }
  }
  
  static moveToNextRound(application, nextRound) {
    Application.findByIdAndUpdate(application._id, {
      currentRound: nextRound,
      [`rounds.round${nextRound}.status`]: "pending",
      [`rounds.round${nextRound}.availableAt`]: new Date()
    });
    
    this.addStatusHistory(application._id, "shortlisted", `Moved to Round ${nextRound}`);
    this.sendNotification(application.candidateId, "round_advancement", { round: nextRound });
  }
  
  static rejectApplication(application, reason) {
    Application.findByIdAndUpdate(application._id, {
      status: "rejected",
      rejectedAt: new Date(),
      rejectionReason: reason
    });
    
    this.addStatusHistory(application._id, "rejected", reason);
    this.sendNotification(application.candidateId, "application_rejected", { reason });
  }
  
  static processToOffer(application) {
    Application.findByIdAndUpdate(application._id, {
      status: "offer_sent",
      currentRound: null,
      processStatus: "completed",
      offerGeneratedAt: new Date()
    });
    
    this.generateOfferLetter(application);
    this.addStatusHistory(application._id, "offer_sent", "All rounds completed successfully");
  }
}
```

### 5.2 Status Validation Rules

```javascript
const statusValidationRules = {
  // Can only move to shortlisted from pending
  shortlisted: {
    allowedFrom: ["pending"],
    requires: "round1_passed"
  },
  
  // Can move to interviewed from shortlisted
  interviewed: {
    allowedFrom: ["shortlisted"],
    requires: "any_interview_scheduled"
  },
  
  // Can reject from any active status
  rejected: {
    allowedFrom: ["pending", "shortlisted", "interviewed"],
    requires: "failure_reason"
  },
  
  // Can only send offer after all rounds passed
  offer_sent: {
    allowedFrom: ["interviewed"],
    requires: "all_rounds_passed"
  },
  
  // Can only hire after offer accepted
  hired: {
    allowedFrom: ["offer_sent"],
    requires: "offer_accepted"
  }
};
```

---

## 6. Candidate Journey

### 6.1 Candidate Dashboard Status Display

```javascript
const getCandidateStatusDisplay = (application) => {
  const statusDisplay = {
    overallStatus: application.status,
    currentStage: getCurrentStageDisplay(application),
    completedRounds: getCompletedRounds(application),
    nextAction: getNextAction(application),
    timeline: getStatusTimeline(application)
  };
  
  return statusDisplay;
};

const getCurrentStageDisplay = (application) => {
  if (application.status === "rejected") {
    return "Application Rejected";
  }
  
  if (application.status === "offer_sent") {
    return "Offer Pending - Awaiting Your Response";
  }
  
  if (application.status === "hired") {
    return "Congratulations! You're Hired";
  }
  
  const currentRound = application.currentRound;
  const roundNames = {
    1: "Online Assessment",
    2: "Technical Interview", 
    3: "System Design Interview",
    4: "Behavioral Interview",
    5: "Final Interview"
  };
  
  if (currentRound) {
    const roundStatus = application.rounds[`round${currentRound}`].status;
    return `${roundNames[currentRound]} - ${formatStatus(roundStatus)}`;
  }
  
  return "Application Under Review";
};
```

### 6.2 Notification System

```javascript
const notificationTemplates = {
  assessment_available: {
    title: "Assessment Available",
    message: "Your online assessment is now available. You have until {deadline} to complete it.",
    action: "Start Assessment"
  },
  
  interview_scheduled: {
    title: "Interview Scheduled",
    message: "Your {roundName} has been scheduled for {datetime}. Meeting link: {meetingLink}",
    action: "View Details"
  },
  
  round_advancement: {
    title: "Congratulations!",
    message: "You've advanced to Round {round}: {roundName}. We'll be in touch with next steps.",
    action: "View Status"
  },
  
  application_rejected: {
    title: "Application Status Update", 
    message: "Thank you for your interest. Unfortunately, we've decided to move forward with other candidates.",
    action: "View Feedback"
  },
  
  offer_sent: {
    title: "Job Offer!",
    message: "Congratulations! We're excited to extend you an offer. Please review and respond by {deadline}.",
    action: "View Offer"
  }
};
```

---

## 7. Employer Actions

### 7.1 Employer Dashboard

```javascript
// GET /api/employer/job/:jobId/pipeline
const getInterviewPipeline = (jobId) => {
  return {
    jobId,
    totalApplications: 250,
    pipeline: {
      round1: {
        name: "Online Assessment",
        total: 250,
        pending: 45,
        in_progress: 8,
        completed: 197,
        passed: 75,
        failed: 122,
        pass_rate: "30%"
      },
      round2: {
        name: "Technical Interview", 
        total: 75,
        pending: 15,
        scheduled: 25,
        completed: 35,
        passed: 22,
        failed: 13,
        pass_rate: "63%"
      },
      round3: {
        name: "System Design",
        total: 22,
        pending: 5,
        scheduled: 8,
        completed: 9,
        passed: 6,
        failed: 3,
        pass_rate: "67%"
      },
      round4: {
        name: "Behavioral",
        total: 6,
        pending: 2,
        scheduled: 2,
        completed: 2,
        passed: 2,
        failed: 0,
        pass_rate: "100%"
      },
      round5: {
        name: "Final",
        total: 2,
        pending: 1,
        scheduled: 1,
        completed: 0,
        passed: 0,
        failed: 0,
        pass_rate: "N/A"
      }
    },
    metrics: {
      overall_conversion: "0.8%", // 2/250
      average_time_to_hire: "18 days",
      drop_off_by_round: {
        round1: "70%",
        round2: "37%", 
        round3: "33%",
        round4: "0%",
        round5: "0%"
      }
    }
  };
};
```

### 7.2 Bulk Operations

```javascript
// Bulk schedule interviews
// POST /api/employer/job/:jobId/bulk-schedule
{
  action: "schedule_interviews",
  round: 2,
  candidateIds: ["cand1", "cand2", "cand3"],
  interviewDetails: {
    date: "2024-12-20",
    startTime: "09:00",
    duration: 45,
    interviewerId: "emp_123",
    slotInterval: 60 // minutes between interviews
  }
}

// Bulk advance candidates
// POST /api/employer/job/:jobId/bulk-advance  
{
  action: "advance_to_next_round",
  candidateIds: ["cand1", "cand2"],
  fromRound: 3,
  toRound: 4,
  notes: "Strong technical performance"
}
```

---

## 8. System Automations

### 8.1 Automated Triggers

```javascript
// Time-based automations
const automations = {
  // Assessment expiry
  assessmentExpiry: {
    trigger: "assessment_window_closed",
    action: (applications) => {
      applications.forEach(app => {
        if (app.rounds.round1.status === "available" || app.rounds.round1.status === "pending") {
          InterviewStatusManager.updateRoundStatus(app._id, 1, "expired");
          InterviewStatusManager.rejectApplication(app, "Assessment not attempted within deadline");
        }
      });
    }
  },
  
  // Interview no-show detection
  interviewNoShow: {
    trigger: "interview_time_passed",
    action: (interview) => {
      const gracePeriod = 15; // minutes
      if (interview.status === "scheduled" && isPastGracePeriod(interview.scheduledDate, gracePeriod)) {
        InterviewStatusManager.updateRoundStatus(interview.applicationId, interview.round, "no_show");
        InterviewStatusManager.rejectApplication(interview.application, "No-show for interview");
      }
    }
  },
  
  // Offer expiry
  offerExpiry: {
    trigger: "offer_deadline_passed", 
    action: (application) => {
      if (application.status === "offer_sent" && isOfferExpired(application.offerDeadline)) {
        InterviewStatusManager.updateApplicationStatus(application._id, "rejected");
        InterviewStatusManager.addStatusHistory(application._id, "rejected", "Offer expired - no response");
      }
    }
  }
};
```

### 8.2 Status Consistency Checks

```javascript
// Daily consistency validation
const validateStatusConsistency = () => {
  const applications = Application.find({ status: { $ne: "rejected" } });
  
  applications.forEach(app => {
    // Check if current round status makes sense
    const currentRound = app.currentRound;
    if (currentRound) {
      const roundStatus = app.rounds[`round${currentRound}`].status;
      
      // Validate status progression
      if (roundStatus === "completed" && !app.rounds[`round${currentRound}`].result) {
        console.warn(`Application ${app._id}: Round ${currentRound} completed but no result`);
      }
      
      // Check for stuck applications
      const lastUpdate = app.rounds[`round${currentRound}`].updatedAt;
      const daysSinceUpdate = (new Date() - lastUpdate) / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate > 7 && roundStatus === "pending") {
        console.warn(`Application ${app._id}: Round ${currentRound} pending for ${daysSinceUpdate} days`);
      }
    }
  });
};
```

---

## 9. API Endpoints Summary

### Application Management
```
GET    /api/employer/job/:jobId/applications           # List all applications
GET    /api/employer/application/:appId                # Get application details
PUT    /api/employer/application/:appId/status         # Update application status
GET    /api/employer/job/:jobId/pipeline              # Get interview pipeline overview
```

### Round Management
```
PUT    /api/employer/application/:appId/round/:round/schedule    # Schedule interview round
PUT    /api/employer/application/:appId/round/:round/complete    # Complete interview round
PUT    /api/employer/application/:appId/round/:round/result      # Update round result
GET    /api/employer/application/:appId/rounds                  # Get all round statuses
```

### Candidate APIs
```
GET    /api/candidate/application/:appId/status        # Get application status
GET    /api/candidate/application/:appId/timeline      # Get status timeline
POST   /api/candidate/application/:appId/round/:round/confirm   # Confirm interview attendance
```

### Bulk Operations
```
POST   /api/employer/job/:jobId/bulk-schedule          # Bulk schedule interviews
POST   /api/employer/job/:jobId/bulk-advance           # Bulk advance candidates
POST   /api/employer/job/:jobId/bulk-reject            # Bulk reject candidates
```

---

## 10. Configuration Examples

### 10.1 Job Posting with 5-Round Configuration

```javascript
// POST /api/employer/job
{
  title: "Senior Software Engineer",
  description: "...",
  interviewProcess: {
    totalRounds: 5,
    rounds: [
      {
        number: 1,
        name: "Online Assessment",
        type: "assessment",
        duration: 60,
        passingScore: 70,
        assessmentId: "assessment_123"
      },
      {
        number: 2,
        name: "Technical Interview",
        type: "technical_interview",
        duration: 45,
        passingRating: 3,
        interviewerRole: "senior_developer"
      },
      {
        number: 3,
        name: "System Design",
        type: "system_design",
        duration: 60,
        passingRating: 3,
        interviewerRole: "architect"
      },
      {
        number: 4,
        name: "Behavioral Interview", 
        type: "behavioral",
        duration: 30,
        passingRating: 3,
        interviewerRole: "hr_manager"
      },
      {
        number: 5,
        name: "Final Interview",
        type: "final",
        duration: 45,
        passingRating: 4,
        interviewerRole: "department_head"
      }
    ]
  }
}
```

---

**Document End**

This comprehensive document provides a complete framework for implementing a 5-round interview process with detailed status update logics, automated workflows, and comprehensive tracking throughout the entire candidate journey.