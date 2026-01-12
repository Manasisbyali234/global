import RootLayout from "./layouts/root-layout";
import Loader from "./app/common/loader";
import ScrollToTop from "./globals/scroll-to-top";
import { AuthProvider } from "./contexts/AuthContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import GlobalPopupProvider from "./components/GlobalPopupProvider";
import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import forceLightMode from "./utils/forceLightMode";
// CONSOLIDATED MASTER STYLES - All CSS in one file to eliminate cascade conflicts
import "./consolidated-master-styles.css";
import "./home-job-cards.css";
// CARD STYLES PRESERVATION - Ensures card styles remain intact after hosting
import "./card-styles-preserve.css";
// REMOVE BUTTON HOVER EFFECTS - No color changes on hover
import "./remove-button-hover-effects.css";
// REMOVE RESUME CARD HOVER EFFECTS - No hover effects on resume page cards
import "./remove-resume-card-hover.css";
// TAB ICON FIX - Remove orange color from tab icons
import "./tab-icon-fix.css";
// SCROLL LOCK STYLES - Disable background scrolling when modals are open
import "./styles/scroll-lock.css";
// CANDIDATE HEADER MOBILE FIX - Fix header display on mobile screens
import "./candidate-header-mobile-fix.css";
// ENHANCED MOBILE RESPONSIVE - Comprehensive mobile fixes for all pages
import "./mobile-responsive-enhancements.css";
// MOBILE RESPONSIVE FIXES - Targeted fixes for specific alignment issues
import "./mobile-responsive-fixes.css";
// BADGE TEXT ORANGE - Make all status badge texts orange
import "./badge-text-orange.css";
// HEADER Z-INDEX FIX - Fix header appearing above popup notifications
import "./header-zindex-fix.css";
// POPUP HEADER FIX - Additional popup header z-index fixes
import "./popup-header-fix.css";
// iOS HAMBURGER VISIBILITY FIX - Fix hamburger menu on iPhone after hosting
import "./ios-hamburger-visibility-fix.css";
// CRITICAL iOS HAMBURGER FIX - Maximum specificity override for production
import "./ios-hamburger-critical-fix.css";
// PRODUCTION HAMBURGER FIX - Server-side rendering and hosting platform fixes
import "./production-hamburger-fix.css";
// ULTIMATE iOS HAMBURGER FIX - Final solution with maximum specificity
import "./ios-hamburger-ultimate-fix.css";
// CRITICAL OVERRIDE - Must be loaded LAST to ensure hamburger visibility
import "./ios-hamburger-critical-override.css";


function App() {

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // Force light mode immediately
    const cleanup = forceLightMode();
    
    AOS.init({
      duration: 300,
      once: true,
      offset: 50,
    });
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 50);
    
    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, []);

  return (
    <AuthProvider>
      <WebSocketProvider>
        <GlobalPopupProvider>
          {isLoading && <Loader />}
          <ScrollToTop />
          <RootLayout />
        </GlobalPopupProvider>
      </WebSocketProvider>
    </AuthProvider>
  )
}

export default App;
