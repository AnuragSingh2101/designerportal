const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  senderRole: {
    type: String,
    enum: ['client', 'designer'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const InquirySchema = new mongoose.Schema({
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
  projectRequirement: {
    type: String,
    required: [true, 'Please state your project requirements'],
    trim: true
  },
  budget: {
    type: Number,
    required: [true, 'Please specify your budget'],
    min: [0, 'Budget must be positive']
  },
  message: {
    type: String,
    required: [true, 'Please add an initial message'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'responded', 'closed'],
    default: 'pending'
  },
  responses: [ResponseSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inquiry', InquirySchema);
