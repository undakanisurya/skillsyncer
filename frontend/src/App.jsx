import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import EmployerInfo from './pages/EmployerInfo';
import ResetPassword from './pages/ResetPassword';
import JobseekerDashboard from './pages/JobseekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import Settings from './pages/Settings';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import EmployeeDashboard from './pages/EmployeeDashboard';
import TestScreen from './pages/TestScreen';
import Footer from './components/Footer';

// Layout component to conditionally render navbar and footer
function Layout() {
  const location = useLocation();

  // Define routes that should NOT show the navbar and footer (dashboard routes)
  const dashboardBases = [
    '/jobseeker-dashboard',
    '/employer-dashboard',
    '/mentor-dashboard',
    '/employee-dashboard',
    '/admin-dashboard',
    '/admin-login',
    '/settings',
    '/test'
  ];
  const isDashboardRoute = dashboardBases.some(base => location.pathname === base || location.pathname.startsWith(base + '/'));

  return (
    <div className="min-h-screen bg-white">
      {!isDashboardRoute && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/employer-info" element={<EmployerInfo />} />
          <Route path="/jobseeker-dashboard" element={<JobseekerDashboard />} />
          <Route path="/employer-dashboard" element={<EmployerDashboard />} />
          <Route path="/employer-dashboard/:section" element={<EmployerDashboard />} />
          <Route path="/mentor-dashboard" element={<MentorDashboard />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/test/:token" element={<TestScreen />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AnimatePresence>
      {!isDashboardRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;