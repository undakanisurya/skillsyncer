import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardApi, apiRequest, jobseekerApi, testsApi } from '../utils/api';
import JobseekerProfileManager from '../components/JobseekerProfileManager';
import InternshipApplicationForm from '../components/InternshipApplicationForm';
import {
  User,
  Settings,
  FileText,
  BarChart3,
  BookmarkIcon,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  LogOut,
  Search,
  Bell,
  Star,
  Award,
  MapPin,
  Clock,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Target,
  Activity,
  Users,
  Menu,
  X,
  Home,
  UserCircle,
  Plus,
  Edit,
  Save,
  Upload,
  Download,
  Code,
  Languages,
  Shield,
  DollarSign,
  Globe,
  Eye,
  Loader,
  AlertTriangle,
  Filter,
  ExternalLink,
  Heart,
  Building,
  Trash
} from 'lucide-react';

const JobseekerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    // Initialize with localStorage data if available
    const storedUserName = localStorage.getItem('userName');
    const storedUserEmail = localStorage.getItem('userEmail');
    if (storedUserName && storedUserEmail) {
      return {
        name: storedUserName,
        email: storedUserEmail
      };
    }
    return null;
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  
  const [showProfileManager, setShowProfileManager] = useState(false);
  
  // New state for internship postings
  const [internships, setInternships] = useState([]);
  const [loadingInternships, setLoadingInternships] = useState(false);
  const [internshipFilters, setInternshipFilters] = useState({
    search: '',
    industry: '',
    location: '',
    mode: '',
    duration: ''
  });
  const [internshipPagination, setInternshipPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Minimal profile state kept for dashboard widgets and helpers
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    resume: null,
    education: [],
    skills: [],
    workExperience: [],
    certifications: [],
    jobTitles: [],
    jobTypes: [],
    workSchedule: [],
    minimumBasePay: '',
    relocationPreferences: [],
    remotePreferences: '',
    readyToWork: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Profile form options
  const jobTypeOptions = [
    'Full-time',
    'Part-time',
    'Contract',
    'Freelance',
    'Internship',
    'Temporary'
  ];

  const workScheduleOptions = [
    'Day shift',
    'Night shift',
    'Morning shift',
    'Evening shift',
    'Rotational shift',
    'Flexible hours'
  ];

  const remoteOptions = [
    'Online',
    'Hybrid',
    'Offline'
  ];

  // Removed legacy in-dashboard profile editing logic

  useEffect(() => {
    fetchDashboardData();

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  // Load internships when jobs section is active
  useEffect(() => {
    if (activeSection === 'jobs') {
      loadInternships();
    }
  }, [activeSection, internshipFilters]);

  // Prefetch internships to populate KPI on dashboard
  useEffect(() => {
    loadInternships();
  }, []);

  const loadInternships = async () => {
    setLoadingInternships(true);
    try {
      const response = await jobseekerApi.getInternships({
        ...internshipFilters,
        page: internshipPagination.currentPage,
        limit: internshipPagination.itemsPerPage
      });

      if (response.success && response.data.success) {
        console.log('✅ Loaded', response.data.data.internships?.length || 0, 'internships');
        setInternships(response.data.data.internships || []);
        setInternshipPagination(response.data.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10
        });
      } else {
        console.error('Failed to load internships:', response.data?.message || response.message);
        setInternships([]);
      }
    } catch (error) {
      console.error('Error loading internships:', error);
      setInternships([]);
    } finally {
      setLoadingInternships(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setInternshipFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setInternshipPagination(prev => ({
      ...prev,
      currentPage: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setInternshipPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const handleApplyForInternship = async (internshipId) => {
    try {
      const response = await jobseekerApi.applyForInternship(internshipId);
      if (response.success && response.data.success) {
        alert('Application submitted successfully!');
        // Reload to reflect new application status in UI
        loadInternships();
        loadApplications();
      } else {
        alert(response.data?.message || response.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error applying for internship:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  const handleApplyDetailed = (internship) => {
    setSelectedInternship(internship);
    setShowApplicationForm(true);
  };

  const handleApplicationSuccess = () => {
    setShowApplicationForm(false);
    setSelectedInternship(null);
    // Reload internships and applications to update status
    loadInternships();
    loadApplications();
    alert('Application submitted successfully!');
  };

  const handleApplicationCancel = () => {
    setShowApplicationForm(false);
    setSelectedInternship(null);
  };

  // Open internship details modal and fetch full details
  const handleViewInternship = async (internshipId) => {
    try {
      setDetailsLoading(true);
      setShowInternshipDetails(true);
      setSelectedInternshipDetails(null);
      const res = await jobseekerApi.getInternshipDetails(internshipId);
      if (res.success) {
        const data = res?.data?.data || res?.data;
        setSelectedInternshipDetails(data);
      } else {
        alert(res?.data?.message || 'Failed to load internship details');
        setShowInternshipDetails(false);
      }
    } catch (e) {
      console.error('Failed to load internship details', e);
      alert('Failed to load internship details. Please try again.');
      setShowInternshipDetails(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseInternshipDetails = () => {
    setShowInternshipDetails(false);
    setSelectedInternshipDetails(null);
  };

  // Load internship applications
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [statusMap, setStatusMap] = useState({});

  // Application form state
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applicationFormData, setApplicationFormData] = useState(null);

  // Internship details modal state
  const [showInternshipDetails, setShowInternshipDetails] = useState(false);
  const [selectedInternshipDetails, setSelectedInternshipDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Application Status section state
  const [statusItems, setStatusItems] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [testReviewModal, setTestReviewModal] = useState({ open: false, loading: false, data: null, error: '' });

  // Helper to check if user already applied to an internship
  const hasAppliedTo = React.useCallback((internshipId) => {
    return applications?.some(app => {
      const id1 = app?.internshipId?._id || app?.internshipId;
      const id2 = app?.internship?._id;
      return id1 === internshipId || id2 === internshipId;
    });
  }, [applications]);

  const loadApplications = async () => {
    setLoadingApplications(true);
    try {
      const response = await jobseekerApi.getDetailedApplications();
      if (response.success) {
        // The API util wraps responses as { success, data } and backend may also wrap as { success, data }
        const payload = response?.data?.success ? response.data.data : response.data;
        const apps = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
        setApplications(apps);
        // Also load statuses for test links and scores
        try {
          const statusRes = await jobseekerApi.getStatus();
          const items = statusRes?.success ? (statusRes.data?.data || []) : [];
          const map = {};
          items.forEach(it => { map[it.applicationId] = it; });
          setStatusMap(map);
        } catch (_) {}
      } else {
        console.error('Failed to load applications:', response.data?.message || response.message);
        setApplications([]);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  // Load applications when applications section is active
  useEffect(() => {
    if (activeSection === 'applications') {
      loadApplications();
    }
  }, [activeSection]);

  // Load status data when status section is active
  useEffect(() => {
    if (activeSection === 'status') {
      // Ensure applications and status map are loaded
      (async () => {
        setLoadingStatus(true);
        try {
          if (applications.length === 0) {
            await loadApplications();
          } else {
            // refresh status map independently
            try {
              const statusRes = await jobseekerApi.getStatus();
              const items = statusRes?.success ? (statusRes.data?.data || []) : [];
              const map = {};
              items.forEach(it => { map[it.applicationId] = it; });
              setStatusMap(map);
            } catch (_) {}
          }
        } finally {
          setLoadingStatus(false);
        }
      })();
    }
  }, [activeSection]);

  // Rebuild status items when inputs change
  useEffect(() => {
    if (activeSection !== 'status') return;
    const items = applications.map(app => {
      const stat = statusMap[app._id] || {};
      // Derive token from testLink, if available
      const token = typeof stat.testLink === 'string' ? (stat.testLink.split('/').filter(Boolean).pop() || null) : null;
      const title = app.internshipDetails?.title || app.internshipId?.title || app.internship?.title || 'Internship';
      const mode = app.internshipDetails?.workMode || app.internshipId?.mode || app.internship?.mode || null;
      const startDate = app.internshipDetails?.startDate || app.internshipId?.startDate || app.internship?.startDate || null;
      const rawStatus = (stat.result === 'Passed') ? 'Selected' : (app.status === 'selected' ? 'Selected' : (app.status === 'rejected' || stat.result === 'Failed') ? 'Rejected' : (app.status === 'test-assigned' ? 'Test Assigned' : (app.status || 'Applied')));
      const canReview = typeof stat.score === 'number' || (stat.result === 'Passed' || stat.result === 'Failed');
      const hasSubmission = typeof stat.score === 'number' || !!stat.result;
      const testExpired = hasSubmission ? true : (stat.testExpiry ? (Date.now() > new Date(stat.testExpiry).getTime()) : null);
      let testStatus = '—';
      if (hasSubmission) {
        testStatus = stat.result || 'Completed';
      } else if (stat.testLink) {
        testStatus = testExpired === true ? 'Expired' : 'Assigned';
      }
      return {
        applicationId: app._id,
        internshipTitle: title,
        startDate,
        mode,
        score: typeof stat.score === 'number' ? stat.score : (typeof app.score === 'number' ? app.score : undefined),
        displayStatus: rawStatus,
        token,
        canReview,
        testLink: stat.testLink || null,
        testExpired,
        testStatus
      };
    });
    setStatusItems(items);
  }, [activeSection, applications, statusMap]);

  const handleOpenTestReview = async (item) => {
    if (!item?.token) {
      // Try to locate token from statusMap and parse robustly
      const stat = statusMap[item?.applicationId];
      const link = stat?.testLink;
      if (!link) return;
      try {
        const token = parseTokenFromLink(link);
        item.token = token;
      } catch (_) { return; }
    }
    setTestReviewModal({ open: true, loading: true, data: null, error: '' });
    try {
      const res = await testsApi.get(item.token);
      if (res?.success && (res.data?.success || res.status === 200)) {
        const payload = res.data?.data || res.data;
        setTestReviewModal({ open: true, loading: false, data: payload, error: '' });
      } else {
        setTestReviewModal({ open: true, loading: false, data: null, error: res?.data?.message || 'Failed to load test details' });
      }
    } catch (e) {
      setTestReviewModal({ open: true, loading: false, data: null, error: e.message || 'Network error' });
    }
  };

  const formatAnswer = (ans) => {
    if (ans === null || ans === undefined) return '—';
    if (Array.isArray(ans)) return ans.join(', ');
    if (typeof ans === 'object') return JSON.stringify(ans);
    return String(ans);
  };

  const parseTokenFromLink = (link) => {
    try {
      const url = new URL(link);
      const segments = url.pathname.split('/').filter(Boolean);
      // handle trailing slash and ensure we pick after 'test'
      const testIndex = segments.findIndex(s => s.toLowerCase() === 'test');
      if (testIndex >= 0 && segments[testIndex + 1]) return segments[testIndex + 1];
      return segments.pop();
    } catch (_) {
      const parts = String(link).split('?')[0].split('#')[0].split('/').filter(Boolean);
      const tIdx = parts.findIndex(s => s.toLowerCase() === 'test');
      if (tIdx >= 0 && parts[tIdx + 1]) return parts[tIdx + 1];
      return parts.pop();
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (!applicationId) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this application? This action cannot be undone.');
    if (!confirmDelete) return;
    try {
      const res = await jobseekerApi.deleteApplication(applicationId);
      if (res?.success && (res.data?.success || res.status === 200)) {
        // Refresh applications and status
        await loadApplications();
      } else {
        alert(res?.data?.message || 'Failed to delete application');
      }
    } catch (e) {
      alert(e.message || 'Network error while deleting application');
    }
  };
  // Also load applications when browsing jobs (to mark already applied internships)
  useEffect(() => {
    if (activeSection === 'jobs') {
      loadApplications();
    }
  }, [activeSection]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const result = await dashboardApi.getJobseekerDashboard();

      if (result.success) {
        // apiRequest wraps backend response in { success, data }
        // and backend also returns { success, data: dashboardData }
        const payload = result?.data?.data || result?.data;

        setDashboardData(payload);

        const apiProf = payload?.profile || {};
        let prof = apiProf;
        // Supplement with /api/jobseeker/profile user data if any core fields are missing
        try {
          if (!apiProf?.name || !apiProf?.email) {
            const meRes = await apiRequest('/api/jobseeker/profile', { method: 'GET' });
            const userDoc = meRes?.success ? (meRes?.data?.data?.user || meRes?.data?.user) : null;
            if (userDoc) {
              prof = {
                ...apiProf,
                name: apiProf.name || userDoc.name,
                email: apiProf.email || userDoc.email,
                phone: apiProf.phone || userDoc.profile?.phone,
                location: apiProf.location || userDoc.profile?.location,
                skills: Array.isArray(apiProf.skills) && apiProf.skills.length ? apiProf.skills : (userDoc.profile?.skills || []),
                bio: apiProf.bio || userDoc.profile?.bio,
                experience: apiProf.experience || userDoc.profile?.experience,
              };
            }
          }
        } catch (_) { /* non-blocking enrichment */ }
        setUser(prof ? { ...prof, name: prof.name || (localStorage.getItem('userName') || ''), email: prof.email || (localStorage.getItem('userEmail') || '') } : null);
        
        // Populate profile form with actual data
        if (prof) {
          setProfileData({
            name: prof.name || (localStorage.getItem('userName') || ''),
            email: prof.email || (localStorage.getItem('userEmail') || ''),
            phone: prof.phone || '',
            location: prof.location || '',
            resume: prof.resume || null,
            education: prof.education || [],
            skills: prof.skills || [],
            workExperience: prof.workExperience || [],
            certifications: prof.certifications || [],
            jobTitles: prof.jobTitles || [],
            jobTypes: prof.jobTypes || [],
            workSchedule: prof.workSchedule || [],
            minimumBasePay: prof.minimumBasePay || '',
            relocationPreferences: prof.relocationPreferences || [],
            remotePreferences: prof.remotePreferences || '',
            readyToWork: prof.readyToWork || false
          });
        }
        
        // Reset unsaved changes flag when loading fresh data
        setHasUnsavedChanges(false);
      } else {
        setError(result.data?.message || 'Failed to load dashboard');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(error.message || 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');

    // Redirect to home page
    navigate('/', { replace: true });
  };

  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
  };

  const sideNavItems = [
    {
      name: 'Dashboard',
      icon: Home,
      section: 'dashboard',
      current: activeSection === 'dashboard'
    },
    {
      name: 'Application Status',
      icon: BarChart3,
      section: 'status',
      current: activeSection === 'status'
    },
    {
      name: 'Profile',
      icon: UserCircle,
      section: 'profile',
      current: activeSection === 'profile'
    },
    {
      name: 'Find Internships',
      icon: Search,
      section: 'jobs',
      current: activeSection === 'jobs'
    },
    {
      name: 'Applications',
      icon: FileText,
      section: 'applications',
      current: activeSection === 'applications'
    },
    {
      name: 'Saved Internships',
      icon: BookmarkIcon,
      section: 'saved',
      current: activeSection === 'saved'
    },
    {
      name: 'Settings',
      icon: Settings,
      section: 'settings',
      current: activeSection === 'settings'
    }
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Manage Your Profile</h2>
                  <p className="text-gray-600 mt-1">Open the profile manager to view, edit, and upload your resume.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Ensure userId is set for Profile Manager API calls
                    const uid = localStorage.getItem('userId');
                    if (!uid && dashboardData?.profile?._id) {
                      try {
                        localStorage.setItem('userId', dashboardData.profile._id);
                      } catch (_) {}
                    }
                    setShowProfileManager(true);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200"
                >
                  Open Profile Manager
                </motion.button>
              </div>
            </motion.div>
          </div>
        );

      case 'jobs':
        return (
          <div className="space-y-8">
            {/* Internship Search Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Search className="w-6 h-6 mr-3 text-blue-600" />
                Find Your Perfect Internship
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div>
                  <input 
                    type="text" 
                    placeholder="Internship title or keywords"
                    value={internshipFilters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Location"
                    value={internshipFilters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <select 
                    value={internshipFilters.industry}
                    onChange={(e) => handleFilterChange('industry', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Industries</option>
                    <option value="IT/Technology">IT/Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Banking">Banking</option>
                    <option value="Education">Education</option>
                    <option value="Media">Media</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Non-Profit">Non-Profit</option>
                    <option value="Government">Government</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <select 
                    value={internshipFilters.mode}
                    onChange={(e) => handleFilterChange('mode', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Modes</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <select 
                    value={internshipFilters.duration}
                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Durations</option>
                    <option value="15 days">15 days</option>
                    <option value="1 month">1 month</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                    <option value="Full day">Full day</option>
                    <option value="Half day">Half day</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm text-gray-600">Popular searches:</span>
                {['Software Development', 'Data Science', 'UX Design', 'Business Analysis', 'Content Writing'].map((tag) => (
                  <motion.button
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleFilterChange('search', tag)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Internship Listings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  Available Internships
                </h3>
                {loadingInternships && (
                  <div className="flex items-center text-blue-600">
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </div>
                )}
              </div>
              
              {loadingInternships ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading internships...</p>
                </div>
              ) : internships.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Internships Found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search criteria or check back later for new opportunities.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {internships.map((internship, index) => (
                    <motion.div
                      key={internship._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{internship.title}</h4>
                          <p className="text-blue-600 font-medium">{internship.companyName}</p>
                          <p className="text-gray-600 mt-2">{internship.description}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {internship.location}
                            </span>
                            <span className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-1" />
                              {internship.mode}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {internship.duration}
                            </span>
                            <span className="flex items-center">
                              <Building className="w-4 h-4 mr-1" />
                              {internship.industry}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span className={`${internship.isFinalDay ? 'text-red-600 font-semibold' : ''}`}>
                                Last date: {internship.lastDateToApply ? new Date(internship.lastDateToApply).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                              </span>
                            </span>
                            {typeof internship.daysLeftToApply === 'number' && (
                              <span className={`flex items-center ${internship.daysLeftToApply <= 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                <Clock className="w-4 h-4 mr-1" />
                                {internship.daysLeftToApply <= 0 ? 'Applications closed' : (internship.isFinalDay ? 'Last day to apply' : `${internship.daysLeftToApply} days left`)}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {internship.skillsRequired && internship.skillsRequired.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewInternship(internship._id)}
                            className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                            title="View details"
                            aria-label="View details"
                          >
                            <Eye className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: hasAppliedTo(internship._id) ? 1 : 1.02 }}
                            whileTap={{ scale: hasAppliedTo(internship._id) ? 1 : 0.98 }}
                            onClick={() => !hasAppliedTo(internship._id) && internship.isAcceptingApplications && handleApplyDetailed(internship)}
                            disabled={hasAppliedTo(internship._id) || !internship.isAcceptingApplications}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${hasAppliedTo(internship._id) || !internship.isAcceptingApplications ? 'bg-red-100 text-red-700 border border-red-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                          >
                            {hasAppliedTo(internship._id) ? 'Applied' : (internship.isAcceptingApplications ? 'Apply Now' : 'Closed')}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <BookmarkIcon className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {internshipPagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(internshipPagination.currentPage - 1)}
                    disabled={internshipPagination.currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </motion.button>
                  
                  <span className="px-3 py-2 text-gray-600">
                    Page {internshipPagination.currentPage} of {internshipPagination.totalPages}
                  </span>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(internshipPagination.currentPage + 1)}
                    disabled={internshipPagination.currentPage === internshipPagination.totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        );
      
      case 'applications':
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-blue-600" />
                My Internship Applications
              </h2>
              
              {loadingApplications ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600 mb-6">Start applying to internships to see your applications here.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveSection('jobs')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Search className="w-5 h-5 inline mr-2" />
                    Browse Internships
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application, index) => (
                    <motion.div
                      key={application._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.internshipDetails?.title || application.internshipId?.title || application.internship?.title || 'Internship'}
                          </h3>
                          <p className="text-blue-600 font-medium mb-2">
                            {application.internshipDetails?.companyName || application.internshipId?.companyName || application.internship?.companyName || 'Company'}
                          </p>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {application.internshipDetails?.location || application.internshipId?.location || application.internship?.location || 'Location not specified'}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {application.internshipDetails?.duration || application.internshipId?.duration || application.internship?.duration || 'Duration not specified'}
                            </span>
                            <span className="flex items-center">
                              <Globe className="w-4 h-4 mr-1" />
                              {application.internshipDetails?.workMode || application.internshipId?.mode || application.internship?.mode || 'Mode not specified'}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Applied {new Date(application.appliedAt || application.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {/* Show personal details for detailed applications */}
                          {application.personalDetails && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <strong>Applied as:</strong> {application.personalDetails.fullName} ({application.personalDetails.emailAddress})
                              </p>
                              {application.personalDetails.phoneNumber && (
                                <p className="text-sm text-gray-700">
                                  <strong>Phone:</strong> {application.personalDetails.phoneNumber}
                                </p>
                              )}
                            </div>
                          )}
                          {/* Show cover letter for simple applications */}
                          {application.coverLetter && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <strong>Cover Letter:</strong> {application.coverLetter}
                              </p>
                            </div>
                          )}

                          {/* Test assignment and result (only if an actual test exists) */}
                          {(() => {
                            const status = statusMap[application._id];
                            if (!status) return null;
                            const hasRealTest = !!status.testLink || typeof status.score === 'number' || (status.result !== null && status.result !== undefined) || status.status === 'test-assigned';
                            if (!hasRealTest) return null; // do not show for auto-rejected applications without tests

                            const testStatusText = status.status === 'test-assigned'
                              ? 'Assigned'
                              : (status.result || status.status || '—');

                            return (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-sm text-blue-800">
                                  <strong>Test Status:</strong> {testStatusText}
                                </p>
                                {status.testLink && (
                                  <p className="text-sm mt-1">
                                    <strong>Test Link:</strong> <a className="text-blue-600 hover:underline" href={status.testLink} target="_blank" rel="noreferrer">Open Test</a>
                                  </p>
                                )}
                                {status.testExpiry && (
                                  <p className="text-sm text-gray-700 mt-1">
                                    <strong>Deadline:</strong> {new Date(status.testExpiry).toLocaleString()}
                                  </p>
                                )}
                                {typeof status.score === 'number' && (
                                  <p className="text-sm text-gray-700 mt-1">
                                    <strong>Score:</strong> {status.score} ({status.result})
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'shortlisted' || application.status === 'test-assigned' ? 'bg-blue-100 text-blue-800' :
                            application.status === 'accepted' || application.status === 'selected' ? 'bg-green-100 text-green-800' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {application.status === 'accepted' || application.status === 'selected' ? 'Selected' :
                             application.status === 'shortlisted' ? 'Shortlisted' :
                             application.status === 'test-assigned' ? 'Test Assigned' :
                             application.status === 'rejected' ? 'Rejected' :
                             application.status === 'pending' ? 'Pending' :
                             'Applied'}
                          </span>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="View details"
                            aria-label="View details"
                            onClick={() => { setSelectedApplication(application); setShowApplicationDetails(true); }}
                            className="p-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        );
      
      case 'status':
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                Application Status
              </h2>

              {loadingStatus ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading status...</p>
                </div>
              ) : statusItems.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h3>
                  <p className="text-gray-600">Apply to internships to see your status here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Internship Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Link</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link Expired</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {statusItems.map((item, idx) => (
                        <tr key={item.applicationId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.internshipTitle || 'Internship'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.startDate ? new Date(item.startDate).toLocaleDateString() : '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.mode || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.testStatus || '—'}</td>
                          <td className="px-4 py-3 text-sm">
                            {item.testLink ? (
                              item.testExpired === true ? (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700" title="Link expired">Closed</span>
                              ) : (
                                <a href={item.testLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Open</a>
                              )
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.testExpired === null ? '—' : item.testExpired ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.displayStatus === 'Selected' ? 'bg-green-100 text-green-800' : item.displayStatus === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                              {item.displayStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{typeof item.score === 'number' ? `${item.score}/100` : '—'}</td>
                          <td className="px-4 py-3 text-sm">
                            {item.canReview ? (
                              <button
                                type="button"
                                title="View"
                                aria-label="View"
                                onClick={() => handleOpenTestReview(item)}
                                className="p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        );
      
      case 'saved':
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookmarkIcon className="w-6 h-6 mr-3 text-blue-600" />
                Saved Internships
              </h2>
              <div className="text-center py-12">
                <BookmarkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Internships</h3>
                <p className="text-gray-600">Save interesting internships to view them later.</p>
              </div>
            </motion.div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="w-6 h-6 mr-3 text-blue-600" />
                Settings
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive job alerts and updates</p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Profile Visibility</h4>
                        <p className="text-sm text-gray-600">Make profile visible to recruiters</p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
      
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                  </h2>
                  <p className="text-gray-600">
                    Here's your personalized dashboard with all the important updates.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData?.profile?.completionPercentage || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Profile Complete</div>
                </div>
              </div>
              
              {/* Profile Completion Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${getCompletionBgColor(dashboardData?.profile?.completionPercentage || 0)}`}
                  style={{width: `${dashboardData?.profile?.completionPercentage || 0}%`}}
                ></div>
              </div>
            </motion.div>

            {/* Mentor Assignment Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-600" />
                Mentor Assignment
              </h3>
              
              {dashboardData?.profile?.assignedMentor ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-green-800">Mentor Assigned!</h4>
                      <p className="text-green-600">You have been assigned a mentor to guide your journey.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <h5 className="font-medium text-gray-900 mb-2">Your Grade</h5>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          dashboardData.profile.grade === 'A' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          Grade {dashboardData.profile.grade}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <h5 className="font-medium text-gray-900 mb-2">Mentor Details</h5>
                      <p className="text-sm text-gray-600">
                        <strong>Name:</strong> {dashboardData.profile.assignedMentor.name}<br/>
                        <strong>Email:</strong> {dashboardData.profile.assignedMentor.email}<br/>
                        <strong>Grade:</strong> {dashboardData.profile.assignedMentor.mentorProfile?.grade}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-green-700">
                    <p>📧 Your mentor will contact you soon to begin your mentorship journey.</p>
                    <p>📅 Assignment Date: {new Date(dashboardData.profile.mentorAssignmentDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : dashboardData?.profile?.grade ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-yellow-800">Mentor Assignment Pending</h4>
                      <p className="text-yellow-600">We're working on assigning you a mentor with grade {dashboardData.profile.grade}.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <h5 className="font-medium text-gray-900 mb-2">Your Grade</h5>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      dashboardData.profile.grade === 'A' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      Grade {dashboardData.profile.grade}
                    </span>
                  </div>
                  
                  <div className="mt-4 text-sm text-yellow-700">
                    <p>⏳ We'll notify you as soon as a suitable mentor becomes available.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                      <Target className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">No Mentor Assignment Yet</h4>
                      <p className="text-gray-600">Complete a test to receive a grade and get assigned a mentor.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">How to Get a Mentor</h5>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Apply for internships</li>
                      <li>2. Complete assigned tests</li>
                      <li>3. Pass the test to receive a grade</li>
                      <li>4. Get automatically assigned a mentor</li>
                    </ol>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData?.applications?.length || 0}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tests Taken</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData?.tests?.length || 0}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profile Score</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData?.profile?.atsScore || 0}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saved Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData?.savedJobs?.length || 0}</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <BookmarkIcon className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Check if user is logged in and is a jobseeker
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole !== 'jobseeker') {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Professional Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -left-32 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Enhanced Header (only on Dashboard) */}
      {activeSection === 'dashboard' && (
      <div className="bg-white/90 backdrop-blur-lg shadow-xl border-b border-white/20 lg:ml-64 relative z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden p-3 text-gray-600 hover:text-blue-600 transition-colors bg-white rounded-xl shadow-lg"
                onClick={toggleSidePanel}
              >
                <Menu className="w-5 h-5" />
              </motion.button>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {getGreeting()}, {user?.name?.split(' ')[0] || localStorage.getItem('userName')?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-gray-600 font-medium">
                  {formatDate(currentTime)} • {formatTime(currentTime)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right mr-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                  <p className="text-sm font-bold text-gray-900">
                    Welcome back, <span className="text-blue-600">{user?.name?.split(' ')[0] || 'User'}</span>!
                  </p>
                  <p className="text-xs text-gray-600">
                    {activeSection === 'dashboard' ? '📊 Dashboard Overview' : 
                     activeSection === 'profile' ? '👤 Profile Management' :
                     activeSection === 'jobs' ? '🔍 Job Search' :
                     activeSection === 'applications' ? '📄 My Applications' :
                     activeSection === 'saved' ? '🔖 Saved Jobs' :
                     activeSection === 'settings' ? '⚙️ Account Settings' : '📊 Dashboard'}
                  </p>
                </div>
              </div>
              
              {/* Notification Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-3 text-gray-600 hover:text-blue-600 transition-colors bg-white/60 backdrop-blur-sm rounded-xl shadow-lg"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">3</span>
                </span>
              </motion.button>

              {/* Settings Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 text-gray-600 hover:text-green-600 transition-colors bg-white/60 backdrop-blur-sm rounded-xl shadow-lg"
                title="Settings"
                onClick={() => setActiveSection('settings')}
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Side Panel */}
      <AnimatePresence>
        {isSidePanelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidePanel}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            />

            {/* Enhanced Mobile Side Panel */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-white/95 to-blue-50/95 backdrop-blur-xl shadow-2xl z-50 lg:hidden border-r border-white/20"
            >
              {/* Enhanced Panel Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-gray-900">SkillSyncer</span>
                    <p className="text-xs text-gray-600">Jobseeker Portal</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleSidePanel}
                  className="p-2.5 text-gray-400 hover:text-gray-600 transition-all duration-300 bg-white/60 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Enhanced Mobile User Info */}
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <User className="h-7 w-7 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{user?.name || localStorage.getItem('userName') || 'User'}</h3>
                    <p className="text-sm text-gray-600 truncate">{user?.email || localStorage.getItem('userEmail') || 'user@example.com'}</p>
                    <div className="flex items-center mt-1">
                      <div className="h-1.5 w-16 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500" 
                          style={{width: `${dashboardData?.profile?.completionPercentage || 0}%`}}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {dashboardData?.profile?.completionPercentage || 0}% Complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Mobile Navigation */}
              <nav className="flex-1 p-4">
                <div className="space-y-1">
                  {sideNavItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <motion.button
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setActiveSection(item.section);
                          setIsSidePanelOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300 group ${
                          item.current
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                            : 'text-gray-700 hover:bg-white/60 hover:shadow-md hover:text-blue-600'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                          item.current 
                            ? 'bg-white/20' 
                            : 'group-hover:bg-blue-100'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{item.name}</span>
                        {item.current && (
                          <motion.div
                            layoutId="mobileActiveIndicator"
                            className="ml-auto w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </nav>

              {/* Enhanced Mobile Sign Out */}
              <div className="p-4 border-t border-gray-200/50">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleLogout();
                    setIsSidePanelOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group"
                >
                  <div className="p-1.5 rounded-lg group-hover:bg-red-100 transition-all duration-300">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Sign Out</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Enhanced Professional Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white/95 to-blue-50/95 backdrop-blur-xl shadow-2xl border-r border-white/20 hidden lg:block">
        {/* Professional Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">SkillSyncer</span>
              <p className="text-xs text-gray-600">Jobseeker Portal</p>
            </div>
          </div>
        </div>

        {/* Sidebar user profile card removed for cleaner look */}

        {/* Enhanced Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {sideNavItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.button
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(item.section)}
                  className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300 group ${
                    item.current
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-white/60 hover:shadow-md hover:text-blue-600'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                    item.current 
                      ? 'bg-white/20' 
                      : 'group-hover:bg-blue-100'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                  {item.current && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* Enhanced Sign Out */}
        <div className="p-4 border-t border-gray-200/50">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-red-100 transition-all duration-300">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-medium">Sign Out</span>
          </motion.button>
        </div>
      </div>

      <div className="lg:ml-64 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        {activeSection !== 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <nav className="flex items-center space-x-2 text-sm">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveSection('dashboard')}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Dashboard
              </motion.button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">
                {activeSection === 'profile' ? 'Profile' :
                 activeSection === 'jobs' ? 'Find Internships' :
                 activeSection === 'applications' ? 'Applications' :
                 activeSection === 'status' ? 'Application Status' :
                                   activeSection === 'saved' ? 'Saved Internships' :
                 activeSection === 'settings' ? 'Settings' : 'Current Section'}
              </span>
            </nav>
          </motion.div>
        )}

        {/* Application Details Modal */}
        <AnimatePresence>
          {showApplicationDetails && selectedApplication && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={() => setShowApplicationDetails(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Application Details</h3>
                  <button onClick={() => setShowApplicationDetails(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">Position:</span> {selectedApplication.internshipDetails?.title || selectedApplication.internshipId?.title || 'Internship'}
                  </p>
                  <p>
                    <span className="font-semibold">Company:</span> {selectedApplication.internshipDetails?.companyName || selectedApplication.internshipId?.companyName || 'Company'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <p className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {selectedApplication.internshipDetails?.location || selectedApplication.internshipId?.location || '—'}</p>
                    <p className="flex items-center"><Globe className="w-4 h-4 mr-1" /> {selectedApplication.internshipDetails?.workMode || selectedApplication.internshipId?.mode || '—'}</p>
                    <p className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {selectedApplication.internshipDetails?.duration || selectedApplication.internshipId?.duration || '—'}</p>
                    <p className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> Applied {new Date(selectedApplication.appliedAt || selectedApplication.createdAt).toLocaleString()}</p>
                  </div>

                  {selectedApplication.personalDetails && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold mb-1">Personal Details</p>
                      <p><span className="font-semibold">Name:</span> {selectedApplication.personalDetails.fullName}</p>
                      <p><span className="font-semibold">Email:</span> {selectedApplication.personalDetails.emailAddress}</p>
                      {selectedApplication.personalDetails.contactNumber && (
                        <p><span className="font-semibold">Phone:</span> {selectedApplication.personalDetails.contactNumber}</p>
                      )}
                    </div>
                  )}

                  {selectedApplication.additionalInfo?.resumeUrl && (
                    <div className="mt-4">
                      <a href={selectedApplication.additionalInfo.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        View Submitted Resume
                      </a>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowApplicationDetails(false)}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeSection === 'dashboard' ? (
          <>
            {/* Application Details Modal */}
            <AnimatePresence>
              {showApplicationDetails && selectedApplication && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                  onClick={() => setShowApplicationDetails(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Application Details</h3>
                      <button onClick={() => setShowApplicationDetails(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold">Position:</span> {selectedApplication.internshipDetails?.title || selectedApplication.internshipId?.title || 'Internship'}
                      </p>
                      <p>
                        <span className="font-semibold">Company:</span> {selectedApplication.internshipDetails?.companyName || selectedApplication.internshipId?.companyName || 'Company'}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <p className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {selectedApplication.internshipDetails?.location || selectedApplication.internshipId?.location || '—'}</p>
                        <p className="flex items-center"><Globe className="w-4 h-4 mr-1" /> {selectedApplication.internshipDetails?.workMode || selectedApplication.internshipId?.mode || '—'}</p>
                        <p className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {selectedApplication.internshipDetails?.duration || selectedApplication.internshipId?.duration || '—'}</p>
                        <p className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> Applied {new Date(selectedApplication.appliedAt || selectedApplication.createdAt).toLocaleString()}</p>
                      </div>

                      {selectedApplication.personalDetails && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="font-semibold mb-1">Personal Details</p>
                          <p><span className="font-semibold">Name:</span> {selectedApplication.personalDetails.fullName}</p>
                          <p><span className="font-semibold">Email:</span> {selectedApplication.personalDetails.emailAddress}</p>
                          {selectedApplication.personalDetails.contactNumber && (
                            <p><span className="font-semibold">Phone:</span> {selectedApplication.personalDetails.contactNumber}</p>
                          )}
                        </div>
                      )}

                      {selectedApplication.additionalInfo?.resumeUrl && (
                        <div className="mt-4">
                          <a href={selectedApplication.additionalInfo.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            View Submitted Resume
                          </a>
                        </div>
                      )}

                      <div className="mt-4 flex justify-end space-x-3">
                        <button
                          onClick={() => setShowApplicationDetails(false)}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Profile Completion Alert */}
            {dashboardData?.profile?.completionPercentage < 100 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-2xl p-6 shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Boost Your Profile! 🚀
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Complete your profile to unlock better job matches and increase visibility
                  </p>
                  <div className="flex items-center mt-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000"
                        style={{ width: `${dashboardData.profile.completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {dashboardData.profile.completionPercentage}% Complete
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileManager(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200"
                >
                  Manage Profile
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Profile Completion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-500 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <User className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Profile</p>
                    <p className={`text-3xl font-bold ${getCompletionColor(dashboardData?.profile?.completionPercentage || 75)}`}>
                      {dashboardData?.profile?.completionPercentage || 75}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: `${dashboardData?.profile?.completionPercentage || 75}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-sm"
                ></motion.div>
              </div>
              <p className="text-xs text-gray-500 font-medium">Complete your profile to get noticed</p>
            </div>
          </motion.div>

          {/* Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-500 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Applications</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardData?.stats?.applicationsSubmitted ?? 12}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="font-medium">+2 this week</span>
              </div>
            </div>
          </motion.div>

          {/* Saved Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-500 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <BookmarkIcon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Saved Internships</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardData?.stats?.internshipsSaved || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center text-sm text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                <Star className="w-4 h-4 mr-2" />
                <span className="font-medium">Browse more internships</span>
              </div>
            </div>
          </motion.div>

          {/* Interviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-500 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-14 w-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Available Internships</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {internshipPagination?.totalItems || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center text-sm text-orange-600 bg-orange-50 rounded-lg px-3 py-2">
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-medium">Updated from listings</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Enhanced Profile Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20"
          >
            <div className="p-4 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Profile Overview
                </h2>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {dashboardData?.profile?.completionPercentage || 0}% Complete
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowProfileManager(true)}
                    className="hidden sm:inline-flex bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-3 py-1.5 rounded-lg font-medium shadow-md"
                  >
                    Manage Profile
                  </motion.button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start space-x-6">
                <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{user?.name || localStorage.getItem('userName') || 'User'}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                          <Mail className="w-4 h-4 mr-1.5" /> {user?.email || localStorage.getItem('userEmail') || 'user@example.com'}
                        </span>
                        {user?.phone && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                            <Phone className="w-4 h-4 mr-1.5" /> {user.phone}
                          </span>
                        )}
                        {user?.location && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                            <MapPin className="w-4 h-4 mr-1.5" /> {user.location}
                          </span>
                        )}
                        {user?.resume && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                            <FileText className="w-4 h-4 mr-1.5" /> Resume uploaded
                          </span>
                        )}
                        {user?.readyToWork && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                            <Briefcase className="w-4 h-4 mr-1.5" /> Ready to work
                          </span>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowProfileManager(true)}
                      className="mt-4 sm:mt-0 bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium shadow hover:bg-blue-700"
                    >
                      Update Profile
                    </motion.button>
                  </div>

                  {user?.bio && (
                    <p className="text-gray-700 mt-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-100">{user.bio}</p>
                  )}

                  {/* Skills Section */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      Skills & Expertise
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(user?.skills) && user.skills.length > 0 ? (
                        (() => {
                          const maxToShow = 10;
                          const shown = user.skills.slice(0, maxToShow);
                          const remaining = user.skills.length - shown.length;
                          return (
                            <>
                              {shown.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
                                >
                                  {skill}
                                </span>
                              ))}
                              {remaining > 0 && (
                                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
                                  +{remaining} more
                                </span>
                              )}
                            </>
                          );
                        })()
                      ) : (
                        <span className="text-gray-500 text-sm italic">No skills added yet - Add skills to improve your profile!</span>
                      )}
                    </div>
                  </div>

                  {/* Education Section */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Education
                    </h4>
                    {Array.isArray(user?.education) && user.education.length > 0 ? (
                      <div className="space-y-2">
                        {user.education.map((edu, idx) => {
                          const isObj = edu && typeof edu === 'object';
                          const degree = isObj ? (edu.degree || '') : String(edu);
                          const specialization = isObj ? (edu.specialization || '') : '';
                          const institution = isObj ? (edu.institution || '') : '';
                          const year = isObj ? (edu.year || '') : '';
                          return (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="font-medium text-gray-900">
                                {degree}{specialization ? ` • ${specialization}` : ''}
                              </div>
                              {(institution || year) && (
                                <div className="text-sm text-gray-600">{institution}{institution && year ? ' • ' : ''}{year}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">Not specified</p>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </motion.div>

          
        </div>

            {/* Enhanced Footer */}
            <motion.footer
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-10 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">SkillSyncer</h3>
                    <p className="text-sm text-gray-600">Your career growth partner</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Last updated: {formatTime(currentTime)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    © 2024 SkillSyncer. All rights reserved.
                  </p>
                </div>
              </div>
            </motion.footer>
          </>
        ) : (
          renderSectionContent()
        )}
      </div>

      

      {/* Jobseeker Profile Manager Modal */}
      {showProfileManager && (
        <JobseekerProfileManager
          onClose={() => setShowProfileManager(false)}
          initialData={dashboardData?.profile || {}}
        />
      )}

      {/* Internship Details Modal */}
      {showInternshipDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 relative max-h-[85vh] flex flex-col">
            <button
              onClick={handleCloseInternshipDetails}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            {detailsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading internship details...</p>
              </div>
            ) : selectedInternshipDetails ? (
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                <h3 className="text-2xl font-bold text-gray-900">{selectedInternshipDetails.title}</h3>
                <p className="text-blue-600 font-medium">{selectedInternshipDetails.companyName}</p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{selectedInternshipDetails.location}</span>
                  <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1" />{selectedInternshipDetails.mode}</span>
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{selectedInternshipDetails.duration}</span>
                  <span className={`flex items-center ${selectedInternshipDetails.isFinalDay ? 'text-red-600 font-semibold' : ''}`}><Calendar className="w-4 h-4 mr-1" />Last date: {selectedInternshipDetails.lastDateToApply ? new Date(selectedInternshipDetails.lastDateToApply).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                </div>
                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-gray-900">Description</h4>
                  <p className="text-gray-700 mt-2 whitespace-pre-line">{selectedInternshipDetails.description}</p>
                </div>
                {Array.isArray(selectedInternshipDetails.skillsRequired) && selectedInternshipDetails.skillsRequired.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-900">Skills Required</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedInternshipDetails.skillsRequired.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedInternshipDetails.eligibility && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-900">Eligibility</h4>
                    <p className="text-gray-700 mt-2 whitespace-pre-line">{selectedInternshipDetails.eligibility}</p>
                  </div>
                )}
                {selectedInternshipDetails.benefits && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-900">Benefits</h4>
                    <p className="text-gray-700 mt-2 whitespace-pre-line">{selectedInternshipDetails.benefits}</p>
                  </div>
                )}
                <div className="mt-6 flex justify-end space-x-3 sticky bottom-0 bg-white pt-4">
                  <motion.button
                    whileHover={{ scale: hasAppliedTo(selectedInternshipDetails._id) ? 1 : 1.02 }}
                    whileTap={{ scale: hasAppliedTo(selectedInternshipDetails._id) ? 1 : 0.98 }}
                    onClick={() => {
                      if (!hasAppliedTo(selectedInternshipDetails._id) && selectedInternshipDetails.isAcceptingApplications) {
                        handleApplyDetailed(selectedInternshipDetails);
                      }
                    }}
                    disabled={hasAppliedTo(selectedInternshipDetails._id) || !selectedInternshipDetails.isAcceptingApplications}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${hasAppliedTo(selectedInternshipDetails._id) || !selectedInternshipDetails.isAcceptingApplications ? 'bg-red-100 text-red-700 border border-red-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {hasAppliedTo(selectedInternshipDetails._id) ? 'Applied' : (selectedInternshipDetails.isAcceptingApplications ? 'Apply Now' : 'Closed')}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-600">Failed to load details.</div>
            )}
          </div>
        </div>
      )}

      {/* Test Review Modal */}
      {testReviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setTestReviewModal({ open: false, loading: false, data: null, error: '' })}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 relative max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setTestReviewModal({ open: false, loading: false, data: null, error: '' })}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Test Review</h3>
            {testReviewModal.loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading test details...</p>
              </div>
            ) : testReviewModal.error ? (
              <div className="text-red-600 text-sm">{testReviewModal.error}</div>
            ) : testReviewModal.data ? (
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                <div className="mb-4 text-sm text-gray-700">
                  <p><strong>Internship:</strong> {testReviewModal.data.internshipTitle || 'Assessment'}</p>
                  {typeof testReviewModal.data.score === 'number' && (
                    <p className="mt-1"><strong>Score:</strong> {testReviewModal.data.score}/100 ({testReviewModal.data.result || '—'})</p>
                  )}
                </div>
                {Array.isArray(testReviewModal.data.questions) && (
                  <div className="space-y-4">
                    {testReviewModal.data.questions.map((q, i) => {
                      const userAnswer = Array.isArray(testReviewModal.data.answers) ? testReviewModal.data.answers[i] : undefined;
                      const solution = Array.isArray(testReviewModal.data.solutions) ? testReviewModal.data.solutions[i] : undefined;
                      const isCorrect = Array.isArray(testReviewModal.data.correctness) ? testReviewModal.data.correctness[i] : undefined;

                      // Robust question text handling for intern.py and others
                      const questionText = (q && (q.question || q.prompt || q.text || q.title)) || '—';
                      const options = Array.isArray(q?.options) ? q.options : (Array.isArray(q?.choices) ? q.choices : undefined);

                      const mapToLabel = (ans) => {
                        if (ans === null || ans === undefined) return '—';
                        // If options exist and answer is index-like
                        if (Array.isArray(options)) {
                          if (typeof ans === 'number' && options[ans] !== undefined) return String(options[ans]);
                          // If answer equals option value (string), keep as is
                          if (typeof ans === 'string') return ans;
                        }
                        // Fallback to generic formatting
                        if (Array.isArray(ans)) return ans.join(', ');
                        if (typeof ans === 'object') return JSON.stringify(ans);
                        return String(ans);
                      };

                      const userDisplay = mapToLabel(userAnswer);
                      const correctDisplay = ('correctAnswer' in (solution || {})) ? mapToLabel(solution.correctAnswer) : '—';
                      return (
                        <div key={i} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">Q{i+1}. {questionText}</p>
                              <p className="mt-2 text-sm"><span className="font-medium">Your answer:</span> {userDisplay}</p>
                              {'correctAnswer' in (solution || {}) && (
                                <p className="mt-1 text-sm"><span className="font-medium">Correct answer:</span> {correctDisplay}</p>
                              )}
                            </div>
                            {typeof isCorrect === 'boolean' && (
                              <span className={`ml-4 px-2 py-1 rounded text-xs font-medium ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Internship Application Form Modal */}
      {showApplicationForm && selectedInternship && (
        <InternshipApplicationForm
          internship={selectedInternship}
          isOpen={showApplicationForm}
          onClose={handleApplicationCancel}
          onSuccess={() => {
            alert('Application submitted successfully!');
            setShowApplicationForm(false);
            setSelectedInternship(null);
            loadInternships();
            loadApplications();
          }}
        />
      )}
    </div>
  );
};

export default JobseekerDashboard;