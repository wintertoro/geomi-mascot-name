'use client';

import dynamicImport from 'next/dynamic';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

// Dynamically import the entire app content to prevent SSR issues with wallet hooks
const AppContent = dynamicImport(() => import('./components/AppContent'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-black">Loading application...</p>
      </div>
    </div>
  )
});

export default function App() {
  return <AppContent />;
}
