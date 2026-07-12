const InspirationBoard = require('../models/InspirationBoard');
const PortfolioProject = require('../models/PortfolioProject');

// @desc    Get user's inspiration board
// @route   GET /api/inspiration
// @access  Private
exports.getUserBoard = async (req, res) => {
  try {
    let board = await InspirationBoard.findOne({ userId: req.user._id });
    if (!board) {
      // Auto-create board for the user
      board = await InspirationBoard.create({
        userId: req.user._id,
        name: 'My Inspirations',
        savedImages: []
      });
    }
    res.json(board);
  } catch (error) {
    console.error('getUserBoard error:', error);
    res.status(500).json({ message: 'Server error retrieving inspiration board' });
  }
};

// @desc    Save an image to user's inspiration board
// @route   POST /api/inspiration/save
// @access  Private
exports.saveImage = async (req, res) => {
  try {
    const { imageUrl, style, roomType, projectId } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: 'Please provide imageUrl' });
    }

    let board = await InspirationBoard.findOne({ userId: req.user._id });
    if (!board) {
      board = await InspirationBoard.create({
        userId: req.user._id,
        name: 'My Inspirations',
        savedImages: []
      });
    }

    // Check if already saved
    const exists = board.savedImages.some(img => img.imageUrl === imageUrl);
    if (exists) {
      return res.status(400).json({ message: 'Image already saved to your board' });
    }

    board.savedImages.push({ imageUrl, style, roomType, projectId });
    await board.save();

    res.status(201).json(board);
  } catch (error) {
    console.error('saveImage error:', error);
    res.status(500).json({ message: 'Server error saving image' });
  }
};

// @desc    Remove an image from user's inspiration board
// @route   POST /api/inspiration/remove
// @access  Private
exports.removeImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: 'Please provide imageUrl' });
    }

    let board = await InspirationBoard.findOne({ userId: req.user._id });
    if (!board) {
      return res.status(404).json({ message: 'Inspiration board not found' });
    }

    board.savedImages = board.savedImages.filter(img => img.imageUrl !== imageUrl);
    await board.save();

    res.json(board);
  } catch (error) {
    console.error('removeImage error:', error);
    res.status(500).json({ message: 'Server error removing image' });
  }
};

// @desc    Get all project images in the system (Pinterest pool)
// @route   GET /api/inspiration/pool
// @access  Public
exports.getInspirationPool = async (req, res) => {
  try {
    // Find all portfolio projects and populate designer details
    const projects = await PortfolioProject.find()
      .populate({
        path: 'designerId',
        populate: { path: 'userId', select: 'name' }
      });

    // Flatten all images from projects into inspiration items
    const pool = [];
    projects.forEach(project => {
      // Gather primary image
      if (project.images && project.images.length > 0) {
        project.images.forEach((imgUrl, index) => {
          pool.push({
            id: `${project._id}-${index}`,
            imageUrl: imgUrl,
            projectId: project._id,
            projectTitle: project.title,
            designerName: project.designerId?.userId?.name || 'Vetted Studio',
            designerId: project.designerId?._id,
            style: project.style,
            roomType: project.roomType,
            budgetTier: project.budgetTier,
            category: project.category
          });
        });
      }
      
      // Also add beforeAfter images if they exist
      if (project.beforeAfterImages) {
        if (project.beforeAfterImages.before) {
          pool.push({
            id: `${project._id}-before`,
            imageUrl: project.beforeAfterImages.before,
            projectId: project._id,
            projectTitle: `${project.title} (Before)`,
            designerName: project.designerId?.userId?.name || 'Vetted Studio',
            designerId: project.designerId?._id,
            style: project.style,
            roomType: project.roomType,
            budgetTier: project.budgetTier,
            category: project.category,
            isBefore: true
          });
        }
        if (project.beforeAfterImages.after) {
          pool.push({
            id: `${project._id}-after`,
            imageUrl: project.beforeAfterImages.after,
            projectId: project._id,
            projectTitle: `${project.title} (After)`,
            designerName: project.designerId?.userId?.name || 'Vetted Studio',
            designerId: project.designerId?._id,
            style: project.style,
            roomType: project.roomType,
            budgetTier: project.budgetTier,
            category: project.category,
            isAfter: true
          });
        }
      }
    });

    res.json(pool);
  } catch (error) {
    console.error('getInspirationPool error:', error);
    res.status(500).json({ message: 'Server error retrieving inspiration pool' });
  }
};
