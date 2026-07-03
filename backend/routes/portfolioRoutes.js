const express = require('express');
const router = express.Router();
const {
  createProject,
  updateProject,
  deleteProject,
  getProjectsByDesigner
} = require('../controllers/portfolioController');
const { authenticateJWT, requireRole } = require('../middleware/auth');
const { validateProject, validateObjectIdParam } = require('../middleware/validator');

router.post(
  '/',
  authenticateJWT,
  requireRole('designer'),
  validateProject,
  createProject
);

router.put(
  '/:id',
  authenticateJWT,
  requireRole(['designer', 'admin']),
  validateObjectIdParam,
  validateProject,
  updateProject
);

router.delete(
  '/:id',
  authenticateJWT,
  requireRole(['designer', 'admin']),
  validateObjectIdParam,
  deleteProject
);

router.get('/designer/:designerId', getProjectsByDesigner);

module.exports = router;
