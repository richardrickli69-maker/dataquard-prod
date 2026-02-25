'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface Scan {
  id: string;
  url: string;
  domain: string;
  jurisdiction: string;
  ampel: string;
  confidence: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const loadScans = async () => {
      if (!user) return;
      try {
        setScans([
          {
            id: '1',
            url: 'example.ch',
            domain: 'example.ch',
            jurisdiction: 'nDSG',
            ampel: '🟢',
            confidence: 95,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoadingData(false);
      }
    };
    if (isAuthenticated) loadScans();
  }, [isAuthenticated, user]);

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.email}</p>
          </div>
          <button onClick={handleSignOut} className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-700">
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <a href="/scanner" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center">
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
            <h3 className="font-bold text-gray-900">0</h3>
            <p className="text-gray-600 text-sm">Policies</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Scans</h2>
          {loadingData ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : scans.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-600 mb-4">No scans yet</p>
              <a href="/scanner" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded font-semibold hover:bg-indigo-700">
                Start Scan
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scans.map((scan) => (
                <div key={scan.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{scan.domain}</h3>
                      <p className="text-sm text-gray-600">{new Date(scan.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-3xl">{scan.ampel}</div>
                  </div>
                  <p className="text-gray-700 mb-2"><strong>{scan.jurisdiction}</strong></p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${scan.confidence}%` }} />
                  </div>
                  <p className="text-xs text-gray-600">Confidence: {scan.confidence}%</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Policies</h2>
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 mb-4">No policies yet</p>
            <a href="/checkout" className="inline-block bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700">
              Generate Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}