const express = require('express');
const router = express.Router();
const {
  getUsers,
  toggleSuspendUser,
  deleteUser,
  getAnalytics,
  getReports,
  submitReport,
  resolveReport,
  deleteProject
} = require('../controllers/adminController');
const { authenticateJWT, requireRole } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimiter');
const { validateReport, validateObjectIdParam } = require('../middleware/validator');

// Public/User accessible report endpoint (rate-limited to prevent spam abuse)
router.post(
  '/reports',
  authenticateJWT,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many reports submitted. Please try again later.' }),
  validateReport,
  submitReport
);

// Admin-only endpoints
router.get('/users', authenticateJWT, requireRole('admin'), getUsers);

router.put(
  '/users/:id/suspend',
  authenticateJWT,
  requireRole('admin'),
  validateObjectIdParam,
  toggleSuspendUser
);

router.delete(
  '/users/:id',
  authenticateJWT,
  requireRole('admin'),
  validateObjectIdParam,
  deleteUser
);

router.delete(
  '/projects/:id',
  authenticateJWT,
  requireRole('admin'),
  validateObjectIdParam,
  deleteProject
);

router.get('/analytics', authenticateJWT, requireRole('admin'), getAnalytics);
router.get('/reports', authenticateJWT, requireRole('admin'), getReports);

router.put(
  '/reports/:id/resolve',
  authenticateJWT,
  requireRole('admin'),
  validateObjectIdParam,
  resolveReport
);

module.exports = router;
