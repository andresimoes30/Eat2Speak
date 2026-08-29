const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { User, Session } = require('../models');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT authentication token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
async function verifyAuthToken(req, res, next) {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    // Extract token from header
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      logger.info('Authentication failed: No token provided', {
        ip: req.ip,
        path: req.path
      });
      return res.status(401).json({ 
        status: 401,
        message: 'Authentication required. Please provide a valid token.' 
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // If token is valid but doesn't have required data
    if (!decoded.id || !decoded.sessionId) {
      logger.warn('Authentication failed: Token missing required claims', {
        ip: req.ip,
        path: req.path
      });
      return res.status(403).json({ 
        status: 403,
        message: 'Invalid authentication token format' 
      });
    }
    
    // Check if session is active
    const session = await Session.findOne({
      where: {
        sessionId: decoded.sessionId,
        userId: decoded.id,
        isActive: true
      }
    });
    
    if (!session) {
      logger.warn('Authentication failed: Session not found or inactive', {
        userId: decoded.id,
        sessionId: decoded.sessionId,
        ip: req.ip
      });
      return res.status(401).json({ 
        status: 401,
        message: 'Session expired or invalid. Please log in again.' 
      });
    }
    
    // Get user data
    const user = await User.findByPk(decoded.id, {
      attributes: ['userId', 'firstName', 'lastName', 'email', 'createdAt']
    });
    
    if (!user) {
      logger.warn('Authentication failed: User not found', {
        userId: decoded.id,
        ip: req.ip
      });
      return res.status(401).json({ 
        status: 401,
        message: 'User not found. Please log in again.' 
      });
    }
    
    // Update session last activity
    await session.update({ lastActivity: new Date() });
    
    // Add user and session data to request object
    req.user = user.toJSON();
    req.session = {
      id: Number(session.sessionId), // Ensure it's always a number
      isActive: session.isActive
    };
    
    // Proceed to next middleware
    next();
  } catch (error) {
    // Handle different token errors
    if (error.message === 'Authentication token expired') {
      return res.status(401).json({ 
        status: 401,
        message: 'Authentication token expired. Please log in again.' 
      });
    }
    
    if (error.message === 'Invalid authentication token') {
      return res.status(403).json({ 
        status: 403,
        message: 'Invalid authentication token. Please log in again.' 
      });
    }
    
    // Log unexpected errors
    logger.error('Authentication middleware error:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      path: req.path
    });
    
    // Return generic error response
    return res.status(500).json({ 
      status: 500,
      message: 'Authentication error. Please try again later.' 
    });
  }
}

module.exports = { verifyAuthToken };