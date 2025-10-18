const mongoose = require('mongoose');

const InternshipApplicationSchema = new mongoose.Schema({
  // Reference to internship and applicant
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InternshipPosting',
    required: [true, 'Internship ID is required']
  },
  
  jobseekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Jobseeker ID is required']
  },
  
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employer ID is required']
  },

  // Company Internship Details (Pre-filled from internship posting)
  internshipDetails: {
    title: String,
    type: {
      type: String,
      enum: ['Paid', 'Unpaid']
    },
    duration: String,
    startDate: Date,
    workMode: {
      type: String,
      enum: ['Onsite', 'online', 'Hybrid']
    },
    eligibility: {
      type: String,
      enum: ['Freshers Only', 'Experienced Only', 'Both']
    }
  },

  // 1. Personal Details
  personalDetails: {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required']
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true
    },
    emailAddress: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true
    },
    linkedinProfile: {
      type: String,
      trim: true
    },
    githubPortfolio: {
      type: String,
      trim: true
    }
  },

  // 2. Education Details
  educationDetails: {
    highestQualification: {
      type: String,
      required: [true, 'Highest qualification is required'],
      trim: true
    },
    institutionName: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true
    },
    yearOfGraduation: {
      type: Number,
      required: [true, 'Year of graduation is required'],
      min: [1950, 'Year must be after 1950'],
      max: [new Date().getFullYear() + 10, 'Year cannot be more than 10 years in the future']
    },
    cgpaPercentage: {
      type: String,
      required: [true, 'CGPA/Percentage is required'],
      trim: true
    }
  },

  // 3. Work Experience (Optional based on eligibility)
  workExperience: {
    totalYearsExperience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0
    },
    currentLastCompany: {
      type: String,
      trim: true
    },
    currentLastDesignation: {
      type: String,
      trim: true
    },
    relevantExperienceDescription: {
      type: String,
      maxlength: [1000, 'Experience description cannot exceed 1000 characters']
    }
  },

  // 4. Skills
  skills: {
    technicalSkills: [{
      type: String,
      trim: true
    }],
    softSkills: [{
      type: String,
      trim: true
    }]
  },

  // 5. Project Details
  projects: [{
    projectName: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      trim: true
    },
    duration: {
      type: String,
      trim: true
    },
    technologiesUsed: [{
      type: String,
      trim: true
    }],
    description: {
      type: String,
      maxlength: [500, 'Project description cannot exceed 500 characters']
    }
  }],

  // 6. Additional Information
  additionalInfo: {
    whyJoinInternship: {
      type: String,
      required: [true, 'Please explain why you want to join this internship'],
      maxlength: [1000, 'Response cannot exceed 1000 characters']
    },
    achievementsCertifications: {
      type: String,
      maxlength: [1000, 'Achievements/Certifications cannot exceed 1000 characters']
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume is required']
    },
    portfolioUrl: {
      type: String,
      trim: true
    }
  },

  // 7. Declarations
  declarations: {
    informationTruthful: {
      type: Boolean,
      required: [true, 'You must declare that the information is truthful']
    },
    consentToShare: {
      type: Boolean,
      required: [true, 'You must consent to share information with the company']
    }
  },

  // Application Status and Tracking
  status: {
    type: String,
    enum: [
      'pending',
      'reviewed',
      'shortlisted',
      'rejected',
      // Extended statuses for tests and onboarding workflow
      'test-assigned',
      'selected',
      'active',
      'completed',
      'withdrawn'
    ],
    default: 'pending'
  },

  // Test workflow fields
  testLink: {
    type: String,
    default: null
  },
  testExpiry: {
    type: Date,
    default: null
  },
  result: {
    type: String,
    enum: ['Passed', 'Failed', null],
    default: null
  },
  reason: {
    type: String,
    default: null
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  answers: {
    type: Array,
    default: []
  },

  // Mentor and internship mode selections
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  internshipMode: {
    type: String,
    enum: ['Online', 'Offline', 'Hybrid', null],
    default: null
  },

  // Automated matching results
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  matching: {
    matched: { type: [String], default: [] },
    unmatched: { type: [String], default: [] }
  },
  decision: {
    type: String,
    enum: ['Proceed to Recruiter', 'Auto-Rejected', null],
    default: null
  },
  summary: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  // Employer feedback and notes
  employerNotes: {
    type: String,
    maxlength: [2000, 'Employer notes cannot exceed 2000 characters']
  },

  reviewedAt: {
    type: Date
  },

  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Timestamps
  appliedAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
InternshipApplicationSchema.index({ internshipId: 1, jobseekerId: 1 }, { unique: true });
InternshipApplicationSchema.index({ employerId: 1, status: 1 });
InternshipApplicationSchema.index({ jobseekerId: 1, appliedAt: -1 });
InternshipApplicationSchema.index({ status: 1, appliedAt: -1 });

// Pre-save middleware to update timestamps
InternshipApplicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to update application status
InternshipApplicationSchema.methods.updateStatus = function(newStatus, employerId, notes = '') {
  this.status = newStatus;
  this.employerNotes = notes;
  this.reviewedAt = new Date();
  this.reviewedBy = employerId;
  return this.save();
};

// Static method to get applications for an employer
InternshipApplicationSchema.statics.getApplicationsForEmployer = function(employerId, filters = {}) {
  const query = { employerId };
  
  if (filters.status) query.status = filters.status;
  if (filters.internshipId) query.internshipId = filters.internshipId;
  
  return this.find(query)
    .populate('jobseekerId', 'name email profile.profilePicture')
    .populate('internshipId', 'title companyName startDate duration')
    .sort({ appliedAt: -1 });
};

// Static method to get applications for a jobseeker
InternshipApplicationSchema.statics.getApplicationsForJobseeker = function(jobseekerId) {
  return this.find({ jobseekerId })
    .populate('internshipId', 'title companyName startDate duration status location mode')
    .populate('employerId', 'name company.name')
    .sort({ appliedAt: -1 });
};

module.exports = mongoose.model('InternshipApplication', InternshipApplicationSchema);