// DEAD CODE — safe to remove
/**
 * Lightweight in-memory TTL cache for API responses.
 * Keyed by endpoint + query params. Auto-expires stale entries.
 *
 * This module re-exports the shared cache primitives from the middleware
 * layer so query-level code can import caching without depending on Express.
 */

const store = new Map();

export function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function set(key, value, ttlMs = 30_000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function invalidate(pattern) {
  for (const key of store.keys()) {
    if (key.includes(pattern)) store.delete(key);
  }
}

export function stats() {
  return { size: store.size, keys: [...store.keys()] };
}
