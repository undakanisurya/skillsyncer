const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InternshipApplication',
    required: true
  },
  jobseekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InternshipPosting',
    required: true
  },
  token: {
    type: String,
    unique: true,
    index: true,
    required: true
  },
  testLink: {
    type: String,
    required: true
  },
  testExpiry: {
    type: Date,
    required: true
  },
  questions: {
    type: Array,
    default: []
  },
  answers: {
    type: Array,
    default: []
  },
  correctness: {
    type: [Boolean],
    default: []
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  result: {
    type: String,
    enum: ['Passed', 'Failed', null],
    default: null
  },
  submittedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'test_assigned'
});

module.exports = mongoose.model('Test', TestSchema);


