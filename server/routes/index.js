/**
 * API Routes Index
 * 
 * Central file for organizing and registering all API routes.
 * Provides clean structure for route management and easy expansion.
 */

const express = require('express');
const userRoutes = require('./users');
const logger = require('../utils/logger');

const router = express.Router();

// API info endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    name: 'Eat2Speak API',
    version: '1.0.0',
    status: 'active'
  });
});

// Register route modules
router.use('/users', userRoutes);

// Future route modules can be added here
// router.use('/restaurants', restaurantRoutes);
// router.use('/sessions', sessionRoutes);
// router.use('/payments', paymentRoutes);

// 404 handler for API routes
router.use((req, res) => {
  logger.warn(`API route not found: ${req.originalUrl}`);
  res.status(404).json({
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

module.exports = router;