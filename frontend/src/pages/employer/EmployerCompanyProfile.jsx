import React from 'react';
import { motion } from 'framer-motion';
import { Building, CheckCircle } from 'lucide-react';

const EmployerCompanyProfile = ({ user }) => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Building className="w-6 h-6 mr-3 text-blue-600" />
          Company Profile
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input 
                type="text" 
                value={user?.name || ''}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                value={user?.email || ''}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
              <input 
                type="url" 
                placeholder="https://yourcompany.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>1-10 employees</option>
                <option>11-50 employees</option>
                <option>51-200 employees</option>
              </select>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
              <textarea 
                rows="6"
                placeholder="Tell candidates about your company, culture, and mission..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input 
                type="text" 
                placeholder="San Francisco, CA"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Building className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Upload your company logo</p>
                <input type="file" className="hidden" accept="image/*" />
                <button className="mt-2 text-blue-600 hover:text-blue-500">Choose file</button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-8 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <CheckCircle className="w-5 h-5 inline mr-2" />
            Update Profile
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployerCompanyProfile;

