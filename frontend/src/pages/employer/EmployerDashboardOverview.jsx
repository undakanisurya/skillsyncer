import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, TrendingUp, FileText, Calendar, Target, Star } from 'lucide-react';

const EmployerDashboardOverview = ({ dashboardData, internshipCount }) => {
  const stats = dashboardData?.stats || {};
  return (
    <>
      {dashboardData?.recentApplications && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-6">
            <div className="text-sm text-gray-600">Active Internships</div>
            <div className="text-3xl font-bold text-gray-900">{stats.activeInternships ?? 0}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-6">
            <div className="text-sm text-gray-600">Total Applications</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalApplications ?? 0}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-6">
            <div className="text-sm text-gray-600">Shortlisted</div>
            <div className="text-3xl font-bold text-gray-900">{stats.shortlistedCount ?? 0}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-6">
            <div className="text-sm text-gray-600">Available Internships</div>
            <div className="text-3xl font-bold text-gray-900">{internshipCount ?? 0}</div>
          </div>
        </motion.div>
      )}

      {Array.isArray(dashboardData?.recentApplications) && dashboardData.recentApplications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" /> Recent Applications
          </h3>
          <div className="space-y-3">
            {dashboardData.recentApplications.map((app) => (
              <div key={app.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{app.candidateName}</div>
                  <div className="text-sm text-gray-600">{app.position} • {app.location}</div>
                </div>
                <div className="text-sm text-gray-600">{app.appliedDate}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default EmployerDashboardOverview;

