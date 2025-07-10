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
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'main', label: 'Suggest Names' },
            { id: 'leaderboard', label: 'Vote & Leaderboard' },
            { id: 'my-suggestions', label: 'My Suggestions' },
            { id: 'store', label: 'Vote Store' },
            { id: 'instructions', label: 'How to Vote' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 border border-black font-medium ${
                activeTab === tab.id 
                  ? 'bg-black text-white' 
                  : 'bg-white text-black hover:bg-gray-100'
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
              <h2 className="text-2xl font-bold mb-4 text-black">Suggest a Name</h2>
              <p className="text-black mb-6">
                Help us choose the perfect name for our beloved mascot. You can suggest up to 10 names!
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter a creative name..."
                  className="w-full px-4 py-2 border border-black focus:outline-none"
                />
                <button className="w-full bg-black text-white py-2 px-4 hover:bg-gray-800">
                  Submit Name
                </button>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-black">Leaderboard</h2>
              <p className="text-black">Vote for your favorite names and see which ones are winning!</p>
              <div className="mt-6 space-y-2">
                <div className="border border-black p-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Sample Name 1</span>
                    <span>42 votes</span>
                  </div>
                </div>
                <div className="border border-black p-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Sample Name 2</span>
                    <span>38 votes</span>
                  </div>
                </div>
                <div className="border border-black p-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Sample Name 3</span>
                    <span>35 votes</span>
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
              <h2 className="text-2xl font-bold mb-4 text-black">Vote Store</h2>
              <p className="text-black mb-6">Purchase vote packs to support your favorite names</p>
              <div className="space-y-4">
                <div className="border border-black p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">5 Vote Pack</h3>
                      <p className="text-sm">5 additional votes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">1.0 APT</p>
                      <button className="bg-black text-white px-3 py-1 text-sm">Buy</button>
                    </div>
                  </div>
                </div>
                <div className="border border-black p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">10 Vote Pack</h3>
                      <p className="text-sm">10 additional votes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">1.8 APT</p>
                      <button className="bg-black text-white px-3 py-1 text-sm">Buy</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-black">How to Vote</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-2">Getting Started</h3>
                  <ol className="list-decimal list-inside text-black space-y-1">
                    <li>Connect your Aptos wallet</li>
                    <li>Register to get your free vote</li>
                    <li>Suggest creative names (up to 10 suggestions)</li>
                    <li>Vote for your favorite names</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Voting Rules</h3>
                  <ul className="list-disc list-inside text-black space-y-1">
                    <li>Each user gets 1 free vote per name</li>
                    <li>Purchase boost votes for additional voting power</li>
                    <li>You can vote for multiple names</li>
                    <li>Votes cannot be changed once cast</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-black">
          <p className="text-sm text-black">Built for the Geomi community</p>
        </div>
      </div>
    </div>
  );
}
