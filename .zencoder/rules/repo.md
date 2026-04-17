---
description: Repository Information Overview
alwaysApply: true
---

# TaleGlobal Repository Information

## Summary
TaleGlobal is a comprehensive recruitment and placement platform connecting candidates, employers, and educational institutions (Placement Officers). It supports multi-role access including Admin, Sub-Admin, Employers (Companies & Consultants), Candidates, and Placement Officers.

## Structure
- **backend/**: Node.js/Express server handling API logic, database interactions, and business workflows.
- **frontend/**: React-based single-page application (SPA) with dedicated dashboards for different user roles.
- **uploads/**: Storage for documents, logos, resumes, and student data files.

## Language & Runtime
**Language**: JavaScript (Node.js)  
**Version**: Node.js 14+ (implied)  
**Build System**: NPM  
**Package Manager**: npm

## Projects

### Backend
**Configuration File**: [backend/package.json](./backend/package.json)

#### Language & Runtime
**Language**: JavaScript (Node.js)  
**Framework**: Express.js  
**Database**: MongoDB (via Mongoose)

#### Dependencies
**Main Dependencies**: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `xlsx`, `socket.io`, `nodemailer`

#### Build & Installation
```bash
cd backend && npm install
```

### Frontend
**Configuration File**: [frontend/package.json](./frontend/package.json)

#### Language & Runtime
**Language**: JavaScript (React)  
**Styling**: Tailwind CSS, custom CSS
**Build Tool**: Webpack

#### Dependencies
**Main Dependencies**: `react`, `react-dom`, `react-router-dom`, `axios`, `lucide-react`, `react-toastify`

#### Build & Installation
```bash
cd frontend && npm install
```

## Features & Logic Flow by Role

### 1. Admin & Sub-Admin
**Pages & Features**:
- **Dashboard/Overview**: Real-time stats (Candidates, Employers, Jobs, Placements).
- **Employer Management**: 
    - **Manage Requests**: View pending employer profiles.
    - **Approve/Reject**: Logic flow requires verifying authorization letters and company details.
    - **Details View**: Comprehensive view of employer info, jobs, and credits.
- **Placement Management**:
    - **Approval Flow**: Admin must approve placement officers before they can upload batches.
    - **Batch Uploads**: Review and approve student batches uploaded by placement officers.
    - **Individual Credits**: Assign credits to placement candidates for job applications.
- **Candidate Review**: Approve/Reject candidate profiles based on resume quality.
- **Sub-Admin Control**: Admin can create sub-admins and assign granular permissions (e.g., job approval only).
- **Transaction History**: View all credit-based and paid transactions across the platform.

**Validation & Logic**:
- Role-based access control (RBAC) via JWT middleware.
- Sub-admin permissions are checked at the controller level before sensitive actions.

### 2. Employer (Company & Consultant)
**Pages & Features**:
- **Company Profile**: Manage brand name, logo, cover image, and authorization documents.
- **Job Management**:
    - **Post/Edit Job**: Multi-step form with validations for skills, experience, and salary.
    - **Status Flow**: Posted -> Pending Admin Approval -> Active/Rejected.
- **Candidate Review**:
    - **Applicants List**: View candidates who applied for specific jobs.
    - **Review System**: Move candidates through status cycles (Shortlisted, Interview Round 1/2, Hired, Rejected).
- **Assessment Builder**: Create technical assessments/quizzes for candidates.
- **Credits System**: Job postings and candidate unlocks consume credits.

**Validation & Logic**:
- Cannot post jobs without an approved profile.
- Real-time notifications for application updates via WebSockets.

### 3. Placement Officer
**Pages & Features**:
- **Dashboard**: Track batch approval status and student registration progress.
- **Batch Upload**: Excel/CSV upload logic that maps columns to candidate profile fields.
- **Student Directory**: View and manage all students under their institution.
- **ID Card Generation**: Generate and download placement-specific ID cards for students.

**Validation & Logic**:
- Files undergo validation for duplicate emails and required fields during upload.
- Batch approval is a two-step process: Placement Officer submits -> Admin reviews.

### 4. Candidate
**Pages & Features**:
- **Profile/Resume Builder**: Interactive form to add education, experience, and skills.
- **Job Board**: Filter jobs by category, location, and type (Full-time, Remote, etc.).
- **Application Status**: Detailed timeline of application progress and interview invites.
- **Assessments**: Take technical tests assigned by employers; results are auto-saved.
- **Chat/Support**: Direct messaging with employers and platform support.

**Validation & Logic**:
- Profile completeness percentage determines job application eligibility.
- Interview response logic (Accept/Reschedule/Decline) updates the employer dashboard instantly.

## Testing
**Framework**: Jest/React Testing Library
**Location**: `frontend/src`
**Run Command**: `cd frontend && npm test`
