const express = require('express');
const router = express.Router();
const InternshipPosting = require('../models/InternshipPosting');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendShortlistEmail, sendRejectionEmail } = require('../utils/emailService');

// Test route without auth to check if the issue is with auth middleware
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Employer routes are working'
  });
});

// Get employees for the logged-in company/employer
router.get('/employees', protect, async (req, res) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers can access this resource.'
      });
    }

    // Employees have employeeProfile.companyId referencing the company user id
    const employees = await User.find({
      role: 'employee',
      'employeeProfile.companyId': req.user._id
    })
      .select('name email isActive createdAt employeeProfile.position employeeProfile.department lastLogin')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Error fetching employees for employer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employees'
    });
  }
});

// Get all internship postings for employer
router.get('/internships', protect, async (req, res) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers can access this resource.'
      });
    }

    const internships = await InternshipPosting.find({ employerId: req.user._id })
      .populate('applications.jobseekerId', 'name email profile.avatar')
      .sort({ postedAt: -1 });
    
    res.json({
      success: true,
      data: internships
    });
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching internships'
    });
  }
});

// Create new internship posting
router.post('/internships', protect, async (req, res) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers can create internship postings.'
      });
    }

    const employer = await User.findById(req.user._id);
    const companyName = employer.company?.name || employer.name;

    const internshipData = {
      ...req.body,
      employerId: req.user._id,
      companyName: companyName,
      availableSeats: req.body.totalSeats
    };

    const internship = new InternshipPosting(internshipData);
    await internship.save();

    res.status(201).json({
      success: true,
      message: 'Internship posting created successfully',
      data: internship
    });
  } catch (error) {
    console.error('Error creating internship:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating internship posting'
    });
  }
});

// Update internship posting
router.put('/internships/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers can update internship postings.'
      });
    }

    const internship = await InternshipPosting.findOne({
      _id: req.params.id,
      employerId: req.user._id
    });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship posting not found'
      });
    }

    Object.keys(req.body).forEach(key => {
      if (key !== 'employerId' && key !== 'companyName') {
        internship[key] = req.body[key];
      }
    });

    await internship.save();

    res.json({
      success: true,
      message: 'Internship posting updated successfully',
      data: internship
    });
  } catch (error) {
    console.error('Error updating internship:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating internship posting'
    });
  }
});

// Delete internship posting
router.delete('/internships/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers can delete internship postings.'
      });
    }

    const internship = await InternshipPosting.findOne({
      _id: req.params.id,
      employerId: req.user._id
    });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship posting not found'
      });
    }

    await InternshipPosting.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Internship posting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting internship:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting internship posting'
    });
  }
});

// Get internship titles for dropdown
router.get('/internship-titles', protect, async (req, res) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers can access this resource.'
      });
    }

    const { industry } = req.query;
    
    const internshipTitles = {
      'IT/Technology': [
        'Software Developer',
        'Full Stack Developer',
        'Frontend Developer',
        'Backend Developer',
        'Mobile App Developer',
        'React Developer',
        'Node.js Developer',
        'Python Developer',
        'Java Developer',
        'DevOps Engineer',
        'Data Scientist',
        'Machine Learning Engineer',
        'AI/ML Engineer',
        'Cloud Engineer',
        'Cybersecurity Analyst',
        'UI/UX Designer',
        'Product Manager',
        'Quality Assurance Engineer',
        'Database Administrator',
        'System Administrator',
        'Network Engineer',
        'Blockchain Developer',
        'Game Developer',
        'IoT Developer',
        'Embedded Systems Engineer'
      ],
      'Banking': [
        'Investment Banking Analyst',
        'Commercial Banking Officer',
        'Retail Banking Specialist',
        'Risk Management Analyst',
        'Financial Analyst',
        'Credit Analyst',
        'Treasury Analyst',
        'Compliance Officer',
        'Audit Associate',
        'Operations Analyst',
        'Digital Banking Specialist',
        'Fintech Developer',
        'Wealth Management Advisor',
        'Insurance Underwriter',
        'Corporate Finance Analyst',
        'Business Analyst',
        'Data Analyst',
        'Customer Service Representative',
        'Marketing Specialist',
        'HR Coordinator'
      ],
      'Healthcare': [
        'Clinical Research Associate',
        'Medical Device Engineer',
        'Healthcare IT Specialist',
        'Pharmaceutical Analyst',
        'Public Health Coordinator',
        'Healthcare Administrator',
        'Nursing Assistant',
        'Medical Laboratory Technician',
        'Health Informatics Specialist',
        'Biotechnology Researcher',
        'Patient Care Coordinator',
        'Medical Writer',
        'Healthcare Data Analyst',
        'Quality Assurance Specialist',
        'Regulatory Affairs Specialist'
      ],
    };

    let titles = [];
    if (industry && internshipTitles[industry]) {
      titles = internshipTitles[industry];
    } else {
      Object.values(internshipTitles).forEach(industryTitles => {
        titles = titles.concat(industryTitles);
      });
    }

    res.json({
      success: true,
      data: titles
    });
  } catch (error) {
    console.error('Error fetching internship titles:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching internship titles'
    });
  }
});

// Get India locations for dropdown
router.get('/india-locations', protect, async (req, res) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers can access this resource.'
      });
    }

    const indiaLocations = [
      'Mumbai, Maharashtra',
      'Delhi, Delhi',
      'Bangalore, Karnataka',
      'Hyderabad, Telangana',
      'Chennai, Tamil Nadu',
      'Kolkata, West Bengal',
      'Pune, Maharashtra',
      'Ahmedabad, Gujarat',
      'Jaipur, Rajasthan',
      'Surat, Gujarat',
      'Lucknow, Uttar Pradesh',
      'Kanpur, Uttar Pradesh',
      'Nagpur, Maharashtra',
      'Indore, Madhya Pradesh',
      'Thane, Maharashtra',
      'Bhopal, Madhya Pradesh',
      'Visakhapatnam, Andhra Pradesh',
      'Patna, Bihar',
      'Vadodara, Gujarat',
      'Ghaziabad, Uttar Pradesh',
      'Ludhiana, Punjab',
      'Agra, Uttar Pradesh',
      'Nashik, Maharashtra',
      'Faridabad, Haryana',
      'Meerut, Uttar Pradesh',
      'Rajkot, Gujarat',
      'Varanasi, Uttar Pradesh',
      'Srinagar, Jammu and Kashmir',
      'Aurangabad, Maharashtra',
      'Dhanbad, Jharkhand',
      'Amritsar, Punjab',
      'Allahabad, Uttar Pradesh',
      'Ranchi, Jharkhand',
      'Howrah, West Bengal',
      'Coimbatore, Tamil Nadu',
      'Jabalpur, Madhya Pradesh',
      'Gwalior, Madhya Pradesh',
      'Vijayawada, Andhra Pradesh',
      'Jodhpur, Rajasthan',
      'Madurai, Tamil Nadu',
      'Raipur, Chhattisgarh',
      'Kota, Rajasthan',
      'Guwahati, Assam',
      'Chandigarh, Chandigarh',
      'Solapur, Maharashtra',
      'Hubli-Dharwad, Karnataka',
      'Bareilly, Uttar Pradesh',
      'Moradabad, Uttar Pradesh',
      'Mysore, Karnataka',
      'Gurgaon, Haryana',
      'Aligarh, Uttar Pradesh',
      'Jalandhar, Punjab',
      'Tiruchirappalli, Tamil Nadu',
      'Bhubaneswar, Odisha',
      'Salem, Tamil Nadu',
      'Warangal, Telangana',
      'Guntur, Andhra Pradesh',
      'Bhiwandi, Maharashtra',
      'Saharanpur, Uttar Pradesh',
      'Gorakhpur, Uttar Pradesh',
      'Bikaner, Rajasthan',
      'Amravati, Maharashtra',
      'Noida, Uttar Pradesh',
      'Jamshedpur, Jharkhand',
      'Bhilai, Chhattisgarh',
      'Cuttack, Odisha',
      'Firozabad, Uttar Pradesh',
      'Kochi, Kerala',
      'Bhavnagar, Gujarat',
      'Dehradun, Uttarakhand',
      'Durgapur, West Bengal',
      'Asansol, West Bengal',
      'Rourkela, Odisha',
      'Nanded, Maharashtra',
      'Kolhapur, Maharashtra',
      'Ajmer, Rajasthan',
      'Akola, Maharashtra',
      'Gulbarga, Karnataka',
      'Jamnagar, Gujarat',
      'Ujjain, Madhya Pradesh',
      'Loni, Uttar Pradesh',
      'Siliguri, West Bengal',
      'Jhansi, Uttar Pradesh',
      'Ulhasnagar, Maharashtra',
      'Nellore, Andhra Pradesh',
      'Jammu, Jammu and Kashmir',
      'Sangli-Miraj & Kupwad, Maharashtra',
      'Belgaum, Karnataka',
      'Mangalore, Karnataka',
      'Ambattur, Tamil Nadu',
      'Tirunelveli, Tamil Nadu',
      'Malegaon, Maharashtra',
      'Gaya, Bihar',
      'Jalgaon, Maharashtra',
      'Udaipur, Rajasthan',
      'Maheshtala, West Bengal',
      'Tirupur, Tamil Nadu',
      'Davanagere, Karnataka',
      'Kozhikode, Kerala',
      'Akbarpur, Uttar Pradesh',
      'Kurnool, Andhra Pradesh',
      'Bokaro Steel City, Jharkhand',
      'Rajahmundry, Andhra Pradesh',
      'Ballari, Karnataka',
      'Agartala, Tripura',
      'Bhagalpur, Bihar',
      'Latur, Maharashtra',
      'Dhule, Maharashtra',
      'Korba, Chhattisgarh',
      'Bhilwara, Rajasthan',
      'Brahmapur, Odisha',
      'Muzaffarpur, Bihar',
      'Ahmednagar, Maharashtra',
      'Mathura, Uttar Pradesh',
      'Kollam, Kerala',
      'Avadi, Tamil Nadu',
      'Kadapa, Andhra Pradesh',
      'Anantapur, Andhra Pradesh',
      'Tiruvottiyur, Tamil Nadu',
      'Karnal, Haryana',
      'Bathinda, Punjab',
      'Rampur, Uttar Pradesh',
      'Shivamogga, Karnataka',
      'Ratlam, Madhya Pradesh',
      'Modinagar, Uttar Pradesh',
      'Durg, Chhattisgarh',
      'Shillong, Meghalaya',
      'Imphal, Manipur',
      'Hapur, Uttar Pradesh',
      'Ranipet, Tamil Nadu',
      'Anand, Gujarat',
      'Bhind, Madhya Pradesh',
      'Bhalswa Jahangir Pur, Delhi',
      'Madhyamgram, West Bengal',
      'Bhiwani, Haryana',
      'Berhampore, West Bengal',
      'Ambala, Haryana',
      'Mori Gate, Delhi',
      'South Extension, Delhi',
      'Dwarka, Delhi',
      'Rohini, Delhi',
      'Pitampura, Delhi',
      'Janakpuri, Delhi',
      'Rajouri Garden, Delhi',
      'Lajpat Nagar, Delhi',
      'Saket, Delhi',
      'Vasant Vihar, Delhi',
      'Hauz Khas, Delhi',
      'Green Park, Delhi',
      'Kalkaji, Delhi',
      'Greater Kailash, Delhi',
      'Defence Colony, Delhi',
      'Malviya Nagar, Delhi',
      'Kailash Colony, Delhi',
      'Nehru Place, Delhi',
      'Okhla, Delhi',
      'Sangam Vihar, Delhi',
      'Tughlakabad, Delhi',
      'Badarpur, Delhi',
      'Jaitpur, Delhi',
      'Khanpur, Delhi',
      'Mehrauli, Delhi',
      'Vasant Kunj, Delhi',
      'Munirka, Delhi',
      'R K Puram, Delhi',
      'Chanakyapuri, Delhi',
      'Connaught Place, Delhi',
      'Karol Bagh, Delhi',
      'Paharganj, Delhi',
      'Old Delhi, Delhi',
      'Shahdara, Delhi',
      'Seelampur, Delhi',
      'Gandhi Nagar, Delhi',
      'Krishna Nagar, Delhi',
      'Preet Vihar, Delhi',
      'Vivek Vihar, Delhi',
      'Dilshad Garden, Delhi',
      'Shahdara, Delhi',
      'Welcome, Delhi',
      'Seemapuri, Delhi',
      'Gokulpuri, Delhi',
      'Maujpur, Delhi',
      'Jaffrabad, Delhi',
      'Mustafabad, Delhi',
      'Babarpur, Delhi',
      'Gokalpuri, Delhi',
      'Bhajanpura, Delhi',
      'Yamuna Vihar, Delhi',
      'Vishwas Nagar, Delhi',
      'Krishna Nagar, Delhi',
      'Gandhi Nagar, Delhi',
      'Preet Vihar, Delhi',
      'Vivek Vihar, Delhi',
      'Dilshad Garden, Delhi',
      'Geeta Colony, Delhi',
      'Shahdara, Delhi',
      'Welcome, Delhi',
      'Seemapuri, Delhi',
      'Gokulpuri, Delhi',
      'Maujpur, Delhi',
      'Jaffrabad, Delhi',
      'Mustafabad, Delhi',
      'Babarpur, Delhi',
      'Gokalpuri, Delhi',
      'Bhajanpura, Delhi',
      'Yamuna Vihar, Delhi',
      'Vishwas Nagar, Delhi',
      'Krishna Nagar, Delhi',
      'Gandhi Nagar, Delhi',
      'Preet Vihar, Delhi',
      'Vivek Vihar, Delhi',
      'Dilshad Garden, Delhi',
      'Geeta Colony, Delhi'
    ];

    res.json({
      success: true,
      data: indiaLocations
    });
  } catch (error) {
    console.error('Error fetching India locations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching India locations'
    });
  }
});

// @desc    Get detailed applications for employer's internships
// @route   GET /api/employer/applications-detailed
// @access  Private (Employer only)
router.get('/applications-detailed', protect, async (req, res) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'company' && req.user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers or employees can access this resource.'
      });
    }

    const InternshipApplication = require('../models/InternshipApplication');
    
    const { status, internshipId, page = 1, limit = 10 } = req.query;

    // Determine the effective employer/company id for fetching applications
    let effectiveEmployerId = req.user._id;
    if (req.user.role === 'employee') {
      const companyId = req.user.employeeProfile?.companyId;
      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Employee is not associated with a company.'
        });
      }
      effectiveEmployerId = companyId;
    }
    
    let applications = await InternshipApplication.getApplicationsForEmployer(
      effectiveEmployerId,
      { status, internshipId }
    );

    // Normalize legacy statuses before returning
    applications = applications.map(app => {
      if (app.status === 'reviewed' && app.decision === 'Proceed to Recruiter') {
        app.status = 'shortlisted';
      }
      return app;
    });

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedApplications = applications.slice(startIndex, endIndex);

    // Attach rich details for recruiter dashboard rendering
    const withSummaries = paginatedApplications.map((app) => ({
      _id: app._id,
      status: app.status,
      matchScore: app.matchScore,
      decision: app.decision,
      summary: app.summary,
      appliedAt: app.appliedAt,
      createdAt: app.createdAt,
      // Test fields for recruiter visibility
      answers: Array.isArray(app.answers) ? app.answers : [],
      score: typeof app.score === 'number' ? app.score : null,
      result: app.result || null,
      reason: app.reason || null,
      personalDetails: app.personalDetails,
      educationDetails: app.educationDetails,
      workExperience: app.workExperience,
      additionalInfo: app.additionalInfo,
      internshipDetails: app.internshipDetails,
      jobseeker: app.jobseekerId ? {
        _id: app.jobseekerId._id || app.jobseekerId,
        name: app.jobseekerId.name,
        email: app.jobseekerId.email,
        profilePicture: app.jobseekerId.profile?.profilePicture
      } : null,
      internship: app.internshipId ? {
        _id: app.internshipId._id || app.internshipId,
        title: app.internshipId.title,
        companyName: app.internshipId.companyName,
        startDate: app.internshipId.startDate,
        duration: app.internshipId.duration
      } : null
    }));

    res.json({
      success: true,
      data: {
        applications: withSummaries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(applications.length / limit),
          totalItems: applications.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching detailed applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
});

// @desc    Get single detailed application
// @route   GET /api/employer/applications-detailed/:id
// @access  Private (Employer only)
router.get('/applications-detailed/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'company' && req.user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers or employees can access this resource.'
      });
    }

    const InternshipApplication = require('../models/InternshipApplication');

    // Determine the effective employer/company id for fetching application
    let effectiveEmployerId = req.user._id;
    if (req.user.role === 'employee') {
      const companyId = req.user.employeeProfile?.companyId;
      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Employee is not associated with a company.'
        });
      }
      effectiveEmployerId = companyId;
    }
    
    const application = await InternshipApplication.findOne({
      _id: req.params.id,
      employerId: effectiveEmployerId
    })
    .populate('jobseekerId', 'name email profile.profilePicture createdAt')
    .populate('internshipId', 'title companyName startDate duration location mode');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Normalize legacy status for single fetch as well
    if (application.status === 'reviewed' && application.decision === 'Proceed to Recruiter') {
      application.status = 'shortlisted';
    }

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching application details'
    });
  }
});

// @desc    Update application status
// @route   PATCH /api/employer/applications-detailed/:id/status
// @access  Private (Employer only)
router.patch('/applications-detailed/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only employers can access this resource.'
      });
    }

    const InternshipApplication = require('../models/InternshipApplication');
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const application = await InternshipApplication.findOne({
      _id: req.params.id,
      employerId: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.updateStatus(status, req.user._id, notes);

    // Also update the status in the internship's applications array for backward compatibility
    const internship = await InternshipPosting.findById(application.internshipId);
    if (internship) {
      const appIndex = internship.applications.findIndex(
        app => app.jobseekerId.toString() === application.jobseekerId.toString()
      );
      if (appIndex !== -1) {
        internship.applications[appIndex].status = status;
        await internship.save();
      }
    }

    // If shortlisted, send a professional email to the jobseeker
    if (status === 'shortlisted') {
      try {
        const jobseeker = await User.findById(application.jobseekerId);
        const companyName = internship?.companyName || 'Our Company';
        const internshipTitle = internship?.title || 'Internship';
        const nextSteps = notes || '';
        if (jobseeker?.email) {
          await sendShortlistEmail(jobseeker.email, jobseeker.name || 'Candidate', companyName, internshipTitle, nextSteps);
        }
      } catch (emailErr) {
        console.error('Error sending shortlist email:', emailErr);
      }
    }

    // If rejected, send a professional rejection email
    if (status === 'rejected') {
      try {
        const jobseeker = await User.findById(application.jobseekerId);
        const companyName = internship?.companyName || 'Our Company';
        const internshipTitle = internship?.title || 'Internship';
        const reason = notes || '';
        if (jobseeker?.email) {
          await sendRejectionEmail(jobseeker.email, jobseeker.name || 'Candidate', companyName, internshipTitle, reason);
        }
      } catch (emailErr) {
        console.error('Error sending rejection email:', emailErr);
      }
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        applicationId: application._id,
        status: application.status,
        updatedAt: application.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating application status'
    });
  }
});

module.exports = router;
