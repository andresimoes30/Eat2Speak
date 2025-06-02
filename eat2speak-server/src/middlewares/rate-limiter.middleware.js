const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Rate limiter with higher limits for testing purposes
// This allows more API calls without completely disabling rate limiting
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute (shorter window for testing)
  max: 100, // Allow 100 requests per minute per IP (much higher limit for testing)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true, // Don't count successful requests against the limit
  message: {
    status: 429,
    message: 'Too many requests. Please try again in 1 minute.'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.message.status).json(options.message);
  }
});

// General API rate limiter for other endpoints with very high limits
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    status: 429,
    message: 'Too many API requests. Please try again in 1 minute.'
  }
});

module.exports = { loginLimiter, apiLimiter };