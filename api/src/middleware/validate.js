/**
 * Lightweight input validation helpers.
 * Each returns { value, error } — error is null on success, a string on failure.
 */

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function requireInt(raw, field) {
  const value = parseInt(raw, 10);
  if (isNaN(value) || value <= 0) {
    return { value: null, error: `${field} must be a positive integer` };
  }
  return { value, error: null };
}

export function requireEnum(raw, field, allowed) {
  if (!allowed.includes(raw)) {
    return { value: null, error: `${field} must be one of: ${allowed.join(', ')}` };
  }
  return { value: raw, error: null };
}

export function optionalInt(raw, field, { min = 1, max = Infinity, fallback = null } = {}) {
  if (raw == null || raw === '') return { value: fallback, error: null };
  const value = parseInt(raw, 10);
  if (isNaN(value)) {
    return { value: null, error: `${field} must be an integer` };
  }
  return { value: Math.min(Math.max(value, min), max), error: null };
}

export function optionalDate(raw, field) {
  if (raw == null || raw === '') return { value: null, error: null };
  if (typeof raw !== 'string' || !ISO_DATE_RE.test(raw)) {
    return { value: null, error: `${field} must be ISO format YYYY-MM-DD` };
  }
  return { value: raw, error: null };
}

export function optionalString(raw, field, maxLen = 200) {
  if (raw == null || raw === '') return { value: null, error: null };
  if (typeof raw !== 'string') {
    return { value: null, error: `${field} must be a string` };
  }
  if (raw.length > maxLen) {
    return { value: null, error: `${field} must be at most ${maxLen} characters` };
  }
  return { value: raw, error: null };
}

/**
 * Express middleware factory: validates req.params / req.query against a schema.
 * Usage: router.get('/:id', validate({ params: { id: requireInt } }), handler)
 */
export function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    for (const [source, fields] of Object.entries(schema)) {
      const data = req[source];
      for (const [field, validator] of Object.entries(fields)) {
        const result = validator(data?.[field], field);
        if (result.error) errors.push(result.error);
        else if (data) data[field] = result.value;
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0], errors });
    }
    next();
  };
}
