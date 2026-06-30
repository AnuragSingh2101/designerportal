const DesignerProfile = require('../models/DesignerProfile');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');

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

    // 1. Search name or bio
    if (search) {
      const matchingUsers = await User.find({
        name: { $regex: search, $options: 'i' },
        role: 'designer'
      });
      const userIds = matchingUsers.map(u => u._id);

      query.$or = [
        { userId: { $in: userIds } },
        { bio: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Filter by expertise (multi-select check)
    if (expertise) {
      const expertiseArray = Array.isArray(expertise) ? expertise : [expertise];
      query.expertise = { $in: expertiseArray };
    }

    // 3. Filter by location
    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }

    // 4. Filter by Budget Range (overlapping)
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

    // Define Sorting
    let sortOptions = {};
    if (sort === 'rating') {
      sortOptions = { avgRating: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'experience') {
      sortOptions = { experienceYears: -1 };
    } else {
      // Default: sort by average rating
      sortOptions = { avgRating: -1 };
    }

    let total = 0;
    let designers = [];

    // If sorting by "popularity", we sort by number of inquiries in-memory
    if (sort === 'popularity') {
      // Fetch all matching designers for sorting
      designers = await DesignerProfile.find(query)
        .populate('userId', 'name email role');

      const inquiries = await Inquiry.aggregate([
        { $group: { _id: '$designerId', count: { $sum: 1 } } }
      ]);
      const inquiryMap = {};
      inquiries.forEach(i => {
        inquiryMap[i._id.toString()] = i.count;
      });

      designers = designers.sort((a, b) => {
        const countA = inquiryMap[a._id.toString()] || 0;
        const countB = inquiryMap[b._id.toString()] || 0;
        return countB - countA; // descending order of popularity
      });

      total = designers.length;
      designers = designers.slice(skip, skip + limit);
    } else {
      total = await DesignerProfile.countDocuments(query);
      designers = await DesignerProfile.find(query)
        .populate('userId', 'name email role')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);
    }

    res.json({
      designers,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('getDesigners error:', error);
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
    console.error('getDesignerById error:', error);
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

    // Populate user and return
    const updated = await DesignerProfile.findById(designer._id).populate('userId', 'name email role');
    res.json(updated);
  } catch (error) {
    console.error('updateDesignerProfile error:', error);
    res.status(500).json({ message: 'Server error updating designer profile' });
  }
};
