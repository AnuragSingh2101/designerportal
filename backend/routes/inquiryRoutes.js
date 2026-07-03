const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getClientInquiries,
  getDesignerInquiries,
  respondToInquiry,
  updateInquiryStatus
} = require('../controllers/inquiryController');
const { authenticateJWT, requireRole } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimiter');
const { validateInquiry, validateObjectIdParam } = require('../middleware/validator');

// Create inquiry (Client only, rate-limited to avoid spam)
router.post(
  '/',
  authenticateJWT,
  requireRole('client'),
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many inquiries sent. Please try again later.' }),
  validateInquiry,
  createInquiry
);

router.get('/client/:clientId', authenticateJWT, getClientInquiries);
router.get('/designer/:designerId', authenticateJWT, getDesignerInquiries);

// Respond and status change routes require valid ID parameter
router.put('/:id/respond', authenticateJWT, validateObjectIdParam, respondToInquiry);
router.put('/:id/status', authenticateJWT, validateObjectIdParam, updateInquiryStatus);

module.exports = router;
