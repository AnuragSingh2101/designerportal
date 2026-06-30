const express = require('express');
const router = express.Router();
const { getUsers, toggleSuspendUser, deleteUser, getAnalytics, getReports, submitReport, resolveReport } = require('../controllers/adminController');
const { authenticateJWT, requireRole } = require('../middleware/auth');

// Public/User accessible
router.post('/reports', authenticateJWT, submitReport);

// Admin-only endpoints
router.get('/users', authenticateJWT, requireRole('admin'), getUsers);
router.put('/users/:id/suspend', authenticateJWT, requireRole('admin'), toggleSuspendUser);
router.delete('/users/:id', authenticateJWT, requireRole('admin'), deleteUser);
router.get('/analytics', authenticateJWT, requireRole('admin'), getAnalytics);
router.get('/reports', authenticateJWT, requireRole('admin'), getReports);
router.put('/reports/:id/resolve', authenticateJWT, requireRole('admin'), resolveReport);

module.exports = router;
