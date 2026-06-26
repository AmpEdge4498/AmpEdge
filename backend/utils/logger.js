/**
 * AmpEdge — Structured Logger (Console-based, production-ready)
 * Uses built-in console with structured formatting.
 * Drop-in replacement — swap to Winston/Pino when scaling to cloud.
 */

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'] ?? LOG_LEVELS.info;

const timestamp = () => new Date().toISOString();

const formatMeta = (meta) => {
  if (!meta || Object.keys(meta).length === 0) return '';
  return ' ' + JSON.stringify(meta);
};

const logger = {
  error(message, meta = {}) {
    if (currentLevel >= LOG_LEVELS.error) {
      console.error(`[${timestamp()}] ERROR: ${message}${formatMeta(meta)}`);
    }
  },
  warn(message, meta = {}) {
    if (currentLevel >= LOG_LEVELS.warn) {
      console.warn(`[${timestamp()}] WARN: ${message}${formatMeta(meta)}`);
    }
  },
  info(message, meta = {}) {
    if (currentLevel >= LOG_LEVELS.info) {
      console.log(`[${timestamp()}] INFO: ${message}${formatMeta(meta)}`);
    }
  },
  debug(message, meta = {}) {
    if (currentLevel >= LOG_LEVELS.debug) {
      console.log(`[${timestamp()}] DEBUG: ${message}${formatMeta(meta)}`);
    }
  },
};

module.exports = logger;
