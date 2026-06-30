const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  designerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DesignerProfile',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating between 1 and 5'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  feedback: {
    type: String,
    required: [true, 'Please provide written feedback'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a client can only write one review per designer
ReviewSchema.index({ clientId: 1, designerId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
