const JobseekerProfile = require('../models/JobseekerProfile');

/**
 * ATS Scoring Service for Resume Analysis
 * This service analyzes jobseeker profiles and calculates ATS compatibility scores
 */

// Common keywords for different fields
const TECHNICAL_SKILLS = [
  'javascript', 'python', 'java', 'react', 'node.js', 'mongodb', 'sql', 'html', 'css',
  'typescript', 'angular', 'vue.js', 'express.js', 'django', 'flask', 'spring', 'aws',
  'docker', 'kubernetes', 'git', 'agile', 'scrum', 'machine learning', 'ai', 'data science',
  'tableau', 'power bi', 'excel', 'word', 'powerpoint', 'photoshop', 'illustrator',
  'figma', 'sketch', 'adobe xd', 'wordpress', 'shopify', 'salesforce', 'hubspot'
];

const SOFT_SKILLS = [
  'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
  'time management', 'organization', 'adaptability', 'creativity', 'collaboration',
  'presentation', 'negotiation', 'customer service', 'project management', 'analytical',
  'detail oriented', 'multitasking', 'fast learner', 'self motivated', 'initiative'
];

const EDUCATION_KEYWORDS = [
  'bachelor', 'master', 'phd', 'degree', 'university', 'college', 'certification',
  'diploma', 'associate', 'btech', 'mtech', 'mba', 'bca', 'mca', 'engineering',
  'computer science', 'information technology', 'data science', 'business',
  'marketing', 'finance', 'human resources', 'design', 'arts'
];

/**
 * Calculate ATS score based on profile data
 * @param {Object} profile - JobseekerProfile document
 * @returns {number} ATS score (0-100)
 */
const calculateATSScore = async (profile) => {
  try {
    let score = 0;
    const maxScore = 100;

    // Merge explicit profile skills with NLP-extracted skills for better coverage
    const nlpSkills = (profile?.nlp?.extracted?.skills || []).map((s) => String(s));
    const combinedSkills = Array.from(new Set([...(profile.skills || []), ...nlpSkills]));

    // Prefer NLP education if available
    const nlpEducation = Array.isArray(profile?.nlp?.extracted?.education) ? profile.nlp.extracted.education : [];
    const educationForScoring = (profile.education && profile.education.length) ? profile.education : nlpEducation;

    // 1. Skills Analysis (30 points)
    const skillsScore = analyzeSkills(combinedSkills);
    score += skillsScore;

    // 2. Education Analysis (25 points)
    const educationScore = analyzeEducation(educationForScoring || []);
    score += educationScore;

    // 3. Resume Presence (25 points)
    const resumeScore = analyzeResume(profile.resumeUrl);
    score += resumeScore;

    // 4. Internship Details (20 points)
    const internshipScore = analyzeInternshipDetails(profile);
    score += internshipScore;

    return Math.min(maxScore, Math.round(score));
  } catch (error) {
    console.error('Error calculating ATS score:', error);
    return 0;
  }
};

/**
 * Analyze skills for ATS scoring
 * @param {Array} skills - Array of skills
 * @returns {number} Skills score (0-30)
 */
const analyzeSkills = (skills) => {
  if (!skills || skills.length === 0) return 0;

  let score = 0;
  const maxScore = 30;

  // Count technical and soft skills
  let technicalCount = 0;
  let softCount = 0;

  skills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (TECHNICAL_SKILLS.includes(skillLower)) {
      technicalCount++;
    }
    if (SOFT_SKILLS.includes(skillLower)) {
      softCount++;
    }
  });

  // Score based on skill variety and relevance
  const totalSkills = skills.length;
  const technicalRatio = technicalCount / totalSkills;
  const softRatio = softCount / totalSkills;

  // Base score for having skills
  score += Math.min(15, totalSkills * 2);

  // Bonus for technical skills
  score += Math.min(10, technicalCount * 2);

  // Bonus for soft skills
  score += Math.min(5, softCount * 1);

  return Math.min(maxScore, score);
};

/**
 * Analyze education for ATS scoring
 * @param {Array} education - Array of education objects
 * @returns {number} Education score (0-25)
 */
const analyzeEducation = (education) => {
  if (!education || education.length === 0) return 0;

  let score = 0;
  const maxScore = 25;

  education.forEach(edu => {
    const degreeLower = (edu.degree || '').toLowerCase();
    const institutionLower = (edu.institution || '').toLowerCase();

    // Base score for education entry
    score += 5;

    // Bonus for relevant keywords in degree
    EDUCATION_KEYWORDS.forEach(keyword => {
      if (degreeLower.includes(keyword)) {
        score += 2;
      }
    });

    // Bonus for institution quality (basic check)
    if (institutionLower.includes('university') || institutionLower.includes('college')) {
      score += 1;
    }
  });

  return Math.min(maxScore, score);
};

/**
 * Analyze resume presence and quality
 * @param {string} resumeUrl - Resume URL
 * @returns {number} Resume score (0-25)
 */
const analyzeResume = (resumeUrl) => {
  if (!resumeUrl) return 0;

  let score = 0;
  const maxScore = 25;

  // Base score for having a resume
  score += 20;

  // Bonus for secure URL (https)
  if (resumeUrl.startsWith('https://')) {
    score += 5;
  }

  return Math.min(maxScore, score);
};

/**
 * Analyze internship details for ATS scoring
 * @param {Object} profile - Profile object
 * @returns {number} Internship score (0-20)
 */
const analyzeInternshipDetails = (profile) => {
  let score = 0;
  const maxScore = 20;

  // Internship title (10 points)
  if (profile.internshipTitle && profile.internshipTitle.trim()) {
    score += 10;
  }

  // Internship type (5 points)
  if (profile.internshipType) {
    score += 5;
  }

  // Preferred location (5 points)
  if (profile.preferredLocation && profile.preferredLocation.trim()) {
    score += 5;
  }

  return Math.min(maxScore, score);
};

/**
 * Generate ATS improvement suggestions
 * @param {Object} profile - JobseekerProfile document
 * @returns {Array} Array of improvement suggestions
 */
const generateATSSuggestions = (profile) => {
  const suggestions = [];

  // Skills suggestions
  if (!profile.skills || profile.skills.length < 5) {
    suggestions.push({
      category: 'skills',
      priority: 'high',
      message: 'Add more technical skills to improve your ATS score',
      action: 'add-skills'
    });
  }

  // Education suggestions
  if (!profile.education || profile.education.length === 0) {
    suggestions.push({
      category: 'education',
      priority: 'high',
      message: 'Add your educational background',
      action: 'add-education'
    });
  }

  // Resume suggestions
  if (!profile.resumeUrl) {
    suggestions.push({
      category: 'resume',
      priority: 'high',
      message: 'Upload your resume to significantly improve your ATS score',
      action: 'upload-resume'
    });
  }

  // Internship details suggestions
  if (!profile.internshipTitle) {
    suggestions.push({
      category: 'internship',
      priority: 'medium',
      message: 'Specify your desired internship title',
      action: 'add-internship-title'
    });
  }

  if (!profile.preferredLocation) {
    suggestions.push({
      category: 'location',
      priority: 'medium',
      message: 'Add your preferred work location',
      action: 'add-location'
    });
  }

  return suggestions;
};

/**
 * Update ATS score for a specific profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Update result
 */
const updateProfileATSScore = async (userId) => {
  try {
    const profile = await JobseekerProfile.findOne({ userId });
    if (!profile) {
      return {
        success: false,
        error: 'Profile not found'
      };
    }

    const newScore = await calculateATSScore(profile);
    profile.atsScore = newScore;
    await profile.save();

    const suggestions = generateATSSuggestions(profile);

    return {
      success: true,
      atsScore: newScore,
      suggestions,
      profile
    };
  } catch (error) {
    console.error('Error updating ATS score:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  calculateATSScore,
  analyzeSkills,
  analyzeEducation,
  analyzeResume,
  analyzeInternshipDetails,
  generateATSSuggestions,
  updateProfileATSScore
};
