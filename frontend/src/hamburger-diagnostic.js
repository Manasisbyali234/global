/* ============================================================================
   HAMBURGER MENU DIAGNOSTIC SCRIPT
   ============================================================================
   Add this script to your browser console to diagnose hamburger menu issues
   ============================================================================ */

(function() {
  console.log('🔍 HAMBURGER MENU DIAGNOSTIC STARTING...');
  
  // Find hamburger button
  const hamburgerBtn = document.querySelector('.hamburger-btn') || 
                      document.querySelector('button.hamburger-btn') ||
                      document.querySelector('[data-testid="hamburger-menu-button"]');
  
  if (!hamburgerBtn) {
    console.error('❌ HAMBURGER BUTTON NOT FOUND IN DOM');
    return;
  }
  
  console.log('✅ Hamburger button found:', hamburgerBtn);
  
  // Check computed styles
  const computedStyles = window.getComputedStyle(hamburgerBtn);
  
  console.log('📊 COMPUTED STYLES:');
  console.log('- Display:', computedStyles.display);
  console.log('- Visibility:', computedStyles.visibility);
  console.log('- Opacity:', computedStyles.opacity);
  console.log('- Z-Index:', computedStyles.zIndex);
  console.log('- Position:', computedStyles.position);
  console.log('- Width:', computedStyles.width);
  console.log('- Height:', computedStyles.height);
  console.log('- Background:', computedStyles.backgroundColor);
  console.log('- Border:', computedStyles.border);
  
  // Check inline styles
  console.log('🎨 INLINE STYLES:');
  console.log('- Style attribute:', hamburgerBtn.getAttribute('style'));
  
  // Check parent containers
  console.log('📦 PARENT CONTAINERS:');
  let parent = hamburgerBtn.parentElement;
  let level = 1;
  while (parent && level <= 5) {
    const parentStyles = window.getComputedStyle(parent);
    console.log(`- Level ${level} (${parent.className}):`, {
      display: parentStyles.display,
      overflow: parentStyles.overflow,
      zIndex: parentStyles.zIndex,
      position: parentStyles.position
    });
    parent = parent.parentElement;
    level++;
  }
  
  // Check device info
  console.log('📱 DEVICE INFO:');
  console.log('- User Agent:', navigator.userAgent);
  console.log('- Is iOS:', /iPad|iPhone|iPod/.test(navigator.userAgent));
  console.log('- Is Safari:', /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent));
  console.log('- Screen Width:', window.screen.width);
  console.log('- Window Width:', window.innerWidth);
  console.log('- Device Pixel Ratio:', window.devicePixelRatio);
  
  // Check media queries
  console.log('📺 MEDIA QUERY MATCHES:');
  console.log('- Max-width 1199px:', window.matchMedia('(max-width: 1199px)').matches);
  console.log('- Max-width 767px:', window.matchMedia('(max-width: 767px)').matches);
  console.log('- Max-width 480px:', window.matchMedia('(max-width: 480px)').matches);
  console.log('- iPhone media query:', window.matchMedia('only screen and (min-device-width: 375px) and (max-device-width: 932px) and (-webkit-min-device-pixel-ratio: 2)').matches);
  
  // Test click functionality
  console.log('🖱️ TESTING CLICK FUNCTIONALITY:');
  try {
    hamburgerBtn.click();
    console.log('✅ Click event triggered successfully');
  } catch (error) {
    console.error('❌ Click event failed:', error);
  }
  
  // Check for conflicting CSS
  console.log('⚠️ CHECKING FOR CONFLICTS:');
  const allStylesheets = Array.from(document.styleSheets);
  console.log('- Total stylesheets loaded:', allStylesheets.length);
  
  // Force visibility fix
  console.log('🔧 APPLYING EMERGENCY FIX:');
  hamburgerBtn.style.cssText = `
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    z-index: 2147483647 !important;
    position: relative !important;
    width: 40px !important;
    height: 40px !important;
    background-color: #ffffff !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 4px !important;
    color: #333333 !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    cursor: pointer !important;
  `;
  
  console.log('✅ Emergency fix applied. Check if hamburger is now visible.');
  console.log('🔍 DIAGNOSTIC COMPLETE');
})();

/* ============================================================================
   USAGE INSTRUCTIONS:
   1. Open your website on an iOS device
   2. Open Safari Developer Tools (if available) or use remote debugging
   3. Paste this entire script into the console and press Enter
   4. Check the console output for diagnostic information
   5. The script will also apply an emergency fix to make the hamburger visible
   ============================================================================ */