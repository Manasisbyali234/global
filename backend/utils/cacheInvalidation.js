const { cache } = require('./cache');

class CacheInvalidation {
  constructor() {
    this.cache = cache;
  }

  // Clear all job-related caches
  clearJobCaches() {
    // Get all cache keys
    const keys = Array.from(this.cache.cache.keys());
    
    // Clear job-related caches including candidate applications
    const jobRelatedPatterns = [
      'jobs_',
      'job_',
      'employers_',
      'recruiters_',
      '/api/candidate/applications',
      'applications'
    ];
    
    keys.forEach(key => {
      if (jobRelatedPatterns.some(pattern => key.includes(pattern))) {
        this.cache.delete(key);
      }
    });
    
    console.log(`Cleared ${keys.length} job-related cache entries`);
  }

  // Clear specific job cache
  clearJobCache(jobId) {
    const keys = Array.from(this.cache.cache.keys());
    keys.forEach(key => {
      if (key.includes(`job_${jobId}`)) {
        this.cache.delete(key);
      }
    });
  }

  // Clear candidate application caches
  clearCandidateApplicationCaches() {
    const keys = Array.from(this.cache.cache.keys());
    keys.forEach(key => {
      if (key.includes('/api/candidate/applications') || key.includes('applications/interviews')) {
        this.cache.delete(key);
      }
    });
    console.log('Cleared candidate application caches');
  }

  // Clear employer-specific caches
  clearEmployerCaches(employerId) {
    const keys = Array.from(this.cache.cache.keys());
    
    // Clear all employer-related caches
    const employerPatterns = [
      'employers_',
      'recruiters_',
      'employer_',
      employerId ? `employerId=${employerId}` : null,
      employerId ? `employer_${employerId}` : null
    ].filter(Boolean);
    
    keys.forEach(key => {
      if (employerPatterns.some(pattern => key.includes(pattern))) {
        this.cache.delete(key);
      }
    });
    
    console.log(`Cleared employer caches for ${employerId || 'all employers'}`);
  }

  // Clear all employer grid caches (when any profile is updated)
  clearEmployerGridCaches() {
    const keys = Array.from(this.cache.cache.keys());
    keys.forEach(key => {
      if (key.includes('employers_') || key.includes('recruiters_')) {
        this.cache.delete(key);
      }
    });
    console.log('Cleared all employer grid caches');
  }

  // Clear all caches (nuclear option)
  clearAllCaches() {
    this.cache.clear();
    console.log('All caches cleared');
  }

  // Get cache statistics
  getCacheStats() {
    return {
      totalEntries: this.cache.cache.size,
      ttlEntries: this.cache.ttl.size
    };
  }
}

const cacheInvalidation = new CacheInvalidation();

module.exports = { cacheInvalidation };