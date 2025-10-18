const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const InternshipApplication = require('../models/InternshipApplication');

const router = express.Router();

// GET /api/jobseekers/status
// Returns latest application statuses and any assigned tests for the logged-in jobseeker
router.get('/status', protect, authorize('jobseeker'), async (req, res) => {
  try {
    const apps = await InternshipApplication.find({ jobseekerId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(50);

    const data = apps.map(a => ({
      applicationId: a._id,
      internshipId: a.internshipId,
      status: a.status,
      testLink: a.testLink,
      testExpiry: a.testExpiry,
      score: a.score,
      result: a.result
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('Jobseeker status error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch status' });
  }
});

module.exports = router;


