const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Robust module loading function to handle different deployment environments
function loadModule(possiblePaths) {
  for (const modulePath of possiblePaths) {
    try {
      // Try to resolve the module with the current path
      return require(modulePath);
    } catch (err) {
      // If error is not about module resolution, rethrow it
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
      // Otherwise try the next path
      console.log(`Module not found at ${modulePath}, trying next path...`);
    }
  }
  
  // If we get here, all paths failed
  throw new Error(`Could not find module in any of the paths: ${possiblePaths.join(', ')}`);
}

// Try different possible paths for controllers and middlewares
const authController = loadModule([
  '../controllers/auth.controller',         // Standard relative path 
  path.resolve(__dirname, '../controllers/auth.controller'), // Absolute path
  './controllers/auth.controller',          // Alternative path for some deployments
  '../../controllers/auth.controller',      // Another possible deployment path
]);

const { loginLimiter } = loadModule([
  '../middlewares/rate-limiter.middleware',
  path.resolve(__dirname, '../middlewares/rate-limiter.middleware'),
  './middlewares/rate-limiter.middleware',
  '../../middlewares/rate-limiter.middleware',
]);

const { validateLogin } = loadModule([
  '../middlewares/validation.middleware',
  path.resolve(__dirname, '../middlewares/validation.middleware'),
  './middlewares/validation.middleware',
  '../../middlewares/validation.middleware',
]);

const { verifyAuthToken } = loadModule([
  '../middlewares/auth.middleware',
  path.resolve(__dirname, '../middlewares/auth.middleware'),
  './middlewares/auth.middleware',
  '../../middlewares/auth.middleware',
]);

// Extract controller methods
const { login, logout, verifyAuth } = authController;

/**
 * @route POST /api/auth/login
 * @description Authenticate user and get token
 * @access Public
 * @middleware loginLimiter - Prevent brute force attacks
 * @middleware validateLogin - Validate and sanitize input
 */
router.post('/login', loginLimiter, validateLogin, login);

/**
 * @route POST /api/auth/logout
 * @description Logout user and invalidate session
 * @access Private (requires authentication)
 * @middleware verifyAuthToken - Ensure user is authenticated
 */
router.post('/logout', verifyAuthToken, logout);

/**
 * @route GET /api/auth/verify
 * @description Verify if user's authentication is valid
 * @access Private (requires authentication)
 * @middleware verifyAuthToken - Ensure user is authenticated
 */
router.get('/verify', verifyAuthToken, verifyAuth);

/**
 * @route GET /api/auth/status
 * @description Check authentication server status
 * @access Public
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'success',
    code: 200,
    message: 'Authentication service is operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Error handler for auth routes
 * Ensures consistent error format
 */
router.use((err, req, res, next) => {
  // If headers already sent, let the default Express error handler deal with it
  if (res.headersSent) {
    return next(err);
  }
  
  // Get status code from error or default to 500
  const statusCode = err.statusCode || 500;
  
  // Log error (but not in test environment)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`Auth route error: ${err.message}`);
  }
  
  // Send error response
  res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Something went wrong'
  });
});

module.exports = router;