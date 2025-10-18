import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Building,
  Shield,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Home,
  Calendar,
  CheckCircle,
  Target,
  Briefcase,
  Activity,
  ChevronRight,
  ArrowRight,
  BarChart3,
  Star,
  Rocket,
  Sparkles,
  BadgeCheck,
  Heart,
  Eye
} from 'lucide-react';

// Animations removed for static dashboard

import { employerApi, apiRequest } from '../utils/api';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState({ name: '', email: '' });
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  
  // Applications state (read-only view for employee)
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationFilters, setApplicationFilters] = useState({
    status: '',
    internshipId: '',
    search: ''
  });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [error, setError] = useState(null);
  const [secondaryRoles, setSecondaryRoles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const init = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      const name = localStorage.getItem('userName');
      const email = localStorage.getItem('userEmail');

      if (!token) {
        navigate('/auth');
        return;
      }
      
      // Check if user has employee role (primary or secondary)
      const storedSecondaryRoles = localStorage.getItem('secondaryRoles');
      const secondaryRoles = storedSecondaryRoles ? JSON.parse(storedSecondaryRoles) : [];
      const hasEmployeeRole = role === 'employee' || secondaryRoles.includes('employee');
      
      
      
      if (!hasEmployeeRole) {
        navigate('/auth');
        return;
      }
      setUser({ name: name || 'Employee', email: email || '' });
      setSecondaryRoles(secondaryRoles);
    };

    init();
    fetchUserData(); // Fetch updated user data including secondary roles

    // Stop live time updates to keep dashboard static
    return () => {};
  }, [navigate]);

  // Load applications when Applications section is active
  useEffect(() => {
    if (activeSection === 'applications') {
      loadApplications();
    }
  }, [activeSection, applicationFilters]);

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
    if (role === 'mentor') {
      navigate('/mentor-dashboard');
    }
    // Add other role switches as needed
  };

  // Fetch user data to get updated secondary roles
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        // Update secondary roles from server response
        if (data.data.user.secondaryRoles && data.data.user.secondaryRoles.length > 0) {
          setSecondaryRoles(data.data.user.secondaryRoles);
          localStorage.setItem('secondaryRoles', JSON.stringify(data.data.user.secondaryRoles));
        }
        const u = data.data.user || {};
        setUser({ name: u.name || 'Employee', email: u.email || '' });
        // Prefer explicit employee profile phone, fallback to general profile.phone
        setPhoneNumber((u.profile && u.profile.phone) || '');
        // Company name best-effort: employer/company account's name or cached
        const cachedCompany = localStorage.getItem('companyName');
        const fromEmployeeCompanyId = u.employeeProfile?.companyId ? '' : '';
        setCompanyName(u.company?.name || cachedCompany || 'Linked Company');
        if (u.company?.name) localStorage.setItem('companyName', u.company.name);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Load applications from employer API (employee allowed by backend)
  const loadApplications = async () => {
    setLoadingApplications(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoadingApplications(false);
        return;
      }
      const response = await employerApi.getDetailedApplications(applicationFilters);
      if (response.success && response.data) {
        const payload = response.data.success ? response.data.data : response.data;
        const applicationsArray = Array.isArray(payload?.applications) ? payload.applications : (Array.isArray(payload) ? payload : []);
        setApplications(applicationsArray);
      } else {
        setError(`Failed to load applications: ${response.data?.message || response.message || 'No data received'}`);
        setApplications([]);
      }
    } catch (e) {
      setError(`Error loading applications: ${e.message || 'Network error'}`);
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  const formatTime = (date) =>
    date.toLocaleString('en-US', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  // Mocked computed profile completion for visual ring (replace with real value when backend wired)
  const profileCompletion = 72;
  const ringStyle = useMemo(() => ({
    backgroundImage: `conic-gradient(#0ea5e9 ${profileCompletion}%, #e5e7eb 0)`
  }), [profileCompletion]);

  const menu = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Preferences', icon: Settings },
  ];

  const Sidebar = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm ring-1 ring-blue-200">
          <Home className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[11px] text-gray-500">SkillSyncer</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">Employee</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Approved</span>
          </div>
        </div>
      </div>
      <div className="px-4"><div className="h-px w-full bg-gray-200" /></div>
      <nav className="mt-4 px-2 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              className={`group w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition
                ${isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
              `}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive ? (
                <span className="text-[10px] uppercase tracking-wider text-blue-600">Active</span>
              ) : (
                <ChevronRight className="h-4 w-4 opacity-50" />
              )}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto p-3">
        <div className="rounded-2xl bg-white border border-gray-200 p-3">
          <p className="text-[11px] text-gray-500">Signed in as</p>
          <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 text-white px-3 py-2 text-sm font-medium hover:bg-black"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>
    </div>
  );

  const TopBar = () => (
    <div className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-900 text-white">Employee</span>
            </div>
            <p className="text-xs text-gray-500">{formatTime(currentTime)}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              placeholder="Search..."
              className="bg-transparent outline-none text-sm text-gray-700 w-48"
            />
          </div>
          
          {/* Role Switcher */}
          {secondaryRoles.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-600 text-xs font-medium">Current Role</p>
                  <p className="text-gray-900 text-sm font-semibold">Employee</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">Switch to:</span>
                  {secondaryRoles.map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-gray-700 text-xs font-medium hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md"
                    >
                      {role === 'mentor' && <User className="h-3.5 w-3.5" />}
                      {role === 'employee' && <Briefcase className="h-3.5 w-3.5" />}
                      {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <button className="relative p-2 rounded-lg hover:bg-gray-100" title="Notifications">
            <Bell className="h-5 w-5 text-gray-700" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-black"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>
    </div>
  );

  const Overview = () => (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="absolute inset-0 opacity-80" style={{ backgroundImage: 'radial-gradient(circle at 0% 0%, #dbeafe 0, transparent 35%), radial-gradient(circle at 100% 0%, #fce7f3 0, transparent 35%), radial-gradient(circle at 100% 100%, #dcfce7 0, transparent 35%)' }} />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-900 text-white px-2.5 py-1 text-[11px]">
                <Sparkles className="h-3.5 w-3.5" /> Welcome back
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-gray-900">Your Employee Workspace</h2>
              <p className="mt-2 text-gray-600 max-w-2xl">
                Access company details, manage your profile, and keep your account secure. Quick links help you get started fast.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <button onClick={() => setActiveSection('profile')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700">
                  <User className="h-4 w-4" /> Update Profile
                </button>
                <button onClick={() => setActiveSection('security')} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-blue-50 hover:border-blue-200">
                  <Shield className="h-4 w-4" /> Change Password
                </button>
              </div>
            </div>
            {/* Profile Completion Ring */}
            <div className="shrink-0">
              <div className="relative h-28 w-28 rounded-full" style={ringStyle}>
                <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center shadow">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{profileCompletion}%</div>
                    <div className="text-[11px] text-gray-500">Complete</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { title: 'Status', value: 'Active', icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { title: 'Role', value: 'Employee', icon: Briefcase, color: 'text-indigo-700', bg: 'bg-indigo-50' },
          { title: 'Company Link', value: companyName || 'Linked', icon: Building, color: 'text-blue-700', bg: 'bg-blue-50' },
          { title: 'Join Date', value: 'Recently Verified', icon: Calendar, color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="bg-white rounded-2xl shadow-sm p-5 border group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{c.title}</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{c.value}</p>
                </div>
                <div className={`h-10 w-10 ${c.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${c.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Activity className="h-5 w-5 text-gray-700" /> Recent Activity</h3>
            <button className="text-sm text-gray-600 hover:text-gray-900">View all</button>
          </div>
          <div className="space-y-3">
            {[{t:'Account verified by admin',i:BadgeCheck,c:'text-blue-600 bg-blue-50'}, {t:'Password changed',i:Shield,c:'text-emerald-600 bg-emerald-50'}, {t:'Profile updated',i:User,c:'text-purple-600 bg-purple-50'}, {t:'Joined company workspace',i:Building,c:'text-amber-600 bg-amber-50'}].map((item, i) => {
              const Icon = item.i;
              return (
                <div key={i} className="flex items-center justify-between rounded-xl border p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg ${item.c.split(' ')[1]} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${item.c.split(' ')[0]}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.t}</p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-700" /> Security Tips
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" /> Change your password after the first login.</li>
            <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" /> Enable email alerts for suspicious activity.</li>
            <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" /> Keep your profile details up to date.</li>
          </ul>
          <button onClick={() => setActiveSection('security')} className="mt-4 inline-flex items-center gap-2 text-sm text-gray-900 font-medium hover:underline">
            Review security settings <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'My Profile', desc: 'Update your personal details', icon: User, action: () => setActiveSection('profile'), color: 'from-gray-900 to-black' },
          { title: 'Company', desc: 'View linked company info', icon: Building, action: () => setActiveSection('company'), color: 'from-blue-600 to-indigo-600' },
          { title: 'Preferences', desc: 'Customize your experience', icon: Settings, action: () => setActiveSection('settings'), color: 'from-emerald-600 to-teal-600' },
        ].map((q, idx) => {
          const Icon = q.icon;
          return (
            <button key={q.title} onClick={q.action} className="group text-left">
              <div className={`relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md`}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{q.title}</p>
                    <p className="text-sm text-gray-600">{q.desc}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const Profile = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        <p className="text-sm text-gray-500 mb-4">Keep your personal details accurate and up to date.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Full Name</label>
            <input className="w-full rounded-lg border px-3 py-2 text-sm" value={user.name} onChange={(e)=>setUser(prev=>({...prev, name:e.target.value}))} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Company</label>
            <input className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50" value={companyName} disabled />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50" value={user.email} disabled />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Phone</label>
            <input className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50" value={phoneNumber} disabled />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Position</label>
            <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Your position" />
          </div>
        </div>
        <div className="mt-4 flex gap-3 items-center">
          <button
            disabled={saving}
            onClick={async () => {
              try {
                setSaving(true);
                setSaveError('');
                const res = await apiRequest('/api/auth/profile', {
                  method: 'PUT',
                  body: JSON.stringify({ name: user.name })
                });
                if (!res.success) {
                  setSaveError(res.data?.message || 'Failed to save');
                }
              } catch (e) {
                setSaveError(e.message || 'Network error');
              } finally {
                setSaving(false);
              }
            }}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            Save Changes
          </button>
          <button className="inline-flex items-center gap-2 border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          {saveError && <span className="text-sm text-rose-600">{saveError}</span>}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
        <p className="text-sm text-gray-500 mb-4">Customize your dashboard experience.</p>
        <div className="space-y-3 text-sm text-gray-700">
          <label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4" defaultChecked /> Show tips and guidance on dashboard</label>
          <label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4" /> Enable compact layout on small screens</label>
        </div>
      </div>
    </div>
  );

  const Company = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
        <p className="text-sm text-gray-500 mb-4">Linked company details will appear here once fetched.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border p-4"><p className="text-xs text-gray-500">Company</p><p className="text-sm font-medium text-gray-900">Linked to your account</p></div>
          <div className="rounded-xl border p-4"><p className="text-xs text-gray-500">Department</p><p className="text-sm font-medium text-gray-900">—</p></div>
          <div className="rounded-xl border p-4"><p className="text-xs text-gray-500">Position</p><p className="text-sm font-medium text-gray-900">—</p></div>
          <div className="rounded-xl border p-4"><p className="text-xs text-gray-500">Employee ID</p><p className="text-sm font-medium text-gray-900">—</p></div>
        </div>
      </div>
    </div>
  );

  const Security = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900">Password</h3>
        <p className="text-sm text-gray-500 mb-4">Change your password regularly to keep your account secure.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input type="password" className="rounded-lg border px-3 py-2 text-sm" placeholder="Current password" />
          <input type="password" className="rounded-lg border px-3 py-2 text-sm" placeholder="New password" />
          <input type="password" className="rounded-lg border px-3 py-2 text-sm" placeholder="Confirm new password" />
        </div>
        <button className="mt-4 inline-flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-black">Update Password</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900">Security Controls</h3>
        <div className="mt-3 space-y-3 text-sm text-gray-700">
          <label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4" defaultChecked /> Email me about new device logins</label>
          <label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4" /> Email me about password changes</label>
        </div>
      </div>
    </div>
  );

  const NotificationsPanel = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
        <p className="text-sm text-gray-500 mb-4">Control how you receive updates and alerts.</p>
        <div className="space-y-3 text-sm text-gray-700">
          <label className="flex items-center justify-between gap-3"><span>Email notifications</span><input type="checkbox" className="h-4 w-4" defaultChecked /></label>
          <label className="flex items-center justify-between gap-3"><span>Security alerts</span><input type="checkbox" className="h-4 w-4" defaultChecked /></label>
          <label className="flex items-center justify-between gap-3"><span>Product updates</span><input type="checkbox" className="h-4 w-4" /></label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside
            className="fixed z-50 inset-y-0 left-0 w-72 bg-white text-gray-900 border-r border-gray-200 p-2 rounded-r-2xl shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between p-2">
              <span className="text-sm font-medium text-gray-700">Navigation</span>
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar />
          </aside>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:w-72 bg-white text-gray-900 border-r border-gray-200 p-2">
          <Sidebar />
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="px-4 sm:px-6 lg:px-8 py-6">
            {activeSection === 'overview' && <Overview />}
            {activeSection === 'applications' && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Briefcase className="h-5 w-5 text-gray-700" /> Applications</h3>
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded-lg px-2 py-1 text-sm"
                      value={applicationFilters.status}
                      onChange={(e) => setApplicationFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="accepted">Accepted</option>
                    </select>
                  </div>
                </div>
                {error && (
                  <div className="mb-3 rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{error}</div>
                )}
                {loadingApplications ? (
                  <div className="text-sm text-gray-600">Loading applications...</div>
                ) : applications.length === 0 ? (
                  <div className="text-sm text-gray-600">No applications found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-gray-700">
                          <th className="py-2 pl-3 pr-4 w-16">Sl. No</th>
                          <th className="py-2 pr-4">Candidate</th>
                          <th className="py-2 pr-4">Email</th>
                          <th className="py-2 pr-4">Internship</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Applied</th>
                          <th className="py-2 pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {applications.map((app, idx) => (
                          <tr key={app._id}>
                            <td className="py-2 pl-3 pr-4">{idx + 1}</td>
                            <td className="py-2 pr-4">{app.jobseeker?.name || app.jobseekerId?.name || 'N/A'}</td>
                            <td className="py-2 pr-4">{app.jobseeker?.email || app.jobseekerId?.email || 'N/A'}</td>
                            <td className="py-2 pr-4">{app.internship?.title || app.internshipId?.title || 'N/A'}</td>
                            <td className="py-2 pr-4">
                              {(() => {
                                const s = (app.status || '').toLowerCase();
                                const cls = s === 'shortlisted'
                                  ? 'bg-emerald-700 text-white border-emerald-700'
                                  : s === 'rejected'
                                  ? 'bg-rose-700 text-white border-rose-700'
                                  : 'bg-gray-700 text-white border-gray-700';
                                return (
                                  <span className={`px-2 py-0.5 rounded text-xs border ${cls}`}>{app.status}</span>
                                );
                              })()}
                            </td>
                            <td className="py-2 pr-4">{new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</td>
                            <td className="py-2 pr-4">
                              <button
                                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                onClick={async () => {
                                  try {
                                    const res = await employerApi.getApplicationDetails(app._id);
                                    const payload = res.success && res.data?.success ? res.data.data : res.data;
                                    setSelectedApplication(payload || app);
                                  } catch {
                                    setSelectedApplication(app);
                                  } finally {
                                    setShowApplicationModal(true);
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4" /> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Details Modal */}
                {showApplicationModal && selectedApplication && (
                  <div
                    className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4"
                  >
                    <div
                      className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border p-6"
                    >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">Application Details</h4>
                          <button className="rounded-lg p-2 hover:bg-gray-100" onClick={() => setShowApplicationModal(false)}>
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="space-y-3 text-sm text-gray-700">
                          <p><strong>Candidate:</strong> {(selectedApplication.jobseeker?.name || selectedApplication.jobseekerId?.name) || 'N/A'} ({selectedApplication.jobseeker?.email || selectedApplication.jobseekerId?.email || 'N/A'})</p>
                          <p><strong>Internship:</strong> {(selectedApplication.internship?.title || selectedApplication.internshipId?.title) || 'N/A'} — {(selectedApplication.internship?.companyName || selectedApplication.internshipId?.companyName) || 'N/A'}</p>
                          <p>
                            <strong>Status:</strong>{' '}
                            {(() => {
                              const s = (selectedApplication.status || '').toLowerCase();
                              const cls = s === 'shortlisted'
                                ? 'bg-emerald-700 text-white border-emerald-700'
                                : s === 'rejected'
                                ? 'bg-rose-700 text-white border-rose-700'
                                : 'bg-gray-700 text-white border-gray-700';
                              return (
                                <span className={`ml-1 px-2 py-0.5 rounded text-xs border align-middle ${cls}`}>{selectedApplication.status}</span>
                              );
                            })()}
                          </p>
                          {selectedApplication.employerNotes && (
                            <p><strong>Employer Notes:</strong> {selectedApplication.employerNotes}</p>
                          )}
                          {(selectedApplication.additionalInfo?.resumeUrl || selectedApplication.resumeUrl) && (
                            <p><a className="text-blue-600 hover:underline" target="_blank" rel="noreferrer" href={selectedApplication.additionalInfo?.resumeUrl || selectedApplication.resumeUrl}>View Resume</a></p>
                          )}
                        </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeSection === 'profile' && <Profile />}
            {activeSection === 'company' && <Company />}
            {activeSection === 'security' && <Security />}
            {activeSection === 'notifications' && <NotificationsPanel />}
            {activeSection === 'settings' && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
                <p className="text-sm text-gray-500">Adjust your experience and appearance.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;