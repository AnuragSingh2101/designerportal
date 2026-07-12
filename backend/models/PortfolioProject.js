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
  beforeAfterImages: {
    before: { type: String, default: '' },
    after: { type: String, default: '' }
  },
  budgetTier: {
    type: String,
    enum: ['Basic', 'Medium', 'Premium', 'Luxury'],
    default: 'Medium'
  },
  roomType: {
    type: String,
    enum: ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Outdoor', 'Office', 'Whole House'],
    default: 'Whole House'
  },
  specifications: {
    durationWeeks: { type: Number },
    costUSD: { type: Number },
    materialsUsed: [{ type: String }]
  },
  caseStudyDetails: {
    objectives: { type: String },
    challenges: { type: String },
    solutions: { type: String }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PortfolioProject', PortfolioProjectSchema);
