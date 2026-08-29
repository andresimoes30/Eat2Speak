/**
 * Session Routes
 * 
 * Provides API endpoints for language learning session management, including:
 * - Creating new sessions
 * - Retrieving session details
 * - Updating session status
 * - Managing session participants
 * - Handling session payments
 * 
 * @module routes/session.routes
 */

const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { verifyAuthToken } = require('../middlewares/auth.middleware');
const sessionController = require('../controllers/session.controller');

/**
 * @route GET /api/sessions
 * @description Get list of sessions with filters for user role (learner/native/restaurant)
 * @access Private (requires authentication)
 */
router.get('/', verifyAuthToken, sessionController.getSessions);

/**
 * @route GET /api/sessions/:id
 * @description Get session details by ID
 * @access Private (requires authentication and authorization)
 */
router.get('/:id', verifyAuthToken, sessionController.getSessionById);

/**
 * @route POST /api/sessions
 * @description Create a new session request (learner initiates)
 * @access Private (requires authentication and learner role)
 */
router.post('/', verifyAuthToken, sessionController.createSession);

/**
 * @route PUT /api/sessions/:id
 * @description Update session details
 * @access Private (requires authentication and authorization)
 */
router.put('/:id', verifyAuthToken, sessionController.updateSession);

/**
 * @route PUT /api/sessions/:id/status
 * @description Update session status (confirm, cancel, complete)
 * @access Private (requires authentication and authorization)
 */
router.put('/:id/status', verifyAuthToken, sessionController.updateSessionStatus);

/**
 * @route GET /api/sessions/upcoming
 * @description Get upcoming sessions for current user
 * @access Private (requires authentication)
 */
router.get('/upcoming', verifyAuthToken, sessionController.getUpcomingSessions);

/**
 * @route GET /api/sessions/history
 * @description Get session history for current user
 * @access Private (requires authentication)
 */
router.get('/history', verifyAuthToken, sessionController.getSessionHistory);

/**
 * @route POST /api/sessions/:id/cancel
 * @description Cancel a session
 * @access Private (requires authentication and authorization)
 */
router.post('/:id/cancel', verifyAuthToken, sessionController.cancelSession);

/**
 * @route POST /api/sessions/:id/review
 * @description Add a review for a completed session
 * @access Private (requires authentication and session participant)
 */
router.post('/:id/review', verifyAuthToken, sessionController.addSessionReview);

/**
 * @route GET /api/sessions/:id/payment
 * @description Get payment details for a session
 * @access Private (requires authentication and session participant)
 */
router.get('/:id/payment', verifyAuthToken, sessionController.getSessionPayment);

/**
 * @route POST /api/sessions/:id/payment
 * @description Process payment for a session
 * @access Private (requires authentication and learner role)
 */
router.post('/:id/payment', verifyAuthToken, sessionController.processSessionPayment);

module.exports = router;