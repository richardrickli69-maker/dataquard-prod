'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      <nav className="flex justify-between items-center px-8 py-6 bg-black bg-opacity-50">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Dataquard</h1>
        </div>
        <a href="/scanner" className="text-white hover:text-indigo-400">Try Now</a>
      </nav>

      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl font-black text-white mb-6">Your Website is Legally Safe?</h1>
          <p className="text-xl text-gray-300 mb-8">Get instant analysis of compliance, performance, and trust.</p>
          <a href="/scanner" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg inline-block hover:bg-indigo-500">
            Test Your Website Free
          </a>
        </div>
      </section>

      <footer className="bg-black text-center py-8 text-gray-500">
        <p>&copy; 2026 Dataquard</p>
      </footer>
    </div>
  );
}