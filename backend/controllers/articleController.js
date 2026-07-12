const Article = require('../models/Article');

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
exports.getArticles = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) {
      filter.category = category;
    }
    const articles = await Article.find(filter).sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    console.error('getArticles error:', error);
    res.status(500).json({ message: 'Server error fetching articles' });
  }
};

// @desc    Get article by slug
// @route   GET /api/articles/:slug
// @access  Public
exports.getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    console.error('getArticleBySlug error:', error);
    res.status(500).json({ message: 'Server error retrieving article' });
  }
};

// @desc    Create an article
// @route   POST /api/articles
// @access  Private (Admin only)
exports.createArticle = async (req, res) => {
  try {
    const { title, summary, content, category, coverImage, tags, readingTimeMinutes } = req.body;

    if (!title || !summary || !content || !coverImage) {
      return res.status(400).json({ message: 'Title, summary, content, and cover image are required' });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const exists = await Article.findOne({ slug });
    if (exists) {
      return res.status(400).json({ message: 'An article with this title or slug already exists' });
    }

    const article = await Article.create({
      title,
      slug,
      summary,
      content,
      category: category || 'Trends',
      coverImage,
      tags: tags || [],
      readingTimeMinutes: readingTimeMinutes || 5,
      authorName: req.user.name || 'Editorial Team'
    });

    res.status(201).json(article);
  } catch (error) {
    console.error('createArticle error:', error);
    res.status(500).json({ message: 'Server error creating article' });
  }
};

// @desc    Delete an article
// @route   DELETE /api/articles/:id
// @access  Private (Admin only)
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('deleteArticle error:', error);
    res.status(500).json({ message: 'Server error deleting article' });
  }
};
