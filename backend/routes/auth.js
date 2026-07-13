const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register — Register admin with secret code
router.post('/register', authController.register);

// POST /api/auth/login — Login as admin
router.post('/login', authController.login);

// GET /api/auth/me — Get current admin profile (protected)
router.get('/me', protect, authController.getMe);

module.exports = router;
