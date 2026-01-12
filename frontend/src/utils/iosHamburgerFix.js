/**
 * iOS Hamburger Menu Visibility Utility
 * Ensures hamburger menu is always visible on iOS devices
 * This runs as a fallback if CSS fails to load or gets overridden
 */

class iOSHamburgerFix {
  constructor() {
    this.isIOS = this.detectIOS();
    this.init();
  }

  detectIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  init() {
    if (this.isIOS) {
      // Run immediately
      this.forceHamburgerVisibility();
      
      // Run after DOM is loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.forceHamburgerVisibility();
        });
      }
      
      // Run after all resources are loaded
      window.addEventListener('load', () => {
        this.forceHamburgerVisibility();
      });
      
      // Monitor for dynamic content changes
      this.observeChanges();
      
      // Set up periodic checks
      this.startPeriodicCheck();
    }
  }

  forceHamburgerVisibility() {
    const hamburgerButtons = document.querySelectorAll('.hamburger-btn, button.hamburger-btn');
    
    hamburgerButtons.forEach(button => {
      if (button) {
        // Force inline styles
        button.style.display = 'flex';
        button.style.visibility = 'visible';
        button.style.opacity = '1';
        button.style.zIndex = '99999';
        button.style.position = 'relative';
        button.style.width = '40px';
        button.style.height = '40px';
        button.style.background = '#fff';
        button.style.border = '1px solid #e0e0e0';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.color = '#333';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.padding = '0';
        button.style.fontSize = '20px';
        button.style.webkitAppearance = 'none';
        button.style.webkitTapHighlightColor = 'transparent';
        button.style.webkitTransform = 'translateZ(0)';
        button.style.transform = 'translateZ(0)';
        button.style.willChange = 'transform';
        
        // Add iOS-specific attributes
        button.setAttribute('data-ios-fixed', 'true');
        button.setAttribute('aria-label', 'Toggle navigation menu');
        button.setAttribute('type', 'button');
        
        // Ensure parent containers don't hide it
        let parent = button.parentElement;
        while (parent && parent !== document.body) {
          if (parent.classList.contains('extra-cell') || 
              parent.classList.contains('extra-nav') || 
              parent.classList.contains('header-2-nav')) {
            parent.style.overflow = 'visible';
            parent.style.zIndex = 'auto';
            if (parent.classList.contains('extra-cell')) {
              parent.style.display = 'flex';
              parent.style.alignItems = 'center';
              parent.style.zIndex = '99999';
            }
          }
          parent = parent.parentElement;
        }
      }
    });
    
    // Force mobile breakpoint behavior
    if (window.innerWidth <= 1199) {
      const desktopNav = document.querySelector('.header-nav.navbar-collapse');
      if (desktopNav) {
        desktopNav.style.display = 'none';
      }
      
      hamburgerButtons.forEach(button => {
        if (button) {
          button.style.display = 'flex';
        }
      });
    }
  }

  observeChanges() {
    // Use MutationObserver to watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || 
            mutation.type === 'attributes' && 
            (mutation.attributeName === 'style' || 
             mutation.attributeName === 'class')) {
          shouldCheck = true;
        }
      });
      
      if (shouldCheck) {
        setTimeout(() => {
          this.forceHamburgerVisibility();
        }, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  startPeriodicCheck() {
    // Check every 2 seconds to ensure hamburger stays visible
    setInterval(() => {
      this.forceHamburgerVisibility();
    }, 2000);
    
    // Also check on resize
    window.addEventListener('resize', () => {
      setTimeout(() => {
        this.forceHamburgerVisibility();
      }, 100);
    });
    
    // Check on orientation change (iOS specific)
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.forceHamburgerVisibility();
      }, 300);
    });
  }

  // Public method to manually trigger fix
  fix() {
    this.forceHamburgerVisibility();
  }
}

// Initialize the fix
const iosHamburgerFix = new iOSHamburgerFix();

// Export for manual use if needed
window.iosHamburgerFix = iosHamburgerFix;

export default iosHamburgerFix;