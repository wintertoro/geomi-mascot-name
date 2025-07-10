'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import WalletConnection to prevent SSR issues
const WalletConnection = dynamic(
  () => import('./components/WalletConnection').then(mod => ({ default: mod.WalletConnection })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-3 p-3 border border-black">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-sm text-black/60">Loading wallet...</span>
        </div>
      </div>
    )
  }
);

export default function App() {
  const [message, setMessage] = useState('Geomi Mascot Voting App');
  const [activeTab, setActiveTab] = useState<'main' | 'leaderboard' | 'my-suggestions' | 'store' | 'instructions'>('main');

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 border-b border-black pb-6">
          <h1 className="text-3xl font-bold mb-2 text-black">Name Geomi&apos;s Mascot</h1>
          <p className="text-black">Help choose the perfect name for our mascot</p>
          
          {/* Wallet Connection */}
          <div className="mt-4 flex justify-center">
            <WalletConnection />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'main', label: 'Suggest Names' },
            { id: 'leaderboard', label: 'Vote & Leaderboard' },
            { id: 'my-suggestions', label: 'My Suggestions' },
            { id: 'store', label: 'Buy Votes' },
            { id: 'instructions', label: 'How to Vote' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 border border-black ${
                activeTab === tab.id 
                  ? 'bg-black text-white' 
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="border border-black p-6">
          {activeTab === 'main' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-black">Suggest Names</h2>
              <p className="text-black mb-4">
                Help us choose the perfect name for our mascot! You can suggest up to 10 names.
              </p>
              <div className="mb-4 p-4 border border-black bg-gray-50">
                <h3 className="font-bold text-black mb-2">✨ How Voting Works:</h3>
                <ul className="text-black text-sm space-y-1">
                  <li>• <strong>Free Votes:</strong> Vote once on each name for free</li>
                  <li>• <strong>Boost Votes:</strong> Buy vote packs to vote multiple times on the same name</li>
                  <li>• <strong>Suggestions:</strong> Submit up to 10 creative names</li>
                </ul>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-black mb-2">Your Name Suggestion:</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-black"
                    placeholder="Enter a creative name..."
                  />
                </div>
                <button className="px-6 py-2 bg-black text-white hover:bg-gray-800">
                  Submit Suggestion
                </button>
                <div className="mt-4 p-4 border border-black">
                  <p className="text-black">
                    <strong>Suggestions remaining:</strong> 10/10
                  </p>
                  <p className="text-black text-sm mt-2">
                    Connect your wallet to see your current suggestions count.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-black">Vote & Leaderboard</h2>
              <p className="text-black mb-4">Vote for your favorite names and see the current rankings</p>
              <div className="mb-6 p-4 border border-black bg-blue-50">
                <h3 className="font-bold text-black mb-2">🗳️ Voting Rules:</h3>
                <ul className="text-black text-sm space-y-1">
                  <li>• Each user can vote <strong>once for free</strong> on every name</li>
                  <li>• Purchase boost votes to vote <strong>multiple times</strong> on the same name</li>
                  <li>• Free votes and boost votes are counted separately</li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="border border-black p-4">
                  <h3 className="font-bold text-black mb-2">Top Names</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border border-black">
                      <div>
                        <span className="text-black font-bold">1. Geomi</span>
                        <div className="text-xs text-gray-600">Free: 0 | Boost: 0</div>
                      </div>
                      <div className="text-right">
                        <span className="text-black font-bold">0 total</span>
                        <button className="ml-2 px-2 py-1 text-xs bg-black text-white hover:bg-gray-800">
                          Vote Free
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 border border-black">
                      <div>
                        <span className="text-black font-bold">2. Mascot</span>
                        <div className="text-xs text-gray-600">Free: 0 | Boost: 0</div>
                      </div>
                      <div className="text-right">
                        <span className="text-black font-bold">0 total</span>
                        <button className="ml-2 px-2 py-1 text-xs bg-black text-white hover:bg-gray-800">
                          Vote Free
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 border border-black">
                      <div>
                        <span className="text-black font-bold">3. Friend</span>
                        <div className="text-xs text-gray-600">Free: 0 | Boost: 0</div>
                      </div>
                      <div className="text-right">
                        <span className="text-black font-bold">0 total</span>
                        <button className="ml-2 px-2 py-1 text-xs bg-black text-white hover:bg-gray-800">
                          Vote Free
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'my-suggestions' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-black">My Suggestions</h2>
              <p className="text-black mb-4">
                Track your suggested names and their performance. You can suggest up to 10 names total.
              </p>
              <div className="border border-black p-4">
                <p className="text-black mb-3">Connect your wallet to view your suggestions.</p>
                <div className="text-sm text-gray-600">
                  <p><strong>Business Rules:</strong></p>
                  <ul className="mt-1 space-y-1">
                    <li>• Maximum 10 suggestions per user</li>
                    <li>• Each suggestion must be unique</li>
                    <li>• Track votes received on your suggestions</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'store' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-black">Buy Votes</h2>
              <p className="text-black mb-6">Purchase vote packs to support your favorite names</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-black p-4">
                  <h3 className="font-bold text-black mb-2">Basic Pack</h3>
                  <p className="text-black mb-2">10 votes for 0.1 APT</p>
                  <p className="text-xs text-black/60 mb-3">Great for getting started</p>
                  <button className="w-full px-4 py-2 bg-black text-white hover:bg-gray-800">
                    Buy Basic Pack
                  </button>
                </div>
                <div className="border border-black p-4 relative">
                  <div className="absolute -top-2 -right-2 bg-black text-white text-xs px-2 py-1">
                    Most Popular
                  </div>
                  <h3 className="font-bold text-black mb-2">Standard Pack</h3>
                  <p className="text-black mb-2">10 votes for 0.1 APT</p>
                  <p className="text-xs text-black/60 mb-3">Popular choice</p>
                  <button className="w-full px-4 py-2 bg-black text-white hover:bg-gray-800">
                    Buy Standard Pack
                  </button>
                </div>
                <div className="border border-black p-4">
                  <h3 className="font-bold text-black mb-2">Premium Pack</h3>
                  <p className="text-black mb-2">10 votes for 0.1 APT</p>
                  <p className="text-xs text-black/60 mb-3">Enhanced voting power</p>
                  <button className="w-full px-4 py-2 bg-black text-white hover:bg-gray-800">
                    Buy Premium Pack
                  </button>
                </div>
                <div className="border border-black p-4">
                  <h3 className="font-bold text-black mb-2">Ultimate Pack</h3>
                  <p className="text-black mb-2">10 votes for 0.1 APT</p>
                  <p className="text-xs text-black/60 mb-3">Maximum impact</p>
                  <button className="w-full px-4 py-2 bg-black text-white hover:bg-gray-800">
                    Buy Ultimate Pack
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-black">How to Vote</h2>
              <div className="space-y-4 text-black">
                <div className="border border-black p-4">
                  <h3 className="font-bold mb-2">1. Connect Your Wallet</h3>
                  <p>Connect your Aptos wallet to participate in voting</p>
                </div>
                <div className="border border-black p-4">
                  <h3 className="font-bold mb-2">2. Suggest Names</h3>
                  <p>Submit up to 10 creative names for our mascot</p>
                </div>
                <div className="border border-black p-4">
                  <h3 className="font-bold mb-2">3. Vote for Free</h3>
                  <p>Vote once on each name for free - unlimited names to vote on!</p>
                </div>
                <div className="border border-black p-4">
                  <h3 className="font-bold mb-2">4. Buy Boost Votes (Optional)</h3>
                  <p>Purchase vote packs to vote multiple times on the same name</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
