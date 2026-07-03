const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, jwtSecret);
    
    // Attach user to request, verifying the user still exists
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Block access if user is suspended
    if (user.suspended) {
      return res.status(403).json({ message: 'Your account has been suspended by an administrator. Please contact support.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT auth error:', error.message);
    res.status(401).json({ message: 'Token is not valid or expired' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const rolesArray = Array.isArray(roles) ? roles : [roles];
    
    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Role '${req.user.role}' is not authorized.` });
    }

    next();
  };
};

module.exports = { authenticateJWT, requireRole };
