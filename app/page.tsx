import nextDynamic from 'next/dynamic';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';

// Import AppContent as a dynamic component to prevent SSR issues
const AppContent = nextDynamic(
  () => import('./components/AppContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading application...</p>
        </div>
      </div>
    )
  }
);

export default function Page() {
  return <AppContent />;
}
