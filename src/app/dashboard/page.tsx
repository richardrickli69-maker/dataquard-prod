'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <p className="text-lg mb-6">Welcome, {user?.email}</p>
        
        <button
          onClick={() => signOut()}
          className="bg-red-600 text-white px-4 py-2 rounded mr-4"
        >
          Sign Out
        </button>
        
        <a href="/scanner" className="bg-blue-600 text-white px-4 py-2 rounded">
          Scanner
        </a>
      </div>
    </div>
  );
}