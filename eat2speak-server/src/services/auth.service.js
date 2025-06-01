const path = require('path');

/**
 * Robust module loading function that handles different deployment environments
 * This solves the "Cannot find module" error in production
 * 
 * @param {string} modulePath - The path of the module to load
 * @returns {Object} - The loaded module
 */
function loadModule(modulePath) {
  // For built-in modules, just use require directly
  if (!modulePath.startsWith('.') && !modulePath.startsWith('/')) {
    return require(modulePath);
  }
  
  const possiblePaths = [
    // Standard relative path
    modulePath,
    // Absolute path using __dirname
    path.resolve(__dirname, modulePath),
    // Path with src/ prefix (common in production)
    modulePath.replace('../', '../src/'),
    // Production-specific path (based on error message)
    `/home/oxiyveey/public_html/eat2speak/src/${modulePath.replace('../', '')}`
  ];
  
  // Try each path until one works
  let lastError = null;
  for (const tryPath of possiblePaths) {
    try {
      return require(tryPath);
    } catch (err) {
      lastError = err;
      // Only continue if it's a module not found error
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
      // Otherwise continue to the next path
    }
  }
  
  // If we get here, all paths failed
  console.error(`Failed to load module ${modulePath}. Tried paths:`, possiblePaths);
  throw lastError || new Error(`Could not load module: ${modulePath}`);
}

// Load dependencies with robust module loading
const bcrypt = loadModule('bcrypt');
const db = loadModule('../models');
const { User, Session, Role } = db;
const jwtUtils = loadModule('../utils/jwt');
const { generateToken } = jwtUtils;
const logger = loadModule('../utils/logger');
const { Op } = loadModule('sequelize');

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
/**
 * Authenticate a user with email and password
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @param {string} ipAddress - IP address of the request
 * @param {string} userAgent - User agent of the request
 * @param {Object} metadata - Additional metadata about the request
 * @returns {Object} Authentication result with token and user info
 * @throws {AuthError} If authentication fails
 */
async function loginUser({ email, password }, ipAddress, userAgent = 'API Login', metadata = {}) {
  // For cloud environments, handle multiple IP addresses (e.g., X-Forwarded-For)
  const clientIp = ipAddress ? (ipAddress.split(',')[0] || 'unknown').trim() : 'unknown';
  
  try {
    if (!email || !password) {
      logger.warn('Login attempt with missing credentials', { clientIp });
      throw new AuthError('Email and password are required', 400);
    }
    
    // Find user by email using parameterized query (handled by Sequelize)
    const user = await User.findOne({ 
      where: { 
        email: email.toLowerCase().trim() 
      },
      attributes: ['userId', 'firstName', 'lastName', 'email', 'passwordHash', 'createdAt'],
      include: [{
        model: Role,
        as: 'Roles', // Fix: Use the correct association alias as defined in the model
        attributes: ['roleId', 'description'],
        through: { attributes: [] } // Don't include the join table attributes
      }]
    }).catch(error => {
      logger.error('Database error during login:', {
        error: error.message,
        clientIp
      });
      throw new AuthError('Authentication service temporarily unavailable', 503);
    });

    // If user not found, log and throw generic error
    if (!user) {
      logger.authFailure('Failed login attempt for non-existent email', {
        maskedEmail: maskEmail(email),
        ipAddress: clientIp
      });
      // Use generic message to prevent user enumeration
      throw new AuthError('Invalid email or password');
    }

    // Compare password using bcrypt (timing-safe comparison)
    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
      .catch(error => {
        logger.error('Password comparison error:', {
          error: error.message,
          userId: user.userId
        });
        throw new AuthError('Authentication service temporarily unavailable', 503);
      });
    
    if (!passwordMatch) {
      logger.authFailure('Failed login attempt - incorrect password', { 
        userId: user.userId,
        ipAddress: clientIp
      });
      throw new AuthError('Invalid email or password');
    }

    // Successfully authenticated
    logger.authSuccess(user.userId, 'User authenticated successfully', {
      ipAddress: clientIp
    });

    // Create session record with retry for cloud environments
    let session;
    try {
      session = await Session.create({
        userId: user.userId,
        ipAddress: clientIp,
        userAgent,
        isActive: true,
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)) // 24 hours
      });
    } catch (error) {
      logger.error('Session creation error:', {
        error: error.message,
        userId: user.userId
      });
      
      // Try to get an existing active session instead of failing
      session = await Session.findOne({
        where: {
          userId: user.userId,
          isActive: true
        },
        order: [['createdAt', 'DESC']]
      });
      
      // If no existing session, create a fallback session object
      if (!session) {
        session = {
          sessionId: `temp-${Date.now()}`,
          userId: user.userId,
          isActive: true
        };
        logger.warn('Using temporary session due to database error', {
          userId: user.userId
        });
      }
    }

    // Generate JWT token with cloud-appropriate expiration
    const token = generateToken({ 
      id: user.userId, 
      email: user.email,
      sessionId: session.sessionId,
      // Add additional claims for cloud environments
      iat: Math.floor(Date.now() / 1000),
      ip: clientIp.split('.').slice(0, 2).join('.') + '.x.x' // Partial IP for verification
    }, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h' // Configurable expiration
    });
    
    // Update session with token hash if using a real session
    if (session.sessionId && !session.sessionId.startsWith('temp-')) {
      try {
        await Session.update(
          { token: token.substring(0, 10) + '...' }, // Store only token prefix for security
          { where: { sessionId: session.sessionId } }
        );
      } catch (error) {
        logger.warn('Failed to update session with token info', {
          sessionId: session.sessionId,
          error: error.message
        });
        // Continue anyway - non-critical operation
      }
    }

    // Get user role information for redirecting to appropriate screens
    let userRoles = [];
    
    try {
      // If roles were included in the query and exist
      if (user.Roles && user.Roles.length > 0) {
        userRoles = user.Roles.map(role => ({
          id: role.roleId,
          type: role.description
        }));
      } else {
        // Fallback to separate query if not included in initial query
        const roles = await db.sequelize.query(
          `SELECT r.roleId, r.description 
           FROM Roles r 
           JOIN UserRoles ur ON r.roleId = ur.roleId 
           WHERE ur.userId = :userId`,
          {
            replacements: { userId: user.userId },
            type: db.sequelize.QueryTypes.SELECT
          }
        );
        
        userRoles = roles.map(role => ({
          id: role.roleId,
          type: role.description
        }));
      }
      
      logger.info(`User roles retrieved: ${userRoles.length}`, {
        userId: user.userId
      });
    } catch (error) {
      logger.warn(`Error retrieving user roles: ${error.message}`, {
        userId: user.userId
      });
      // Continue anyway - non-critical operation
    }
    
    // Determine account type for frontend redirection
    // 1: Student, 2: Native, 3: Restaurant
    const accountType = userRoles.length > 0 ? 
      userRoles[0].id : // Use the first role ID (prioritized)
      1; // Default to Student (1) if no roles found
      
    const accountTypeName = userRoles.length > 0 ? 
      userRoles[0].type : // Use the first role type description
      'Student'; // Default to Student if no roles found
    
    // Return authentication result with cloud-friendly response and account type
    return {
      token,
      user: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType, // Add account type for redirection (1: Student, 2: Native, 3: Restaurant)
        accountTypeName, // Add descriptive account type
        roles: userRoles // Include all roles for more advanced permissions
      },
      session: {
        id: session.sessionId,
        expiresAt: session.expiresAt
      }
    };
  } catch (error) {
    // If it's already an AuthError, just rethrow it
    if (error instanceof AuthError) {
      throw error;
    }
    
    // Otherwise log the unexpected error
    logger.authError('Unexpected authentication error', error, {
      maskedEmail: email ? maskEmail(email) : 'not_provided',
      ipAddress: clientIp
    });
    
    // Return a generic error for security
    throw new AuthError('Authentication failed. Please try again later.', 500);
  }
}

/**
 * Mask email for logging to protect PII
 * @private
 * @param {string} email - Email to mask
 * @returns {string} Masked email
 */
function maskEmail(email) {
  if (!email || typeof email !== 'string') return 'invalid_email';
  const parts = email.split('@');
  if (parts.length !== 2) return 'invalid_email_format';
  
  const name = parts[0];
  const domain = parts[1];
  
  // Show first 2 chars and last char of name part, mask the rest
  const maskedName = name.length <= 3 
    ? name[0] + '***' 
    : name.substring(0, 2) + '***' + name.substring(name.length - 1);
    
  return `${maskedName}@${domain}`;
}

/**
 * Log out a user by invalidating their session
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID to invalidate
 * @param {string} ipAddress - IP address of the request
 * @returns {boolean} Success indicator
 */
async function logoutUser(userId, sessionId, ipAddress = 'unknown') {
  // For cloud environments, handle multiple IP addresses
  const clientIp = ipAddress ? (ipAddress.split(',')[0] || 'unknown').trim() : 'unknown';
  
  try {
    let updated = 0;
    
    // If sessionId provided, invalidate specific session
    if (sessionId) {
      const result = await Session.update(
        { 
          isActive: false,
          lastActivity: new Date(),
          token: null // Clear token for security
        },
        { 
          where: { sessionId, userId },
          returning: true
        }
      );
      
      updated = Array.isArray(result) ? result[0] : (result || 0);
      logger.authSuccess(userId, 'User logged out of specific session', { 
        sessionId, 
        ipAddress: clientIp 
      });
      
      return updated > 0;
    }
    
    // Otherwise invalidate all user sessions (with timeout for cloud databases)
    const result = await Promise.race([
      Session.update(
        { 
          isActive: false,
          lastActivity: new Date(),
          token: null // Clear token for security
        },
        { 
          where: { userId, isActive: true },
          returning: true
        }
      ),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timeout')), 5000)
      )
    ]).catch(error => {
      logger.error('Logout database operation error:', {
        error: error.message,
        userId
      });
      return [0]; // Return default value on error
    });
    
    updated = Array.isArray(result) ? result[0] : (result || 0);
    
    logger.authSuccess(userId, `User logged out of all sessions (${updated} sessions closed)`, { 
      ipAddress: clientIp 
    });
    
    return updated > 0;
  } catch (error) {
    logger.authError('Logout error', error, {
      userId,
      sessionId,
      ipAddress: clientIp
    });
    
    // Return success anyway to avoid locking users in sessions
    // Better to report success and have user try again than be stuck
    return true;
  }
}

/**
 * Verify if a session is valid and active
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID to verify
 * @returns {Promise<boolean>} Whether the session is valid
 */
async function verifySession(userId, sessionId) {
  if (!userId || !sessionId) return false;
  
  try {
    // Check with timeout for cloud databases
    const session = await Promise.race([
      Session.findOne({
        where: {
          sessionId,
          userId,
          isActive: true,
          // Only consider sessions that haven't expired
          expiresAt: {
            [Op.or]: [
              { [Op.gt]: new Date() }, // Greater than now
              { [Op.eq]: null }        // Or null (no expiration)
            ]
          }
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timeout')), 3000)
      )
    ]).catch(error => {
      logger.error('Session verification database error:', {
        error: error.message,
        userId,
        sessionId
      });
      return null; // Return default value on error
    });
    
    if (!session) {
      logger.info('Invalid session verification attempt', {
        userId,
        sessionId
      });
      return false;
    }
    
    // Update last activity time in the background (don't await)
    Session.update(
      { lastActivity: new Date() },
      { where: { sessionId } }
    ).catch(error => {
      logger.warn('Failed to update session last activity', {
        error: error.message,
        sessionId
      });
    });
    
    return true;
  } catch (error) {
    logger.error('Session verification error:', {
      error: error.message,
      userId,
      sessionId
    });
    
    // Default to invalid session on error
    return false;
  }
}

module.exports = { 
  loginUser,
  logoutUser,
  verifySession,
  AuthError
};