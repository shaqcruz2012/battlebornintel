/**
 * Lightweight in-memory TTL cache for engine-level responses.
 * Keyed by endpoint + query params. Auto-expires stale entries.
 *
 * Used by engine modules (e.g. link-prediction) that need caching
 * without depending on Express middleware.
 *
 * @module utils/cache
 */

const store = new Map();

/**
 * Retrieve a cached value by key, returning null if missing or expired.
 * @param {string} key - Cache key
 * @returns {*|null} Cached value or null
 */
export function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Store a value with a time-to-live.
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} [ttlMs=30000] - Time-to-live in milliseconds
 */
export function set(key, value, ttlMs = 30_000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Invalidate all cache entries whose key contains the given pattern.
 * @param {string} pattern - Substring to match against keys
 */
export function invalidate(pattern) {
  for (const key of store.keys()) {
    if (key.includes(pattern)) store.delete(key);
  }
}

/**
 * Return cache statistics (size and keys).
 * @returns {{ size: number, keys: string[] }}
 */
export function stats() {
  return { size: store.size, keys: [...store.keys()] };
}
