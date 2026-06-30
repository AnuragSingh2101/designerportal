const mongoose = require('mongoose');

const PortfolioProjectSchema = new mongoose.Schema({
  designerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DesignerProfile',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a project title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a project description'],
    trim: true
  },
  images: {
    type: [String],
    required: [true, 'Please add at least one project image url'],
    validate: [v => Array.isArray(v) && v.length > 0, 'Project must have at least one image']
  },
  style: {
    type: String,
    required: [true, 'Please add a design style (e.g. Modern, Minimalist, Scandinavian)'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category (e.g. Residential, Commercial, Renovation)'],
    enum: ['Residential', 'Commercial', 'Renovation', 'Landscape', 'Other'],
    default: 'Residential'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PortfolioProject', PortfolioProjectSchema);
