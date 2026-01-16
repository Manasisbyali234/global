// Android Hamburger Menu Diagnostic Script
// Add this temporarily to help debug issues on Android devices

(function() {
  'use strict';
  
  console.log('=== ANDROID HAMBURGER DIAGNOSTIC START ===');
  
  // Detect Android
  const isAndroid = /Android/i.test(navigator.userAgent);
  const androidVersion = isAndroid ? navigator.userAgent.match(/Android (\d+(\.\d+)?)/)?.[1] : null;
  
  console.log('Device Info:', {
    userAgent: navigator.userAgent,
    isAndroid: isAndroid,
    androidVersion: androidVersion,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio
  });
  
  // Wait for DOM to be ready
  function checkHamburgerButton() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    
    if (hamburgerBtn) {
      const styles = window.getComputedStyle(hamburgerBtn);
      const rect = hamburgerBtn.getBoundingClientRect();
      
      console.log('Hamburger Button Found:', {
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        zIndex: styles.zIndex,
        position: styles.position,
        pointerEvents: styles.pointerEvents,
        width: styles.width,
        height: styles.height,
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        isVisible: rect.width > 0 && rect.height > 0,
        transform: styles.transform,
        backgroundColor: styles.backgroundColor,
        border: styles.border
      });
      
      // Check if button is clickable
      const isClickable = hamburgerBtn.offsetParent !== null;
      console.log('Button is clickable:', isClickable);
      
      // Check parent containers
      let parent = hamburgerBtn.parentElement;
      let level = 1;
      while (parent && level <= 5) {
        const parentStyles = window.getComputedStyle(parent);
        console.log(`Parent Level ${level} (${parent.className}):`, {
          display: parentStyles.display,
          overflow: parentStyles.overflow,
          position: parentStyles.position,
          zIndex: parentStyles.zIndex
        });
        parent = parent.parentElement;
        level++;
      }
      
      // Add click listener for testing
      hamburgerBtn.addEventListener('click', function(e) {
        console.log('Hamburger button clicked!', {
          timestamp: new Date().toISOString(),
          target: e.target,
          currentTarget: e.currentTarget
        });
      });
      
    } else {
      console.error('Hamburger button NOT found in DOM!');
      console.log('Available buttons:', document.querySelectorAll('button'));
    }
  }
  
  // Check hamburger menu panel
  function checkHamburgerMenu() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    
    if (hamburgerMenu) {
      const styles = window.getComputedStyle(hamburgerMenu);
      const rect = hamburgerMenu.getBoundingClientRect();
      
      console.log('Hamburger Menu Panel:', {
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        zIndex: styles.zIndex,
        position: styles.position,
        transform: styles.transform,
        width: styles.width,
        height: styles.height,
        top: rect.top,
        right: rect.right,
        hasOpenClass: hamburgerMenu.classList.contains('open')
      });
    } else {
      console.error('Hamburger menu panel NOT found in DOM!');
    }
  }
  
  // Check overlay
  function checkOverlay() {
    const overlay = document.querySelector('.hamburger-overlay');
    
    if (overlay) {
      const styles = window.getComputedStyle(overlay);
      console.log('Hamburger Overlay:', {
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        zIndex: styles.zIndex,
        hasShowClass: overlay.classList.contains('show')
      });
    } else {
      console.log('Hamburger overlay not found (may be normal if menu is closed)');
    }
  }
  
  // Run diagnostics
  function runDiagnostics() {
    console.log('\n--- Running Diagnostics ---');
    checkHamburgerButton();
    checkHamburgerMenu();
    checkOverlay();
    console.log('=== ANDROID HAMBURGER DIAGNOSTIC END ===\n');
  }
  
  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDiagnostics);
  } else {
    runDiagnostics();
  }
  
  // Also run after a delay to catch dynamic content
  setTimeout(runDiagnostics, 2000);
  
  // Monitor for menu state changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && 
          (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
        const target = mutation.target;
        if (target.classList.contains('hamburger-menu') || 
            target.classList.contains('hamburger-btn') ||
            target.classList.contains('hamburger-overlay')) {
          console.log('Menu state changed:', {
            element: target.className,
            classList: Array.from(target.classList)
          });
        }
      }
    });
  });
  
  // Start observing after DOM is ready
  setTimeout(() => {
    const elementsToObserve = document.querySelectorAll('.hamburger-menu, .hamburger-btn, .hamburger-overlay');
    elementsToObserve.forEach(el => {
      observer.observe(el, { attributes: true, attributeFilter: ['class', 'style'] });
    });
  }, 1000);
  
})();
