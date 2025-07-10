'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { blockchainService } from '../services/blockchain';

// Dynamically import WalletConnection to prevent SSR issues
const WalletConnection = dynamic(
  () => import('./WalletConnection'),
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

export default function AppContent() {
  const [activeTab, setActiveTab] = useState<'main' | 'leaderboard' | 'my-suggestions' | 'store' | 'instructions'>('main');
  
  // Suggestion submission state
  const [suggestionInput, setSuggestionInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [userAccount, setUserAccount] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isVoting, setIsVoting] = useState<string>(''); // Track which suggestion is being voted on
  const [voteMessage, setVoteMessage] = useState('');
  
  // Wallet integration
  const { account, connected, signAndSubmitTransaction } = useWallet();

  const loadUserData = useCallback(async () => {
    // Only load on client-side to prevent SSR issues
    if (typeof window === 'undefined' || !account) return;
    
    try {
      const userData = await blockchainService.getUserAccount(account.address.toString());
      setUserAccount(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [account]);

  const loadSuggestions = useCallback(async () => {
    // Only load on client-side to prevent SSR issues
    if (typeof window === 'undefined') return;
    
    try {
      const suggestionsList = await blockchainService.getSuggestions();
      setSuggestions(suggestionsList);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  }, []);

  // Load suggestions on component mount (client-side only)
  useEffect(() => {
    // Only load on client-side to prevent SSR issues
    if (typeof window !== 'undefined') {
      // Check blockchain service configuration
      const configStatus = blockchainService.getConfigurationStatus();
      console.log('Blockchain service configuration:', configStatus);
      
      if (configStatus.configured) {
        console.log('✅ Blockchain service is properly configured');
        loadSuggestions();
      } else {
        console.error('❌ Blockchain service configuration error:', configStatus.error);
      }
    }
  }, [loadSuggestions]);

  // Load user account when wallet connects
  useEffect(() => {
    if (connected && account) {
      loadUserData();
    }
  }, [connected, account, loadUserData]);

  const handleSubmitSuggestion = async () => {
    if (!connected || !account) {
      setSubmitMessage('Please connect your wallet first');
      return;
    }

    if (!suggestionInput.trim()) {
      setSubmitMessage('Please enter a name suggestion');
      return;
    }

    if (suggestionInput.trim().length < 2) {
      setSubmitMessage('Name must be at least 2 characters long');
      return;
    }

    if (suggestionInput.trim().length > 50) {
      setSubmitMessage('Name must be less than 50 characters');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const txHash = await blockchainService.suggestName(
        account.address.toString(),
        suggestionInput.trim(),
        signAndSubmitTransaction
      );
      
      setSubmitMessage('Suggestion submitted successfully!');
      setSuggestionInput('');
      
      // Reload user data and suggestions after successful submission
      setTimeout(() => {
        loadUserData();
        loadSuggestions();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error submitting suggestion:', error);
      let errorMessage = 'Failed to submit suggestion';
      
      if (error.message) {
        if (error.message.includes('E_DUPLICATE_NAME')) {
          errorMessage = 'This name has already been suggested';
        } else if (error.message.includes('E_MAX_SUGGESTIONS_REACHED')) {
          errorMessage = 'You have reached the maximum number of suggestions (10)';
        } else if (error.message.includes('E_VOTING_ENDED')) {
          errorMessage = 'Voting period has ended';
        } else if (error.message.includes('Contract address')) {
          errorMessage = 'Contract not configured. Please check the setup.';
        }
      }
      
      setSubmitMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRemainingsuggestions = () => {
    if (!userAccount) return '10';
    return `${Math.max(0, 10 - userAccount.suggestionsCount)}`;
  };

  const handleVote = async (suggestionId: string, isBoostVote: boolean = false) => {
    if (!connected || !account) {
      setVoteMessage('Please connect your wallet first');
      return;
    }

    setIsVoting(suggestionId);
    setVoteMessage('');

    try {
      const txHash = await blockchainService.castVote(
        account.address.toString(),
        parseInt(suggestionId),
        isBoostVote,
        signAndSubmitTransaction
      );
      
      setVoteMessage(`Vote cast successfully!`);
      
      // Reload suggestions and user data after successful vote
      setTimeout(() => {
        loadSuggestions();
        loadUserData();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error casting vote:', error);
      let errorMessage = 'Failed to cast vote';
      
      if (error.message) {
        if (error.message.includes('E_ALREADY_VOTED_FREE')) {
          errorMessage = 'You have already voted for this name with a free vote';
        } else if (error.message.includes('E_INSUFFICIENT_PAYMENT')) {
          errorMessage = 'You don\'t have enough boost votes';
        } else if (error.message.includes('E_VOTING_ENDED')) {
          errorMessage = 'Voting period has ended';
        } else if (error.message.includes('Contract address')) {
          errorMessage = 'Contract not configured. Please check the setup.';
        }
      }
      
      setVoteMessage(errorMessage);
    } finally {
      setIsVoting('');
    }
  };

  const getSortedSuggestions = () => {
    return [...suggestions].sort((a, b) => b.totalVotes - a.totalVotes);
  };

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
          
          {/* Configuration Status */}
          <div className="mt-2 text-xs text-center">
            {blockchainService.isConfigured() ? (
              <span className="text-green-600">✅ Blockchain service connected</span>
            ) : (
              <span className="text-red-600">❌ Blockchain service not configured</span>
            )}
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
              type="button"
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
                  <label htmlFor="suggestionInput" className="block text-black mb-2">Your Name Suggestion:</label>
                  <input 
                    id="suggestionInput"
                    type="text" 
                    className="w-full p-2 border border-black"
                    placeholder="Enter a creative name..."
                    value={suggestionInput}
                    onChange={(e) => setSuggestionInput(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <button 
                  type="button"
                  className="px-6 py-2 bg-black text-white hover:bg-gray-800"
                  onClick={handleSubmitSuggestion}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
                </button>
                {submitMessage && (
                  <p className={`text-black mt-2 ${submitMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                    {submitMessage}
                  </p>
                )}
                <div className="mt-4 p-4 border border-black">
                  <p className="text-black">
                    <strong>Suggestions remaining:</strong> {getRemainingsuggestions()}/10
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
              {voteMessage && (
                <div className={`mb-4 p-3 border border-black ${voteMessage.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {voteMessage}
                </div>
              )}
              <div className="space-y-4">
                <div className="border border-black p-4">
                  <h3 className="font-bold text-black mb-2">Top Names</h3>
                  {suggestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No suggestions yet!</p>
                      <p className="text-sm mt-1">Be the first to suggest a name in the &quot;Suggest Names&quot; tab</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getSortedSuggestions().map((suggestion, index) => (
                        <div key={suggestion.id} className="flex justify-between items-center p-2 border border-black">
                          <div>
                            <span className="text-black font-bold">{index + 1}. {suggestion.name}</span>
                            <div className="text-xs text-gray-600">
                              Free: {suggestion.freeVotes} | Boost: {suggestion.boostVotes}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-black font-bold">{suggestion.totalVotes} total</span>
                            <button 
                              type="button" 
                              className="ml-2 px-2 py-1 text-xs bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                              onClick={() => handleVote(suggestion.id, false)}
                              disabled={isVoting === suggestion.id || !connected}
                            >
                              {isVoting === suggestion.id ? 'Voting...' : 'Vote Free'}
                            </button>
                            {userAccount && userAccount.boostVotesOwned > 0 && (
                              <button 
                                type="button" 
                                className="ml-1 px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                onClick={() => handleVote(suggestion.id, true)}
                                disabled={isVoting === suggestion.id || !connected}
                              >
                                {isVoting === suggestion.id ? 'Voting...' : 'Boost Vote'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  <button type="button" className="w-full px-4 py-2 bg-black text-white hover:bg-gray-800">
                    Buy Basic Pack
                  </button>
                </div>
                <div className="border border-black p-4 relative">
                  <div className="absolute -top-2 -right-2 bg-black text-white text-xs px-2 py-1">
                    Most Popular
                  </div>
                  <h3 className="font-bold text-black mb-2">Standard Pack</h3>
                  <p className="text-black mb-2">25 votes for 0.3 APT</p>
                  <p className="text-xs text-black/60 mb-3">Popular choice</p>
                  <button type="button" className="w-full px-4 py-2 bg-black text-white hover:bg-gray-800">
                    Buy Standard Pack
                  </button>
                </div>
                <div className="border border-black p-4">
                  <h3 className="font-bold text-black mb-2">Premium Pack</h3>
                  <p className="text-black mb-2">50 votes for 0.6 APT</p>
                  <p className="text-xs text-black/60 mb-3">Enhanced voting power</p>
                  <button type="button" className="w-full px-4 py-2 bg-black text-white hover:bg-gray-800">
                    Buy Premium Pack
                  </button>
                </div>
                <div className="border border-black p-4">
                  <h3 className="font-bold text-black mb-2">Ultimate Pack</h3>
                  <p className="text-black mb-2">100 votes for 1.0 APT</p>
                  <p className="text-xs text-black/60 mb-3">Maximum impact</p>
                  <button type="button" className="w-full px-4 py-2 bg-black text-white hover:bg-gray-800">
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