const jwt = require('jsonwebtoken');
const logger = require('./logger');

/**
 * Generate a JWT token with enhanced security
 * @param {Object} payload - Data to include in the token
 * @param {Object} options - Additional options for token generation
 * @returns {string} JWT token
 */
function generateToken(payload, options = {}) {
  try {
    // Set default token expiration to 1 day if not specified
    const expiresIn = options.expiresIn || process.env.JWT_EXPIRES_IN || '1d';
    
    // Set standard JWT claims
    const tokenPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000), // Issued at timestamp
      iss: process.env.JWT_ISSUER || 'eat2speak-api', // Token issuer
      aud: process.env.JWT_AUDIENCE || 'eat2speak-client', // Token audience
    };
    
    // Sign the token with the secret key
    return jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn,
      algorithm: 'HS256', // Use HMAC SHA-256 algorithm
    });
  } catch (error) {
    logger.error('Token generation error:', { error: error.message });
    throw new Error('Error generating authentication token');
  }
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyToken(token) {
  try {
    // Verify the token with complete option to get header and payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // Only accept specific algorithm
      issuer: process.env.JWT_ISSUER || 'eat2speak-api',
      audience: process.env.JWT_AUDIENCE || 'eat2speak-client',
      complete: true
    });
    
    return {
      ...decoded.payload,
      tokenHeader: decoded.header
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.info('Token expired:', { error: error.message });
      throw new Error('Authentication token expired');
    }
    
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid token:', { error: error.message });
      throw new Error('Invalid authentication token');
    }
    
    logger.error('Token verification error:', { error: error.message });
    throw new Error('Error verifying authentication token');
  }
}

/**
 * Extract token from authorization header
 * @param {string} authHeader - Authorization header
 * @returns {string|null} Extracted token or null if invalid
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
}

module.exports = { 
  generateToken,
  verifyToken,
  extractTokenFromHeader
};