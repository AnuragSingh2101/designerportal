const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleBySlug,
  createArticle,
  deleteArticle
} = require('../controllers/articleController');
const { authenticateJWT, requireRole } = require('../middleware/auth');

// Public routes for blog browsing
router.get('/', getArticles);
router.get('/:slug', getArticleBySlug);

// Private Admin routes for article publishing
router.post('/', authenticateJWT, requireRole('admin'), createArticle);
router.delete('/:id', authenticateJWT, requireRole('admin'), deleteArticle);

module.exports = router;
