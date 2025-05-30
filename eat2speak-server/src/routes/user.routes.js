const express = require('express');
const router = express.Router();

const {
  registerUser,
  getProfile,
  updateProfile
} = require('../controllers/user.controller');

const { verifyToken } = require('../middlewares/auth.middleware');

// Rota para registrar novo usuário
router.post('/register', registerUser);

// Rotas protegidas
router.get('/me', verifyToken, getProfile);
router.put('/me', verifyToken, updateProfile);

module.exports = router;
