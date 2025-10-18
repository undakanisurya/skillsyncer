import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, User, Shield, Bell, Palette } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header (dashboard-style) */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                title="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">Settings</h1>
                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                  <Link to="/" className="hover:text-gray-700">Home</Link>
                  <ChevronRight className="h-3 w-3 mx-1" />
                  <span>Settings</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium">
                Settings Panel
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">Profile</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Update your personal information</p>
            <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Edit Profile</button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">Security</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Change your password and security settings</p>
            <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Update Password</button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Control email and in-app notifications</p>
            <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Manage</button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
                <Palette className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">Appearance</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Theme and accessibility preferences</p>
            <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Open</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;


