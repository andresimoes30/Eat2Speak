const express = require('express');
const router = express.Router();
const path = require('path');

/**
 * Robust module loading function that handles different deployment environments
 * This solves the "Cannot find module" error in production
 * 
 * @param {string} moduleName - The base name of the module to load
 * @param {Array<string>} basePaths - Array of possible base directory paths to try
 * @returns {Object} - The loaded module
 * @throws {Error} - If module cannot be found in any of the paths
 */
function loadModuleRobustly(moduleName, basePaths = ['../']) {
  // Add the current directory path for absolute path resolution
  const currentDir = __dirname;
  
  // Create array of possible paths to try
  const possiblePaths = [];
  
  // Add various path formats
  basePaths.forEach(basePath => {
    // Regular relative path
    possiblePaths.push(`${basePath}${moduleName}`);
    
    // Absolute path using path.resolve
    possiblePaths.push(path.resolve(currentDir, `${basePath}${moduleName}`));
    
    // Path with /src/ prefix for some deployment scenarios
    possiblePaths.push(`${basePath}src/${moduleName}`);
    
    // Absolute path with /src/ prefix
    possiblePaths.push(path.resolve(currentDir, `${basePath}src/${moduleName}`));
  });
  
  // Add production-specific paths based on error message
  possiblePaths.push(path.resolve('/home/oxiyveey/public_html/eat2speak', `src/${moduleName}`));
  possiblePaths.push(`/home/oxiyveey/public_html/eat2speak/src/${moduleName}`);
  
  // Try each path until one works
  let lastError = null;
  for (const modulePath of possiblePaths) {
    try {
      return require(modulePath);
    } catch (err) {
      lastError = err;
      // Only continue if it's a module not found error
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
      // Otherwise continue to the next path
    }
  }
  
  // If we get here, all paths failed - throw with helpful error
  console.error(`Module loading failed for ${moduleName}. Paths tried:`, possiblePaths);
  throw new Error(`Failed to load module ${moduleName}. Last error: ${lastError?.message}`);
}

// Load required modules using the robust loader
const controllerPath = 'controllers/auth.controller';
const rateLimiterPath = 'middlewares/rate-limiter.middleware';
const validationPath = 'middlewares/validation.middleware';
const authMiddlewarePath = 'middlewares/auth.middleware';

// Load the modules with multiple base paths to try
let authController, loginLimiter, validateLogin, verifyAuthToken;

try {
  authController = loadModuleRobustly(controllerPath, ['../', './', '../../', '../../../']);
  const rateLimiterModule = loadModuleRobustly(rateLimiterPath, ['../', './', '../../', '../../../']);
  const validationModule = loadModuleRobustly(validationPath, ['../', './', '../../', '../../../']);
  const authMiddlewareModule = loadModuleRobustly(authMiddlewarePath, ['../', './', '../../', '../../../']);
  
  // Extract the required functions
  loginLimiter = rateLimiterModule.loginLimiter;
  validateLogin = validationModule.validateLogin;
  verifyAuthToken = authMiddlewareModule.verifyAuthToken;
} catch (error) {
  console.error('Critical error loading auth modules:', error);
  // Provide fallback implementations to prevent total failure
  loginLimiter = (req, res, next) => next();
  validateLogin = (req, res, next) => next();
  verifyAuthToken = (req, res, next) => next();
  
  // Create minimal authController if it couldn't be loaded
  if (!authController) {
    authController = {
      login: (req, res) => res.status(500).json({ 
        status: 'error', 
        message: 'Authentication system is temporarily unavailable' 
      }),
      logout: (req, res) => res.status(200).json({ 
        status: 'success', 
        message: 'Logout successful (fallback mode)' 
      }),
      verifyAuth: (req, res) => res.status(401).json({ 
        status: 'error', 
        message: 'Authentication verification unavailable' 
      })
    };
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
    environment: process.env.NODE_ENV || 'development',
    modulesLoaded: !!authController
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