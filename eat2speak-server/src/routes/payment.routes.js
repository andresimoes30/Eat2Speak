/**
 * Payment Routes
 * 
 * Provides API endpoints for payment processing and management, including:
 * - Processing session payments
 * - Retrieving payment details
 * - Generating payment reports
 * - Managing refunds
 * 
 * @module routes/payment.routes
 */

const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { verifyAuthToken } = require('../middlewares/auth.middleware');
const paymentController = require('../controllers/payment.controller');

/**
 * @route GET /api/payments
 * @description Get list of payments with filtering and pagination
 * @access Private (requires authentication)
 */
router.get('/', verifyAuthToken, paymentController.getPayments);

/**
 * @route GET /api/payments/:id
 * @description Get payment details by ID
 * @access Private (requires authentication and authorization)
 */
router.get('/:id', verifyAuthToken, paymentController.getPaymentById);

/**
 * @route POST /api/payments/session/:sessionId
 * @description Process payment for a session
 * @access Private (requires authentication and learner role)
 */
router.post('/session/:sessionId', verifyAuthToken, paymentController.processSessionPayment);

/**
 * @route POST /api/payments/:id/refund
 * @description Process refund for a payment
 * @access Private (requires authentication and admin role)
 */
router.post('/:id/refund', verifyAuthToken, paymentController.processRefund);

/**
 * @route GET /api/payments/user/:userId
 * @description Get payments for a specific user
 * @access Private (requires authentication and authorization)
 */
router.get('/user/:userId', verifyAuthToken, paymentController.getUserPayments);

/**
 * @route GET /api/payments/restaurant/:restaurantId
 * @description Get payments for a specific restaurant
 * @access Private (requires authentication and authorization)
 */
router.get('/restaurant/:restaurantId', verifyAuthToken, paymentController.getRestaurantPayments);

/**
 * @route GET /api/payments/reports/monthly
 * @description Get monthly payment reports
 * @access Private (requires authentication and admin role)
 */
router.get('/reports/monthly', verifyAuthToken, paymentController.getMonthlyReports);

/**
 * @route GET /api/payments/reports/user/:userId
 * @description Get payment reports for a specific user
 * @access Private (requires authentication and authorization)
 */
router.get('/reports/user/:userId', verifyAuthToken, paymentController.getUserPaymentReports);

/**
 * @route GET /api/payments/reports/restaurant/:restaurantId
 * @description Get payment reports for a specific restaurant
 * @access Private (requires authentication and authorization)
 */
router.get('/reports/restaurant/:restaurantId', verifyAuthToken, paymentController.getRestaurantPaymentReports);

module.exports = router;