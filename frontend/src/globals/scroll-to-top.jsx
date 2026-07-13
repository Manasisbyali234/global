import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyDefaultSkinStyle } from "./constants";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {

    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });

    applyDefaultSkinStyle();

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', { page_path: pathname });
    }

  }, [pathname]);
  
  return null;
};

export default ScrollToTop;
