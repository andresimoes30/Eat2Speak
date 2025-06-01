const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/auth.controller');
const { loginLimiter } = require('../middlewares/rate-limiter.middleware');
const { validateLogin } = require('../middlewares/validation.middleware');
const { verifyAuthToken } = require('../middlewares/auth.middleware');

/**
 * @route POST /api/auth/login
 * @description Authenticate user and get token
 * @access Public
 */
router.post('/login', loginLimiter, validateLogin, login);

/**
 * @route POST /api/auth/logout
 * @description Logout user and invalidate session
 * @access Private (requires authentication)
 */
router.post('/logout', verifyAuthToken, logout);

module.exports = router;