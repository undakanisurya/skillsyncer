const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedTestEmployer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsyncer', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Create test employer users
    const testEmployers = [
      {
        name: 'TechCorp Inc',
        email: 'hr@techcorp.com',
        password: 'password123',
        role: 'company',
        isEmailVerified: true,
        isActive: true,
        company: {
          name: 'TechCorp Inc',
          description: 'Leading technology company specializing in software development and AI solutions.',
          industry: 'technology',
          phone: '+1-555-0123',
          website: 'https://techcorp.com',
          location: 'San Francisco, CA',
          size: '201-500'
        },
        profileCompletion: 85
      },
      {
        name: 'HealthPlus Medical',
        email: 'careers@healthplus.com',
        password: 'password123',
        role: 'company',
        isEmailVerified: true,
        isActive: true,
        company: {
          name: 'HealthPlus Medical',
          description: 'Innovative healthcare provider focused on patient-centered care and medical technology.',
          industry: 'healthcare',
          phone: '+1-555-0456',
          website: 'https://healthplus.com',
          location: 'New York, NY',
          size: '51-200'
        },
        profileCompletion: 90
      },
      {
        name: 'EduTech Solutions',
        email: 'jobs@edutech.com',
        password: 'password123',
        role: 'company',
        isEmailVerified: false,
        isActive: true,
        company: {
          name: 'EduTech Solutions',
          description: 'Educational technology company creating innovative learning platforms.',
          industry: 'education',
          phone: '+1-555-0789',
          website: 'https://edutech.com',
          location: 'Austin, TX',
          size: '11-50'
        },
        profileCompletion: 70
      },
      {
        name: 'GreenEnergy Corp',
        email: 'hr@greenenergy.com',
        password: 'password123',
        role: 'company',
        isEmailVerified: true,
        isActive: false,
        company: {
          name: 'GreenEnergy Corp',
          description: 'Renewable energy company focused on sustainable solutions.',
          industry: 'other',
          phone: '+1-555-0321',
          website: 'https://greenenergy.com',
          location: 'Seattle, WA',
          size: '500+'
        },
        profileCompletion: 95
      }
    ];

    // Check if employers already exist and create them
    for (const employerData of testEmployers) {
      const existingEmployer = await User.findOne({ email: employerData.email });
      
      if (!existingEmployer) {
        const employer = new User(employerData);
        await employer.save();
        console.log(`Created employer: ${employerData.company.name}`);
      } else {
        console.log(`Employer already exists: ${employerData.company.name}`);
      }
    }

    console.log('Test employer seeding completed!');

  } catch (error) {
    console.error('Error creating test employers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedTestEmployer();
