/**
 * Utility function to normalize time format to HH:MM (24-hour)
 * Supports various inputs: 24h (HH:MM), AM/PM (2:30 PM, 02:30PM, etc.)
 */
const normalizeTimeFormat = (timeStr) => {
  if (!timeStr) return timeStr;
  
  // Clean the string
  timeStr = timeStr.trim();
  
  // If already HH:MM (24h)
  const time24Regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (time24Regex.test(timeStr)) {
    // Ensure HH format (pad with 0)
    const [h, m] = timeStr.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }
  
  // Check for AM/PM format (e.g., "02:30 PM", "2:30 PM", "2:30PM")
  const ampmRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
  const match = timeStr.match(ampmRegex);
  
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  return timeStr; // Return as is if no match, validation will catch it
};

/**
 * Utility function to format 24-hour time string (HH:MM) to AM/PM format (H:MM AM/PM)
 */
const formatTimeToAMPM = (timeStr) => {
  if (!timeStr) return '';
  
  // If it's already in AM/PM format, return as is (but maybe cleaned)
  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
    return timeStr.trim();
  }

  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0]);
  const minutes = parts[1].substring(0, 2);

  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${hours}:${minutes} ${ampm}`;
};

module.exports = {
  normalizeTimeFormat,
  formatTimeToAMPM
};
