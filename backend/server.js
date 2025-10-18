const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

// Prefer IPv4 to avoid IPv6 connectivity issues with MongoDB SRV
try {
  const dns = require('dns');
  if (dns && typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
    console.log('🌐 DNS resolution order set to ipv4first');
  }
} catch (e) {
  console.log('🌐 DNS default order not set:', e.message);
}

console.log('🔄 Starting SkillSyncer Server...');

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};

// Basic middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (before database connection)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SkillSyncer API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Gemini startup probe
(async () => {
  try {
    const { healthCheck } = require('./utils/gemini');
    const result = await healthCheck();
    if (result.ok) {
      console.log('✅ Gemini API configured successfully. Sample:', result.sample);
    } else {
      console.warn('⚠️ Gemini API health check failed:', result.error || 'Unknown error');
    }
  } catch (e) {
    console.warn('⚠️ Gemini health check not executed:', e.message);
  }
})();

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Modern driver options (remove deprecated flags)
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // force IPv4 for connections
      // tls/ssl is automatically used for SRV URIs on Atlas; no need to set explicitly
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't exit, allow server to run without database for testing
    return false;
  }
};

// Initialize database connection
connectDB();

// Import routes after ensuring modules are loaded
let authRoutes, jobseekerRoutes, adminRoutes, employerRoutes, companiesRoutes, mentorRoutes, testsRoutes, internshipApplicationsRoutes, jobseekerStatusRoutes;

try {
  authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
}

try {
  jobseekerRoutes = require('./routes/jobseeker'); 
  console.log('✅ Jobseeker routes loaded');
} catch (error) {
  console.error('❌ Error loading jobseeker routes:', error.message);
}

try {
  adminRoutes = require('./routes/admin');
  console.log('✅ Admin routes loaded');
} catch (error) {
  console.error('❌ Error loading admin routes:', error.message);
}

try {
  employerRoutes = require('./routes/employer');
  console.log('✅ Employer routes loaded');
} catch (error) {
  console.error('❌ Error loading employer routes:', error.message);
}

try {
  testsRoutes = require('./routes/tests');
  console.log('✅ Tests routes loaded');
} catch (error) {
  console.error('❌ Error loading tests routes:', error.message);
}

try {
  internshipApplicationsRoutes = require('./routes/internshipapplications');
  console.log('✅ InternshipApplications routes loaded');
} catch (error) {
  console.error('❌ Error loading internshipapplications routes:', error.message);
}

try {
  jobseekerStatusRoutes = require('./routes/jobseeker_status');
  console.log('✅ Jobseeker status routes loaded');
} catch (error) {
  console.error('❌ Error loading jobseeker status routes:', error.message);
}

try {
  companiesRoutes = require('./routes/companies');
  console.log('✅ Companies routes loaded');
} catch (error) {
  console.error('❌ Error loading companies routes:', error.message);
}

try {
  mentorRoutes = require('./routes/mentor');
  console.log('✅ Mentor routes loaded');
} catch (error) {
  console.error('❌ Error loading mentor routes:', error.message);
}

// Routes
if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes registered');
} else {
  console.log('⚠️  Auth routes not available');
}

if (jobseekerRoutes) {
  app.use('/api/jobseeker', jobseekerRoutes);
  console.log('✅ Jobseeker routes registered');
} else {
  console.log('⚠️  Jobseeker routes not available');
}

if (adminRoutes) {
  app.use('/api/admin', adminRoutes);
  console.log('✅ Admin routes registered');
} else {
  console.log('⚠️  Admin routes not available');
}

if (employerRoutes) {
  app.use('/api/employer', employerRoutes);
  console.log('✅ Employer routes registered');
} else {
  console.log('⚠️  Employer routes not available');
}

if (testsRoutes) {
  app.use('/api/tests', testsRoutes);
  console.log('✅ Tests routes registered');
} else {
  console.log('⚠️  Tests routes not available');
}

if (internshipApplicationsRoutes) {
  app.use('/api/internshipapplications', internshipApplicationsRoutes);
  console.log('✅ InternshipApplications routes registered');
} else {
  console.log('⚠️  InternshipApplications routes not available');
}

if (jobseekerStatusRoutes) {
  app.use('/api/jobseekers', jobseekerStatusRoutes);
  console.log('✅ Jobseeker status routes registered');
} else {
  console.log('⚠️  Jobseeker status routes not available');
}

if (companiesRoutes) {
  app.use('/api/companies', companiesRoutes);
  app.use('/api/employee-requests', companiesRoutes);
  console.log('✅ Companies routes registered');
} else {
  console.log('⚠️  Companies routes not available');
}

if (mentorRoutes) {
  app.use('/api/mentor', mentorRoutes);
  console.log('✅ Mentor routes registered');
} else {
  console.log('⚠️  Mentor routes not available');
}

// Test route that doesn't require auth
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    routes: {
      auth: !!authRoutes,
      jobseeker: !!jobseekerRoutes,
      admin: !!adminRoutes,
      employer: !!employerRoutes
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    availableRoutes: ['/api/health', '/api/test', '/api/auth/*', '/api/jobseeker/*', '/api/admin/*', '/api/employer/*', '/api/mentor/*']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5003; // Use different port to avoid conflict

const server = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 SkillSyncer Server is running!');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log('');
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  console.log('🔄 Shutting down server due to unhandled promise rejection...');
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;