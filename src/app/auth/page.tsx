'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  // Redirect if authenticated - use effect to avoid render issue
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setIsAuthenticated(true);
        // Router.push will be called by useEffect
      }
    } catch (err) {
      setError('An error occurred during sign in');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setError(''); // Clear error
        setIsAuthenticated(true);
        // Router.push will be called by useEffect
      }
    } catch (err) {
      setError('An error occurred during sign up');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render form if authenticated (useEffect will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🔐 Dataquard</h1>
          <p className="text-gray-300">Secure Privacy Compliance</p>
        </div>

        <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>

          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setEmail('');
                setPassword('');
              }}
              className="text-indigo-300 hover:text-indigo-200"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </div>

          {/* Test Account Info */}
          {!isSignUp && (
            <div className="mt-8 pt-6 border-t border-gray-600">
              <p className="text-sm text-gray-300 mb-3">🧪 Test Account:</p>
              <p className="text-xs text-gray-400 mb-1">
                Email: <code className="bg-gray-800 px-2 py-1 rounded">test@dataquard.ch</code>
              </p>
              <p className="text-xs text-gray-400">
                Password: <code className="bg-gray-800 px-2 py-1 rounded">test123456</code>
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>
            Back to{' '}
            <Link href="/" className="text-indigo-400 hover:text-indigo-300">
              Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}