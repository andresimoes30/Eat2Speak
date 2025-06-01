const express = require('express');
const router = express.Router();
const path = require('path');

// Simple fix for module loading in production
let authController, loginLimiter, validateLogin, verifyAuthToken;

try {
  // Try standard path first
  authController = require('../controllers/auth.controller');
  loginLimiter = require('../middlewares/rate-limiter.middleware').loginLimiter;
  validateLogin = require('../middlewares/validation.middleware').validateLogin;
  verifyAuthToken = require('../middlewares/auth.middleware').verifyAuthToken;
} catch (error) {
  console.error(`Standard module loading failed: ${error.message}`);
  
  try {
    // Try absolute paths for production environment
    const basePath = path.resolve(__dirname, '../../');
    authController = require(path.join(basePath, 'src/controllers/auth.controller'));
    loginLimiter = require(path.join(basePath, 'src/middlewares/rate-limiter.middleware')).loginLimiter;
    validateLogin = require(path.join(basePath, 'src/middlewares/validation.middleware')).validateLogin;
    verifyAuthToken = require(path.join(basePath, 'src/middlewares/auth.middleware')).verifyAuthToken;
  } catch (fallbackError) {
    console.error(`Both module loading approaches failed: ${fallbackError.message}`);
    // Provide minimal fallbacks to prevent complete failure
    authController = {
      login: (req, res) => res.status(500).json({ status: 'error', message: 'Auth system unavailable' }),
      logout: (req, res) => res.status(200).json({ status: 'success', message: 'Logout (fallback)' }),
      verifyAuth: (req, res) => res.status(500).json({ status: 'error', message: 'Auth check unavailable' })
    };
    loginLimiter = (req, res, next) => next();
    validateLogin = (req, res, next) => next();
    verifyAuthToken = (req, res, next) => next();
  }
}

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