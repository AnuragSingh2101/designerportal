const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an article title'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  summary: {
    type: String,
    required: [true, 'Please add a summary'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please add the article content'],
    trim: true
  },
  authorName: {
    type: String,
    default: 'Editorial Team'
  },
  tags: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['Trends', 'Infrastructure', 'Sustainability', 'Smart Homes', 'Decor'],
    default: 'Trends'
  },
  coverImage: {
    type: String,
    required: [true, 'Please add a cover image URL']
  },
  readingTimeMinutes: {
    type: Number,
    default: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Article', ArticleSchema);
