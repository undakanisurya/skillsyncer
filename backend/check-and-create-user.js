const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/skillsyncer');

const User = require('./models/User');

async function checkAndCreateUser() {
  try {
    console.log('Checking if test user exists...');
    
    // Check if user exists
    let user = await User.findOne({ email: 'jobseeker@test.com' });
    
    if (!user) {
      console.log('User not found, creating new user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      user = new User({
        name: 'Test Jobseeker',
        email: 'jobseeker@test.com',
        password: hashedPassword,
        role: 'jobseeker',
        isActive: true,
        profile: {
          bio: 'Test jobseeker profile',
          skills: ['JavaScript', 'React'],
          experience: '1-3',
          location: 'Test City'
        }
      });
      
      await user.save();
      console.log('✅ User created successfully:', user._id);
    } else {
      console.log('✅ User found:', user._id);
    }
    
    // Test login
    console.log('\nTesting login...');
    const isPasswordValid = await user.comparePassword('password123');
    console.log('Password valid:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('✅ Login should work!');
    } else {
      console.log('❌ Password mismatch!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

checkAndCreateUser();
