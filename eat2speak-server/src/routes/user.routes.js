const express = require('express');
const router = express.Router();

const {
  registerUser,
  getProfile,
  updateProfile
} = require('../controllers/user.controller');

const { verifyAuthToken } = require('../middlewares/auth.middleware');

// Rota para registrar novo usuário
router.post('/register', registerUser);

// Rotas protegidas
router.get('/me', verifyAuthToken, getProfile);
router.put('/me', verifyAuthToken, updateProfile);

module.exports = router;
