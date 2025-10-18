const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Script to set up mentor grades for testing
 * This script assigns grades to existing mentors
 */

const setupMentorGrades = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsyncer');
    console.log('Connected to MongoDB');

    // Find all mentors
    const mentors = await User.find({
      $or: [
        { role: 'mentor' },
        { secondaryRoles: 'mentor' }
      ]
    });

    console.log(`Found ${mentors.length} mentors`);

    // Assign grades to mentors
    for (let i = 0; i < mentors.length; i++) {
      const mentor = mentors[i];
      
      // Initialize mentorProfile if it doesn't exist
      if (!mentor.mentorProfile) {
        mentor.mentorProfile = {};
      }

      // Assign grade based on experience (simple logic for demo)
      let grade = 'B'; // Default grade
      if (mentor.mentorProfile.yearsOfExperience === '5-10' || mentor.mentorProfile.yearsOfExperience === '10+') {
        grade = 'A';
      } else if (mentor.mentorProfile.yearsOfExperience === '3-5') {
        // Random assignment for 3-5 years experience
        grade = Math.random() > 0.5 ? 'A' : 'B';
      }

      // Set mentor grade and capacity
      mentor.mentorProfile.grade = grade;
      mentor.mentorProfile.currentMentees = 0;
      mentor.mentorProfile.maxMentees = grade === 'A' ? 8 : 5; // Grade A mentors can handle more mentees

      await mentor.save();
      console.log(`Updated mentor ${mentor.name} with grade ${grade}`);
    }

    console.log('Mentor grades setup completed successfully!');
    
    // Display summary
    const gradeACount = await User.countDocuments({
      $or: [{ role: 'mentor' }, { secondaryRoles: 'mentor' }],
      'mentorProfile.grade': 'A'
    });
    
    const gradeBCount = await User.countDocuments({
      $or: [{ role: 'mentor' }, { secondaryRoles: 'mentor' }],
      'mentorProfile.grade': 'B'
    });

    console.log(`\nSummary:`);
    console.log(`Grade A mentors: ${gradeACount}`);
    console.log(`Grade B mentors: ${gradeBCount}`);

  } catch (error) {
    console.error('Error setting up mentor grades:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  setupMentorGrades();
}

module.exports = setupMentorGrades;
