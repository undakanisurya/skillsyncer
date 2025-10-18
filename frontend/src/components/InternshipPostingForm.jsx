import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Award, 
  CheckCircle,
  AlertCircle,
  Building,
  Globe,
  Smartphone,
  Mail,
  DollarSign
} from 'lucide-react';
import { employerApi } from '../utils/api';

const InternshipPostingForm = ({ onSuccess, onCancel, editData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    industry: 'IT/Technology',
    location: '',
    mode: 'Offline',
    startDate: '',
    lastDateToApply: '',
    duration: '3 months',
    totalSeats: 1,
    description: '',
    skillsRequired: [],
    certifications: [],
    eligibility: '',
    stipend: {
      amount: 0,
      currency: 'INR',
      type: 'Fixed'
    },
    benefits: []
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [internshipTitles, setInternshipTitles] = useState([]);
  const [indiaLocations, setIndiaLocations] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // Industry-based internship titles mapping
  const industryTitles = {
    'IT/Technology': [
      'Software Developer',
      'Frontend Developer',
      'Backend Developer',
      'Mobile App Developer',
      'React Developer',
      'Node.js Developer',
      'Python Developer',
      'Java Developer',
      'DevOps Engineer',
      'Data Scientist',
      'Machine Learning Engineer',
      'AI/ML Engineer',
      'Cloud Engineer',
      'Cybersecurity Analyst',
      'UI/UX Designer',
      'Product Manager',
      'Quality Assurance Engineer',
      'Database Administrator',
      'System Administrator',
      'Network Engineer',
      'Blockchain Developer',
      'Game Developer',
      'IoT Developer',
      'Embedded Systems Engineer'
    ],
    'Banking': [
      'Investment Banking Analyst',
      'Commercial Banking Officer',
      'Retail Banking Specialist',
      'Risk Management Analyst',
      'Financial Analyst',
      'Credit Analyst',
      'Treasury Analyst',
      'Compliance Officer',
      'Audit Associate',
      'Operations Analyst',
      'Digital Banking Specialist',
      'Fintech Developer',
      'Wealth Management Advisor',
      'Insurance Underwriter',
      'Corporate Finance Analyst',
      'Business Analyst',
      'Data Analyst',
      'Customer Service Representative',
      'Marketing Specialist',
      'HR Coordinator'
    ],
    
    'Education': [
      'Teaching Assistant',
      'Curriculum Developer',
      'Educational Technology Specialist',
      'Student Affairs Coordinator',
      'Research Assistant',
      'Administrative Assistant',
      'Library Assistant',
      'Special Education Aide',
      'Counseling Assistant',
      'Assessment Coordinator',
      'Content Writer',
      'Instructional Designer',
      'Academic Advisor',
      'Admissions Counselor',
      'Career Services Coordinator'
    ],
   
    'Other': [
      'General Assistant',
       'HR Assistant',
    ]
  };

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        console.log('Loading dropdown data...');
        setDebugInfo('Starting to load dropdown data...');
        
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          setDebugInfo('No token found in localStorage. User needs to login.');
          setLoadingDropdowns(false);
          return;
        }
        
        setDebugInfo('Token found, making API calls...');
        
        const [titlesResponse, locationsResponse] = await Promise.all([
          employerApi.getInternshipTitles(),
          employerApi.getIndiaLocations()
        ]);

        console.log('Titles response:', titlesResponse);
        console.log('Locations response:', locationsResponse);
        console.log('Titles response data:', titlesResponse.data);
        console.log('Locations response data:', locationsResponse.data);
        setDebugInfo(`API responses received. Titles: ${titlesResponse.success}, Locations: ${locationsResponse.success}. Titles data: ${JSON.stringify(titlesResponse.data).substring(0, 100)}...`);

                 if (titlesResponse.success && Array.isArray(titlesResponse.data) && titlesResponse.data.length > 0) {
           const titlesData = titlesResponse.data;
           console.log('Titles data type:', typeof titlesData);
           console.log('Titles data:', titlesData);
           console.log('Is array:', Array.isArray(titlesData));
           
           setInternshipTitles(titlesData);
           console.log('Internship titles loaded from API:', titlesData.length);
         } else {
           setDebugInfo(`Using local industry titles for: ${formData.industry}`);
           // Use local industry-specific titles
           const localTitles = industryTitles[formData.industry] || industryTitles['IT/Technology'];
           setInternshipTitles(localTitles);
           console.log('Using local titles for industry:', formData.industry, localTitles.length);
         }

                 if (locationsResponse.success && Array.isArray(locationsResponse.data) && locationsResponse.data.length > 0) {
           const locationsData = locationsResponse.data;
           console.log('Locations data type:', typeof locationsData);
           console.log('Locations data:', locationsData);
           console.log('Is array:', Array.isArray(locationsData));
           
           setIndiaLocations(locationsData);
           console.log('India locations loaded from API:', locationsData.length);
         } else {
           setDebugInfo('Using local locations data');
           // Fallback to default locations including Kerala
           const defaultLocations = [
             'Mumbai, Maharashtra',
             'Delhi, Delhi',
             'Bangalore, Karnataka',
             'Hyderabad, Telangana',
             'Chennai, Tamil Nadu',
             'Kolkata, West Bengal',
             'Pune, Maharashtra',
             'Ahmedabad, Gujarat',
             'Jaipur, Rajasthan',
             'Surat, Gujarat',
             'Lucknow, Uttar Pradesh',
             'Kanpur, Uttar Pradesh',
             'Nagpur, Maharashtra',
             'Indore, Madhya Pradesh',
             'Thane, Maharashtra',
             'Kochi, Kerala',
             'Thiruvananthapuram, Kerala',
             'Kozhikode, Kerala',
             'Thrissur, Kerala',
             'Kollam, Kerala'
           ];
           setIndiaLocations(defaultLocations);
           console.log('Using local locations:', defaultLocations.length);
         }
      } catch (error) {
        console.error('Error loading dropdown data:', error);
        setDebugInfo(`Error loading dropdown data: ${error.message}`);
        // Set empty arrays on error to prevent crashes
        setInternshipTitles([]);
        setIndiaLocations([]);
             } finally {
         setLoadingDropdowns(false);
       }
    };

    loadDropdownData();
  }, []);

  // Load edit data if provided
  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        startDate: editData.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : '',
        lastDateToApply: editData.lastDateToApply ? new Date(editData.lastDateToApply).toISOString().split('T')[0] : ''
      });
    }
  }, [editData]);

  // Update internship titles when industry changes
  useEffect(() => {
    if (formData.industry && industryTitles[formData.industry]) {
      console.log('Updating titles for industry:', formData.industry);
      const titlesForIndustry = industryTitles[formData.industry];
      setInternshipTitles(titlesForIndustry);
      console.log('Updated titles for industry:', formData.industry, titlesForIndustry.length);
      
      // Clear the selected title if it's not available in the new industry
      if (formData.title && !titlesForIndustry.includes(formData.title)) {
        setFormData(prev => ({ ...prev, title: '' }));
      }
    }
  }, [formData.industry]);

  const validateForm = () => {
    const newErrors = {};

    // Required text/select fields
    if (!formData.title) newErrors.title = 'Internship title is required';
    if (!formData.industry) newErrors.industry = 'Industry is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.mode) newErrors.mode = 'Mode is required';
    if (!['Online', 'Offline', 'Hybrid'].includes(formData.mode)) newErrors.mode = 'Mode must be Online, Offline, or Hybrid';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.lastDateToApply) newErrors.lastDateToApply = 'Last date to apply is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (formData.skillsRequired.length === 0) newErrors.skillsRequired = 'At least one skill is required';
    if (!formData.eligibility) newErrors.eligibility = 'Eligibility criteria is required';
    if (formData.totalSeats < 1) newErrors.totalSeats = 'At least 1 seat must be available';
    if (formData.totalSeats > 60) newErrors.totalSeats = 'Cannot exceed 60 seats';

    // Date validation
    if (formData.startDate && formData.lastDateToApply) {
      const startDate = new Date(formData.startDate);
      const lastDate = new Date(formData.lastDateToApply);
      const today = new Date();

      if (lastDate <= today) {
        newErrors.lastDateToApply = 'Last date to apply must be in the future';
      }

      if (startDate <= lastDate) {
        newErrors.startDate = 'Start date must be after last date to apply';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({}); // Clear any previous errors
    try {
      const response = editData 
        ? await employerApi.updateInternship(editData._id, formData)
        : await employerApi.createInternship(formData);

      if (response.success && (response.data.success || response.data.message)) {
        // Show success state briefly
        setSuccess(true);
        
        // Wait a moment to show success, then call onSuccess
        setTimeout(() => {
          onSuccess(response.data.data || response.data);
        }, 1500);
      } else {
        setErrors({ submit: response.data?.message || response.message || 'Failed to save internship posting' });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An error occurred while saving' });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skillsRequired.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(skill => skill !== skillToRemove)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (certToRemove) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert !== certToRemove)
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefitToRemove) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(benefit => benefit !== benefitToRemove)
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleStipendChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      stipend: {
        ...prev.stipend,
        [field]: value
      }
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {editData ? 'Edit Internship Posting' : 'Create New Internship Posting'}
          </h2>
          <p className="text-gray-600">
            {editData ? 'Update your internship posting details' : 'Fill in the details to create a new internship posting'}
          </p>
        </div>
        <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <Plus className="h-8 w-8 text-white" />
        </div>
      </div>

             {/* Debug Info */}
       {/* {debugInfo && (
         <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
           <p className="text-sm text-yellow-800">
             <strong>Debug Info:</strong> {debugInfo}
           </p>
           <p className="text-sm text-yellow-800 mt-2">
             <strong>Current State:</strong> Loading: {loadingDropdowns ? 'Yes' : 'No'}, 
             Titles: {Array.isArray(internshipTitles) ? `${internshipTitles.length} items` : 'Not array'}, 
             Locations: {Array.isArray(indiaLocations) ? `${indiaLocations.length} items` : 'Not array'}
           </p>
         </div>
       )} */}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Industry *
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                errors.industry ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="IT/Technology">IT/Technology</option>
              <option value="Banking">Banking</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Internship Title *
            </label>
            <select
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={loadingDropdowns}
              className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } ${loadingDropdowns ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {loadingDropdowns ? 'Loading titles...' : 'Select an internship title'}
              </option>
              {Array.isArray(internshipTitles) && internshipTitles.map((title, index) => (
                <option key={index} value={title}>{title}</option>
              ))}
              {/* Debug info */}
              {!loadingDropdowns && Array.isArray(internshipTitles) && internshipTitles.length === 0 && (
                <option value="" disabled>No titles available (Debug: Array is empty)</option>
              )}
              {!loadingDropdowns && !Array.isArray(internshipTitles) && (
                <option value="" disabled>No titles available (Debug: Not an array)</option>
              )}
            </select>
            {errors.title && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.title}
              </p>
            )}
          </div>
        </div>

        {/* Location and Mode */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Location *
            </label>
            <select
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              disabled={loadingDropdowns}
              className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              } ${loadingDropdowns ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {loadingDropdowns ? 'Loading locations...' : 'Select a location'}
              </option>
              {Array.isArray(indiaLocations) && indiaLocations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
              {/* Debug info */}
              {!loadingDropdowns && Array.isArray(indiaLocations) && indiaLocations.length === 0 && (
                <option value="" disabled>No locations available (Debug: Array is empty)</option>
              )}
              {!loadingDropdowns && !Array.isArray(indiaLocations) && (
                <option value="" disabled>No locations available (Debug: Not an array)</option>
              )}
            </select>
            {errors.location && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.location}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Mode *
            </label>
            <select
              value={formData.mode}
              onChange={(e) => handleInputChange('mode', e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                errors.mode ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            {errors.mode && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.mode}
              </p>
            )}
          </div>
        </div>

        {/* Dates and Duration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.startDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Last Date to Apply *
            </label>
            <input
              type="date"
              value={formData.lastDateToApply}
              onChange={(e) => handleInputChange('lastDateToApply', e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                errors.lastDateToApply ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.lastDateToApply && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.lastDateToApply}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Duration *
            </label>
            <select
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                errors.duration ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="15 days">15 days</option>
              <option value="1 month">1 month</option>
              <option value="3 months">3 months</option>
              <option value="6 months">6 months</option>
              <option value="1 year">1 year</option>
              <option value="Full day">Full day</option>
              <option value="Half day">Half day</option>
            </select>
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.duration}
              </p>
            )}
          </div>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Total Available Seats *
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={formData.totalSeats}
            onChange={(e) => handleInputChange('totalSeats', parseInt(e.target.value))}
            className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
              errors.totalSeats ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter number of seats (max 60)"
          />
          {errors.totalSeats && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.totalSeats}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            About Internship Description *
          </label>
          <textarea
            rows="6"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe the internship, responsibilities, learning opportunities, and what interns will gain from this experience..."
            maxLength={2000}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {formData.description.length}/2000 characters
            </span>
            {errors.description && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Skills Required */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Skills Required *
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Add a skill (e.g., JavaScript, React, Python)"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {formData.skillsRequired.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.skillsRequired.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {errors.skillsRequired && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.skillsRequired}
            </p>
          )}
        </div>

        {/* Certifications */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Certifications That Can Be Earned
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Add a certification (e.g., AWS Certified Developer, Google Cloud Professional)"
            />
            <button
              type="button"
              onClick={addCertification}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {formData.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.certifications.map((cert, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium"
                >
                  <Award className="w-4 h-4" />
                  {cert}
                  <button
                    type="button"
                    onClick={() => removeCertification(cert)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Eligibility */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Eligibility (Who Can Apply) *
          </label>
          <textarea
            rows="4"
            value={formData.eligibility}
            onChange={(e) => handleInputChange('eligibility', e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none ${
              errors.eligibility ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe who is eligible to apply (e.g., students in 3rd/4th year, recent graduates, specific degree requirements, etc.)"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {formData.eligibility.length}/1000 characters
            </span>
            {errors.eligibility && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.eligibility}
              </p>
            )}
          </div>
        </div>

        {/* Stipend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Stipend Amount (INR)
            </label>
            <input
              type="number"
              min="0"
              value={formData.stipend.amount}
              onChange={(e) => handleStipendChange('amount', parseInt(e.target.value) || 0)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Stipend Type
            </label>
            <select
              value={formData.stipend.type}
              onChange={(e) => handleStipendChange('type', e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="Fixed">Fixed</option>
              <option value="Performance-based">Performance-based</option>
              <option value="Negotiable">Negotiable</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Currency
            </label>
            <select
              value={formData.stipend.currency}
              onChange={(e) => handleStipendChange('currency', e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Benefits & Perks
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Add a benefit (e.g., Certificate, Letter of Recommendation, Job Offer)"
            />
            <button
              type="button"
              onClick={addBenefit}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {formData.benefits.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  {benefit}
                  <button
                    type="button"
                    onClick={() => removeBenefit(benefit)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4"
          >
            <p className="text-green-600 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {editData ? 'Internship updated successfully!' : 'Internship posted successfully!'}
            </p>
          </motion.div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {errors.submit}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <motion.button
            type="submit"
            disabled={loading || success}
            whileHover={{ scale: success ? 1 : 1.02 }}
            whileTap={{ scale: success ? 1 : 0.98 }}
            className={`flex-1 py-4 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed ${
              success 
                ? 'bg-green-500 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50'
            }`}
          >
            {success ? (
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                {editData ? 'Updated Successfully!' : 'Posted Successfully!'}
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {editData ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                {editData ? 'Update Internship' : 'Create Internship'}
              </div>
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
          >
            Cancel
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default InternshipPostingForm;
