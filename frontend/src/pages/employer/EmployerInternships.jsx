import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Building, Calendar, Users } from 'lucide-react';

const EmployerInternships = ({
  internships,
  loadingInternships,
  error,
  successMessage,
  onCreate,
  onEdit,
  onView,
  onDelete,
  setShowInternshipForm
}) => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Internship Postings</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowInternshipForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Post Internship
          </motion.button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 border border-green-200">{successMessage}</div>
        )}

        {loadingInternships ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading internships...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {internships.map((internship, index) => (
              <motion.div
                key={internship._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{internship.title}</h4>
                    <p className="text-blue-600 font-medium">{internship.companyName}</p>
                    <p className="text-gray-600 mt-2">{internship.description}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Building className="w-4 h-4 mr-1" />
                        {internship.industry}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Posted {internship.createdAt ? new Date(internship.createdAt).toLocaleDateString() : '-'}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {(internship.applications || []).length} applications
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <motion.button whileHover={{ scale: 1.05 }} className="p-2 rounded-lg border" onClick={() => onView(internship)}>
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} className="p-2 rounded-lg border" onClick={() => onEdit(internship)}>
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} className="p-2 rounded-lg border text-red-600" onClick={() => onDelete(internship._id)}>
                      <Trash2 className="w-4 h-4" />
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
};

export default EmployerInternships;

