const express = require('express');
const router = express.Router();
const { createReview, getDesignerReviews } = require('../controllers/reviewController');
const { authenticateJWT, requireRole } = require('../middleware/auth');

router.post('/', authenticateJWT, requireRole('client'), createReview);
router.get('/designer/:designerId', getDesignerReviews);

module.exports = router;
