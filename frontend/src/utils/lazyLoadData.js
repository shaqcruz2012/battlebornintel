/**
 * Lazy Data Loader
 * Dynamically imports heavy data files on-demand to reduce initial bundle size
 * Uses dynamic imports and caching to optimize performance
 */

const cache = new Map();

/**
 * Lazy load companies data
 * Expected to improve initial load time by 300-400ms
 */
export async function loadCompaniesData() {
  if (cache.has('companies')) {
    return cache.get('companies');
  }

  try {
    const module = await import('../data/companies.js');
    const data = module.companies || module.default || [];
    cache.set('companies', data);
    return data;
  } catch (error) {
    console.error('Failed to load companies data:', error);
    return [];
  }
}

/**
 * Lazy load graph entities
 */
export async function loadGraphEntitiesData() {
  if (cache.has('graphEntities')) {
    return cache.get('graphEntities');
  }

  try {
    const module = await import('../data/graph-entities.js');
    const data = module.graphEntities || module.default || [];
    cache.set('graphEntities', data);
    return data;
  } catch (error) {
    console.error('Failed to load graph entities data:', error);
    return [];
  }
}

/**
 * Lazy load edges data
 */
export async function loadEdgesData() {
  if (cache.has('edges')) {
    return cache.get('edges');
  }

  try {
    const module = await import('../data/edges.js');
    const data = module.edges || module.default || [];
    cache.set('edges', data);
    return data;
  } catch (error) {
    console.error('Failed to load edges data:', error);
    return [];
  }
}

/**
 * Preload multiple data files in parallel
 * Useful for prefetching during idle time
 */
export async function preloadDataFiles(files = ['companies', 'graphEntities', 'edges']) {
  const promises = [];

  if (files.includes('companies')) {
    promises.push(loadCompaniesData());
  }

  if (files.includes('graphEntities')) {
    promises.push(loadGraphEntitiesData());
  }

  if (files.includes('edges')) {
    promises.push(loadEdgesData());
  }

  try {
    await Promise.all(promises);
  } catch (error) {
    console.warn('Error preloading data files:', error);
  }
}

/**
 * Clear cache for a specific data file
 */
export function clearDataCache(key) {
  cache.delete(key);
}

/**
 * Clear all cached data
 */
export function clearAllDataCache() {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
