const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const JobseekerProfile = require('../models/JobseekerProfile');
const InternshipPosting = require('../models/InternshipPosting');
const InternshipApplication = require('../models/InternshipApplication');
const { protect, authorize } = require('../middleware/auth');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { updateProfileATSScore, generateATSSuggestions } = require('../utils/atsScoring');
const { sendShortlistEmail, sendRejectionEmail } = require('../utils/emailService');
const { extractText, extractEntities, isLikelyResume } = require('../utils/resumeParser');
const { analyzeAndSaveNLP, computeNLPScore } = require('../utils/atsScoringNLP');

const router = express.Router();



// Apply protection and role authorization to all routes
router.use(protect);
router.use(authorize('jobseeker'));

// @desc    Get jobseeker dashboard data
// @route   GET /api/jobseeker/dashboard
// @access  Private (Jobseeker only)
router.get('/dashboard', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate profile completion suggestions for quick actions
    const quickActions = [];
    
    if (!user.profile.bio) {
      quickActions.push({
        id: 'add-bio',
        title: 'Add Professional Bio',
        description: 'Tell employers about yourself',
        icon: 'user',
        priority: 'high',
        action: 'complete-profile',
        field: 'bio'
      });
    }
    
    if (!user.profile.skills || user.profile.skills.length === 0) {
      quickActions.push({
        id: 'add-skills',
        title: 'Add Your Skills',
        description: 'List your technical abilities',
        icon: 'code',
        priority: 'high',
        action: 'complete-profile',
        field: 'skills'
      });
    }
    
    if (!user.profile.resume) {
      quickActions.push({
        id: 'upload-resume',
        title: 'Upload Resume',
        description: 'Make applications easier',
        icon: 'file-text',
        priority: 'high',
        action: 'complete-profile',
        field: 'resume'
      });
    }
    
    if (!user.profile.location) {
      quickActions.push({
        id: 'add-location',
        title: 'Add Location',
        description: 'Help employers find local talent',
        icon: 'map-pin',
        priority: 'medium',
        action: 'complete-profile',
        field: 'location'
      });
    }
    
    if (!user.profile.phone) {
      quickActions.push({
        id: 'add-phone',
        title: 'Add Phone Number',
        description: 'Let employers contact you',
        icon: 'phone',
        priority: 'medium',
        action: 'complete-profile',
        field: 'phone'
      });
    }

    // Get mentor assignment information if available
    let mentorInfo = null;
    if (user.profile.assignedMentor) {
      try {
        const mentor = await User.findById(user.profile.assignedMentor)
          .select('name email mentorProfile.grade mentorProfile.expertise');
        if (mentor) {
          mentorInfo = {
            _id: mentor._id,
            name: mentor.name,
            email: mentor.email,
            mentorProfile: mentor.mentorProfile
          };
        }
      } catch (error) {
        console.error('Error fetching mentor info:', error);
      }
    }

    // Dashboard statistics (you can expand this based on your needs)
    const dashboardData = {
      profile: {
        completionPercentage: user.profileCompletion,
        name: user.name,
        email: user.email,
        bio: user.profile.bio,
        skills: user.profile.skills || [],
        experience: user.profile.experience,
        location: user.profile.location,
        phone: user.profile.phone,
        resume: user.profile.resume,
        portfolio: user.profile.portfolio,
        profilePicture: user.profile.profilePicture,
        socialLinks: user.profile.socialLinks || {},
        jobPreferences: user.profile.jobPreferences || {},
        isProfilePublic: user.profile.isProfilePublic,
        // Extended profile fields
        education: user.profile.education || [],
        workExperience: user.profile.workExperience || [],
        certifications: user.profile.certifications || [],
        jobTitles: user.profile.jobTitles || [],
        jobTypes: user.profile.jobTypes || [],
        workSchedule: user.profile.workSchedule || [],
        minimumBasePay: user.profile.minimumBasePay,
        relocationPreferences: user.profile.relocationPreferences || [],
        remotePreferences: user.profile.remotePreferences,
        readyToWork: user.profile.readyToWork || false,
        lastUpdated: user.profile.lastUpdated,
        // Mentor assignment fields
        grade: user.profile.grade,
        assignedMentor: mentorInfo,
        mentorAssignmentDate: user.profile.mentorAssignmentDate
      },
      quickActions: quickActions.slice(0, 4), // Show top 4 quick actions
      stats: {
        profileViews: 0,
        applicationsSubmitted: await InternshipApplication.countDocuments({ jobseekerId: user._id }),
        interviewsScheduled: 0,
        jobsSaved: 0,
        profileCompletion: user.profileCompletion
      },
      recentActivity: [], // Implement later
      recommendations: [], // Implement later
      upcomingInterviews: [] // Implement later
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @desc    Get jobseeker profile
// @route   GET /api/jobseeker/profile
// @access  Private (Jobseeker only)
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch extended JobseekerProfile to expose resumeUrl and other fields
    const extendedProfile = await JobseekerProfile.findOne({ userId: req.user._id });

    // Normalize resume URL for frontend convenience
    const normalizedResumeUrl = extendedProfile?.resumeUrl || user.profile?.resume || null;

    res.json({
      success: true,
      data: {
        user,
        profileCompletion: user.profileCompletion,
        extendedProfile,
        resumeUrl: normalizedResumeUrl
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @desc    Update jobseeker profile
// @route   PUT /api/jobseeker/profile
// @access  Private (Jobseeker only)
router.put('/profile', async (req, res) => {
  try {
    console.log('📝 Profile update request received:');
    console.log('   User ID:', req.user._id);
    console.log('   Request body keys:', Object.keys(req.body));
    console.log('   Profile data:', JSON.stringify(req.body, null, 2));
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, profile } = req.body;

    // Update basic info
    if (name) user.name = name;

    // Update profile fields
    if (profile) {
      // Basic profile fields
      if (profile.bio !== undefined) user.profile.bio = profile.bio;
      if (profile.skills !== undefined) user.profile.skills = profile.skills;
      if (profile.experience !== undefined) user.profile.experience = profile.experience;
      if (profile.location !== undefined) user.profile.location = profile.location;
      if (profile.phone !== undefined) user.profile.phone = profile.phone;
      if (profile.resume !== undefined) user.profile.resume = profile.resume;
      if (profile.portfolio !== undefined) user.profile.portfolio = profile.portfolio;
      if (profile.profilePicture !== undefined) user.profile.profilePicture = profile.profilePicture;
      
      // Extended profile fields
      if (profile.education !== undefined) user.profile.education = profile.education;
      if (profile.workExperience !== undefined) user.profile.workExperience = profile.workExperience;
      if (profile.certifications !== undefined) user.profile.certifications = profile.certifications;
      if (profile.jobTitles !== undefined) user.profile.jobTitles = profile.jobTitles;
      if (profile.jobTypes !== undefined) user.profile.jobTypes = profile.jobTypes;
      if (profile.workSchedule !== undefined) user.profile.workSchedule = profile.workSchedule;
      if (profile.minimumBasePay !== undefined) user.profile.minimumBasePay = profile.minimumBasePay;
      if (profile.relocationPreferences !== undefined) user.profile.relocationPreferences = profile.relocationPreferences;
      if (profile.remotePreferences !== undefined) user.profile.remotePreferences = profile.remotePreferences;
      if (profile.readyToWork !== undefined) user.profile.readyToWork = profile.readyToWork;
      
      // Update social links
      if (profile.socialLinks !== undefined) {
        if (!user.profile.socialLinks) user.profile.socialLinks = {};
        if (profile.socialLinks.linkedin !== undefined) user.profile.socialLinks.linkedin = profile.socialLinks.linkedin;
        if (profile.socialLinks.github !== undefined) user.profile.socialLinks.github = profile.socialLinks.github;
        if (profile.socialLinks.twitter !== undefined) user.profile.socialLinks.twitter = profile.socialLinks.twitter;
        if (profile.socialLinks.website !== undefined) user.profile.socialLinks.website = profile.socialLinks.website;
      }
      
      // Update job preferences
      if (profile.jobPreferences !== undefined) {
        if (!user.profile.jobPreferences) user.profile.jobPreferences = {};
        if (profile.jobPreferences.jobType !== undefined) user.profile.jobPreferences.jobType = profile.jobPreferences.jobType;
        if (profile.jobPreferences.workMode !== undefined) user.profile.jobPreferences.workMode = profile.jobPreferences.workMode;
        if (profile.jobPreferences.availableFrom !== undefined) user.profile.jobPreferences.availableFrom = profile.jobPreferences.availableFrom;
        
        // Update expected salary
        if (profile.jobPreferences.expectedSalary !== undefined) {
          if (!user.profile.jobPreferences.expectedSalary) user.profile.jobPreferences.expectedSalary = {};
          if (profile.jobPreferences.expectedSalary.min !== undefined) user.profile.jobPreferences.expectedSalary.min = profile.jobPreferences.expectedSalary.min;
          if (profile.jobPreferences.expectedSalary.max !== undefined) user.profile.jobPreferences.expectedSalary.max = profile.jobPreferences.expectedSalary.max;
          if (profile.jobPreferences.expectedSalary.currency !== undefined) user.profile.jobPreferences.expectedSalary.currency = profile.jobPreferences.expectedSalary.currency;
        }
      }
      
      // Update profile visibility and timestamp
      if (profile.isProfilePublic !== undefined) user.profile.isProfilePublic = profile.isProfilePublic;
      user.profile.lastUpdated = new Date();
    }

    // Calculate and update profile completion
    await user.calculateProfileCompletion();
    
    // Save with validateModifiedOnly to avoid password validation during profile updates
    await user.save({ validateModifiedOnly: true });

    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
        profileCompletion: updatedUser.profileCompletion
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      console.error('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors,
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @desc    Get full profile view (formatted for display)
// @route   GET /api/jobseeker/profile/view
// @access  Private (Jobseeker only)
router.get('/profile/view', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format profile data for display
    const profileView = {
      basicInfo: {
        name: user.name,
        email: user.email,
        phone: user.profile.phone || null,
        location: user.profile.location || null,
        profilePicture: user.profile.profilePicture || null,
        memberSince: user.createdAt
      },
      professionalInfo: {
        bio: user.profile.bio || null,
        skills: user.profile.skills || [],
        experience: user.profile.experience || null,
        resume: user.profile.resume || null,
        portfolio: user.profile.portfolio || null
      },
      socialLinks: user.profile.socialLinks || {},
      jobPreferences: {
        jobType: user.profile.jobPreferences?.jobType || null,
        workMode: user.profile.jobPreferences?.workMode || null,
        expectedSalary: user.profile.jobPreferences?.expectedSalary || null,
        availableFrom: user.profile.jobPreferences?.availableFrom || null
      },
      settings: {
        isProfilePublic: user.profile.isProfilePublic || false
      },
      stats: {
        profileCompletion: user.profileCompletion,
        lastUpdated: user.profile.lastUpdated || user.updatedAt
      }
    };

    res.json({
      success: true,
      data: profileView
    });

  } catch (error) {
    console.error('Profile view error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile view'
    });
  }
});

// @desc    Get profile completion suggestions
// @route   GET /api/jobseeker/profile-suggestions
// @access  Private (Jobseeker only)
router.get('/profile-suggestions', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const suggestions = [];

    // Check what's missing and provide suggestions
    if (!user.profile.bio) {
      suggestions.push({
        field: 'bio',
        title: 'Add a Professional Bio',
        description: 'Write a brief description about yourself and your career goals',
        priority: 'high',
        weight: 15,
        icon: 'user'
      });
    }

    if (!user.profile.skills || user.profile.skills.length === 0) {
      suggestions.push({
        field: 'skills',
        title: 'Add Your Skills',
        description: 'List your technical and soft skills to help employers find you',
        priority: 'high',
        weight: 20,
        icon: 'code'
      });
    }

    if (!user.profile.phone) {
      suggestions.push({
        field: 'phone',
        title: 'Add Contact Number',
        description: 'Provide a phone number for employers to reach you',
        priority: 'medium',
        weight: 10,
        icon: 'phone'
      });
    }

    if (!user.profile.location) {
      suggestions.push({
        field: 'location',
        title: 'Add Your Location',
        description: 'Help employers find local talent by adding your location',
        priority: 'medium',
        weight: 10,
        icon: 'map-pin'
      });
    }

    if (!user.profile.resume) {
      suggestions.push({
        field: 'resume',
        title: 'Upload Your Resume',
        description: 'Upload your resume to make applications easier',
        priority: 'high',
        weight: 15,
        icon: 'file-text'
      });
    }

    if (!user.profile.portfolio) {
      suggestions.push({
        field: 'portfolio',
        title: 'Add Portfolio Link',
        description: 'Showcase your work with a portfolio or personal website',
        priority: 'medium',
        weight: 10,
        icon: 'briefcase'
      });
    }

    if (!user.profile.profilePicture) {
      suggestions.push({
        field: 'profilePicture',
        title: 'Add Profile Picture',
        description: 'Add a professional profile picture to make your profile more personal',
        priority: 'low',
        weight: 5,
        icon: 'camera'
      });
    }

    if (!user.profile.socialLinks || Object.keys(user.profile.socialLinks).length === 0) {
      suggestions.push({
        field: 'socialLinks',
        title: 'Add Social Media Links',
        description: 'Connect your LinkedIn, GitHub, or other professional profiles',
        priority: 'medium',
        weight: 10,
        icon: 'link'
      });
    }

    if (!user.profile.jobPreferences || 
        (!user.profile.jobPreferences.jobType && 
         !user.profile.jobPreferences.workMode && 
         !user.profile.jobPreferences.expectedSalary)) {
      suggestions.push({
        field: 'jobPreferences',
        title: 'Set Job Preferences',
        description: 'Specify your preferred job type, work mode, and salary expectations',
        priority: 'medium',
        weight: 5,
        icon: 'settings'
      });
    }

    if (!user.profile.experience) {
      suggestions.push({
        field: 'experience',
        title: 'Add Experience Level',
        description: 'Let employers know your experience level',
        priority: 'medium',
        weight: 8,
        icon: 'award'
      });
    }

    // Sort suggestions by priority and weight
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    suggestions.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.weight - a.weight;
    });

    res.json({
      success: true,
      data: {
        profileCompletion: user.profileCompletion,
        suggestions,
        totalSuggestions: suggestions.length
      }
    });

  } catch (error) {
    console.error('Profile suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile suggestions'
    });
  }
});

// @desc    Get jobseeker statistics
// @route   GET /api/jobseeker/stats
// @access  Private (Jobseeker only)
router.get('/stats', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // For now, returning mock data. You can expand this when you add job applications, etc.
    const stats = {
      profileViews: 0,
      applicationsSubmitted: 0,
      interviewsScheduled: 0,
      jobsSaved: 0,
      profileCompletion: user.profileCompletion,
      memberSince: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// @desc    Toggle profile visibility
// @route   PATCH /api/jobseeker/profile/visibility
// @access  Private (Jobseeker only)
router.patch('/profile/visibility', async (req, res) => {
  try {
    const { isPublic } = req.body;
    
    if (typeof isPublic !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isPublic must be a boolean value'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.profile.isProfilePublic = isPublic;
    await user.save();

    res.json({
      success: true,
      message: `Profile is now ${isPublic ? 'public' : 'private'}`,
      data: {
        isProfilePublic: user.profile.isProfilePublic
      }
    });

  } catch (error) {
    console.error('Profile visibility toggle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile visibility'
    });
  }
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDF and DOC files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'), false);
    }
  }
});

// @desc    Create jobseeker profile
// @route   POST /api/jobseeker/profile
// @access  Private (Jobseeker only)
router.post('/profile', async (req, res) => {
  try {
    const {
      education,
      skills,
      internshipTitle,
      internshipType,
      preferredLocation,
      readyToWorkAfterInternship
    } = req.body;

    // Check if profile already exists
    const existingProfile = await JobseekerProfile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profile already exists. Use PUT to update.'
      });
    }

    // Validate required fields
    if (!education || !Array.isArray(education) || education.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one education entry is required'
      });
    }

    // Create new profile
    const profile = new JobseekerProfile({
      userId: req.user._id,
      education,
      skills: skills || [],
      internshipTitle,
      internshipType,
      preferredLocation,
      readyToWorkAfterInternship: readyToWorkAfterInternship || false
    });

    await profile.save();

    // Calculate initial ATS score
    const atsResult = await updateProfileATSScore(req.user._id);

    // Update profile completion percentage in User model
    const user = await User.findById(req.user._id);
    if (user) {
      await user.calculateProfileCompletion();
      await user.save({ validateModifiedOnly: true });
    }

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: {
        profile,
        atsScore: atsResult.atsScore,
        suggestions: atsResult.suggestions,
        profileCompletion: user ? user.profileCompletion : 0
      }
    });

  } catch (error) {
    console.error('Profile creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating profile'
    });
  }
});

// @desc    Get jobseeker profile
// @route   GET /api/jobseeker/profile/:userId
// @access  Private (Jobseeker only)
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own profile or if profile is public
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const profile = await JobseekerProfile.findOne({ userId }).populate('userId', 'name email phone');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Get user data
    const user = await User.findById(userId).select('name email phone');
    
    // Combine user and profile data
    const profileData = {
      ...profile.toObject(),
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    };

    res.json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @desc    Update jobseeker profile
// @route   PUT /api/jobseeker/profile/:userId
// @access  Private (Jobseeker only)
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      education,
      skills,
      internshipTitle,
      internshipType,
      preferredLocation,
      readyToWorkAfterInternship
    } = req.body;

    // Check if user is updating their own profile
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const profile = await JobseekerProfile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update profile fields
    if (education) profile.education = education;
    if (skills) profile.skills = skills;
    if (internshipTitle !== undefined) profile.internshipTitle = internshipTitle;
    if (internshipType) profile.internshipType = internshipType;
    if (preferredLocation !== undefined) profile.preferredLocation = preferredLocation;
    if (readyToWorkAfterInternship !== undefined) profile.readyToWorkAfterInternship = readyToWorkAfterInternship;

    await profile.save();

    // Update ATS score
    const atsResult = await updateProfileATSScore(userId);

    // Update profile completion percentage in User model
    const user = await User.findById(userId);
    if (user) {
      await user.calculateProfileCompletion();
      await user.save({ validateModifiedOnly: true });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile,
        atsScore: atsResult.atsScore,
        suggestions: atsResult.suggestions,
        profileCompletion: user ? user.profileCompletion : 0
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @desc    Upload resume to Cloudinary
// @route   POST /api/jobseeker/upload-resume
// @access  Private (Jobseeker only)
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Extract text first to validate resume before uploading to Cloudinary
    let parsedText = '';
    try {
      parsedText = await extractText(req.file.buffer, req.file.mimetype);
    } catch (e) {
      console.warn('Resume text extraction failed:', e.message);
    }

    if (!isLikelyResume(parsedText)) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a valid resume (include contact, education, experience/projects, and skills)'
      });
    }

    // Upload to Cloudinary (after validation)
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      'resumes',
      `resume_${req.user._id}_${Date.now()}`
    );

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload file to Cloudinary',
        error: uploadResult.error
      });
    }

    // Find or create profile
    let profile = await JobseekerProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      // Create basic profile if it doesn't exist
      profile = new JobseekerProfile({
        userId: req.user._id,
        education: [],
        skills: []
      });
    }

    // Delete old resume if exists
    if (profile.resumeUrl) {
      const oldPublicId = profile.resumeUrl.split('/').pop().split('.')[0];
      await deleteFromCloudinary(oldPublicId);
    }

    // Update profile with new resume URL
    profile.resumeUrl = uploadResult.url;
    await profile.save();

    // We already have parsedText; proceed to extract entities
    const extracted = extractEntities(parsedText);

    // Save NLP analysis and compute NLP ATS, keep previous snapshot for comparison
    const prevNlp = (await JobseekerProfile.findOne({ userId: req.user._id }))?.nlp || null;
    const nlpResult = await analyzeAndSaveNLP(req.user._id, parsedText, extracted);
    const profileAfter = await JobseekerProfile.findOne({ userId: req.user._id });
    if (profileAfter?.nlp) {
      profileAfter.nlp.history = profileAfter.nlp.history || [];
      profileAfter.nlp.history.push({ analyzedAt: new Date(), score: profileAfter.nlp.atsNLP?.score || 0, details: profileAfter.nlp.atsNLP?.details || {} });
      await profileAfter.save();
    }

    // Update rule-based ATS score for backward compatibility
    const atsResult = await updateProfileATSScore(req.user._id);

    // Update profile completion percentage in User model
    const user = await User.findById(req.user._id);
    if (user) {
      await user.calculateProfileCompletion();
      await user.save({ validateModifiedOnly: true });
    }

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resumeUrl: uploadResult.url,
        atsScore: atsResult.atsScore,
        atsNLP: nlpResult.success ? nlpResult.atsNLP : undefined,
        comparison: prevNlp && nlpResult.success && nlpResult.atsNLP ? {
          previousScore: prevNlp.atsNLP?.score || 0,
          currentScore: nlpResult.atsNLP.score,
          delta: (nlpResult.atsNLP.score - (prevNlp.atsNLP?.score || 0))
        } : undefined,
        suggestions: atsResult.suggestions,
        profileCompletion: user ? user.profileCompletion : 0
      }
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading resume'
    });
  }
});

// @desc    NLP ATS score (optionally against job description)
// @route   POST /api/jobseeker/ats-nlp
// @access  Private (Jobseeker only)
router.post('/ats-nlp', async (req, res) => {
  try {
    const { jobDescription } = req.body || {};
    const profile = await JobseekerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const { score, details, suggestions } = await computeNLPScore(profile, jobDescription || '');
    res.json({
      success: true,
      data: {
        atsNLP: { score, details, suggestions },
        lastAnalyzedAt: profile?.nlp?.lastAnalyzedAt || null
      }
    });
  } catch (error) {
    console.error('NLP ATS error:', error);
    res.status(500).json({ success: false, message: 'Server error while computing NLP ATS' });
  }
});

// @desc    Re-run NLP parsing on current resume file in Cloudinary (pull via URL not implemented here)
//          Intended for cases where external NLP service changed.
// @route   POST /api/jobseeker/reanalyze-nlp
// @access  Private (Jobseeker only)
router.post('/reanalyze-nlp', async (req, res) => {
  try {
    const profile = await JobseekerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    if (!profile.resumeUrl) {
      return res.status(400).json({ success: false, message: 'No resume on file' });
    }
    // For simplicity, we do not re-download Cloudinary file here.
    // Expect client to re-upload if text extraction needs refresh.
    return res.status(200).json({ success: true, message: 'No-op. Please re-upload resume to re-parse.' });
  } catch (error) {
    console.error('Reanalyze NLP error:', error);
    res.status(500).json({ success: false, message: 'Server error while reanalyzing NLP' });
  }
});

// @desc    Get ATS score and suggestions
// @route   GET /api/jobseeker/ats-score
// @access  Private (Jobseeker only)
router.get('/ats-score', async (req, res) => {
  try {
    const profile = await JobseekerProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const suggestions = generateATSSuggestions(profile);

    res.json({
      success: true,
      data: {
        atsScore: profile.atsScore,
        suggestions,
        profileCompletion: profile.profileCompletion
      }
    });

  } catch (error) {
    console.error('ATS score fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching ATS score'
    });
  }
});

// @desc    Get all available internship postings with search and filters
// @route   GET /api/jobseeker/internships
// @access  Private (Jobseeker only)
router.get('/internships', async (req, res) => {
  try {
    const {
      search,
      industry,
      location,
      mode,
      duration,
      page = 1,
      limit = 10,
      sortBy = 'postedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filters = { status: 'active' };
    
    // Only include internships whose last application date is today or later
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    filters.lastDateToApply = { $gte: startOfToday };
    
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { skillsRequired: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (industry) {
      filters.industry = industry;
    }
    
    if (location) {
      filters.location = { $regex: location, $options: 'i' };
    }
    
    if (mode) {
      filters.mode = mode;
    }
    
    if (duration) {
      filters.duration = duration;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const total = await InternshipPosting.countDocuments(filters);
    
    // Get internships with pagination
    const internships = await InternshipPosting.find(filters)
      .populate('employerId', 'name company.name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-applications'); // Don't include applications for jobseekers

    // Format response
    const formattedInternships = internships.map(internship => ({
      _id: internship._id,
      title: internship.title,
      companyName: internship.companyName || (internship.employerId?.company?.name || internship.employerId?.name || 'Company'),
      industry: internship.industry,
      location: internship.location,
      mode: internship.mode,
      startDate: internship.startDate,
      lastDateToApply: internship.lastDateToApply,
      duration: internship.duration,
      totalSeats: internship.totalSeats,
      availableSeats: internship.availableSeats,
      description: internship.description,
      skillsRequired: internship.skillsRequired,
      certifications: internship.certifications,
      eligibility: internship.eligibility,
      stipend: internship.stipend,
      benefits: internship.benefits,
      postedAt: internship.postedAt,
      isAcceptingApplications: internship.isAcceptingApplications(),
      // Final day flag: if today is the last application date
      isFinalDay: (function(){
        const now=new Date();
        const last=new Date(internship.lastDateToApply);
        const start=new Date(last); start.setHours(0,0,0,0);
        const end=new Date(last); end.setHours(23,59,59,999);
        return now>=start && now<=end;
      })(),
      // Keep legacy field but compute against end-of-day
      daysLeftToApply: (function(){
        const now=new Date();
        const end=new Date(internship.lastDateToApply); end.setHours(23,59,59,999);
        const diff=end-now; return Math.ceil(diff / (1000*60*60*24));
      })()
    }));

    res.json({
      success: true,
      data: {
        internships: formattedInternships,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching internships'
    });
  }
});

// @desc    Get internship posting details by ID
// @route   GET /api/jobseeker/internships/:id
// @access  Private (Jobseeker only)
router.get('/internships/:id', async (req, res) => {
  try {
    const internship = await InternshipPosting.findById(req.params.id)
      .populate('employerId', 'name company.name company.description company.website')
      .select('-applications');

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship posting not found'
      });
    }

    if (internship.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This internship posting is not currently active'
      });
    }

    const formattedInternship = {
      _id: internship._id,
      title: internship.title,
      companyName: internship.companyName || (internship.employerId?.company?.name || internship.employerId?.name || 'Company'),
      companyDescription: internship.employerId?.company?.description,
      companyWebsite: internship.employerId?.company?.website,
      industry: internship.industry,
      location: internship.location,
      mode: internship.mode,
      startDate: internship.startDate,
      lastDateToApply: internship.lastDateToApply,
      duration: internship.duration,
      totalSeats: internship.totalSeats,
      availableSeats: internship.availableSeats,
      description: internship.description,
      skillsRequired: internship.skillsRequired,
      certifications: internship.certifications,
      eligibility: internship.eligibility,
      stipend: internship.stipend,
      benefits: internship.benefits,
      postedAt: internship.postedAt,
      isAcceptingApplications: internship.isAcceptingApplications(),
      daysLeftToApply: Math.ceil((new Date(internship.lastDateToApply) - new Date()) / (1000 * 60 * 60 * 24))
    };

    res.json({
      success: true,
      data: formattedInternship
    });

  } catch (error) {
    console.error('Error fetching internship details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching internship details'
    });
  }
});

// @desc    Apply for an internship (with auto-filtering)
// @route   POST /api/jobseeker/internships/:id/apply
// @access  Private (Jobseeker only)
router.post('/internships/:id/apply', async (req, res) => {
  try {
    const { coverLetter } = req.body;
    
    const internship = await InternshipPosting.findById(req.params.id);
    
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship posting not found'
      });
    }

    if (internship.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This internship posting is not currently active'
      });
    }

    if (!internship.isAcceptingApplications()) {
      return res.status(400).json({
        success: false,
        message: 'Applications are no longer being accepted for this internship'
      });
    }

    // Check if already applied
    const alreadyApplied = internship.applications.some(
      app => app.jobseekerId.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this internship'
      });
    }

    // Get user's resume URL
    const userProfile = await JobseekerProfile.findOne({ userId: req.user._id });
    const resumeUrl = userProfile?.resumeUrl;

    if (!resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume before applying for internships'
      });
    }

    // Build centralized detailed application and compute matching
    const profile = await JobseekerProfile.findOne({ userId: req.user._id });
    const { extractPostingCriteria, extractApplicant, computeMatchScore, decideAction, buildSummary } = require('../utils/matching');

    const criteria = extractPostingCriteria(internship);
    const applicant = extractApplicant(profile || {});
    const { score, matched, unmatched } = computeMatchScore(criteria, applicant);
    const decision = decideAction(score, 55);

    const application = new InternshipApplication({
      internshipId: internship._id,
      jobseekerId: req.user._id,
      employerId: internship.employerId,
      internshipDetails: {
        title: internship.title,
        type: internship.stipend?.type === 'Unpaid' ? 'Unpaid' : 'Paid',
        duration: internship.duration,
        startDate: internship.startDate,
        workMode: internship.mode,
        eligibility: (/freshers/i.test(internship.eligibility) ? 'Freshers Only' : /experience|experienced/i.test(internship.eligibility) ? 'Experienced Only' : 'Both')
      },
      personalDetails: {
        fullName: req.user.name || 'Applicant',
        dateOfBirth: new Date(0),
        gender: 'Other',
        contactNumber: req.user.phone || 'NA',
        emailAddress: req.user.email,
        linkedinProfile: '',
        githubPortfolio: ''
      },
      educationDetails: {
        highestQualification: (profile?.education?.[0]?.degree || 'NA'),
        institutionName: (profile?.education?.[0]?.institution || 'NA'),
        yearOfGraduation: parseInt((profile?.education?.[0]?.year || '0')) || new Date().getFullYear(),
        cgpaPercentage: ''
      },
      workExperience: {},
      skills: {
        technicalSkills: profile?.skills || [],
        softSkills: []
      },
      projects: [],
      additionalInfo: {
        whyJoinInternship: coverLetter || '',
        achievementsCertifications: '',
        resumeUrl: resumeUrl,
        portfolioUrl: ''
      },
      declarations: {
        informationTruthful: true,
        consentToShare: true
      },
      status: decision === 'Proceed to Recruiter' ? 'shortlisted' : 'rejected',
      matchScore: score,
      matching: { matched, unmatched },
      decision,
      summary: buildSummary(req.user.name, score, matched, unmatched)
    });

    await application.save();

    // Fire-and-forget notification email to jobseeker based on auto-decision
    try {
      const companyName = internship.companyName || 'Our Company';
      const internshipTitle = internship.title || 'Internship';
      const toEmail = req.user.email;
      const toName = req.user.name || 'Candidate';
      if (decision === 'Proceed to Recruiter') {
        // Shortlisted template
        await sendShortlistEmail(toEmail, toName, companyName, internshipTitle);
      } else if (decision === 'Auto-Rejected') {
        // Rejected template as requested
        const subject = 'Internship Application Status – Rejected';
        const message = `
          <p>Dear ${toName},</p>
          <p>We regret to inform you that your internship application has been auto-rejected. Thank you for your interest in joining <strong>${companyName}</strong>. We encourage you to apply for future opportunities that match your skills and experience.</p>
          <p>Best regards,<br/>${companyName} Team</p>
        `;
        const { sendNotificationEmail } = require('../utils/emailService');
        await sendNotificationEmail(toEmail, subject, message);
      }
    } catch (emailErr) {
      console.error('Auto-decision email error (apply):', emailErr.message);
    }

    // Maintain backward compatibility array on posting
    internship.applications.push({
      jobseekerId: req.user._id,
      appliedAt: new Date(),
      status: application.status,
      resumeUrl,
      coverLetter: coverLetter || ''
    });
    internship.applicationsCount = internship.applications.length;
    internship.availableSeats = Math.max(0, internship.availableSeats - 1);
    await internship.save();

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application._id,
        matchScore: score,
        decision,
        summary: application.summary,
        appliedAt: application.appliedAt
      }
    });

  } catch (error) {
    console.error('Error applying for internship:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting application'
    });
  }
});

// @desc    Get user's internship applications
// @route   GET /api/jobseeker/applications
// @access  Private (Jobseeker only)
router.get('/applications', async (req, res) => {
  try {
    const applications = await InternshipPosting.find({
      'applications.jobseekerId': req.user._id
    })
    .populate('employerId', 'name company.name')
    .select('title companyName applications.$');

    const formattedApplications = applications.map(internship => {
      const application = internship.applications.find(
        app => app.jobseekerId.toString() === req.user._id.toString()
      );
      
      const normalizedStatus = (application.status === 'reviewed' && application.decision === 'Proceed to Recruiter') ? 'shortlisted' : application.status;

      return {
        _id: application._id,
        internshipId: internship._id,
        title: internship.title,
        companyName: internship.companyName || (internship.employerId?.company?.name || internship.employerId?.name || 'Company'),
        appliedAt: application.appliedAt,
        status: normalizedStatus,
        coverLetter: application.coverLetter,
        resumeUrl: application.resumeUrl,
        internship: {
          location: internship.location,
          mode: internship.mode,
          duration: internship.duration,
          startDate: internship.startDate
        }
      };
    });

    res.json({
      success: true,
      data: formattedApplications
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
});

// @desc    Apply for an internship with detailed form
// @route   POST /api/jobseeker/internships/:id/apply-detailed
// @access  Private (Jobseeker only)
router.post('/internships/:id/apply-detailed', async (req, res) => {
  try {
    const InternshipApplication = require('../models/InternshipApplication');
    const { extractPostingCriteria, extractApplicant, computeMatchScore, decideAction, buildSummary } = require('../utils/matching');
    const applicationData = req.body;
    
    const internship = await InternshipPosting.findById(req.params.id);
    
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship posting not found'
      });
    }

    if (internship.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This internship posting is not currently active'
      });
    }

    if (!internship.isAcceptingApplications()) {
      return res.status(400).json({
        success: false,
        message: 'Applications are no longer being accepted for this internship'
      });
    }

    // Check if already applied
    const existingApplication = await InternshipApplication.findOne({
      internshipId: req.params.id,
      jobseekerId: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this internship'
      });
    }

    // Normalize eligibility to model enum
    const allowedEligibility = ['Freshers Only', 'Experienced Only', 'Both'];
    const normalizedEligibility = allowedEligibility.includes(applicationData?.internshipDetails?.eligibility)
      ? applicationData.internshipDetails.eligibility
      : 'Both';

    // Create detailed application
    const application = new InternshipApplication({
      internshipId: req.params.id,
      jobseekerId: req.user._id,
      employerId: internship.employerId,
      internshipDetails: {
        ...applicationData.internshipDetails,
        eligibility: normalizedEligibility
      },
      personalDetails: applicationData.personalDetails,
      educationDetails: applicationData.educationDetails,
      workExperience: applicationData.workExperience,
      skills: applicationData.skills,
      projects: applicationData.projects,
      additionalInfo: applicationData.additionalInfo,
      declarations: applicationData.declarations
    });

    // Auto-match using applicant profile
    const profile = await JobseekerProfile.findOne({ userId: req.user._id });
    const criteria = extractPostingCriteria(internship);
    const applicant = extractApplicant(profile || {});
    const { score, matched, unmatched } = computeMatchScore(criteria, applicant);
    const decision = decideAction(score, 55);

    application.matchScore = score;
    application.matching = { matched, unmatched };
    application.decision = decision;
    application.status = decision === 'Proceed to Recruiter' ? 'shortlisted' : 'rejected';
    application.summary = buildSummary(req.user.name, score, matched, unmatched);

    await application.save();

    // Fire-and-forget notification email to jobseeker based on auto-decision (detailed)
    try {
      const companyName = internship.companyName || 'Our Company';
      const internshipTitle = internship.title || 'Internship';
      const toEmail = req.user.email;
      const toName = req.user.name || 'Candidate';
      if (decision === 'Proceed to Recruiter') {
        await sendShortlistEmail(toEmail, toName, companyName, internshipTitle);
      } else if (decision === 'Auto-Rejected') {
        await sendRejectionEmail(toEmail, toName, companyName, internshipTitle);
      }
    } catch (emailErr) {
      console.error('Auto-decision email error (apply-detailed):', emailErr.message);
    }

    // Also add to the internship's applications array for backward compatibility
    internship.applications.push({
      jobseekerId: req.user._id,
      appliedAt: new Date(),
      status: application.status,
      resumeUrl: applicationData.additionalInfo.resumeUrl,
      coverLetter: applicationData.additionalInfo.whyJoinInternship
    });

    internship.applicationsCount = internship.applications.length;
    internship.availableSeats = Math.max(0, internship.availableSeats - 1);
    
    await internship.save();

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application._id,
        appliedAt: application.appliedAt
      }
    });

  } catch (error) {
    console.error('Error submitting detailed application:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors || {}).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed while submitting application',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while submitting application'
    });
  }
});

// @desc    Get detailed applications for jobseeker
// @route   GET /api/jobseeker/applications-detailed
// @access  Private (Jobseeker only)
router.get('/applications-detailed', async (req, res) => {
  try {
    const InternshipApplication = require('../models/InternshipApplication');
    
    const applications = await InternshipApplication.getApplicationsForJobseeker(req.user._id);

    res.json({
      success: true,
      data: applications
    });

  } catch (error) {
    console.error('Error fetching detailed applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
});

// @desc    Delete a jobseeker's application (and related artifacts)
// @route   DELETE /api/jobseeker/applications/:applicationId
// @access  Private (Jobseeker only)
router.delete('/applications/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await InternshipApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    if (application.jobseekerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this application' });
    }

    // Remove legacy entry from InternshipPosting.applications array if present
    try {
      await InternshipPosting.updateOne(
        { _id: application.internshipId },
        { $pull: { applications: { jobseekerId: application.jobseekerId } } }
      );
    } catch (_) {}

    // Delete any assigned tests for this application
    try {
      const Test = require('../models/Test');
      await Test.deleteMany({ applicationId: application._id });
    } catch (_) {}

    // Delete the application
    await application.deleteOne();

    return res.json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    console.error('Delete application error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete application' });
  }
});

module.exports = router;