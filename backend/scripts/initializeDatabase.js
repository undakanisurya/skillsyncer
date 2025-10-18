const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const JobseekerProfile = require('../models/JobseekerProfile');

// Load environment variables
dotenv.config();

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing SkillSyncer Database...');
    console.log('Connection URI:', process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB Atlas');
    console.log(`📊 Database: ${conn.connection.name}`);

    // Create indexes for better performance
    console.log('🔧 Creating database indexes...');

    // User model indexes
    await User.createIndexes();
    console.log('✅ User indexes created');

    // JobseekerProfile model indexes  
    await JobseekerProfile.createIndexes();
    console.log('✅ JobseekerProfile indexes created');

    // Additional custom indexes for better search performance
    await mongoose.connection.db.collection('jobseekerprofiles').createIndex(
      { 
        'skills.technical.name': 'text', 
        'personalInfo.bio': 'text',
        'jobPreferences.jobTitles': 'text',
        'education.fieldOfStudy': 'text',
        'workExperience.title': 'text',
        'workExperience.company': 'text'
      },
      { name: 'profile_text_search' }
    );
    console.log('✅ Full-text search index created');

    // Compound indexes for complex queries
    await mongoose.connection.db.collection('jobseekerprofiles').createIndex(
      { 
        'profileSettings.isPublic': 1, 
        'profileSettings.profileSearchable': 1,
        'metadata.profileCompletion': -1 
      },
      { name: 'searchable_profiles' }
    );
    console.log('✅ Searchable profiles compound index created');

    await mongoose.connection.db.collection('jobseekerprofiles').createIndex(
      { 
        'jobPreferences.preferredLocations': 1,
        'jobPreferences.jobTypes': 1,
        'jobPreferences.workMode': 1
      },
      { name: 'job_preferences_search' }
    );
    console.log('✅ Job preferences search index created');

    // Check existing data
    console.log('\n📊 Database Statistics:');
    const userCount = await User.countDocuments();
    const jobseekerCount = await User.countDocuments({ role: 'jobseeker' });
    const profileCount = await JobseekerProfile.countDocuments();
    const publicProfileCount = await JobseekerProfile.countDocuments({ 'profileSettings.isPublic': true });

    console.log(`  • Total Users: ${userCount}`);
    console.log(`  • Jobseekers: ${jobseekerCount}`);
    console.log(`  • Extended Profiles: ${profileCount}`);
    console.log(`  • Public Profiles: ${publicProfileCount}`);

    // Create sample data if database is empty
    if (userCount === 0) {
      console.log('\n🌱 Creating sample data...');
      await createSampleData();
    } else {
      console.log('\n✅ Database already contains user data');
    }

    // Verify collections and indexes
    console.log('\n🔍 Verifying collections and indexes...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name).join(', '));

    for (const collection of collections) {
      if (['users', 'jobseekerprofiles'].includes(collection.name)) {
        const indexes = await mongoose.connection.db.collection(collection.name).indexes();
        console.log(`📑 ${collection.name} indexes:`, indexes.map(i => i.name).join(', '));
      }
    }

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n🚀 Your SkillSyncer database is ready to use!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
};

const createSampleData = async () => {
  try {
    // Sample jobseeker user
    const sampleJobseeker = new User({
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      role: 'jobseeker',
      password: 'password123', // Will be hashed by pre-save hook
      isEmailVerified: true,
      profile: {
        phone: '+1-555-0123',
        location: 'San Francisco, CA',
        bio: 'Passionate full-stack developer with 3 years of experience in React, Node.js, and cloud technologies.',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
        experience: 'Mid-level',
        portfolio: 'https://alexjohnson.dev'
      }
    });

    const savedUser = await sampleJobseeker.save();
    console.log('✅ Sample jobseeker user created');

    // Sample extended profile
    const sampleProfile = new JobseekerProfile({
      userId: savedUser._id,
      personalInfo: {
        bio: 'Passionate full-stack developer with 3+ years of experience building scalable web applications. I love solving complex problems and learning new technologies. Currently focusing on React, Node.js, and cloud architecture.',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: new Date('1995-06-15'),
        gender: 'male',
        nationality: 'American',
        languages: [
          { language: 'English', proficiency: 'native' },
          { language: 'Spanish', proficiency: 'intermediate' },
          { language: 'French', proficiency: 'beginner' }
        ]
      },
      contactInfo: {
        alternateEmail: 'alex.work@gmail.com',
        whatsappNumber: '+1-555-0123',
        linkedinUrl: 'https://linkedin.com/in/alexjohnson',
        githubUrl: 'https://github.com/alexjohnson',
        portfolioUrl: 'https://alexjohnson.dev',
        personalWebsite: 'https://alexjohnson.com',
        address: {
          street: '123 Tech Street',
          city: 'San Francisco',
          state: 'California',
          zipCode: '94102',
          country: 'United States'
        }
      },
      skills: {
        technical: [
          { name: 'JavaScript', level: 'expert', yearsOfExperience: 4 },
          { name: 'React', level: 'expert', yearsOfExperience: 3 },
          { name: 'Node.js', level: 'advanced', yearsOfExperience: 3 },
          { name: 'MongoDB', level: 'advanced', yearsOfExperience: 2 },
          { name: 'AWS', level: 'intermediate', yearsOfExperience: 2 },
          { name: 'Docker', level: 'intermediate', yearsOfExperience: 1 },
          { name: 'Python', level: 'intermediate', yearsOfExperience: 2 }
        ],
        soft: ['Team Leadership', 'Problem Solving', 'Communication', 'Project Management', 'Mentoring'],
        tools: [
          { name: 'VS Code', proficiency: 'expert' },
          { name: 'Git', proficiency: 'advanced' },
          { name: 'Postman', proficiency: 'advanced' },
          { name: 'Figma', proficiency: 'intermediate' },
          { name: 'Jira', proficiency: 'intermediate' }
        ],
        frameworks: [
          { name: 'Express.js', level: 'expert' },
          { name: 'Next.js', level: 'advanced' },
          { name: 'TailwindCSS', level: 'advanced' },
          { name: 'Jest', level: 'intermediate' },
          { name: 'GraphQL', level: 'intermediate' }
        ]
      },
      education: [{
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        institution: 'Stanford University',
        location: 'Stanford, CA',
        startDate: new Date('2017-09-01'),
        endDate: new Date('2021-06-01'),
        currentlyStudying: false,
        grade: '3.8 GPA',
        activities: 'Computer Science Club President, Hackathon Winner 2020',
        achievements: [
          'Dean\'s List for 6 consecutive semesters',
          'Outstanding Senior Project Award',
          'Google Code-in Mentor'
        ]
      }],
      workExperience: [
        {
          title: 'Senior Full Stack Developer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          employmentType: 'full-time',
          startDate: new Date('2022-03-01'),
          endDate: null,
          currentlyWorking: true,
          description: 'Lead development of scalable web applications using React and Node.js. Mentored junior developers and implemented CI/CD pipelines that reduced deployment time by 60%.',
          achievements: [
            'Increased application performance by 40% through optimization',
            'Led team of 5 developers on major product redesign',
            'Implemented automated testing reducing bugs by 50%'
          ],
          skillsUsed: ['React', 'Node.js', 'AWS', 'MongoDB', 'Docker']
        },
        {
          title: 'Full Stack Developer',
          company: 'StartupXYZ',
          location: 'San Francisco, CA',
          employmentType: 'full-time',
          startDate: new Date('2021-07-01'),
          endDate: new Date('2022-02-28'),
          currentlyWorking: false,
          description: 'Developed and maintained multiple web applications from scratch. Collaborated with designers and product managers to deliver user-centered solutions.',
          achievements: [
            'Built 3 production applications serving 10k+ users',
            'Reduced server costs by 30% through optimization',
            'Implemented real-time features using WebSocket'
          ],
          skillsUsed: ['JavaScript', 'React', 'Express', 'PostgreSQL', 'Redis']
        }
      ],
      projects: [
        {
          title: 'EcoTrack - Carbon Footprint Tracker',
          description: 'A comprehensive web application that helps users track and reduce their carbon footprint. Features include data visualization, goal setting, and social challenges.',
          technologies: ['React', 'Node.js', 'MongoDB', 'Chart.js', 'Stripe API'],
          role: 'Lead Developer',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-06-01'),
          ongoing: false,
          projectUrl: 'https://ecotrack-demo.com',
          githubUrl: 'https://github.com/alexjohnson/ecotrack',
          liveUrl: 'https://ecotrack-app.com'
        },
        {
          title: 'DevCollab - Developer Collaboration Platform',
          description: 'A platform connecting developers for pair programming, code reviews, and knowledge sharing. Includes real-time collaboration tools and skill matching.',
          technologies: ['Next.js', 'TypeScript', 'Socket.io', 'PostgreSQL', 'Redis'],
          role: 'Full Stack Developer',
          startDate: new Date('2023-07-01'),
          endDate: null,
          ongoing: true,
          githubUrl: 'https://github.com/alexjohnson/devcollab',
          liveUrl: 'https://devcollab.io'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect',
          issuingOrganization: 'Amazon Web Services',
          issueDate: new Date('2023-03-15'),
          expiryDate: new Date('2026-03-15'),
          credentialId: 'AWS-SAA-123456',
          credentialUrl: 'https://aws.amazon.com/verification',
          doesNotExpire: false
        },
        {
          name: 'Professional Scrum Master I',
          issuingOrganization: 'Scrum.org',
          issueDate: new Date('2022-11-20'),
          expiryDate: null,
          credentialId: 'PSM-789123',
          credentialUrl: 'https://scrum.org/verification',
          doesNotExpire: true
        }
      ],
      jobPreferences: {
        jobTitles: ['Senior Full Stack Developer', 'Technical Lead', 'Software Architect'],
        jobTypes: ['full-time', 'contract'],
        workSchedule: ['day-shift', 'flexible-hours'],
        workMode: 'hybrid',
        preferredLocations: ['San Francisco, CA', 'Seattle, WA', 'Austin, TX'],
        willingToRelocate: true,
        expectedSalary: {
          min: 120000,
          max: 160000,
          currency: 'USD'
        },
        availableFrom: new Date('2024-03-01'),
        noticePeriod: '2-weeks',
        industryPreferences: ['technology', 'finance', 'healthcare']
      },
      additionalInfo: {
        achievements: [
          {
            title: 'Hackathon Winner',
            description: 'Won 1st place at TechCrunch Disrupt Hackathon 2023',
            date: new Date('2023-09-15')
          },
          {
            title: 'Open Source Contributor',
            description: 'Top contributor to React ecosystem with 500+ GitHub stars',
            date: new Date('2023-01-01')
          }
        ],
        volunteerWork: [
          {
            organization: 'Code for Good',
            role: 'Volunteer Developer',
            startDate: new Date('2022-01-01'),
            endDate: null,
            currentlyVolunteering: true,
            description: 'Developing web applications for non-profit organizations to help them manage their operations more efficiently.'
          }
        ],
        hobbies: ['Photography', 'Hiking', 'Chess', 'Cooking', 'Guitar'],
        references: [
          {
            name: 'Sarah Chen',
            title: 'Senior Engineering Manager',
            company: 'TechCorp Inc.',
            email: 'sarah.chen@techcorp.com',
            phone: '+1-555-0199',
            relationship: 'Direct Manager'
          }
        ]
      },
      profileSettings: {
        isPublic: true,
        showContactInfo: true,
        allowRecruiterMessages: true,
        jobAlerts: true,
        profileSearchable: true
      },
      socialLinks: {
        linkedin: 'https://linkedin.com/in/alexjohnson',
        github: 'https://github.com/alexjohnson',
        twitter: 'https://twitter.com/alexjohnsondev',
        personal: 'https://alexjohnson.com'
      }
    });

    await sampleProfile.save();
    console.log('✅ Sample extended profile created');
    console.log(`📊 Profile completion: ${sampleProfile.metadata.profileCompletion}%`);

    // Create sample employer
    const sampleEmployer = new User({
      name: 'TechCorp HR',
      email: 'hr@techcorp.com',
              role: 'company',
      password: 'password123',
      isEmailVerified: true,
      profile: {
        companyName: 'TechCorp Inc.',
        companySize: '100-500',
        industry: 'Technology',
        location: 'San Francisco, CA',
        website: 'https://techcorp.com'
      }
    });

    await sampleEmployer.save();
    console.log('✅ Sample employer user created');

    console.log('\n🎉 Sample data created successfully!');
    console.log('\nTest Accounts:');
    console.log('📧 Jobseeker: alex.johnson@example.com / password123');
    console.log('📧 Employer: hr@techcorp.com / password123');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
};

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };