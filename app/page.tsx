'use client';

import { useState, useEffect } from 'react';

export default function App() {
  const [message, setMessage] = useState('Geomi Mascot Voting App');
  const [activeTab, setActiveTab] = useState<'main' | 'leaderboard' | 'my-suggestions' | 'store' | 'instructions'>('main');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              🎭
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900">Name Geomi&apos;s Mascot!</h1>
              <p className="text-lg text-gray-600">Help choose the perfect name for our beloved mascot</p>
            </div>
          </div>
        </div>

        {/* Test Tab Navigation */}
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
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          {activeTab === 'main' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Suggest a Name</h2>
              <p className="text-gray-600 mb-6">
                Help us choose the perfect name for our beloved mascot. You can suggest up to 10 names!
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter a creative name..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Submit Name
                </button>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
              <p className="text-gray-600">Vote for your favorite names and see which ones are winning!</p>
            </div>
          )}

          {activeTab === 'my-suggestions' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">My Suggestions</h2>
              <p className="text-gray-600">
                Track your suggested names and their performance. You can suggest up to 10 names total.
              </p>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Connect your wallet to view your suggestions.</p>
              </div>
            </div>
          )}

          {activeTab === 'store' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Vote Store</h2>
              <p className="text-gray-600">Purchase vote packs to support your favorite names</p>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">How to Vote</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">🎯 Getting Started</h3>
                  <ol className="list-decimal list-inside text-gray-600 mt-2">
                    <li>Connect your Aptos wallet</li>
                    <li>Register to get your free vote</li>
                    <li>Suggest creative names (up to 10 suggestions)</li>
                    <li>Vote for your favorite names</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">🗳️ Voting Rules</h3>
                  <ul className="list-disc list-inside text-gray-600 mt-2">
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
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Built with ❤️ for the Geomi community
          </p>
        </div>
      </div>
    </div>
  );
}
