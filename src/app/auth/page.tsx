/**
 * Auth Page
 * Login and Sign Up functionality
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const { signUp, signIn, isAuthenticated } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;

      if (isSignUp) {
        result = await signUp(email, password);
      } else {
        result = await signIn(email, password);
      }

      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-600 mb-2">
              🔒 Dataquard
            </h1>
            <p className="text-gray-600">
              {isSignUp ? 'Create an Account' : 'Sign In'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              ❌ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full border-2 border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border-2 border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignUp
                ? 'Already have an account?'
                : "Don't have an account?"}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className="ml-2 text-indigo-600 font-semibold hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Test Credentials */}
          {!isSignUp && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-gray-600 mb-3 font-semibold">
                📝 Test Account:
              </p>
              <p className="text-xs text-gray-500 mb-1">
                Email: test@dataquard.ch
              </p>
              <p className="text-xs text-gray-500">
                Password: test123456
              </p>
              <p className="text-xs text-gray-500 mt-2">
                ℹ️ Or create a new account
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            🔐 Secure authentication with Supabase
          </p>
        </div>
      </div>
    </div>
  );
}