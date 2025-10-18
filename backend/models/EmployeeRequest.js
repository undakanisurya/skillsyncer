const mongoose = require('mongoose');

const employeeRequestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyIdCard: {
    type: String, // URL to the uploaded image
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
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
employeeRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Populate company details when querying
employeeRequestSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'companyId',
    select: 'name email'
  });
  next();
});

module.exports = mongoose.model('EmployeeRequest', employeeRequestSchema);