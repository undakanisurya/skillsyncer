const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${req.method} ${req.path} - ${req.ip}`);
  
  if (Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  
  next();
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error Handler:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    error = createErrorResponse(message, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Resource with ${field} '${value}' already exists`;
    error = createErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = createErrorResponse('Validation Error', 400, messages);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid authentication token';
    error = createErrorResponse(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Authentication token has expired';
    error = createErrorResponse(message, 401);
  }

  // Profile-specific errors
  if (err.message.includes('Profile not found')) {
    error = createErrorResponse('Profile not found or access denied', 404);
  }

  if (err.message.includes('User not found')) {
    error = createErrorResponse('User account not found', 404);
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const errors = error.errors || null;

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const createErrorResponse = (message, statusCode, errors = null) => {
  return {
    message,
    statusCode,
    errors
  };
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    next();
  };
};

const rateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const requestTimes = requests.get(key);
    
    // Remove old requests outside the window
    const validRequests = requestTimes.filter(time => now - time < windowMs);
    
    if (validRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }
    
    validRequests.push(now);
    requests.set(key, validRequests);
    
    next();
  };
};

const profileCompletionCheck = (minCompletion = 50) => {
  return asyncHandler(async (req, res, next) => {
    const JobseekerProfile = require('../models/JobseekerProfile');
    const { calculateProfileCompletion } = require('../utils/profileUtils');
    
    try {
      const user = req.user;
      const extendedProfile = await JobseekerProfile.findOne({ userId: user._id });
      
      const completion = calculateProfileCompletion(extendedProfile, user);
      
      if (completion < minCompletion) {
        return res.status(403).json({
          success: false,
          message: `Profile must be at least ${minCompletion}% complete to access this feature`,
          currentCompletion: completion,
          requiredCompletion: minCompletion
        });
      }
      
      req.profileCompletion = completion;
      next();
    } catch (error) {
      next(error);
    }
  });
};

module.exports = {
  logger,
  errorHandler,
  asyncHandler,
  validateRequest,
  rateLimiter,
  profileCompletionCheck
};