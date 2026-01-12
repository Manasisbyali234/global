// iPhone Hamburger Menu Diagnostic Script
// Add this to your browser console on iPhone to debug hamburger menu issues

console.log('🔍 iPhone Hamburger Menu Diagnostic Starting...');

function diagnoseHamburgerMenu() {
  const results = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    hamburgerButton: null,
    hamburgerMenu: null,
    issues: [],
    fixes: []
  };

  // Find hamburger button
  const hamburgerBtn = document.querySelector('.hamburger-btn') || 
                      document.querySelector('button.hamburger-btn') ||
                      document.querySelector('[class*="hamburger"]');
  
  if (hamburgerBtn) {
    const styles = window.getComputedStyle(hamburgerBtn);
    results.hamburgerButton = {
      found: true,
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity,
      zIndex: styles.zIndex,
      position: styles.position,
      width: styles.width,
      height: styles.height,
      backgroundColor: styles.backgroundColor,
      border: styles.border,
      pointerEvents: styles.pointerEvents
    };

    // Check for common issues
    if (styles.display === 'none') {
      results.issues.push('Hamburger button has display: none');
      results.fixes.push('Add CSS: .hamburger-btn { display: flex !important; }');
    }
    
    if (styles.visibility === 'hidden') {
      results.issues.push('Hamburger button has visibility: hidden');
      results.fixes.push('Add CSS: .hamburger-btn { visibility: visible !important; }');
    }
    
    if (parseFloat(styles.opacity) < 1) {
      results.issues.push('Hamburger button has low opacity');
      results.fixes.push('Add CSS: .hamburger-btn { opacity: 1 !important; }');
    }
    
    if (styles.pointerEvents === 'none') {
      results.issues.push('Hamburger button has pointer-events: none');
      results.fixes.push('Add CSS: .hamburger-btn { pointer-events: auto !important; }');
    }

    // Check z-index conflicts
    const zIndex = parseInt(styles.zIndex);
    if (isNaN(zIndex) || zIndex < 1000) {
      results.issues.push('Hamburger button has low or no z-index');
      results.fixes.push('Add CSS: .hamburger-btn { z-index: 2147483647 !important; }');
    }

  } else {
    results.hamburgerButton = { found: false };
    results.issues.push('Hamburger button not found in DOM');
    results.fixes.push('Check if HamburgerMenu component is properly rendered');
  }

  // Find hamburger menu
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  if (hamburgerMenu) {
    const menuStyles = window.getComputedStyle(hamburgerMenu);
    results.hamburgerMenu = {
      found: true,
      display: menuStyles.display,
      visibility: menuStyles.visibility,
      opacity: menuStyles.opacity,
      zIndex: menuStyles.zIndex,
      transform: menuStyles.transform
    };
  } else {
    results.hamburgerMenu = { found: false };
  }

  // Check for conflicting CSS
  const allStylesheets = Array.from(document.styleSheets);
  const conflictingRules = [];
  
  allStylesheets.forEach((sheet, index) => {
    try {
      const rules = Array.from(sheet.cssRules || sheet.rules || []);
      rules.forEach(rule => {
        if (rule.selectorText && rule.selectorText.includes('hamburger')) {
          if (rule.style.display === 'none' || 
              rule.style.visibility === 'hidden' || 
              rule.style.opacity === '0') {
            conflictingRules.push({
              stylesheet: index,
              selector: rule.selectorText,
              problematicStyle: rule.cssText
            });
          }
        }
      });
    } catch (e) {
      // Cross-origin stylesheet, skip
    }
  });

  if (conflictingRules.length > 0) {
    results.issues.push('Found conflicting CSS rules');
    results.conflictingRules = conflictingRules;
  }

  // Test hamburger button click
  if (hamburgerBtn) {
    try {
      const rect = hamburgerBtn.getBoundingClientRect();
      results.hamburgerButton.boundingRect = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0
      };
      
      if (rect.width === 0 || rect.height === 0) {
        results.issues.push('Hamburger button has zero dimensions');
        results.fixes.push('Add CSS: .hamburger-btn { width: 40px !important; height: 40px !important; }');
      }
    } catch (e) {
      results.issues.push('Error getting hamburger button dimensions: ' + e.message);
    }
  }

  return results;
}

// Run diagnostic
const diagnostic = diagnoseHamburgerMenu();

console.log('📊 Diagnostic Results:', diagnostic);

if (diagnostic.issues.length === 0) {
  console.log('✅ No issues found! Hamburger menu should be working correctly.');
} else {
  console.log('❌ Issues found:');
  diagnostic.issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
  
  console.log('🔧 Suggested fixes:');
  diagnostic.fixes.forEach((fix, index) => {
    console.log(`${index + 1}. ${fix}`);
  });
}

// Quick fix function
window.fixHamburgerMenu = function() {
  console.log('🔧 Applying quick fixes...');
  
  const style = document.createElement('style');
  style.textContent = `
    .hamburger-btn {
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      z-index: 2147483647 !important;
      position: relative !important;
      width: 40px !important;
      height: 40px !important;
      background: #fff !important;
      border: 1px solid #e0e0e0 !important;
      border-radius: 4px !important;
      color: #333 !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
      cursor: pointer !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log('✅ Quick fixes applied! Try clicking the hamburger menu now.');
};

console.log('💡 Run fixHamburgerMenu() to apply quick fixes if issues are found.');

// Export for use in production debugging
window.hamburgerDiagnostic = diagnoseHamburgerMenu;