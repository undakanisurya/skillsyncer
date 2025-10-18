import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { API_BASE_URL } from '../config/api';
import {
  Users,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building,
  CheckCircle,
  ArrowRight,
  Zap,
  AlertCircle,
  Check
} from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isCompanyRegistration, setIsCompanyRegistration] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organization: '',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    industry: ''
  });
  
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const roles = [
    {
      id: 'jobseeker',
      icon: Users,
      title: 'Job Seeker',
      description: 'Find job opportunities, internships, and career growth',
      benefits: ['Access to job listings', 'Skills matching', 'Career guidance', 'Resume building'],
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'company',
      icon: Building,
      title: 'Employer',
      description: 'Discover talented candidates and post opportunities',
      benefits: ['Talent discovery', 'Post job openings', 'Skills matching', 'Team building'],
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 border-green-200'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Basic validation - check appropriate email field
      const emailToValidate = isCompanyRegistration ? formData.companyEmail : formData.email;
      if (!emailToValidate.trim()) {
        setError('Email is required');
        setLoading(false);
        return;
      }
      
      if (!formData.password.trim()) {
        setError('Password is required');
        setLoading(false);
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailToValidate)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      if (!isLogin && !isCompanyRegistration) {
        // Regular user registration validation
        if (!formData.fullName.trim()) {
          setError('Full name is required');
          setLoading(false);
          return;
        }
        
        if (formData.fullName.trim().length < 2) {
          setError('Name must be at least 2 characters long');
          setLoading(false);
          return;
        }

        // Name should only contain letters and spaces
        if (!/^[a-zA-Z\s]+$/.test(formData.fullName.trim())) {
          setError('Name can only contain letters and spaces');
          setLoading(false);
          return;
        }
        
        if (!selectedRole) {
          setError('Please select your role');
          setLoading(false);
          return;
        }

        // If company role is selected, switch to company registration
        if (selectedRole === 'company') {
          setIsCompanyRegistration(true);
          setLoading(false);
          return;
        }

        // Password validation
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
          setError('Password must contain both uppercase and lowercase letters');
          setLoading(false);
          return;
        }

        if (!/(?=.*\d)/.test(formData.password)) {
          setError('Password must contain at least one number');
          setLoading(false);
          return;
        }
        
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
      } else if (isCompanyRegistration) {
        // Company registration validation
        if (!formData.companyName.trim()) {
          setError('Company name is required');
          setLoading(false);
          return;
        }

        if (formData.companyName.trim().length < 2) {
          setError('Company name must be at least 2 characters long');
          setLoading(false);
          return;
        }

        // Company name should only contain letters and spaces
        if (!/^[a-zA-Z\s]+$/.test(formData.companyName.trim())) {
          setError('Company name can only contain letters and spaces');
          setLoading(false);
          return;
        }
        
        if (!formData.companyEmail.trim()) {
          setError('Company email is required');
          setLoading(false);
          return;
        }
        
        if (!formData.companyPhone.trim()) {
          setError('Company phone is required');
          setLoading(false);
          return;
        }

        // Phone number validation
        const cleanPhone = formData.companyPhone.replace(/\D/g, '');
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
          setError('Phone number must be exactly 10 digits starting with 6, 7, 8, or 9');
          setLoading(false);
          return;
        }
        
        if (!formData.industry) {
          setError('Please select an industry');
          setLoading(false);
          return;
        }

        // Password validation for companies
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
          setError('Password must contain both uppercase and lowercase letters');
          setLoading(false);
          return;
        }

        if (!/(?=.*\d)/.test(formData.password)) {
          setError('Password must contain at least one number');
          setLoading(false);
          return;
        }
        
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
      }

      let endpoint = '/api/auth/login';
      let payload = {};

      if (isLogin) {
        payload = {
          email: formData.email,
          password: formData.password
        };
      } else if (isCompanyRegistration) {
        endpoint = '/api/auth/register-company';
        payload = {
          companyName: formData.companyName,
          email: formData.companyEmail,
          phone: formData.companyPhone,
          industry: formData.industry,
          password: formData.password,
          role: 'company'
        };
      } else {
        endpoint = '/api/auth/register';
        payload = {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: selectedRole === 'company' ? 'company' : selectedRole
        };
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (isLogin) {
          // Store token and user info for login
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('userRole', data.data.user.role);
          localStorage.setItem('userName', data.data.user.name || data.data.user.companyName);
          localStorage.setItem('userEmail', data.data.user.email);
          // Persist userId for subsequent profile requests
          localStorage.setItem('userId', data.data.user._id || data.data.user.id);
          
          // Store secondary roles if they exist
          if (data.data.user.secondaryRoles && data.data.user.secondaryRoles.length > 0) {
            localStorage.setItem('secondaryRoles', JSON.stringify(data.data.user.secondaryRoles));
          }

          // Redirect based on primary role
          if (data.data.user.role === 'jobseeker') {
            navigate('/jobseeker-dashboard');
          } else if (data.data.user.role === 'employer' || data.data.user.role === 'company') {
            navigate('/employer-dashboard');
          } else if (data.data.user.role === 'mentor') {
            navigate('/mentor-dashboard');
          } else if (data.data.user.role === 'admin') {
            navigate('/admin-dashboard');
          } else if (data.data.user.role === 'employee') {
            navigate('/employee-dashboard');
          } else {
            navigate('/');
          }
        } else {
          // For registration, redirect to login page
          if (isCompanyRegistration) {
            setIsCompanyRegistration(false);
            setIsLogin(true);
            setFormData({
              email: '',
              password: '',
              confirmPassword: '',
              fullName: '',
              organization: '',
              companyName: '',
              companyEmail: '',
              companyPhone: '',
              industry: ''
            });
            setError('');
            setSuccessMessage('Company registered successfully! Please login with your company email and password.');
            setShowSuccessModal(true);
          } else {
            // Regular user registration - redirect to login
            setIsLogin(true);
            setFormData({
              email: '',
              password: '',
              confirmPassword: '',
              fullName: '',
              organization: '',
              companyName: '',
              companyEmail: '',
              companyPhone: '',
              industry: ''
            });
            setError('');
            setSuccessMessage('Registration successful! Please login with your credentials.');
            setShowSuccessModal(true);
          }
        }
      } else {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          setError(data.errors.join(', '));
        } else {
          setError(data.message || 'An error occurred');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-in function for jobseekers
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Send idToken to your backend
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/google-signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          role: 'jobseeker' // Only for jobseekers
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user info
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userRole', data.data.user.role);
        localStorage.setItem('userName', data.data.user.name);
        localStorage.setItem('userEmail', data.data.user.email);
        // Persist userId for jobseeker profile APIs
        localStorage.setItem('userId', data.data.user._id || data.data.user.id);

        // Redirect to jobseeker dashboard
        navigate('/jobseeker-dashboard');
      } else {
        setError(data.message || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot password via Firebase
  const handleForgotPassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    const email = (formData.email || '').trim();
    if (!email) {
      setError('Please enter your email to reset the password');
      return;
    }
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setSuccessMessage('If this email is registered, a reset link has been sent. Please check your inbox.');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setSuccessMessage('If this email is registered, a reset link has been sent. Please check your inbox.');
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Real-time validation functions
  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case 'email':
      case 'companyEmail':
        if (!value.trim()) {
          errors[name] = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[name] = 'Please enter a valid email address';
        }
        break;

      case 'password':
        if (!value) {
          errors[name] = 'Password is required';
        } else if (value.length < 6) {
          errors[name] = 'Password must be at least 6 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(value)) {
          errors[name] = 'Password must contain both uppercase and lowercase letters';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          errors[name] = 'Please confirm your password';
        } else if (value !== formData.password) {
          errors[name] = 'Passwords do not match';
        }
        break;

      case 'fullName':
        if (!value.trim()) {
          errors[name] = 'Full name is required';
        } else if (value.trim().length < 2) {
          errors[name] = 'Name must be at least 2 characters long';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          errors[name] = 'Name can only contain letters and spaces';
        }
        break;

      case 'companyName':
        if (!value.trim()) {
          errors[name] = 'Company name is required';
        } else if (value.trim().length < 2) {
          errors[name] = 'Company name must be at least 2 characters long';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors[name] = 'Company name can only contain letters and spaces';
        }
        break;

      case 'companyPhone':
        if (!value.trim()) {
          errors[name] = 'Phone number is required';
        } else {
          // Remove all non-digit characters for validation
          const cleanPhone = value.replace(/\D/g, '');
          if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            errors[name] = 'Phone number must be exactly 10 digits starting with 6, 7, 8, or 9';
          }
        }
        break;

      case 'industry':
        if (!value) {
          errors[name] = 'Please select an industry';
        }
        break;

      default:
        break;
    }

    return errors[name] || null;
  };

  // Phone number formatting function
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');

    // Limit to 10 digits
    const limitedPhoneNumber = phoneNumber.slice(0, 10);

    // Format as user types: 98765 43210
    if (limitedPhoneNumber.length >= 6) {
      return `${limitedPhoneNumber.slice(0, 5)} ${limitedPhoneNumber.slice(5)}`;
    } else if (limitedPhoneNumber.length >= 1) {
      return limitedPhoneNumber;
    }

    return limitedPhoneNumber;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Special handling for phone number formatting (only during registration)
    if (name === 'companyPhone' && !isLogin) {
      processedValue = formatPhoneNumber(value);
    }

    setFormData({
      ...formData,
      [name]: processedValue
    });

    // Only perform validation during registration, not login
    if (!isLogin) {
      // Mark field as touched
      setFieldTouched({
        ...fieldTouched,
        [name]: true
      });

      // Real-time validation
      const error = validateField(name, processedValue);
      setFieldErrors({
        ...fieldErrors,
        [name]: error
      });

      // Clear general error when user starts typing
      if (error === null && fieldErrors[name]) {
        const newErrors = { ...fieldErrors };
        delete newErrors[name];
        setFieldErrors(newErrors);
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    // Only perform validation during registration, not login
    if (!isLogin) {
      setFieldTouched({
        ...fieldTouched,
        [name]: true
      });

      const error = validateField(name, value);
      setFieldErrors({
        ...fieldErrors,
        [name]: error
      });
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessMessage('');
    // The form state has already been reset and isLogin set to true in the registration success handler
  };

  // Helper function to get field validation status (only for registration)
  const getFieldStatus = (fieldName) => {
    // Don't show validation on login page
    if (isLogin) return 'default';

    const hasError = fieldErrors[fieldName];
    const isTouched = fieldTouched[fieldName];
    const hasValue = formData[fieldName]?.length > 0;

    if (hasError && isTouched) {
      return 'error';
    } else if (!hasError && isTouched && hasValue) {
      return 'success';
    }
    return 'default';
  };

  const getFieldClasses = (fieldName) => {
    const status = getFieldStatus(fieldName);
    const baseClasses = "w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 transition-colors";

    switch (status) {
      case 'error':
        return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50`;
      case 'success':
        return `${baseClasses} border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50`;
      default:
        return `${baseClasses} border-gray-300 focus:ring-primary-500 focus:border-primary-500`;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen pt-20 gradient-bg"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Info & Role Selection */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="mb-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  {isLogin ? 'Welcome Back' : isCompanyRegistration ? 'Employer Registration' : 'Join'} <span className="text-gradient">Skillsyncer</span>
                </h1>
              </div>
              <p className="text-xl text-gray-600">
                {isLogin 
                  ? 'Sign in to continue your career journey'
                  : isCompanyRegistration 
                    ? 'Create your employer account and start hiring'
                    : 'Start your career transformation today'
                }
              </p>
            </div>

            {!isLogin && !isCompanyRegistration && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900">Choose Your Registration</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <motion.div
                      key={role.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedRole(role.id);
                        if (role.id === 'company') {
                          setIsCompanyRegistration(true);
                          setFormData({
                            email: '',
                            password: '',
                            confirmPassword: '',
                            fullName: '',
                            organization: '',
                            companyName: '',
                            companyEmail: '',
                            companyPhone: '',
                            industry: ''
                          });
                          setError('');
                        }
                      }}
                      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        selectedRole === role.id
                          ? `${role.bgColor} border-opacity-100 shadow-lg`
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center`}>
                          <role.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{role.title}</h3>
                          {selectedRole === role.id && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{role.description}</p>
                      <div className="space-y-1">
                        {role.benefits.slice(0, 2).map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-gray-500">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
              {/* Tab Switch */}
              <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setIsCompanyRegistration(false);
                    setError('');
                    setFieldErrors({});
                    setFieldTouched({});
                  }}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    isLogin
                      ? 'bg-white text-primary-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setIsCompanyRegistration(false);
                    setError('');
                    setSelectedRole('');
                    setFieldErrors({});
                    setFieldTouched({});
                  }}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    !isLogin
                      ? 'bg-white text-primary-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.form
                  key={isLogin ? 'login' : 'signup'}
                  initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                    >
                      {error}
                    </motion.div>
                  )}
                  {!isLogin && !isCompanyRegistration && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required={!isLogin && !isCompanyRegistration}
                            className={getFieldClasses('fullName')}
                            placeholder="John Doe"
                          />
                          {getFieldStatus('fullName') === 'success' && (
                            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                          )}
                          {getFieldStatus('fullName') === 'error' && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                          )}
                        </div>
                        {fieldErrors.fullName && fieldTouched.fullName && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-600"
                          >
                            {fieldErrors.fullName}
                          </motion.p>
                        )}
                      </div>

                      {selectedRole === 'admin' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Organization
                          </label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="text"
                              name="organization"
                              value={formData.organization}
                              onChange={handleChange}
                              required={!isLogin && selectedRole === 'admin'}
                              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                              placeholder="Your organization name"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Company Registration Fields */}
                  {isCompanyRegistration && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name *
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required={isCompanyRegistration}
                            className={getFieldClasses('companyName')}
                            placeholder="TechCorp Inc."
                          />
                          {getFieldStatus('companyName') === 'success' && (
                            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                          )}
                          {getFieldStatus('companyName') === 'error' && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                          )}
                        </div>
                        {fieldErrors.companyName && fieldTouched.companyName && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-600"
                          >
                            {fieldErrors.companyName}
                          </motion.p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Email *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            name="companyEmail"
                            value={formData.companyEmail}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required={isCompanyRegistration}
                            className={getFieldClasses('companyEmail')}
                            placeholder="contact@techcorp.com"
                          />
                          {getFieldStatus('companyEmail') === 'success' && (
                            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                          )}
                          {getFieldStatus('companyEmail') === 'error' && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                          )}
                        </div>
                        {fieldErrors.companyEmail && fieldTouched.companyEmail && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-600"
                          >
                            {fieldErrors.companyEmail}
                          </motion.p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Phone *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="tel"
                            name="companyPhone"
                            value={formData.companyPhone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onKeyDown={(e) => {
                              // Only allow digits and control keys
                              if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            required={isCompanyRegistration}
                            className={getFieldClasses('companyPhone')}
                            placeholder="98765 43210"
                            maxLength="11"
                          />
                          {getFieldStatus('companyPhone') === 'success' && (
                            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                          )}
                          {getFieldStatus('companyPhone') === 'error' && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                          )}
                        </div>
                        {fieldErrors.companyPhone && fieldTouched.companyPhone && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-600"
                          >
                            {fieldErrors.companyPhone}
                          </motion.p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry *
                        </label>
                        <div className="relative">
                          <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <select
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            required={isCompanyRegistration}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          >
                            <option value="">Select Industry</option>
                            <option value="technology">Technology</option>
                            <option value="finance">Finance & Banking</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email field - always shown for login, only for non-company registration */}
                  {!isCompanyRegistration && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                          className={getFieldClasses('email')}
                          placeholder="john@example.com"
                        />
                        {!isLogin && getFieldStatus('email') === 'success' && (
                          <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                        )}
                        {!isLogin && getFieldStatus('email') === 'error' && (
                          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                        )}
                      </div>
                      {!isLogin && fieldErrors.email && fieldTouched.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600"
                        >
                          {fieldErrors.email}
                        </motion.p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={isLogin ?
                          "w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" :
                          getFieldClasses('password').replace('pr-4', 'pr-20')
                        }
                        placeholder="••••••••"
                      />
                      {!isLogin && getFieldStatus('password') === 'success' && (
                        <Check className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                      )}
                      {!isLogin && getFieldStatus('password') === 'error' && (
                        <AlertCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {!isLogin && fieldErrors.password && fieldTouched.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {fieldErrors.password}
                      </motion.p>
                    )}
                  </div>

                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required={!isLogin}
                          className={getFieldClasses('confirmPassword')}
                          placeholder="••••••••"
                        />
                        {getFieldStatus('confirmPassword') === 'success' && (
                          <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                        )}
                        {getFieldStatus('confirmPassword') === 'error' && (
                          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                        )}
                      </div>
                      {fieldErrors.confirmPassword && fieldTouched.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600"
                        >
                          {fieldErrors.confirmPassword}
                        </motion.p>
                      )}
                    </div>
                  )}

                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input type="checkbox" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                      </label>
                      <a href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Forgot password?
                      </a>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    disabled={(!isLogin && !isCompanyRegistration && (!selectedRole || selectedRole === 'company')) || loading}
                    className="w-full btn-primary inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {isLogin 
                          ? 'Signing In...' 
                          : isCompanyRegistration 
                            ? 'Creating Company Account...' 
                            : 'Creating Account...'
                        }
                      </>
                    ) : (
                      <>
                        {isLogin 
                          ? 'Sign In' 
                          : isCompanyRegistration 
                            ? 'Create Company Account' 
                            : 'Create Account'
                        }
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </motion.button>

                  {/* Google Sign-in for Jobseekers */}
                  {(isLogin || (!isLogin && !isCompanyRegistration && selectedRole === 'jobseeker')) && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
                        ) : (
                          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                        )}
                        {loading ? 'Signing in...' : `${isLogin ? 'Sign in' : 'Sign up'} with Google`}
                      </motion.button>
                    </>
                  )}

                </motion.form>
              </AnimatePresence>

              {/* Social Login */}
              {/* <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>
                  <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </button>
                  <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </button>
                </div>
              </div> */}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
            onClick={handleSuccessModalClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Registration Successful!
                </h3>
                <p className="text-gray-600 mb-6">
                  {successMessage}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSuccessModalClose}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  OK
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Auth;