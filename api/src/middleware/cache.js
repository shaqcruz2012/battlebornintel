/**
 * In-Memory Cache Middleware
 * Simple caching layer for frequently-accessed API responses
 * Expected to improve response time by 150-250ms for cached queries
 *
 * Includes cache stampede (thundering herd) protection: when a cache entry
 * expires and multiple requests arrive simultaneously, only one request
 * computes the fresh value while others wait for that result.
 */

// Inflight request map for stampede protection.
// Maps cache key -> Promise<data> for requests currently being computed.
const inflight = new Map();

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

    // Stampede protection: if another request is already computing this key,
    // wait for its result instead of hitting the downstream handler again.
    if (req.method === 'GET' && inflight.has(key)) {
      inflight.get(key).then((data) => {
        res.setHeader('X-Cache', 'HIT_COALESCED');
        applyHttpCacheHeaders(res);
        res.json(data);
      }).catch(() => {
        // The original request failed — let this one try on its own.
        // Remove any stale inflight entry (it should already be cleaned up,
        // but guard against races).
        inflight.delete(key);
        next();
      });
      return;
    }

    // This request will be the one to compute the value.
    // Create a promise that other concurrent requests can wait on.
    let resolveInflight;
    let rejectInflight;
    if (req.method === 'GET') {
      const promise = new Promise((resolve, reject) => {
        resolveInflight = resolve;
        rejectInflight = reject;
      });
      // Prevent unhandled rejection crash if rejectInflight is called
      promise.catch(() => {});
      inflight.set(key, promise);
    }

    // Intercept res.json to cache response and resolve waiting requests
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      if (req.method === 'GET' && res.statusCode === 200) {
        cache.set(key, data, ttlMs);
        res.setHeader('X-Cache', 'MISS');
        applyHttpCacheHeaders(res);
        // Resolve all coalesced waiters and clean up
        if (resolveInflight) {
          resolveInflight(data);
          inflight.delete(key);
        }
      } else if (req.method === 'GET') {
        // Non-200 response — clean up inflight without crashing
        inflight.delete(key);
        if (rejectInflight) {
          try { rejectInflight(new Error('upstream non-200')); } catch {}
        }
      }
      return originalJson(data);
    };

    // Guard against cases where the handler errors without calling res.json
    // (e.g., Express error middleware kicks in, or non-JSON responses).
    const originalEnd = res.end.bind(res);
    res.end = function(...args) {
      if (req.method === 'GET' && inflight.has(key)) {
        // Clean up inflight entry without crashing — waiters get a cache miss
        inflight.delete(key);
        if (rejectInflight) {
          try { rejectInflight(new Error('response ended without json')); } catch {}
        }
      }
      return originalEnd(...args);
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
