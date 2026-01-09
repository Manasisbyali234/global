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

function replaceInFile(filePath) {
  const fullPath = path.join(srcDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Replace import statement
  if (content.includes("import { showToast") || content.includes("import showToast")) {
    content = content.replace(
      /import\s+(?:\{?\s*showToast\s*\}?|showToast)\s+from\s+['"].*?['"];?\s*\n/g,
      ''
    );
    
    // Add new import at the top after other imports
    const importMatch = content.match(/^((?:import\s+.*?;\s*\n)*)/);
    if (importMatch) {
      const imports = importMatch[1];
      if (!imports.includes('popupNotification')) {
        content = content.replace(
          importMatch[1],
          imports + "import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../utils/popupNotification';\n"
        );
      }
    }
    modified = true;
  }

  // Replace showToast calls
  if (content.includes('showToast(')) {
    // Replace showToast with appropriate popup function based on type parameter
    content = content.replace(
      /showToast\s*\(\s*([^,]+?)\s*,\s*['"]success['"]\s*(?:,\s*\d+)?\s*\)/g,
      'showSuccess($1)'
    );
    content = content.replace(
      /showToast\s*\(\s*([^,]+?)\s*,\s*['"]error['"]\s*(?:,\s*\d+)?\s*\)/g,
      'showError($1)'
    );
    content = content.replace(
      /showToast\s*\(\s*([^,]+?)\s*,\s*['"]warning['"]\s*(?:,\s*\d+)?\s*\)/g,
      'showWarning($1)'
    );
    content = content.replace(
      /showToast\s*\(\s*([^,]+?)\s*,\s*['"]info['"]\s*(?:,\s*\d+)?\s*\)/g,
      'showInfo($1)'
    );
    
    // Replace remaining showToast calls (default to showPopup)
    content = content.replace(
      /showToast\s*\(/g,
      'showPopup('
    );
    
    modified = true;
  }

  // Remove removeToast calls
  if (content.includes('removeToast()')) {
    content = content.replace(/removeToast\(\);?\s*\n?/g, '');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }

  return false;
}

console.log('🔄 Starting toast to popup replacement...\n');

let updatedCount = 0;
filesToUpdate.forEach(file => {
  if (replaceInFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✨ Replacement complete! Updated ${updatedCount} files.`);
