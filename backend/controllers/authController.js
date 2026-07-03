const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const DesignerProfile = require('../models/DesignerProfile');
const logger = require('../utils/logger');

const cleanEnvVar = (val) => val ? val.replace(/^['"]|['"]$/g, '') : val;

// Helper to generate JWT
const generateToken = (userId, role) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured in environment');
  }
  return jwt.sign({ id: userId, role }, jwtSecret, { expiresIn: '1d' }); // 1 day session limit
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, profilePhoto } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      logger.warn('Registration attempt failed: email already registered', { email });
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Determine role (automatically grant 'admin' if registering with admin credentials)
    const adminEmail = cleanEnvVar(process.env.ADMIN_EMAIL);
    const finalRole = (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) ? 'admin' : (role || 'client');

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: finalRole,
      profilePhoto: profilePhoto || '',
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpires
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
        profilePhotoUrl: profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
      });
    }

    // Log the email verification token in console for local development verification
    logger.info('User registered successfully. Email verification token generated.', {
      userId: user._id,
      email: user.email,
      verificationToken
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        isEmailVerified: user.isEmailVerified
      },
      designerProfileId: designerProfile ? designerProfile._id : null
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    let user = await User.findOne({ email: email.toLowerCase() });
    
    // Check if credentials match dynamic admin configuration
    const adminEmail = cleanEnvVar(process.env.ADMIN_EMAIL);
    const adminPassword = cleanEnvVar(process.env.ADMIN_PASSWORD);
    const adminName = cleanEnvVar(process.env.ADMIN_NAME) || 'Admin';
    
    const isDesignatedAdmin = adminEmail && email.toLowerCase() === adminEmail.toLowerCase();

    let adminLoginVerified = false;

    if (isDesignatedAdmin && adminPassword && password === adminPassword) {
      adminLoginVerified = true;
      
      // Look for the admin user in the database
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
          role: 'admin',
          isEmailVerified: true
        });
      } else {
        // Update details in database to match current .env configuration
        user.name = adminName;
        user.email = adminEmail.toLowerCase();
        user.passwordHash = passwordHash;
        user.isEmailVerified = true;
        await user.save();
      }
    }

    if (!user) {
      logger.warn('Login attempt failed: email not found', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if suspended
    if (user.suspended) {
      logger.warn('Suspended user attempted login', { email: user.email, userId: user._id });
      return res.status(403).json({ message: 'Your account has been suspended by an administrator. Please contact support.' });
    }

    // Match password (bypass if verified via admin fallback check)
    if (!adminLoginVerified) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        logger.warn('Login attempt failed: invalid password', { email: user.email });
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

    const token = generateToken(user._id, user.role);

    logger.info('User logged in successfully', { userId: user._id, role: user.role });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        isEmailVerified: user.isEmailVerified
      },
      designerProfileId
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
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
        role: req.user.role,
        profilePhoto: req.user.profilePhoto,
        isEmailVerified: req.user.isEmailVerified
      },
      designerProfileId
    });
  } catch (error) {
    logger.error('getMe error', { error: error.message });
    res.status(500).json({ message: 'Server error retrieving current user' });
  }
};

// @desc    Update current user profile (name and profilePhoto only)
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, profilePhoto } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (profilePhoto !== undefined) {
      user.profilePhoto = profilePhoto;
      // If designer, sync profilePhoto to DesignerProfile.profilePhotoUrl
      if (user.role === 'designer') {
        await DesignerProfile.findOneAndUpdate(
          { userId: user._id },
          { profilePhotoUrl: profilePhoto }
        );
      }
    }

    await user.save();
    logger.info('User updated profile details', { userId: user._id });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    logger.error('updateProfile error', { error: error.message });
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Verify email token
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      logger.warn('Email verification failed: invalid or expired token', { token });
      return res.status(400).json({ message: 'Verification token is invalid or has expired' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.info('User email verified successfully', { userId: user._id });
    res.json({ message: 'Your email has been verified successfully. You can now login.' });
  } catch (error) {
    logger.error('verifyEmail error', { error: error.message });
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

// @desc    Request password reset token
// @route   POST /api/auth/request-password-reset
// @access  Public
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return 200 even if email not found to prevent user enumeration attacks
      logger.warn('Password reset requested for non-existent email', { email });
      return res.json({ message: 'If that email address exists, a password reset link has been sent.' });
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour expiration
    await user.save();

    // Log the password reset link in console for local development verification
    logger.info('Password reset token generated.', {
      userId: user._id,
      email: user.email,
      resetToken
    });

    res.json({ message: 'If that email address exists, a password reset link has been sent.' });
  } catch (error) {
    logger.error('requestPasswordReset error', { error: error.message });
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      logger.warn('Password reset failed: invalid or expired token', { token });
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logger.info('User password reset successfully', { userId: user._id });
    res.json({ message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    logger.error('resetPassword error', { error: error.message });
    res.status(500).json({ message: 'Server error during password reset' });
  }
};
