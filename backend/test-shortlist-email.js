require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  },
  tls: { rejectUnauthorized: false }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: 'workkrr15@gmail.com',
  subject: '🎉 Test Shortlist Email',
  html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>'
}).then(() => {
  console.log('✓ Email sent successfully');
  process.exit(0);
}).catch(err => {
  console.error('✗ Email failed:', err.message);
  process.exit(1);
});
