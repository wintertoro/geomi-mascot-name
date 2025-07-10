'use client';

import { useState, useEffect } from 'react';

export default function App() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading application...</p>
        </div>
      </div>
    );
  }

  // Import AppContent only on client-side
  const AppContent = require('./components/AppContent').default;
  return <AppContent />;
}
