const express = require('express');
const router = express.Router();
const { createReview, getDesignerReviews } = require('../controllers/reviewController');
const { authenticateJWT, requireRole } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimiter');
const { validateReview } = require('../middleware/validator');

router.post(
  '/',
  authenticateJWT,
  requireRole('client'),
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many reviews submitted. Please try again later.' }),
  validateReview,
  createReview
);

router.get('/designer/:designerId', getDesignerReviews);

module.exports = router;
