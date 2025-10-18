import React from 'react';
import { motion } from 'framer-motion';
import { FileText, RefreshCw, Eye } from 'lucide-react';

const EmployerApplications = ({
  applications,
  loadingApplications,
  applicationFilters,
  setApplicationFilters,
  internships,
  loadApplications,
  viewApplicationDetails,
  handleStatusUpdate,
  assignTest,
  resetTest,
  assigningTest
}) => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-blue-600" />
            Internship Applications
          </h2>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadApplications}
              disabled={loadingApplications}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 inline mr-2 ${loadingApplications ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={applicationFilters.status}
              onChange={(e) => setApplicationFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Internship</label>
            <select
              value={applicationFilters.internshipId}
              onChange={(e) => setApplicationFilters(prev => ({ ...prev, internshipId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Internships</option>
              {internships.map(internship => (
                <option key={internship._id} value={internship._id}>
                  {internship.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={applicationFilters.search}
              onChange={(e) => setApplicationFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loadingApplications ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600">Applications for your internships will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">Candidate</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">Email</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">Internship</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">Applied</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">Experience</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">Test Attended</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">Reason</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((application) => (
                  <tr key={application._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-900">{application.personalDetails?.fullName || 'N/A'}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-gray-600">{application.personalDetails?.emailAddress || 'N/A'}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-blue-600">{application.internshipDetails?.title || 'Internship'}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-gray-600">{new Date(application.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-gray-600">{
                      (application.workExperience?.totalYearsExperience ?? 0) <= 0
                        ? 'Fresher'
                        : `${application.workExperience.totalYearsExperience} yrs`
                    }</td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        application.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {application.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-gray-700">{typeof application.score === 'number' || application.result ? 'Yes' : (application.status === 'test-assigned' ? 'Assigned' : 'No')}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-gray-700">{application.reason || (application.result ? (application.result === 'Failed' ? 'test failed' : 'test passed') : (application.status === 'rejected' && !application.result ? 'auto rejected' : '-'))}</td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                          onClick={() => viewApplicationDetails(application._id)}
                        >
                          <Eye className="h-4 w-4" /> View
                        </button>
                        {application.status === 'pending' && (
                          <>
                            <button
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                              onClick={() => handleStatusUpdate(application._id, 'shortlisted')}
                            >
                              Shortlist
                            </button>
                            <button
                              className="inline-flex items-center gap-1 text-red-600 hover:underline"
                              onClick={() => handleStatusUpdate(application._id, 'rejected')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {application.status === 'shortlisted' && (
                          <>
                            <button
                              className="inline-flex items-center gap-1 text-indigo-600 hover:underline disabled:opacity-50"
                              disabled={assigningTest}
                              onClick={() => assignTest(application._id)}
                            >
                              Assign Test
                            </button>
                          </>
                        )}
                        {application.result === 'Failed' && (
                          <>
                            <button
                              className="inline-flex items-center gap-1 text-orange-600 hover:underline disabled:opacity-50"
                              disabled={assigningTest}
                              onClick={() => resetTest(application._id)}
                            >
                              Reset Test
                            </button>
                          </>
                        )}
                        {['shortlisted', 'test-assigned'].includes(application.status) && (
                          <>
                            <button
                              className="inline-flex items-center gap-1 text-green-600 hover:underline"
                              onClick={() => handleStatusUpdate(application._id, 'accepted')}
                            >
                              Mark Selected
                            </button>
                          </>
                        )}
                        {application.status === 'accepted' && (
                          <span className="text-green-700">Selected</span>
                        )}
                      </div>
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
};

export default EmployerApplications;

