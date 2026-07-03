const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie', 'jwt', 'passwordhash', 'resettoken', 'verificationtoken', 'passwordHash'];

const scrub = (data) => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    // Check if it is a JWT token or similar Bearer token
    if (data.toLowerCase().startsWith('bearer ')) {
      return 'Bearer [REDACTED]';
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => scrub(item));
  }
  
  if (typeof data === 'object') {
    const scrubbed = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
          scrubbed[key] = '[REDACTED]';
        } else {
          scrubbed[key] = scrub(data[key]);
        }
      }
    }
    return scrubbed;
  }
  
  return data;
};

const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const scrubbedMeta = scrub(meta);
  
  const logMessage = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...scrubbedMeta
  };

  if (level === 'error') {
    console.error(JSON.stringify(logMessage));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logMessage));
  } else {
    console.log(JSON.stringify(logMessage));
  }
};

const logger = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta)
};

module.exports = logger;
