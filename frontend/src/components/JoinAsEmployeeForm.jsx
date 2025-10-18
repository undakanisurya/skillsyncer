import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, User, Mail, Building, FileImage, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const JoinAsEmployeeForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyId: '',
    companyIdCard: null
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  // Fetch companies when component mounts
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/companies/list`);
      const data = await response.json();
      if (data.success) {
        setCompanies(data.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Do not trim/collapse fullName while typing to avoid spacing/caret issues
    let normalizedValue = value;
    if (name === 'email') {
      // Trim and lowercase for consistency
      normalizedValue = value.trim().toLowerCase();
    }

    setFormData(prev => ({
      ...prev,
      [name]: normalizedValue
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
        setErrors(prev => ({
          ...prev,
          companyIdCard: 'Please upload only JPEG format images'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          companyIdCard: 'File size should be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        companyIdCard: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.companyIdCard) {
        setErrors(prev => ({
          ...prev,
          companyIdCard: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name: letters, spaces, dots, hyphens, apostrophes. 2-60 chars. No leading/trailing separators.
    const name = formData.fullName.trim();
    const nameRegex = /^(?=.{2,60}$)[A-Za-z][A-Za-z .'-]*[A-Za-z]$/;
    if (!name) {
      newErrors.fullName = 'Full name is required';
    } else if (!nameRegex.test(name)) {
      newErrors.fullName = 'Enter a valid name (letters, spaces, . - \', 2-60 characters)';
    }

    // Email: robust RFC 5322-ish simple validation.
    const email = formData.email.trim();
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Enter a valid email address (e.g., name@example.com)';
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Please select a company';
    }

    if (!formData.companyIdCard) {
      newErrors.companyIdCard = 'Company ID card is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const submitFormData = new FormData();
      submitFormData.append('fullName', formData.fullName);
      submitFormData.append('email', formData.email);
      submitFormData.append('companyId', formData.companyId);
      submitFormData.append('companyIdCard', formData.companyIdCard);

      const response = await fetch(`${API_BASE_URL}/api/employee-requests`, {
        method: 'POST',
        body: submitFormData
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            fullName: '',
            email: '',
            companyId: '',
            companyIdCard: null
          });
          setImagePreview(null);
          setSubmitStatus(null);
          onClose();
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrors({ submit: data.message || 'Failed to submit request' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      email: '',
      companyId: '',
      companyIdCard: null
    });
    setImagePreview(null);
    setErrors({});
    setSubmitStatus(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Join as Employee</h2>
              <p className="text-sm text-gray-600 mt-1">Fill out the form to request employee access</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                onBlur={(e) => {
                  const collapsed = e.target.value.replace(/\s+/g, ' ').trim();
                  setFormData(prev => ({ ...prev, fullName: collapsed }));
                  // Re-validate name on blur for immediate feedback
                  const nameRegex = /^(?=.{2,60}$)[A-Za-z][A-Za-z .'-]*[A-Za-z]$/;
                  if (!collapsed) {
                    setErrors(prev => ({ ...prev, fullName: 'Full name is required' }));
                  } else if (!nameRegex.test(collapsed)) {
                    setErrors(prev => ({ ...prev, fullName: 'Enter a valid name (letters, spaces, . - \' , 2-60 characters)' }));
                  } else if (errors.fullName) {
                    setErrors(prev => ({ ...prev, fullName: '' }));
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
                minLength={2}
                maxLength={60}
                pattern="[A-Za-z][A-Za-z .'-]*[A-Za-z]"
                title="Name should be 2-60 characters and can include letters, spaces, dots, hyphens, and apostrophes."
                required
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email ID *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                pattern="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
                title="Please enter a valid email (e.g., name@example.com)"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Company Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Choose Your Company *
              </label>
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.companyId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">
                  {loading ? 'Loading companies...' : 'Select your company'}
                </option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {errors.companyId && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.companyId}
                </p>
              )}
            </div>

            {/* Company ID Card Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileImage className="w-4 h-4 inline mr-2" />
                Company ID Card Upload *
              </label>
              <div className="space-y-3">
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  errors.companyIdCard ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                }`}>
                  <input
                    type="file"
                    accept=".jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="companyIdCard"
                  />
                  <label htmlFor="companyIdCard" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload your company ID card
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPEG format only, max 5MB
                    </p>
                  </label>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="ID Card Preview"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, companyIdCard: null }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              {errors.companyIdCard && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.companyIdCard}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Success Message */}
            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-600 text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Request submitted successfully! You will be notified once approved.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || submitStatus === 'success'}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                submitting || submitStatus === 'success'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transform hover:scale-105'
              } text-white shadow-lg hover:shadow-xl`}
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : submitStatus === 'success' ? (
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submitted Successfully
                </div>
              ) : (
                'Submit Request'
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JoinAsEmployeeForm;