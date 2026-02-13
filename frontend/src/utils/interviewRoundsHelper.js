/**
 * Interview Rounds Helper Utilities
 * Provides conversion functions between old and new interview rounds formats
 */

/**
 * Convert old interviewRoundDetails format to new interviewRounds array
 * @param {Object} interviewRoundDetails - Old format object
 * @returns {Array} New format array
 */
export const convertToInterviewRounds = (interviewRoundDetails) => {
  if (!interviewRoundDetails || typeof interviewRoundDetails !== 'object') {
    return [];
  }

  return Object.entries(interviewRoundDetails).map(([key, value]) => ({
    id: key,
    name: key.replace(/_\d+$/, ''),
    date: value.fromDate || value.date || null,
    startTime: value.startTime || value.time || '',
    endTime: value.endTime || ''
  }));
};

/**
 * Convert new interviewRounds array to old interviewRoundDetails format
 * @param {Array} interviewRounds - New format array
 * @returns {Object} Old format object
 */
export const convertToInterviewRoundDetails = (interviewRounds) => {
  if (!Array.isArray(interviewRounds)) {
    return {};
  }

  const details = {};
  interviewRounds.forEach(round => {
    details[round.id] = {
      description: round.description || '',
      fromDate: round.date,
      toDate: round.date,
      startTime: round.startTime,
      endTime: round.endTime,
      time: round.startTime
    };
  });
  return details;
};

/**
 * Find a specific round by ID
 * @param {Array} interviewRounds - Interview rounds array
 * @param {String} roundId - Round ID to find
 * @returns {Object|null} Round object or null
 */
export const findRoundById = (interviewRounds, roundId) => {
  if (!Array.isArray(interviewRounds)) {
    return null;
  }
  return interviewRounds.find(round => round.id === roundId) || null;
};

/**
 * Find a specific round by name
 * @param {Array} interviewRounds - Interview rounds array
 * @param {String} roundName - Round name to find
 * @returns {Object|null} Round object or null
 */
export const findRoundByName = (interviewRounds, roundName) => {
  if (!Array.isArray(interviewRounds)) {
    return null;
  }
  return interviewRounds.find(round => round.name === roundName) || null;
};

/**
 * Get all rounds sorted by date
 * @param {Array} interviewRounds - Interview rounds array
 * @returns {Array} Sorted rounds array
 */
export const getSortedRounds = (interviewRounds) => {
  if (!Array.isArray(interviewRounds)) {
    return [];
  }
  return [...interviewRounds].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });
};

/**
 * Check if job has interview rounds scheduled
 * @param {Object} job - Job object
 * @returns {Boolean} True if rounds are scheduled
 */
export const hasScheduledRounds = (job) => {
  if (!job) return false;
  
  // Check new format
  if (Array.isArray(job.interviewRounds) && job.interviewRounds.length > 0) {
    return true;
  }
  
  // Check old format for backward compatibility
  if (job.interviewRoundDetails && typeof job.interviewRoundDetails === 'object') {
    return Object.keys(job.interviewRoundDetails).length > 0;
  }
  
  return false;
};

/**
 * Get interview rounds in new format (handles both old and new formats)
 * @param {Object} job - Job object
 * @returns {Array} Interview rounds array
 */
export const getInterviewRounds = (job) => {
  if (!job) return [];
  
  // If new format exists, use it
  if (Array.isArray(job.interviewRounds)) {
    return job.interviewRounds;
  }
  
  // Convert from old format if exists
  if (job.interviewRoundDetails && typeof job.interviewRoundDetails === 'object') {
    return convertToInterviewRounds(job.interviewRoundDetails);
  }
  
  return [];
};
