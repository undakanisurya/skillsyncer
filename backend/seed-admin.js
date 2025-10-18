const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsyncer', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'sooryasunilsree18@gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Soorya Sunil Sree',
      email: 'sooryasunilsree18@gmail.com',
      password: 'suryasunil@18',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      profileCompletion: 100
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: sooryasunilsree18@gmail.com');
    console.log('Password: suryasunil@18');
    console.log('Role: admin');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedAdmin();
