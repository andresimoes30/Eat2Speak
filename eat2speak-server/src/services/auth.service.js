const bcrypt = require('bcrypt');
const { User, Session } = require('../models');
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Custom error class for authentication errors
 */
class AuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

/**
 * Authenticate a user with email and password
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @param {string} ipAddress - IP address of the request
 * @returns {Object} Authentication result with token and user info
 * @throws {AuthError} If authentication fails
 */
async function loginUser({ email, password }, ipAddress) {
  try {
    // Find user by email using parameterized query (handled by Sequelize)
    const user = await User.findOne({ 
      where: { 
        email: email.toLowerCase().trim() 
      },
      attributes: ['userId', 'firstName', 'lastName', 'email', 'passwordHash', 'createdAt']
    });

    // If user not found, log and throw generic error
    if (!user) {
      logger.warn(`Failed login attempt for non-existent email: ${email}`, { ipAddress });
      // Use generic message to prevent user enumeration
      throw new AuthError('Invalid email or password');
    }

    // Compare password using bcrypt (timing-safe comparison)
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!passwordMatch) {
      logger.warn(`Failed login attempt for user: ${email}`, { 
        userId: user.userId,
        ipAddress
      });
      throw new AuthError('Invalid email or password');
    }

    // Successfully authenticated
    logger.info(`Successful login for user: ${email}`, {
      userId: user.userId,
      ipAddress
    });

    // Create session record
    const session = await Session.create({
      userId: user.userId,
      ipAddress,
      userAgent: 'API Login', // This should be passed from controller
      isActive: true,
      lastActivity: new Date()
    });

    // Generate JWT token
    const token = generateToken({ 
      id: user.userId, 
      email: user.email,
      sessionId: session.sessionId
    });

    // Return authentication result
    return {
      token,
      user: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    };
  } catch (error) {
    // If it's already an AuthError, just rethrow it
    if (error instanceof AuthError) {
      throw error;
    }
    
    // Otherwise log the unexpected error
    logger.error('Authentication error:', {
      error: error.message,
      stack: error.stack,
      email
    });
    
    // Return a generic error for security
    throw new AuthError('Authentication failed. Please try again later.', 500);
  }
}

/**
 * Log out a user by invalidating their session
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID to invalidate
 * @returns {boolean} Success indicator
 */
async function logoutUser(userId, sessionId) {
  try {
    // If sessionId provided, invalidate specific session
    if (sessionId) {
      await Session.update(
        { isActive: false },
        { where: { sessionId, userId } }
      );
      logger.info(`User logged out of specific session`, { userId, sessionId });
      return true;
    }
    
    // Otherwise invalidate all user sessions
    await Session.update(
      { isActive: false },
      { where: { userId } }
    );
    
    logger.info(`User logged out of all sessions`, { userId });
    return true;
  } catch (error) {
    logger.error('Logout error:', {
      error: error.message,
      userId,
      sessionId
    });
    return false;
  }
}

module.exports = { 
  loginUser,
  logoutUser,
  AuthError
};