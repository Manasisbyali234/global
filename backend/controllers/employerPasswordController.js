const Employer = require('../models/Employer');
const { checkEmailExists } = require('../utils/authUtils');

exports.createPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employer = await Employer.findByEmail(email.trim());

    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }

    if (employer.password) {
      return res.status(400).json({ success: false, message: 'Password already set' });
    }

    employer.password = password;
    employer.status = 'active';
    await employer.save();

    res.json({ success: true, message: 'Password created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Password Reset Controllers for Employer
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const employer = await Employer.findByEmail(email.trim());
    
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }

    const resetToken = require('crypto').randomBytes(32).toString('hex');
    employer.resetPasswordToken = resetToken;
    employer.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await employer.save();

    const { sendResetEmail } = require('../utils/emailService');
    await sendResetEmail(email, resetToken, 'employer');

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.confirmResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const employer = await Employer.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!employer) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    employer.password = newPassword;
    employer.resetPasswordToken = undefined;
    employer.resetPasswordExpires = undefined;
    await employer.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// OTP-based Password Reset
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const employer = await Employer.findByEmail(email.trim());
    
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    employer.resetPasswordOTP = otp;
    employer.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await employer.save();

    const { sendOTPEmail } = require('../utils/emailService');
    await sendOTPEmail(email, otp, employer.name);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const employer = await Employer.findByEmail(email.trim());

    if (!employer || employer.resetPasswordOTP !== otp || (employer.resetPasswordOTPExpires && employer.resetPasswordOTPExpires < Date.now())) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    employer.password = newPassword;
    employer.resetPasswordOTP = undefined;
    employer.resetPasswordOTPExpires = undefined;
    await employer.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await checkEmailExists(email);
    
    res.json({ 
      success: true, 
      exists: !!existingUser 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePasswordReset = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }

    const employer = await Employer.findByEmail(email.trim());
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }
    
    employer.password = newPassword;
    employer.markModified('password');
    await employer.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};