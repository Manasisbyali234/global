/**
 * Modal Fix Script
 * Fixes modal backdrop issues and ensures proper modal behavior
 */

(function() {
  'use strict';

  // Remove modal backdrop on page load
  document.addEventListener('DOMContentLoaded', function() {
    // Remove any existing backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    // Fix body padding when modal closes
    document.body.style.paddingRight = '';
    document.body.classList.remove('modal-open');
  });

  // Monitor for modal events
  document.addEventListener('show.bs.modal', function() {
    // Remove backdrop when modal shows
    setTimeout(() => {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
    }, 10);
  });

  document.addEventListener('hidden.bs.modal', function() {
    // Clean up after modal closes
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    document.body.style.paddingRight = '';
    document.body.classList.remove('modal-open');
  });

})();
