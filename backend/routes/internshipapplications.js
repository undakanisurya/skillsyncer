const express = require('express');
const { protect } = require('../middleware/auth');
const InternshipApplication = require('../models/InternshipApplication');
const InternshipPosting = require('../models/InternshipPosting');
const User = require('../models/User');
const { sendShortlistEmail, sendRejectionEmail, sendNotificationEmail } = require('../utils/emailService');

const router = express.Router();

// Shortlist or reject application
// POST /api/internshipapplications/shortlist
// body: { applicationId, action: 'shortlist'|'reject', notes? }
router.post('/shortlist', protect, async (req, res) => {
  try {
    const { applicationId, action, notes } = req.body;
    if (!applicationId || !['shortlist', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'applicationId and valid action are required' });
    }

    if (!['employer', 'company'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only employers can update applications' });
    }

    const application = await InternshipApplication.findById(applicationId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this application' });
    }

    const internship = await InternshipPosting.findById(application.internshipId);
    const jobseeker = await User.findById(application.jobseekerId);

    if (action === 'shortlist') {
      application.status = 'shortlisted';
      await application.save();
      if (jobseeker?.email) {
        await sendShortlistEmail(jobseeker.email, jobseeker.name || 'Candidate', internship?.companyName || 'Company', internship?.title || 'Internship', notes || '');
      }
    } else {
      application.status = 'rejected';
      await application.save();
      if (jobseeker?.email) {
        await sendRejectionEmail(jobseeker.email, jobseeker.name || 'Candidate', internship?.companyName || 'Company', internship?.title || 'Internship', notes || '');
      }
    }

    res.json({ success: true, data: { applicationId: application._id, status: application.status } });
  } catch (err) {
    console.error('Shortlist/reject error:', err);
    res.status(500).json({ success: false, message: 'Failed to update application' });
  }
});

// Selection and internship start emails
// POST /api/internshipapplications/select
// body: { applicationId, mode: 'Online'|'Offline'|'Hybrid', startDate, mentorName?, companyAddress?, dateTime? }
router.post('/select', protect, async (req, res) => {
  try {
    const { applicationId, mode, startDate, mentorName, companyAddress, dateTime } = req.body;
    if (!applicationId || !['Online', 'Offline', 'Hybrid'].includes(mode)) {
      return res.status(400).json({ success: false, message: 'applicationId and valid mode are required' });
    }
    if (!['employer', 'company'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only employers can select candidates' });
    }

    const application = await InternshipApplication.findById(applicationId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this application' });
    }

    application.status = 'selected';
    application.internshipMode = mode;
    await application.save();

    const jobseeker = await User.findById(application.jobseekerId);

    if (jobseeker?.email) {
      if (mode === 'Offline') {
        const subject = 'Internship Selection';
        const message = `You are selected. Please report at ${companyAddress || 'company office'} on ${dateTime || startDate}.`;
        await sendNotificationEmail(jobseeker.email, subject, message);
      } else {
        const subject = 'Internship Selection';
        const message = `You are selected. Internship starts on ${startDate}. Mentor: ${mentorName || 'Assigned soon'}. Check dashboard for tasks and progress.`;
        await sendNotificationEmail(jobseeker.email, subject, message);
      }
    }

    res.json({ success: true, data: { applicationId: application._id, status: application.status, mode } });
  } catch (err) {
    console.error('Select candidate error:', err);
    res.status(500).json({ success: false, message: 'Failed to select candidate' });
  }
});

module.exports = router;


