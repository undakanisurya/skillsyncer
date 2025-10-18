const mongoose = require('mongoose');

// Embedded education item schema
const EducationSchema = new mongoose.Schema(
  {
    degree: { type: String, trim: true },
    specialization: { type: String, trim: true },
    institution: { type: String, trim: true },
    year: { type: String, trim: true }
  },
  { _id: false }
);

// Embedded internship item schema (for parsed data)
const InternshipSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    company: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    description: { type: String, trim: true }
  },
  { _id: false }
);

// Main Jobseeker Profile schema
const JobseekerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    // Profile sections
    education: { type: [EducationSchema], default: [] },
    skills: { type: [String], default: [] },

    // Resume
    resumeUrl: { type: String, trim: true },

    // Internship preferences
    internshipTitle: { type: String, trim: true },
    internshipType: {
      type: String,
      enum: ['15 days', '1 month', '3 months', '6 months', '1 year', 'Full day', 'Half day'],
      default: '3 months'
    },
    preferredLocation: { type: String, trim: true },
    readyToWorkAfterInternship: { type: Boolean, default: false },

    // Scoring & completion
    atsScore: { type: Number, default: 0, min: 0, max: 100 },
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },

    // NLP-enhanced parsed data and scoring (non-breaking additions)
    nlp: {
      parsedText: { type: String, default: '' },
      extracted: {
        skills: { type: [String], default: [] },
        education: { type: [EducationSchema], default: [] },
        internships: { type: [InternshipSchema], default: [] },
        experienceSummary: { type: String, default: '' }
      },
      embeddings: {
        resume: { type: [Number], default: undefined },
        skills: [
          new mongoose.Schema(
            {
              skill: { type: String, required: true },
              vector: { type: [Number], default: undefined }
            },
            { _id: false }
          )
        ]
      },
      atsNLP: {
        score: { type: Number, default: 0, min: 0, max: 100 },
        details: {
          skillMatch: { type: Number, default: 0 },
          educationMatch: { type: Number, default: 0 },
          experienceMatch: { type: Number, default: 0 },
          jobSimilarity: { type: Number, default: 0 },
          keywordCoverage: { type: Number, default: 0 },
          formattingCompliance: { type: Number, default: 0 },
          actionVerbs: { type: Number, default: 0 },
          quantifiableResults: { type: Number, default: 0 },
          structureCompliance: { type: Number, default: 0 }
        },
        suggestions: [
          new mongoose.Schema(
            {
              field: { type: String, trim: true },
              message: { type: String, trim: true },
              priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
            },
            { _id: false }
          )
        ]
      },
      lastAnalyzedAt: { type: Date },
      history: [
        new mongoose.Schema(
          {
            analyzedAt: { type: Date, default: Date.now },
            score: { type: Number, default: 0 },
            details: {
              type: Object,
              default: {}
            }
          },
          { _id: false }
        )
      ]
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.JobseekerProfile ||
  mongoose.model('JobseekerProfile', JobseekerProfileSchema);