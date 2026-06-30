const PortfolioProject = require('../models/PortfolioProject');
const DesignerProfile = require('../models/DesignerProfile');

// @desc    Create a new portfolio project
// @route   POST /api/portfolio
// @access  Private (Designer only)
exports.createProject = async (req, res) => {
  try {
    const { title, description, images, style, category } = req.body;

    if (!title || !description || !images || !style || !category) {
      return res.status(400).json({ message: 'Please provide title, description, images, style, and category' });
    }

    // Get designer profile linked to user
    const designer = await DesignerProfile.findOne({ userId: req.user._id });
    if (!designer) {
      return res.status(400).json({ message: 'Designer profile not found for this user' });
    }

    const project = await PortfolioProject.create({
      designerId: designer._id,
      title,
      description,
      images,
      style,
      category
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('createProject error:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

// @desc    Update a portfolio project
// @route   PUT /api/portfolio/:id
// @access  Private (Designer owner or admin)
exports.updateProject = async (req, res) => {
  try {
    const project = await PortfolioProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Portfolio project not found' });
    }

    // Get designer profile of logged-in user
    const designer = await DesignerProfile.findOne({ userId: req.user._id });
    if (!designer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Verify ownership
    if (req.user.role !== 'admin' && project.designerId.toString() !== designer._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to edit this project' });
    }

    const { title, description, images, style, category } = req.body;

    project.title = title !== undefined ? title : project.title;
    project.description = description !== undefined ? description : project.description;
    project.images = images !== undefined ? images : project.images;
    project.style = style !== undefined ? style : project.style;
    project.category = category !== undefined ? category : project.category;

    await project.save();

    res.json(project);
  } catch (error) {
    console.error('updateProject error:', error);
    res.status(500).json({ message: 'Server error updating project' });
  }
};

// @desc    Delete a portfolio project
// @route   DELETE /api/portfolio/:id
// @access  Private (Designer owner or admin)
exports.deleteProject = async (req, res) => {
  try {
    const project = await PortfolioProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Portfolio project not found' });
    }

    // Get designer profile
    const designer = await DesignerProfile.findOne({ userId: req.user._id });
    if (!designer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Verify ownership
    if (req.user.role !== 'admin' && project.designerId.toString() !== designer._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this project' });
    }

    await PortfolioProject.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('deleteProject error:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
};

// @desc    Get all portfolio projects of a designer
// @route   GET /api/portfolio/designer/:designerId
// @access  Public
exports.getProjectsByDesigner = async (req, res) => {
  try {
    const projects = await PortfolioProject.find({ designerId: req.params.designerId });
    res.json(projects);
  } catch (error) {
    console.error('getProjectsByDesigner error:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};
