/**
 * User Routes
 * 
 * API endpoints for user management operations.
 * Demonstrates proper separation between route handling and database operations.
 */

const express = require('express');
const User = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Get all Users with pagination
 * GET /api/Users
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const Users = await User.list({ page, limit });
    
    res.status(200).json(Users);
  } catch (error) {
    logger.error(`Error fetching Users: ${error.message}`);
    next(error);
  }
});

/**
 * Get user by ID
 * GET /api/Users/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Error fetching user ${req.params.id}: ${error.message}`);
    next(error);
  }
});

/**
 * Create a new user
 * POST /api/Users
 */
router.post('/', async (req, res, next) => {
  try {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        fields: missingFields
      });
    }
    
    // Check if email already exists
    const existingUser = await User.findByEmail(req.body.email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    
    // Create the user
    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password, // Should be hashed in production
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      userType: req.body.userType || 'student' // Default userType
    };
    
    const newUser = await User.create(userData);
    
    // Remove password from response
    delete newUser.password;
    
    res.status(201).json(newUser);
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    next(error);
  }
});

/**
 * Update user
 * PUT /api/Users/:id
 */
router.put('/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If updating email, check if it's already taken by another user
    if (req.body.email && req.body.email !== existingUser.email) {
      const emailUser = await User.findByEmail(req.body.email);
      if (emailUser && emailUser.id !== userId) {
        return res.status(409).json({ message: 'Email already in use' });
      }
    }
    
    // Update user data (excluding id)
    const { id, ...updateData } = req.body;
    const updatedUser = await User.update(userId, updateData);
    
    // Remove password from response
    delete updatedUser.password;
    
    res.status(200).json(updatedUser);
  } catch (error) {
    logger.error(`Error updating user ${req.params.id}: ${error.message}`);
    next(error);
  }
});

/**
 * Delete user
 * DELETE /api/Users/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete the user
    await User.delete(userId);
    
    res.status(200).json({
      message: 'User deleted successfully',
      id: userId
    });
  } catch (error) {
    logger.error(`Error deleting user ${req.params.id}: ${error.message}`);
    next(error);
  }
});

module.exports = router;