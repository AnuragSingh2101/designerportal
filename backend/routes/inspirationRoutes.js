const express = require('express');
const router = express.Router();
const {
  getUserBoard,
  saveImage,
  removeImage,
  getInspirationPool
} = require('../controllers/inspirationController');
const { authenticateJWT } = require('../middleware/auth');

// Public route to fetch all design photos Pinterest-style
router.get('/pool', getInspirationPool);

// Private routes for authenticated users to manage their inspiration board
router.get('/', authenticateJWT, getUserBoard);
router.post('/save', authenticateJWT, saveImage);
router.post('/remove', authenticateJWT, removeImage);

module.exports = router;
