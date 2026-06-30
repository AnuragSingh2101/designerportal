const Inquiry = require('../models/Inquiry');
const DesignerProfile = require('../models/DesignerProfile');

// @desc    Create a new project inquiry
// @route   POST /api/inquiries
// @access  Private (Client only)
exports.createInquiry = async (req, res) => {
  try {
    const { designerId, projectRequirement, budget, message } = req.body;

    if (!designerId || !projectRequirement || !budget || !message) {
      return res.status(400).json({ message: 'Please provide designerId, projectRequirement, budget, and message' });
    }

    // Verify designer profile exists
    const designer = await DesignerProfile.findById(designerId);
    if (!designer) {
      return res.status(404).json({ message: 'Designer profile not found' });
    }

    const inquiry = await Inquiry.create({
      clientId: req.user._id,
      designerId,
      projectRequirement,
      budget,
      message,
      status: 'pending',
      responses: []
    });

    res.status(201).json(inquiry);
  } catch (error) {
    console.error('createInquiry error:', error);
    res.status(500).json({ message: 'Server error creating inquiry' });
  }
};

// @desc    Get client's inquiries
// @route   GET /api/inquiries/client/:clientId
// @access  Private (Client owner or admin)
exports.getClientInquiries = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.clientId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to view these inquiries' });
    }

    const inquiries = await Inquiry.find({ clientId: req.params.clientId })
      .populate({
        path: 'designerId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });

    res.json(inquiries);
  } catch (error) {
    console.error('getClientInquiries error:', error);
    res.status(500).json({ message: 'Server error retrieving inquiries' });
  }
};

// @desc    Get designer's inquiries
// @route   GET /api/inquiries/designer/:designerId
// @access  Private (Designer owner or admin)
exports.getDesignerInquiries = async (req, res) => {
  try {
    const designer = await DesignerProfile.findById(req.params.designerId);
    if (!designer) {
      return res.status(404).json({ message: 'Designer profile not found' });
    }

    if (designer.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to view these inquiries' });
    }

    const inquiries = await Inquiry.find({ designerId: req.params.designerId })
      .populate({
        path: 'designerId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });

    res.json(inquiries);
  } catch (error) {
    console.error('getDesignerInquiries error:', error);
    res.status(500).json({ message: 'Server error retrieving inquiries' });
  }
};

// @desc    Respond to an inquiry (send reply in message thread)
// @route   PUT /api/inquiries/:id/respond
// @access  Private (Client or Designer involved)
exports.respondToInquiry = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const inquiry = await Inquiry.findById(req.params.id)
      .populate('designerId');
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Determine if logged-in user is the client or the designer
    const isClient = inquiry.clientId.toString() === req.user._id.toString();
    const isDesigner = inquiry.designerId.userId.toString() === req.user._id.toString();

    if (!isClient && !isDesigner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to respond to this inquiry' });
    }

    const senderRole = isClient ? 'client' : 'designer';

    // Append response
    inquiry.responses.push({
      senderRole,
      message,
      timestamp: new Date()
    });

    // Update status based on sender role
    if (senderRole === 'designer' && inquiry.status === 'pending') {
      inquiry.status = 'responded';
    }

    await inquiry.save();

    // Populate and return
    const updatedInquiry = await Inquiry.findById(inquiry._id)
      .populate({
        path: 'designerId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('clientId', 'name email');

    res.json(updatedInquiry);
  } catch (error) {
    console.error('respondToInquiry error:', error);
    res.status(500).json({ message: 'Server error responding to inquiry' });
  }
};

// @desc    Update inquiry status (accept/decline/close)
// @route   PUT /api/inquiries/:id/status
// @access  Private (Client or Designer involved)
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'responded', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status type' });
    }

    const inquiry = await Inquiry.findById(req.params.id)
      .populate('designerId');
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    const isClient = inquiry.clientId.toString() === req.user._id.toString();
    const isDesigner = inquiry.designerId.userId.toString() === req.user._id.toString();

    if (!isClient && !isDesigner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to modify status' });
    }

    inquiry.status = status;
    await inquiry.save();

    const updatedInquiry = await Inquiry.findById(inquiry._id)
      .populate({
        path: 'designerId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('clientId', 'name email');

    res.json(updatedInquiry);
  } catch (error) {
    console.error('updateInquiryStatus error:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
};
