import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your registered email');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed })
      });
      setSuccessMessage('If this email is registered, a reset link has been sent. Please check your inbox.');
    } catch (err) {
      console.error('Password reset error:', err);
      // Generic success to avoid email enumeration
      setSuccessMessage('If this email is registered, a reset link has been sent. Please check your inbox.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white shadow-lg rounded-xl border border-gray-100 p-6"
      >
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Forgot Password</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter your registered email, and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {successMessage && (
            <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm border border-green-200">
              {successMessage}
            </div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            disabled={loading}
            className="w-full btn-primary inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </motion.button>

          <div className="text-center">
            <a href="/auth" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Back to login</a>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;