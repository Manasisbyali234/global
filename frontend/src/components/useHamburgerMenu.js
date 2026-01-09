import { useState, useCallback, useEffect } from 'react';

export function useHamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      const newState = !prev;
      console.log('Hamburger menu toggle:', newState);
      if (newState) {
        document.body.classList.add('hamburger-open');
      } else {
        document.body.classList.remove('hamburger-open');
      }
      return newState;
    });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.classList.remove('hamburger-open');
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    document.body.classList.add('hamburger-open');
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('hamburger-open');
    };
  }, []);

  return {
    isOpen,
    toggle,
    close,
    open
  };
}