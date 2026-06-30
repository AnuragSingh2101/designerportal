const express = require('express');
const router = express.Router();
const { getDesigners, getDesignerById, updateDesignerProfile } = require('../controllers/designerController');
const { authenticateJWT, requireRole } = require('../middleware/auth');

router.get('/', getDesigners);
router.get('/:id', getDesignerById);
router.put('/:id', authenticateJWT, requireRole(['designer', 'admin']), updateDesignerProfile);

module.exports = router;
