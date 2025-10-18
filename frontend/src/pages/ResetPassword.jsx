import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Extract token and email from the reset link query params
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  useEffect(() => {
    // Basic validation: ensure token and email exist; otherwise, redirect
    if (!token || !email) {
      setError('Invalid or missing reset link. Please request a new one.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      setError('Password must contain both uppercase and lowercase letters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token || !email) {
      setError('Invalid reset link');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword: password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage('Password reset successful. You can now log in.');
        // Redirect to login after a short delay
        setTimeout(() => navigate('/auth'), 1500);
      } else {
        setError(data.message || 'Failed to reset password. The link may be invalid or expired.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Server error while resetting password. Please try again.');
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Reset Password</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter and confirm your new password for <span className="font-medium">{email || 'your account'}</span>.
        </p>

        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200 mb-3">{error}</div>
        )}
        {successMessage && (
          <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm border border-green-200 mb-3">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="New password"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Confirm password"
              autoComplete="new-password"
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            disabled={loading}
            className="w-full btn-primary inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </motion.button>

          <div className="text-center">
            <a href="/auth" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Back to login</a>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;