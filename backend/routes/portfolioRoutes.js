const express = require('express');
const router = express.Router();
const { createProject, updateProject, deleteProject, getProjectsByDesigner } = require('../controllers/portfolioController');
const { authenticateJWT, requireRole } = require('../middleware/auth');

router.post('/', authenticateJWT, requireRole('designer'), createProject);
router.put('/:id', authenticateJWT, requireRole(['designer', 'admin']), updateProject);
router.delete('/:id', authenticateJWT, requireRole(['designer', 'admin']), deleteProject);
router.get('/designer/:designerId', getProjectsByDesigner);

module.exports = router;
