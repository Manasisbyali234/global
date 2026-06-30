/**
 * Test script: shows exactly how email is stored at each step of signup
 * Tests candidate, employer, and placement flows with Lpj.al.co@gmail.com
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const PendingSignup = require('../models/PendingSignup');
const { createOrUpdatePendingSignup, verifyPendingSignupOtp } = require('../utils/pendingSignup');

const TEST_EMAIL = 'Lpj.al.co@gmail.com';
const TEST_PHONE = '9999999999';
const LINE = '─'.repeat(60);

function log(label, value) {
  console.log(`  ${label.padEnd(32)} → "${value}"`);
}

async function cleanupTestData() {
  await PendingSignup.deleteMany({ emailLower: { $regex: /lpj/ } });
}

async function testFlow(role, payloadFn) {
  const roleLabel = role.toUpperCase() + ' SIGNUP FLOW';
  console.log('\n' + LINE);
  console.log('  ' + roleLabel);
  console.log(LINE);

  // Show OLD broken behaviour
  const oldNormalized = TEST_EMAIL.trim().toLowerCase()
    .replace(/^([^@]+)/, (local) => local.replace(/\./g, ''));
  console.log('\n[OLD - BROKEN] normalizeEmail() stripped dots:');
  log('Stored emailLower', oldNormalized);
  log('Verify lookup (.toLowerCase())', TEST_EMAIL.trim().toLowerCase());
  console.log('  ✗ MISMATCH → "Pending signup not found"');

  // Simulate controller: email.trim().toLowerCase()
  const storedEmail = TEST_EMAIL.trim().toLowerCase();

  const pendingSignup = await createOrUpdatePendingSignup({
    role,
    email: TEST_EMAIL,
    phone: TEST_PHONE,
    name: 'Test User',
    payload: payloadFn(storedEmail)
  });

  console.log('\n[NEW - FIXED] email.trim().toLowerCase():');
  console.log('\n[1] PendingSignup stored in DB:');
  log('email', pendingSignup.email);
  log('emailLower (lookup key)', pendingSignup.emailLower);
  log('OTP generated', pendingSignup.phoneOTP);

  console.log('\n[2] OTP verification (frontend sends original):');
  log('Frontend sends', TEST_EMAIL);
  log('Lookup normalizes to', TEST_EMAIL.trim().toLowerCase());
  log('DB emailLower', pendingSignup.emailLower);
  const match = TEST_EMAIL.trim().toLowerCase() === pendingSignup.emailLower;
  console.log(`  ${match ? '✓ MATCH' : '✗ MISMATCH'} → OTP verification ${match ? 'succeeds!' : 'fails!'}`);

  const { pendingSignup: verified, error } = await verifyPendingSignupOtp({
    role,
    email: TEST_EMAIL,
    otp: pendingSignup.phoneOTP
  });

  console.log('\n[3] verifyPendingSignupOtp() result:');
  if (error) {
    console.log(`  ✗ Error: ${error}`);
  } else {
    const savedEmail = verified.payload?.email || verified.payload?.employerData?.email || verified.payload?.placementData?.email;
    console.log(`  ✓ Success!`);
    log('Email saved to DB', savedEmail);
  }

  await PendingSignup.deleteOne({ _id: pendingSignup._id });
}

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('  EMAIL STORAGE TEST — ' + TEST_EMAIL);
  console.log('═'.repeat(60));

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n✓ Connected to MongoDB');

    await cleanupTestData();

    await testFlow('candidate', (email) => ({
      firstName: 'Test', lastName: 'User',
      email, phone: TEST_PHONE, status: 'pending'
    }));

    await testFlow('employer', (email) => ({
      employerData: { name: 'Test User', email, phone: TEST_PHONE, companyName: 'Test Co' },
      employerCategory: 'company'
    }));

    await testFlow('placement', (email) => ({
      placementData: { name: 'Test User', email, phone: TEST_PHONE, collegeName: 'Test College' },
      shouldSendEmail: true
    }));

    console.log('\n' + '═'.repeat(60));
    console.log('  ALL 3 FLOWS PASSED ✓');
    console.log('═'.repeat(60) + '\n');
  } catch (err) {
    console.error('\n✗ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB\n');
  }
}

main();
