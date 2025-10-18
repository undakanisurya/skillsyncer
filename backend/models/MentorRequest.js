const mongoose = require('mongoose');

const mentorRequestSchema = new mongoose.Schema({
  // Company information
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Employee details to be assigned as mentor
  employeeName: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  employeeEmail: {
    type: String,
    required: [true, 'Employee email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email address'
    ]
  },
  employeePhone: {
    type: String,
    required: [true, 'Employee phone is required'],
    trim: true
  },
  employeePosition: {
    type: String,
    required: [true, 'Employee position is required'],
    trim: true
  },
  employeeDepartment: {
    type: String,
    required: [true, 'Employee department is required'],
    trim: true
  },
  
  // Justification for mentorship
  justification: {
    type: String,
    required: [true, 'Justification for mentorship is required'],
    maxlength: [1000, 'Justification cannot exceed 1000 characters']
  },
  
  // Employee expertise areas
  expertise: [{
    type: String,
    trim: true
  }],
  
  // Years of experience
  yearsOfExperience: {
    type: String,
    enum: ['0-1', '1-3', '3-5', '5-10', '10+'],
    required: true
  },
  
  // Request status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Admin review information
  adminNotes: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  
  // Additional information
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
mentorRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Populate company and requester details when querying
mentorRequestSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'companyId',
    select: 'name email company.name company.industry'
  }).populate({
    path: 'requestedBy',
    select: 'name email'
  }).populate({
    path: 'reviewedBy',
    select: 'name email'
  });
  next();
});

// Index for better query performance
mentorRequestSchema.index({ status: 1 });
mentorRequestSchema.index({ companyId: 1 });
mentorRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MentorRequest', mentorRequestSchema);
