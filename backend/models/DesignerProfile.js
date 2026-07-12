const mongoose = require('mongoose');

const DesignerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  expertise: {
    type: [String],
    default: [] // e.g. ["architecture", "interior_design"]
  },
  experienceYears: {
    type: Number,
    required: [true, 'Please add years of experience'],
    min: [0, 'Experience cannot be negative']
  },
  location: {
    type: String,
    required: [true, 'Please add location'],
    trim: true
  },
  budgetMin: {
    type: Number,
    required: [true, 'Please add minimum budget limit'],
    min: [0, 'Budget cannot be negative']
  },
  budgetMax: {
    type: Number,
    required: [true, 'Please add maximum budget limit'],
    min: [0, 'Budget cannot be negative']
  },
  bio: {
    type: String,
    required: [true, 'Please add a bio'],
    trim: true
  },
  profilePhotoUrl: {
    type: String,
    default: ''
  },
  avgRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  licenseType: {
    type: String,
    default: '' // e.g. 'AIA', 'NCIDQ'
  },
  licenseNumber: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DesignerProfile', DesignerProfileSchema);
