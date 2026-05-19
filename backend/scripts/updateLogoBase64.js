const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, '../utils/emailService.js');
let content = fs.readFileSync(servicePath, 'utf8');

const lineStart = content.indexOf('const LOGO_HTML =');
if (lineStart === -1) { console.error('LOGO_HTML not found'); process.exit(1); }

let lineEnd = content.indexOf('\n', lineStart);
if (lineEnd === -1) lineEnd = content.length;
if (content[lineEnd - 1] === '\r') lineEnd--;

const newLine = `const LOGO_HTML = '<div style="margin: 0 0 20px 0; text-align: left;"><img src="https://taleglobal.net/assets/images/background/image.png" alt="TaleGlobal" width="160" style="width: 160px; height: auto; display: block; border: 0;" /></div>';`;

const updated = content.substring(0, lineStart) + newLine + content.substring(lineEnd);
fs.writeFileSync(servicePath, updated, 'utf8');
console.log('Done! Logo URL set to: https://taleglobal.net/assets/images/background/image.png');
