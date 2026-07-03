const rateLimiters = new Map();

// Periodic cleanup of rate limiting memory every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimiters.entries()) {
    // Keep only requests that are still within their relevant window
    // We can filter out keys that haven't had requests in the last 15 minutes
    const activeRequests = record.filter(time => now - time < 15 * 60 * 1000);
    if (activeRequests.length === 0) {
      rateLimiters.delete(key);
    } else {
      rateLimiters.set(key, activeRequests);
    }
  }
}, 5 * 60 * 1000).unref(); // Use unref() so the interval doesn't keep the process alive

/**
 * Custom in-memory sliding-window rate limiter middleware.
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (e.g. 15 * 60 * 1000 for 15 mins)
 * @param {number} options.max - Maximum number of requests allowed in the window per IP
 * @param {string} options.message - Error message to return when rate limit is exceeded
 */
const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests, please try again later.' } = {}) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const path = req.path;
    const key = `${ip}:${path}`;
    const now = Date.now();
    
    if (!rateLimiters.has(key)) {
      rateLimiters.set(key, []);
    }
    
    let requests = rateLimiters.get(key);
    
    // Filter out requests that are outside the current sliding window
    requests = requests.filter(time => now - time < windowMs);
    
    if (requests.length >= max) {
      // Log rate limit violation (using structured logging later, but simple console warnings for now)
      console.warn(`Rate limit exceeded for client IP: ${ip} on path: ${path}. Requests in window: ${requests.length + 1}/${max}`);
      return res.status(429).json({
        message,
        retryAfterMs: Math.max(0, windowMs - (now - requests[0]))
      });
    }
    
    requests.push(now);
    rateLimiters.set(key, requests);
    next();
  };
};

module.exports = { rateLimit };
