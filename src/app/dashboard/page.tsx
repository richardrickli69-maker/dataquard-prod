'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-300">Welcome to Dataquard</p>
          </div>
          <Link href="/checkout" className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
            📊 Upgrade Plan
          </Link>
        </div>

        {user && (
          <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-8 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Welcome, {user.email}!</h2>
            <p className="text-gray-300 mb-6">Your Dataquard Dashboard is ready.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-2">📊 Scans</h3>
                <p className="text-3xl font-bold text-indigo-400">0</p>
                <p className="text-gray-400">Total scans performed</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-2">💰 Revenue</h3>
                <p className="text-3xl font-bold text-indigo-400">CHF 0</p>
                <p className="text-gray-400">Total revenue</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-2">⚙️ Status</h3>
                <p className="text-3xl font-bold text-green-400">✓</p>
                <p className="text-gray-400">System operational</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">🚀 Quick Actions</h2>
          
          <div className="space-y-3">
            <Link href="/scanner" className="block w-full px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-center font-bold">
              🔍 Start Website Scan
            </Link>
            
            <Link href="/checkout" className="block w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-center font-bold">
              📈 View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}