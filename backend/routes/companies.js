const express = require('express');
const router = express.Router();
const User = require('../models/User');
const EmployeeRequest = require('../models/EmployeeRequest');
const multer = require('multer');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only JPEG images
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG images are allowed'), false);
    }
  }
});

// GET /api/companies/list - Get list of registered companies
router.get('/list', async (req, res) => {
  try {
    const companies = await User.find(
      { role: 'company', isActive: true },
      { name: 1, email: 1 }
    ).sort({ name: 1 });

    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies'
    });
  }
});

// POST /api/employee-requests - Submit employee request
router.post('/', upload.single('companyIdCard'), async (req, res) => {
  try {
    const { fullName, email, companyId } = req.body;

    // Validate required fields
    if (!fullName || !email || !companyId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Company ID card is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if company exists
    const company = await User.findById(companyId);
    if (!company || company.role !== 'company') {
      return res.status(400).json({
        success: false,
        message: 'Invalid company selected'
      });
    }

    // Check if request already exists for this email and company
    const existingRequest = await EmployeeRequest.findOne({
      email: email.toLowerCase(),
      companyId: companyId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A request for this email and company already exists'
      });
    }

    // Upload ID card to Cloudinary
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      'employee-id-cards',
      `id_card_${Date.now()}_${fullName.replace(/\s+/g, '_')}`
    );

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload ID card',
        error: uploadResult.error
      });
    }

    // Create new employee request
    const employeeRequest = new EmployeeRequest({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      companyId,
      companyIdCard: uploadResult.url // Cloudinary URL
    });

    await employeeRequest.save();

    res.status(201).json({
      success: true,
      message: 'Employee request submitted successfully',
      data: {
        id: employeeRequest._id,
        status: employeeRequest.status
      }
    });

  } catch (error) {
    console.error('Error submitting employee request:', error);
    
    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 5MB'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit employee request'
    });
  }
});

module.exports = router;