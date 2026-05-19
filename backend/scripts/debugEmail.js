require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { prependMailGreeting } = require('../utils/emailService');
const fs = require('fs');

const sampleHtml = `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa;">
    <div style="background-color: white; padding: 30px; border-radius: 10px;">
      <p>Dear Test User,</p>
      <p>This is a test email.</p>
    </div>
  </div>
`;

const result = prependMailGreeting(sampleHtml);
fs.writeFileSync('scripts/preview_email.html', result, 'utf8');
console.log('Preview saved to scripts/preview_email.html');

// Check if logo is present and what src it has
const srcMatch = result.match(/img src="([^"]{0,80})/);
console.log('IMG src (first 80 chars):', srcMatch ? srcMatch[1] : 'NOT FOUND');
