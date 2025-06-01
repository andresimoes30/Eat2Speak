const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Validation middleware for login requests
const validateLogin = [
  // Validate and sanitize email
  body('email')
    .trim()
    .isEmail().withMessage('Must provide a valid email address')
    .normalizeEmail({ gmail_remove_dots: false }) // Normalize but don't alter gmail addresses too much
    .escape(), // Prevent XSS attacks by escaping HTML

  // Validate password
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.info(`Login validation failed for email: ${req.body.email}`, { 
        errors: errors.array().map(e => e.msg)
      });
      return res.status(400).json({ 
        status: 400,
        message: 'Validation error', 
        errors: errors.array().map(e => e.msg) 
      });
    }
    next();
  }
];

module.exports = { validateLogin };