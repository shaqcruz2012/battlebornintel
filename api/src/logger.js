import { AsyncLocalStorage } from 'node:async_hooks';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[LOG_LEVEL] ?? LEVELS.info;

const requestContext = new AsyncLocalStorage();

export function runWithRequestContext(requestId, fn) {
  return requestContext.run({ requestId }, fn);
}

export function getRequestId() {
  return requestContext.getStore()?.requestId || null;
}

function log(level, message, meta = {}) {
  if (LEVELS[level] > currentLevel) return;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  const reqId = getRequestId();
  if (reqId && !meta.request_id) {
    entry.request_id = reqId;
  }
  // Error objects need special serialization
  if (meta.error instanceof Error) {
    entry.error = {
      name: meta.error.name,
      message: meta.error.message,
      ...(level === 'error' ? { stack: meta.error.stack } : {}),
    };
  }
  process.stdout.write(JSON.stringify(entry) + '\n');
}

export const logger = {
  error: (msg, meta) => log('error', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};

export default logger;
