'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AnalyticsData {
  totalScans: number;
  scansByDomain: { domain: string; count: number }[];
  scansByJurisdiction: { nDSG: number; GDPR: number };
  conversionMetrics: {
    totalScans: number;
    totalConversions: number;
    conversionRate: number;
    conversionByPlan: { essential: number; professional: number };
  };
  revenue: {
    totalRevenue: number;
    essential: { count: number; revenue: number };
    professional: { count: number; revenue: number };
  };
  monthlyRevenue: { month: string; revenue: number }[];
  topCountries: { country: string; scans: number; revenue: number }[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (!loading && isAuthenticated) {
      const fetchAnalytics = async () => {
        try {
          setLoadingData(true);
          const response = await fetch('/api/analytics');
          const result = await response.json();
          
          if (result.success && result.data) {
            setData(result.data);
            setError(null);
          } else {
            setError('Failed to load analytics data');
            setData(null);
          }
        } catch (err) {
          console.error('Error fetching analytics:', err);
          setError('Error loading analytics');
          setData(null);
        } finally {
          setLoadingData(false);
        }
      };

      fetchAnalytics();
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white flex items-center justify-center">
        <p className="text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white flex items-center justify-center">
        <p className="text-gray-300">Loading analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-4">{error || 'No data available'}</p>
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📊 Analytics Dashboard</h1>
            <p className="text-gray-300">Your business intelligence at a glance</p>
          </div>
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 p-6 rounded-lg">
            <div className="text-gray-400 text-sm mb-2">Total Scans</div>
            <div className="text-4xl font-bold text-indigo-400">{data.totalScans.toLocaleString()}</div>
          </div>

          <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 p-6 rounded-lg">
            <div className="text-gray-400 text-sm mb-2">Total Revenue</div>
            <div className="text-4xl font-bold text-green-400">CHF {data.revenue.totalRevenue.toLocaleString()}</div>
          </div>

          <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 p-6 rounded-lg">
            <div className="text-gray-400 text-sm mb-2">Conversions</div>
            <div className="text-4xl font-bold text-purple-400">{data.conversionMetrics.totalConversions}</div>
            <div className="text-sm text-gray-400 mt-2">{data.conversionMetrics.conversionRate.toFixed(2)}% rate</div>
          </div>

          <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 p-6 rounded-lg">
            <div className="text-gray-400 text-sm mb-2">Avg Revenue/Scan</div>
            <div className="text-4xl font-bold text-yellow-400">
              CHF {(data.revenue.totalRevenue / data.totalScans).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-6">💳 Plan Breakdown</h2>
            
            <div className="space-y-4">
              <div className="bg-indigo-800 bg-opacity-50 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-bold">ESSENTIAL (CHF 49/year)</span>
                  <span className="text-green-400 font-bold">{data.revenue.essential.count} sales</span>
                </div>
                <div className="text-gray-300">Revenue: CHF {data.revenue.essential.revenue.toLocaleString()}</div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(data.revenue.essential.revenue / data.revenue.totalRevenue) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-indigo-800 bg-opacity-50 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-bold">PROFESSIONAL (CHF 159 one-time)</span>
                  <span className="text-purple-400 font-bold">{data.revenue.professional.count} sales</span>
                </div>
                <div className="text-gray-300">Revenue: CHF {data.revenue.professional.revenue.toLocaleString()}</div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${(data.revenue.professional.revenue / data.revenue.totalRevenue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-6">🌍 Jurisdiction Split</h2>
            
            <div className="space-y-4">
              <div className="bg-indigo-800 bg-opacity-50 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-bold">🇨🇭 nDSG (Switzerland)</span>
                  <span className="text-blue-400 font-bold">{data.scansByJurisdiction.nDSG} scans</span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(data.scansByJurisdiction.nDSG / data.totalScans) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  {((data.scansByJurisdiction.nDSG / data.totalScans) * 100).toFixed(1)}% of scans
                </div>
              </div>

              <div className="bg-indigo-800 bg-opacity-50 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-bold">🇪🇺 GDPR (EU)</span>
                  <span className="text-orange-400 font-bold">{data.scansByJurisdiction.GDPR} scans</span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${(data.scansByJurisdiction.GDPR / data.totalScans) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  {((data.scansByJurisdiction.GDPR / data.totalScans) * 100).toFixed(1)}% of scans
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-6">🏆 Top Countries by Revenue</h2>
          
          <div className="space-y-4">
            {data.topCountries.map((country, idx) => (
              <div key={idx} className="bg-indigo-800 bg-opacity-50 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-bold">{idx + 1}. {country.country}</span>
                  <span className="text-green-400 font-bold">CHF {country.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>{country.scans} scans</span>
                  <span>CHF {(country.revenue / country.scans).toFixed(2)}/scan</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(country.revenue / data.revenue.totalRevenue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}