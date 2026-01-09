// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.json to capture response time
  const originalJson = res.json;
  res.json = function(data) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Log slow queries (> 1000ms)
    if (responseTime > 1000) {
      console.warn(`🐌 Slow API call: ${req.method} ${req.originalUrl} - ${responseTime}ms`);
    } else if (responseTime > 500) {
      console.log(`⚠️  Moderate API call: ${req.method} ${req.originalUrl} - ${responseTime}ms`);
    } else {
      console.log(`✅ Fast API call: ${req.method} ${req.originalUrl} - ${responseTime}ms`);
    }
    
    // Add performance headers
    res.set('X-Response-Time', `${responseTime}ms`);
    res.set('X-Timestamp', new Date().toISOString());
    
    // Call original json method
    originalJson.call(this, data);
  };
  
  next();
};

module.exports = performanceMiddleware;