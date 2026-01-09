/**
 * Utility functions for handling time and timezone conversions
 */

/**
 * Format time string to local time
 * @param {string} timeString - Time in HH:MM format
 * @param {Date} date - Optional date to combine with time
 * @returns {string} Formatted time in local timezone
 */
export const formatTimeToLocal = (timeString, date = null) => {
  if (!timeString) return 'Not set';
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Use provided date or create new date object
    const dateObj = date ? new Date(date) : new Date();
    dateObj.setHours(hours, minutes, 0, 0);
    
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

/**
 * Format datetime to local date and time
 * @param {Date|string} datetime - Date object or ISO string
 * @returns {object} Object with formatted date and time
 */
export const formatDateTimeToLocal = (datetime) => {
  if (!datetime) return { date: null, time: null };
  
  try {
    const dateObj = new Date(datetime);
    
    return {
      date: dateObj.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      time: dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      full: dateObj.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return { date: null, time: null };
  }
};

/**
 * Get timezone offset string
 * @returns {string} Timezone offset (e.g., "GMT+5:30")
 */
export const getTimezoneOffset = () => {
  const offset = -new Date().getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset >= 0 ? '+' : '-';
  
  return `GMT${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Convert time string with date to local timezone display
 * @param {string} timeString - Time in HH:MM format
 * @param {Date|string} date - Date to combine with time
 * @returns {string} Formatted time with timezone info
 */
export const formatInterviewTime = (timeString, date = null) => {
  if (!timeString) return 'Not set';
  
  const localTime = formatTimeToLocal(timeString, date);
  const timezone = getTimezoneOffset();
  
  return `${localTime} (${timezone})`;
};
