/**
 * Region group mapping for Nevada metro areas.
 *
 * The header filter sends one of: 'las_vegas', 'reno', 'henderson'.
 * Companies in the DB may have more specific sub-regions. This mapping
 * ensures selecting a metro area includes all sub-regions within it.
 */
const REGION_GROUPS = {
  las_vegas: ['las_vegas', 'las_vegas_metro', 'north_las_vegas', 'summerlin', 'boulder_city', 'statewide'],
  reno: ['reno', 'sparks', 'washoe', 'northern_nevada', 'carson_city', 'tahoe', 'elko', 'statewide'],
  henderson: ['henderson', 'statewide'],
};

/**
 * Expand a region filter value into all matching sub-region values.
 * Returns null if the filter is 'all', falsy, or not a recognized group
 * (in which case the caller should use the raw value for exact match).
 *
 * @param {string} region - The region filter value from the request
 * @returns {string[]|null} Array of matching region slugs, or null if no expansion needed
 */
export function expandRegion(region) {
  if (!region || region === 'all') return null;
  return REGION_GROUPS[region] || [region];
}

/**
 * Build a SQL condition + params for region filtering on a table alias.
 * If the region maps to a group, uses ANY(array). Otherwise uses exact match.
 *
 * @param {string} region - The region filter value
 * @param {string} columnExpr - The SQL column expression (e.g., 'c.region', 'LOWER(c.region)')
 * @param {number} paramIdx - The current parameter index ($N)
 * @returns {{ condition: string|null, params: any[], nextIdx: number }}
 */
export function regionCondition(region, columnExpr, paramIdx) {
  const expanded = expandRegion(region);
  if (!expanded) return { condition: null, params: [], nextIdx: paramIdx };

  if (expanded.length === 1) {
    return {
      condition: `${columnExpr} = $${paramIdx}`,
      params: [expanded[0]],
      nextIdx: paramIdx + 1,
    };
  }

  return {
    condition: `${columnExpr} = ANY($${paramIdx})`,
    params: [expanded],
    nextIdx: paramIdx + 1,
  };
}
