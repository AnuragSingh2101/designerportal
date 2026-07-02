const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DesignerProfile = require('../models/DesignerProfile');

const cleanEnvVar = (val) => val ? val.replace(/^['"]|['"]$/g, '') : val;


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Determine role (automatically grant 'admin' if registering with admin credentials)
    const adminEmail = cleanEnvVar(process.env.ADMIN_EMAIL);
    const finalRole = (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) ? 'admin' : (role || 'client');


    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: finalRole
    });

    let designerProfile = null;

    // If role is designer, initialize their profile
    if (user.role === 'designer') {
      designerProfile = await DesignerProfile.create({
        userId: user._id,
        expertise: [],
        experienceYears: 0,
        location: 'Not Specified',
        budgetMin: 0,
        budgetMax: 0,
        bio: 'Welcome to my portfolio profile! Edit this to tell clients about yourself.',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
      });
    }

    // Create JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'supersecretkeyfortokensingning12345',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      designerProfileId: designerProfile ? designerProfile._id : null
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    let user = await User.findOne({ email });
    
    // Check if credentials match dynamic admin configuration
    const adminEmail = cleanEnvVar(process.env.ADMIN_EMAIL);
    const adminPassword = cleanEnvVar(process.env.ADMIN_PASSWORD);
    const adminName = cleanEnvVar(process.env.ADMIN_NAME) || 'Admin';
    
    const isDesignatedAdmin = adminEmail && email.toLowerCase() === adminEmail.toLowerCase();

    let adminLoginVerified = false;

    if (isDesignatedAdmin && adminPassword && password === adminPassword) {
      adminLoginVerified = true;
      
      // Look for the admin user in the database. Find by role: 'admin' to handle email changes
      if (!user) {
        user = await User.findOne({ role: 'admin' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      if (!user) {
        // Create admin user on-the-fly if missing
        user = await User.create({
          name: adminName,
          email: adminEmail.toLowerCase(),
          passwordHash,
          role: 'admin'
        });
      } else {
        // Update details in database to match current .env configuration
        user.name = adminName;
        user.email = adminEmail.toLowerCase();
        user.passwordHash = passwordHash;
        await user.save();
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if suspended
    if (user.suspended) {
      return res.status(403).json({ message: 'Your account has been suspended by an administrator. Please contact support.' });
    }

    // Match password (bypass if verified via admin fallback check)
    if (!adminLoginVerified) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    let designerProfileId = null;

    // If designer, fetch profile id
    if (user.role === 'designer') {
      const profile = await DesignerProfile.findOne({ userId: user._id });
      if (profile) {
        designerProfileId = profile._id;
      }
    }

    // Create JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'supersecretkeyfortokensingning12345',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      designerProfileId
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    let designerProfileId = null;
    if (req.user.role === 'designer') {
      const profile = await DesignerProfile.findOne({ userId: req.user._id });
      if (profile) {
        designerProfileId = profile._id;
      }
    }

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      designerProfileId
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Server error retrieving current user' });
  }
};
