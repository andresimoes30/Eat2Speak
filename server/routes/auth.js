/**
 * Authentication Routes
 * 
 * API endpoints for authentication-related operations including:
 * - User registration with proper validation and role assignment
 * - Login with secure token generation
 * - Password management
 */

const express = require('express');
const User = require('../models/User');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const db = require('../db/db');

const router = express.Router();

// Secret for JWT tokens, should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'eat2speak_secret_key';
const TOKEN_EXPIRY = '24h';

/**
 * Input sanitization middleware to prevent SQL injection and XSS attacks
 */
const sanitizeInput = (req, res, next) => {
  // List of fields to sanitize
  const fieldsToSanitize = [
    'firstName', 'lastName', 'email', 'password', 'phoneNumber', 
    'address', 'nationality', 'gender', 'restaurantName', 
    'cuisineType', 'languageName'
  ];
  
  // Simple sanitization function (can be replaced with a library like validator)
  const sanitize = (value) => {
    if (typeof value !== 'string') return value;
    
    // Remove potentially dangerous characters and patterns
    return value
      .trim()
      .replace(/[<>]/g, '') // Simple XSS protection
      .replace(/('|"|\\\*|;|--)/g, ''); // Simple SQL injection protection
  };
  
  // Sanitize all relevant fields in request body
  if (req.body) {
    fieldsToSanitize.forEach(field => {
      if (req.body[field]) {
        req.body[field] = sanitize(req.body[field]);
      }
    });
  }
  
  next();
};

/**
 * Validate required fields for registration
 */
const validateRegistration = (req, res, next) => {
  // Common required fields for all user types
  const requiredFields = ['firstName', 'lastName', 'email', 'password', 'phoneNumber', 'userTypes'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  // Check user type specific required fields
  const userType = req.body.userTypes?.toLowerCase();
  
  if (userType === 'student' || userType === 'native') {
    const additionalFields = ['address', 'nationality', 'gender'];
    additionalFields.forEach(field => {
      if (!req.body[field]) missingFields.push(field);
    });
    
    // Native speakers need language
    if (userType === 'native' && !req.body.languageName) {
      missingFields.push('languageName');
    }
  } else if (userType === 'restaurant') {
    const additionalFields = ['restaurantName', 'cuisineType', 'address'];
    additionalFields.forEach(field => {
      if (!req.body[field]) missingFields.push(field);
    });
  } else if (userType) {
    return res.status(400).json({
      message: 'Invalid user type',
      error: `User type '${userType}' is not recognized. Must be one of: student, native, restaurant`
    });
  } else {
    missingFields.push('userTypes');
  }
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Missing required fields',
      fields: missingFields
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    return res.status(400).json({
      message: 'Invalid email format',
      field: 'email'
    });
  }
  
  // Validate password strength
  if (req.body.password.length < 6) {
    return res.status(400).json({
      message: 'Password too weak',
      field: 'password',
      error: 'Password must be at least 6 characters long'
    });
  }
  
  next();
};

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post('/register', sanitizeInput, validateRegistration, async (req, res, next) => {
  try {
    // Check if email already exists
    const existingUser = await User.findByEmail(req.body.email);
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Email already in use',
        field: 'email'
      });
    }
    
    // Process registration with our enhanced User model
    const newUser = await User.register(req.body);
    
    logger.info(`User registered successfully: ${newUser.email}`);
    
    // Return success response
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser.userId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        userType: newUser.userType
      }
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    
    // Handle specific errors
    if (error.message.includes('already registered')) {
      return res.status(409).json({ message: error.message });
    }
    
    if (error.message.includes('Invalid user type')) {
      return res.status(400).json({ message: error.message });
    }
    
    // Generic error
    res.status(500).json({ 
      message: 'Registration failed',
      error: error.message
    });
  }
});

/**
 * User login
 * POST /api/auth/login
 */
router.post('/login', sanitizeInput, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }
    
    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }
    
    // Get user role
    const userRoleQuery = `
      SELECT r.description as roleName, r.roleId
      FROM UserRole ur
      JOIN Role r ON ur.roleId = r.roleId
      WHERE ur.userId = ?
    `;
    
    const userRoles = await db.executeQuery(userRoleQuery, [user.userId]);
    const role = userRoles.length > 0 ? userRoles[0] : { roleName: 'user', roleId: 0 };
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.userId, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: role.roleName,
        roleId: role.roleId
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    logger.info(`User logged in: ${user.email}`);
    
    // Return user info and token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: role.roleName
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ 
      message: 'Login failed',
      error: error.message
    });
  }
});

module.exports = router;