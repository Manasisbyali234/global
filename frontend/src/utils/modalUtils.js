// Modal utility functions for Bootstrap modal management

// Clean up any existing modal backdrops
const cleanupBackdrops = () => {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
};

// Remove modal-open class from body if no modals are open
const cleanupBodyClass = () => {
    const openModals = document.querySelectorAll('.modal.show');
    if (openModals.length === 0) {
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
    }
};

export const initializeModal = (modalElement) => {
    if (!modalElement) return null;
    
    try {
        // Check if Bootstrap is available
        if (typeof window !== 'undefined' && window.bootstrap && window.bootstrap.Modal) {
            return new window.bootstrap.Modal(modalElement, {
                backdrop: true,
                keyboard: true,
                focus: true
            });
        } else if (typeof window !== 'undefined' && window.$ && window.$.fn.modal) {
            // Fallback to jQuery Bootstrap if available
            return window.$(modalElement);
        }
    } catch (error) {
        
    }
    
    return null;
};

export const showModal = (modalId) => {
    try {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            
            return;
        }

        // Clean up any existing backdrops first
        cleanupBackdrops();
        cleanupBodyClass();

        // Small delay to ensure cleanup is complete
        setTimeout(() => {
            // Use jQuery if available (more reliable with existing Bootstrap setup)
            if (window.$ && window.$.fn.modal) {
                window.$(modalElement).modal({
                    backdrop: true,
                    keyboard: true,
                    focus: true,
                    show: true
                });
                return;
            }

            // Fallback to Bootstrap 5 if jQuery not available
            if (window.bootstrap && window.bootstrap.Modal) {
                let modal = window.bootstrap.Modal.getInstance(modalElement);
                if (!modal) {
                    modal = new window.bootstrap.Modal(modalElement, {
                        backdrop: true,
                        keyboard: true,
                        focus: true
                    });
                }
                modal.show();
            }
        }, 50);
    } catch (error) {
        
    }
};

export const hideModal = (modalId) => {
    try {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;

        if (window.$ && window.$.fn.modal) {
            window.$(modalElement).modal('hide');
        } else if (window.bootstrap && window.bootstrap.Modal) {
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        
        // Clean up after hiding
        setTimeout(() => {
            cleanupBackdrops();
            cleanupBodyClass();
        }, 300);
    } catch (error) {
        
    }
};

// Force initialize all modals on page load
export const initializeAllModals = () => {
    try {
        // Clean up first
        cleanupBackdrops();
        cleanupBodyClass();
        
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            // Only initialize if not already initialized
            if (window.bootstrap && window.bootstrap.Modal && !window.bootstrap.Modal.getInstance(modal)) {
                new window.bootstrap.Modal(modal, {
                    backdrop: true,
                    keyboard: true,
                    focus: true
                });
            }
        });
    } catch (error) {
        
    }
};
