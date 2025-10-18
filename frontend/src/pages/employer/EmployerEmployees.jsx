import React from 'react';
import { motion } from 'framer-motion';
import { Users, RefreshCw, Mail, Phone } from 'lucide-react';

const EmployerEmployees = ({ employees, loadingEmployees, reload }) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Users className="w-6 h-6 mr-3 text-blue-600" /> Employees
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reload}
            disabled={loadingEmployees}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 inline mr-2 ${loadingEmployees ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>

        {loadingEmployees ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No employees found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map(emp => (
              <div key={emp._id} className="border border-gray-200 rounded-xl p-4 bg-white">
                <div className="font-semibold text-gray-900">{emp.name || 'Employee'}</div>
                {emp.email && (
                  <div className="text-sm text-gray-700 flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" /> {emp.email}
                  </div>
                )}
                {emp.phone && (
                  <div className="text-sm text-gray-700 flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4" /> {emp.phone}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EmployerEmployees;

