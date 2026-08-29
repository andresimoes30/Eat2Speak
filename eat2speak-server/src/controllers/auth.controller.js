const { loginUser, logoutUser, verifySession, AuthError } = require('../services/auth.service');
const logger = require('../utils/logger');
// Import database models for role queries with correct associations
const db = require('../models'); 
const { Role } = db;

/**
 * Get client IP address from request
 * @private
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
function getClientIp(req) {
  // Try various headers used by cloud providers and proxies
  return (
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.headers['cf-connecting-ip'] ||  // Cloudflare
    req.headers['true-client-ip'] ||    // Akamai
    req.headers['x-client-ip'] ||
    req.connection.remoteAddress ||
    'unknown'
  );
}

/**
 * Handle user login requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with token and user data or error
 */
const login = async (req, res) => {
  try {
    // Get client IP address (handles cloud and proxy servers)
    const ipAddress = getClientIp(req);
    
    // Get user agent for session tracking
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    // Collect additional metadata that might be useful for security
    const metadata = {
      timestamp: new Date().toISOString(),
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer,
      // Include some cloud-specific headers if available
      cloudProvider: req.headers['x-cloud-provider'] || 
                    (req.headers['x-amz-cf-id'] ? 'AWS CloudFront' : undefined),
      // Add some geolocation info if provided by the CDN
      country: req.headers['cf-ipcountry'] || req.headers['x-country-code']
    };
    
    // Request has already been validated by validation middleware
    const result = await loginUser(req.body, ipAddress, userAgent, metadata);
    
    // Set a secure session cookie if we're in production and have a session
    if (process.env.NODE_ENV === 'production' && result.session && result.session.id) {
      // Use the res.secureCookie helper we defined in the server config
      if (res.secureCookie) {
        res.secureCookie('sessionId', result.session.id, {
          // Expire cookie at the same time as the session
          expires: result.session.expiresAt ? new Date(result.session.expiresAt) : undefined
        });
      }
    }
    
    // Log successful login (without sensitive info)
    logger.info('Login successful', { 
      userId: result.user.id,
      ipAddress: ipAddress.split(',')[0].trim()
    });
    
    // Return success response with token, user data, and account type for redirection
    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Authentication successful',
      data: {
        token: result.token,
        user: {
          ...result.user,
          // Ensure account type is prominently available
          accountType: result.user.accountType || 1, // 1: Student, 2: Native, 3: Restaurant
          accountTypeName: result.user.accountTypeName || 'Student'
        },
        // Include expiration info but not the session ID for security
        expiresAt: result.session?.expiresAt
      }
    });
  } catch (error) {
    // Handle specific authentication errors
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        status: 'error',
        code: error.statusCode,
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
      status: 'error',
      code: 500,
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
        status: 'error',
        code: 401,
        message: 'Not authenticated'
      });
    }
    
    // Log details for debugging
    logger.info('Attempting logout', {
      userId: user.userId,
      sessionId: session.id,
      sessionIdType: typeof session.id
    });
    
    // Get client IP address
    const ipAddress = getClientIp(req);
    
    // Log user out - the sessionId should already be a number from auth middleware
    const success = await logoutUser(user.userId, session.id, ipAddress);
    
    // Clear any session cookies
    if (res.clearCookie) {
      res.clearCookie('sessionId', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }
    
    if (success) {
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Logout successful'
      });
    } else {
      logger.error('Logout failed', {
        userId: user.userId,
        sessionId: session.id
      });
      return res.status(500).json({
        status: 'error',
        code: 500,
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
      status: 'error',
      code: 500,
      message: 'An unexpected error occurred during logout. Please try again later.'
    });
  }
};

/**
 * Verify user session status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with session status
 */
const verifyAuth = async (req, res) => {
  try {
    // If we get here, it means the auth middleware has already validated the token
    // But we can do an extra verification of the session if needed
    const { user, session } = req;
    
    if (!user || !session) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Not authenticated'
      });
    }
    
    // Extra verification to ensure session is still valid in DB
    // This is helpful in cloud environments where session might be revoked on another server
    const isSessionValid = await verifySession(user.userId, session.id);
    
    if (!isSessionValid) {
      // Clear any session cookies
      if (res.clearCookie) {
        res.clearCookie('sessionId');
      }
      
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Session expired. Please log in again.'
      });
    }
    
    // Try to get the user's roles for redirection purposes
    let accountType = 1; // Default to Student
    let accountTypeName = 'Student';
    
    try {
      // Try to get roles via direct query
      const roles = await db.sequelize.query(
        `SELECT r.roleId, r.description 
         FROM Role r 
         JOIN UserRole ur ON r.roleId = ur.roleId 
         WHERE ur.userId = :userId`,
        {
          replacements: { userId: user.userId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      
      if (roles && roles.length > 0) {
        accountType = roles[0].roleId;
        accountTypeName = roles[0].description;
      }
    } catch (error) {
      logger.warn('Failed to retrieve role info during verification', {
        userId: user.userId,
        error: error.message
      });
      // Continue with default role
    }
    
    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Authentication valid',
      data: {
        user: {
          id: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          accountType, // Add account type for redirection
          accountTypeName // Add descriptive account type
        }
      }
    });
  } catch (error) {
    logger.error('Auth verification error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId
    });
    
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'An error occurred while verifying authentication.'
    });
  }
};

module.exports = { login, logout, verifyAuth };