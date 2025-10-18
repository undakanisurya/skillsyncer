const mongoose = require('mongoose');

const InternshipPostingSchema = new mongoose.Schema({
  // Basic posting information
  title: {
    type: String,
    required: [true, 'Internship title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  // Industry categorization
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    enum: ['IT/Technology', 'Banking'],
    default: 'IT/Technology'
  },
  
  // Company information (read-only from employer registration)
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employer ID is required']
  },
  
  // Location and mode
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  
  mode: {
    type: String,
    required: [true, 'Mode is required'],
    enum: ['Online', 'Offline','Hybrid'],
    default: 'Offline'
  },
  
  // Duration and dates
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  
  lastDateToApply: {
    type: Date,
    required: [true, 'Last date to apply is required']
  },
  
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    enum: ['15 days', '1 month', '3 months', '6 months', '1 year', 'Full day', 'Half day'],
    default: '3 months'
  },
  
  // Capacity
  totalSeats: {
    type: Number,
    required: [true, 'Total available seats is required'],
    min: [1, 'At least 1 seat must be available'],
    max: [60, 'Cannot exceed 60 seats']
  },
  
  availableSeats: {
    type: Number,
    required: [true, 'Available seats is required'],
    min: [0, 'Available seats cannot be negative']
  },
  
  // Description and requirements
  description: {
    type: String,
    required: [true, 'Internship description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  skillsRequired: [{
    type: String,
    trim: true,
    required: [true, 'At least one skill is required']
  }],
  
  certifications: [{
    type: String,
    trim: true
  }],
  
  eligibility: {
    type: String,
    required: [true, 'Eligibility criteria is required'],
    maxlength: [1000, 'Eligibility cannot exceed 1000 characters']
  },
  
  // Additional details
  stipend: {
    amount: {
      type: Number,
      min: [0, 'Stipend amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    type: {
      type: String,
      enum: ['Fixed', 'Performance-based', 'Negotiable', 'Unpaid'],
      default: 'Fixed'
    }
  },
  
  benefits: [{
    type: String,
    trim: true
  }],
  
  // Status and visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed', 'draft'],
    default: 'active'
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Application tracking
  applications: [{
    jobseekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
      default: 'pending'
    },
    resumeUrl: String,
    coverLetter: String
  }],
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  
  applicationsCount: {
    type: Number,
    default: 0
  },
  
  // SEO and search
  tags: [{
    type: String,
    trim: true
  }],
  
  // Timestamps
  postedAt: {
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
InternshipPostingSchema.index({ industry: 1, status: 1 });
InternshipPostingSchema.index({ employerId: 1, status: 1 });
InternshipPostingSchema.index({ location: 1, status: 1 });
InternshipPostingSchema.index({ skillsRequired: 1 });
InternshipPostingSchema.index({ postedAt: -1 });
InternshipPostingSchema.index({ lastDateToApply: 1 });

// Pre-save middleware to update available seats
InternshipPostingSchema.pre('save', function(next) {
  if (this.isNew) {
    this.availableSeats = this.totalSeats;
  }
  this.updatedAt = new Date();
  next();
});

// Method to check if posting is still accepting applications
InternshipPostingSchema.methods.isAcceptingApplications = function() {
  if (this.status !== 'active' || this.availableSeats <= 0) return false;
  const now = new Date();
  const last = new Date(this.lastDateToApply);
  // Allow applications until 23:59:59.999 of the lastDateToApply
  const endOfLastDate = new Date(last);
  endOfLastDate.setHours(23, 59, 59, 999);
  return now <= endOfLastDate;
};

// Method to apply for internship
InternshipPostingSchema.methods.applyForInternship = function(jobseekerId, resumeUrl, coverLetter) {
  if (!this.isAcceptingApplications()) {
    throw new Error('This internship is not accepting applications');
  }
  
  // Check if already applied
  const existingApplication = this.applications.find(
    app => app.jobseekerId.toString() === jobseekerId.toString()
  );
  
  if (existingApplication) {
    throw new Error('You have already applied for this internship');
  }
  
  // Add application
  this.applications.push({
    jobseekerId,
    resumeUrl,
    coverLetter
  });
  
  this.applicationsCount = this.applications.length;
  this.availableSeats = Math.max(0, this.availableSeats - 1);
  
  return this.save();
};

// Static method to get available internships
InternshipPostingSchema.statics.getAvailableInternships = function(filters = {}) {
  const query = {
    status: 'active',
    availableSeats: { $gt: 0 },
    // Include postings whose lastDateToApply is today or in the future
    lastDateToApply: { $gte: (function(){ const d=new Date(); d.setHours(0,0,0,0); return d; })() }
  };
  
  // Apply additional filters
  if (filters.industry) query.industry = filters.industry;
  if (filters.location) query.location = { $regex: filters.location, $options: 'i' };
  if (filters.skills) query.skillsRequired = { $in: filters.skills };
  if (filters.mode) query.mode = filters.mode;
  
  return this.find(query)
    .populate('employerId', 'name company.name company.description')
    .sort({ postedAt: -1 });
};

module.exports = mongoose.model('InternshipPosting', InternshipPostingSchema);
