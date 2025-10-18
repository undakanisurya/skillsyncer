import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import {
  Users,
  User,
  GraduationCap,
  Settings,
  LogOut,
  BarChart3,
  Activity,
  Search,
  Filter,
  Eye,
  Edit,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Bell,
  Menu,
  X,
  Home,
  Star,
  Award,
  Target,
  Zap,
  Globe,
  BookOpen,
  MessageCircle,
  Video,
  Briefcase,
  MessageSquare,
  UserCircle
} from 'lucide-react';

const MentorDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [mentorData, setMentorData] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(2);
  const [secondaryRoles, setSecondaryRoles] = useState([]);
  const navigate = useNavigate();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch mentor data on component mount
  useEffect(() => {
    const init = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      
      if (!token) {
        navigate('/auth');
        return;
      }
      
      // Check if user has mentor role (primary or secondary)
      const storedSecondaryRoles = localStorage.getItem('secondaryRoles');
      const secondaryRoles = storedSecondaryRoles ? JSON.parse(storedSecondaryRoles) : [];
      const hasMentorRole = role === 'mentor' || secondaryRoles.includes('mentor');
      
      
      if (!hasMentorRole) {
        navigate('/auth');
        return;
      }
      
      setSecondaryRoles(secondaryRoles);
    };
    
    init();
    fetchMentorData();
  }, [navigate]);

  const fetchMentorData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setMentorData(data.data.user);
        // Update secondary roles from server response
        if (data.data.user.secondaryRoles && data.data.user.secondaryRoles.length > 0) {
          setSecondaryRoles(data.data.user.secondaryRoles);
          localStorage.setItem('secondaryRoles', JSON.stringify(data.data.user.secondaryRoles));
        }
      }
    } catch (error) {
      console.error('Error fetching mentor data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('secondaryRoles');
    navigate('/auth');
  };

  const handleRoleSwitch = (role) => {
    if (role === 'employee') {
      navigate('/employee-dashboard');
    }
    // Add other role switches as needed
  };

  const handleMigration = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/mentor/migrate-to-dual-role`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Migration response:', data);
      
      if (data.success) {
        // Update local state
        setSecondaryRoles(data.data.secondaryRoles);
        localStorage.setItem('secondaryRoles', JSON.stringify(data.data.secondaryRoles));
        localStorage.setItem('userRole', data.data.primaryRole);
        
        // Refresh the page to show updated roles
        window.location.reload();
      } else {
        console.error('Migration failed:', data.message);
        alert('Migration failed: ' + data.message);
      }
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration error: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const sidebarItems = [
    { id: 'overview', name: 'Home / Overview', icon: Home },
    { id: 'mentees', name: 'My Mentees', icon: Users },
    { id: 'internships', name: 'Internships / Projects', icon: Briefcase },
    { id: 'feedback', name: 'Feedback & Assessments', icon: MessageSquare },
    { id: 'profile', name: 'Profile & Settings', icon: UserCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`${sidebarCollapsed ? 'w-16' : 'w-56'} bg-white shadow-sm relative transition-all duration-300 border-r border-gray-200`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="text-xl font-bold text-white">SkillSyncer</span>
                <p className="text-xs text-indigo-100">Mentor Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-all duration-200 text-gray-600 hover:bg-gray-50"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>


        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={sidebarCollapsed ? item.name : ''}
              >
                <Icon className="w-5 h-5" />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Sign Out</span>}
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-3 lg:py-6 overflow-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {/* Welcome Header */}
          {activeSection === 'overview' && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-bold mb-1">
                      Welcome back, <span className="text-yellow-300">{mentorData.name?.split(' ')[0] || 'Mentor'}</span>! 🎓
                    </h1>
                    <p className="text-blue-100 text-xs">
                      {currentTime.getHours() < 12 ? 'Good morning' : 
                       currentTime.getHours() < 17 ? 'Good afternoon' : 'Good evening'}! Ready to inspire and guide today?
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                      <p className="text-white/90 text-xs font-medium">
                        {currentTime.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-white font-bold text-xs">
                        {currentTime.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    
                    
                    {/* Role Switcher for Overview */}
                    {secondaryRoles.length > 0 && (
                      <div className="mt-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                                <User className="h-3 w-3 text-white" />
                              </div>
                              <div>
                                <p className="text-white/90 text-xs font-medium">Current Role</p>
                                <p className="text-white text-xs font-semibold">Mentor</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-white/70 text-xs">Switch to:</span>
                              {secondaryRoles.map((role) => {
                                const switchToRole = role === 'mentor' ? 'employee' : role;
                                return (
                                  <button
                                    key={switchToRole}
                                    onClick={() => handleRoleSwitch(switchToRole)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30 hover:border-white/50"
                                  >
                                    {switchToRole === 'employee' && <Briefcase className="h-3 w-3" />}
                                    {switchToRole === 'mentor' && <GraduationCap className="h-3 w-3" />}
                                    {switchToRole.charAt(0).toUpperCase() + switchToRole.slice(1)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Headers for other pages */}
          {activeSection !== 'overview' && (
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  {activeSection === 'mentees' && 'My Mentees'}
                  {activeSection === 'internships' && 'Internships / Projects'}
                  {activeSection === 'feedback' && 'Feedback & Assessments'}
                  {activeSection === 'profile' && 'Profile & Settings'}
                </h1>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {activeSection === 'mentees' && <span>Manage your mentees and track their progress</span>}
                  {activeSection === 'internships' && <span>View and manage internship projects and opportunities</span>}
                  {activeSection === 'feedback' && <span>Provide feedback and conduct assessments for mentees</span>}
                  {activeSection === 'profile' && <span>Update your profile, settings, and preferences</span>}
                </div>
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                {/* Role Switcher */}
                {secondaryRoles.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Current Role</p>
                          <p className="text-gray-900 text-lg font-semibold">Mentor</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-sm">Switch to:</span>
                        {secondaryRoles.map((role) => {
                          const switchToRole = role === 'mentor' ? 'employee' : role;
                          return (
                            <button
                              key={switchToRole}
                              onClick={() => handleRoleSwitch(switchToRole)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md"
                            >
                              {switchToRole === 'employee' && <Briefcase className="h-4 w-4" />}
                              {switchToRole === 'mentor' && <GraduationCap className="h-4 w-4" />}
                              {switchToRole.charAt(0).toUpperCase() + switchToRole.slice(1)} Dashboard
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="relative">
                  <button className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {notifications}
                      </span>
                    )}
                  </button>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {currentTime.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <AnimatePresence mode="wait">
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Active Mentees</p>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +2 this month
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Sessions This Week</p>
                      <p className="text-2xl font-bold text-gray-900">8</p>
                      <p className="text-xs text-blue-600 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        3 upcoming
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Resources Shared</p>
                      <p className="text-2xl font-bold text-gray-900">45</p>
                      <p className="text-xs text-purple-600 flex items-center mt-1">
                        <BookOpen className="w-3 h-3 mr-1" />
                        5 new this week
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900">94%</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <Star className="w-3 h-3 mr-1" />
                        Excellent rating
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Recent Activity */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20"
              >
                <h3 className="text-base font-bold text-gray-900 mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Session completed with John Doe</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">New message from Sarah Smith</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Resource shared: React Best Practices</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Other Sections - Placeholder */}
        {activeSection !== 'overview' && (
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center border border-white/20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
                className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                {activeSection === 'mentees' && <Users className="w-8 h-8 text-white" />}
                {activeSection === 'internships' && <Briefcase className="w-8 h-8 text-white" />}
                {activeSection === 'feedback' && <MessageSquare className="w-8 h-8 text-white" />}
                {activeSection === 'profile' && <UserCircle className="w-8 h-8 text-white" />}
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-bold text-gray-900 mb-2"
              >
                {activeSection === 'mentees' && 'My Mentees'}
                {activeSection === 'internships' && 'Internships / Projects'}
                {activeSection === 'feedback' && 'Feedback & Assessments'}
                {activeSection === 'profile' && 'Profile & Settings'}
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-4 text-sm"
              >
                {activeSection === 'mentees' && 'Manage your mentees, track their progress, and provide guidance. This section will show all your active mentees and their learning journey.'}
                {activeSection === 'internships' && 'View and manage internship projects, track progress, and assign tasks to your mentees. This section will help you oversee all internship activities.'}
                {activeSection === 'feedback' && 'Provide detailed feedback, conduct assessments, and track mentee performance. This section will help you evaluate and guide your mentees effectively.'}
                {activeSection === 'profile' && 'Update your mentor profile, manage settings, and customize your preferences. This section will help you maintain your professional presence.'}
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Coming Soon
              </motion.button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;