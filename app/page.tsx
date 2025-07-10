'use client';

import { useState, useEffect } from 'react';

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
          
          {/* Wallet Connection Placeholder */}
          <div className="mt-4 flex justify-center">
            <div className="px-4 py-2 border border-black text-black">
              Wallet connection coming soon
            </div>
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
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-black">Vote & Leaderboard</h2>
              <p className="text-black mb-6">Vote for your favorite names and see the current rankings</p>
              <div className="space-y-4">
                <div className="border border-black p-4">
                  <h3 className="font-bold text-black mb-2">Top Names</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border border-black">
                      <span className="text-black">1. Geomi</span>
                      <span className="text-black">0 votes</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border border-black">
                      <span className="text-black">2. Mascot</span>
                      <span className="text-black">0 votes</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border border-black">
                      <span className="text-black">3. Friend</span>
                      <span className="text-black">0 votes</span>
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
                <p className="text-black">Connect your wallet to view your suggestions.</p>
              </div>
            </div>
          )}

          {activeTab === 'store' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-black">Buy Votes</h2>
              <p className="text-black mb-6">Purchase vote packs to support your favorite names</p>
              <div className="space-y-4">
                <div className="border border-black p-4">
                  <h3 className="font-bold text-black mb-2">Vote Pack - Small</h3>
                  <p className="text-black mb-2">10 votes for 0.1 APT</p>
                  <button className="px-4 py-2 bg-black text-white hover:bg-gray-800">
                    Buy Small Pack
                  </button>
                </div>
                <div className="border border-black p-4">
                  <h3 className="font-bold text-black mb-2">Vote Pack - Medium</h3>
                  <p className="text-black mb-2">50 votes for 0.4 APT</p>
                  <button className="px-4 py-2 bg-black text-white hover:bg-gray-800">
                    Buy Medium Pack
                  </button>
                </div>
                <div className="border border-black p-4">
                  <h3 className="font-bold text-black mb-2">Vote Pack - Large</h3>
                  <p className="text-black mb-2">100 votes for 0.7 APT</p>
                  <button className="px-4 py-2 bg-black text-white hover:bg-gray-800">
                    Buy Large Pack
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
                  <h3 className="font-bold mb-2">3. Buy Votes</h3>
                  <p>Purchase vote packs to support your favorite names</p>
                </div>
                <div className="border border-black p-4">
                  <h3 className="font-bold mb-2">4. Vote</h3>
                  <p>Use your votes to support the names you like best</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
