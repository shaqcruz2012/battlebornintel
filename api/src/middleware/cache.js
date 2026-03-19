/**
 * In-Memory Cache Middleware
 * Simple caching layer for frequently-accessed API responses
 * Expected to improve response time by 150-250ms for cached queries
 */

class Cache {
  constructor() {
    this.data = new Map();
    this.timers = new Map();
  }

  /**
   * Generate cache key from request
   */
  static generateKey(method, path, query = {}) {
    const queryStr = Object.keys(query)
      .sort()
      .map(k => `${k}=${JSON.stringify(query[k])}`)
      .join('&');
    return `${method}:${path}${queryStr ? `?${queryStr}` : ''}`;
  }

  /**
   * Set value with TTL
   */
  set(key, value, ttlMs = 300000) {
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    this.data.set(key, value);

    // Set expiration timer
    const timer = setTimeout(() => {
      this.data.delete(key);
      this.timers.delete(key);
    }, ttlMs);

    this.timers.set(key, timer);
  }

  /**
   * Get value if exists and not expired
   */
  get(key) {
    return this.data.get(key);
  }

  /**
   * Check if key exists
   */
  has(key) {
    return this.data.has(key);
  }

  /**
   * Clear specific key
   */
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.data.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.data.forEach((_, key) => {
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
      }
    });
    this.data.clear();
    this.timers.clear();
  }

  /**
   * Get cache stats
   */
  stats() {
    return {
      size: this.data.size,
      keys: Array.from(this.data.keys()),
    };
  }
}

// Global cache instance
const cache = new Cache();

// In-flight request deduplication: if multiple identical requests arrive while
// the first is still being computed, they all share the same result.
const inflight = new Map(); // key -> Promise<data>

/**
 * Cache middleware factory
 * @param {string} keyPrefix - Prefix for cache keys (e.g., 'companies')
 * @param {number} ttlMs - Time-to-live in milliseconds (default 5 minutes)
 * @param {Object} options - Optional settings
 * @param {string} options.cacheControl - Cache-Control header value (default: 'public, max-age=3600')
 */
export function cacheMiddleware(keyPrefix = '', ttlMs = 300000, options = {}) {
  const cacheControl = options.cacheControl || 'public, max-age=3600';
  const browserTtlSec = parseInt(cacheControl.match(/max-age=(\d+)/)?.[1] || '3600', 10);

  function applyHttpCacheHeaders(res) {
    res.setHeader('Cache-Control', cacheControl);
    const expires = new Date(Date.now() + browserTtlSec * 1000);
    res.setHeader('Expires', expires.toUTCString());
  }

  return (req, res, next) => {
    const key = Cache.generateKey(req.method, keyPrefix ? `/${keyPrefix}${req.path}` : req.path, req.query);

    // Check cache for GET requests only
    if (req.method === 'GET' && cache.has(key)) {
      const cached = cache.get(key);
      res.setHeader('X-Cache', 'HIT');
      applyHttpCacheHeaders(res);
      return res.json(cached);
    }

    // Request deduplication: if an identical GET is already in-flight, wait for it
    if (req.method === 'GET' && inflight.has(key)) {
      inflight.get(key).then(data => {
        res.setHeader('X-Cache', 'DEDUP');
        applyHttpCacheHeaders(res);
        res.json(data);
      }).catch(() => next());
      return;
    }

    // Track this request as in-flight
    let resolveInflight, rejectInflight;
    if (req.method === 'GET') {
      const promise = new Promise((resolve, reject) => {
        resolveInflight = resolve;
        rejectInflight = reject;
      });
      inflight.set(key, promise);
    }

    // Intercept res.json to cache response and resolve in-flight waiters
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      if (req.method === 'GET' && res.statusCode === 200) {
        cache.set(key, data, ttlMs);
        res.setHeader('X-Cache', 'MISS');
        applyHttpCacheHeaders(res);
        if (resolveInflight) resolveInflight(data);
      } else if (resolveInflight) {
        // Resolve with null instead of rejecting — prevents unhandled rejection crashes
        resolveInflight(null);
      }
      inflight.delete(key);
      return originalJson(data);
    };

    next();
  };
}

/**
 * Invalidate cache by pattern
 */
export function invalidateCache(pattern) {
  const regex = new RegExp(pattern);
  const keysToDelete = Array.from(cache.data.keys()).filter(k => regex.test(k));
  keysToDelete.forEach(k => cache.delete(k));
  return keysToDelete.length;
}

/**
 * Clear all cache
 */
export function clearCache() {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return cache.stats();
}

export default cache;
