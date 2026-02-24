/**
 * Dashboard Page
 * User dashboard with scan history and policies
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getUserScans, getUserPolicies } from '@/lib/supabase';

interface Scan {
  id: string;
  url: string;
  domain: string;
  jurisdiction: string;
  ampel: string;
  confidence: number;
  created_at: string;
}

interface Policy {
  id: string;
  scan_id: string;
  jurisdiction: string;
  created_at: string;
  format: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [loading, isAuthenticated, router]);

  // Load user data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const userScans = await getUserScans();
        const userPolicies = await getUserPolicies();

        setScans(userScans || []);
        setPolicies(userPolicies || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load data'
        );
      } finally {
        setLoadingData(false);
      }
    };

    if (isAuthenticated && !loadingData) {
      loadData();
    }
  }, [isAuthenticated, user, loadingData]);

  // Handle sign out
  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      router.push('/');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📊 Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome, <strong>{user?.email}</strong>
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          
            href="/scanner"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-bold text-gray-900">New Scan</h3>
            <p className="text-gray-600 text-sm">Scan a website</p>
          </a>

          <div className="bg-indigo-50 p-6 rounded-lg shadow-md border-2 border-indigo-200 text-center">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="font-bold text-gray-900">{scans.length}</h3>
            <p className="text-gray-600 text-sm">Total Scans</p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg shadow-md border-2 border-green-200 text-center">
            <div className="text-3xl mb-2">📄</div>
            <h3 className="font-bold text-gray-900">{policies.length}</h3>
            <p className="text-gray-600 text-sm">Policies Generated</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            ❌ {error}
          </div>
        )}

        {/* Scans Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🔍 Recent Scans
          </h2>

          {loadingData ? (
            <div className="text-center text-gray-600">Loading scans...</div>
          ) : scans.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-600 mb-4">No scans yet</p>
              
                href="/scanner"
                className="inline-block bg-indigo-600 text-white px-6 py-2 rounded font-semibold hover:bg-indigo-700"
              >
                Start a Scan
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        {scan.domain}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-3xl">{scan.ampel}</div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>{scan.jurisdiction}</strong>
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${scan.confidence}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      Confidence: {scan.confidence}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Policies Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📄 Generated Policies
          </h2>

          {policies.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-600">No policies generated yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 mb-1">
                      {policy.jurisdiction} Policy
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(policy.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <button className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700">
                    📥 Download {policy.format.toUpperCase()}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}