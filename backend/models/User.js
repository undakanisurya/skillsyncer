const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: function() {
      // Password is not required for Google sign-in users
      return !this.googleId;
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  googleId: {
    type: String,
    sparse: true, // Allow multiple null values but unique non-null values
    index: true
  },
  role: {
    type: String,
    enum: ['jobseeker', 'employer', 'company', 'mentor', 'admin', 'employee'],
    default: 'jobseeker',
    required: true
  },
  // Secondary roles for users with multiple capabilities
  secondaryRoles: [{
    type: String,
    enum: ['jobseeker', 'employer', 'company', 'mentor', 'admin', 'employee']
  }],
  // Jobseeker specific fields
  profile: {
    avatar: {
      type: String, // URL to profile picture
      trim: true
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    skills: [{
      type: String,
      trim: true
    }],
    experience: {
      type: String,
      enum: ['fresher', '0-1', '1-3', '3-5', '5-10', '10+'],
      default: 'fresher'
    },
    location: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    resume: {
      type: String, // URL to resume file
    },
    portfolio: {
      type: String, // URL to portfolio
    },
    // Extended profile fields for detailed jobseeker profile
    education: [{
      id: { type: Number },
      degree: { type: String },
      institution: { type: String },
      year: { type: String },
      field: { type: String }
    }],
    workExperience: [{
      id: { type: Number },
      title: { type: String },
      company: { type: String },
      startDate: { type: String },
      endDate: { type: String },
      current: { type: Boolean },
      description: { type: String }
    }],
    certifications: [{
      id: { type: Number },
      name: { type: String },
      issuer: { type: String },
      date: { type: String },
      expiryDate: { type: String },
      credentialId: { type: String }
    }],
    jobTitles: [{
      type: String,
      trim: true
    }],
    jobTypes: [{
      type: String,
      trim: true
    }],
    workSchedule: [{
      type: String,
      trim: true
    }],
    minimumBasePay: {
      type: String,
      trim: true
    },
    relocationPreferences: [{
      type: String,
      trim: true
    }],
    remotePreferences: {
      type: String,
      trim: true
    },
    readyToWork: {
      type: Boolean,
      default: false
    },
    // Social links
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      twitter: { type: String },
      website: { type: String }
    },
    // Job preferences
    jobPreferences: {
      jobType: { type: String },
      workMode: { type: String },
      availableFrom: { type: Date },
      expectedSalary: {
        min: { type: Number },
        max: { type: Number },
        currency: { type: String }
      }
    },
    profilePicture: { type: String },
    isProfilePublic: {
      type: Boolean,
      default: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    // Grade and mentor assignment fields
    grade: {
      type: String,
      enum: ['A', 'B'],
      default: null
    },
    assignedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    mentorAssignmentDate: {
      type: Date,
      default: null
    }
  },
  // Employer specific fields
  company: {
    name: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      maxlength: [500, 'Company description cannot exceed 500 characters']
    },
    industry: {
      type: String,
      enum: ['technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'consulting', 'media', 'real-estate', 'automotive', 'food', 'nonprofit', 'government'],
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+']
    }
  },
  // Mentor specific fields
  mentorProfile: {
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    expertise: [{
      type: String,
      trim: true
    }],
    yearsOfExperience: {
      type: String,
      enum: ['0-1', '1-3', '3-5', '5-10', '10+'],
      default: '0-1'
    },
    location: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    grade: {
      type: String,
      enum: ['A', 'B'],
      default: 'B'
    },
    currentMentees: {
      type: Number,
      default: 0,
      min: 0
    },
    maxMentees: {
      type: Number,
      default: 5,
      min: 1
    }
  },
  // Employee specific fields
  employeeProfile: {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinDate: {
      type: Date,
      default: Date.now
    },
    department: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      trim: true
    },
    employeeId: {
      type: String,
      trim: true
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Password reset fields
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Skip password hashing for Google sign-in users or if password is not modified
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user has a specific role (primary or secondary)
userSchema.methods.hasRole = function(role) {
  return this.role === role || (this.secondaryRoles && this.secondaryRoles.includes(role));
};

// Get all roles for a user (primary + secondary)
userSchema.methods.getAllRoles = function() {
  const roles = [this.role];
  if (this.secondaryRoles && this.secondaryRoles.length > 0) {
    roles.push(...this.secondaryRoles);
  }
  return [...new Set(roles)]; // Remove duplicates
};

  // Calculate profile completion
userSchema.methods.calculateProfileCompletion = async function() {
  let completion = 0;
  let totalFields = 0;
  
  // Basic fields (common for all)
  if (this.name) completion++;
  if (this.email) completion++;
  
  if (this.role === 'jobseeker') {
    totalFields = 12; // Total fields to check
    
    // Check basic profile fields in User model
    if (this.profile.bio) completion++;
    if (this.profile.location) completion++;
    if (this.profile.phone) completion++;
    
    // Check for JobseekerProfile data
    const JobseekerProfile = mongoose.model('JobseekerProfile');
    const extendedProfile = await JobseekerProfile.findOne({ userId: this._id });
    
    if (extendedProfile) {
      // Check extended profile fields
      if (extendedProfile.skills && extendedProfile.skills.length > 0) completion++;
      if (extendedProfile.education && extendedProfile.education.length > 0) completion++;
      if (extendedProfile.resumeUrl) completion++;
      if (extendedProfile.internshipTitle) completion++;
      if (extendedProfile.internshipType) completion++;
      if (extendedProfile.preferredLocation) completion++;
      if (extendedProfile.readyToWorkAfterInternship !== undefined) completion++;
    } else {
      // Fallback to User model fields if no extended profile
      if (this.profile.skills && this.profile.skills.length > 0) completion++;
      if (this.profile.education && this.profile.education.length > 0) completion++;
      if (this.profile.resume) completion++;
      if (this.profile.workExperience && this.profile.workExperience.length > 0) completion++;
      if (this.profile.jobTitles && this.profile.jobTitles.length > 0) completion++;
    }
    
  } else if (this.role === 'employer' || this.role === 'company') {
    totalFields = 6;
    if (this.company.name) completion++;
    if (this.company.description) completion++;
    if (this.company.location) completion++;
    if (this.company.website) completion++;
  } else if (this.role === 'mentor') {
    totalFields = 7;
    if (this.mentorProfile.bio) completion++;
    if (this.mentorProfile.expertise && this.mentorProfile.expertise.length > 0) completion++;
    if (this.mentorProfile.yearsOfExperience) completion++;
    if (this.mentorProfile.location) completion++;
    if (this.mentorProfile.phone) completion++;
    if (this.mentorProfile.linkedin) completion++;
  }
  
  this.profileCompletion = totalFields > 0 ? Math.round((completion / totalFields) * 100) : 0;
  return this.profileCompletion;
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Index for better query performance
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);