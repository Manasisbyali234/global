/**
 * Utility function to format dates consistently across the application
 * Format: DD/MM/YYYY
 */
import { formatDateInIst, formatDateTimeInIst } from "./timezoneUtils";

export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
        return formatDateInIst(dateString, 'en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) || 'Invalid Date';
    } catch (error) {
        return 'Invalid Date';
    }
};

// Alias for consistency
export const toLocaleDateString = formatDate;

export const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
        const formatted = formatDateTimeInIst(dateString, 'en-GB', {
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

/**
 * Utility function to format time strings to AM/PM format
 * Supports HH:MM (24-hour) and returns H:MM AM/PM
 */
export const formatTimeToAMPM = (timeString) => {
    if (!timeString) return '';
    
    try {
        // If it's already in AM/PM format (e.g., "02:30 PM" or "2:30 PM"), return as is
        if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
            return timeString;
        }

        // Handle HH:MM format
        const parts = timeString.split(':');
        if (parts.length < 2) return timeString;

        let hours = parseInt(parts[0]);
        const minutes = parts[1].substring(0, 2); // Get just the minutes part

        if (isNaN(hours)) return timeString;

        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        
        return `${hours}:${minutes} ${ampm}`;
    } catch (error) {
        return timeString;
    }
};
