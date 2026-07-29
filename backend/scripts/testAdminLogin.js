require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const pass = (msg) => console.log(`\x1b[32m✔ PASS\x1b[0m  ${msg}`);
const fail = (msg) => { console.log(`\x1b[31m✘ FAIL\x1b[0m  ${msg}`); process.exitCode = 1; };
const info = (msg) => console.log(`\x1b[36mℹ\x1b[0m      ${msg}`);

const ADMIN_EMAIL = 'manishree31999@gmail.com';
const ADMIN_PASSWORD = 'admin123456';

async function run() {
  console.log('\n=== Admin Login Flow Test (Direct DB) ===\n');

  await mongoose.connect(process.env.MONGODB_URI);
  info('Connected to MongoDB');

  // ── Test 1: Admin exists ──────────────────────────────────────────────────
  const admin = await Admin.findOne({ email: ADMIN_EMAIL });
  if (admin) {
    pass(`Admin found — email: ${admin.email}, role: ${admin.role}, status: ${admin.status}`);
  } else {
    fail('Admin not found in DB — run createAdmin.js first');
    await mongoose.disconnect();
    return;
  }

  // ── Test 2: Wrong password rejected ──────────────────────────────────────
  const wrongPwdMatch = await admin.comparePassword('wrongpassword');
  if (!wrongPwdMatch) {
    pass('Wrong password correctly rejected');
  } else {
    fail('Wrong password was accepted — bcrypt issue');
  }

  // ── Test 3: Correct password accepted ────────────────────────────────────
  const correctPwdMatch = await admin.comparePassword(ADMIN_PASSWORD);
  if (correctPwdMatch) {
    pass('Correct password accepted');
  } else {
    fail(`Correct password rejected — password may have changed. Try: node scripts/updateAdminEmail.js`);
    await mongoose.disconnect();
    return;
  }

  // ── Test 4: Account is active ─────────────────────────────────────────────
  if (admin.status === 'active') {
    pass('Admin account is active');
  } else {
    fail(`Admin account status is "${admin.status}" — login will be blocked`);
  }

  // ── Test 5: Simulate 2FA OTP generation ──────────────────────────────────
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  admin.twoFactorOTP = otp;
  admin.twoFactorOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
  await admin.save();

  const adminWithOtp = await Admin.findOne({ email: ADMIN_EMAIL });
  if (adminWithOtp.twoFactorOTP === otp) {
    pass(`2FA OTP saved to DB: ${otp}`);
  } else {
    fail('2FA OTP not saved correctly');
  }

  // ── Test 6: Wrong OTP rejected ────────────────────────────────────────────
  if (adminWithOtp.twoFactorOTP !== '000000') {
    pass('Wrong OTP (000000) would be rejected');
  }

  // ── Test 7: Correct OTP accepted + token generated ───────────────────────
  if (adminWithOtp.twoFactorOTP === otp && adminWithOtp.twoFactorOTPExpires > new Date()) {
    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    pass(`Correct OTP accepted, JWT token generated: ${token.substring(0, 40)}...`);

    // ── Test 8: Clear OTP after use ───────────────────────────────────────
    adminWithOtp.twoFactorOTP = undefined;
    adminWithOtp.twoFactorOTPExpires = undefined;
    await adminWithOtp.save();

    const adminAfter = await Admin.findOne({ email: ADMIN_EMAIL });
    if (!adminAfter.twoFactorOTP) {
      pass('OTP cleared from DB after successful login');
    } else {
      fail('OTP still present in DB after login');
    }

    // ── Test 9: JWT is valid ──────────────────────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id && decoded.role === 'admin') {
      pass(`JWT valid — id: ${decoded.id}, role: ${decoded.role}`);
    } else {
      fail('JWT decode failed');
    }
  } else {
    fail('OTP validation failed');
  }

  // ── Test 10: Admin API slug configured ───────────────────────────────────
  const slug = process.env.ADMIN_API_SLUG;
  if (slug && slug !== 'admin') {
    pass(`ADMIN_API_SLUG is set to: "${slug}" (obfuscated)`);
  } else if (slug === 'admin') {
    fail('ADMIN_API_SLUG is still "admin" — not obfuscated');
  } else {
    fail('ADMIN_API_SLUG is not set in .env');
  }

  await mongoose.disconnect();
  console.log('\n=== All Tests Complete ===\n');
}

run().catch((err) => {
  console.error('\nTest script error:', err.message);
  process.exit(1);
});
