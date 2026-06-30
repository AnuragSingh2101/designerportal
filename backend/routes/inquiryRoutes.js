const express = require('express');
const router = express.Router();
const { createInquiry, getClientInquiries, getDesignerInquiries, respondToInquiry, updateInquiryStatus } = require('../controllers/inquiryController');
const { authenticateJWT } = require('../middleware/auth');

router.post('/', authenticateJWT, createInquiry);
router.get('/client/:clientId', authenticateJWT, getClientInquiries);
router.get('/designer/:designerId', authenticateJWT, getDesignerInquiries);
router.put('/:id/respond', authenticateJWT, respondToInquiry);
router.put('/:id/status', authenticateJWT, updateInquiryStatus);

module.exports = router;
