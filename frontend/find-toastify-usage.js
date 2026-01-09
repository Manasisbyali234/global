const fs = require('fs');
const path = require('path');

// Configuration
const srcDir = path.join(__dirname, 'src');
const fileExtensions = ['.js', '.jsx'];
const searchPatterns = [
  /import.*toast.*from.*react-toastify/gi,
  /import.*ToastContainer.*from.*react-toastify/gi,
  /toast\.success/gi,
  /toast\.error/gi,
  /toast\.warning/gi,
  /toast\.info/gi,
  /toast\(/gi,
  /<ToastContainer/gi,
];

let filesWithToastify = [];
let totalMatches = 0;

function searchDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (file !== 'node_modules' && file !== 'build' && file !== 'dist') {
        searchDirectory(filePath);
      }
    } else if (fileExtensions.includes(path.extname(file))) {
      searchFile(filePath);
    }
  });
}

function searchFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let fileMatches = [];

  lines.forEach((line, index) => {
    searchPatterns.forEach(pattern => {
      if (pattern.test(line)) {
        fileMatches.push({
          line: index + 1,
          content: line.trim(),
          pattern: pattern.source
        });
        totalMatches++;
      }
    });
  });

  if (fileMatches.length > 0) {
    filesWithToastify.push({
      file: path.relative(srcDir, filePath),
      matches: fileMatches
    });
  }
}

// Run the search
console.log('🔍 Searching for Toastify usage in your project...\n');
searchDirectory(srcDir);

// Display results
if (filesWithToastify.length === 0) {
  console.log('✅ No Toastify usage found! Your project is clean.\n');
} else {
  console.log(`📊 Found ${totalMatches} Toastify usage(s) in ${filesWithToastify.length} file(s):\n`);
  
  filesWithToastify.forEach(({ file, matches }) => {
    console.log(`\n📄 ${file}`);
    console.log('─'.repeat(60));
    matches.forEach(({ line, content }) => {
      console.log(`   Line ${line}: ${content}`);
    });
  });

  console.log('\n\n📋 Migration Checklist:');
  console.log('─'.repeat(60));
  console.log('1. ✅ Remove: import { toast } from "react-toastify"');
  console.log('2. ✅ Add: import { usePopupNotification } from "../hooks/usePopupNotification"');
  console.log('3. ✅ Add: const { popup, showSuccess, showError, hidePopup } = usePopupNotification()');
  console.log('4. ✅ Replace: toast.success() → showSuccess()');
  console.log('5. ✅ Replace: toast.error() → showError()');
  console.log('6. ✅ Replace: toast.warning() → showWarning()');
  console.log('7. ✅ Replace: toast.info() → showInfo()');
  console.log('8. ✅ Add popup JSX to component');
  console.log('9. ✅ Remove <ToastContainer /> from App.js');
  console.log('10. ✅ Run: npm uninstall react-toastify\n');
}

// Save results to file
const reportPath = path.join(__dirname, 'toastify-usage-report.txt');
let report = `Toastify Usage Report\n`;
report += `Generated: ${new Date().toLocaleString()}\n`;
report += `Total Matches: ${totalMatches}\n`;
report += `Files with Toastify: ${filesWithToastify.length}\n\n`;

filesWithToastify.forEach(({ file, matches }) => {
  report += `\nFile: ${file}\n`;
  report += '─'.repeat(60) + '\n';
  matches.forEach(({ line, content }) => {
    report += `Line ${line}: ${content}\n`;
  });
});

fs.writeFileSync(reportPath, report);
console.log(`📝 Full report saved to: toastify-usage-report.txt\n`);
