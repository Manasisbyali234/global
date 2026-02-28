const { cache } = require('../utils/cache');

// Clear all job-related cache
console.log('Clearing job cache...');

// Get all cache keys and clear job-related ones
const cacheKeys = cache.keys();
let clearedCount = 0;

cacheKeys.forEach(key => {
  if (key.includes('jobs_') || key.includes('job_') || key.includes('top_recruiters')) {
    cache.del(key);
    clearedCount++;
  }
});

console.log(`Cleared ${clearedCount} job cache entries`);
console.log('Cache cleared successfully!');

process.exit(0);
