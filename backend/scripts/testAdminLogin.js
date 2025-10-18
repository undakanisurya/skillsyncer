const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const testAdminLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsyncer');
    console.log('Connected to MongoDB');

    const adminEmail = 'sooryasunilsree18@gmail.com';
    const adminPassword = 'suryasunil@18';

    // Find user by email
    const user = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:', user.name);
    console.log('- Role:', user.role);
    console.log('- Active:', user.isActive);

    // Check password
    const isPasswordValid = await user.comparePassword(adminPassword);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      process.exit(1);
    }

    console.log('✅ Password is valid');

    // Check if user is admin
    if (user.role !== 'admin') {
      console.log('❌ User is not an admin');
      process.exit(1);
    }

    console.log('✅ User has admin role');

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('✅ JWT token generated successfully');
    console.log('Token preview:', token.substring(0, 50) + '...');

    // Update last login
    await user.updateLastLogin();
    console.log('✅ Last login updated');

    console.log('\n🎉 Admin login test successful!');
    console.log('Admin can now login with:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing admin login:', error);
    process.exit(1);
  }
};

testAdminLogin();