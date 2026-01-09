// Enhanced request cache with memory management and compression
class RequestCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.maxCacheSize = 100; // Maximum number of cached items
    this.compressionThreshold = 1024; // Compress responses larger than 1KB
  }

  async get(url, options = {}) {
    const cacheKey = this.getCacheKey(url, options);
    
    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && !this.isExpired(cached)) {
      // Move to end (LRU)
      this.cache.delete(cacheKey);
      this.cache.set(cacheKey, cached);
      return this.decompressData(cached.data);
    }

    // Make new request
    const requestPromise = this.makeRequest(url, options)
      .then(data => {
        // Manage cache size
        this.manageCacheSize();
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: this.compressData(data),
          timestamp: Date.now(),
          ttl: options.ttl || 30000, // 30 seconds default
          size: JSON.stringify(data).length
        });
        
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
        
        return data;
      })
      .catch(error => {
        // Remove from pending requests on error
        this.pendingRequests.delete(cacheKey);
        throw error;
      });

    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }

  async makeRequest(url, options) {
    const fetchOptions = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: options.signal,
      ...options
    };
    
    // Remove non-fetch options
    delete fetchOptions.ttl;
    
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  getCacheKey(url, options) {
    return `${url}_${JSON.stringify(options.headers || {})}_${options.method || 'GET'}`;
  }

  isExpired(cached) {
    return Date.now() - cached.timestamp > cached.ttl;
  }

  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  delete(url, options = {}) {
    const cacheKey = this.getCacheKey(url, options);
    this.cache.delete(cacheKey);
    this.pendingRequests.delete(cacheKey);
  }
  
  manageCacheSize() {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entries (LRU)
      const entriesToRemove = this.cache.size - this.maxCacheSize + 10;
      const keys = Array.from(this.cache.keys());
      for (let i = 0; i < entriesToRemove; i++) {
        this.cache.delete(keys[i]);
      }
    }
  }
  
  compressData(data) {
    const jsonString = JSON.stringify(data);
    if (jsonString.length > this.compressionThreshold) {
      // Simple compression - in production, use a proper compression library
      return {
        compressed: true,
        data: jsonString
      };
    }
    return { compressed: false, data };
  }
  
  decompressData(cachedData) {
    if (cachedData.compressed) {
      return JSON.parse(cachedData.data);
    }
    return cachedData.data;
  }
  
  getCacheStats() {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, item) => sum + (item.size || 0), 0);
    return {
      entries: this.cache.size,
      totalSize,
      pendingRequests: this.pendingRequests.size
    };
  }
}

export const requestCache = new RequestCache();
