// Robust API utility with error handling and retry logic

// Use shared API base config with Vite env override
import { API_BASE_URL as CONFIG_API_BASE_URL } from '../config/api';

// Simplified API URL getter - honor env/config
const getApiUrl = () => {
  return CONFIG_API_BASE_URL;
};

// Enhanced fetch function with retry logic
export const apiRequest = async (endpoint, options = {}) => {
  const maxRetries = 3;
  let lastError;
  
  // Get the correct API URL
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${endpoint}`;
  
  // Default options
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  // If sending FormData, let the browser set the correct multipart boundary
  if (options.isFormData || (typeof FormData !== 'undefined' && defaultOptions.body instanceof FormData)) {
    if (defaultOptions.headers && defaultOptions.headers['Content-Type']) {
      delete defaultOptions.headers['Content-Type'];
    }
  }

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 API Request (attempt ${attempt}): ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...defaultOptions,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (response.ok) {
        console.log(`✅ API Success:`, data);
        return { success: true, data, status: response.status };
      } else {
        console.log(`❌ API Error:`, data);
        return { success: false, data, status: response.status };
      }

    } catch (error) {
      lastError = error;
      console.log(`❌ Network error (attempt ${attempt}/${maxRetries}):`, error.message);
      
      // Don't retry on abort errors (timeout)
      if (error.name === 'AbortError') {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All attempts failed
  console.log('💥 All API attempts failed');
  throw new Error(`Network error: ${lastError.message}. Please check if the server is running.`);
};

// Specific API functions
export const authApi = {
  login: (credentials) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  register: (userData) => apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};

export const dashboardApi = {
  getJobseekerDashboard: () => apiRequest('/api/jobseeker/dashboard'),
};

export const jobseekerApi = {
  // Internship browsing and applications
  getInternships: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const url = `/api/jobseeker/internships${params.toString() ? `?${params.toString()}` : ''}`;
    return apiRequest(url);
  },
  
  getInternshipDetails: (id) => apiRequest(`/api/jobseeker/internships/${id}`),
  
  applyForInternship: (id, coverLetter = '') => apiRequest(`/api/jobseeker/internships/${id}/apply`, {
    method: 'POST',
    body: JSON.stringify({ coverLetter }),
  }),
  
  applyForInternshipDetailed: (id, applicationData) => apiRequest(`/api/jobseeker/internships/${id}/apply-detailed`, {
    method: 'POST',
    body: JSON.stringify(applicationData),
  }),
  
  getApplications: () => apiRequest('/api/jobseeker/applications'),
  
  getDetailedApplications: () => apiRequest('/api/jobseeker/applications-detailed'),
  deleteApplication: (applicationId) => apiRequest(`/api/jobseeker/applications/${encodeURIComponent(applicationId)}`, { method: 'DELETE' }),

  // Status sync for tests and selections
  getStatus: () => apiRequest('/api/jobseekers/status'),
  
  // Profile management
  getProfile: () => apiRequest('/api/jobseeker/profile'),
  updateProfile: (profileData) => apiRequest('/api/jobseeker/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
  
  // Resume upload
  uploadResume: (formData) => apiRequest('/api/jobseeker/upload-resume', {
    method: 'POST',
    body: formData,
    isFormData: true,
  }),
  
  // ATS scoring
  getATSScore: () => apiRequest('/api/jobseeker/ats-score'),
  getATSNLP: (jobDescription = '') => apiRequest('/api/jobseeker/ats-nlp', {
    method: 'POST',
    body: JSON.stringify({ jobDescription }),
  }),
};

export const employerApi = {
  // Internship posting management
  getInternships: () => apiRequest('/api/employer/internships'),
  createInternship: (internshipData) => apiRequest('/api/employer/internships', {
    method: 'POST',
    body: JSON.stringify(internshipData),
  }),
  updateInternship: (id, internshipData) => apiRequest(`/api/employer/internships/${id}`, {
    method: 'PUT',
    body: JSON.stringify(internshipData),
  }),
  deleteInternship: (id) => apiRequest(`/api/employer/internships/${id}`, {
    method: 'DELETE',
  }),
  
  // Application management
  getDetailedApplications: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const url = `/api/employer/applications-detailed${params.toString() ? `?${params.toString()}` : ''}`;
    return apiRequest(url);
  },
  
  getApplicationDetails: (id) => apiRequest(`/api/employer/applications-detailed/${id}`),
  
  updateApplicationStatus: (id, status, notes = '') => apiRequest(`/api/employer/applications-detailed/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  }),

  // Assign online test to shortlisted application
  assignTest: (applicationId, expiresInHours = 24) => apiRequest('/api/tests/assign', {
    method: 'POST',
    body: JSON.stringify({ applicationId, expiresInHours }),
  }),
  
  resetTest: (applicationId) => apiRequest('/api/tests/reset', {
    method: 'POST',
    body: JSON.stringify({ applicationId }),
  }),
  
  // Dropdown data
  getInternshipTitles: (industry) => apiRequest(`/api/employer/internship-titles${industry ? `?industry=${encodeURIComponent(industry)}` : ''}`),
  getIndiaLocations: () => apiRequest('/api/employer/india-locations'),
  
  // Mentor request management
  getMentorRequests: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const url = `/api/mentor/requests${params.toString() ? `?${params.toString()}` : ''}`;
    return apiRequest(url);
  },
  
  submitMentorRequest: (requestData) => apiRequest('/api/mentor/request', {
    method: 'POST',
    body: JSON.stringify(requestData),
  }),
};

export const healthCheck = () => apiRequest('/api/health');

// Tests API (for client-side submission flows if needed)
export const testsApi = {
  get: (token) => apiRequest(`/api/tests/${encodeURIComponent(token)}`),
  submit: (token, answers) => apiRequest('/api/tests/submit', {
    method: 'POST',
    body: JSON.stringify({ token, answers })
  }),
  preview: (title, skills = [], model, provider = 'gemini') => apiRequest('/api/tests/preview', {
    method: 'POST',
    body: JSON.stringify({ title, skills, model, provider })
  })
};