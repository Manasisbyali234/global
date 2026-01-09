// Performance monitoring utility for job-grid and emp-grid pages
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
  }

  // Start timing a specific operation
  startTiming(key) {
    this.metrics.set(key, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  // End timing and calculate duration
  endTiming(key) {
    const metric = this.metrics.get(key);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      return metric.duration;
    }
    return null;
  }

  // Get timing for a specific key
  getTiming(key) {
    const metric = this.metrics.get(key);
    return metric ? metric.duration : null;
  }

  // Monitor API response times
  monitorAPICall(url, startTime) {
    const duration = performance.now() - startTime;
    const key = `api_${url.split('?')[0].split('/').pop()}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, { calls: [], average: 0 });
    }
    
    const apiMetric = this.metrics.get(key);
    apiMetric.calls.push(duration);
    
    // Keep only last 10 calls for average calculation
    if (apiMetric.calls.length > 10) {
      apiMetric.calls.shift();
    }
    
    apiMetric.average = apiMetric.calls.reduce((sum, time) => sum + time, 0) / apiMetric.calls.length;
    
    return duration;
  }

  // Monitor component render times
  monitorComponentRender(componentName, renderFunction) {
    const startTime = performance.now();
    const result = renderFunction();
    const duration = performance.now() - startTime;
    
    const key = `render_${componentName}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, { renders: [], average: 0 });
    }
    
    const renderMetric = this.metrics.get(key);
    renderMetric.renders.push(duration);
    
    if (renderMetric.renders.length > 20) {
      renderMetric.renders.shift();
    }
    
    renderMetric.average = renderMetric.renders.reduce((sum, time) => sum + time, 0) / renderMetric.renders.length;
    
    return result;
  }

  // Setup intersection observer for lazy loading
  setupIntersectionObserver(callback, options = {}) {
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver(callback, { ...defaultOptions, ...options });
    return observer;
  }

  // Monitor memory usage
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  }

  // Get all performance metrics
  getAllMetrics() {
    const metrics = {};
    
    for (const [key, value] of this.metrics.entries()) {
      if (key.startsWith('api_')) {
        metrics[key] = {
          averageResponseTime: Math.round(value.average),
          totalCalls: value.calls.length
        };
      } else if (key.startsWith('render_')) {
        metrics[key] = {
          averageRenderTime: Math.round(value.average * 100) / 100,
          totalRenders: value.renders.length
        };
      } else {
        metrics[key] = value.duration ? Math.round(value.duration) : null;
      }
    }
    
    return {
      ...metrics,
      memory: this.getMemoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  // Log performance summary
  logPerformanceSummary() {
    const metrics = this.getAllMetrics();
    console.group('🚀 Performance Metrics');
    
    Object.entries(metrics).forEach(([key, value]) => {
      if (key !== 'memory' && key !== 'timestamp') {
        
      }
    });
    
    if (metrics.memory) {
      
    }
    
    console.groupEnd();
  }

  // Clear all metrics
  clear() {
    this.metrics.clear();
  }

  // Measure Core Web Vitals
  measureCoreWebVitals() {
    return new Promise((resolve) => {
      const vitals = {};
      
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = Math.round(lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          vitals.FID = Math.round(entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });
      
      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        vitals.CLS = Math.round(clsValue * 1000) / 1000;
      }).observe({ entryTypes: ['layout-shift'] });
      
      setTimeout(() => resolve(vitals), 3000);
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Auto-log performance metrics in development
if (process.env.NODE_ENV === 'development') {
  window.performanceMonitor = performanceMonitor;
  
  // Log metrics every 30 seconds
  setInterval(() => {
    performanceMonitor.logPerformanceSummary();
  }, 30000);
}
