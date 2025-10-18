import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Building,
  Briefcase,
  FileText,
  Settings,
  Bell,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Activity,
  TrendingUp,
  UserCheck,
  Calendar,
  MapPin,
  DollarSign,
  Award,
  Target,
  CheckCircle,
  X,
  Menu,
  Home,
  LogOut,
  BarChart3,
  Clock,
  Star,
  Filter,
  Download,
  Share2,
  MessageSquare,
  Zap,
  Globe,
  Smartphone,
  Mail,
  Phone,
  ExternalLink,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Shield,
  Crown,
  Sparkles,
  Rocket,
  Heart,
  Bookmark,
  User,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const EmployerDashboardLayout = ({ children, activeSection, setActiveSection, user, dashboardData, currentTime }) => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const navigationItems = [
    { name: 'Dashboard', icon: Home, section: 'dashboard', current: activeSection === 'dashboard' },
    { name: 'Company Profile', icon: Building, section: 'profile', current: activeSection === 'profile' },
    { name: 'Internship Postings', icon: Plus, section: 'internships', current: activeSection === 'internships' },
    { name: 'Applications Received', icon: FileText, section: 'applications', current: activeSection === 'applications' },
    { name: 'Mentor Requests', icon: UserCheck, section: 'mentor-requests', current: activeSection === 'mentor-requests' },
    { name: 'Employees', icon: Users, section: 'employees', current: activeSection === 'employees' },
    { name: 'Generate Questions', icon: FileText, section: 'generate-questions', current: activeSection === 'generate-questions' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Professional Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -left-32 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Enhanced Header */}
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
                  {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!
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
                     activeSection === 'profile' ? '🏢 Company Profile' :
                     activeSection === 'internships' ? '📝 Internship Postings' :
                     activeSection === 'applications' ? '📄 Applications Received' :
                     activeSection === 'mentor-requests' ? '👥 Mentor Requests' :
                     activeSection === 'employees' ? '👨‍💼 Employees' :
                     activeSection === 'generate-questions' ? '❓ Generate Questions' : '📊 Dashboard'}
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

              {/* Profile Menu */}
              <div className="relative" ref={profileMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="p-3 text-gray-600 hover:text-green-600 transition-colors bg-white/60 backdrop-blur-sm rounded-xl shadow-lg"
                  title="Profile Menu"
                >
                  <User className="w-5 h-5" />
                </motion.button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-600">{user?.email || 'user@example.com'}</p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveSection('profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4 inline mr-2" />
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-gray-900">SkillSyncer</span>
                    <p className="text-xs text-gray-600">Employer Portal</p>
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
                      <Building className="h-7 w-7 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{user?.name || 'User'}</h3>
                    <p className="text-sm text-gray-600 truncate">{user?.email || 'user@example.com'}</p>
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
                  {navigationItems.map((item, index) => {
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
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">SkillSyncer</span>
              <p className="text-xs text-gray-600">Employer Portal</p>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navigationItems.map((item, index) => {
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
                {activeSection === 'profile' ? 'Company Profile' :
                 activeSection === 'internships' ? 'Internship Postings' :
                 activeSection === 'applications' ? 'Applications Received' :
                 activeSection === 'mentor-requests' ? 'Mentor Requests' :
                 activeSection === 'employees' ? 'Employees' :
                 activeSection === 'generate-questions' ? 'Generate Questions' : 'Current Section'}
              </span>
            </nav>
          </motion.div>
        )}

        {children}
      </div>
    </div>
  );
};

export default EmployerDashboardLayout;
