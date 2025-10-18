const User = require('../models/User');
const { sendNotificationEmail } = require('./emailService');

/**
 * Mentor Assignment Service
 * Handles grading and automatic mentor assignment for job seekers
 */

/**
 * Calculate grade based on test score
 * @param {number} score - Test score (0-100)
 * @returns {string} Grade ('A' or 'B')
 */
const calculateGrade = (score) => {
  if (score >= 80) {
    return 'A';
  } else if (score >= 60) {
    return 'B';
  } else {
    return null; // Failed - no grade assigned
  }
};

/**
 * Find the best mentor for a job seeker based on grade and load balancing
 * @param {string} jobseekerGrade - Grade of the job seeker ('A' or 'B')
 * @returns {Object|null} Best mentor or null if none available
 */
const findBestMentor = async (jobseekerGrade) => {
  try {
    // Find mentors with the same grade who have capacity
    const mentors = await User.find({
      $or: [
        { role: 'mentor' },
        { secondaryRoles: 'mentor' }
      ],
      'mentorProfile.grade': jobseekerGrade,
      'mentorProfile.currentMentees': { $lt: { $expr: '$mentorProfile.maxMentees' } },
      isActive: true
    }).select('name email mentorProfile');

    if (mentors.length === 0) {
      console.log(`No mentors available with grade ${jobseekerGrade}`);
      return null;
    }

    // Sort by current mentees count (load balancing)
    mentors.sort((a, b) => {
      const aMentees = a.mentorProfile?.currentMentees || 0;
      const bMentees = b.mentorProfile?.currentMentees || 0;
      return aMentees - bMentees;
    });

    return mentors[0];
  } catch (error) {
    console.error('Error finding best mentor:', error);
    return null;
  }
};

/**
 * Assign a mentor to a job seeker
 * @param {string} jobseekerId - ID of the job seeker
 * @param {string} mentorId - ID of the mentor
 * @returns {Object} Assignment result
 */
const assignMentor = async (jobseekerId, mentorId) => {
  try {
    const jobseeker = await User.findById(jobseekerId);
    const mentor = await User.findById(mentorId);

    if (!jobseeker || !mentor) {
      return {
        success: false,
        error: 'Job seeker or mentor not found'
      };
    }

    // Update job seeker with mentor assignment
    jobseeker.profile.assignedMentor = mentorId;
    jobseeker.profile.mentorAssignmentDate = new Date();
    await jobseeker.save();

    // Update mentor's current mentees count
    if (!mentor.mentorProfile) {
      mentor.mentorProfile = {};
    }
    mentor.mentorProfile.currentMentees = (mentor.mentorProfile.currentMentees || 0) + 1;
    await mentor.save();

    return {
      success: true,
      jobseeker: {
        id: jobseeker._id,
        name: jobseeker.name,
        grade: jobseeker.profile.grade
      },
      mentor: {
        id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        grade: mentor.mentorProfile.grade
      }
    };
  } catch (error) {
    console.error('Error assigning mentor:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Process test result and assign mentor if passed
 * @param {string} jobseekerId - ID of the job seeker
 * @param {number} score - Test score
 * @param {string} result - Test result ('Passed' or 'Failed')
 * @returns {Object} Processing result
 */
const processTestResult = async (jobseekerId, score, result) => {
  try {
    const jobseeker = await User.findById(jobseekerId);
    
    if (!jobseeker) {
      return {
        success: false,
        error: 'Job seeker not found'
      };
    }

    // Only process if test was passed
    if (result !== 'Passed') {
      return {
        success: true,
        message: 'Test failed - no mentor assignment needed',
        grade: null,
        mentorAssigned: false
      };
    }

    // Calculate grade based on score
    const grade = calculateGrade(score);
    
    if (!grade) {
      return {
        success: false,
        error: 'Invalid score for grade calculation'
      };
    }

    // Update job seeker with grade
    jobseeker.profile.grade = grade;
    await jobseeker.save();

    // Find and assign mentor
    const mentor = await findBestMentor(grade);
    
    if (!mentor) {
      return {
        success: true,
        message: 'Grade assigned but no mentor available',
        grade,
        mentorAssigned: false,
        mentor: null
      };
    }

    // Assign mentor
    const assignmentResult = await assignMentor(jobseekerId, mentor._id);
    
    if (!assignmentResult.success) {
      return {
        success: false,
        error: assignmentResult.error
      };
    }

    // Send notification emails
    try {
      // Notify job seeker
      await sendNotificationEmail(
        jobseeker.email,
        'Mentor Assigned - SkillSyncer',
        `
          <h2>Congratulations! You've been assigned a mentor</h2>
          <p>Dear ${jobseeker.name},</p>
          <p>Great news! You have passed the test with a grade of <strong>${grade}</strong> and have been assigned a mentor.</p>
          <p><strong>Your Mentor:</strong></p>
          <ul>
            <li>Name: ${mentor.name}</li>
            <li>Email: ${mentor.email}</li>
            <li>Grade: ${mentor.mentorProfile.grade}</li>
          </ul>
          <p>Your mentor will contact you soon to begin your mentorship journey.</p>
          <p>Best regards,<br>SkillSyncer Team</p>
        `
      );

      // Notify mentor
      await sendNotificationEmail(
        mentor.email,
        'New Mentee Assigned - SkillSyncer',
        `
          <h2>New Mentee Assignment</h2>
          <p>Dear ${mentor.name},</p>
          <p>You have been assigned a new mentee:</p>
          <p><strong>Mentee Details:</strong></p>
          <ul>
            <li>Name: ${jobseeker.name}</li>
            <li>Email: ${jobseeker.email}</li>
            <li>Grade: ${grade}</li>
          </ul>
          <p>Please reach out to your new mentee to begin the mentorship process.</p>
          <p>Best regards,<br>SkillSyncer Team</p>
        `
      );
    } catch (emailError) {
      console.error('Error sending notification emails:', emailError);
    }

    return {
      success: true,
      message: 'Mentor assigned successfully',
      grade,
      mentorAssigned: true,
      mentor: {
        id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        grade: mentor.mentorProfile.grade
      }
    };

  } catch (error) {
    console.error('Error processing test result:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get mentor assignment details for a job seeker
 * @param {string} jobseekerId - ID of the job seeker
 * @returns {Object} Assignment details
 */
const getMentorAssignment = async (jobseekerId) => {
  try {
    const jobseeker = await User.findById(jobseekerId)
      .populate('profile.assignedMentor', 'name email mentorProfile.grade mentorProfile.expertise')
      .select('name email profile.grade profile.assignedMentor profile.mentorAssignmentDate');

    if (!jobseeker) {
      return {
        success: false,
        error: 'Job seeker not found'
      };
    }

    return {
      success: true,
      jobseeker: {
        id: jobseeker._id,
        name: jobseeker.name,
        email: jobseeker.email,
        grade: jobseeker.profile.grade,
        assignedMentor: jobseeker.profile.assignedMentor,
        mentorAssignmentDate: jobseeker.profile.mentorAssignmentDate
      }
    };
  } catch (error) {
    console.error('Error getting mentor assignment:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all mentees for a mentor
 * @param {string} mentorId - ID of the mentor
 * @returns {Object} Mentees list
 */
const getMentorMentees = async (mentorId) => {
  try {
    const mentees = await User.find({
      'profile.assignedMentor': mentorId
    }).select('name email profile.grade profile.mentorAssignmentDate');

    return {
      success: true,
      mentees: mentees.map(mentee => ({
        id: mentee._id,
        name: mentee.name,
        email: mentee.email,
        grade: mentee.profile.grade,
        assignmentDate: mentee.profile.mentorAssignmentDate
      }))
    };
  } catch (error) {
    console.error('Error getting mentor mentees:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Remove mentor assignment
 * @param {string} jobseekerId - ID of the job seeker
 * @returns {Object} Removal result
 */
const removeMentorAssignment = async (jobseekerId) => {
  try {
    const jobseeker = await User.findById(jobseekerId);
    
    if (!jobseeker || !jobseeker.profile.assignedMentor) {
      return {
        success: false,
        error: 'No mentor assignment found'
      };
    }

    const mentorId = jobseeker.profile.assignedMentor;
    
    // Update job seeker
    jobseeker.profile.assignedMentor = null;
    jobseeker.profile.mentorAssignmentDate = null;
    await jobseeker.save();

    // Update mentor's mentee count
    const mentor = await User.findById(mentorId);
    if (mentor && mentor.mentorProfile) {
      mentor.mentorProfile.currentMentees = Math.max(0, (mentor.mentorProfile.currentMentees || 0) - 1);
      await mentor.save();
    }

    return {
      success: true,
      message: 'Mentor assignment removed successfully'
    };
  } catch (error) {
    console.error('Error removing mentor assignment:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  calculateGrade,
  findBestMentor,
  assignMentor,
  processTestResult,
  getMentorAssignment,
  getMentorMentees,
  removeMentorAssignment
};
