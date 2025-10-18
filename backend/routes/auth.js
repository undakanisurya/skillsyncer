const express = require('express');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');
const admin = require('../utils/firebase');
const crypto = require('crypto');
const { sendNotificationEmail } = require('../utils/emailService');

const router = express.Router();

// @desc    Test registration data
// @route   POST /api/auth/test-register
// @access  Public
router.post('/test-register', (req, res) => {
  console.log('Test registration data received:', req.body);
  res.json({
    success: true,
    message: 'Data received successfully',
    received: req.body
  });
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'jobseeker' } = req.body;

    console.log('Registration attempt:', { name, email, role, hasPassword: !!password });

    // Validation
    if (!name || !email || !password) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Name validation
    if (!name.trim() || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long'
      });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot exceed 50 characters'
      });
    }

    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Name can only contain letters and spaces'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain both uppercase and lowercase letters'
      });
    }

    if (!/(?=.*\d)/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one number'
      });
    }

    // Role validation
    const validRoles = ['jobseeker', 'employer', 'company', 'mentor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role selected'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Calculate initial profile completion
    user.calculateProfileCompletion();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token,
        profileCompletion: userResponse.profileCompletion
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.log('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Register company/employer
// @route   POST /api/auth/register-company
// @access  Public
router.post('/register-company', async (req, res) => {
  try {
    const { companyName, email, phone, industry, password } = req.body;

    console.log('Company registration attempt:', { companyName, email, industry, hasPassword: !!password });

    // Validation
    if (!companyName || !email || !password || !phone || !industry) {
      console.log('Missing required fields:', { 
        companyName: !!companyName, 
        email: !!email, 
        password: !!password, 
        phone: !!phone, 
        industry: !!industry 
      });
      return res.status(400).json({
        success: false,
        message: 'Please provide company name, email, phone, industry, and password'
      });
    }

    // Company name validation
    if (!companyName.trim() || companyName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Company name must be at least 2 characters long'
      });
    }

    if (companyName.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Company name cannot exceed 100 characters'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Phone validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits starting with 6, 7, 8, or 9'
      });
    }

    // Industry validation
    const validIndustries = ['technology', 'healthcare', 'finance', 'education', 'retail', 'manufacturing', 'consulting', 'media', 'real-estate', 'transportation', 'other'];
    if (!validIndustries.includes(industry)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid industry'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain both uppercase and lowercase letters'
      });
    }

    if (!/(?=.*\d)/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one number'
      });
    }

    // Check if company already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Company already exists with this email'
      });
    }

    // Create company user
    const user = await User.create({
      name: companyName,
      email,
      password,
      role: 'company',
      company: {
        name: companyName,
        phone,
        industry,
        email
      }
    });

    // Calculate initial profile completion
    user.calculateProfileCompletion();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Company registered successfully',
      data: {
        user: {
          id: user._id,
          companyName: user.name,
          email: user.email,
          role: user.role,
          industry: user.company.industry,
          profileCompletion: user.profileCompletion
        }
      }
    });

  } catch (error) {
    console.error('Company registration error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({
        success: false,
        message: 'Company already exists with this email address'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.log('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during company registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    // Get user without password
    const userResponse = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
        profileCompletion: userResponse.profileCompletion
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user,
        profileCompletion: user.profileCompletion
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user data'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields based on role
    const { name, profile, company } = req.body;

    if (name) user.name = name;

    if (user.role === 'jobseeker' && profile) {
      if (profile.bio !== undefined) user.profile.bio = profile.bio;
      if (profile.skills !== undefined) user.profile.skills = profile.skills;
      if (profile.experience !== undefined) user.profile.experience = profile.experience;
      if (profile.location !== undefined) user.profile.location = profile.location;
      if (profile.phone !== undefined) user.profile.phone = profile.phone;
      if (profile.resume !== undefined) user.profile.resume = profile.resume;
      if (profile.portfolio !== undefined) user.profile.portfolio = profile.portfolio;
    }

    if ((user.role === 'employer' || user.role === 'company') && company) {
      if (company.name !== undefined) user.company.name = company.name;
      if (company.description !== undefined) user.company.description = company.description;
      if (company.website !== undefined) user.company.website = company.website;
      if (company.location !== undefined) user.company.location = company.location;
      if (company.size !== undefined) user.company.size = company.size;
    }

    // Calculate and update profile completion
    user.calculateProfileCompletion();
    
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
        profileCompletion: updatedUser.profileCompletion
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Avoid user enumeration
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }

    // Generate secure token and expiry (1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const htmlMsg = `
      <p>We received a request to reset your SkillSyncer account password.</p>
      <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Reset Password</a>
      </p>
      <p>If the button doesn’t work, copy and paste this link into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn’t request this, you can safely ignore this email.</p>
    `;

    // Send email
    await sendNotificationEmail(user.email, 'Reset your SkillSyncer password', htmlMsg);

    return res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server error while sending reset email' });
  }
});

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token, email and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token is invalid or expired' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error while resetting password' });
  }
});

// @desc    Google Sign-in for jobseekers
// @route   POST /api/auth/google-signin
// @access  Public
router.post('/google-signin', async (req, res) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required' });
    }

    // Only allow jobseekers for Google sign-in
    if (role !== 'jobseeker') {
      return res.status(400).json({
        success: false,
        message: 'Google sign-in is only available for job seekers'
      });
    }

    // Verify Google ID token via Firebase Admin (with guard for initialization)
    if (!admin.apps || admin.apps.length === 0) {
      console.error('Firebase Admin not initialized. Check FIREBASE_* env vars or FIREBASE_SERVICE_ACCOUNT.');
      return res.status(500).json({
        success: false,
        message: 'Server auth not configured. Please try again later.'
      });
    }
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email;
    const name = decoded.name || '';
    const photoURL = decoded.picture || '';

    console.log('Google sign-in verified:', { uid, email, namePresent: !!name });

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google token missing email' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists - sign them in
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // Update Google-specific fields if they don't exist
      if (!user.googleId) {
        user.googleId = uid;
      }
      if (!user.profile.avatar && photoURL) {
        user.profile.avatar = photoURL;
      }

      // Update last login
      await user.updateLastLogin();
      await user.save();

    } else {
      // Create new user with Google data
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId: uid,
        role: 'jobseeker',
        isEmailVerified: true, // Google emails are pre-verified
        profile: {
          avatar: photoURL || '',
          bio: '',
          skills: [],
          experience: 'fresher', // Default experience level
          location: '',
          phone: '',
          resume: '',
          portfolio: ''
        }
      });

      // Calculate initial profile completion
      user.calculateProfileCompletion();
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    // Get user without password
    const userResponse = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      message: 'Google sign-in successful',
      data: {
        user: userResponse,
        token,
        profileCompletion: userResponse.profileCompletion
      }
    });

  } catch (error) {
    console.error('Google sign-in error:', error);

    // Handle duplicate email error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.log('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during Google sign-in'
    });
  }
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;