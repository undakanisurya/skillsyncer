const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const InternshipPosting = require('../models/InternshipPosting');

// Load environment variables
dotenv.config();

const createSampleInternships = async () => {
  try {
    console.log('🔄 Creating Sample Internship Postings...');
    
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB Atlas');

    // Find or create an employer user
    let employer = await User.findOne({ role: 'employer' });
    
    if (!employer) {
      console.log('📝 Creating sample employer...');
      employer = new User({
        name: 'TechCorp HR',
        email: 'hr@techcorp.com',
        password: 'password123',
        role: 'employer',
        isEmailVerified: true,
        profile: {
          companyName: 'TechCorp Inc.',
          companySize: '100-500',
          industry: 'Technology',
          location: 'Mumbai, Maharashtra',
          website: 'https://techcorp.com'
        }
      });
      await employer.save();
      console.log('✅ Sample employer created');
    } else {
      console.log('✅ Using existing employer:', employer.email);
    }

    // Sample internship data
    const sampleInternships = [
      {
        title: 'Software Development Intern',
        industry: 'IT/Technology',
        companyName: 'TechCorp Inc.',
        employerId: employer._id,
        location: 'Mumbai, Maharashtra',
        mode: 'Hybrid',
        startDate: new Date('2024-06-01'),
        lastDateToApply: new Date('2024-05-15'),
        duration: '3 months',
        totalSeats: 5,
        availableSeats: 5,
        description: 'Join our dynamic software development team and work on real-world projects. You will learn modern technologies like React, Node.js, and MongoDB while contributing to our innovative products.',
        skillsRequired: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
        certifications: ['AWS Certified Developer', 'MongoDB Developer Certificate'],
        eligibility: 'Students in 3rd or 4th year of Computer Science or related fields. Recent graduates are also welcome to apply.',
        stipend: {
          amount: 15000,
          currency: 'INR',
          type: 'Fixed'
        },
        benefits: ['Certificate of Completion', 'Letter of Recommendation', 'Potential Job Offer', 'Flexible Work Hours'],
        status: 'active',
        isFeatured: true
      },
      {
        title: 'Data Science Intern',
        industry: 'IT/Technology',
        companyName: 'DataTech Solutions',
        employerId: employer._id,
        location: 'Bangalore, Karnataka',
        mode: 'Remote',
        startDate: new Date('2024-06-15'),
        lastDateToApply: new Date('2024-05-30'),
        duration: '6 months',
        totalSeats: 3,
        availableSeats: 3,
        description: 'Work with our data science team to analyze large datasets, build machine learning models, and create data-driven insights. Perfect opportunity for students interested in AI and analytics.',
        skillsRequired: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'SQL'],
        certifications: ['Google Data Analytics Certificate', 'IBM Data Science Certificate'],
        eligibility: 'Students pursuing Computer Science, Statistics, or Mathematics. Knowledge of Python programming required.',
        stipend: {
          amount: 20000,
          currency: 'INR',
          type: 'Fixed'
        },
        benefits: ['Certificate of Completion', 'Letter of Recommendation', 'Access to Premium Courses', 'Remote Work Setup'],
        status: 'active',
        isFeatured: true
      },
             {
         title: 'Marketing Intern',
         industry: 'Media',
         companyName: 'Digital Marketing Pro',
         employerId: employer._id,
         location: 'Delhi, NCR',
         mode: 'Offline',
         startDate: new Date('2024-07-01'),
         lastDateToApply: new Date('2024-06-15'),
         duration: '3 months',
         totalSeats: 4,
         availableSeats: 4,
         description: 'Learn digital marketing strategies, social media management, and content creation. Work on real campaigns and gain hands-on experience in the fast-paced world of digital marketing.',
         skillsRequired: ['Social Media Marketing', 'Content Creation', 'Google Analytics', 'Creative Writing'],
         certifications: ['Google Digital Marketing Certificate', 'HubSpot Marketing Certificate'],
         eligibility: 'Students pursuing Marketing, Communications, or related fields. Creative mindset and good communication skills required.',
         stipend: {
           amount: 12000,
           currency: 'INR',
           type: 'Fixed'
         },
         benefits: ['Certificate of Completion', 'Portfolio Development', 'Networking Opportunities', 'Flexible Schedule'],
         status: 'active',
         isFeatured: false
       },
      {
        title: 'UX/UI Design Intern',
        industry: 'Design',
        companyName: 'Creative Design Studio',
        employerId: employer._id,
        location: 'Pune, Maharashtra',
        mode: 'Hybrid',
        startDate: new Date('2024-06-10'),
        lastDateToApply: new Date('2024-05-25'),
        duration: '4 months',
        totalSeats: 2,
        availableSeats: 2,
        description: 'Create beautiful and functional user interfaces. Learn design principles, prototyping tools, and user research methodologies. Work on real client projects and build your design portfolio.',
        skillsRequired: ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Prototyping'],
        certifications: ['Google UX Design Certificate', 'Interaction Design Foundation Certificate'],
        eligibility: 'Students pursuing Design, Fine Arts, or related fields. Portfolio of design work preferred.',
        stipend: {
          amount: 18000,
          currency: 'INR',
          type: 'Fixed'
        },
        benefits: ['Certificate of Completion', 'Portfolio Development', 'Design Tools License', 'Mentorship Program'],
        status: 'active',
        isFeatured: true
      },
      {
        title: 'Business Analyst Intern',
        industry: 'Consulting',
        companyName: 'Business Solutions Ltd',
        employerId: employer._id,
        location: 'Chennai, Tamil Nadu',
        mode: 'On-site',
        startDate: new Date('2024-07-15'),
        lastDateToApply: new Date('2024-07-01'),
        duration: '3 months',
        totalSeats: 3,
        availableSeats: 3,
        description: 'Work with our business analysis team to understand client requirements, analyze business processes, and create detailed documentation. Perfect for students interested in business strategy and consulting.',
        skillsRequired: ['Business Analysis', 'Requirements Gathering', 'Process Modeling', 'Microsoft Excel'],
        certifications: ['IIBA Business Analysis Certificate', 'Microsoft Office Specialist'],
        eligibility: 'Students pursuing Business Administration, Management, or related fields. Strong analytical skills required.',
        stipend: {
          amount: 14000,
          currency: 'INR',
          type: 'Fixed'
        },
        benefits: ['Certificate of Completion', 'Professional Networking', 'Business Tools Training', 'Career Guidance'],
        status: 'active',
        isFeatured: false
      },
      {
        title: 'Content Writing Intern',
        industry: 'Media',
        companyName: 'Content Creators Hub',
        employerId: employer._id,
        location: 'Remote',
        mode: 'Remote',
        startDate: new Date('2024-06-20'),
        lastDateToApply: new Date('2024-06-05'),
        duration: '3 months',
        totalSeats: 6,
        availableSeats: 6,
        description: 'Create engaging content for various platforms including blogs, social media, and websites. Learn SEO, content strategy, and digital writing techniques while building your writing portfolio.',
        skillsRequired: ['Content Writing', 'SEO', 'Social Media', 'Creative Writing', 'Research'],
        certifications: ['Content Marketing Institute Certificate', 'HubSpot Content Marketing'],
        eligibility: 'Students pursuing English, Journalism, or related fields. Excellent writing skills required.',
        stipend: {
          amount: 10000,
          currency: 'INR',
          type: 'Performance-based'
        },
        benefits: ['Certificate of Completion', 'Published Portfolio', 'Writing Tools Access', 'Flexible Hours'],
        status: 'active',
        isFeatured: false
      }
    ];

    // Create internship postings
    console.log('📝 Creating internship postings...');
    const createdInternships = [];
    
    for (const internshipData of sampleInternships) {
      const internship = new InternshipPosting(internshipData);
      await internship.save();
      createdInternships.push(internship);
      console.log(`✅ Created: ${internship.title}`);
    }

    console.log('\n🎉 Sample internship postings created successfully!');
    console.log(`📊 Total internships created: ${createdInternships.length}`);
    
    // Display summary
    console.log('\n📋 Created Internships:');
    createdInternships.forEach((internship, index) => {
      console.log(`${index + 1}. ${internship.title} - ${internship.companyName} (${internship.location})`);
    });

    console.log('\n🔍 You can now test the internship browsing feature in the jobseeker dashboard!');

  } catch (error) {
    console.error('❌ Error creating sample internships:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  createSampleInternships()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createSampleInternships };
