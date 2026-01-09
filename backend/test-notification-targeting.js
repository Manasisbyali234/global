const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Notification Targeting\n');
console.log('═'.repeat(80));

const controllers = [
  'controllers/adminController.js',
  'controllers/employerController.js',
  'controllers/candidateController.js',
  'controllers/placementController.js'
];

let totalNotifications = 0;
let userSpecificNotifications = 0;
let broadcastNotifications = 0;
const issues = [];

controllers.forEach(controllerPath => {
  const fullPath = path.join(__dirname, controllerPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  
  console.log(`\n📄 Analyzing: ${controllerPath}`);
  console.log('─'.repeat(80));
  
  // Find all createNotification calls
  lines.forEach((line, index) => {
    if (line.includes('createNotification(')) {
      totalNotifications++;
      const lineNum = index + 1;
      
      // Look ahead to find the notification data
      let notificationData = '';
      let braceCount = 0;
      let startFound = false;
      
      for (let i = index; i < Math.min(index + 30, lines.length); i++) {
        const currentLine = lines[i];
        notificationData += currentLine + '\n';
        
        if (currentLine.includes('{')) {
          braceCount += (currentLine.match(/{/g) || []).length;
          startFound = true;
        }
        if (currentLine.includes('}')) {
          braceCount -= (currentLine.match(/}/g) || []).length;
        }
        
        if (startFound && braceCount === 0) break;
      }
      
      // Check if notification has user-specific targeting
      const hasRelatedId = notificationData.includes('relatedId:');
      const hasCandidateId = notificationData.includes('candidateId:');
      const roleMatch = notificationData.match(/role:\s*['"](\w+)['"]/);
      const typeMatch = notificationData.match(/type:\s*['"]([^'"]+)['"]/);
      const titleMatch = notificationData.match(/title:\s*['"]([^'"]+)['"]/);
      
      const role = roleMatch ? roleMatch[1] : 'unknown';
      const type = typeMatch ? typeMatch[1] : 'unknown';
      const title = titleMatch ? titleMatch[1] : 'unknown';
      
      // Determine if notification is user-specific
      const isUserSpecific = hasRelatedId || hasCandidateId;
      const isJobPosted = type === 'job_posted';
      const isAdminNotification = role === 'admin';
      
      if (isUserSpecific) {
        userSpecificNotifications++;
        console.log(`  ✅ Line ${lineNum}: ${title}`);
        console.log(`     Type: ${type}, Role: ${role}`);
        if (hasRelatedId) console.log(`     ✓ Has relatedId (user-specific)`);
        if (hasCandidateId) console.log(`     ✓ Has candidateId (user-specific)`);
      } else if (isJobPosted) {
        broadcastNotifications++;
        console.log(`  📢 Line ${lineNum}: ${title}`);
        console.log(`     Type: ${type}, Role: ${role}`);
        console.log(`     ✓ Broadcast to all candidates (CORRECT)`);
      } else if (isAdminNotification) {
        broadcastNotifications++;
        console.log(`  👤 Line ${lineNum}: ${title}`);
        console.log(`     Type: ${type}, Role: admin`);
        console.log(`     ✓ Admin notification (CORRECT)`);
      } else {
        issues.push({
          file: controllerPath,
          line: lineNum,
          title,
          type,
          role,
          issue: 'Missing user-specific targeting (relatedId or candidateId)'
        });
        console.log(`  ⚠️  Line ${lineNum}: ${title}`);
        console.log(`     Type: ${type}, Role: ${role}`);
        console.log(`     ❌ ISSUE: No relatedId or candidateId found!`);
      }
    }
  });
});

console.log('\n' + '═'.repeat(80));
console.log('📊 NOTIFICATION TARGETING SUMMARY');
console.log('═'.repeat(80));
console.log(`Total Notifications Found: ${totalNotifications}`);
console.log(`User-Specific Notifications: ${userSpecificNotifications}`);
console.log(`Broadcast Notifications: ${broadcastNotifications}`);
console.log(`Issues Found: ${issues.length}`);

if (issues.length > 0) {
  console.log('\n⚠️  ISSUES REQUIRING ATTENTION:');
  console.log('─'.repeat(80));
  issues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.file}:${issue.line}`);
    console.log(`   Title: ${issue.title}`);
    console.log(`   Type: ${issue.type}, Role: ${issue.role}`);
    console.log(`   Issue: ${issue.issue}`);
  });
  
  console.log('\n💡 RECOMMENDATION:');
  console.log('─'.repeat(80));
  console.log('Add relatedId or candidateId to make notifications user-specific:');
  console.log('');
  console.log('For Employer notifications:');
  console.log('  relatedId: new mongoose.Types.ObjectId(employerId)');
  console.log('');
  console.log('For Candidate notifications:');
  console.log('  candidateId: new mongoose.Types.ObjectId(candidateId)');
  console.log('');
  console.log('For Placement notifications:');
  console.log('  relatedId: new mongoose.Types.ObjectId(placementId)');
} else {
  console.log('\n✅ ALL NOTIFICATIONS ARE PROPERLY TARGETED!');
  console.log('─'.repeat(80));
  console.log('✓ User-specific notifications have relatedId or candidateId');
  console.log('✓ Job posted notifications broadcast to all candidates');
  console.log('✓ Admin notifications are properly configured');
}

console.log('\n📋 NOTIFICATION RULES:');
console.log('─'.repeat(80));
console.log('1. ✅ Job Posted → Broadcast to ALL candidates (no relatedId/candidateId)');
console.log('2. ✅ Profile Approved → Specific user (relatedId or candidateId)');
console.log('3. ✅ Application Status → Specific candidate (candidateId)');
console.log('4. ✅ Document Approved → Specific employer (relatedId)');
console.log('5. ✅ Admin Notifications → All admins (role: admin)');
console.log('6. ✅ Support Response → Specific user (candidateId or relatedId)');

console.log('\n' + '═'.repeat(80));
if (issues.length === 0) {
  console.log('✅ VERIFICATION COMPLETE - ALL NOTIFICATIONS PROPERLY TARGETED');
} else {
  console.log(`⚠️  VERIFICATION COMPLETE - ${issues.length} ISSUE(S) FOUND`);
}
console.log('═'.repeat(80));
console.log('');
