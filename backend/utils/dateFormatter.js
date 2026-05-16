/**
 * Date formatting utility for backend
 * Ensures consistent DD/MM/YYYY format across the application
 */

const { formatDateInIst, formatDateTimeInIst } = require('./dateTime');

/**
 * Format date to DD/MM/YYYY
 * @param {Date|string} dateInput - Date object or date string
 * @returns {string} Formatted date string in DD/MM/YYYY format
 */
const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  try {
    return formatDateInIst(dateInput, 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) || 'Invalid Date';
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format date and time to DD/MM/YYYY HH:MM
 * @param {Date|string} dateInput - Date object or date string
 * @returns {string} Formatted datetime string
 */
const formatDateTime = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  try {
    const formatted = formatDateTimeInIst(dateInput, 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return formatted ? formatted.replace(',', '') : 'Invalid Date';
  } catch (error) {
    return 'Invalid Date';
  }
};

module.exports = {
  formatDate,
  formatDateTime
};
