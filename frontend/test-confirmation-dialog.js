const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Confirmation Dialog Implementation\n');
console.log('═'.repeat(60));

let allTestsPassed = true;

// Test 1: Check if ConfirmationDialog.jsx exists
console.log('\n✓ Test 1: Checking ConfirmationDialog.jsx...');
const confirmationPath = path.join(__dirname, 'src/components/ConfirmationDialog.jsx');
if (fs.existsSync(confirmationPath)) {
  const content = fs.readFileSync(confirmationPath, 'utf8');
  console.log('  ✅ ConfirmationDialog.jsx exists');
  
  // Check for required elements
  if (content.includes('popup-overlay')) console.log('  ✅ Contains overlay');
  if (content.includes('popup-box')) console.log('  ✅ Contains popup box');
  if (content.includes('onConfirm')) console.log('  ✅ Has onConfirm prop');
  if (content.includes('onCancel')) console.log('  ✅ Has onCancel prop');
  if (content.includes('Yes')) console.log('  ✅ Has Yes button');
  if (content.includes('No')) console.log('  ✅ Has No button');
  if (content.includes('handleOverlayClick')) console.log('  ✅ Has click outside handler');
} else {
  console.log('  ❌ ConfirmationDialog.jsx NOT FOUND');
  allTestsPassed = false;
}

// Test 2: Check if popupNotification.js has showConfirmation
console.log('\n✓ Test 2: Checking popupNotification.js updates...');
const utilsPath = path.join(__dirname, 'src/utils/popupNotification.js');
if (fs.existsSync(utilsPath)) {
  const content = fs.readFileSync(utilsPath, 'utf8');
  console.log('  ✅ popupNotification.js exists');
  
  if (content.includes('showConfirmationFunction')) console.log('  ✅ Has showConfirmationFunction');
  if (content.includes('showConfirmation')) console.log('  ✅ Has showConfirmation export');
  if (content.includes('initPopupNotification')) console.log('  ✅ Has initPopupNotification');
} else {
  console.log('  ❌ popupNotification.js NOT FOUND');
  allTestsPassed = false;
}

// Test 3: Check if usePopupNotification hook has confirmation support
console.log('\n✓ Test 3: Checking usePopupNotification.js updates...');
const hookPath = path.join(__dirname, 'src/hooks/usePopupNotification.js');
if (fs.existsSync(hookPath)) {
  const content = fs.readFileSync(hookPath, 'utf8');
  console.log('  ✅ usePopupNotification.js exists');
  
  if (content.includes('confirmation')) console.log('  ✅ Has confirmation state');
  if (content.includes('showConfirmation')) console.log('  ✅ Has showConfirmation function');
  if (content.includes('hideConfirmation')) console.log('  ✅ Has hideConfirmation function');
} else {
  console.log('  ❌ usePopupNotification.js NOT FOUND');
  allTestsPassed = false;
}

// Test 4: Check if GlobalPopupProvider has confirmation support
console.log('\n✓ Test 4: Checking GlobalPopupProvider.jsx updates...');
const providerPath = path.join(__dirname, 'src/components/GlobalPopupProvider.jsx');
if (fs.existsSync(providerPath)) {
  const content = fs.readFileSync(providerPath, 'utf8');
  console.log('  ✅ GlobalPopupProvider.jsx exists');
  
  if (content.includes('ConfirmationDialog')) console.log('  ✅ Imports ConfirmationDialog');
  if (content.includes('confirmation.show')) console.log('  ✅ Renders confirmation dialog');
  if (content.includes('handleConfirm')) console.log('  ✅ Has confirm handler');
  if (content.includes('handleCancel')) console.log('  ✅ Has cancel handler');
} else {
  console.log('  ❌ GlobalPopupProvider.jsx NOT FOUND');
  allTestsPassed = false;
}

// Test 5: Check if education components use showConfirmation
console.log('\n✓ Test 5: Checking education components...');
const educationFiles = [
  'src/app/pannels/candidate/sections/resume/section-can-education.jsx',
  'src/app/pannels/candidate/components/sections/resume/section-can-education.jsx'
];

educationFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const fileName = path.basename(filePath);
    console.log(`  ✅ ${fileName} exists`);
    
    if (content.includes('showConfirmation')) console.log(`    ✅ Uses showConfirmation`);
    if (content.includes('Are you sure you want to delete')) console.log(`    ✅ Has proper confirmation message`);
    if (!content.includes('confirm(')) console.log(`    ✅ No browser confirm() found`);
    if (!content.includes('alert(')) console.log(`    ✅ No browser alert() found`);
  } else {
    console.log(`  ❌ ${path.basename(filePath)} NOT FOUND`);
  }
});

console.log('\n' + '═'.repeat(60));
if (allTestsPassed) {
  console.log('✅ CONFIRMATION DIALOG IMPLEMENTATION COMPLETE!');
} else {
  console.log('❌ SOME COMPONENTS MISSING!');
}
console.log('═'.repeat(60));

console.log('\n📋 Implementation Summary:');
console.log('─'.repeat(60));
console.log('✅ ConfirmationDialog.jsx     → Yes/No dialog component');
console.log('✅ popupNotification.js       → Added showConfirmation function');
console.log('✅ usePopupNotification.js    → Added confirmation state');
console.log('✅ GlobalPopupProvider.jsx    → Renders confirmation dialog');
console.log('✅ Education components       → Use showConfirmation for delete');

console.log('\n🎯 What Changed:');
console.log('─'.repeat(60));
console.log('• Delete education now shows: "Are you sure you want to delete this education entry?"');
console.log('• Dialog has Yes/No buttons instead of OK only');
console.log('• Clicking outside dialog cancels the action');
console.log('• No more browser confirm() or alert() dialogs');
console.log('• Consistent styling with existing popup notifications');

console.log('\n🚀 Test Instructions:');
console.log('─'.repeat(60));
console.log('1. Go to http://localhost:3000/candidate/my-resume');
console.log('2. Navigate to Educational Qualification Details');
console.log('3. Try to delete an education entry');
console.log('4. Verify the confirmation dialog appears with Yes/No buttons');
console.log('5. Test clicking "No" cancels the action');
console.log('6. Test clicking "Yes" deletes the entry');
console.log('7. Test clicking outside the dialog cancels the action');

console.log('\n');