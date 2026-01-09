const fs = require('fs');
const path = require('path');

console.log('🧪 Testing PopupNotification Component\n');
console.log('═'.repeat(60));

let allTestsPassed = true;

// Test 1: Check if PopupNotification.jsx exists
console.log('\n✓ Test 1: Checking PopupNotification.jsx...');
const popupPath = path.join(__dirname, 'src/components/PopupNotification.jsx');
if (fs.existsSync(popupPath)) {
  const content = fs.readFileSync(popupPath, 'utf8');
  console.log('  ✅ PopupNotification.jsx exists');
  
  // Check for required elements
  if (content.includes('popup-overlay')) console.log('  ✅ Contains overlay');
  if (content.includes('popup-box')) console.log('  ✅ Contains popup box');
  if (content.includes('popup-button')) console.log('  ✅ Contains OK button');
  if (content.includes('onClick={handleOverlayClick}')) console.log('  ✅ Has click outside handler');
  if (content.includes('type === \'success\'')) console.log('  ✅ Has success type');
  if (content.includes('type === \'error\'')) console.log('  ✅ Has error type');
  if (content.includes('type === \'warning\'')) console.log('  ✅ Has warning type');
  if (content.includes('type === \'info\'')) console.log('  ✅ Has info type');
} else {
  console.log('  ❌ PopupNotification.jsx NOT FOUND');
  allTestsPassed = false;
}

// Test 2: Check if PopupNotification.css exists
console.log('\n✓ Test 2: Checking PopupNotification.css...');
const cssPath = path.join(__dirname, 'src/components/PopupNotification.css');
if (fs.existsSync(cssPath)) {
  const content = fs.readFileSync(cssPath, 'utf8');
  console.log('  ✅ PopupNotification.css exists');
  
  // Check for required styles
  if (content.includes('.popup-overlay')) console.log('  ✅ Has overlay styles');
  if (content.includes('.popup-box')) console.log('  ✅ Has box styles');
  if (content.includes('.popup-button')) console.log('  ✅ Has button styles');
  if (content.includes('rgba(0, 0, 0, 0.5)')) console.log('  ✅ Has semi-transparent overlay');
  if (content.includes('border-radius')) console.log('  ✅ Has rounded corners');
  if (content.includes('box-shadow')) console.log('  ✅ Has shadow');
  if (content.includes('@keyframes')) console.log('  ✅ Has animations');
  if (content.includes('@media')) console.log('  ✅ Has mobile responsive styles');
} else {
  console.log('  ❌ PopupNotification.css NOT FOUND');
  allTestsPassed = false;
}

// Test 3: Check if usePopupNotification hook exists
console.log('\n✓ Test 3: Checking usePopupNotification.js...');
const hookPath = path.join(__dirname, 'src/hooks/usePopupNotification.js');
if (fs.existsSync(hookPath)) {
  const content = fs.readFileSync(hookPath, 'utf8');
  console.log('  ✅ usePopupNotification.js exists');
  
  // Check for required functions
  if (content.includes('showPopup')) console.log('  ✅ Has showPopup function');
  if (content.includes('hidePopup')) console.log('  ✅ Has hidePopup function');
  if (content.includes('showSuccess')) console.log('  ✅ Has showSuccess function');
  if (content.includes('showError')) console.log('  ✅ Has showError function');
  if (content.includes('showWarning')) console.log('  ✅ Has showWarning function');
  if (content.includes('showInfo')) console.log('  ✅ Has showInfo function');
  if (content.includes('useState')) console.log('  ✅ Uses useState hook');
} else {
  console.log('  ❌ usePopupNotification.js NOT FOUND');
  allTestsPassed = false;
}

// Test 4: Check if example component exists
console.log('\n✓ Test 4: Checking PopupNotificationExample.jsx...');
const examplePath = path.join(__dirname, 'src/components/PopupNotificationExample.jsx');
if (fs.existsSync(examplePath)) {
  const content = fs.readFileSync(examplePath, 'utf8');
  console.log('  ✅ PopupNotificationExample.jsx exists');
  
  // Check for example buttons
  if (content.includes('Show Success')) console.log('  ✅ Has success button');
  if (content.includes('Show Error')) console.log('  ✅ Has error button');
  if (content.includes('Show Warning')) console.log('  ✅ Has warning button');
  if (content.includes('Show Info')) console.log('  ✅ Has info button');
} else {
  console.log('  ❌ PopupNotificationExample.jsx NOT FOUND');
  allTestsPassed = false;
}

// Test 5: Check documentation files
console.log('\n✓ Test 5: Checking documentation files...');
const docs = [
  'src/components/PopupNotification.README.md',
  'MIGRATION_GUIDE.md',
  'POPUP_QUICK_REFERENCE.md',
  'POPUP_NOTIFICATION_SUMMARY.md',
  'HOW_TO_USE_POPUP.txt',
  'find-toastify-usage.js'
];

docs.forEach(doc => {
  const docPath = path.join(__dirname, doc);
  if (fs.existsSync(docPath)) {
    console.log(`  ✅ ${doc} exists`);
  } else {
    console.log(`  ❌ ${doc} NOT FOUND`);
    allTestsPassed = false;
  }
});

// Test 6: Check for Toastify remnants
console.log('\n✓ Test 6: Checking for Toastify remnants...');
const srcDir = path.join(__dirname, 'src');

function searchForToastify(dir, depth = 0) {
  if (depth > 3) return []; // Limit depth
  
  const files = fs.readdirSync(dir);
  let found = [];
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'build') {
      found = found.concat(searchForToastify(filePath, depth + 1));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('react-toastify') || content.includes('ToastContainer')) {
        found.push(path.relative(__dirname, filePath));
      }
    }
  });
  
  return found;
}

const toastifyFiles = searchForToastify(srcDir);
if (toastifyFiles.length === 0) {
  console.log('  ✅ No Toastify imports found (clean!)');
} else {
  console.log(`  ⚠️  Found Toastify in ${toastifyFiles.length} file(s):`);
  toastifyFiles.forEach(file => console.log(`     - ${file}`));
  console.log('  ℹ️  Run: node find-toastify-usage.js for details');
}

console.log('\n' + '═'.repeat(60));
if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED!');
} else {
  console.log('❌ SOME TESTS FAILED!');
}
console.log('═'.repeat(60));

console.log('\n📋 Component Structure:');
console.log('─'.repeat(60));
console.log('PopupNotification.jsx     → Main component');
console.log('PopupNotification.css     → Styling');
console.log('usePopupNotification.js   → Custom hook');
console.log('PopupNotificationExample  → Working example');

console.log('\n🎯 Next Steps:');
console.log('─'.repeat(60));
console.log('1. Test the example component in your app');
console.log('2. Run: node find-toastify-usage.js');
console.log('3. Migrate one component at a time');
console.log('4. Test each notification type');
console.log('5. Remove Toastify when done');

console.log('\n📚 Documentation:');
console.log('─'.repeat(60));
console.log('• HOW_TO_USE_POPUP.txt        → Quick start guide');
console.log('• POPUP_QUICK_REFERENCE.md    → Copy-paste examples');
console.log('• MIGRATION_GUIDE.md          → Full migration steps');
console.log('• PopupNotification.README.md → Complete docs');

console.log('\n');
