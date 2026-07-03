const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const urlRegex = /^https?:\/\/.+/;

const validateRegister = (req, res, next) => {
  const { name, email, password, role, profilePhoto } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 50) {
    return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
  }
  
  if (!email || typeof email !== 'string' || !emailRegex.test(email) || email.length > 100) {
    return res.status(400).json({ message: 'Please provide a valid email address (max 100 characters)' });
  }
  
  if (!password || typeof password !== 'string' || password.length < 8 || password.length > 100) {
    return res.status(400).json({ message: 'Password must be between 8 and 100 characters' });
  }
  
  if (role && !['client', 'designer'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role selection' });
  }
  
  if (profilePhoto && (typeof profilePhoto !== 'string' || !urlRegex.test(profilePhoto))) {
    return res.status(400).json({ message: 'Profile photo must be a valid URL' });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }
  
  if (!password || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ message: 'Password is required' });
  }
  
  next();
};

const validateUpdateProfile = (req, res, next) => {
  const { name, profilePhoto } = req.body;
  
  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2 || name.length > 50)) {
    return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
  }
  
  if (profilePhoto !== undefined && profilePhoto !== '' && (typeof profilePhoto !== 'string' || !urlRegex.test(profilePhoto))) {
    return res.status(400).json({ message: 'Profile photo must be a valid URL' });
  }
  
  next();
};

const validateInquiry = (req, res, next) => {
  const { designerId, projectRequirement, budget, message } = req.body;
  
  if (!designerId || !objectIdRegex.test(designerId)) {
    return res.status(400).json({ message: 'A valid designer ID is required' });
  }
  
  if (!projectRequirement || typeof projectRequirement !== 'string' || projectRequirement.trim().length < 10 || projectRequirement.length > 2000) {
    return res.status(400).json({ message: 'Project requirement must be between 10 and 2000 characters' });
  }
  
  if (budget === undefined || isNaN(budget) || Number(budget) <= 0) {
    return res.status(400).json({ message: 'Budget must be a positive number' });
  }
  
  if (!message || typeof message !== 'string' || message.trim().length < 10 || message.length > 2000) {
    return res.status(400).json({ message: 'Message must be between 10 and 2000 characters' });
  }
  
  next();
};

const validateReview = (req, res, next) => {
  const { designerId, rating, feedback } = req.body;
  
  if (!designerId || !objectIdRegex.test(designerId)) {
    return res.status(400).json({ message: 'A valid designer ID is required' });
  }
  
  if (rating === undefined || isNaN(rating) || Number(rating) < 1 || Number(rating) > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
  }
  
  if (!feedback || typeof feedback !== 'string' || feedback.trim().length < 5 || feedback.length > 1000) {
    return res.status(400).json({ message: 'Feedback must be between 5 and 1000 characters' });
  }
  
  next();
};

const validateProject = (req, res, next) => {
  const { title, description, images, style, category } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim().length < 3 || title.length > 100) {
    return res.status(400).json({ message: 'Title must be between 3 and 100 characters' });
  }
  
  if (!description || typeof description !== 'string' || description.trim().length < 10 || description.length > 2000) {
    return res.status(400).json({ message: 'Description must be between 10 and 2000 characters' });
  }
  
  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ message: 'At least one project image URL is required' });
  }
  
  for (const url of images) {
    if (typeof url !== 'string' || !urlRegex.test(url)) {
      return res.status(400).json({ message: 'Each image must be a valid HTTP/HTTPS URL' });
    }
  }
  
  if (!style || typeof style !== 'string' || style.trim().length < 2 || style.length > 50) {
    return res.status(400).json({ message: 'Design style is required (2-50 characters)' });
  }
  
  const allowedCategories = ['Residential', 'Commercial', 'Renovation', 'Landscape', 'Other'];
  if (!category || !allowedCategories.includes(category)) {
    return res.status(400).json({ message: `Category must be one of: ${allowedCategories.join(', ')}` });
  }
  
  next();
};

const validateReport = (req, res, next) => {
  const { targetType, targetId, reason } = req.body;
  
  if (!targetType || !['user', 'project'].includes(targetType)) {
    return res.status(400).json({ message: 'Target type must be "user" or "project"' });
  }
  
  if (!targetId || !objectIdRegex.test(targetId)) {
    return res.status(400).json({ message: 'A valid target ID is required' });
  }
  
  if (!reason || typeof reason !== 'string' || reason.trim().length < 5 || reason.length > 500) {
    return res.status(400).json({ message: 'Reason must be between 5 and 500 characters' });
  }
  
  next();
};

const validateObjectIdParam = (req, res, next) => {
  if (!objectIdRegex.test(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID parameter format' });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateInquiry,
  validateReview,
  validateProject,
  validateReport,
  validateObjectIdParam
};
