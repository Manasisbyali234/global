const PendingSignup = require('../models/PendingSignup');

const OTP_TTL_MS = 10 * 60 * 1000;
const PENDING_SIGNUP_TTL_MS = 30 * 60 * 1000;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const createOrUpdatePendingSignup = async ({ role, email, phone, name, payload }) => {
  const phoneOTP = generateOtp();
  const now = Date.now();
  const emailLower = normalizeEmail(email);

  const pendingSignup = await PendingSignup.findOneAndUpdate(
    { role, emailLower },
    {
      role,
      email: (email || '').trim().toLowerCase(),
      emailLower,
      phone: (phone || '').trim(),
      name,
      payload,
      phoneOTP,
      phoneOTPExpires: new Date(now + OTP_TTL_MS),
      expiresAt: new Date(now + PENDING_SIGNUP_TTL_MS)
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return pendingSignup;
};

const verifyPendingSignupOtp = async ({ role, email, otp }) => {
  const pendingSignup = await PendingSignup.findByRoleAndEmail(role, email);
  if (!pendingSignup) {
    return { pendingSignup: null, error: 'Pending signup not found. Please sign up again.' };
  }

  if (
    pendingSignup.phoneOTP !== otp ||
    (pendingSignup.phoneOTPExpires && pendingSignup.phoneOTPExpires.getTime() < Date.now())
  ) {
    return { pendingSignup: null, error: 'Invalid or expired OTP' };
  }

  return { pendingSignup };
};

const resendPendingSignupOtp = async ({ role, email }) => {
  const pendingSignup = await PendingSignup.findByRoleAndEmail(role, email);
  if (!pendingSignup) {
    return { pendingSignup: null, error: 'Pending signup not found. Please sign up again.' };
  }

  const now = Date.now();
  pendingSignup.phoneOTP = generateOtp();
  pendingSignup.phoneOTPExpires = new Date(now + OTP_TTL_MS);
  pendingSignup.expiresAt = new Date(now + PENDING_SIGNUP_TTL_MS);
  await pendingSignup.save();

  return { pendingSignup };
};

const deletePendingSignup = async (pendingSignup) => {
  if (!pendingSignup?._id) return;
  await PendingSignup.deleteOne({ _id: pendingSignup._id });
};

module.exports = {
  createOrUpdatePendingSignup,
  verifyPendingSignupOtp,
  resendPendingSignupOtp,
  deletePendingSignup
};
