const mongoose = require('mongoose');

const InspirationBoardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'My Inspirations'
  },
  savedImages: [{
    imageUrl: { type: String, required: true },
    style: { type: String },
    roomType: { type: String },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'PortfolioProject' }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InspirationBoard', InspirationBoardSchema);
