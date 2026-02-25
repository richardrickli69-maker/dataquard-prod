'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white">
      <nav className="flex justify-between items-center px-8 py-6 border-b border-indigo-700">
        <h1 className="text-3xl font-bold">🔒 Dataquard</h1>
        <a href="/scanner" className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700">Try Now</a>
      </nav>

      <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-6xl font-bold mb-6">Your Website is Legally Safe?</h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl">Instant compliance & performance analysis. GDPR + nDSG checks. Fix issues in minutes.</p>
        
        <div className="flex gap-4 mb-12">
          <a href="/scanner" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Test Website Free</a>
          <a href="#features" className="px-8 py-4 border-2 border-indigo-600 text-indigo-400 font-bold rounded-lg hover:bg-indigo-600">Learn More</a>
        </div>

        <div className="flex gap-12">
          <div><div className="text-3xl font-bold text-indigo-400">25K+</div><div className="text-gray-400">Scanned</div></div>
          <div><div className="text-3xl font-bold text-indigo-400">98%</div><div className="text-gray-400">Accurate</div></div>
          <div><div className="text-3xl font-bold text-indigo-400">15</div><div className="text-gray-400">Checks</div></div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 bg-black bg-opacity-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Complete Website Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-indigo-900 p-8 rounded-lg border border-indigo-700">
              <div className="text-4xl mb-4">🟢🟡🔴</div>
              <h3 className="text-2xl font-bold mb-2">Compliance</h3>
              <p className="text-gray-300">GDPR & nDSG checks with recommendations</p>
            </div>
            <div className="bg-indigo-900 p-8 rounded-lg border border-indigo-700">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-2">Performance</h3>
              <p className="text-gray-300">Speed and technical analysis</p>
            </div>
            <div className="bg-indigo-900 p-8 rounded-lg border border-indigo-700">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-2">Trust</h3>
              <p className="text-gray-300">Security and professional indicators</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-gray-500 border-t border-gray-800">
        <p>&copy; 2026 Dataquard</p>
      </footer>
    </div>
  );
}