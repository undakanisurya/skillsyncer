const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const verifyAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsyncer');
    console.log('Connected to MongoDB');

    const adminEmail = 'sooryasunilsree18@gmail.com';
    const adminPassword = 'suryasunil@18';

    // Find admin user with password
    const adminUser = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log('- ID:', adminUser._id);
    console.log('- Name:', adminUser.name);
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    console.log('- Is Active:', adminUser.isActive);
    console.log('- Is Verified:', adminUser.isVerified);
    console.log('- Password Hash:', adminUser.password ? 'Present' : 'Missing');

    // Test password comparison
    if (adminUser.password) {
      const isPasswordCorrect = await adminUser.comparePassword(adminPassword);
      console.log('- Password Test:', isPasswordCorrect ? '✅ Correct' : '❌ Incorrect');
      
      if (!isPasswordCorrect) {
        console.log('🔧 Fixing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        adminUser.password = hashedPassword;
        await adminUser.save();
        console.log('✅ Password updated successfully');
        
        // Test again
        const isPasswordCorrectNow = await adminUser.comparePassword(adminPassword);
        console.log('- Password Test (after fix):', isPasswordCorrectNow ? '✅ Correct' : '❌ Still Incorrect');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error verifying admin user:', error);
    process.exit(1);
  }
};

verifyAdminUser();
