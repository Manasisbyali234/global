require('dotenv').config();
const { sendSMS } = require('../utils/smsProvider');

const mobile = '8951670880';
const otp = Math.floor(100000 + Math.random() * 900000).toString();
const name = 'Admin';

console.log(`Sending OTP: ${otp} to ${mobile}...`);

sendSMS(mobile, otp, name)
  .then((result) => {
    console.log('Result:', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
