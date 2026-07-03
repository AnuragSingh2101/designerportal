const DesignerProfile = require('../models/DesignerProfile');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');
const logger = require('../utils/logger');

const escapeRegex = (string) => {
  if (!string || typeof string !== 'string') return '';
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// @desc    Get all designers with search, filter, and sort
// @route   GET /api/designers
// @access  Public
exports.getDesigners = async (req, res) => {
  try {
    const { search, expertise, location, budgetMin, budgetMax, experienceMin, sort } = req.query;

    // Pagination configuration
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const skip = (page - 1) * limit;

    let query = {};

    // 1. Search name or bio (escaped to prevent ReDoS)
    if (search) {
      const escapedSearch = escapeRegex(search);
      const matchingUsers = await User.find({
        name: { $regex: escapedSearch, $options: 'i' },
        role: 'designer'
      });
      const userIds = matchingUsers.map(u => u._id);

      query.$or = [
        { userId: { $in: userIds } },
        { bio: { $regex: escapedSearch, $options: 'i' } },
        { location: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    // 2. Filter by expertise (multi-select check)
    if (expertise) {
      const expertiseArray = Array.isArray(expertise) ? expertise : [expertise];
      query.expertise = { $in: expertiseArray };
    }

    // 3. Filter by location
    if (location && location !== 'All') {
      const escapedLoc = escapeRegex(location);
      query.location = { $regex: escapedLoc, $options: 'i' };
    }

    // 4. Filter by Budget Range
    if (budgetMin) {
      query.budgetMax = { $gte: Number(budgetMin) };
    }
    if (budgetMax) {
      query.budgetMin = { $lte: Number(budgetMax) };
    }

    // 5. Filter by Experience
    if (experienceMin) {
      query.experienceYears = { $gte: Number(experienceMin) };
    }

    // Build aggregation pipeline for sorting, pagination, and counts
    const matchStage = { $match: query };
    const countPipeline = [matchStage, { $count: 'total' }];
    
    const countResult = await DesignerProfile.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    const pipeline = [matchStage];

    // Popularity sort joins with inquiries and counts them inside MongoDB
    if (sort === 'popularity') {
      pipeline.push(
        {
          $lookup: {
            from: 'inquiries',
            localField: '_id',
            foreignField: 'designerId',
            as: 'inquiries'
          }
        },
        {
          $addFields: {
            inquiryCount: { $size: '$inquiries' }
          }
        },
        { $sort: { inquiryCount: -1, _id: 1 } }
      );
    } else {
      let sortOptions = {};
      if (sort === 'rating') {
        sortOptions = { avgRating: -1, _id: 1 };
      } else if (sort === 'newest') {
        sortOptions = { createdAt: -1, _id: 1 };
      } else if (sort === 'experience') {
        sortOptions = { experienceYears: -1, _id: 1 };
      } else {
        sortOptions = { avgRating: -1, _id: 1 }; // Default sort
      }
      pipeline.push({ $sort: sortOptions });
    }

    // Add pagination stages
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Execute aggregation
    let designers = await DesignerProfile.aggregate(pipeline);

    // Populate user profile info (name, email, role)
    designers = await DesignerProfile.populate(designers, {
      path: 'userId',
      select: 'name email role'
    });

    res.json({
      designers,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    logger.error('getDesigners error', { error: error.message });
    res.status(500).json({ message: 'Server error retrieving designers' });
  }
};

// @desc    Get designer profile by ID
// @route   GET /api/designers/:id
// @access  Public
exports.getDesignerById = async (req, res) => {
  try {
    const designer = await DesignerProfile.findById(req.params.id)
      .populate('userId', 'name email role');

    if (!designer) {
      return res.status(404).json({ message: 'Designer profile not found' });
    }

    res.json(designer);
  } catch (error) {
    logger.error('getDesignerById error', { error: error.message });
    res.status(500).json({ message: 'Server error retrieving designer profile' });
  }
};

// @desc    Update designer profile (self or admin only)
// @route   PUT /api/designers/:id
// @access  Private (Designer only, own profile)
exports.updateDesignerProfile = async (req, res) => {
  try {
    let designer = await DesignerProfile.findById(req.params.id);

    if (!designer) {
      return res.status(404).json({ message: 'Designer profile not found' });
    }

    // Check ownership: req.user._id must match designer.userId
    if (designer.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      logger.warn('Unauthorized attempt to update designer profile', {
        designerId: designer._id,
        userId: req.user._id
      });
      return res.status(403).json({ message: 'You are not authorized to update this profile' });
    }

    const { expertise, experienceYears, location, budgetMin, budgetMax, bio, profilePhotoUrl, name } = req.body;

    // Update user details if name changes
    if (name) {
      await User.findByIdAndUpdate(designer.userId, { name });
    }

    // Update fields
    designer.expertise = expertise !== undefined ? expertise : designer.expertise;
    designer.experienceYears = experienceYears !== undefined ? experienceYears : designer.experienceYears;
    designer.location = location !== undefined ? location : designer.location;
    designer.budgetMin = budgetMin !== undefined ? budgetMin : designer.budgetMin;
    designer.budgetMax = budgetMax !== undefined ? budgetMax : designer.budgetMax;
    designer.bio = bio !== undefined ? bio : designer.bio;
    designer.profilePhotoUrl = profilePhotoUrl !== undefined ? profilePhotoUrl : designer.profilePhotoUrl;

    await designer.save();
    logger.info('Designer profile updated', { designerId: designer._id, updatedBy: req.user._id });

    // Populate user and return
    const updated = await DesignerProfile.findById(designer._id).populate('userId', 'name email role');
    res.json(updated);
  } catch (error) {
    logger.error('updateDesignerProfile error', { error: error.message });
    res.status(500).json({ message: 'Server error updating designer profile' });
  }
};
