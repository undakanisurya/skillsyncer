import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../utils/api';
import {
  User,
  GraduationCap,
  Code,
  FileText,
  Upload,
  Download,
  Eye,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Star,
  AlertCircle,
  CheckCircle,
  Loader,
  MapPin,
  Calendar,
  Target,
  Award,
  TrendingUp,
  BookOpen,
  Briefcase,
  Globe,
  Clock
} from 'lucide-react';

const JobseekerProfileManager = ({ onClose, initialData = {} }) => {
  const [activeSection, setActiveSection] = useState('view');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [atsScore, setAtsScore] = useState(0);
  const [atsSuggestions, setAtsSuggestions] = useState([]);

  // Profile data state
  const [profileData, setProfileData] = useState({
    education: [],
    skills: [],
    resumeUrl: '',
    internshipTitle: '',
    internshipType: '3 months',
    preferredLocation: '',
    readyToWorkAfterInternship: false,
    ...initialData
  });

  // Form state
  const [newSkill, setNewSkill] = useState('');
  const [newEducation, setNewEducation] = useState({
    degree: '',
    specialization: '',
    institution: '',
    year: ''
  });

  // User data (from Firebase auth)
  const [userData, setUserData] = useState({
    name: localStorage.getItem('userName') || '',
    email: localStorage.getItem('userEmail') || '',
    phone: localStorage.getItem('userPhone') || ''
  });

  // Validation state for all fields
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    phone: '',
    degree: '',
    specialization: '',
    institution: '',
    year: '',
    skill: '',
    internshipTitle: '',
    preferredLocation: '',
    resume: ''
  });

  // Validation functions
  const validateName = (name) => {
    if (!name || name.trim().length === 0) {
      return 'Full name is required';
    }
    if (name.trim().length < 2) {
      return 'Full name must be at least 2 characters long';
    }
    if (name.trim().length > 50) {
      return 'Full name must be less than 50 characters';
    }
    if (!/^[a-zA-Z\s.]+$/.test(name.trim())) {
      return 'Full name can only contain letters, spaces, and dots';
    }
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone || phone.trim().length === 0) {
      return 'Phone number is required';
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^[6789]/.test(cleanPhone)) {
      return 'Phone number must start with 6, 7, 8, or 9';
    }
    if (cleanPhone.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    if (!/^\d{10}$/.test(cleanPhone)) {
      return 'Phone number must contain only digits';
    }
    return '';
  };

  const validateDegree = (degree) => {
    if (!degree || degree.trim().length === 0) {
      return 'Degree is required';
    }
    if (degree.trim().length < 2) {
      return 'Degree must be at least 2 characters long';
    }
    if (degree.trim().length > 100) {
      return 'Degree must be less than 100 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(degree.trim())) {
      return 'Degree can only contain letters and spaces';
    }
    return '';
  };

  const validateInstitution = (institution) => {
    if (!institution || institution.trim().length === 0) {
      return 'Institution name is required';
    }
    if (institution.trim().length < 2) {
      return 'Institution name must be at least 2 characters long';
    }
    if (institution.trim().length > 200) {
      return 'Institution name must be less than 200 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(institution.trim())) {
      return 'Institution name can only contain letters and spaces';
    }
    return '';
  };

  const validateSpecialization = (specialization) => {
    if (specialization && specialization.trim().length > 0) {
      if (specialization.trim().length < 2) {
        return 'Specialization must be at least 2 characters long';
      }
      if (specialization.trim().length > 100) {
        return 'Specialization must be less than 100 characters';
      }
      if (!/^[a-zA-Z\s]+$/.test(specialization.trim())) {
        return 'Specialization can only contain letters and spaces';
      }
    }
    return '';
  };

  const validateYear = (year) => {
    if (!year || year.trim().length === 0) {
      return 'Year is required';
    }
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum)) {
      return 'Year must be a valid number';
    }
    if (yearNum < 1950) {
      return 'Year must be after 1950';
    }
    if (yearNum > currentYear + 5) {
      return 'Year cannot be more than 5 years in the future';
    }
    return '';
  };

  const validateSkill = (skill) => {
    if (!skill || skill.trim().length === 0) {
      return 'Skill name is required';
    }
    if (skill.trim().length < 2) {
      return 'Skill name must be at least 2 characters long';
    }
    if (skill.trim().length > 50) {
      return 'Skill name must be less than 50 characters';
    }
    // Check if skill starts with a number
    if (/^[0-9]/.test(skill.trim())) {
      return 'Skill name cannot start with a number';
    }
    // Allow letters, spaces, dots, slashes, plus signs, hyphens, and # symbol
    if (!/^[a-zA-Z\s.#+\-/]+$/.test(skill.trim())) {
      return 'Skill name contains invalid characters. Only letters, spaces, dots, slashes, plus signs, hyphens, and # symbol are allowed';
    }
    return '';
  };

  const validateInternshipTitle = (title) => {
    if (!title || title.trim().length === 0) {
      return 'Internship title is required';
    }
    return '';
  };

  const validatePreferredLocation = (location) => {
    if (!location || location.trim().length === 0) {
      return 'Preferred location is required';
    }
    return '';
  };

  const validateResume = (file) => {
    if (!file) {
      return 'Resume file is required';
    }
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PDF or DOC file only';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }
    return '';
  };

  // Update validation error for a specific field
  const updateValidationError = (field, error) => {
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Clear all validation errors
  const clearAllValidationErrors = () => {
    setValidationErrors({
      name: '',
      phone: '',
      degree: '',
      specialization: '',
      institution: '',
      year: '',
      skill: '',
      internshipTitle: '',
      preferredLocation: '',
      resume: ''
    });
  };

  // Check if form has any validation errors
  const hasValidationErrors = () => {
    return Object.values(validationErrors).some(error => error !== '');
  };

  // Handle field changes with validation
  const handleNameChange = (e) => {
    const name = e.target.value;
    setUserData(prev => ({ ...prev, name }));
    const error = validateName(name);
    updateValidationError('name', error);
  };

  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    setUserData(prev => ({ ...prev, phone }));
    const error = validatePhone(phone);
    updateValidationError('phone', error);
  };

  const handleDegreeChange = (e) => {
    const degree = e.target.value;
    setNewEducation(prev => ({ ...prev, degree }));
    const error = validateDegree(degree);
    updateValidationError('degree', error);
  };

  const handleInstitutionChange = (e) => {
    const institution = e.target.value;
    setNewEducation(prev => ({ ...prev, institution }));
    const error = validateInstitution(institution);
    updateValidationError('institution', error);
  };

  const handleSpecializationChange = (e) => {
    const specialization = e.target.value;
    setNewEducation(prev => ({ ...prev, specialization }));
    const error = validateSpecialization(specialization);
    updateValidationError('specialization', error);
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setNewEducation(prev => ({ ...prev, year }));
    const error = validateYear(year);
    updateValidationError('year', error);
  };

  const handleSkillChange = (e) => {
    const skill = e.target.value;
    setNewSkill(skill);
    const error = validateSkill(skill);
    updateValidationError('skill', error);
  };

  const handleInternshipTitleChange = (e) => {
    const title = e.target.value;
    setProfileData(prev => ({ ...prev, internshipTitle: title }));
    const error = validateInternshipTitle(title);
    updateValidationError('internshipTitle', error);
  };

  const handlePreferredLocationChange = (e) => {
    const location = e.target.value;
    setProfileData(prev => ({ ...prev, preferredLocation: location }));
    const error = validatePreferredLocation(location);
    updateValidationError('preferredLocation', error);
  };

  // Internship type options
  const internshipTypeOptions = [
    '15 days',
    '1 month',
    '3 months',
    '6 months',
    '1 year',
    'Full day',
    'Half day'
  ];

  // IT internship title options
  const itInternshipTitleOptions = [
    'Software Developer Intern',
    'Frontend Developer Intern',
    'Backend Developer Intern',
    'Full Stack Developer Intern',
    'Data Science Intern',
    'Machine Learning Intern',
    'AI Intern',
    'DevOps Intern',
    'Cloud Engineering Intern',
    'Cybersecurity Intern',
    'QA / Testing Intern',
    'Automation Testing Intern',
    'Mobile App Developer Intern',
    'Android Developer Intern',
    'iOS Developer Intern',
    'UI/UX Design Intern',
    'Product Management Intern',
    'Business Analyst Intern',
    'Database / SQL Intern'
  ];

  // India location options
  const indiaLocationOptions = [
    'Bengaluru',
    'Hyderabad',
    'Pune',
    'Mumbai',
    'Chennai',
    'Delhi',
    'Gurugram',
    'Noida',
    'Kolkata',
    'Ahmedabad',
    'Jaipur',
    'Coimbatore',
    'Kochi',
    'Remote'
  ];

  // Load profile data on component mount
  useEffect(() => {
    loadUserBasic();
    loadProfileData();
    loadATSScore();
  }, []);

  // Load basic user details from User collection (email is read-only in UI)
  const loadUserBasic = async () => {
    try {
      const response = await apiRequest('/api/auth/me', { method: 'GET' });
      const u = response?.data?.data?.user || response?.data?.user;
      if (response.success && u) {
        setUserData({
          name: u.name || '',
          email: u.email || '',
          phone: u.profile?.phone || ''
        });
      }
    } catch (err) {
      console.error('Failed to load user details:', err);
    }
  };

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User ID not found. Please login again.');
        return;
      }

      const response = await apiRequest(`/api/jobseeker/profile/${userId}`, { method: 'GET' });
      
      if (response.success) {
        // apiRequest returns { success, data } where data is the full backend JSON
        // Backend JSON is { success, data: profileData }
        const payload = response?.data?.data || response?.data;
        setProfileData(payload);
      } else {
        // Profile doesn't exist yet, that's okay
        console.log('Profile not found, will create new one');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadATSScore = async () => {
    try {
      const response = await apiRequest('/api/jobseeker/ats-score', { method: 'GET' });
      if (response.success) {
        const payload = response?.data?.data || response?.data;
        setAtsScore(payload.atsScore);
        setAtsSuggestions(payload.suggestions);
      }
    } catch (error) {
      console.error('Error loading ATS score:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');
      clearAllValidationErrors();

      // Comprehensive validation before saving
      const nameError = validateName(userData.name);
      const phoneError = validatePhone(userData.phone);
      const internshipTitleError = validateInternshipTitle(profileData.internshipTitle);
      const preferredLocationError = validatePreferredLocation(profileData.preferredLocation);

      // Check education entries
      let educationErrors = [];
      if (!profileData.education || profileData.education.length === 0) {
        educationErrors.push('At least one education entry is required');
      } else {
        profileData.education.forEach((edu, index) => {
          const degreeError = validateDegree(edu.degree);
          const institutionError = validateInstitution(edu.institution);
          const yearError = validateYear(edu.year);
          if (degreeError || institutionError || yearError) {
            educationErrors.push(`Education entry ${index + 1}: ${degreeError || institutionError || yearError}`);
          }
        });
      }

      // Check skills
      let skillsError = '';
      if (!profileData.skills || profileData.skills.length === 0) {
        skillsError = 'At least one skill is required';
      }

      // Update validation errors
      updateValidationError('name', nameError);
      updateValidationError('phone', phoneError);
      updateValidationError('internshipTitle', internshipTitleError);
      updateValidationError('preferredLocation', preferredLocationError);

      // Check if there are any validation errors
      if (nameError || phoneError || internshipTitleError || preferredLocationError || educationErrors.length > 0 || skillsError) {
        setError('Please fix all validation errors before saving.');
        return;
      }

      const userId = localStorage.getItem('userId');
      const endpoint = profileData._id ? 
        `/api/jobseeker/profile/${userId}` : 
        '/api/jobseeker/profile';
      
      const method = profileData._id ? 'PUT' : 'POST';

      // Build payload for JobseekerProfile document
      const payload = {
        education: profileData.education,
        skills: profileData.skills,
        internshipTitle: profileData.internshipTitle,
        internshipType: profileData.internshipType,
        preferredLocation: profileData.preferredLocation,
        readyToWorkAfterInternship: profileData.readyToWorkAfterInternship
      };

      // Also update User basic fields (name/phone) when present
      const basicUpdates = {};
      if (userData.name) basicUpdates.name = userData.name;
      if (userData.phone) {
        basicUpdates.profile = basicUpdates.profile || {};
        basicUpdates.profile = { ...basicUpdates.profile, phone: userData.phone };
      }

      // Save JobseekerProfile first
      const response = await apiRequest(endpoint, { method, body: JSON.stringify(payload) });

      if (!response.success) {
        setError((response?.data && response?.data?.message) || response.message || 'Failed to save profile');
        return;
      }

      // If there are basic updates, persist to /api/auth/profile
      if (Object.keys(basicUpdates).length > 0) {
        try {
          await apiRequest('/api/auth/profile', { method: 'PUT', body: JSON.stringify(basicUpdates) });
        } catch (_) { /* non-blocking */ }
      }

      // Backend responds with { success, data: { profile, atsScore, suggestions } }
      const respData = response?.data?.data || response?.data;
      setProfileData(respData.profile);
      setAtsScore(respData.atsScore);
      setAtsSuggestions(respData.suggestions);
      setSuccess('Profile saved successfully!');
      
      // Refresh from server for consistency
      await loadUserBasic();
      await loadProfileData();
      await loadATSScore();

      setIsEditing(false);
      
      // Update localStorage with new data
      localStorage.setItem('profileData', JSON.stringify(respData.profile));
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const fileError = validateResume(file);
    if (fileError) {
      updateValidationError('resume', fileError);
      setError(fileError);
      return;
    }

    // Clear validation error
    updateValidationError('resume', '');

    try {
      setIsUploading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('resume', file);

      const response = await apiRequest('/api/jobseeker/upload-resume', { method: 'POST', body: formData, isFormData: true });

      if (response.success) {
        const payload = response?.data?.data || response?.data;
        setProfileData(prev => ({
          ...prev,
          resumeUrl: payload.resumeUrl
        }));
        setAtsScore(payload.atsScore);
        setAtsSuggestions(payload.suggestions);
        setSuccess('Resume uploaded successfully!');
      } else {
        setError((response?.data && response?.data?.message) || response.message || 'Failed to upload resume');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      setError('Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSkill = () => {
    const skillError = validateSkill(newSkill);
    updateValidationError('skill', skillError);
    
    if (skillError) {
      setError(skillError);
      return;
    }

    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
      updateValidationError('skill', '');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleAddEducation = () => {
    const degreeError = validateDegree(newEducation.degree);
    const institutionError = validateInstitution(newEducation.institution);
    const yearError = validateYear(newEducation.year);
    const specializationError = validateSpecialization(newEducation.specialization);
    
    updateValidationError('degree', degreeError);
    updateValidationError('institution', institutionError);
    updateValidationError('year', yearError);
    updateValidationError('specialization', specializationError);
    
    if (degreeError || institutionError || yearError || specializationError) {
      setError('Please fix all education field errors before adding.');
      return;
    }

    if (newEducation.degree && newEducation.institution && newEducation.year) {
      setProfileData(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation }]
      }));
      setNewEducation({ degree: '', specialization: '', institution: '', year: '' });
      updateValidationError('degree', '');
      updateValidationError('institution', '');
      updateValidationError('year', '');
      updateValidationError('specialization', '');
    }
  };

  const handleRemoveEducation = (index) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handlePreviewResume = () => {
    if (profileData.resumeUrl) {
      window.open(profileData.resumeUrl, '_blank');
    }
  };

  const getATSScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getATSScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 flex flex-col items-center">
          <Loader className="animate-spin h-8 w-8 text-blue-600 mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Jobseeker Profile Management</h2>
              <p className="text-blue-100 mt-1">Manage your professional profile and improve your ATS score</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-4">
            <button
              onClick={() => setActiveSection('view')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === 'view'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="h-4 w-4 inline mr-2" />
              View Profile
            </button>
            <button
              onClick={() => setActiveSection('edit')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === 'edit'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Edit className="h-4 w-4 inline mr-2" />
              Edit Profile
            </button>
            <button
              onClick={() => setActiveSection('ats')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === 'ats'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="h-4 w-4 inline mr-2" />
              ATS Score
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {/* View Profile Section */}
          {activeSection === 'view' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-gray-900">{userData.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{userData.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{userData.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                  Education
                </h3>
                {profileData.education && profileData.education.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.education.map((edu, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                            {edu.specialization && (
                              <p className="text-gray-700">Specialization: {edu.specialization}</p>
                            )}
                            <p className="text-gray-600">{edu.institution}</p>
                            <p className="text-sm text-gray-500">{edu.year}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No education information added yet.</p>
                )}
              </div>

              {/* Skills */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Code className="h-5 w-5 mr-2 text-blue-600" />
                  Skills
                </h3>
                {profileData.skills && profileData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No skills added yet.</p>
                )}
              </div>

              {/* Resume */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Resume
                </h3>
                {profileData.resumeUrl ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <p className="text-gray-600">Resume uploaded successfully</p>
                      <p className="text-sm text-gray-500">Click to preview</p>
                    </div>
                    <button
                      onClick={handlePreviewResume}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No resume uploaded yet.</p>
                )}
              </div>

              {/* Internship Preferences */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Internship Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Internship Title</label>
                    <p className="text-gray-900">{profileData.internshipTitle || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Internship Type</label>
                    <p className="text-gray-900">{profileData.internshipType || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Preferred Location</label>
                    <p className="text-gray-900">{profileData.preferredLocation || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ready to Work After Internship</label>
                    <p className="text-gray-900">
                      {profileData.readyToWorkAfterInternship ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact & Location */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Contact & Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="text"
                      value={userData.phone}
                      onChange={handlePhoneChange}
                      placeholder="Your phone number (e.g., 9876543210)"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                        validationErrors.phone 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Location</label>
                    <select
                      value={profileData.preferredLocation}
                      onChange={handlePreferredLocationChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                        validationErrors.preferredLocation 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    >
                      {profileData.preferredLocation && !indiaLocationOptions.includes(profileData.preferredLocation) && (
                        <option value={profileData.preferredLocation}>{profileData.preferredLocation}</option>
                      )}
                      <option value="">Select location</option>
                      {indiaLocationOptions.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    {validationErrors.preferredLocation && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors.preferredLocation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Edit Profile Section */}
          {activeSection === 'edit' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Basic Info (no email editing) */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={userData.name}
                      onChange={handleNameChange}
                      placeholder="Your full name"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                        validationErrors.name 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email (read-only)</label>
                    <input
                      type="email"
                      value={userData.email}
                      disabled
                      className="w-full border border-gray-200 bg-gray-100 text-gray-600 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="text"
                      value={userData.phone}
                      onChange={handlePhoneChange}
                      placeholder="Your phone number (e.g., 9876543210)"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                        validationErrors.phone 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-blue-600" />
                  Upload Resume
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {isUploading && <Loader className="animate-spin h-5 w-5 text-blue-600" />}
                    </div>
                    {validationErrors.resume && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors.resume}
                      </p>
                    )}
                  </div>
                  {profileData.resumeUrl && (
                    <div className="flex items-center space-x-4">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700">Resume uploaded successfully</span>
                      <button
                        onClick={handlePreviewResume}
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        Preview
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                  Education
                </h3>
                <div className="space-y-4">
                  {profileData.education && profileData.education.length > 0 && (
                    <div className="space-y-3">
                      {profileData.education.map((edu, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                            {edu.specialization && (
                              <p className="text-gray-700">Specialization: {edu.specialization}</p>
                            )}
                            <p className="text-gray-600">{edu.institution}</p>
                            <p className="text-sm text-gray-500">{edu.year}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveEducation(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-medium text-gray-900 mb-3">Add New Education</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Degree"
                          value={newEducation.degree}
                          onChange={handleDegreeChange}
                          className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 w-full ${
                            validationErrors.degree 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />
                        {validationErrors.degree && (
                          <p className="mt-1 text-xs text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {validationErrors.degree}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Specialization"
                          value={newEducation.specialization}
                          onChange={handleSpecializationChange}
                          className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 w-full ${
                            validationErrors.specialization 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />
                        {validationErrors.specialization && (
                          <p className="mt-1 text-xs text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {validationErrors.specialization}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Institution"
                          value={newEducation.institution}
                          onChange={handleInstitutionChange}
                          className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 w-full ${
                            validationErrors.institution 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />
                        {validationErrors.institution && (
                          <p className="mt-1 text-xs text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {validationErrors.institution}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Year"
                          value={newEducation.year}
                          onChange={handleYearChange}
                          className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 w-full ${
                            validationErrors.year 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />
                        {validationErrors.year && (
                          <p className="mt-1 text-xs text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {validationErrors.year}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleAddEducation}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </button>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Code className="h-5 w-5 mr-2 text-blue-600" />
                  Skills
                </h3>
                <div className="space-y-4">
                  {profileData.skills && profileData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                        >
                          {skill}
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add a skill"
                        value={newSkill}
                        onChange={handleSkillChange}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                        className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                          validationErrors.skill 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      <button
                        onClick={handleAddSkill}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </button>
                    </div>
                    {validationErrors.skill && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors.skill}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Internship Preferences */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Internship Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Internship Title
                    </label>
                    <select
                      value={profileData.internshipTitle}
                      onChange={handleInternshipTitleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                        validationErrors.internshipTitle 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    >
                      {profileData.internshipTitle && !itInternshipTitleOptions.includes(profileData.internshipTitle) && (
                        <option value={profileData.internshipTitle}>{profileData.internshipTitle}</option>
                      )}
                      <option value="">Select IT internship title</option>
                      {itInternshipTitleOptions.map(title => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    {validationErrors.internshipTitle && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors.internshipTitle}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Internship Type
                    </label>
                    <select
                      value={profileData.internshipType}
                      onChange={(e) => setProfileData(prev => ({ ...prev, internshipType: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {internshipTypeOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Location
                    </label>
                    <select
                      value={profileData.preferredLocation}
                      onChange={handlePreferredLocationChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                        validationErrors.preferredLocation 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    >
                      {profileData.preferredLocation && !indiaLocationOptions.includes(profileData.preferredLocation) && (
                        <option value={profileData.preferredLocation}>{profileData.preferredLocation}</option>
                      )}
                      <option value="">Select location</option>
                      {indiaLocationOptions.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    {validationErrors.preferredLocation && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors.preferredLocation}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="readyToWork"
                      checked={profileData.readyToWorkAfterInternship}
                      onChange={(e) => setProfileData(prev => ({ ...prev, readyToWorkAfterInternship: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="readyToWork" className="ml-2 block text-sm text-gray-900">
                      Ready to work after internship
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions: View and Save on the same row */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setActiveSection('view')}
                  className="h-10 w-10 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                  aria-label="View"
                  title="View"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ATS Score Section */}
          {activeSection === 'ats' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* ATS Score Display */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Your ATS Score
                </h3>
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getATSScoreColor(atsScore)} mb-2`}>
                    {atsScore}
                  </div>
                  <div className={`text-xl font-medium ${getATSScoreColor(atsScore)} mb-4`}>
                    {getATSScoreLabel(atsScore)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        atsScore >= 80 ? 'bg-green-500' :
                        atsScore >= 60 ? 'bg-yellow-500' :
                        atsScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${atsScore}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Your ATS score indicates how well your profile matches with Applicant Tracking Systems used by employers.
                  </p>
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-600" />
                  Improvement Suggestions
                </h3>
                {atsSuggestions.length > 0 ? (
                  <div className="space-y-3">
                    {atsSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 ${
                          suggestion.priority === 'high'
                            ? 'bg-red-50 border-red-400'
                            : 'bg-yellow-50 border-yellow-400'
                        }`}
                      >
                        <div className="flex items-start">
                          <AlertCircle className={`h-5 w-5 mr-3 mt-0.5 ${
                            suggestion.priority === 'high' ? 'text-red-500' : 'text-yellow-500'
                          }`} />
                          <div>
                            <p className={`font-medium ${
                              suggestion.priority === 'high' ? 'text-red-800' : 'text-yellow-800'
                            }`}>
                              {suggestion.message}
                            </p>
                            <p className={`text-sm mt-1 ${
                              suggestion.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              Priority: {suggestion.priority}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-green-700 font-medium">Great job! Your profile is well-optimized.</p>
                    <p className="text-gray-600 mt-2">Keep maintaining your profile to stay competitive.</p>
                  </div>
                )}
              </div>

              {/* Score Breakdown */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Score Breakdown
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Skills (30 points)</span>
                    <span className="font-medium">
                      {Math.min(30, (profileData.skills?.length || 0) * 5)}/30
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Education (25 points)</span>
                    <span className="font-medium">
                      {Math.min(25, (profileData.education?.length || 0) * 8)}/25
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Resume (25 points)</span>
                    <span className="font-medium">
                      {profileData.resumeUrl ? 25 : 0}/25
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Internship Details (20 points)</span>
                    <span className="font-medium">
                      {(profileData.internshipTitle ? 10 : 0) + 
                       (profileData.internshipType ? 5 : 0) + 
                       (profileData.preferredLocation ? 5 : 0)}/20
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default JobseekerProfileManager;
