const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  verifyEmail,
  requestPasswordReset,
  resetPassword
} = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimiter');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile
} = require('../middleware/validator');

router.post('/register', rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many registration attempts. Please try again after 15 minutes.' }), validateRegister, register);
router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 15, message: 'Too many login attempts. Please try again after 15 minutes.' }), validateLogin, login);
router.get('/me', authenticateJWT, getMe);
router.put('/update-profile', authenticateJWT, validateUpdateProfile, updateProfile);

// Verification and reset routes
router.get('/verify-email/:token', verifyEmail);
router.post('/request-password-reset', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), requestPasswordReset);
router.post('/reset-password/:token', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), resetPassword);

module.exports = router;
