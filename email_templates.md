# TaleGlobal Email Templates

This document contains all the email templates used in the TaleGlobal platform, categorized by their purpose.

---

## 1. Onboarding & Registration

### Candidate Welcome Email (Direct Signup)
- **Subject**: Congratulations! Your TaleGlobal Profile Has Been Created
- **Heading**: Congratulations! 🎉
- **Content**:
```html
<p>Dear Candidate,</p>
<p>Congratulations! 🎉</p>
<p>Your TaleGlobal account has been successfully created.</p>
<p>To get started, please set your password using the link provided below and complete your profile by updating your education, skills, and other relevant details. A complete profile helps you discover job opportunities that best match your qualifications and career goals.</p>
<p>Once your profile is updated, you can start applying for jobs through our online interview process.</p>
<div style="text-align: center; margin: 30px 0;">
  <a href="${createPasswordUrl}">👉 Set your password and complete your profile to begin your journey with TaleGlobal.</a>
</div>
<p>We're excited to support you as you take the next step toward your career growth.</p>
<p>Warm regards,<br>
Team TaleGlobal<br>
🌐 <a href="https://www.taleglobal.net/">www.taleglobal.net</a><br>
📧info@taleglobal.net</p>
```

### Placement Officer Welcome Email (Pending Approval)
- **Subject**: TaleGlobal Registration Received – Approval Pending
- **Heading**: Dear Placement Officer
- **Content**:
```html
<p>Thank you for registering on the TaleGlobal platform.</p>
<p>Your profile has been successfully created and is currently under review by the TaleGlobal admin team. Once approved, you will be able to log in and begin updating final-year student details on the platform.</p>
<p>You will receive a confirmation email as soon as your profile is approved.</p>
```

### Employer Welcome Email (Pending Approval)
- **Subject**: Employer Registration Successful – Complete Company Details
- **Heading**: Dear Employer
- **Content**:
```html
<p>Thank you for registering with TaleGlobal.</p>
<p>To get started, please set your password using the link provided below and complete your profile.</p>
<div style="text-align: center; margin: 30px 0;">
  <a href="${createPasswordUrl}">Set Your Password</a>
</div>
<p>To proceed further, please log in to your dashboard</p>
<ul>
  <li>Update company basic details</li>
  <li>Upload the required company documents for verification</li>
</ul>
<p>Once submitted, your profile will be reviewed by the TaleGlobal Admin Team.</p>
```

### Placement Candidate Welcome Email (Account Ready)
- **Subject**: Your TaleGlobal Account Is Active – Please Update Your Profile
- **Heading**: Dear ${name}
- **Content**:
```html
<p>We would like to inform you that your basic details have been updated by your Placement Officer on the TaleGlobal platform and approved by the TaleGlobal Admin.</p>
<p>Your TaleGlobal account is now active.</p>
<h3>🔹 Important: Profile Completion Required</h3>
<p>To proceed further and apply for job opportunities, you are required to log in and complete your full profile on the TaleGlobal platform.</p>
<h3>✅ Steps to Follow After Login:</h3>
<ul>
  <li>Reset your password (mandatory for security reasons)</li>
  <li>Update your basic profile details (personal information, address, etc.)</li>
  <li>Update your complete education details</li>
</ul>
<div style="text-align: center; margin: 30px 0;">
  <a href="${createPasswordUrl}">🔐 Create Your Password</a>
</div>
```

---

## 2. Verification & Security

### Password Reset OTP
- **Subject**: Password Reset OTP - TaleGlobal
- **Heading**: Password Reset OTP
- **Content**:
```html
<p>You have requested to reset your password. Please use the following OTP to complete the process:</p>
<div style="text-align: center; margin: 30px 0;">
  <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
</div>
<p>This OTP will expire in 10 minutes.</p>
```

### Password Reset Link
- **Subject**: Password Reset Request
- **Heading**: Password Reset Request
- **Content**:
```html
<p>Click the link below to reset your password:</p>
<a href="${resetUrl}">Reset Password</a>
<p>This link will expire in 10 minutes.</p>
```

---

## 3. Recruitment & Application Process

### Job Application Confirmation
- **Subject**: ✅ Application Submitted - ${jobTitle} at ${companyName}
- **Heading**: ✅ Application Submitted!
- **Content**:
```html
<p>Your job application has been successfully submitted!</p>
<h3>📋 Application Details:</h3>
<p>Position: ${jobTitle}</p>
<p>Company: ${companyName}</p>
<p>Applied On: ${applicationDate}</p>
<!-- Includes Interview Rounds Section if enabled -->
<!-- Includes Terms & Conditions Section -->
```

### Candidate Shortlist Email
- **Subject**: 🎉 Congratulations! You've been shortlisted for ${jobTitle}
- **Heading**: 🎉 Congratulations!
- **Content**:
```html
<p>✅ You have been shortlisted for the position of <strong>${jobTitle}</strong>!</p>
<p>Please check your dashboard for next steps and interview details.</p>
<div style="text-align: center; margin: 35px 0;">
  <a href="${process.env.FRONTEND_URL}/candidate/status">View Application Status</a>
</div>
```

### Interview Invitation
- **Subject**: Interview Invitation - ${jobId.title}
- **Heading**: Interview Invitation
- **Content**:
```html
<p>We would like to invite you for an interview for the position of <strong>${jobId.title}</strong>.</p>
<p><strong>Preferred Date:</strong> ${interviewDate}</p>
<p><strong>Preferred Time:</strong> ${interviewTime}</p>
${meetingLink ? `<p><strong>Meeting Link:</strong> ${meetingLink}</p>` : ''}
<p>Please log in to your dashboard to confirm your availability.</p>
```

### Interview Confirmation
- **Subject**: ✓ Interview Confirmed - ${jobId.title}
- **Heading**: ✓ Interview Confirmed!
- **Content**:
```html
<p>Great news! We are pleased to confirm your interview for the position of <strong>${jobId.title}</strong> at <strong>${companyName}</strong>.</p>
<div style="background-color: #d4edda; padding: 20px; border-radius: 8px;">
  <h3>Interview Details:</h3>
  <p>📅 Date: ${formattedDate}</p>
  <p>🕐 Time: ${confirmedTime}</p>
  ${meetingLink ? `<p>🔗 Meeting Link: ${meetingLink}</p>` : ''}
</div>
```

---

## 4. Assessment Notifications

### Assessment Open/Reminder
- **Subject**: [Job Title] assessment is now open / Reminder: [Job Title] assessment starts soon
- **Heading**: Hello ${name}
- **Content**:
```html
<p>${intro}</p>
<div style="background-color: #0f172a; color: #f8fafc; padding: 16px 20px;">
  <p><strong>Assessment:</strong> ${jobTitle}</p>
  <p><strong>Start Time:</strong> ${formattedDate}</p>
</div>
<div style="text-align: center; margin: 32px 0 12px;">
  <a href="${assessmentUrl}">${buttonLabel}</a>
</div>
```

---

## 5. Admin & Approval Notifications

### Employer Account Approved
- **Subject**: Your Employer Account Has Been Approved – Start Posting Jobs
- **Heading**: Congratulations! 🎉
- **Content**:
```html
<p>Your employer account has been approved by the TaleGlobal Admin Team.</p>
<p>You can now:</p>
<ul>
  <li>Log in to your dashboard</li>
  <li>Post job openings completely free of cost</li>
  <li>Conduct interviews online</li>
</ul>
<h3>Important Terms & Conditions:</h3>
<ul>
  <li>No fee should be collected from candidates</li>
  <li>Interviews must be conducted on time</li>
  <li>Offline interviews are strictly not permitted</li>
</ul>
```

### Placement Officer Approval
- **Subject**: Your TaleGlobal Placement Officer Account Has Been Approved
- **Heading**: Dear Placement Officer
- **Content**:
```html
<p>We are happy to inform you that your TaleGlobal Placement Officer account has been approved.</p>
<p>You may now log in to your dashboard and begin updating final-year candidate details on behalf of your college.</p>
```

### Placement Access Enabled (Institutional Collaboration)
- **Subject**: Welcome to TaleGlobal - Placement Access Enabled
- **Heading**: Placement Access Enabled
- **Content**:
```html
<p>We are pleased to confirm the collaboration between <strong>TaleGlobal and ${collegeName}</strong> to support final-year students.</p>
<p>Placement Officer access has been <strong>successfully enabled</strong>, allowing you to upload and update student data directly.</p>
<h3>🔹 Scope of Collaboration:</h3>
<ul>
  <li>Access to career opportunities and resources</li>
  <li>TaleGlobal does not guarantee 100% placement</li>
</ul>
<h3>🔹 Financial Clarification:</h3>
<ul>
  <li>No fees collected from the institution</li>
</ul>
```
