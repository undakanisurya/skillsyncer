import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Code, 
  FileText, 
  Award, 
  CheckCircle, 
  AlertCircle,
  Loader,
  Save,
  Send
} from 'lucide-react';
import { jobseekerApi } from '../utils/api';

const InternshipApplicationForm = ({ internship, isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});


  const [formData, setFormData] = useState({
    // Personal Details
    personalDetails: {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      contactNumber: '',
      emailAddress: '',
      linkedinProfile: '',
      githubPortfolio: ''
    },
    // Education Details
    educationDetails: {
      highestQualification: '',
      institutionName: '',
      yearOfGraduation: '',
      cgpaPercentage: ''
    },
    // Work Experience
    workExperience: {
      totalYearsExperience: 0,
      currentLastCompany: '',
      currentLastDesignation: '',
      relevantExperienceDescription: ''
    },
    // Skills
    skills: {
      technicalSkills: [],
      softSkills: []
    },
    // Projects
    projects: [
      {
        projectName: '',
        role: '',
        duration: '',
        technologiesUsed: [],
        description: ''
      }
    ],
    // Additional Information
    additionalInfo: {
      whyJoinInternship: '',
      achievementsCertifications: '',
      resumeUrl: '',
      portfolioUrl: ''
    },
    // Declarations
    declarations: {
      informationTruthful: false,
      consentToShare: false
    }
  });

  const [techSkillInput, setTechSkillInput] = useState('');
  const [softSkillInput, setSoftSkillInput] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [projectTechInput, setProjectTechInput] = useState({});

  const totalSteps = 7;

  // Load user profile data on component mount
  useEffect(() => {
    if (isOpen) {
      loadUserProfile();
    }
  }, [isOpen]);

  const loadUserProfile = async () => {
    try {
      const response = await jobseekerApi.getProfile();
      if (response.success && response.data.success) {
        const user = response.data.data.user;
        
        // Pre-fill form with user profile data
        setFormData(prev => ({
          ...prev,
          personalDetails: {
            ...prev.personalDetails,
            fullName: user.name || '',
            emailAddress: user.email || '',
            contactNumber: user.profile?.phone || '',
            linkedinProfile: user.profile?.socialLinks?.linkedin || '',
            githubPortfolio: user.profile?.socialLinks?.github || ''
          },
          educationDetails: {
            ...prev.educationDetails,
            ...(user.profile?.education?.[0] && {
              highestQualification: user.profile.education[0].degree || '',
              institutionName: user.profile.education[0].institution || '',
              yearOfGraduation: user.profile.education[0].graduationYear || '',
              cgpaPercentage: user.profile.education[0].gpa || ''
            })
          },
          workExperience: {
            ...prev.workExperience,
            ...(user.profile?.workExperience?.[0] && {
              totalYearsExperience: user.profile.experience || 0,
              currentLastCompany: user.profile.workExperience[0].company || '',
              currentLastDesignation: user.profile.workExperience[0].position || '',
              relevantExperienceDescription: user.profile.workExperience[0].description || ''
            })
          },
          skills: {
            technicalSkills: user.profile?.skills || [],
            softSkills: []
          },
          additionalInfo: {
            ...prev.additionalInfo,
            // Prefer resume from extended JobseekerProfile if available
            resumeUrl: (response.data?.data?.resumeUrl) || user.profile?.resume || '',
            portfolioUrl: user.profile?.portfolio || ''
          }
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error for this field
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const handleProjectChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }));
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          projectName: '',
          role: '',
          duration: '',
          technologiesUsed: [],
          description: ''
        }
      ]
    }));
  };

  const removeProject = (index) => {
    if (formData.projects.length > 1) {
      setFormData(prev => ({
        ...prev,
        projects: prev.projects.filter((_, i) => i !== index)
      }));
    }
  };

  const addTechnicalSkill = () => {
    if (techSkillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          technicalSkills: [...prev.skills.technicalSkills, techSkillInput.trim()]
        }
      }));
      setTechSkillInput('');
    }
  };

  const removeTechnicalSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        technicalSkills: prev.skills.technicalSkills.filter((_, i) => i !== index)
      }
    }));
  };

  const addSoftSkill = () => {
    if (softSkillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          softSkills: [...prev.skills.softSkills, softSkillInput.trim()]
        }
      }));
      setSoftSkillInput('');
    }
  };

  const removeSoftSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        softSkills: prev.skills.softSkills.filter((_, i) => i !== index)
      }
    }));
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, resumeUpload: 'Please upload a PDF, DOC, or DOCX file' }));
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, resumeUpload: 'File size must be less than 5MB' }));
      return;
    }

    setUploadingResume(true);
    setErrors(prev => ({ ...prev, resumeUpload: '' }));

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await jobseekerApi.uploadResume(formData);
      
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          additionalInfo: {
            ...prev.additionalInfo,
            // API returns nested data: { success, data: { resumeUrl } }
            resumeUrl: response.data?.data?.resumeUrl || ''
          }
        }));
        setResumeFile(file);
        setErrors(prev => ({ ...prev, resumeUpload: '' }));
      } else {
        setErrors(prev => ({ ...prev, resumeUpload: response.message || 'Failed to upload resume' }));
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      setErrors(prev => ({ ...prev, resumeUpload: 'Failed to upload resume. Please try again.' }));
    } finally {
      setUploadingResume(false);
    }
  };

  const addProjectTechnology = (projectIndex) => {
    const input = projectTechInput[projectIndex];
    if (input && input.trim()) {
      setFormData(prev => ({
        ...prev,
        projects: prev.projects.map((project, i) => 
          i === projectIndex 
            ? { ...project, technologiesUsed: [...project.technologiesUsed, input.trim()] }
            : project
        )
      }));
      setProjectTechInput(prev => ({ ...prev, [projectIndex]: '' }));
    }
  };

  const removeProjectTechnology = (projectIndex, techIndex) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === projectIndex 
          ? { ...project, technologiesUsed: project.technologiesUsed.filter((_, ti) => ti !== techIndex) }
          : project
      )
    }));
  };

  // Phone validation function for Indian mobile numbers
  const validateIndianPhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if phone number starts with 6, 7, 8, or 9
    if (!/^[6789]/.test(cleanPhone)) {
      return 'Phone number must start with 6, 7, 8, or 9';
    }
    
    // Check if phone number is exactly 10 digits
    if (cleanPhone.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    
    // Check if all characters are digits
    if (!/^\d{10}$/.test(cleanPhone)) {
      return 'Phone number must contain only digits';
    }
    
    return ''; // No error
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Personal Details
        if (!(formData.personalDetails.fullName || '').trim()) {
          newErrors['personalDetails.fullName'] = 'Full name is required';
        }
        if (!formData.personalDetails.dateOfBirth) {
          newErrors['personalDetails.dateOfBirth'] = 'Date of birth is required';
        }
        if (!formData.personalDetails.gender) {
          newErrors['personalDetails.gender'] = 'Gender is required';
        }
        if (!(formData.personalDetails.contactNumber || '').trim()) {
          newErrors['personalDetails.contactNumber'] = 'Contact number is required';
        } else {
          // Validate phone number format if provided
          const phoneValidationError = validateIndianPhoneNumber(formData.personalDetails.contactNumber);
          if (phoneValidationError) {
            newErrors['personalDetails.contactNumber'] = phoneValidationError;
          }
        }
        if (!(formData.personalDetails.emailAddress || '').trim()) {
          newErrors['personalDetails.emailAddress'] = 'Email address is required';
        }
        break;

      case 2: // Education Details
        if (!(formData.educationDetails.highestQualification || '').trim()) {
          newErrors['educationDetails.highestQualification'] = 'Highest qualification is required';
        }
        if (!(formData.educationDetails.institutionName || '').trim()) {
          newErrors['educationDetails.institutionName'] = 'Institution name is required';
        }
        if (!formData.educationDetails.yearOfGraduation) {
          newErrors['educationDetails.yearOfGraduation'] = 'Year of graduation is required';
        }
        if (!(formData.educationDetails.cgpaPercentage || '').trim()) {
          newErrors['educationDetails.cgpaPercentage'] = 'CGPA/Percentage is required';
        }
        break;

      case 4: // Skills
        if (formData.skills.technicalSkills.length === 0) {
          newErrors['skills.technicalSkills'] = 'At least one technical skill is required';
        }
        break;

      case 6: // Additional Information
        if (!(formData.additionalInfo.whyJoinInternship || '').trim()) {
          newErrors['additionalInfo.whyJoinInternship'] = 'Please explain why you want to join this internship';
        }
        if (!(formData.additionalInfo.resumeUrl || '').trim()) {
          newErrors['additionalInfo.resumeUrl'] = 'Resume is required';
        }
        break;

      case 7: // Declarations
        if (!formData.declarations.informationTruthful) {
          newErrors['declarations.informationTruthful'] = 'You must declare that the information is truthful';
        }
        if (!formData.declarations.consentToShare) {
          newErrors['declarations.consentToShare'] = 'You must consent to share information with the company';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    try {
      // Normalize eligibility to schema enum
      const allowedEligibility = ['Freshers Only', 'Experienced Only', 'Both'];
      const normalizedEligibility = allowedEligibility.includes(internship.eligibility) ? internship.eligibility : 'Both';

      const applicationData = {
        ...formData,
        internshipDetails: {
          title: internship.title,
          type: internship.stipend?.type === 'Unpaid' ? 'Unpaid' : 'Paid',
          duration: internship.duration,
          startDate: internship.startDate,
          workMode: internship.mode === 'Online' ? 'online' : internship.mode === 'Offline' ? 'Onsite' : internship.mode,
          eligibility: normalizedEligibility
        }
      };

      const response = await jobseekerApi.applyForInternshipDetailed(internship._id, applicationData);
      
      if (response && response.success) {
        onSuccess?.();
        onClose();
      } else {
        const errorMessage = response?.data?.message || response?.message || 'Failed to submit application';
        const validation = response?.data?.errors;
        console.error('Application submission failed:', errorMessage, validation || response);
        setErrors({ submit: validation ? `${errorMessage}: ${validation.join(', ')}` : errorMessage });
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      let errorMessage = 'Failed to submit application. Please try again.';
      
      // Handle specific error types
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <h3 className="text-xl font-semibold text-gray-900">Personal Details</h3>
              <p className="text-gray-600">Tell us about yourself</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.personalDetails.fullName}
                  onChange={(e) => handleInputChange('personalDetails', 'fullName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['personalDetails.fullName'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors['personalDetails.fullName'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['personalDetails.fullName']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.personalDetails.dateOfBirth}
                  onChange={(e) => handleInputChange('personalDetails', 'dateOfBirth', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['personalDetails.dateOfBirth'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors['personalDetails.dateOfBirth'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['personalDetails.dateOfBirth']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  value={formData.personalDetails.gender}
                  onChange={(e) => handleInputChange('personalDetails', 'gender', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['personalDetails.gender'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors['personalDetails.gender'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['personalDetails.gender']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  value={formData.personalDetails.contactNumber}
                  onChange={(e) => handleInputChange('personalDetails', 'contactNumber', e.target.value)}
                  placeholder="Enter 10-digit mobile number (e.g., 9876543210)"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['personalDetails.contactNumber'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors['personalDetails.contactNumber'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['personalDetails.contactNumber']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.personalDetails.emailAddress}
                  onChange={(e) => handleInputChange('personalDetails', 'emailAddress', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['personalDetails.emailAddress'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors['personalDetails.emailAddress'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['personalDetails.emailAddress']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={formData.personalDetails.linkedinProfile}
                  onChange={(e) => handleInputChange('personalDetails', 'linkedinProfile', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub / Portfolio
                </label>
                <input
                  type="url"
                  value={formData.personalDetails.githubPortfolio}
                  onChange={(e) => handleInputChange('personalDetails', 'githubPortfolio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://github.com/yourusername"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <GraduationCap className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h3 className="text-xl font-semibold text-gray-900">Education Details</h3>
              <p className="text-gray-600">Your educational background</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Highest Qualification *
                </label>
                <input
                  type="text"
                  value={formData.educationDetails.highestQualification}
                  onChange={(e) => handleInputChange('educationDetails', 'highestQualification', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['educationDetails.highestQualification'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Bachelor's in Computer Science"
                />
                {errors['educationDetails.highestQualification'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['educationDetails.highestQualification']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution / University Name *
                </label>
                <input
                  type="text"
                  value={formData.educationDetails.institutionName}
                  onChange={(e) => handleInputChange('educationDetails', 'institutionName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['educationDetails.institutionName'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your institution name"
                />
                {errors['educationDetails.institutionName'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['educationDetails.institutionName']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Graduation *
                </label>
                <input
                  type="number"
                  min="1950"
                  max={new Date().getFullYear() + 10}
                  value={formData.educationDetails.yearOfGraduation}
                  onChange={(e) => handleInputChange('educationDetails', 'yearOfGraduation', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['educationDetails.yearOfGraduation'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 2024"
                />
                {errors['educationDetails.yearOfGraduation'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['educationDetails.yearOfGraduation']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CGPA / Percentage *
                </label>
                <input
                  type="text"
                  value={formData.educationDetails.cgpaPercentage}
                  onChange={(e) => handleInputChange('educationDetails', 'cgpaPercentage', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['educationDetails.cgpaPercentage'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 8.5 CGPA or 85%"
                />
                {errors['educationDetails.cgpaPercentage'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['educationDetails.cgpaPercentage']}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Briefcase className="w-12 h-12 text-purple-500 mx-auto mb-2" />
              <h3 className="text-xl font-semibold text-gray-900">Work Experience</h3>
              <p className="text-gray-600">Your professional experience (if any)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.workExperience.totalYearsExperience}
                  onChange={(e) => handleInputChange('workExperience', 'totalYearsExperience', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current / Last Company
                </label>
                <input
                  type="text"
                  value={formData.workExperience.currentLastCompany}
                  onChange={(e) => handleInputChange('workExperience', 'currentLastCompany', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter company name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current / Last Designation
                </label>
                <input
                  type="text"
                  value={formData.workExperience.currentLastDesignation}
                  onChange={(e) => handleInputChange('workExperience', 'currentLastDesignation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your designation"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relevant Experience Description
                </label>
                <textarea
                  rows="4"
                  value={formData.workExperience.relevantExperienceDescription}
                  onChange={(e) => handleInputChange('workExperience', 'relevantExperienceDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your relevant work experience..."
                  maxLength="1000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.workExperience.relevantExperienceDescription.length}/1000 characters
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Code className="w-12 h-12 text-indigo-500 mx-auto mb-2" />
              <h3 className="text-xl font-semibold text-gray-900">Skills</h3>
              <p className="text-gray-600">Your technical and soft skills</p>
            </div>

            <div className="space-y-6">
              {/* Technical Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technical Skills *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={techSkillInput}
                    onChange={(e) => setTechSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnicalSkill())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter a technical skill and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTechnicalSkill}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.technicalSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeTechnicalSkill(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {errors['skills.technicalSkills'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['skills.technicalSkills']}</p>
                )}
              </div>

              {/* Soft Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soft Skills (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={softSkillInput}
                    onChange={(e) => setSoftSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSoftSkill())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter a soft skill and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addSoftSkill}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.softSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSoftSkill(index)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-orange-500 mx-auto mb-2" />
              <h3 className="text-xl font-semibold text-gray-900">Project Details</h3>
              <p className="text-gray-600">Your projects and work samples</p>
            </div>

            <div className="space-y-6">
              {formData.projects.map((project, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Project {index + 1} {index === 0 && <span className="text-red-500">*</span>}
                    </h4>
                    {formData.projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProject(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={project.projectName}
                        onChange={(e) => handleProjectChange(index, 'projectName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter project name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Role
                      </label>
                      <input
                        type="text"
                        value={project.role}
                        onChange={(e) => handleProjectChange(index, 'role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Frontend Developer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={project.duration}
                        onChange={(e) => handleProjectChange(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 3 months"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Technologies Used
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={projectTechInput[index] || ''}
                          onChange={(e) => setProjectTechInput(prev => ({ ...prev, [index]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProjectTechnology(index))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Add technology"
                        />
                        <button
                          type="button"
                          onClick={() => addProjectTechnology(index)}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {project.technologiesUsed.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => removeProjectTechnology(index, techIndex)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows="3"
                        value={project.description}
                        onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe the project..."
                        maxLength="500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {project.description.length}/500 characters
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addProject}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                + Add Another Project
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Award className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-xl font-semibold text-gray-900">Additional Information</h3>
              <p className="text-gray-600">Tell us more about yourself</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Why do you want to join this internship? *
                </label>
                <textarea
                  rows="4"
                  value={formData.additionalInfo.whyJoinInternship}
                  onChange={(e) => handleInputChange('additionalInfo', 'whyJoinInternship', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['additionalInfo.whyJoinInternship'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Explain your motivation and interest in this internship..."
                  maxLength="1000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.additionalInfo.whyJoinInternship.length}/1000 characters
                </p>
                {errors['additionalInfo.whyJoinInternship'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['additionalInfo.whyJoinInternship']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Achievements / Certifications (Optional)
                </label>
                <textarea
                  rows="3"
                  value={formData.additionalInfo.achievementsCertifications}
                  onChange={(e) => handleInputChange('additionalInfo', 'achievementsCertifications', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="List your achievements, certifications, awards, etc..."
                  maxLength="1000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.additionalInfo.achievementsCertifications.length}/1000 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resume / CV *
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={formData.additionalInfo.resumeUrl}
                      onChange={(e) => handleInputChange('additionalInfo', 'resumeUrl', e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors['additionalInfo.resumeUrl'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter resume URL or upload file below"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleResumeUpload(e.target.files[0])}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume-upload"
                      className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        uploadingResume 
                          ? 'border-blue-300 bg-blue-50 cursor-not-allowed' 
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {uploadingResume ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin text-blue-500" />
                          <span className="text-blue-600">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Upload Resume (PDF, DOC, DOCX)</span>
                        </>
                      )}
                    </label>
                    {resumeFile && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>{resumeFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                {errors['additionalInfo.resumeUrl'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['additionalInfo.resumeUrl']}</p>
                )}
                {errors.resumeUpload && (
                  <p className="text-red-500 text-sm mt-1">{errors.resumeUpload}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio / Projects (Optional)
                </label>
                <input
                  type="url"
                  value={formData.additionalInfo.portfolioUrl}
                  onChange={(e) => handleInputChange('additionalInfo', 'portfolioUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter portfolio URL"
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h3 className="text-xl font-semibold text-gray-900">Declarations</h3>
              <p className="text-gray-600">Please confirm the following</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="truthful"
                  checked={formData.declarations.informationTruthful}
                  onChange={(e) => handleInputChange('declarations', 'informationTruthful', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="truthful" className="text-sm text-gray-700">
                  I hereby declare that the information provided is true and accurate to the best of my knowledge.
                </label>
              </div>
              {errors['declarations.informationTruthful'] && (
                <p className="text-red-500 text-sm">{errors['declarations.informationTruthful']}</p>
              )}

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={formData.declarations.consentToShare}
                  onChange={(e) => handleInputChange('declarations', 'consentToShare', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="consent" className="text-sm text-gray-700">
                  I consent to share my information with <strong>{internship?.companyName}</strong> for internship selection purposes.
                </label>
              </div>
              {errors['declarations.consentToShare'] && (
                <p className="text-red-500 text-sm">{errors['declarations.consentToShare']}</p>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{errors.submit}</p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col mx-2 sm:mx-0"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Internship Application</h2>
                <p className="text-blue-100 mt-1">{internship?.title} at {internship?.companyName}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-blue-100 mb-2">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-blue-500 bg-opacity-30 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Company Internship Details */}
          <div className="bg-gray-50 p-3 border-b flex-shrink-0">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Internship Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <p className="font-medium">{internship?.stipend?.type === 'Unpaid' ? 'Unpaid' : 'Paid'}</p>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <p className="font-medium">{internship?.duration}</p>
              </div>
              <div>
                <span className="text-gray-600">Start Date:</span>
                <p className="font-medium">{new Date(internship?.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Work Mode:</span>
                <p className="font-medium">{internship?.mode === 'Online' ? 'Remote' : internship?.mode === 'Offline' ? 'Onsite' : internship?.mode}</p>
              </div>
              <div>
                <span className="text-gray-600">Eligibility:</span>
                <p className="font-medium">{internship?.eligibility || 'Both'}</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t flex-shrink-0">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InternshipApplicationForm;