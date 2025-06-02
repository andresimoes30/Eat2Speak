/**
 * Restaurant Routes
 * 
 * Provides API endpoints for restaurant CRUD operations, including:
 * - List all restaurants with pagination and filtering
 * - Get single restaurant details
 * - Create new restaurant
 * - Update restaurant information
 * - Delete restaurant
 * - Menu management endpoints
 * - Restaurant availability management
 * 
 * @module routes/restaurant.routes
 */

const express = require('express');
const router = express.Router();

// Import controller and middleware
const { verifyAuthToken } = require('../middlewares/auth.middleware');
const { apiLimiter } = require('../middlewares/rate-limiter.middleware');
const restaurantController = require('../controllers/restaurant.controller');

/**
 * @route GET /api/restaurants
 * @description Get list of restaurants with pagination, filtering and sorting
 * @access Public
 * @middleware High-limit rate limiter (200 requests/minute) to prevent API spam while allowing testing
 */
router.get('/', apiLimiter, restaurantController.getRestaurants);

/**
 * @route GET /api/restaurants/:id
 * @description Get restaurant details by ID
 * @access Public
 * @middleware High-limit rate limiter (200 requests/minute) to prevent API spam while allowing testing
 */
router.get('/:id', apiLimiter, restaurantController.getRestaurantById);

/**
 * @route POST /api/restaurants
 * @description Create a new restaurant (requires authentication and restaurant owner role)
 * @access Private
 */
router.post('/', verifyAuthToken, restaurantController.createRestaurant);

/**
 * @route PUT /api/restaurants/:id
 * @description Update restaurant details (requires authentication and ownership)
 * @access Private
 */
router.put('/:id', verifyAuthToken, restaurantController.updateRestaurant);

/**
 * @route DELETE /api/restaurants/:id
 * @description Delete a restaurant (requires authentication and ownership or admin)
 * @access Private
 */
router.delete('/:id', verifyAuthToken, restaurantController.deleteRestaurant);

/**
 * @route GET /api/restaurants/:id/menu
 * @description Get restaurant menu items
 * @access Public
 */
router.get('/:id/menu', restaurantController.getRestaurantMenu);

/**
 * @route POST /api/restaurants/:id/menu
 * @description Add a new menu item to a restaurant (requires authentication and ownership)
 * @access Private
 */
router.post('/:id/menu', verifyAuthToken, restaurantController.addMenuItem);

/**
 * @route PUT /api/restaurants/:id/menu/:menuId
 * @description Update a menu item (requires authentication and ownership)
 * @access Private
 */
router.put('/:id/menu/:menuId', verifyAuthToken, restaurantController.updateMenuItem);

/**
 * @route DELETE /api/restaurants/:id/menu/:menuId
 * @description Delete a menu item (requires authentication and ownership)
 * @access Private
 */
router.delete('/:id/menu/:menuId', verifyAuthToken, restaurantController.deleteMenuItem);

/**
 * @route GET /api/restaurants/:id/availability
 * @description Get restaurant availability for sessions
 * @access Public
 */
router.get('/:id/availability', restaurantController.getAvailability);

/**
 * @route PUT /api/restaurants/:id/availability
 * @description Update restaurant availability (requires authentication and ownership)
 * @access Private
 */
router.put('/:id/availability', verifyAuthToken, restaurantController.updateAvailability);

/**
 * @route GET /api/restaurants/:id/tables
 * @description Get restaurant tables information
 * @access Public
 */
router.get('/:id/tables', restaurantController.getRestaurantTables);

/**
 * @route PUT /api/restaurants/:id/tables
 * @description Update restaurant tables information (requires authentication and ownership)
 * @access Private
 */
router.put('/:id/tables', verifyAuthToken, restaurantController.updateRestaurantTables);

/**
 * @route GET /api/restaurants/:id/reviews
 * @description Get reviews for a restaurant
 * @access Public
 */
router.get('/:id/reviews', restaurantController.getRestaurantReviews);

module.exports = router;