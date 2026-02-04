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
// GLOBAL Z-INDEX FIX - Comprehensive fix for all stacking issues
import "./global-zindex-fix.css";
// iOS HAMBURGER ULTIMATE PRODUCTION FIX - Final solution for iPhone visibility issues
import "./iphone-hamburger-ultimate-production-fix.css";
// ANDROID HAMBURGER FIX - Addresses visibility issues on Android mobile browsers
import "./android-hamburger-fix.css";
// POPUP SCROLL FIX - Ensures whole modal scrolls naturally
import "./popup-scroll-fix.css";
// ANDROID TEXT OVERFLOW FIX - Prevents text from overflowing cards on Android devices
import "./android-text-overflow-fix.css";
// CONDITION BADGE MOBILE FIX - Fixes condition badge text overflow on mobile screens
import "./condition-badge-mobile-fix.css";
// GLOBAL TABLE RESPONSIVE FIX - Ensures all tables fit container with horizontal scroll
import "./table-overflow-fix.css";
// GIF ALIGNMENT REVERT - Fixes alignment issues caused by adding GIF logos
import "./gif-alignment-revert.css";
// HERO SECTION REVERT - Reverts Hero section layout to original appearance
import "./hero-section-revert.css";


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
