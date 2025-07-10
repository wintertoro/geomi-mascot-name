'use client';

import { useState } from 'react';
import { 
  Plus, 
  Trophy, 
  BookOpen, 
  Star, 
  Crown, 
  Target,
  CheckCircle,
  Coins
} from './components/Icons';
import { GitHubLink } from './components/GitHubLink';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type TabType = 'main' | 'leaderboard' | 'instructions' | 'store';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('main');

  const MainContent = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="glass-card p-6 text-center">
        <h3 className="text-xl font-bold mb-4">Coming Soon!</h3>
        <p className="mb-4">The Geomi Mascot Name Voting dApp is under development.</p>
        <p className="text-sm text-gray-600">
          This will be a blockchain-based voting system where you can suggest names for our mascot Geomi and vote for your favorites using Aptos blockchain.
        </p>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-4">What You&apos;ll Be Able to Do:</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Plus size={16} className="mt-1" />
            <div>
              <strong>Suggest Names:</strong> Submit creative names for our mascot
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Star size={16} className="mt-1" />
            <div>
              <strong>Vote for Favorites:</strong> Support the names you love
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Coins size={16} className="mt-1" />
            <div>
              <strong>Purchase Vote Packs:</strong> Get more voting power
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Trophy size={16} className="mt-1" />
            <div>
              <strong>Win Prizes:</strong> Prize pool for the winning name
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="glass-card p-6 mb-6">
            <h1 className="text-4xl font-bold mb-2">🎭 Geomi Mascot Name Voting</h1>
            <p className="text-lg text-gray-600">Help us choose the perfect name for our beloved mascot!</p>
          </div>
          
          {/* Navigation */}
          <nav className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('main')}
              className={`glass-button ${activeTab === 'main' ? 'active' : ''}`}
            >
              <Plus size={16} className="mr-2" />
              Main
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`glass-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
            >
              <Trophy size={16} className="mr-2" />
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`glass-button ${activeTab === 'instructions' ? 'active' : ''}`}
            >
              <BookOpen size={16} className="mr-2" />
              Instructions
            </button>
            <button
              onClick={() => setActiveTab('store')}
              className={`glass-button ${activeTab === 'store' ? 'active' : ''}`}
            >
              <Coins size={16} className="mr-2" />
              Vote Store
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <main>
          {activeTab === 'main' && <MainContent />}
          {activeTab === 'leaderboard' && (
            <div className="max-w-4xl mx-auto">
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
                <p className="text-gray-600">Name suggestions and voting results will appear here when the system is live.</p>
              </div>
            </div>
          )}
          {activeTab === 'instructions' && (
            <div className="max-w-4xl mx-auto">
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold mb-4">How to Vote</h2>
                <p className="text-gray-600">Complete instructions for participating in the voting will be available when the system launches.</p>
              </div>
            </div>
          )}
          {activeTab === 'store' && (
            <div className="max-w-4xl mx-auto">
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold mb-4">Vote Store</h2>
                <p className="text-gray-600">Vote packs will be available for purchase when the system is live.</p>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="glass-card p-4">
            <div className="flex justify-center items-center space-x-4">
              <GitHubLink />
              <span className="text-sm text-gray-600">Built with Next.js & Aptos</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
