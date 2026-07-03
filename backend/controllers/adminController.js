const User = require('../models/User');
const DesignerProfile = require('../models/DesignerProfile');
const PortfolioProject = require('../models/PortfolioProject');
const Inquiry = require('../models/Inquiry');
const Review = require('../models/Review');
const Report = require('../models/Report');
const logger = require('../utils/logger');

// @desc    Get all users with their designer profiles attached efficiently
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const usersWithProfiles = await User.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $project: {
          passwordHash: 0,
          resetPasswordToken: 0,
          resetPasswordExpires: 0,
          emailVerificationToken: 0,
          emailVerificationExpires: 0
        }
      },
      {
        $lookup: {
          from: 'designerprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      {
        $addFields: {
          designerProfile: {
            $cond: {
              if: { $eq: ['$role', 'designer'] },
              then: {
                $let: {
                  vars: { firstProfile: { $arrayElemAt: ['$profile', 0] } },
                  in: {
                    $cond: {
                      if: { $gt: [{ $type: '$$firstProfile' }, 'missing'] },
                      then: {
                        id: '$$firstProfile._id',
                        location: '$$firstProfile.location',
                        expertise: '$$firstProfile.expertise',
                        avgRating: '$$firstProfile.avgRating'
                      },
                      else: null
                    }
                  }
                }
              },
              else: null
            }
          }
        }
      },
      {
        $project: {
          profile: 0
        }
      }
    ]);

    res.json(usersWithProfiles);
  } catch (error) {
    logger.error('getUsers admin error', { error: error.message });
    res.status(500).json({ message: 'Server error retrieving users' });
  }
};

// @desc    Toggle suspend/unsuspend user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin only)
exports.toggleSuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot suspend an administrator account' });
    }

    user.suspended = !user.suspended;
    await user.save();

    logger.warn(`User account status modified`, {
      targetUserId: user._id,
      suspended: user.suspended,
      performedBy: req.user._id
    });

    res.json({
      message: `User account has been ${user.suspended ? 'suspended' : 'unsuspended'}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        suspended: user.suspended
      }
    });
  } catch (error) {
    logger.error('toggleSuspendUser admin error', { error: error.message });
    res.status(500).json({ message: 'Server error updating user suspension status' });
  }
};

// @desc    Delete user and all related content cascadingly
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an administrator account' });
    }

    const userId = user._id;

    if (user.role === 'designer') {
      const profile = await DesignerProfile.findOne({ userId });
      if (profile) {
        // Delete projects
        await PortfolioProject.deleteMany({ designerId: profile._id });
        // Delete inquiries
        await Inquiry.deleteMany({ designerId: profile._id });
        // Delete reviews
        await Review.deleteMany({ designerId: profile._id });
        // Delete designer profile
        await DesignerProfile.findByIdAndDelete(profile._id);
      }
    } else if (user.role === 'client') {
      // Delete client inquiries
      await Inquiry.deleteMany({ clientId: userId });
      // Delete client reviews
      await Review.deleteMany({ clientId: userId });
    }

    // Delete reports created by or targeting this user
    await Report.deleteMany({ reportedBy: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    logger.warn(`User account deleted permanently by admin`, {
      deletedUserId: userId,
      deletedUserEmail: user.email,
      performedBy: req.user._id
    });

    res.json({ message: 'User and all related content deleted successfully' });
  } catch (error) {
    logger.error('deleteUser admin error', { error: error.message });
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// @desc    Get analytics summary
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
exports.getAnalytics = async (req, res) => {
  try {
    const totalDesigners = await User.countDocuments({ role: 'designer' });
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalProjects = await PortfolioProject.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();

    // Inquiry response rates
    const closedInquiries = await Inquiry.countDocuments({ status: 'closed' });
    const respondedInquiries = await Inquiry.countDocuments({ status: 'responded' });
    const pendingInquiries = await Inquiry.countDocuments({ status: 'pending' });

    const totalAnswered = closedInquiries + respondedInquiries;
    const responseConversionRate = totalInquiries > 0 
      ? Number(((totalAnswered / totalInquiries) * 100).toFixed(1)) 
      : 0;

    // Projects by Category aggregate
    const projectsByCategory = await PortfolioProject.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Projects by Style aggregate
    const projectsByStyle = await PortfolioProject.aggregate([
      { $group: { _id: '$style', count: { $sum: 1 } } }
    ]);

    // Inquiries by status aggregate
    const inquiriesByStatus = [
      { name: 'Pending', count: pendingInquiries },
      { name: 'Responded', count: respondedInquiries },
      { name: 'Closed', count: closedInquiries }
    ];

    res.json({
      summary: {
        totalDesigners,
        totalClients,
        totalProjects,
        totalInquiries,
        responseConversionRate,
        pendingInquiries
      },
      charts: {
        projectsByCategory,
        projectsByStyle,
        inquiriesByStatus
      }
    });
  } catch (error) {
    logger.error('getAnalytics admin error', { error: error.message });
    res.status(500).json({ message: 'Server error compiling analytics' });
  }
};

// @desc    Get reports queue
// @route   GET /api/admin/reports
// @access  Private (Admin only)
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    logger.error('getReports admin error', { error: error.message });
    res.status(500).json({ message: 'Server error fetching reports list' });
  }
};

// @desc    Submit content report (client/designer)
// @route   POST /api/admin/reports
// @access  Private
exports.submitReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;

    const report = await Report.create({
      reportedBy: req.user._id,
      targetType,
      targetId,
      reason,
      status: 'open'
    });

    logger.warn('Report submitted by user', {
      reportId: report._id,
      reportedBy: req.user._id,
      targetType,
      targetId
    });

    res.status(201).json(report);
  } catch (error) {
    logger.error('submitReport error', { error: error.message });
    res.status(500).json({ message: 'Server error submitting report' });
  }
};

// @desc    Resolve moderation report
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private (Admin only)
exports.resolveReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = 'resolved';
    await report.save();

    logger.info('Moderation report resolved by admin', {
      reportId: report._id,
      resolvedBy: req.user._id
    });

    res.json({ message: 'Report has been successfully resolved', report });
  } catch (error) {
    logger.error('resolveReport admin error', { error: error.message });
    res.status(500).json({ message: 'Server error resolving report' });
  }
};
