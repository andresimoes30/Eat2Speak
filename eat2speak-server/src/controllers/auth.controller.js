const { loginUser, logoutUser, AuthError } = require('../services/auth.service');
const logger = require('../utils/logger');

/**
 * Handle user login requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with token and user data or error
 */
const login = async (req, res) => {
  try {
    // Get client IP address (handles proxy servers)
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Get user agent for session tracking
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    // Request has already been validated by validation middleware
    const result = await loginUser(req.body, ipAddress, userAgent);
    
    // Log successful login (without sensitive info)
    logger.info('Login successful', { 
      userId: result.user.id,
      ipAddress: ipAddress.split(',')[0].trim()
    });
    
    // Return success response with token and user data
    return res.status(200).json({
      status: 200,
      message: 'Authentication successful',
      data: result
    });
  } catch (error) {
    // Handle specific authentication errors
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message
      });
    }
    
    // Log unexpected errors
    logger.error('Login controller error:', {
      error: error.message,
      stack: error.stack
    });
    
    // Return generic server error for unexpected issues
    return res.status(500).json({
      status: 500,
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
};

/**
 * Handle user logout requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success or error message
 */
const logout = async (req, res) => {
  try {
    // Extract session info from request (added by auth middleware)
    const { user, session } = req;
    
    if (!user || !session) {
      return res.status(401).json({
        status: 401,
        message: 'Not authenticated'
      });
    }
    
    // Log user out
    const success = await logoutUser(user.userId, session.id);
    
    if (success) {
      return res.status(200).json({
        status: 200,
        message: 'Logout successful'
      });
    } else {
      return res.status(500).json({
        status: 500,
        message: 'Logout failed. Please try again.'
      });
    }
  } catch (error) {
    // Log unexpected errors
    logger.error('Logout controller error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId
    });
    
    // Return generic server error
    return res.status(500).json({
      status: 500,
      message: 'An unexpected error occurred during logout. Please try again later.'
    });
  }
};

module.exports = { login, logout };