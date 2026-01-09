const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'app/pannels/admin/components/admin-candidates.jsx',
  'app/pannels/admin/components/admin-emp-manage.jsx',
  'app/pannels/admin/components/admin-individual-credit.jsx',
  'app/pannels/admin/components/admin-jobs-skills.jsx',
  'app/pannels/admin/components/admin-placement-manage-tabs.jsx',
  'app/pannels/admin/components/admin-placement-manage.jsx',
  'app/pannels/admin/components/admin-sub-admin.jsx',
  'app/pannels/admin/components/admin-support-tickets.jsx',
  'app/pannels/admin/components/placement-details.jsx',
  'app/pannels/candidate/components/application-status.jsx',
  'app/pannels/candidate/components/interview-response-modal.jsx',
  'app/pannels/candidate/sections/profile/section-can-basic-info.jsx',
  'app/pannels/candidate/sections/resume/section-can-attachment.jsx',
  'app/pannels/candidate/sections/resume/section-can-education.jsx',
  'app/pannels/candidate/sections/resume/section-can-employment.jsx',
  'app/pannels/candidate/sections/resume/section-can-keyskills.jsx',
  'app/pannels/candidate/sections/resume/section-can-personal.jsx',
  'app/pannels/candidate/sections/resume/section-can-profile-summary.jsx',
  'app/pannels/candidate/sections/resume/section-can-resume-headline.jsx',
  'app/pannels/employer/components/assessments/CreateassessmentModal.jsx',
  'app/pannels/employer/components/emp-candidate-review.jsx',
  'app/pannels/employer/components/emp-company-profile.jsx',
  'app/pannels/employer/components/InterviewProcessManager.jsx',
  'app/pannels/employer/components/jobs/emp-post-job.jsx',
  'app/pannels/employer/components/jobs/emp-posted-jobs.jsx',
  'app/pannels/employer/components/pages/AssessmentDashboard.jsx',
  'app/pannels/placement/placement-dashboard.jsx',
  'app/pannels/public-user/components/employers/emp-detail1.jsx',
  'app/pannels/public-user/components/home/index16.jsx',
  'app/pannels/public-user/components/jobs/job-detail1.jsx',
  'utils/errorHandler.js'
];

const srcDir = path.join(__dirname, 'src');

function getRelativePath(from, to) {
  const fromDir = path.dirname(from);
  let relativePath = path.relative(fromDir, to).replace(/\\/g, '/');
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  return relativePath;
}

function fixImportPath(filePath) {
  const fullPath = path.join(srcDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Calculate correct relative path to utils/popupNotification
  const targetPath = path.join(srcDir, 'utils/popupNotification');
  const relativePath = getRelativePath(fullPath, targetPath);
  
  // Replace the generic import with correct relative path
  const oldImport = /import\s+\{\s*showPopup,\s*showSuccess,\s*showError,\s*showWarning,\s*showInfo\s*\}\s+from\s+['"]\.\.\/\.\.\/utils\/popupNotification['"];?\s*\n/g;
  
  if (content.match(oldImport)) {
    content = content.replace(
      oldImport,
      `import { showPopup, showSuccess, showError, showWarning, showInfo } from '${relativePath}';\n`
    );
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath} -> ${relativePath}`);
    return true;
  }
  
  return false;
}

console.log('🔧 Fixing import paths...\n');

let fixedCount = 0;
filesToUpdate.forEach(file => {
  if (fixImportPath(file)) {
    fixedCount++;
  }
});

console.log(`\n✨ Fixed ${fixedCount} import paths.`);
