/**
 * Review Routes
 * 
 * Provides API endpoints for review management, including:
 * - Creating new reviews
 * - Retrieving reviews for users and restaurants
 * - Updating reviews
 * - Deleting reviews
 * 
 * @module routes/review.routes
 */

const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { verifyAuthToken } = require('../middlewares/auth.middleware');
const reviewController = require('../controllers/review.controller');

/**
 * @route GET /api/reviews
 * @description Get reviews with filtering options
 * @access Public
 */
router.get('/', reviewController.getReviews);

/**
 * @route GET /api/reviews/:id
 * @description Get review by ID
 * @access Public
 */
router.get('/:id', reviewController.getReviewById);

/**
 * @route POST /api/reviews
 * @description Create a new review (requires authentication)
 * @access Private
 */
router.post('/', verifyAuthToken, reviewController.createReview);

/**
 * @route PUT /api/reviews/:id
 * @description Update a review (requires authentication and ownership)
 * @access Private
 */
router.put('/:id', verifyAuthToken, reviewController.updateReview);

/**
 * @route DELETE /api/reviews/:id
 * @description Delete a review (requires authentication and ownership or admin)
 * @access Private
 */
router.delete('/:id', verifyAuthToken, reviewController.deleteReview);

/**
 * @route GET /api/reviews/user/:userId
 * @description Get reviews for a specific user
 * @access Public
 */
router.get('/user/:userId', reviewController.getUserReviews);

/**
 * @route GET /api/reviews/restaurant/:restaurantId
 * @description Get reviews for a specific restaurant
 * @access Public
 */
router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);

/**
 * @route GET /api/reviews/session/:sessionId
 * @description Get reviews for a specific session
 * @access Public
 */
router.get('/session/:sessionId', reviewController.getSessionReviews);

/**
 * @route GET /api/reviews/stats/user/:userId
 * @description Get review statistics for a user
 * @access Public
 */
router.get('/stats/user/:userId', reviewController.getUserReviewStats);

/**
 * @route GET /api/reviews/stats/restaurant/:restaurantId
 * @description Get review statistics for a restaurant
 * @access Public
 */
router.get('/stats/restaurant/:restaurantId', reviewController.getRestaurantReviewStats);

module.exports = router;