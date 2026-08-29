/**
 * Language Routes
 * 
 * Provides API endpoints for language management, including:
 * - Setting user language preferences
 * - Retrieving available languages
 * - Managing user language proficiency levels
 * 
 * @module routes/language.routes
 */

const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { verifyAuthToken } = require('../middlewares/auth.middleware');
const languageController = require('../controllers/language.controller');

/**
 * @route GET /api/languages
 * @description Get list of available languages
 * @access Public
 */
router.get('/', languageController.getLanguages);

/**
 * @route GET /api/languages/:id
 * @description Get language details by ID
 * @access Public
 */
router.get('/:id', languageController.getLanguageById);

/**
 * @route GET /api/languages/user/:userId
 * @description Get languages for a specific user
 * @access Public
 */
router.get('/user/:userId', languageController.getUserLanguages);

/**
 * @route GET /api/languages/me
 * @description Get languages for the current user
 * @access Private (requires authentication)
 */
router.get('/me', verifyAuthToken, languageController.getMyLanguages);

/**
 * @route POST /api/languages/user
 * @description Add a language to the current user
 * @access Private (requires authentication)
 */
router.post('/user', verifyAuthToken, languageController.addUserLanguage);

/**
 * @route PUT /api/languages/user/:languageId
 * @description Update user's language proficiency
 * @access Private (requires authentication)
 */
router.put('/user/:languageId', verifyAuthToken, languageController.updateUserLanguage);

/**
 * @route DELETE /api/languages/user/:languageId
 * @description Remove a language from the current user
 * @access Private (requires authentication)
 */
router.delete('/user/:languageId', verifyAuthToken, languageController.removeUserLanguage);

/**
 * @route GET /api/languages/stats
 * @description Get language statistics (popular languages, etc.)
 * @access Public
 */
router.get('/stats', languageController.getLanguageStats);

/**
 * @route GET /api/languages/native
 * @description Get list of native speakers by language
 * @access Public
 */
router.get('/native', languageController.getNativeSpeakers);

/**
 * @route GET /api/languages/:languageId/speakers
 * @description Get users who speak a specific language
 * @access Public
 */
router.get('/:languageId/speakers', languageController.getLanguageSpeakers);

module.exports = router;