const PENDING_PAYMENT_KEY = 'pendingJobPayment';
const PENDING_PAYMENT_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export const pendingPaymentManager = {
  // Store pending payment state when initiating payment
  setPendingPayment: (jobId, orderId, orderData) => {
    const pendingPayment = {
      jobId,
      orderId,
      orderData,
      timestamp: Date.now(),
    };
    localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(pendingPayment));
  },

  // Retrieve pending payment if exists and not expired
  getPendingPayment: () => {
    const stored = localStorage.getItem(PENDING_PAYMENT_KEY);
    if (!stored) return null;

    try {
      const pendingPayment = JSON.parse(stored);
      const elapsedTime = Date.now() - pendingPayment.timestamp;

      // Check if payment is within timeout period
      if (elapsedTime > PENDING_PAYMENT_TIMEOUT) {
        localStorage.removeItem(PENDING_PAYMENT_KEY);
        return null;
      }

      return pendingPayment;
    } catch (error) {
      console.error('Error parsing pending payment:', error);
      localStorage.removeItem(PENDING_PAYMENT_KEY);
      return null;
    }
  },

  // Clear pending payment after successful payment or manual cancellation
  clearPendingPayment: () => {
    localStorage.removeItem(PENDING_PAYMENT_KEY);
  },

  // Get time remaining for pending payment to expire
  getTimeRemaining: () => {
    const pending = pendingPaymentManager.getPendingPayment();
    if (!pending) return null;

    const elapsedTime = Date.now() - pending.timestamp;
    const timeRemaining = PENDING_PAYMENT_TIMEOUT - elapsedTime;
    return Math.max(0, Math.ceil(timeRemaining / 1000)); // Return seconds
  },

  // Format time remaining for display
  formatTimeRemaining: (seconds) => {
    if (!seconds || seconds <= 0) return 'Expired';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s remaining`;
    } else {
      return `${secs}s remaining`;
    }
  },
};
