# TaleGlobal — Complete Email Flow Documentation

**Version:** 1.0  
**Last Updated:** December 2024  
**Source File:** `backend/utils/emailService.js`

---

## Overview

This document describes every email sent by the TaleGlobal platform — when it is triggered, why it is sent, who receives it, and what the template contains.

All emails share two common elements prepended automatically:
- **TaleGlobal Logo** (hosted at `https://taleglobal.net/assets/images/logo-dark.png`)
- **Greeting Line:** "Greeting from Taleglobal"

---

## Table of Contents

1. [Candidate Registration Welcome Email](#1-candidate-registration-welcome-email)
2. [Placement Dean Registration Email](#2-placement-dean-registration-email)
3. [Employer Registration Email](#3-employer-registration-email)
4. [Consultant Registration Email](#4-consultant-registration-email)
5. [Placement Candidate Account Active Email](#5-placement-candidate-account-active-email)
6. [Password Reset Email (Link)](#6-password-reset-email-link)
7. [OTP Email (Password Reset)](#7-otp-email-password-reset)
8. [Password Creation Welcome Email](#8-password-creation-welcome-email)
9. [Assessment Open / Reminder Email](#9-assessment-open--reminder-email)
10. [Assessment Result Published Email](#10-assessment-result-published-email)
11. [Job Application Confirmation Email](#11-job-application-confirmation-email)
12. [Placement Dean Approval Email](#12-placement-dean-approval-email)
13. [Employer / Consultant Approval Email](#13-employer--consultant-approval-email)
14. [Employer Account Approval Email (Dedicated)](#14-employer-account-approval-email-dedicated)
15. [Consultant Account Approval Email (Dedicated)](#15-consultant-account-approval-email-dedicated)
16. [Placement Dean Rejection Email](#16-placement-dean-rejection-email)
17. [Placement Candidate Welcome Email (by Placement Dean)](#17-placement-candidate-welcome-email-by-placement-dean)
18. [Candidate Active Profile Email (Admin Approved)](#18-candidate-active-profile-email-admin-approved)
19. [Placement Access Enabled Email (for Placement Dean)](#19-placement-access-enabled-email-for-placement-dean)
20. [Candidate Details Updated / Credits Assigned Email](#20-candidate-details-updated--credits-assigned-email)
21. [Individual Credits Assigned Email](#21-individual-credits-assigned-email)
22. [Placement Officer Approval Email](#22-placement-officer-approval-email)

---

## Email Flow Diagram

```
USER REGISTERS
      │
      ├── Candidate (Direct)       → Email #1  (Welcome + Set Password)
      ├── Placement Dean           → Email #2  (Registration Received – Pending Approval)
      ├── Employer                 → Email #3  (Registration – Action Required)
      └── Consultant               → Email #4  (Registration – Action Required)

ADMIN APPROVES / REJECTS
      │
      ├── Placement Dean Approved  → Email #12 (Approval + Create Password)
      ├── Placement Dean Rejected  → Email #16 (Rejection Notification)
      ├── Employer Approved        → Email #13 / #14
      └── Consultant Approved      → Email #13 / #15

PLACEMENT DEAN UPLOADS STUDENTS
      │
      └── Student Account Created  → Email #17 (Set Password + Credits Info)
                                   → OR Email #18 (After Admin Approval)

ADMIN GIVES PLACEMENT ACCESS TO DEAN
      └── Placement Dean           → Email #19 (Collaboration Confirmed)

ADMIN ASSIGNS CREDITS DIRECTLY
      └── Candidate                → Email #20 / #21 (Credits Assigned)

CANDIDATE FORGETS PASSWORD
      ├── Reset Link               → Email #6
      └── OTP                      → Email #7

CANDIDATE APPLIES FOR JOB
      └── Candidate                → Email #11 (Application Confirmed + Interview Schedule)

ASSESSMENT GOES LIVE
      ├── Assessment Open          → Email #9  (type: "open")
      └── 1 Hour Before            → Email #9  (type: "reminder")

EMPLOYER PUBLISHES ASSESSMENT RESULT
      └── Candidate                → Email #10 (Result Available)
```

---

## 1. Candidate Registration Welcome Email

| Field | Details |
|-------|---------|
| **Function** | `sendWelcomeEmail(email, name, 'candidate')` |
| **Trigger** | Candidate self-registers on TaleGlobal |
| **Recipient** | Candidate |
| **Purpose** | Confirms account creation and directs the candidate to set their password and complete their profile |
| **Subject** | `Congratulations! Your TaleGlobal Profile Has Been Created` |

### Template Content

- Congratulations message with 🎉
- Account successfully created confirmation
- Instructions to set password and complete profile (education, skills, etc.)
- Explains a complete profile is required to discover job opportunities
- CTA Button: **"Set your password and complete your profile to begin your journey with TaleGlobal."** → Links to `/create-password?email=<email>&type=candidate`
- Sign-off from Team TaleGlobal with website and support email

---

## 2. Placement Dean Registration Email

| Field | Details |
|-------|---------|
| **Function** | `sendWelcomeEmail(email, name, 'placement', collegeName, officialEmail)` |
| **Trigger** | Placement Dean registers on TaleGlobal |
| **Recipient** | Placement Dean (both login email and official email if provided) |
| **Purpose** | Acknowledges registration and informs that the account is pending admin review |
| **Subject** | `TaleGlobal Registration Received – Approval Pending` |

### Template Content

- Thanks the Placement Dean for registering
- Informs the profile is under review by TaleGlobal admin
- States that login access will only be granted after approval
- Candidate will receive a confirmation email once approved
- No action button (awaiting admin decision)

---

## 3. Employer Registration Email

| Field | Details |
|-------|---------|
| **Function** | `sendWelcomeEmail(email, name, 'employer')` |
| **Trigger** | Employer / Company registers on TaleGlobal |
| **Recipient** | Employer |
| **Purpose** | Prompts employer to create password, complete company profile, and submit for admin approval |
| **Subject** | `TaleGlobal Employer Registration – Action Required` |

### Template Content

- Thanks the employer for registering
- Requests them to create password and complete company profile with documents
- Once submitted, profile will be reviewed by admin
- Approval timeline: **Within 3 working days**
- Notification via email after approval
- CTA Button: **"🔐 Create Your Password"** → Links to `/create-password?email=<email>&type=employer`

---

## 4. Consultant Registration Email

| Field | Details |
|-------|---------|
| **Function** | `sendWelcomeEmail(email, name, 'consultant')` |
| **Trigger** | Consultant registers on TaleGlobal |
| **Recipient** | Consultant |
| **Purpose** | Same as Employer — prompts to create password and complete profile for admin review |
| **Subject** | `TaleGlobal Consultant Registration – Action Required` |

### Template Content

- Identical flow to Employer Registration email
- Approval timeline: **Within 3 working days**
- CTA Button: **"🔐 Create Your Password"** → Links to `/create-password?email=<email>&type=consultant`

---

## 5. Placement Candidate Account Active Email

| Field | Details |
|-------|---------|
| **Function** | `sendWelcomeEmail(email, name, 'placement_candidate')` |
| **Trigger** | A placement candidate's details are uploaded by Placement Dean AND approved by Admin |
| **Recipient** | Student / Placement Candidate |
| **Purpose** | Informs the student their account is now active and they must complete their profile |
| **Subject** | `Your TaleGlobal Account Is Active – Please Update Your Profile` |

### Template Content

- Informed that Placement Dean uploaded their basic details, approved by TaleGlobal Admin
- Account is now active
- **Profile Completion Steps:**
  1. Reset password (mandatory)
  2. Update basic profile details
  3. Update complete education details
  4. Review profile accuracy
- Only candidates with complete profiles can apply for jobs
- **Account Info:** Profile approved, credits added, access to jobs/assessments
- **Important Disclaimer Box (Blue):**
  - No fees collected from college or Placement Dean
  - No 100% placement guarantee
  - Opportunities depend on skills and performance
- CTA Button: **"🔐 Create Your Password"** → Links to `/create-password?email=<email>&type=candidate`

---

## 6. Password Reset Email (Link)

| Field | Details |
|-------|---------|
| **Function** | `sendResetEmail(email, resetToken, userType)` |
| **Trigger** | User clicks "Forgot Password" and requests a reset link |
| **Recipient** | The user who requested reset (candidate / employer / placement) |
| **Purpose** | Provides a secure time-limited link to reset the password |
| **Subject** | `Password Reset Request` |

### Template Content

- Heading: "Password Reset Request"
- Instruction to click the link below
- CTA Button: **"Reset Password"** (blue) → Links to `/<userType>/reset-password/<resetToken>`
- Note: **"This link will expire in 10 minutes."**

> URL path is dynamic:
> - Employer/Company/Consultant → `/employer/reset-password/<token>`
> - Placement → `/placement/reset-password/<token>`
> - Candidate → `/candidate/reset-password/<token>`

---

## 7. OTP Email (Password Reset)

| Field | Details |
|-------|---------|
| **Function** | `sendOTPEmail(email, otp, name)` |
| **Trigger** | User requests OTP-based password reset |
| **Recipient** | User who requested OTP reset |
| **Purpose** | Delivers a 6-digit OTP for identity verification during password reset |
| **Subject** | `Password Reset OTP - TaleGlobal` |

### Template Content

- Heading: "Password Reset OTP"
- Greeting to user by name
- Explanation: "You have requested to reset your password"
- **OTP displayed prominently** in a styled box (orange border, large font, letter-spacing)
- Note: **"This OTP will expire in 10 minutes."**
- If not requested, ignore the email

---

## 8. Password Creation Welcome Email

| Field | Details |
|-------|---------|
| **Function** | `sendPasswordCreationEmail(email, name)` |
| **Trigger** | Manually invoked for certain candidate onboarding flows |
| **Recipient** | Candidate |
| **Purpose** | Completes registration by prompting to create password, with next steps |
| **Subject** | `Welcome to TaleGlobal - Create Your Password` |

### Template Content

- Welcome heading
- Thanks for signing up message
- Requests to create password to complete registration
- CTA Button: **"Create Your Password"** (orange) → `/create-password?email=<email>&type=candidate`
- **"What's Next?" section:**
  1. Create your password
  2. Complete your profile
  3. Browse thousands of job opportunities
  4. Apply to jobs with one click

---

## 9. Assessment Open / Reminder Email

| Field | Details |
|-------|---------|
| **Function** | `sendAssessmentNotificationEmail({ email, name, jobTitle, startDate, type })` |
| **Trigger (open)** | Assessment window becomes active for a job the candidate applied to |
| **Trigger (reminder)** | 1 hour before the assessment start time |
| **Recipient** | Candidate |
| **Purpose** | Notifies candidate their assessment is live or about to begin |
| **Subject (open)** | `<jobTitle> assessment is now open` |
| **Subject (reminder)** | `Reminder: <jobTitle> assessment starts soon` |

### Template Content

- **Open email:** "Your assessment for `<jobTitle>` is now open." → "Log in now to start the assessment without delay."
- **Reminder email:** "Your assessment for `<jobTitle>` begins in one hour." → "Review the instructions and ensure you are ready to begin on time."
- Dark info box showing:
  - Assessment name
  - Start Time (formatted in India timezone)
- CTA Button:
  - Open → **"Start Assessment"** (blue)
  - Reminder → **"Review Assessment Details"** (blue)
- Links to: `/candidate/start-tech-assessment`
- Support contact shown at bottom

---

## 10. Assessment Result Published Email

| Field | Details |
|-------|---------|
| **Function** | `sendAssessmentResultPublishedEmail({ email, name, jobTitle, companyName, assessmentTitle, resultUrl })` |
| **Trigger** | Employer evaluates and publishes the assessment result |
| **Recipient** | Candidate |
| **Purpose** | Notifies candidate that their assessment result is now available on their dashboard |
| **Subject** | `Assessment result announced for <jobTitle>` |

### Template Content

- "The employer has completed the evaluation for your assessment."
- Orange info box showing:
  - Job title
  - Company name
  - Assessment title
- "Your assessment result is now available on TaleGlobal. Please log in to your candidate dashboard to review the final score and status."
- CTA Button: **"View Assessment Result"** (blue) → `resultUrl` or `/candidate/status`
- Footer note: "This email is only a notification. Please sign in to your account to view the detailed result."

---

## 11. Job Application Confirmation Email

| Field | Details |
|-------|---------|
| **Function** | `sendJobApplicationConfirmationEmail(candidateEmail, candidateName, jobTitle, companyName, applicationDate, jobDetails)` |
| **Trigger** | Candidate successfully applies for a job |
| **Recipient** | Candidate |
| **Purpose** | Confirms application submission and provides full interview schedule and terms |
| **Subject** | `✅ Application Submitted - <jobTitle> at <companyName>` |

### Template Content

- "✅ Application Submitted!" heading (green)
- **Application Details box:**
  - Position
  - Company
  - Applied On (formatted DD/MM/YYYY in India timezone)

- **📅 Interview Process Schedule** (if `jobDetails` provided):
  - Rounds listed in the exact order set by employer (`interviewRoundOrder`)
  - For each round:
    - Round number and name (e.g., Round 1: Technical)
    - Description
    - Date range (from–to)
    - Time (formatted AM/PM) or **"Book your Slot by Login"** if no time set
  - Falls back to `interviewRounds` array if no `interviewRoundOrder` exists

- **📋 Terms & Conditions box (red border):**
  - Assessment only on Desktop/Laptop/Tablet (not mobile)
  - Must pass each round to proceed
  - Only Round 1 passers go to Round 2+
  - All updates available on dashboard
  - Be on time; late = disqualification
  - Stable internet + camera/mic required
  - Check dashboard regularly for schedule changes

- Application is under review note
- **📱 What's Next?** (blue box):
  - Keep profile updated
  - Track application in dashboard
  - Prepare for interviews
  - Complete technical assessment if applicable

---

## 12. Placement Dean Approval Email

| Field | Details |
|-------|---------|
| **Function** | `sendApprovalEmail(email, name, 'placement', collegeName, officialEmail)` |
| **Trigger** | Admin approves the Placement Dean account |
| **Recipient** | Placement Dean (both login email and official email) |
| **Purpose** | Notifies approval and prompts to create password and start uploading student data |
| **Subject** | `Your TaleGlobal Placement Dean Account Has Been Approved` |

### Template Content

- Informs account has been approved
- Requests to create password and log in to dashboard
- Instructs to begin updating details of final-year candidates
- Reminder: ensure all entered information is accurate
- CTA Button: **"🔐 Create Password"** (orange) → `/create-password?email=<email>&type=placement`
- Support contact offered

---

## 13. Employer / Consultant Approval Email (Generic)

| Field | Details |
|-------|---------|
| **Function** | `sendApprovalEmail(email, name, 'employer'/'consultant')` |
| **Trigger** | Admin approves employer or consultant account |
| **Recipient** | Employer or Consultant |
| **Purpose** | Celebrates approval and lists next steps for using the platform |
| **Subject** | `🎉 Profile Approved - Welcome to TaleGlobal!` |

### Template Content

- "🎉 Profile Approved!" heading (green)
- Congratulations message
- **Next Steps (Employer/Consultant):**
  1. Login to dashboard
  2. Post unlimited job openings
  3. Review applications
  4. Manage hiring process
- CTA Button: **"🚀 Login to Dashboard"** (green gradient) → `/` (home/login)
- Tip box: Complete all sections of profile for best experience

---

## 14. Employer Account Approval Email (Dedicated)

| Field | Details |
|-------|---------|
| **Function** | `sendEmployerAccountApprovalEmail(email, name, companyName)` |
| **Trigger** | Admin explicitly approves an employer account (dedicated function) |
| **Recipient** | Employer |
| **Purpose** | Confirms approval and communicates platform terms & conditions |
| **Subject** | `Your Employer Account Has Been Approved – Start Posting Jobs` |

### Template Content

- "Congratulations! 🎉"
- Account successfully approved
- Can now log in and post jobs **completely free of cost**
- **Important Terms & Conditions:**
  - No fees to be collected from candidates
  - Interviews must be conducted on time
  - Only **online interviews** permitted (no offline)
  - Offer letters must be released as per job posting date

---

## 15. Consultant Account Approval Email (Dedicated)

| Field | Details |
|-------|---------|
| **Function** | `sendConsultantApprovalEmail(email, name, companyName)` |
| **Trigger** | Admin approves consultant account |
| **Recipient** | Consultant |
| **Purpose** | Confirms approval with consultant-specific terms |
| **Subject** | `Your Consultant Account Has Been Approved – Start Posting Jobs` |

### Template Content

- "Congratulations! 🎉"
- Account approved by TaleGlobal Admin Team
- Can now: log in, post jobs free, conduct online interviews
- **Important Terms & Conditions:**
  - No fee from candidates
  - Interviews on time
  - No offline interviews
  - Job offers as per posting date
- Support contact provided

---

## 16. Placement Dean Rejection Email

| Field | Details |
|-------|---------|
| **Function** | `sendPlacementRejectionEmail(email, officialEmail)` |
| **Trigger** | Admin rejects a Placement Dean account application |
| **Recipient** | Placement Dean (both login email and official email) |
| **Purpose** | Informs rejection and encourages reapplication after corrections |
| **Subject** | `Placement Dean Application Rejection Notification` |

### Template Content

- Thanks for submitting the application
- Regrets to inform that the application was **rejected** due to not meeting verification criteria
- Encourages to review and reapply after corrections or providing required documents
- Support team contact offered

---

## 17. Placement Candidate Welcome Email (by Placement Dean)

| Field | Details |
|-------|---------|
| **Function** | `sendPlacementCandidateWelcomeEmail(email, name, password, placementOfficerName, collegeName, credits)` |
| **Trigger** | Placement Dean uploads a student and the student's account is created |
| **Recipient** | Student / Candidate |
| **Purpose** | Welcomes student, informs about credits, and prompts to set password and complete profile |
| **Subject** | `Your TaleGlobal Account Is Ready – Set Your Password & Start Applying` |

### Template Content

- Confirms details were uploaded by Placement Dean
- Requests to set password and complete profile
- **Credits Info:** `X free job application credits` valid for **1 year**, for online interviews only
- After free credits: pay-per-job model available
- **Important Disclaimer:**
  - No payment from college or Placement Dean
  - No 100% placement guarantee
  - Opportunities based on skills and performance
- CTA Button: **"🔐 Set Your Password"** (orange) → `/create-password?email=<email>&type=candidate`

> Also has retry logic (`retryFailedEmail`) — up to 3 attempts with exponential backoff (2s, 4s, 8s)

---

## 18. Candidate Active Profile Email (Admin Approved)

| Field | Details |
|-------|---------|
| **Function** | `sendCandidateActiveProfileEmail(email, name, password)` |
| **Trigger** | Admin directly approves a placement candidate's profile |
| **Recipient** | Candidate |
| **Purpose** | Notifies account is active, provides temporary credentials, and prompts to complete profile |
| **Subject** | `Your TaleGlobal Account Is Active – Please Update Your Profile` |

### Template Content

- Same profile completion steps as Email #5
- **Displays Login Credentials:**
  - Username: `<email>`
  - Temporary Password: `<password>`
  - Note to change password immediately
- Two CTA Buttons:
  - **"🔗 Login Here"** (orange) → `/`
  - **"🔐 Create Password"** (dark) → `/create-password?email=<email>&type=candidate`

---

## 19. Placement Access Enabled Email (for Placement Dean)

| Field | Details |
|-------|---------|
| **Function** | `sendPlacementAccessEnabledEmail(email, name, collegeName, officialEmail)` |
| **Trigger** | Admin enables placement access for a college / Placement Dean |
| **Recipient** | Placement Dean (both login email and official email) |
| **Purpose** | Formally confirms TaleGlobal–College collaboration and explains the scope |
| **Subject** | `Welcome to TaleGlobal - Placement Access Enabled` |

### Template Content

- Confirms collaboration between **TaleGlobal and `<collegeName>`**
- Placement Dean access **successfully enabled** to upload final-year student data
- **Scope of Collaboration (grey box):**
  - Platform access for career opportunities and placement resources
  - No 100% placement guarantee
  - Platform supports employability, doesn't promise job outcomes
- **Financial Clarification (blue box):**
  - No fees collected from college
  - Credits offered as platform support
  - Not linked to any monetary transaction
- **Student Account Process (orange box):**
  - Data reviewed and approved by Admin
  - Upon approval: platform access + credits + login credentials via email
  - Students can change passwords after first login
- Two CTA Buttons:
  - **"🔗 Platform Login"** (orange)
  - **"🔐 Create Password"** (dark)

---

## 20. Candidate Details Updated / Credits Assigned Email

| Field | Details |
|-------|---------|
| **Function** | `sendCandidateDetailsUpdatedEmail(email, name, credits)` |
| **Trigger** | Admin assigns credits directly to a candidate (bulk/placement route) |
| **Recipient** | Candidate |
| **Purpose** | Informs about credits assigned and drives profile completion and job applications |
| **Subject** | `Credits Assigned to Your TaleGlobal Account – Complete Your Profile` |

### Template Content

- Account created, `X job application credits` assigned
- **Next Steps:**
  1. Set password
  2. Complete profile (education, skills, preferences)
  3. Start applying using credits
- **Credit Details:**
  - Valid for 1 year
  - Online interviews only
  - After credits: pay-per-job model
- Note box: Use credentials from Placement Dean or create new password
- Two CTA Buttons: **"🔗 Login Here"** (green) | **"🔐 Create Password"** (orange)

---

## 21. Individual Credits Assigned Email

| Field | Details |
|-------|---------|
| **Function** | `sendIndividualCreditsAssignedEmail(email, name, creditsAssigned)` |
| **Trigger** | Admin assigns credits to an individual candidate directly |
| **Recipient** | Candidate |
| **Purpose** | Similar to Email #20 but for individually assigned credits (not bulk) |
| **Subject** | `Credits Assigned to Your TaleGlobal Account - Complete Your Profile` |

### Template Content

- Account created, `X job application credits` assigned
- **Next Steps:** Set password → Complete profile → Apply for jobs
- Two CTA Buttons: **"Create Password"** (orange) | **"Login"** (dark)
- **Credit Details:** Valid 1 year, online interviews only, pay-per-job after credits
- Support contact at bottom

---

## 22. Placement Officer Approval Email

| Field | Details |
|-------|---------|
| **Function** | `sendPlacementOfficerApprovalEmail(email, name)` |
| **Trigger** | Placement Officer account is approved (alternate/secondary approval function) |
| **Recipient** | Placement Dean / Officer |
| **Purpose** | Simple approval notification — account is active, can upload student data |
| **Subject** | `Your TaleGlobal Placement Dean Account Has Been Approved` |

### Template Content

- "Welcome to TaleGlobal."
- Account successfully approved
- Excited to collaborate
- Can now access portal and upload student data
- Support team available for assistance

---

## Summary Table

| # | Email | Recipient | Trigger | Function |
|---|-------|-----------|---------|----------|
| 1 | Candidate Registration Welcome | Candidate | Self-registers | `sendWelcomeEmail(..., 'candidate')` |
| 2 | Placement Dean Registration | Placement Dean | Self-registers | `sendWelcomeEmail(..., 'placement')` |
| 3 | Employer Registration | Employer | Self-registers | `sendWelcomeEmail(..., 'employer')` |
| 4 | Consultant Registration | Consultant | Self-registers | `sendWelcomeEmail(..., 'consultant')` |
| 5 | Placement Candidate Account Active | Student | Dean uploads + Admin approves | `sendWelcomeEmail(..., 'placement_candidate')` |
| 6 | Password Reset Link | Any user | Forgot password (link flow) | `sendResetEmail` |
| 7 | Password Reset OTP | Any user | Forgot password (OTP flow) | `sendOTPEmail` |
| 8 | Password Creation Welcome | Candidate | Certain onboarding flows | `sendPasswordCreationEmail` |
| 9 | Assessment Open / Reminder | Candidate | Assessment goes live / 1hr before | `sendAssessmentNotificationEmail` |
| 10 | Assessment Result Published | Candidate | Employer publishes result | `sendAssessmentResultPublishedEmail` |
| 11 | Job Application Confirmation | Candidate | Candidate applies for job | `sendJobApplicationConfirmationEmail` |
| 12 | Placement Dean Approval | Placement Dean | Admin approves | `sendApprovalEmail(..., 'placement')` |
| 13 | Employer/Consultant Approval (Generic) | Employer/Consultant | Admin approves | `sendApprovalEmail(..., 'employer'/'consultant')` |
| 14 | Employer Account Approval (Dedicated) | Employer | Admin approves | `sendEmployerAccountApprovalEmail` |
| 15 | Consultant Account Approval (Dedicated) | Consultant | Admin approves | `sendConsultantApprovalEmail` |
| 16 | Placement Dean Rejection | Placement Dean | Admin rejects | `sendPlacementRejectionEmail` |
| 17 | Placement Candidate Welcome | Student | Dean uploads student | `sendPlacementCandidateWelcomeEmail` |
| 18 | Candidate Active Profile | Candidate | Admin approves candidate | `sendCandidateActiveProfileEmail` |
| 19 | Placement Access Enabled | Placement Dean | Admin enables college access | `sendPlacementAccessEnabledEmail` |
| 20 | Credits Assigned (Bulk) | Candidate | Admin assigns bulk credits | `sendCandidateDetailsUpdatedEmail` |
| 21 | Credits Assigned (Individual) | Candidate | Admin assigns individual credits | `sendIndividualCreditsAssignedEmail` |
| 22 | Placement Officer Approval | Placement Officer | Admin approves | `sendPlacementOfficerApprovalEmail` |

---

## Common Email Infrastructure

### Sender Configuration
- From name: `TaleGlobal Team` (from `EMAIL_FROM_NAME` env var)
- From address: Resolved from `EMAIL_FROM` → `EMAIL_USER` env vars
- SMTP: Configurable via `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_SECURE`

### Auto-Prepended Elements (via `prependMailGreeting`)
Every outgoing email automatically gets these injected after the first container div:
1. TaleGlobal logo image (`160px` wide)
2. "Greeting from Taleglobal" paragraph

### Brand Styling
- Primary color: `#ff6b35` (orange)
- Font: `Poppins, sans-serif`
- Max width: `600px`
- Background: `#f9f9fa`
- Card style: white, `border-radius: 10px`, box-shadow

### Dynamic URL Patterns
| URL | Used In |
|-----|---------|
| `/create-password?email=<e>&type=<t>` | Welcome, approval, credits emails |
| `/<userType>/reset-password/<token>` | Password reset link email |
| `/candidate/start-tech-assessment` | Assessment notification emails |
| `/candidate/status` | Assessment result email (fallback) |
| `/` | Login / dashboard redirect |
