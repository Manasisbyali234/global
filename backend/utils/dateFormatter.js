/**
 * Date formatting utility for backend
 * Ensures consistent DD/MM/YYYY format across the application
 */

/**
 * Format date to DD/MM/YYYY
 * @param {Date|string} dateInput - Date object or date string
 * @returns {string} Formatted date string in DD/MM/YYYY format
 */
const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
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
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return 'Invalid Date';
  }
};

module.exports = {
  formatDate,
  formatDateTime
};
