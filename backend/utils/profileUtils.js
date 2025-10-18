const JobseekerProfile = require('../models/JobseekerProfile');
const User = require('../models/User');

/**
 * Calculate profile completion percentage
 * @param {Object} profile - JobseekerProfile document
 * @param {Object} user - User document
 * @returns {Number} - Completion percentage (0-100)
 */
const calculateProfileCompletion = (profile, user) => {
  let completedSections = 0;
  const totalSections = 15; // Total number of sections we check

  // Basic user info checks
  if (user?.name && user.name.trim()) completedSections++;
  if (user?.email && user.email.trim()) completedSections++;
  if (user?.profile?.phone && user.profile.phone.trim()) completedSections++;
  if (user?.profile?.location && user.profile.location.trim()) completedSections++;

  if (profile) {
    // Personal info checks
    if (profile.personalInfo?.bio && profile.personalInfo.bio.trim()) completedSections++;
    if (profile.personalInfo?.profilePicture) completedSections++;
    if (profile.personalInfo?.languages && profile.personalInfo.languages.length > 0) completedSections++;

    // Skills checks
    if (profile.skills?.technical && profile.skills.technical.length > 0) completedSections++;

    // Experience checks
    if (profile.workExperience && profile.workExperience.length > 0) completedSections++;

    // Education checks
    if (profile.education && profile.education.length > 0) completedSections++;

    // Job preferences checks
    if (profile.jobPreferences?.jobTitles && profile.jobPreferences.jobTitles.length > 0) completedSections++;
    if (profile.jobPreferences?.expectedSalary && profile.jobPreferences.expectedSalary.min) completedSections++;

    // Additional info checks
    if (profile.certifications && profile.certifications.length > 0) completedSections++;
    if (profile.projects && profile.projects.length > 0) completedSections++;
    if (profile.documents?.resume && profile.documents.resume.fileUrl) completedSections++;
  }

  return Math.round((completedSections / totalSections) * 100);
};

/**
 * Get profile summary for dashboard
 * @param {String} userId - User ID
 * @returns {Object} - Profile summary data
 */
const getProfileSummary = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    const extendedProfile = await JobseekerProfile.findOne({ userId });
    
    if (!user) {
      throw new Error('User not found');
    }

    const profileCompletion = calculateProfileCompletion(extendedProfile, user);
    
    // Generate quick action suggestions
    const quickActions = [];
    
    if (!user.profile?.bio && (!extendedProfile || !extendedProfile.personalInfo?.bio)) {
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
    
    if (!user.profile?.skills || user.profile.skills.length === 0) {
      if (!extendedProfile || extendedProfile.skills.technical.length === 0) {
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
    }
    
    if (!extendedProfile?.education || extendedProfile.education.length === 0) {
      quickActions.push({
        id: 'add-education',
        title: 'Add Education',
        description: 'Include your educational background',
        icon: 'graduation-cap',
        priority: 'medium',
        action: 'complete-profile',
        field: 'education'
      });
    }
    
    if (!extendedProfile?.workExperience || extendedProfile.workExperience.length === 0) {
      quickActions.push({
        id: 'add-experience',
        title: 'Add Work Experience',
        description: 'Showcase your professional experience',
        icon: 'briefcase',
        priority: 'high',
        action: 'complete-profile',
        field: 'experience'
      });
    }
    
    if (!user.profile?.location) {
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

    return {
      profile: {
        completionPercentage: profileCompletion,
        name: user.name,
        email: user.email,
        bio: extendedProfile?.personalInfo?.bio || user.profile?.bio || '',
        skills: extendedProfile?.skills?.technical?.map(skill => skill.name) || user.profile?.skills || [],
        experience: user.profile?.experience || '',
        location: user.profile?.location || '',
        phone: user.profile?.phone || '',
        resume: extendedProfile?.documents?.resume?.fileUrl || user.profile?.resume || '',
        portfolio: user.profile?.portfolio || '',
        profilePicture: extendedProfile?.personalInfo?.profilePicture || user.profile?.avatar || '',
        hasExtendedProfile: !!extendedProfile,
        lastUpdated: extendedProfile?.metadata?.lastProfileUpdate || user.updatedAt
      },
      quickActions: quickActions.slice(0, 4),
      stats: {
        profileViews: extendedProfile?.metadata?.profileViews || 0,
        applicationsSubmitted: 0, // TODO: Implement when job application system is ready
        interviewsScheduled: 0, // TODO: Implement when interview system is ready
        jobsSaved: 0, // TODO: Implement when job saving system is ready
        profileCompletion: profileCompletion,
        totalSkills: extendedProfile?.skills?.technical?.length || user.profile?.skills?.length || 0,
        totalProjects: extendedProfile?.projects?.length || 0,
        totalCertifications: extendedProfile?.certifications?.length || 0,
        totalExperience: extendedProfile?.workExperience?.length || 0
      },
      metadata: {
        memberSince: user.createdAt,
        lastLogin: user.lastLogin,
        isVerified: extendedProfile?.metadata?.isVerified || false,
        isPublic: extendedProfile?.profileSettings?.isPublic || false
      }
    };
  } catch (error) {
    throw new Error(`Failed to get profile summary: ${error.message}`);
  }
};

/**
 * Merge basic profile with extended profile data
 * @param {Object} user - User document
 * @param {Object} extendedProfile - JobseekerProfile document
 * @returns {Object} - Merged profile data
 */
const mergeProfileData = (user, extendedProfile) => {
  return {
    basicInfo: {
      name: user.name,
      email: user.email,
      phone: user.profile?.phone || '',
      location: user.profile?.location || '',
      bio: extendedProfile?.personalInfo?.bio || user.profile?.bio || '',
      profilePicture: extendedProfile?.personalInfo?.profilePicture || user.profile?.avatar || '',
      memberSince: user.createdAt,
      lastLogin: user.lastLogin,
      age: extendedProfile?.age || null,
      nationality: extendedProfile?.personalInfo?.nationality || '',
      languages: extendedProfile?.personalInfo?.languages || []
    },
    
    professionalInfo: {
      skills: {
        technical: extendedProfile?.skills?.technical || [],
        soft: extendedProfile?.skills?.soft || [],
        tools: extendedProfile?.skills?.tools || [],
        frameworks: extendedProfile?.skills?.frameworks || []
      },
      experience: user.profile?.experience || '',
      education: extendedProfile?.education || [],
      workExperience: extendedProfile?.workExperience || [],
      projects: extendedProfile?.projects || [],
      certifications: extendedProfile?.certifications || [],
      achievements: extendedProfile?.additionalInfo?.achievements || []
    },

    jobPreferences: extendedProfile?.jobPreferences || {},
    
    contactInfo: {
      email: user.email,
      phone: user.profile?.phone || '',
      alternateEmail: extendedProfile?.contactInfo?.alternateEmail || '',
      whatsappNumber: extendedProfile?.contactInfo?.whatsappNumber || '',
      address: extendedProfile?.contactInfo?.address || {}
    },

    socialLinks: {
      linkedin: extendedProfile?.contactInfo?.linkedinUrl || extendedProfile?.socialLinks?.linkedin || '',
      github: extendedProfile?.contactInfo?.githubUrl || extendedProfile?.socialLinks?.github || '',
      portfolio: user.profile?.portfolio || extendedProfile?.contactInfo?.portfolioUrl || '',
      website: extendedProfile?.contactInfo?.personalWebsite || extendedProfile?.socialLinks?.personal || '',
      twitter: extendedProfile?.socialLinks?.twitter || '',
      instagram: extendedProfile?.socialLinks?.instagram || '',
      facebook: extendedProfile?.socialLinks?.facebook || '',
      behance: extendedProfile?.socialLinks?.behance || '',
      dribbble: extendedProfile?.socialLinks?.dribbble || '',
      medium: extendedProfile?.socialLinks?.medium || '',
      stackoverflow: extendedProfile?.socialLinks?.stackoverflow || ''
    },

    documents: extendedProfile?.documents || {},
    
    additionalInfo: {
      volunteerWork: extendedProfile?.additionalInfo?.volunteerWork || [],
      hobbies: extendedProfile?.additionalInfo?.hobbies || [],
      references: extendedProfile?.additionalInfo?.references || []
    },

    metadata: {
      profileCompletion: calculateProfileCompletion(extendedProfile, user),
      lastUpdated: extendedProfile?.metadata?.lastProfileUpdate || user.updatedAt,
      profileViews: extendedProfile?.metadata?.profileViews || 0,
      isVerified: extendedProfile?.metadata?.isVerified || false,
      isPublic: extendedProfile?.profileSettings?.isPublic || false,
      profileSearchable: extendedProfile?.profileSettings?.profileSearchable || false
    }
  };
};

/**
 * Validate profile data before saving
 * @param {Object} profileData - Profile data to validate
 * @returns {Object} - Validation result { isValid: boolean, errors: array }
 */
const validateProfileData = (profileData) => {
  const errors = [];

  // Validate email format in contact info
  if (profileData.contactInfo?.alternateEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.contactInfo.alternateEmail)) {
      errors.push('Invalid alternate email format');
    }
  }

  // Validate dates in experience
  if (profileData.workExperience && Array.isArray(profileData.workExperience)) {
    profileData.workExperience.forEach((exp, index) => {
      if (exp.startDate && exp.endDate && !exp.currentlyWorking) {
        const startDate = new Date(exp.startDate);
        const endDate = new Date(exp.endDate);
        if (startDate > endDate) {
          errors.push(`Work experience ${index + 1}: End date cannot be before start date`);
        }
      }
    });
  }

  // Validate dates in education
  if (profileData.education && Array.isArray(profileData.education)) {
    profileData.education.forEach((edu, index) => {
      if (edu.startDate && edu.endDate && !edu.currentlyStudying) {
        const startDate = new Date(edu.startDate);
        const endDate = new Date(edu.endDate);
        if (startDate > endDate) {
          errors.push(`Education ${index + 1}: End date cannot be before start date`);
        }
      }
    });
  }

  // Validate salary range
  if (profileData.jobPreferences?.expectedSalary) {
    const { min, max } = profileData.jobPreferences.expectedSalary;
    if (min && max && min > max) {
      errors.push('Minimum salary cannot be greater than maximum salary');
    }
  }

  // Validate URLs
  const urlFields = [
    'contactInfo.linkedinUrl',
    'contactInfo.githubUrl',
    'contactInfo.portfolioUrl',
    'contactInfo.personalWebsite'
  ];

  urlFields.forEach(field => {
    const value = getNestedValue(profileData, field);
    if (value && !isValidUrl(value)) {
      errors.push(`Invalid URL format for ${field.split('.').pop()}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Helper function to get nested object value
 * @param {Object} obj - Object to search in
 * @param {String} path - Dot-separated path
 * @returns {*} - Value at path or undefined
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current && current[key], obj);
};

/**
 * Helper function to validate URL format
 * @param {String} url - URL to validate
 * @returns {Boolean} - Whether URL is valid
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Format profile data for API response
 * @param {Object} profile - Profile data
 * @param {Boolean} isPublic - Whether this is for public view
 * @returns {Object} - Formatted profile data
 */
const formatProfileForResponse = (profile, isPublic = false) => {
  const formatted = { ...profile };

  // Remove sensitive data for public view
  if (isPublic) {
    delete formatted.contactInfo.alternateEmail;
    delete formatted.contactInfo.whatsappNumber;
    delete formatted.contactInfo.address;
    delete formatted.documents;
    delete formatted.additionalInfo.references;
  }

  // Format dates
  if (formatted.professionalInfo?.workExperience) {
    formatted.professionalInfo.workExperience = formatted.professionalInfo.workExperience.map(exp => ({
      ...exp,
      startDate: exp.startDate ? new Date(exp.startDate).toISOString() : null,
      endDate: exp.endDate ? new Date(exp.endDate).toISOString() : null
    }));
  }

  if (formatted.professionalInfo?.education) {
    formatted.professionalInfo.education = formatted.professionalInfo.education.map(edu => ({
      ...edu,
      startDate: edu.startDate ? new Date(edu.startDate).toISOString() : null,
      endDate: edu.endDate ? new Date(edu.endDate).toISOString() : null
    }));
  }

  if (formatted.professionalInfo?.projects) {
    formatted.professionalInfo.projects = formatted.professionalInfo.projects.map(project => ({
      ...project,
      startDate: project.startDate ? new Date(project.startDate).toISOString() : null,
      endDate: project.endDate ? new Date(project.endDate).toISOString() : null
    }));
  }

  return formatted;
};

module.exports = {
  calculateProfileCompletion,
  getProfileSummary,
  mergeProfileData,
  validateProfileData,
  formatProfileForResponse
};