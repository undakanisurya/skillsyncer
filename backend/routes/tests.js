const express = require('express');
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const Test = require('../models/Test');
const InternshipApplication = require('../models/InternshipApplication');
const User = require('../models/User');
const { generateTestQuestions, scoreAnswers, getModelName } = require('../utils/openai');
const { generateViaPython } = require('../utils/hf_python');
const { generateViaInternModel } = require('../utils/intern_python');
const { sendNotificationEmail } = require('../utils/emailService');
const { processTestResult } = require('../utils/mentorAssignment');

const router = express.Router();

// Get test details by token
// GET /api/tests/:token
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const testDoc = await Test.findOne({ token });
    if (!testDoc) return res.status(404).json({ success: false, message: 'Invalid test link' });

    const now = new Date();
    const expired = !!testDoc.submittedAt || now > new Date(testDoc.testExpiry);
    let internshipTitle = 'Assessment';
    try {
      const application = await InternshipApplication.findById(testDoc.applicationId);
      internshipTitle = application?.internshipDetails?.title || internshipTitle;
    } catch (_) {}
    const payload = {
      success: true,
      data: {
        applicationId: testDoc.applicationId,
        token: testDoc.token,
        expiresAt: testDoc.testExpiry,
        internshipTitle,
        // Strip any answerKey or hidden fields before sending to client
        questions: (testDoc.questions || []).map(q => {
          const { answerKey, ...rest } = q || {};
          return rest;
        }),
        submittedAt: testDoc.submittedAt,
        score: testDoc.score,
        result: testDoc.result,
        expired
      }
    };
    // After submission or expiry, expose candidate answers and objective correctness/solutions
    if (testDoc.submittedAt) {
      payload.data.answers = testDoc.answers || [];
      payload.data.correctness = Array.isArray(testDoc.correctness) ? testDoc.correctness : [];
      payload.data.solutions = (testDoc.questions || []).map(q => {
        if (!q) return { correctAnswer: null };
        const t = q.type || 'text';
        if (t === 'mcq' || t === 'oneword') {
          return { correctAnswer: q.answerKey ?? null };
        }
        return { correctAnswer: null };
      });
    }
    res.json(payload);
  } catch (err) {
    console.error('Fetch test error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch test' });
  }
});

// Preview questions without storing (for employer testing)
// POST /api/tests/preview { title, skills?[], model?, provider? }
router.post('/preview', protect, async (req, res) => {
  try {
    if (!['employer', 'company'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only employers can preview tests' });
    }
    const { title = 'Internship', skills = [], model } = req.body || {};

    // Always use HF python generator for preview
    const questions = await generateViaPython({ title, skills, model });
    return res.json({ success: true, data: { questions, model: model || 'hf-python', provider: 'hf-python' } });
  } catch (err) {
    console.error('Preview test error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate preview' });
  }
});

// Assign a test to a shortlisted candidate
// POST /api/tests/assign
// body: { applicationId, expiresInHours? }
router.post('/assign', protect, async (req, res) => {
  try {
    const { applicationId, expiresInHours = 24 } = req.body;
    if (!applicationId) {
      return res.status(400).json({ success: false, message: 'applicationId is required' });
    }

    const application = await InternshipApplication.findById(applicationId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Only employer/company can assign tests
    if (!['employer', 'company'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only employers can assign tests' });
    }
    if (application.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this application' });
    }

    const token = uuidv4();
    const expiry = new Date(Date.now() + Number(expiresInHours) * 3600 * 1000);

    // Build context for Gemini prompt
    const context = {
      title: application?.internshipDetails?.title || 'Internship',
      skills: application?.skills?.technicalSkills || [],
      numQuestions: 5
    };
    let questions = [];
    try {
      // Prefer local intern.py model bridge
      questions = await generateViaInternModel({ title: context.title, total: 8, coding: 2, debug: 1 });
      if (!Array.isArray(questions) || !questions.length) {
        throw new Error('intern.py returned empty');
      }
    } catch (_) {
      try {
        // Try HF python generator
        questions = await generateViaPython({ title: context.title, skills: context.skills });
      } catch (_) {
        // Fallback to OpenAI generator
        questions = await generateTestQuestions(context);
      }
    }

    // Link the test token via frontend landing route (jobseeker to open)
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    const testLink = `${frontendBase}/test/${token}`;

    const testDoc = await Test.create({
      applicationId: application._id,
      jobseekerId: application.jobseekerId,
      employerId: application.employerId,
      internshipId: application.internshipId,
      token,
      testLink,
      testExpiry: expiry,
      questions
    });

    // Update application with test info and status
    application.testLink = testLink;
    application.testExpiry = expiry;
    application.status = 'test-assigned';
    await application.save();

    // Email candidate
    const candidate = await User.findById(application.jobseekerId);
    if (candidate?.email) {
      const subject = 'Test Assigned';
      const message = `
        <p>Please complete your test at <a href="${testLink}">${testLink}</a>.</p>
        <p>Deadline: ${expiry.toLocaleString()}</p>
      `;
      await sendNotificationEmail(candidate.email, subject, message);
    }

    // Do not leak answers back to employer UI; return sanitized questions
    const publicQuestions = (questions || []).map(q => {
      const { answerKey, ...rest } = q || {};
      return rest;
    });
    res.json({ success: true, data: { testId: testDoc._id, token, testLink, testExpiry: expiry, questions: publicQuestions } });
  } catch (err) {
    console.error('Assign test error:', err);
    res.status(500).json({ success: false, message: 'Failed to assign test' });
  }
});

// Reset a failed test to allow retaking
// POST /api/tests/reset
// body: { applicationId }
router.post('/reset', protect, async (req, res) => {
  try {
    const { applicationId } = req.body;
    if (!applicationId) {
      return res.status(400).json({ success: false, message: 'applicationId is required' });
    }

    const application = await InternshipApplication.findById(applicationId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Only employer/company can reset tests
    if (!['employer', 'company'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only employers can reset tests' });
    }
    if (application.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this application' });
    }

    // Only allow reset if test was failed
    if (application.result !== 'Failed') {
      return res.status(400).json({ success: false, message: 'Can only reset failed tests' });
    }

    // Delete existing test
    await Test.findOneAndDelete({ applicationId: application._id });

    // Reset application test fields
    application.testLink = null;
    application.testExpiry = null;
    application.answers = [];
    application.score = null;
    application.result = null;
    application.reason = null;
    application.status = 'shortlisted'; // Reset to shortlisted for retest
    await application.save();

    res.json({ success: true, message: 'Test reset successfully. You can now assign a new test.' });
  } catch (err) {
    console.error('Reset test error:', err);
    res.status(500).json({ success: false, message: 'Failed to reset test' });
  }
});

// Submit test answers and score
// POST /api/tests/submit
// body: { token, answers: [] }
router.post('/submit', async (req, res) => {
  try {
    const { token, answers } = req.body;
    if (!token || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'token and answers[] are required' });
    }

    const testDoc = await Test.findOne({ token });
    if (!testDoc) return res.status(404).json({ success: false, message: 'Invalid test link' });
    if (testDoc.submittedAt) return res.status(400).json({ success: false, message: 'Test already submitted' });
    if (new Date() > new Date(testDoc.testExpiry)) {
      return res.status(400).json({ success: false, message: 'Test link has expired' });
    }

    // Score using Gemini
    const { score, result, correctness } = await scoreAnswers(testDoc.questions, answers);

    testDoc.answers = answers;
    testDoc.score = score;
    testDoc.result = result;
    testDoc.correctness = correctness;
    testDoc.submittedAt = new Date();
    // Immediately expire the link
    testDoc.testExpiry = new Date(Date.now() - 1000);
    await testDoc.save();

    // Update application status accordingly
    const application = await InternshipApplication.findById(testDoc.applicationId);
    if (application) {
      application.answers = answers;
      application.score = score;
      application.result = result;
      application.status = result === 'Passed' ? 'selected' : 'rejected';
      application.reason = result === 'Failed' ? 'test failed' : 'test passed';
      await application.save();

      // Process test result for grading and mentor assignment
      let mentorAssignmentResult = null;
      if (result === 'Passed') {
        try {
          mentorAssignmentResult = await processTestResult(application.jobseekerId, score, result);
          console.log('Mentor assignment result:', mentorAssignmentResult);
        } catch (error) {
          console.error('Error processing mentor assignment:', error);
        }
      }

      // Notify candidate based on outcome
      const candidate = await User.findById(application.jobseekerId);
      if (candidate?.email) {
        if (result === 'Failed') {
          const subject = 'Internship Test Result – Rejected';
          const message = `
            <p>Dear ${candidate.name || 'Candidate'},</p>
            <p>Thank you for completing the assessment. Unfortunately, you did not meet the passing criteria.</p>
            <p><strong>Score:</strong> ${score}</p>
            <p>We appreciate your effort and encourage you to apply again in the future.</p>
            <p>Best regards,<br/>${application?.internshipDetails?.title || 'Internship'} Team</p>
          `;
          await sendNotificationEmail(candidate.email, subject, message);
        } else if (result === 'Passed') {
          // Selection email content may depend on internship type (Paid/Unpaid)
          const type = application?.internshipDetails?.type || 'Internship';
          const subject = 'Internship Test Result – Selected';
          let message = `
            <p>Dear ${candidate.name || 'Candidate'},</p>
            <p>Congratulations! You have <strong>passed</strong> the assessment and have been selected for the ${type}.</p>
            <p><strong>Score:</strong> ${score}</p>
          `;
          
          // Add mentor assignment information if available
          if (mentorAssignmentResult && mentorAssignmentResult.success && mentorAssignmentResult.mentorAssigned) {
            message += `
              <p><strong>Grade:</strong> ${mentorAssignmentResult.grade}</p>
              <p><strong>Mentor Assigned:</strong> ${mentorAssignmentResult.mentor.name}</p>
              <p>Your mentor will contact you soon to begin your mentorship journey.</p>
            `;
          } else if (mentorAssignmentResult && mentorAssignmentResult.success) {
            message += `
              <p><strong>Grade:</strong> ${mentorAssignmentResult.grade}</p>
              <p>We are working on assigning you a mentor and will contact you soon.</p>
            `;
          } else {
            message += `<p>Our team will contact you shortly with next steps.</p>`;
          }
          
          message += `<p>Best regards,<br/>${application?.internshipDetails?.title || 'Internship'} Team</p>`;
          
          await sendNotificationEmail(candidate.email, subject, message);
        }
      }
    }

    const solutions = (testDoc.questions || []).map(q => {
      if (!q) return { correctAnswer: null };
      const t = q.type || 'text';
      if (t === 'mcq' || t === 'oneword') {
        return { correctAnswer: q.answerKey ?? null };
      }
      return { correctAnswer: null };
    });
    res.json({ success: true, data: { score, result, answers, solutions, correctness } });
  } catch (err) {
    console.error('Submit test error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit test' });
  }
});

module.exports = router;


