const nodemailer = require('nodemailer');
const { formatTimeToAMPM } = require('./timeUtils');

const createTransport = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS not set in environment variables');
  }

  // Use explicit host/port if available, otherwise fallback to service: 'gmail'
  if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendWelcomeEmail = async (email, name, userType, collegeName = null) => {
  const transporter = createTransport();
  const normalizedUserType = (userType || 'candidate').toLowerCase();
  const userTypeParam = encodeURIComponent(normalizedUserType);
  const createPasswordUrl = `${process.env.FRONTEND_URL}/create-password?email=${encodeURIComponent(email)}&type=${userTypeParam}`;
  const loginUrl = `${process.env.FRONTEND_URL || 'https://taleglobal.net'}/`;
  
  let template;
  let subject;

  // Check if this is a direct candidate registration (not placement)
  if (normalizedUserType === 'candidate') {
    subject = 'Congratulations! Your TaleGlobal Profile Has Been Created';
    template = `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa; color: #333;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p>Dear ${name || 'Candidate'},</p>
          
          <p>Congratulations! 🎉</p>
          
          <p>Your TaleGlobal account has been successfully created.</p>
          
          <p>To get started, please set your password using the link provided below and complete your profile by updating your education, skills, and other relevant details. A complete profile helps you discover job opportunities that best match your qualifications and career goals.</p>
          
          <p>Once your profile is updated, you can start applying for jobs through our online interview process.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${createPasswordUrl}" style="background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">👉 Set your password and complete your profile to begin your journey with TaleGlobal.</a>
          </div>
          
          <p>We're excited to support you as you take the next step toward your career growth.</p>
          
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="margin: 0;">Warm regards,</p>
            <p style="margin: 5px 0; font-weight: bold; color: #ff6b35;">Team TaleGlobal</p>
            <p style="margin: 0; font-size: 14px;">🌐 <a href="https://www.taleglobal.net" style="color: #ff6b35; text-decoration: none;">www.taleglobal.net</a></p>
            <p style="margin: 0; font-size: 14px;">📧 <a href="mailto:support@taleglobal.net" style="color: #ff6b35; text-decoration: none;">support@taleglobal.net</a></p>
          </div>
        </div>
      </div>
    `;
  } else if (normalizedUserType === 'placement') {
    subject = 'TaleGlobal Registration Received – Approval Pending';
    template = `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa; color: #333;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p>Dear Placement Officer,</p>
          
          <p>Thank you for registering on the TaleGlobal platform.</p>
          
          <p>Your profile has been successfully created and is currently under review by the TaleGlobal admin team. Once approved, you will be able to log in and begin updating final-year student details on the platform.</p>
          
          <p>You will receive a confirmation email as soon as your profile is approved.</p>
          
          <p>Thank you for partnering with TaleGlobal to support student career opportunities.</p>
          
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="margin: 0;">Best regards,</p>
            <p style="margin: 5px 0; font-weight: bold; color: #ff6b35;">Team TaleGlobal</p>
            <p style="margin: 0; font-size: 14px;">🌐 <a href="https://www.taleglobal.net" style="color: #ff6b35; text-decoration: none;">www.taleglobal.net</a></p>
            <p style="margin: 0; font-size: 14px;">📧 <a href="mailto:support@taleglobal.net" style="color: #ff6b35; text-decoration: none;">support@taleglobal.net</a></p>
          </div>
        </div>
      </div>
    `;
  } else if (normalizedUserType === 'employer' || normalizedUserType === 'company') {
    subject = 'TaleGlobal Employer Registration – Action Required';
    template = `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa; color: #333;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p>Dear ${name || 'Employer'},</p>
          
          <p>Thank you for registering as an Employer on TaleGlobal.</p>
          
          <p>To proceed with approval, please log in to your dashboard and complete your company profile by updating the required basic details and uploading the necessary documents.</p>
          
          <p>Once submitted, your profile will be reviewed by the TaleGlobal admin team.</p>
          
          <p>⏳ Approval Timeline: Within 3 working days</p>
          
          <p>You will be notified via email once your account is approved.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${createPasswordUrl}" style="background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">🔐 Create Your Password</a>
          </div>
          
          <p>Thank you for choosing TaleGlobal as your hiring partner.</p>
          
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="margin: 0;">Regards,</p>
            <p style="margin: 5px 0; font-weight: bold; color: #ff6b35;">Team TaleGlobal</p>
            <p style="margin: 0; font-size: 14px;">🌐 <a href="https://www.taleglobal.net" style="color: #ff6b35; text-decoration: none;">www.taleglobal.net</a></p>
            <p style="margin: 0; font-size: 14px;">📧 <a href="mailto:support@taleglobal.net" style="color: #ff6b35; text-decoration: none;">support@taleglobal.net</a></p>
          </div>
        </div>
      </div>
    `;
  } else if (normalizedUserType === 'consultant') {
    subject = 'TaleGlobal Consultant Registration – Action Required';
    template = `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa; color: #333;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p>Dear ${name || 'Consultant'},</p>
          
          <p>Thank you for registering as a Consultant on TaleGlobal.</p>
          
          <p>To proceed with approval, please log in to your dashboard and complete your company profile by updating the required basic details and uploading the necessary documents.</p>
          
          <p>Once submitted, your profile will be reviewed by the TaleGlobal admin team.</p>
          
          <p>⏳ Approval Timeline: Within 3 working days</p>
          
          <p>You will be notified via email once your account is approved.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${createPasswordUrl}" style="background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">🔐 Create Your Password</a>
          </div>
          
          <p>Thank you for choosing TaleGlobal as your hiring partner.</p>
          
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="margin: 0;">Regards,</p>
            <p style="margin: 5px 0; font-weight: bold; color: #ff6b35;">Team TaleGlobal</p>
            <p style="margin: 0; font-size: 14px;">🌐 <a href="https://www.taleglobal.net" style="color: #ff6b35; text-decoration: none;">www.taleglobal.net</a></p>
            <p style="margin: 0; font-size: 14px;">📧 <a href="mailto:support@taleglobal.net" style="color: #ff6b35; text-decoration: none;">support@taleglobal.net</a></p>
          </div>
        </div>
      </div>
    `;
  } else if (normalizedUserType === 'placement_candidate') {
    subject = 'Your TaleGlobal Account Is Active – Please Update Your Profile';
    template = `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa; color: #333;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>Greetings from <strong>TaleGlobal</strong>.</p>
          
          <p>We would like to inform you that your basic details have been updated by your Placement Officer on the TaleGlobal platform and approved by the TaleGlobal Admin.</p>
          
          <p>Your TaleGlobal account is now active.</p>

          <h3 style="color: #2c3e50;">🔹 Important: Profile Completion Required</h3>
          <p>To proceed further and apply for job opportunities, you are required to log in and complete your full profile on the TaleGlobal platform.</p>

          <h3 style="color: #2c3e50;">✅ Steps to Follow After Login:</h3>
          <ul style="line-height: 1.6;">
            <li>Reset your password (mandatory for security reasons)</li>
            <li>Update your basic profile details (personal information, address, etc.)</li>
            <li>Update your complete education details</li>
            <li>Review and ensure your profile is accurate and complete</li>
          </ul>
          
          <p><em>Only candidates with a completed profile will be able to apply for job opportunities using the credits available in their account.</em></p>

          <h3 style="color: #2c3e50;">🔹 Account Information:</h3>
          <ul style="line-height: 1.6;">
            <li>Your profile has been approved</li>
            <li>Credits have been added to your account for applying to jobs</li>
            <li>You can access job opportunities, assessments, and placement-support resources</li>
          </ul>

          <div style="background-color: #e7f5ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #1971c2;">ℹ️ Important Information:</h4>
            <ul style="margin-bottom: 0; padding-left: 20px;">
              <li>No payment or fees have been collected from your college or Placement Officer</li>
              <li>TaleGlobal does not assure or guarantee 100% placement</li>
              <li>Placement opportunities depend on your skills, eligibility, and performance</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${createPasswordUrl}" style="background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">🔐 Create Your Password</a>
          </div>
          
          <p>TaleGlobal works in collaboration with your college placement team to support your career journey.</p>
          
          <p>If you face any issues while logging in or updating your profile, feel free to contact us.</p>
          
          <p>Wishing you success in your job search and career journey 🚀</p>
          
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="margin: 0;">Warm regards,</p>
            <p style="margin: 5px 0; font-weight: bold; color: #ff6b35;">Team TaleGlobal</p>
            <p style="margin: 0; font-size: 14px;">📧 <a href="mailto:info@taleglobal.net" style="color: #ff6b35; text-decoration: none;">info@taleglobal.net</a></p>
            <p style="margin: 0; font-size: 14px;">🌐 <a href="https://www.taleglobal.net" style="color: #ff6b35; text-decoration: none;">www.taleglobal.net</a></p>
          </div>
        </div>
      </div>
    `;
  } else {
    // Default fallback for other user types
    subject = 'Welcome to TaleGlobal';
    template = `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa; color: #333;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Welcome to TaleGlobal!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${createPasswordUrl}" style="background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Create Your Password</a>
          </div>
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="margin: 0;">Warm regards,</p>
            <p style="margin: 5px 0; font-weight: bold; color: #ff6b35;">Team TaleGlobal</p>
          </div>
        </div>
      </div>
    `;
  }

  const mailOptions = {
    from: `"TaleGlobal Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: template
  };

  await transporter.sendMail(mailOptions);
};

const sendResetEmail = async (email, resetToken, userType) => {
  const transporter = createTransport();
  const basePath = (userType === 'employer' || userType === 'company' || userType === 'consultant') ? '/employer' : userType === 'placement' ? '/placement' : '/candidate';
  const resetUrl = `${process.env.FRONTEND_URL}${basePath}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"TaleGlobal Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: 'Poppins', sans-serif;
;max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordCreationEmail = async (email, name) => {
  const transporter = createTransport();
  const createPasswordUrl = `${process.env.FRONTEND_URL}/create-password?email=${encodeURIComponent(email)}&type=candidate`;
  
  const welcomeTemplate = `
    <div style="font-family: 'Poppins', sans-serif;
;max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to TaleGlobal!</h1>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${name},</p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Thank you for signing up with TaleGlobal! We're excited to have you join our community of job seekers.
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          To complete your registration, please create your password by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${createPasswordUrl}" style="background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Create Your Password</a>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Create your password</li>
            <li>Complete your profile</li>
            <li>Browse thousands of job opportunities</li>
            <li>Apply to jobs with one click</li>
          </ul>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
          Best regards,<br>
          The TaleGlobal Team
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to TaleGlobal - Create Your Password',
    html: welcomeTemplate
  };

  await transporter.sendMail(mailOptions);
};

const formatAssessmentDate = (date) => {
  const parsed = new Date(date);
  return parsed.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const sendAssessmentNotificationEmail = async ({ email, name, jobTitle, startDate, type }) => {
  const transporter = createTransport();
  const formattedDate = formatAssessmentDate(startDate);
  const subject = type === 'reminder'
    ? `Reminder: ${jobTitle} assessment starts soon`
    : `${jobTitle} assessment is now open`;
  const intro = type === 'reminder'
    ? `Your assessment for <strong>${jobTitle}</strong> begins in one hour.`
    : `Your assessment for <strong>${jobTitle}</strong> is now open.`;
  const actionText = type === 'reminder'
    ? 'Review the instructions and ensure you are ready to begin on time.'
    : 'Log in now to start the assessment without delay.';
  const buttonLabel = type === 'reminder' ? 'Review Assessment Details' : 'Start Assessment';
  const assessmentUrl = `${process.env.FRONTEND_URL}/candidate/start-tech-assessment`;
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@taleglobal.com';

  const template = `
    <div style="font-family: 'Poppins', sans-serif;
;max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f7f7f9;">
      <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);">
        <h2 style="margin-top: 0; color: #1e293b; font-size: 22px;">Hello ${name || 'Candidate'},</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">${intro}</p>
        <div style="background-color: #0f172a; color: #f8fafc; padding: 16px 20px; border-radius: 10px; margin: 24px 0;">
          <p style="margin: 0; font-size: 15px; line-height: 1.6;"><strong>Assessment:</strong> ${jobTitle}</p>
          <p style="margin: 8px 0 0; font-size: 15px; line-height: 1.6;"><strong>Start Time:</strong> ${formattedDate}</p>
        </div>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">${actionText}</p>
        <div style="text-align: center; margin: 32px 0 12px;">
          <a href="${assessmentUrl}" style="background: #2563eb; color: #ffffff; padding: 14px 26px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">${buttonLabel}</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px; text-align: center;">Need help? Contact support at <a href="mailto:${supportEmail}" style="color: #2563eb;">${supportEmail}</a>.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: template
  };

  await transporter.sendMail(mailOptions);
};

const sendOTPEmail = async (email, otp, name) => {
  const transporter = createTransport();
  
  console.log('=== SENDING OTP EMAIL ===');
  console.log('Recipient Email:', email);
  console.log('OTP Code:', otp);
  console.log('Recipient Name:', name);
  
  const otpTemplate = `
    <div style="font-family: 'Poppins', sans-serif;
;max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Password Reset OTP</h1>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${name || 'User'},</p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          You have requested to reset your password. Please use the following OTP to complete the process:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #fff5f2; border: 2px solid #ff6b35; padding: 20px; border-radius: 8px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #ff6b35; letter-spacing: 8px;">${otp}</span>
          </div>
        </div>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
        </p>
        
        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
          Best regards,<br>
          The TaleGlobal Team
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset OTP - TaleGlobal',
    html: otpTemplate
  };

  console.log('Mail Options:', JSON.stringify(mailOptions, null, 2));
  const result = await transporter.sendMail(mailOptions);
  console.log('Email sent successfully:', result);
  return result;
};

const sendPlacementCandidateWelcomeEmail = async (email, name, password, placementOfficerName, collegeName, credits = 3) => {
  const transporter = createTransport();
  const resetPasswordUrl = `${process.env.FRONTEND_URL || 'https://taleglobal.net'}/create-password?email=${encodeURIComponent(email)}&type=candidate`;
  
  const template = `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa; color: #333;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p>Dear ${name || 'Candidate'},</p>
        
        <p>Your details have been successfully updated on the TaleGlobal platform by your placement officer.</p>
        
        <p>To proceed, please reset your password and log in to your account to complete your profile. After logging in, you can update your personal, educational, and skill-related information.</p>
        
        <p><strong>🎯 Credits Assigned:</strong> As a final-year student, you have been provided with 3 free job application credits, valid for 1 year from the date of assignment. You can apply for jobs using these credits at no cost. If a job is not secured after using the free credits, you may continue applying through our pay-per-job model.</p>
        
        <p>Take the next step and explore opportunities through completely online interviews.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetPasswordUrl}" style="background-color: #ff6b35; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">🔐 Reset Password</a>
        </div>
        
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="margin: 0;">Best wishes for your career journey,</p>
          <p style="margin: 5px 0; font-weight: bold; color: #ff6b35;">Team TaleGlobal</p>
          <p style="margin: 0; font-size: 14px;">🌐 <a href="https://www.taleglobal.net" style="color: #ff6b35; text-decoration: none;">www.taleglobal.net</a></p>
          <p style="margin: 0; font-size: 14px;">📧 <a href="mailto:support@taleglobal.net" style="color: #ff6b35; text-decoration: none;">support@taleglobal.net</a></p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"TaleGlobal Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your TaleGlobal Account Is Ready – Reset Password & Start Applying',
    html: template
  };

  await transporter.sendMail(mailOptions);
};

const retryFailedEmail = async (email, name, password, placementOfficerName, collegeName, maxRetries = 3) => {
  let attempt = 0;
  let lastError;
  
  while (attempt < maxRetries) {
    try {
      await sendPlacementCandidateWelcomeEmail(email, name, password, placementOfficerName, collegeName);
      return { success: true, attempt: attempt + 1 };
    } catch (error) {
      lastError = error;
      attempt++;
      console.log(`Email retry ${attempt}/${maxRetries} failed for ${email}:`, error.message);
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  return { success: false, error: lastError, attempts: attempt };
};

const sendApprovalEmail = async (email, name, userType, collegeName = null) => {
  const transporter = createTransport();
  const loginUrl = `${process.env.FRONTEND_URL || 'https://taleglobal.net'}/`;
  const createPasswordUrl = `${process.env.FRONTEND_URL || 'https://taleglobal.net'}/create-password?email=${encodeURIComponent(email)}&type=${userType}`;
  
  let template;
  let subject;

  if (userType === 'placement') {
    subject = 'Your TaleGlobal Placement Officer Account Has Been Approved';
    template = `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa; color: #333;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p>Dear ${name || 'Placement Officer'},</p>
          
          <p>We are happy to inform you that your TaleGlobal Placement Officer account has been approved.</p>
          
          <p>You may now log in to your dashboard and begin updating final-year candidate details on behalf of your college. Please ensure that the information entered is accurate, as candidates will later complete their profiles independently.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${createPasswordUrl}" style="background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(255, 107, 53, 0.3);">🔐 Create Password</a>
          </div>
          
          <p>If you need any assistance while using the platform, feel free to reach out to our support team.</p>
          
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="margin: 0;">Warm regards,</p>
            <p style="margin: 5px 0; font-weight: bold; color: #ff6b35;">Team TaleGlobal</p>
            <p style="margin: 0; font-size: 14px;">🌐 <a href="https://www.taleglobal.net" style="color: #ff6b35; text-decoration: none;">www.taleglobal.net</a></p>
            <p style="margin: 0; font-size: 14px;">📧 <a href="mailto:support@taleglobal.net" style="color: #ff6b35; text-decoration: none;">support@taleglobal.net</a></p>
          </div>
        </div>
      </div>
    `;
  } else {
    subject = '🎉 Profile Approved - Welcome to TaleGlobal!';
    template = `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #28a745; margin: 0; font-size: 28px;">🎉 Profile Approved!</h1>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${name},</p>
          
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #28a745;">
            <p style="color: #155724; margin: 0; font-size: 18px; line-height: 1.6; font-weight: 600;">
              ✅ Congratulations! Your ${userType === 'employer' || userType === 'company' ? 'employer' : userType === 'consultant' ? 'consultant' : 'placement officer'} profile has been successfully approved by our admin team.
            </p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You can now proceed with the following steps:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
            <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 18px;">📋 Next Steps:</h3>
            <div style="color: #495057; line-height: 1.8; font-size: 15px;">
              ${(userType === 'employer' || userType === 'company' || userType === 'consultant') ? `
                <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                  <span style="color: #ff6b35; font-weight: bold; margin-right: 10px;">1.</span>
                  <span><strong>Login to your dashboard</strong> using your credentials</span>
                </div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                  <span style="color: #ff6b35; font-weight: bold; margin-right: 10px;">2.</span>
                  <span><strong>Post unlimited job openings</strong> for qualified candidates</span>
                </div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                  <span style="color: #ff6b35; font-weight: bold; margin-right: 10px;">3.</span>
                  <span><strong>Review applications</strong> from talented job seekers</span>
                </div>
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #ff6b35; font-weight: bold; margin-right: 10px;">4.</span>
                  <span><strong>Manage your hiring process</strong> efficiently</span>
                </div>
              ` : `
                <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                  <span style="color: #ff6b35; font-weight: bold; margin-right: 10px;">1.</span>
                  <span><strong>Login to your dashboard</strong> using your credentials</span>
                </div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                  <span style="color: #ff6b35; font-weight: bold; margin-right: 10px;">2.</span>
                  <span><strong>Upload student data files</strong> (Excel/CSV format)</span>
                </div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                  <span style="color: #ff6b35; font-weight: bold; margin-right: 10px;">3.</span>
                  <span><strong>Manage student registrations</strong> and track progress</span>
                </div>
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #ff6b35; font-weight: bold; margin-right: 10px;">4.</span>
                  <span><strong>Monitor placement activities</strong> for your college</span>
                </div>
              `}
            </div>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${loginUrl}" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; display: inline-block; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">🚀 Login to Dashboard</a>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2196f3;">
            <p style="color: #1565c0; margin: 0; font-size: 14px;">
              <strong>💡 Quick Tip:</strong> Make sure to complete all sections of your profile for the best experience on TaleGlobal.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e9ecef;">
            <p style="color: #6c757d; font-size: 16px; margin: 0 0 5px 0; font-weight: 600;">Best regards,</p>
            <p style="color: #ff6b35; font-size: 18px; margin: 0 0 5px 0; font-weight: 700;">The TaleGlobal Team</p>
            <p style="color: #6c757d; font-size: 14px; margin: 0;">🌟 Connecting Talent with Opportunities 🌟</p>
          </div>
        </div>
      </div>
    `;
  }

  const mailOptions = {
    from: `"TaleGlobal Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: template
  };

  await transporter.sendMail(mailOptions);
};

const sendJobApplicationConfirmationEmail = async (candidateEmail, candidateName, jobTitle, companyName, applicationDate, jobDetails = null) => {
  const transporter = createTransport();
  
  // Generate interview rounds section if job details are provided
  let interviewRoundsSection = '';
  let termsAndConditionsSection = '';
  
  if (jobDetails) {
    console.log('=== EMAIL DEBUG: Processing job details ===');
    console.log('interviewRoundOrder:', jobDetails.interviewRoundOrder);
    console.log('interviewRoundTypes:', jobDetails.interviewRoundTypes);
    console.log('interviewRoundDetails keys:', jobDetails.interviewRoundDetails ? Object.keys(jobDetails.interviewRoundDetails) : 'null');
    
    // Build interview rounds section
    const rounds = [];
    
    // Add assessment if explicitly enabled
    if (jobDetails.assessmentEnabled && jobDetails.assessmentId) {
      rounds.push({
        name: 'Assessment',
        type: 'assessment',
        description: 'Complete the online technical assessment',
        dateRange: jobDetails.assessmentStartDate && jobDetails.assessmentEndDate ? 
          `${new Date(jobDetails.assessmentStartDate).toLocaleDateString('en-GB')} - ${new Date(jobDetails.assessmentEndDate).toLocaleDateString('en-GB')}` : 
          'Date will be communicated',
        time: jobDetails.assessmentStartTime && jobDetails.assessmentEndTime ? 
          `${formatTimeToAMPM(jobDetails.assessmentStartTime)} - ${formatTimeToAMPM(jobDetails.assessmentEndTime)}` : 
          'Available 24/7 during assessment period'
      });
    }
    
    // Add interview rounds based on order - only if they are enabled and NOT assessment type
    if (jobDetails.interviewRoundOrder && jobDetails.interviewRoundDetails) {
      const roundNames = {
        technical: 'Technical Round',
        nonTechnical: 'Non-Technical Round',
        managerial: 'Managerial Round',
        final: 'Final Round',
        hr: 'HR Round',
        aptitude: 'Aptitude test - SOFTWARE ENGINEERING',
        coding: 'Coding - SENIOR SOFTWARE ENGINEERING'
      };
      
      jobDetails.interviewRoundOrder.forEach((roundKey, index) => {
        const roundType = jobDetails.interviewRoundTypes[roundKey];
        const roundDetails = jobDetails.interviewRoundDetails[roundKey];
        
        console.log(`Processing round ${index + 1}: key=${roundKey}, type=${roundType}, hasDetails=${!!roundDetails}`);
        if (roundDetails) {
          console.log(`Round details:`, {
            description: roundDetails.description,
            fromDate: roundDetails.fromDate,
            toDate: roundDetails.toDate,
            time: roundDetails.time
          });
        }
        
        // Skip assessment type rounds if assessment is already added
        if (roundType === 'assessment' && jobDetails.assessmentEnabled && jobDetails.assessmentId) {
          console.log(`Skipped duplicate assessment round`);
          return;
        }
        
        // Only add rounds that have both dates scheduled
        if (roundType && roundDetails && roundDetails.fromDate && roundDetails.toDate) {
          rounds.push({
            name: roundNames[roundType] || roundType,
            type: roundType,
            description: roundDetails.description || `${roundNames[roundType]} interview`,
            dateRange: `${new Date(roundDetails.fromDate).toLocaleDateString('en-GB')} - ${new Date(roundDetails.toDate).toLocaleDateString('en-GB')}`,
            time: roundDetails.time ? formatTimeToAMPM(roundDetails.time) : 'Time will be communicated'
          });
          console.log(`Added round: ${roundNames[roundType] || roundType}`);
        } else {
          console.log(`Skipped round ${roundKey} - no dates scheduled`);
        }
      });
    }
    
    console.log(`Total rounds processed: ${rounds.length}`);
    if (rounds.length > 0) {
      console.log('Rounds to be included in email:', rounds.map(r => r.name));
    }
    
    if (rounds.length > 0) {
      interviewRoundsSection = `
        <div style="background-color: #fff3cd; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ffc107;">
          <h3 style="color: #856404; margin: 0 0 20px 0; font-size: 18px;">📅 Interview Process Schedule:</h3>
          <div style="color: #856404; line-height: 1.6; font-size: 15px;">
            ${rounds.map((round, index) => `
              <div style="margin-bottom: 16px; padding: 12px; background-color: rgba(255,255,255,0.7); border-radius: 6px;">
                <div style="font-weight: bold; margin-bottom: 4px;">Round ${index + 1}: ${round.name}</div>
                <div style="margin-bottom: 2px;"><strong>Description:</strong> ${round.description}</div>
                <div style="margin-bottom: 2px;"><strong>Date:</strong> ${round.dateRange}</div>
                <div><strong>Time:</strong> ${round.time}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // Terms and Conditions section
    termsAndConditionsSection = `
      <div style="background-color: #f8d7da; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #dc3545;">
        <h3 style="color: #721c24; margin: 0 0 20px 0; font-size: 18px;">📋 Terms & Conditions:</h3>
        <div style="color: #721c24; line-height: 1.6; font-size: 14px;">
          <div style="margin-bottom: 12px;">
            <strong>🎯 Round Progression:</strong> Candidates must successfully pass each round to proceed to the next stage.
          </div>
          <div style="margin-bottom: 12px;">
            <strong>⚠️ Eligibility Criteria:</strong> Only candidates who pass Round 1 will be eligible for Round 2 and subsequent rounds.
          </div>
          <div style="margin-bottom: 12px;">
            <strong>📧 Communication:</strong> All interview updates and results will be communicated via email and your dashboard.
          </div>
          <div style="margin-bottom: 12px;">
            <strong>⏰ Punctuality:</strong> Please be on time for all scheduled interviews. Late arrivals may result in disqualification.
          </div>
          <div style="margin-bottom: 12px;">
            <strong>📱 Technical Requirements:</strong> Ensure stable internet connection and working camera/microphone for online interviews.
          </div>
          <div>
            <strong>🔄 Updates:</strong> Interview schedules may be updated. Please check your email and dashboard regularly.
          </div>
        </div>
      </div>
    `;
  }
  
  const applicationTemplate = `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #28a745; margin: 0; font-size: 28px;">✅ Application Submitted!</h1>
        </div>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${candidateName},</p>
        
        <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #28a745;">
          <p style="color: #155724; margin: 0; font-size: 18px; line-height: 1.6; font-weight: 600;">
            🎉 Your job application has been successfully submitted!
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 18px;">📋 Application Details:</h3>
          <div style="color: #495057; line-height: 1.8; font-size: 15px;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <span style="color: #ff6b35; font-weight: bold; margin-right: 10px; min-width: 120px;">Position:</span>
              <span><strong>${jobTitle}</strong></span>
            </div>
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <span style="color: #ff6b35; font-weight: bold; margin-right: 10px; min-width: 120px;">Company:</span>
              <span><strong>${companyName}</strong></span>
            </div>
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <span style="color: #ff6b35; font-weight: bold; margin-right: 10px; min-width: 120px;">Applied On:</span>
              <span>${new Date(applicationDate).toLocaleDateString('en-GB', { 
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })} ${new Date(applicationDate).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>
        </div>
        
        ${interviewRoundsSection}
        
        ${termsAndConditionsSection}
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Your application is now under review by the employer. You will be notified of any updates regarding your application status.
        </p>
        
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2196f3;">
          <h4 style="color: #1565c0; margin: 0 0 10px 0; font-size: 16px;">📱 What's Next?</h4>
          <ul style="color: #1565c0; margin: 0; font-size: 14px; padding-left: 20px;">
            <li>Keep your profile updated</li>
            <li>Check your email regularly for updates</li>
            <li>Track your application status in your dashboard</li>
            <li>Prepare for potential interviews</li>
            ${jobDetails && jobDetails.assessmentEnabled && jobDetails.assessmentId ? '<li><strong>Complete the technical assessment when available</strong></li>' : ''}
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e9ecef;">
          <p style="color: #6c757d; font-size: 16px; margin: 0 0 5px 0; font-weight: 600;">Best of luck!</p>
          <p style="color: #ff6b35; font-size: 18px; margin: 0 0 5px 0; font-weight: 700;">The TaleGlobal Team</p>
          <p style="color: #6c757d; font-size: 14px; margin: 0;">🌟 Connecting Talent with Opportunities 🌟</p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"TaleGlobal Team" <${process.env.EMAIL_USER}>`,
    to: candidateEmail,
    subject: `✅ Application Submitted - ${jobTitle} at ${companyName}`,
    html: applicationTemplate
  };

  await transporter.sendMail(mailOptions);
};

const sendCandidateActiveProfileEmail = async (email, name, password) => {
  const transporter = createTransport();
  const loginUrl = `${process.env.FRONTEND_URL || 'https://taleglobal.net'}/`;
  const createPasswordUrl = `${process.env.FRONTEND_URL || 'https://taleglobal.net'}/create-password?email=${encodeURIComponent(email)}&type=candidate`;
  
  const template = `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa; color: #333;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Your TaleGlobal Account Is Active</h2>
        
        <p>Dear <strong>${name}</strong>,</p>
        
        <p>Greetings from <strong>TaleGlobal</strong>.</p>
        
        <p>We would like to inform you that your basic details have been updated by your Placement Officer on the TaleGlobal platform and approved by the TaleGlobal Admin.</p>
        
        <p>Your TaleGlobal account is now active.</p>

        <h3 style="color: #2c3e50;">🔹 Important: Profile Completion Required</h3>
        <p>To proceed further and apply for job opportunities, you are required to log in and complete your full profile on the TaleGlobal platform.</p>

        <h3 style="color: #2c3e50;">✅ Steps to Follow After Login:</h3>
        <ul style="line-height: 1.6;">
          <li>Reset your password (mandatory for security reasons)</li>
          <li>Update your basic profile details (personal information, address, etc.)</li>
          <li>Update your complete education details</li>
          <li>Review and ensure your profile is accurate and complete</li>
        </ul>
        
        <p><em>Only candidates with a completed profile will be able to apply for job opportunities using the credits available in their account.</em></p>

        <h3 style="color: #2c3e50;">🔹 Account Information:</h3>
        <ul style="line-height: 1.6;">
          <li>Your profile has been approved</li>
          <li>Credits have been added to your account for applying to jobs</li>
          <li>You can access job opportunities, assessments, and placement-support resources</li>
        </ul>

        <div style="background-color: #e7f5ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #1971c2;">ℹ️ Important Information:</h4>
          <ul style="margin-bottom: 0; padding-left: 20px;">
            <li>No payment or fees have been collected from your college or Placement Officer</li>
            <li>TaleGlobal does not assure or guarantee 100% placement</li>
            <li>Placement opportunities depend on your skills, eligibility, and performance</li>
          </ul>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50; text-align: center;">🔐 Login Information:</h3>
          <p style="margin: 5px 0;"><strong>Username:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${password}</p>
          <p style="font-size: 14px; color: #666; margin-top: 10px;">Please log in and change your password immediately. Passwords can be updated anytime from your account settings.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #ff6b35; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin-right: 10px;">🔗 Login Here</a>
          <a href="${createPasswordUrl}" style="background-color: #2c3e50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">🔐 Create Password</a>
        </div>

        <p>TaleGlobal works in collaboration with your college placement team to support your career journey.</p>
        
        <p>If you face any issues while logging in or updating your profile, feel free to contact us.</p>
        
        <p>Wishing you success in your job search and career journey 🚀</p>
        
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="margin: 0;">Warm regards,</p>
          <p style="margin: 5px 0; font-weight: bold; color: #ff6b35;">Team TaleGlobal</p>
          <p style="margin: 0; font-size: 14px;">📧 <a href="mailto:info@taleglobal.net" style="color: #ff6b35; text-decoration: none;">info@taleglobal.net</a></p>
          <p style="margin: 0; font-size: 14px;">🌐 <a href="https://www.taleglobal.net" style="color: #ff6b35; text-decoration: none;">www.taleglobal.net</a></p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"TaleGlobal Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your TaleGlobal Account Is Active – Please Update Your Profile',
    html: template
  };

  await transporter.sendMail(mailOptions);
};

const sendPlacementAccessEnabledEmail = async (email, name, collegeName) => {
  const transporter = createTransport();
  const loginUrl = `${process.env.FRONTEND_URL || 'https://taleglobal.net'}/`;
  const createPasswordUrl = `${process.env.FRONTEND_URL || 'https://taleglobal.net'}/create-password?email=${encodeURIComponent(email)}&type=placement`;
  
  const template = `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa; color: #333;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Placement Access Enabled</h2>
        
        <p>Dear <strong>${name}</strong>,</p>
        
        <p>Greetings from <strong>TaleGlobal</strong>.</p>
        
        <p>As discussed and agreed, we are pleased to confirm the collaboration between <strong>TaleGlobal and ${collegeName}</strong> to support final-year students in their career and placement readiness journey.</p>
        
        <p>Placement Officer access has been <strong>successfully enabled</strong> on the TaleGlobal platform, allowing you to upload and update <strong>final-year student data</strong> directly.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">🔹 Scope of Collaboration:</h3>
          <ul style="line-height: 1.6;">
            <li>TaleGlobal will support students by providing access to:
              <ul>
                <li>Career opportunities</li>
                <li>Placement-related resources</li>
              </ul>
            </li>
            <li>TaleGlobal <strong>does not provide any assurance or guarantee of 100% placement</strong></li>
            <li>The platform is intended to <strong>support and enhance employability</strong>, not to promise job outcomes</li>
          </ul>
        </div>

        <div style="background-color: #e7f5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1971c2;">🔹 Financial Clarification:</h3>
          <ul style="line-height: 1.6; margin-bottom: 0;">
            <li><strong>No fees or payments are collected from ${collegeName}</strong></li>
            <li>Credits provided to students are <strong>offered as part of platform support</strong></li>
            <li>Credits are <strong>not linked to any monetary transaction</strong> with the institution</li>
          </ul>
        </div>

        <div style="background-color: #fff4e6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #d9480f;">🔹 Student Account Process:</h3>
          <ul style="line-height: 1.6; margin-bottom: 0;">
            <li>Student data submitted by the Placement Officer will be <strong>reviewed and approved by the TaleGlobal Admin</strong></li>
            <li>Upon approval, students will receive:
              <ul>
                <li>Platform access</li>
                <li>Credits for platform usage</li>
                <li>Login credentials via email</li>
              </ul>
            </li>
            <li>Students may <strong>change their passwords</strong> after first login for security purposes</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #ff6b35; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin-right: 10px;">🔗 Platform Login</a>
          <a href="${createPasswordUrl}" style="background-color: #2c3e50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">🔐 Create Password</a>
        </div>

        <p>We look forward to working closely with <strong>${collegeName}</strong> to support students in exploring suitable career and placement opportunities.</p>
        
        <p>Please feel free to reach out if you require any assistance with onboarding or platform usage.</p>
        
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="margin: 0;">Warm regards,</p>
          <p style="margin: 5px 0; font-weight: bold; color: #ff6b35;">Team TaleGlobal</p>
          <p style="margin: 0; font-size: 14px;">📧 <a href="mailto:info@taleglobal.net" style="color: #ff6b35; text-decoration: none;">info@taleglobal.net</a></p>
          <p style="margin: 0; font-size: 14px;">🌐 <a href="http://www.taleglobal.net" style="color: #ff6b35; text-decoration: none;">www.taleglobal.net</a></p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"TaleGlobal Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to TaleGlobal - Placement Access Enabled',
    html: template
  };

  await transporter.sendMail(mailOptions);
};

const sendCandidateDetailsUpdatedEmail = async (email, name, credits = 3) => {
  const transporter = createTransport();
  const resetPasswordUrl = `${process.env.FRONTEND_URL || 'https://taleglobal.net'}/create-password?email=${encodeURIComponent(email)}&type=candidate`;
  const loginUrl = `${process.env.FRONTEND_URL || 'https://taleglobal.net'}/`;
  
  const template = `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa; color: #333;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Your TaleGlobal Account Is Ready – Login & Start Applying</h2>
        
        <p>Dear <strong>${name}</strong>,</p>
        
        <p>Your details have been successfully updated on the TaleGlobal platform by your placement officer.</p>
        
        <p>To proceed, please log in to your account using the credentials provided by your placement officer. After logging in, you can update your personal, educational, and skill-related information.</p>
        
        <p>You can apply for jobs using these credits at no cost. If a job is not secured after using the free credits, you may continue applying through our pay-per-job model.</p>
        
        <p>Take the next step and explore opportunities through completely online interviews.</p>
        
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
          <p style="color: #1565c0; margin: 0; font-size: 14px;">
            <strong>📝 Note:</strong> Use the login credentials provided by your placement officer. If you don't have them or want to set a new password, use the "Create Password" option below.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin-right: 10px;">🔗 Login Here</a>
          <a href="${resetPasswordUrl}" style="background-color: #ff6b35; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">🔐 Create Password</a>
        </div>
        
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="margin: 0;">Best wishes for your career journey,</p>
          <p style="margin: 5px 0; font-weight: bold; color: #ff6b35;">Team TaleGlobal</p>
          <p style="margin: 0; font-size: 14px;">🌐 <a href="https://www.taleglobal.net" style="color: #ff6b35; text-decoration: none;">www.taleglobal.net</a></p>
          <p style="margin: 0; font-size: 14px;">📧 <a href="mailto:info@taleglobal.net" style="color: #ff6b35; text-decoration: none;">info@taleglobal.net</a></p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"TaleGlobal Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your TaleGlobal Account Is Ready – Login & Start Applying',
    html: template
  };

  await transporter.sendMail(mailOptions);
};

const sendPlacementOfficerApprovalEmail = async (email, name) => {
  const transporter = createTransport();
  
  const template = `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa; color: #333;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p>Dear ${name || 'Placement Officer'},</p>
        
        <p>We are happy to inform you that your TaleGlobal Placement Officer account has been approved.</p>
        
        <p>You may now log in to your dashboard and begin updating final-year candidate details on behalf of your college. Please ensure that the information entered is accurate, as candidates will later complete their profiles independently.</p>
        
        <p>If you need any assistance while using the platform, feel free to reach out to our support team.</p>
        
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="margin: 0;">Warm regards,</p>
          <p style="margin: 5px 0; font-weight: bold; color: #ff6b35;">Team TaleGlobal</p>
          <p style="margin: 0; font-size: 14px;">🌐 <a href="https://www.taleglobal.net" style="color: #ff6b35; text-decoration: none;">www.taleglobal.net</a></p>
          <p style="margin: 0; font-size: 14px;">📧 <a href="mailto:support@taleglobal.net" style="color: #ff6b35; text-decoration: none;">support@taleglobal.net</a></p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"TaleGlobal Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your TaleGlobal Placement Officer Account Has Been Approved',
    html: template
  };

  await transporter.sendMail(mailOptions);
};

const sendEmployerAccountApprovalEmail = async (email, name, companyName = null) => {
  const transporter = createTransport();
  
  const template = `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa; color: #333;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p>Dear Employer,</p>
        
        <p>Congratulations! 🎉</p>
        
        <p>Your employer account has been approved by the TaleGlobal Admin Team.</p>
        
        <p>You can now:</p>
        <ul style="line-height: 1.6;">
          <li>Log in to your dashboard</li>
          <li>Post job openings completely free of cost</li>
          <li>Conduct interviews online</li>
        </ul>
        
        <p><strong>Important Terms & Conditions:</strong></p>
        <ul style="line-height: 1.6;">
          <li>No fee should be collected from candidates</li>
          <li>Interviews must be conducted on time</li>
          <li>Offline interviews are strictly not permitted</li>
          <li>Job offers must be released as per the date mentioned in the job posting</li>
        </ul>
        
        <p>We look forward to supporting your hiring needs.</p>
        <p>For queries, contact <a href="mailto:support@taleglobal.net" style="color: #ff6b35; text-decoration: none;">support@taleglobal.net</a>.</p>
        
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="margin: 0;">Best regards,</p>
          <p style="margin: 5px 0; font-weight: bold; color: #ff6b35;">Team TaleGlobal</p>
          <p style="margin: 0; font-size: 14px;"><a href="https://www.taleglobal.net" style="color: #ff6b35; text-decoration: none;">www.taleglobal.net</a></p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"TaleGlobal Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Employer Account Has Been Approved – Start Posting Jobs',
    html: template
  };

  await transporter.sendMail(mailOptions);
};

const sendConsultantApprovalEmail = async (email, name, companyName = null) => {
  const transporter = createTransport();
  
  const template = `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa; color: #333;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p>Dear Consultant,</p>
        
        <p>Congratulations! 🎉</p>
        
        <p>Your consultant account has been approved by the TaleGlobal Admin Team.</p>
        
        <p>You can now:</p>
        <ul style="line-height: 1.6;">
          <li>Log in to your dashboard</li>
          <li>Post job openings completely free of cost</li>
          <li>Conduct interviews online</li>
        </ul>
        
        <p><strong>Important Terms &amp; Conditions:</strong></p>
        <ul style="line-height: 1.6;">
          <li>No fee should be collected from candidates</li>
          <li>Interviews must be conducted on time</li>
          <li>Offline interviews are strictly not permitted</li>
          <li>Job offers must be released as per the date mentioned in the job posting</li>
        </ul>
        
        <p>We look forward to supporting your hiring needs.</p>
        <p>For queries, contact <a href="mailto:support@taleglobal.net" style="color: #ff6b35; text-decoration: none;">support@taleglobal.net</a>.</p>
        
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="margin: 0;">Best regards,</p>
          <p style="margin: 5px 0; font-weight: bold; color: #ff6b35;">Team TaleGlobal</p>
          <p style="margin: 0; font-size: 14px;"><a href="https://www.taleglobal.net" style="color: #ff6b35; text-decoration: none;">www.taleglobal.net</a></p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"TaleGlobal Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Consultant Account Has Been Approved – Start Posting Jobs',
    html: template
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { 
  sendWelcomeEmail, 
  sendResetEmail, 
  sendPasswordCreationEmail, 
  sendAssessmentNotificationEmail, 
  sendOTPEmail, 
  sendPlacementCandidateWelcomeEmail,
  retryFailedEmail,
  sendApprovalEmail,
  sendJobApplicationConfirmationEmail,
  sendCandidateActiveProfileEmail,
  sendPlacementAccessEnabledEmail,
  sendPlacementOfficerApprovalEmail,
  sendCandidateDetailsUpdatedEmail,
  sendEmployerAccountApprovalEmail,
  sendConsultantApprovalEmail
};
