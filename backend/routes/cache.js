const express = require('express');
const router = express.Router();
const { cacheInvalidation } = require('../utils/cacheInvalidation');
const { auth } = require('../middlewares/auth');

// Clear all job caches (admin only)
router.post('/clear-jobs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'employer') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    cacheInvalidation.clearJobCaches();
    
    res.json({ 
      success: true, 
      message: 'Job caches cleared successfully',
      stats: cacheInvalidation.getCacheStats()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear all caches (admin only)
router.post('/clear-all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    cacheInvalidation.clearAllCaches();
    
    res.json({ 
      success: true, 
      message: 'All caches cleared successfully',
      stats: cacheInvalidation.getCacheStats()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get cache statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = cacheInvalidation.getCacheStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;