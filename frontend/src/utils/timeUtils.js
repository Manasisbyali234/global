/**
 * Utility functions for handling time and India timezone display
 */

import { buildUtcDateTimeFromIst, formatTimeInIst } from "./timezoneUtils";

/**
 * Format time string to India time
 * @param {string} timeString - Time in HH:MM format
 * @param {Date} date - Optional date to combine with time
 * @returns {string} Formatted time in IST
 */
export const formatTimeToLocal = (timeString, date = null) => {
  if (!timeString) return 'Not set';
  
  try {
    const dateObj = buildUtcDateTimeFromIst(date || new Date(), timeString, 'start');
    if (!dateObj) return timeString;

    return formatTimeInIst(dateObj, 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) || timeString;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

/**
 * Format datetime to India date and time
 * @param {Date|string} datetime - Date object or ISO string
 * @returns {object} Object with formatted date and time
 */
export const formatDateTimeToLocal = (datetime) => {
  if (!datetime) return { date: null, time: null };
  
  try {
    const dateObj = new Date(datetime);
    if (Number.isNaN(dateObj.getTime())) {
      return { date: null, time: null };
    }

    const date = dateObj.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const time = formatTimeInIst(dateObj, 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return {
      date,
      time,
      full: time ? `${date} ${time}` : date
    };
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return { date: null, time: null };
  }
};

/**
 * Get timezone offset string
 * @returns {string} Timezone label
 */
export const getTimezoneOffset = () => {
  return 'IST (GMT+5:30)';
};

/**
 * Convert time string with date to India timezone display
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
