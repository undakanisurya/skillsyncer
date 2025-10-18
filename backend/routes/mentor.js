const express = require('express');
const router = express.Router();
const User = require('../models/User');
const MentorRequest = require('../models/MentorRequest');
const { protect } = require('../middleware/auth');
const { sendMentorCredentials, sendNotificationEmail } = require('../utils/emailService');
const { 
  getMentorAssignment, 
  getMentorMentees, 
  removeMentorAssignment,
  assignMentor,
  findBestMentor
} = require('../utils/mentorAssignment');

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Middleware to check if user is company/employer
const companyAuth = async (req, res, next) => {
  try {
    if (!['company', 'employer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Company privileges required.'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ==================== COMPANY ROUTES ====================

// Submit mentor request (Company)
router.post('/request', [protect, companyAuth], async (req, res) => {
  try {
    const {
      employeeName,
      employeeEmail,
      employeePhone,
      employeePosition,
      employeeDepartment,
      justification,
      expertise,
      yearsOfExperience
    } = req.body;

    // Validation
    if (!employeeName || !employeeEmail || !employeePhone || !employeePosition || 
        !employeeDepartment || !justification || !yearsOfExperience) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if employee already exists as a user
    const existingUser = await User.findOne({ email: employeeEmail });
    if (existingUser) {
      // If employee already exists, check if they're already a mentor
      if (existingUser.hasRole('mentor')) {
        return res.status(400).json({
          success: false,
          message: 'This employee is already assigned as a mentor'
        });
      }
      // If they're not a mentor, we can proceed with the request
    }

    // Check if there's already a pending request for this employee
    const existingRequest = await MentorRequest.findOne({
      employeeEmail,
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A pending mentor request already exists for this employee'
      });
    }

    // Create mentor request
    const mentorRequest = await MentorRequest.create({
      companyId: req.user._id,
      requestedBy: req.user._id,
      employeeName,
      employeeEmail,
      employeePhone,
      employeePosition,
      employeeDepartment,
      justification,
      expertise: expertise || [],
      yearsOfExperience
    });

    // Populate the request for response
    await mentorRequest.populate([
      { path: 'companyId', select: 'name email company.name' },
      { path: 'requestedBy', select: 'name email' }
    ]);

    // Send notification email to admin (optional)
    try {
      // You can implement admin notification here if needed
      console.log('Mentor request created:', mentorRequest._id);
    } catch (emailError) {
      console.error('Error sending admin notification:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Mentor request submitted successfully',
      data: mentorRequest
    });
  } catch (error) {
    console.error('Error creating mentor request:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating mentor request',
      error: error.message
    });
  }
});

// Get company's mentor requests
router.get('/requests', [protect, companyAuth], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { companyId: req.user._id };
    if (status) filter.status = status;
    
    const skip = (page - 1) * limit;
    
    const requests = await MentorRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalRequests = await MentorRequest.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRequests / limit),
          totalRequests,
          hasNext: page * limit < totalRequests,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching mentor requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mentor requests',
      error: error.message
    });
  }
});

// ==================== ADMIN ROUTES ====================

// Get all mentor requests (Admin)
router.get('/admin/requests', [protect, adminAuth], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    
    const skip = (page - 1) * limit;
    
    const requests = await MentorRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalRequests = await MentorRequest.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRequests / limit),
          totalRequests,
          hasNext: page * limit < totalRequests,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching mentor requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mentor requests',
      error: error.message
    });
  }
});

// Approve mentor request and create mentor account (Admin)
router.patch('/admin/requests/:requestId/approve', [protect, adminAuth], async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminNotes } = req.body;
    
    const request = await MentorRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentor request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been processed'
      });
    }

    // Check if employee already exists as a user
    const existingUser = await User.findOne({ email: request.employeeEmail });
    let mentor;
    
    if (existingUser) {
      // If employee already exists, check if they're already a mentor
      if (existingUser.hasRole('mentor')) {
        return res.status(400).json({
          success: false,
          message: 'This employee is already assigned as a mentor'
        });
      }
      
      // Check if this is an existing mentor who should be converted to employee + mentor
      // This handles cases where the user was assigned as mentor before dual-role system
      if (existingUser.role === 'mentor' && request.employeeEmail) {
        // Convert existing mentor to employee with mentor secondary role
        existingUser.role = 'employee';
        if (!existingUser.secondaryRoles) {
          existingUser.secondaryRoles = [];
        }
        if (!existingUser.secondaryRoles.includes('mentor')) {
          existingUser.secondaryRoles.push('mentor');
        }
      } else if (existingUser.role === 'employee') {
        // Keep employee as primary role, add mentor as secondary role
        if (!existingUser.secondaryRoles) {
          existingUser.secondaryRoles = [];
        }
        if (!existingUser.secondaryRoles.includes('mentor')) {
          existingUser.secondaryRoles.push('mentor');
        }
      } else {
        // For non-employees, make mentor the primary role
        existingUser.role = 'mentor';
      }
      
      existingUser.mentorProfile = {
        bio: `Mentor at ${request.companyId.company?.name || 'Company'}`,
        expertise: request.expertise,
        yearsOfExperience: request.yearsOfExperience,
        phone: request.employeePhone,
        linkedin: ''
      };
      await existingUser.save();
      mentor = existingUser;

      // Send notification email to existing employee about mentor assignment
      try {
        await sendNotificationEmail(
          request.employeeEmail,
          'You have been assigned as a Mentor - SkillSyncer',
          `
            <h2>Mentor Assignment Notification</h2>
            <p>Dear ${request.employeeName},</p>
            <p>Congratulations! You have been assigned as a mentor on SkillSyncer.</p>
            <p><strong>Company:</strong> ${request.companyId.company?.name || request.companyId.name}</p>
            <p><strong>Your Role:</strong> Mentor</p>
            <p><strong>Expertise Areas:</strong> ${request.expertise && request.expertise.length > 0 ? request.expertise.join(', ') : 'Not specified'}</p>
            <p>You can now access both the employee dashboard and mentor dashboard using your existing login credentials.</p>
            <p>After logging in, you can switch between dashboards using the role switcher.</p>
            <p>Login here: <a href="${process.env.FRONTEND_URL}/auth">${process.env.FRONTEND_URL}/auth</a></p>
            <p>Thank you for contributing to the SkillSyncer community!</p>
            <br>
            <p>Best regards,<br>SkillSyncer Team</p>
          `
        );
      } catch (emailError) {
        console.error('Error sending mentor assignment notification:', emailError);
      }
    } else {
      // Create new mentor user (existing logic)
      const generatePassword = (name, phone) => {
        const namePrefix = name.replace(/\s+/g, '').substring(0, 4).toLowerCase();
        const phoneDigits = phone.replace(/\D/g, '');
        const phoneSuffix = phoneDigits.slice(-2);
        return namePrefix + phoneSuffix;
      };

      const autoGeneratedPassword = generatePassword(request.employeeName, request.employeePhone);
      const plainPassword = autoGeneratedPassword;

      // Create mentor user
      mentor = await User.create({
        name: request.employeeName,
        email: request.employeeEmail,
        password: autoGeneratedPassword,
        role: 'mentor',
        isActive: true,
        isEmailVerified: true,
        mentorProfile: {
          bio: `Mentor at ${request.companyId.company?.name || 'Company'}`,
          expertise: request.expertise,
          yearsOfExperience: request.yearsOfExperience,
          phone: request.employeePhone,
          linkedin: ''
        }
      });

      // Send credentials email to new mentor
      try {
        const emailResult = await sendMentorCredentials(
          request.employeeEmail,
          request.employeeName,
          plainPassword
        );
        
        if (emailResult.success) {
          console.log('Mentor credentials email sent successfully');
        } else {
          console.error('Failed to send mentor credentials email');
        }
      } catch (emailError) {
        console.error('Error sending mentor credentials email:', emailError);
      }
    }

    // Update request status
    request.status = 'approved';
    request.adminNotes = adminNotes || '';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Send notification to company
    try {
      const isExistingEmployee = existingUser ? 'existing employee' : 'new mentor';
      const notificationMessage = existingUser 
        ? 'Your existing employee has been successfully assigned as a mentor and can now access both the employee dashboard and mentor dashboard with their existing credentials.'
        : 'A new mentor account has been created and the mentor has been notified with their login credentials.';
      
      await sendNotificationEmail(
        request.companyId.email,
        'Mentor Request Approved - SkillSyncer',
        `
          <h2>Mentor Request Approved</h2>
          <p>Dear ${request.companyId.name},</p>
          <p>Your mentor request for <strong>${request.employeeName}</strong> has been approved!</p>
          <p><strong>Employee Details:</strong></p>
          <ul>
            <li>Name: ${request.employeeName}</li>
            <li>Email: ${request.employeeEmail}</li>
            <li>Position: ${request.employeePosition}</li>
            <li>Department: ${request.employeeDepartment}</li>
            <li>Type: ${isExistingEmployee}</li>
          </ul>
          <p>${notificationMessage}</p>
          ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
          <br>
          <p>Best regards,<br>SkillSyncer Team</p>
        `
      );
    } catch (emailError) {
      console.error('Error sending company notification:', emailError);
    }

    const mentorResponse = await User.findById(mentor._id).select('-password');

    res.json({
      success: true,
      message: 'Mentor request approved and mentor account created successfully',
      data: {
        request,
        mentor: mentorResponse
      }
    });
  } catch (error) {
    console.error('Error approving mentor request:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving mentor request',
      error: error.message
    });
  }
});

// Reject mentor request (Admin)
router.patch('/admin/requests/:requestId/reject', [protect, adminAuth], async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminNotes } = req.body;
    
    const request = await MentorRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentor request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been processed'
      });
    }

    // Update request status
    request.status = 'rejected';
    request.adminNotes = adminNotes || '';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Send notification to company
    try {
      await sendNotificationEmail(
        request.companyId.email,
        'Mentor Request Rejected - SkillSyncer',
        `
          <h2>Mentor Request Update</h2>
          <p>Dear ${request.companyId.name},</p>
          <p>We're sorry, but your mentor request for <strong>${request.employeeName}</strong> has been rejected.</p>
          <p><strong>Employee Details:</strong></p>
          <ul>
            <li>Name: ${request.employeeName}</li>
            <li>Email: ${request.employeeEmail}</li>
            <li>Position: ${request.employeePosition}</li>
            <li>Department: ${request.employeeDepartment}</li>
          </ul>
          ${adminNotes ? `<p><strong>Reason:</strong> ${adminNotes}</p>` : ''}
          <p>We appreciate your interest and encourage you to submit another request in the future.</p>
          <br>
          <p>Best regards,<br>SkillSyncer Team</p>
        `
      );
    } catch (emailError) {
      console.error('Error sending rejection notification:', emailError);
    }

    res.json({
      success: true,
      message: 'Mentor request rejected successfully',
      data: request
    });
  } catch (error) {
    console.error('Error rejecting mentor request:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting mentor request',
      error: error.message
    });
  }
});

// Get all mentors (Admin)
router.get('/admin/mentors', [protect, adminAuth], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { $or: [ { role: 'mentor' }, { secondaryRoles: 'mentor' } ] };
    if (status) filter.isActive = status === 'active';
    
    const skip = (page - 1) * limit;
    
    const mentors = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalMentors = await User.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        mentors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMentors / limit),
          totalMentors,
          hasNext: page * limit < totalMentors,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mentors',
      error: error.message
    });
  }
});

// ==================== MENTOR ROUTES ====================

// Get mentor profile
router.get('/profile', [protect], async (req, res) => {
  try {
    if (req.user.role !== 'mentor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Mentor privileges required.'
      });
    }

    const mentor = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: mentor
    });
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mentor profile',
      error: error.message
    });
  }
});

// Update mentor profile
router.patch('/profile', [protect], async (req, res) => {
  try {
    if (req.user.role !== 'mentor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Mentor privileges required.'
      });
    }

    const { mentorProfile } = req.body;
    
    const mentor = await User.findByIdAndUpdate(
      req.user._id,
      { mentorProfile },
      { new: true }
    ).select('-password');

    // Recalculate profile completion
    await mentor.calculateProfileCompletion();
    await mentor.save();

    res.json({
      success: true,
      message: 'Mentor profile updated successfully',
      data: mentor
    });
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating mentor profile',
      error: error.message
    });
  }
});

// Migration endpoint to convert existing mentors to dual-role system
router.post('/migrate-to-dual-role', [protect], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If user is currently a mentor, convert to employee + mentor
    if (user.role === 'mentor') {
      user.role = 'employee';
      if (!user.secondaryRoles) {
        user.secondaryRoles = [];
      }
      if (!user.secondaryRoles.includes('mentor')) {
        user.secondaryRoles.push('mentor');
      }
      
      await user.save();
      
      res.json({
        success: true,
        message: 'Successfully migrated to dual-role system',
        data: {
          primaryRole: user.role,
          secondaryRoles: user.secondaryRoles,
          allRoles: user.getAllRoles()
        }
      });
    } else {
      res.json({
        success: true,
        message: 'User is not a mentor, no migration needed',
        data: {
          primaryRole: user.role,
          secondaryRoles: user.secondaryRoles || [],
          allRoles: user.getAllRoles()
        }
      });
    }
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during migration',
      error: error.message
    });
  }
});

// ==================== MENTOR ASSIGNMENT ROUTES ====================

// Get mentor assignment for a job seeker
// GET /api/mentor/assignment/:jobseekerId
router.get('/assignment/:jobseekerId', [protect], async (req, res) => {
  try {
    const { jobseekerId } = req.params;
    
    // Check if user is admin, mentor, or the job seeker themselves
    if (req.user.role !== 'admin' && 
        !req.user.hasRole('mentor') && 
        req.user._id.toString() !== jobseekerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const result = await getMentorAssignment(jobseekerId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      success: true,
      data: result.jobseeker
    });
  } catch (error) {
    console.error('Error fetching mentor assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mentor assignment',
      error: error.message
    });
  }
});

// Get all mentees for a mentor
// GET /api/mentor/mentees
router.get('/mentees', [protect], async (req, res) => {
  try {
    // Check if user is a mentor
    if (!req.user.hasRole('mentor')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Mentor privileges required.'
      });
    }

    const result = await getMentorMentees(req.user._id);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      data: result.mentees
    });
  } catch (error) {
    console.error('Error fetching mentees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mentees',
      error: error.message
    });
  }
});

// Manually assign a mentor to a job seeker (Admin only)
// POST /api/mentor/assign
router.post('/assign', [protect, adminAuth], async (req, res) => {
  try {
    const { jobseekerId, mentorId } = req.body;

    if (!jobseekerId || !mentorId) {
      return res.status(400).json({
        success: false,
        message: 'jobseekerId and mentorId are required'
      });
    }

    const result = await assignMentor(jobseekerId, mentorId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Mentor assigned successfully',
      data: result
    });
  } catch (error) {
    console.error('Error assigning mentor:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning mentor',
      error: error.message
    });
  }
});

// Remove mentor assignment (Admin only)
// DELETE /api/mentor/assignment/:jobseekerId
router.delete('/assignment/:jobseekerId', [protect, adminAuth], async (req, res) => {
  try {
    const { jobseekerId } = req.params;

    const result = await removeMentorAssignment(jobseekerId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error removing mentor assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing mentor assignment',
      error: error.message
    });
  }
});

// Get available mentors for assignment (Admin only)
// GET /api/mentor/available
router.get('/available', [protect, adminAuth], async (req, res) => {
  try {
    const { grade } = req.query;

    if (!grade || !['A', 'B'].includes(grade)) {
      return res.status(400).json({
        success: false,
        message: 'Valid grade (A or B) is required'
      });
    }

    const mentors = await User.find({
      $or: [
        { role: 'mentor' },
        { secondaryRoles: 'mentor' }
      ],
      'mentorProfile.grade': grade,
      'mentorProfile.currentMentees': { $lt: { $expr: '$mentorProfile.maxMentees' } },
      isActive: true
    }).select('name email mentorProfile.grade mentorProfile.currentMentees mentorProfile.maxMentees');

    res.json({
      success: true,
      data: mentors.map(mentor => ({
        id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        grade: mentor.mentorProfile.grade,
        currentMentees: mentor.mentorProfile.currentMentees,
        maxMentees: mentor.mentorProfile.maxMentees,
        availableSlots: mentor.mentorProfile.maxMentees - mentor.mentorProfile.currentMentees
      }))
    });
  } catch (error) {
    console.error('Error fetching available mentors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available mentors',
      error: error.message
    });
  }
});

// Update mentor grade (Admin only)
// PATCH /api/mentor/:mentorId/grade
router.patch('/:mentorId/grade', [protect, adminAuth], async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { grade } = req.body;

    if (!grade || !['A', 'B'].includes(grade)) {
      return res.status(400).json({
        success: false,
        message: 'Valid grade (A or B) is required'
      });
    }

    const mentor = await User.findById(mentorId);
    
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    if (!mentor.hasRole('mentor')) {
      return res.status(400).json({
        success: false,
        message: 'User is not a mentor'
      });
    }

    if (!mentor.mentorProfile) {
      mentor.mentorProfile = {};
    }
    
    mentor.mentorProfile.grade = grade;
    await mentor.save();

    res.json({
      success: true,
      message: 'Mentor grade updated successfully',
      data: {
        id: mentor._id,
        name: mentor.name,
        grade: mentor.mentorProfile.grade
      }
    });
  } catch (error) {
    console.error('Error updating mentor grade:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating mentor grade',
      error: error.message
    });
  }
});

// Update mentor capacity (Admin only)
// PATCH /api/mentor/:mentorId/capacity
router.patch('/:mentorId/capacity', [protect, adminAuth], async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { maxMentees } = req.body;

    if (!maxMentees || maxMentees < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid maxMentees (minimum 1) is required'
      });
    }

    const mentor = await User.findById(mentorId);
    
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    if (!mentor.hasRole('mentor')) {
      return res.status(400).json({
        success: false,
        message: 'User is not a mentor'
      });
    }

    if (!mentor.mentorProfile) {
      mentor.mentorProfile = {};
    }
    
    mentor.mentorProfile.maxMentees = maxMentees;
    await mentor.save();

    res.json({
      success: true,
      message: 'Mentor capacity updated successfully',
      data: {
        id: mentor._id,
        name: mentor.name,
        maxMentees: mentor.mentorProfile.maxMentees,
        currentMentees: mentor.mentorProfile.currentMentees
      }
    });
  } catch (error) {
    console.error('Error updating mentor capacity:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating mentor capacity',
      error: error.message
    });
  }
});

module.exports = router;
