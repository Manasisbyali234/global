// Utility functions to control body scroll
export const disableBodyScroll = () => {
  // Store current scroll position
  const scrollY = window.scrollY;
  document.body.style.top = `-${scrollY}px`;
  document.body.classList.add('scroll-locked');
};

export const enableBodyScroll = () => {
  const scrollY = document.body.style.top;
  document.body.classList.remove('scroll-locked');
  document.body.style.top = '';
  // Restore scroll position
  if (scrollY) {
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }
};

// Hook for managing scroll state in components
export const useScrollLock = () => {
  const lockScroll = () => disableBodyScroll();
  const unlockScroll = () => enableBodyScroll();
  
  return { lockScroll, unlockScroll };
};