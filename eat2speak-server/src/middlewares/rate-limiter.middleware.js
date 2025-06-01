const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Create a rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests against the rate limit
  message: {
    status: 429,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  // Store object to track attempts across server restarts (in a production app, use Redis or similar)
  // This is a simple in-memory store for the example
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.message.status).json(options.message);
  }
});

module.exports = { loginLimiter };