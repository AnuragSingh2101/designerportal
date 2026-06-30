const Review = require('../models/Review');
const DesignerProfile = require('../models/DesignerProfile');
const Inquiry = require('../models/Inquiry');

// @desc    Create a review for a designer
// @route   POST /api/reviews
// @access  Private (Client only)
exports.createReview = async (req, res) => {
  try {
    const { designerId, rating, feedback } = req.body;

    if (!designerId || !rating || !feedback) {
      return res.status(400).json({ message: 'Please provide designerId, rating, and feedback' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // 1. Enforce business rule: must have prior inquiry history
    const priorInquiry = await Inquiry.findOne({
      clientId: req.user._id,
      designerId: designerId
    });

    if (!priorInquiry) {
      return res.status(403).json({
        message: 'Only clients who have a project inquiry history with this designer can leave a review.'
      });
    }

    // 2. Check if already reviewed (handled by unique index too, but let's provide a clean error)
    const existingReview = await Review.findOne({
      clientId: req.user._id,
      designerId: designerId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this designer.' });
    }

    // 3. Create review
    const review = await Review.create({
      clientId: req.user._id,
      designerId,
      rating,
      feedback
    });

    // 4. Recalculate and update designer average rating
    const reviews = await Review.find({ designerId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await DesignerProfile.findByIdAndUpdate(designerId, {
      avgRating: Number(avgRating.toFixed(1))
    });

    const populatedReview = await Review.findById(review._id).populate('clientId', 'name');
    res.status(201).json(populatedReview);
  } catch (error) {
    console.error('createReview error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this designer.' });
    }
    res.status(500).json({ message: 'Server error creating review' });
  }
};

// @desc    Get designer's reviews
// @route   GET /api/reviews/designer/:designerId
// @access  Public
exports.getDesignerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ designerId: req.params.designerId })
      .populate('clientId', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('getDesignerReviews error:', error);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
};
