'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Trophy, Heart, Plus, DollarSign, Star, Crown, Sparkles, BookOpen, Vote, Info, Users, Coins, Target, CheckCircle } from 'lucide-react';
import { WalletConnection } from './components/WalletConnection';
import { 
  registerUser, 
  suggestName, 
  castVote, 
  purchaseVotePack, 
  getSuggestions, 
  getUserAccount, 
  getPrizePool,
  getAccountBalance,
  type NameSuggestion,
  type UserAccount,
  type VotePack 
} from './services/blockchain';

const VOTE_PACKS: VotePack[] = [
  { id: 'starter', name: 'Starter Pack', votes: 5, price: 5, aptPrice: 5 },
  { id: 'booster', name: 'Booster Pack', votes: 12, price: 10, aptPrice: 10, popular: true },
  { id: 'power', name: 'Power Pack', votes: 25, price: 20, aptPrice: 20 },
  { id: 'champion', name: 'Champion Pack', votes: 60, price: 45, aptPrice: 45 },
];

type TabType = 'main' | 'leaderboard' | 'instructions';

export default function Home() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>('main');
  const [highlightedNameId, setHighlightedNameId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<NameSuggestion[]>([]);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVoteStore, setShowVoteStore] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [prizePool, setPrizePool] = useState({ total: 0, contributors: 0 });
  const [accountBalance, setAccountBalance] = useState(0);
  const [status, setStatus] = useState<string>('');

  // Load data when wallet connects
  useEffect(() => {
    if (connected && account) {
      loadData();
    } else {
      // Reset state when disconnected
      setSuggestions([]);
      setUserAccount(null);
      setIsRegistered(false);
      setPrizePool({ total: 0, contributors: 0 });
      setAccountBalance(0);
    }
  }, [connected, account]);

  // Handle URL parameters for highlighting specific names
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const nameId = urlParams.get('highlight');
    if (nameId) {
      setHighlightedNameId(nameId);
      setActiveTab('leaderboard'); // Switch to leaderboard when highlighting a name
    }
  }, []);

  const loadData = async () => {
    if (!account) return;

    try {
      // Load suggestions
      const suggestionsData = await getSuggestions();
      setSuggestions(suggestionsData);

      // Load prize pool
      const [totalPrize, contributors] = await getPrizePool();
      setPrizePool({ 
        total: totalPrize / 100000000, // Convert from octas to APT
        contributors 
      });

      // Load account balance
      const balance = await getAccountBalance(account.address.toString());
      setAccountBalance(balance);

      // Try to load user account
      try {
        const userAccountData = await getUserAccount(account.address.toString());
        setUserAccount(userAccountData);
        setIsRegistered(true);
      } catch (error) {
        // User not registered yet
        setIsRegistered(false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setStatus('Error loading data. Contract may not be deployed.');
    }
  };

  const handleRegister = async () => {
    if (!account || !signAndSubmitTransaction) return;
    
    setIsRegistering(true);
    setStatus('Registering user...');
    
    try {
      await registerUser(account.address.toString(), signAndSubmitTransaction);
      await loadData(); // Reload data after registration
      setStatus('Registration successful! You have 1 free vote.');
    } catch (error) {
      console.error('Registration failed:', error);
      setStatus('Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !account || !userAccount || !signAndSubmitTransaction) return;
    
    setIsSubmitting(true);
    setStatus('Submitting name suggestion...');
    
    try {
      await suggestName(account.address.toString(), newName.trim(), signAndSubmitTransaction);
      setNewName('');
      await loadData(); // Reload data after submission
      setStatus('Name suggestion submitted successfully!');
    } catch (error) {
      console.error('Submission failed:', error);
      setStatus('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (suggestionId: string, isPaidVote: boolean) => {
    if (!account || !userAccount || !signAndSubmitTransaction) return;
    
    // Check voting constraints
    if (isPaidVote && userAccount.paidVotesOwned === 0) {
      setStatus('No paid votes available. Purchase vote packs to continue.');
      return;
    }
    
    if (!isPaidVote && userAccount.freeVotesRemaining === 0) {
      setStatus('No free votes remaining.');
      return;
    }

    if (!isPaidVote && userAccount.freeVotedNames.includes(suggestionId)) {
      setStatus('You already used your free vote on this name.');
      return;
    }
    
    setStatus(isPaidVote ? 'Casting paid vote...' : 'Casting free vote...');
    
    try {
      await castVote(account.address.toString(), parseInt(suggestionId), isPaidVote, signAndSubmitTransaction);
      await loadData(); // Reload data after voting
      setStatus(`${isPaidVote ? 'Paid' : 'Free'} vote cast successfully!`);
    } catch (error) {
      console.error('Vote failed:', error);
      setStatus('Vote failed. Please try again.');
    }
  };

  const handlePurchase = async (pack: VotePack) => {
    if (!account || !signAndSubmitTransaction) return;
    
    const price = pack.aptPrice ?? pack.price;
    setStatus(`Purchasing ${pack.name}...`);
    
    try {
      await purchaseVotePack(account.address.toString(), pack.id, price, signAndSubmitTransaction);
      await loadData(); // Reload data after purchase
      setStatus(`${pack.name} purchased successfully!`);
      setShowVoteStore(false);
    } catch (error) {
      console.error('Purchase failed:', error);
      setStatus('Purchase failed. Please check your balance and try again.');
    }
  };

  const sortedSuggestions = [...suggestions].sort((a, b) => b.totalVotes - a.totalVotes);
  
  // Get random suggestions for main page (excluding highlighted one)
  const getRandomSuggestions = (count: number) => {
    const filtered = suggestions.filter(s => s.id !== highlightedNameId);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Generate shareable link for a name
  const generateShareLink = (nameId: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?highlight=${nameId}`;
  };

  // Copy link to clipboard
  const copyShareLink = async (nameId: string) => {
    const link = generateShareLink(nameId);
    try {
      await navigator.clipboard.writeText(link);
      setStatus('Share link copied to clipboard!');
    } catch (err) {
      setStatus('Could not copy link to clipboard');
    }
  };

  // Main Page Component
  const MainPage = () => {
    const randomSuggestions = getRandomSuggestions(6);
    
    return (
      <div className="max-w-4xl mx-auto">
        {/* Name Suggestion Form */}
        <div className="bw-gradient-card rounded-2xl p-8 shadow-xl mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Suggest a Name for Geomi!</h2>
            <p className="text-white/80">Help us choose the perfect name for our mascot</p>
          </div>
          
          {/* Registration prompt for non-registered users */}
          {connected && !isRegistered && (
            <div className="mb-6 p-4 bg-white/10 rounded-xl">
              <p className="text-white/90 text-sm mb-3">
                Register to get your free vote and suggest names!
              </p>
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="w-full bw-btn-secondary disabled:opacity-50"
              >
                {isRegistering ? 'Registering...' : 'Register & Get Free Vote'}
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={connected ? "Enter a creative name..." : "Connect wallet to suggest names"}
                className="w-full px-6 py-4 rounded-xl bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white transition-all disabled:opacity-50 text-lg"
                disabled={!connected || !isRegistered}
                required
              />
            </div>
            <button
              type="submit"
              disabled={!connected || !isRegistered || isSubmitting || !newName.trim() || !userAccount?.freeVotesRemaining}
              className="w-full bw-btn-primary disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 text-lg py-4"
            >
              {!connected ? 'Connect Wallet to Suggest' :
               !isRegistered ? 'Register First' :
               isSubmitting ? 'Submitting...' : 
               !userAccount?.freeVotesRemaining ? 'No Free Votes Left' :
               'Submit Name (Uses Free Vote)'}
            </button>
          </form>
          
          {/* Buy Votes Button */}
          <button
            onClick={() => setShowVoteStore(true)}
            disabled={!connected || !isRegistered}
            className="w-full mt-4 bw-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <DollarSign size={20} />
            {!connected ? 'Connect Wallet to Buy Votes' : 'Buy More Votes'}
          </button>
        </div>

        {/* Random Names Preview */}
        <div className="bw-gradient-card rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Recent Suggestions</h3>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className="bw-btn-secondary flex items-center gap-2 px-4 py-2"
            >
              <Trophy size={16} />
              View All & Vote
            </button>
          </div>
          
          {randomSuggestions.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {randomSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h4 className="font-bold text-white text-lg mb-1">{suggestion.name}</h4>
                  <p className="text-white/70 text-sm mb-2">
                    {suggestion.totalVotes} vote{suggestion.totalVotes !== 1 ? 's' : ''}
                  </p>
                  <p className="text-white/60 text-xs">
                    by {suggestion.submittedBy.slice(0, 6)}...{suggestion.submittedBy.slice(-4)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/70">No suggestions yet. Be the first!</p>
            </div>
          )}
          
          <div className="text-center mt-6">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className="bw-btn-primary px-8 py-3"
            >
              Vote on All Names →
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Leaderboard Component
  const LeaderboardPage = () => {
    const highlightedSuggestion = highlightedNameId ? 
      suggestions.find(s => s.id === highlightedNameId) : null;
    const otherSuggestions = highlightedNameId ? 
      sortedSuggestions.filter(s => s.id !== highlightedNameId) : 
      sortedSuggestions;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Leaderboard</h2>
          <p className="text-white/80">Vote for your favorite names!</p>
        </div>

        {/* Highlighted Name (if coming from share link) */}
        {highlightedSuggestion && (
          <div className="mb-8">
            <div className="bw-gradient-card rounded-2xl p-6 shadow-xl ring-2 ring-white pulse-glow">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-4">
                  <Star className="text-white" size={16} />
                  <span className="text-white font-semibold">Featured Name</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-white text-2xl mb-2">{highlightedSuggestion.name}</h3>
                  <p className="text-white/70 mb-1">
                    by {highlightedSuggestion.submittedBy.slice(0, 6)}...{highlightedSuggestion.submittedBy.slice(-4)}
                  </p>
                  <div className="text-white/60 text-sm">
                    Free: {highlightedSuggestion.freeVotes} | Paid: {highlightedSuggestion.paidVotes}
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <div className="text-3xl font-bold text-white">
                    {highlightedSuggestion.totalVotes}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVote(highlightedSuggestion.id, false)}
                      disabled={!connected || !isRegistered || userAccount?.freeVotedNames.includes(highlightedSuggestion.id) || !userAccount?.freeVotesRemaining}
                      className={`flex items-center gap-1 px-4 py-2 rounded-xl font-semibold transition-all text-sm ${
                        !connected || !isRegistered
                          ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                          : userAccount?.freeVotedNames.includes(highlightedSuggestion.id) || !userAccount?.freeVotesRemaining
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-white to-gray-200 text-black hover:from-gray-100 hover:to-gray-300 transform hover:scale-105 shadow-lg border border-gray-300'
                      }`}
                      title={!connected ? 'Connect wallet to vote' : !isRegistered ? 'Register to vote' : ''}
                    >
                      <Star size={14} />
                      {!connected ? 'Free' : 
                       !isRegistered ? 'Free' :
                       userAccount?.freeVotedNames.includes(highlightedSuggestion.id) ? 'Used' : 'Free'}
                    </button>
                    
                    <button
                      onClick={() => handleVote(highlightedSuggestion.id, true)}
                      disabled={!connected || !isRegistered || !userAccount?.paidVotesOwned}
                      className={`flex items-center gap-1 px-4 py-2 rounded-xl font-semibold transition-all text-sm ${
                        !connected || !isRegistered || !userAccount?.paidVotesOwned
                          ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-gray-600 transform hover:scale-105 shadow-lg'
                      }`}
                      title={!connected ? 'Connect wallet to vote' : !isRegistered ? 'Register to vote' : !userAccount?.paidVotesOwned ? 'Buy vote packs to use paid votes' : ''}
                    >
                      <Crown size={14} />
                      Paid
                    </button>
                  </div>
                  
                  <button
                    onClick={() => copyShareLink(highlightedSuggestion.id)}
                    className="text-white/70 hover:text-white text-sm underline"
                  >
                    Share this name
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voting Rules */}
        <div className="mb-6 p-4 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl">
          <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <span className="text-black text-xs">🗳️</span>
            </div>
            Voting Rules:
          </h3>
          <ul className="text-white/90 text-sm space-y-2">
            <li>• Vote for as many names as you like</li>
            <li>• One FREE vote per name maximum</li>
            <li>• Multiple PAID votes allowed per name</li>
            <li>• Votes cannot be removed once cast</li>
          </ul>
        </div>

        {/* All Names */}
        <div className="bw-gradient-card rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">All Suggestions</h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {otherSuggestions.length > 0 ? (
              otherSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={`bw-gradient-card p-4 transition-all hover:bg-white/30 ${
                    index === 0 && !highlightedSuggestion ? 'ring-2 ring-white pulse-glow' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {index === 0 && !highlightedSuggestion && <Trophy className="text-white" size={16} />}
                        <h4 className="font-bold text-white text-lg">{suggestion.name}</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        by {suggestion.submittedBy.slice(0, 6)}...{suggestion.submittedBy.slice(-4)}
                      </p>
                      <div className="text-white/60 text-xs mt-1">
                        Free: {suggestion.freeVotes} | Paid: {suggestion.paidVotes}
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-xl font-bold text-white">
                        {suggestion.totalVotes}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVote(suggestion.id, false)}
                          disabled={!connected || !isRegistered || userAccount?.freeVotedNames.includes(suggestion.id) || !userAccount?.freeVotesRemaining}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all text-xs ${
                            !connected || !isRegistered
                              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                              : userAccount?.freeVotedNames.includes(suggestion.id) || !userAccount?.freeVotesRemaining
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                              : 'bg-gradient-to-r from-white to-gray-200 text-black hover:from-gray-100 hover:to-gray-300 transform hover:scale-105 shadow-lg border border-gray-300'
                          }`}
                          title={!connected ? 'Connect wallet to vote' : !isRegistered ? 'Register to vote' : ''}
                        >
                          <Star size={12} />
                          {!connected ? 'Free' : 
                           !isRegistered ? 'Free' :
                           userAccount?.freeVotedNames.includes(suggestion.id) ? 'Used' : 'Free'}
                        </button>
                        
                        <button
                          onClick={() => handleVote(suggestion.id, true)}
                          disabled={!connected || !isRegistered || !userAccount?.paidVotesOwned}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all text-xs ${
                            !connected || !isRegistered || !userAccount?.paidVotesOwned
                              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                              : 'bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-gray-600 transform hover:scale-105 shadow-lg'
                          }`}
                          title={!connected ? 'Connect wallet to vote' : !isRegistered ? 'Register to vote' : !userAccount?.paidVotesOwned ? 'Buy vote packs to use paid votes' : ''}
                        >
                          <Crown size={12} />
                          Paid
                        </button>
                      </div>
                      
                      <button
                        onClick={() => copyShareLink(suggestion.id)}
                        className="text-white/50 hover:text-white/80 text-xs underline"
                      >
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-white/60 mb-2">No name suggestions yet!</div>
                <div className="text-white/80 text-sm">
                  {connected ? 'Be the first to suggest a name for Geomi!' : 'Connect your wallet to suggest the first name!'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Instructions Tab Component
  const InstructionsTab = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">📖</div>
        <h1 className="text-4xl font-bold text-white mb-4">How to Vote for Geomi's Name</h1>
        <p className="text-white/90 text-lg">
          Complete guide to participating in our mascot naming contest
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Getting Started */}
        <div className="bw-gradient-card rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Users className="text-black" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Getting Started</h2>
          </div>
          <div className="space-y-3 text-white/90">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-400 mt-1" size={16} />
              <div>
                <strong>Connect Wallet:</strong> Use your Aptos wallet (Petra, Martian, etc.) to participate
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-400 mt-1" size={16} />
              <div>
                <strong>Register:</strong> Get your free vote by registering your account
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-400 mt-1" size={16} />
              <div>
                <strong>Participate:</strong> Suggest names and vote for your favorites
              </div>
            </div>
          </div>
        </div>

        {/* Voting Rules */}
        <div className="bw-gradient-card rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Vote className="text-black" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Voting Rules</h2>
          </div>
          <div className="space-y-3 text-white/90">
            <div className="flex items-start gap-3">
              <Star className="text-blue-400 mt-1" size={16} />
              <div>
                <strong>Free Votes:</strong> One free vote per name (can vote on multiple names)
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Crown className="text-pink-400 mt-1" size={16} />
              <div>
                <strong>Paid Votes:</strong> Unlimited paid votes per name for maximum impact
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="text-red-400 mt-1" size={16} />
              <div>
                <strong>Strategy:</strong> Use multiple paid votes on your favorite names to boost them
              </div>
            </div>
          </div>
        </div>

        {/* How to Suggest Names */}
        <div className="bw-gradient-card rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Plus className="text-black" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Suggesting Names</h2>
          </div>
          <div className="space-y-3 text-white/90">
            <div>
              <strong>Requirements:</strong> You need at least 1 free vote to suggest a name
            </div>
            <div>
              <strong>Cost:</strong> Suggesting a name uses your free vote automatically
            </div>
            <div>
              <strong>Uniqueness:</strong> Names must be unique - duplicates aren't allowed
            </div>
            <div>
              <strong>Tip:</strong> Choose creative, memorable names that others will want to vote for!
            </div>
          </div>
        </div>

        {/* Vote Packs */}
        <div className="bw-gradient-card rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Coins className="text-black" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Vote Packs</h2>
          </div>
          <div className="space-y-2 text-white/90 text-sm">
            <div className="flex justify-between">
              <span>Starter Pack:</span>
              <span className="font-bold">5 votes for 5 APT</span>
            </div>
            <div className="flex justify-between bg-yellow-400/20 px-2 py-1 rounded">
              <span>Booster Pack:</span>
              <span className="font-bold">12 votes for 10 APT ⭐</span>
            </div>
            <div className="flex justify-between">
              <span>Power Pack:</span>
              <span className="font-bold">25 votes for 20 APT</span>
            </div>
            <div className="flex justify-between">
              <span>Champion Pack:</span>
              <span className="font-bold">60 votes for 45 APT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prize Pool Section */}
      <div className="bw-gradient-card rounded-xl p-6 shadow-lg mb-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Trophy className="text-black" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white">Prize Pool System</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-white/90">
            <div>
              <h3 className="font-bold text-white mb-2">How it Grows</h3>
              <p className="text-sm">All APT spent on vote packs goes directly into the prize pool</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Winner Takes All</h3>
              <p className="text-sm">The most voted name wins the entire APT prize pool</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Current Pool</h3>
              <p className="text-xl font-bold text-yellow-400">{prizePool.total.toFixed(2)} APT</p>
              <p className="text-xs">{prizePool.contributors} contributors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Tips */}
      <div className="bw-gradient-card rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <Info className="text-black" size={20} />
          </div>
          <h2 className="text-xl font-bold text-white">Strategy Tips</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-white/90">
          <div>
            <h3 className="font-bold text-white mb-2">🎯 For Voters</h3>
            <ul className="space-y-1 text-sm">
              <li>• Use your free vote on many different names</li>
              <li>• Buy vote packs to boost your absolute favorites</li>
              <li>• Stack multiple paid votes on the same name</li>
              <li>• Monitor the leaderboard and vote strategically</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">💡 For Name Suggesters</h3>
            <ul className="space-y-1 text-sm">
              <li>• Choose memorable, catchy names</li>
              <li>• Consider names that fit the Geomi brand</li>
              <li>• Rally supporters to vote for your suggestion</li>
              <li>• Remember: creativity wins hearts (and votes!)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bw-gradient p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center float-animation">
              <Sparkles className="text-black" size={24} />
            </div>
            <h1 className="text-5xl font-bold bw-title">
              Name Our Mascot! "Geomi"
            </h1>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bw-gradient-card rounded-2xl p-2 flex gap-2">
              <button
                onClick={() => setActiveTab('main')}
                className={`flex items-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                  activeTab === 'main'
                    ? 'bw-btn-primary text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Plus size={20} />
                Submit
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex items-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                  activeTab === 'leaderboard'
                    ? 'bw-btn-primary text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Trophy size={20} />
                Leaderboard
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={`flex items-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                  activeTab === 'instructions'
                    ? 'bw-btn-secondary text-black'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen size={20} />
                Instructions
              </button>
            </div>
          </div>

          {/* Common Status Info */}
          {activeTab !== 'instructions' && (
            <>
              <p className="text-white/90 text-lg mb-4">
                Help us choose the perfect name for our Geomi mascot! Use your votes wisely - the winner takes the prize pool!
              </p>
              
              {/* Connection Status */}
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                <WalletConnection />
                
                {connected && account ? (
                  <>
                    <div className="bw-gradient-card rounded-xl px-4 py-2">
                      <span className="text-white/90 text-sm">Balance: </span>
                      <span className="text-white font-bold">{accountBalance.toFixed(2)} APT</span>
                    </div>
                    {userAccount && (
                      <>
                        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2">
                          <span className="text-white/90 text-sm">Free Votes: </span>
                          <span className="text-white font-bold">{userAccount.freeVotesRemaining}</span>
                        </div>
                        <div className="bg-gray-500/20 backdrop-blur-sm border border-gray-300/30 rounded-xl px-4 py-2">
                          <span className="text-white/90 text-sm">Paid Votes: </span>
                          <span className="text-white font-bold">{userAccount.paidVotesOwned}</span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="bg-gray-500/20 backdrop-blur-sm border border-gray-300/30 rounded-xl px-4 py-2">
                    <span className="text-white/90 text-sm">⚠️ Connect wallet to participate in voting</span>
                  </div>
                )}
              </div>

              {/* Status Message */}
              {status && (
                <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2 mb-4 max-w-2xl mx-auto">
                  <p className="text-white text-sm">{status}</p>
                </div>
              )}

              {/* Prize Pool */}
              <div className="bw-gradient-card rounded-2xl p-6 max-w-2xl mx-auto pulse-glow">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <Trophy className="text-black" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Prize Pool</h2>
                </div>
                <p className="text-4xl font-bold text-white mb-2">{prizePool.total.toFixed(2)} APT</p>
                <p className="text-white/80 text-lg">{prizePool.contributors} contributors</p>
              </div>
            </>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'instructions' ? (
          <InstructionsTab />
        ) : activeTab === 'leaderboard' ? (
          <LeaderboardPage />
        ) : (
          <MainPage />
        )}
      </div>

      {/* Vote Store Modal */}
      {showVoteStore && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <DollarSign className="text-green-500" size={24} />
                  Vote Store
                </h2>
                <button
                  onClick={() => setShowVoteStore(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <p className="text-gray-700 text-center">
                  <strong>How it works:</strong> Buy votes to boost your favorite names! 
                  Use multiple paid votes on the same name for maximum impact! 🏆
                </p>
                <p className="text-gray-600 text-center mt-2 text-sm">
                  Free votes: 1 per name • Paid votes: unlimited per name
                </p>
                <p className="text-gray-600 text-center mt-2">
                  Your balance: <strong>{accountBalance.toFixed(2)} APT</strong>
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {VOTE_PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                      pack.popular
                        ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {pack.popular && (
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block">
                        MOST POPULAR
                      </div>
                    )}
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{pack.name}</h3>
                    <div className="text-3xl font-bold text-gray-800 mb-2">{pack.votes} votes</div>
                    <div className="text-2xl font-bold text-green-600 mb-4">{pack.aptPrice ?? pack.price} APT</div>
                    <div className="text-sm text-gray-600 mb-4">
                      {((pack.aptPrice ?? pack.price) / pack.votes).toFixed(2)} APT per vote
                    </div>
                    <button
                      onClick={() => handlePurchase(pack)}
                      disabled={!connected || !isRegistered || accountBalance < (pack.aptPrice ?? pack.price)}
                      className="w-full bw-btn-primary disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                    >
                      {!connected ? 'Connect Wallet' :
                       !isRegistered ? 'Register First' :
                       accountBalance < (pack.aptPrice ?? pack.price) ? 'Insufficient Balance' : 'Purchase Now'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-8 text-white/70">
        <p>
          {suggestions.length} name{suggestions.length !== 1 ? 's' : ''} suggested • 
          Total votes: {suggestions.reduce((sum, s) => sum + s.totalVotes, 0)} • 
          Prize pool: {prizePool.total.toFixed(2)} APT
        </p>
      </div>
    </div>
  );
}
