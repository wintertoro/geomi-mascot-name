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

type TabType = 'voting' | 'instructions';

export default function Home() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>('voting');
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
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-blue-400" size={24} />
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
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Vote className="text-purple-400" size={24} />
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
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Plus className="text-green-400" size={24} />
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
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Coins className="text-yellow-400" size={24} />
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
      <div className="bg-gradient-to-r from-green-400/20 to-blue-400/20 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="text-yellow-400" size={32} />
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
      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Info className="text-cyan-400" size={24} />
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

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 max-w-md w-full shadow-lg text-center">
          <div className="text-6xl mb-4">🎭</div>
          <h1 className="text-3xl font-bold text-white mb-4">Name Our Mascot!</h1>
          <p className="text-white/90 mb-6">Connect your Aptos wallet to participate in voting</p>
          <WalletConnection />
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 max-w-md w-full shadow-lg text-center">
          <div className="text-6xl mb-4">🎭</div>
          <h1 className="text-3xl font-bold text-white mb-4">Welcome!</h1>
          <p className="text-white/90 mb-6">Register to get your free vote and start participating</p>
          <button
            onClick={handleRegister}
            disabled={isRegistering}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 font-bold py-3 px-6 rounded-lg hover:from-yellow-300 hover:to-orange-300 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isRegistering ? 'Registering...' : 'Register & Get Free Vote'}
          </button>
          <div className="mt-4">
            <WalletConnection />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="text-yellow-300 animate-pulse" size={32} />
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              Name Our Mascot! "Geomi"
            </h1>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-1 flex gap-1">
              <button
                onClick={() => setActiveTab('voting')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'voting'
                    ? 'bg-white/30 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Heart size={20} />
                Voting
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'instructions'
                    ? 'bg-white/30 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen size={20} />
                Instructions
              </button>
            </div>
          </div>

          {/* Wallet & Status Info - Only show on voting tab */}
          {activeTab === 'voting' && (
            <>
              <p className="text-white/90 text-lg mb-4">
                Help us choose the perfect name for our Geomi mascot! Use your votes wisely - the winner takes the prize pool!
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                <WalletConnection />
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-white/90 text-sm">Balance: </span>
                  <span className="text-white font-bold">{accountBalance.toFixed(2)} APT</span>
                </div>
                {userAccount && (
                  <>
                    <div className="bg-blue-500/30 rounded-lg px-4 py-2">
                      <span className="text-white/90 text-sm">Free Votes: </span>
                      <span className="text-white font-bold">{userAccount.freeVotesRemaining}</span>
                    </div>
                    <div className="bg-pink-500/30 rounded-lg px-4 py-2">
                      <span className="text-white/90 text-sm">Paid Votes: </span>
                      <span className="text-white font-bold">{userAccount.paidVotesOwned}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Status Message */}
              {status && (
                <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2 mb-4 max-w-2xl mx-auto">
                  <p className="text-white text-sm">{status}</p>
                </div>
              )}

              {/* Prize Pool */}
              <div className="bg-gradient-to-r from-green-400/20 to-blue-400/20 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="text-yellow-400" size={24} />
                  <h2 className="text-xl font-bold text-white">Prize Pool</h2>
                </div>
                <p className="text-3xl font-bold text-white">{prizePool.total.toFixed(2)} APT</p>
                <p className="text-white/70">{prizePool.contributors} contributors</p>
              </div>
            </>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'instructions' ? (
          <InstructionsTab />
        ) : (
          // Voting Tab Content (existing content)
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Name Suggestion Form */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Plus size={24} />
                Suggest a Name
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/90 mb-2 font-medium">
                    Name Suggestion
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter a creative name..."
                    className="w-full px-4 py-2 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !newName.trim() || !userAccount?.freeVotesRemaining}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 font-bold py-3 px-6 rounded-lg hover:from-yellow-300 hover:to-orange-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                  {isSubmitting ? 'Submitting...' : 
                   !userAccount?.freeVotesRemaining ? 'No Free Votes Left' :
                   'Submit Name (Uses Free Vote)'}
                </button>
              </form>
              
              {/* Buy Votes Button */}
              <button
                onClick={() => setShowVoteStore(true)}
                className="w-full mt-4 bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold py-3 px-6 rounded-lg hover:from-green-300 hover:to-blue-300 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <DollarSign size={20} />
                Buy More Votes
              </button>
            </div>

            {/* Voting Section */}
            <div className="lg:col-span-2 bg-white/20 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Heart size={24} />
                Vote for Your Favorite
              </h2>
              
              {/* Voting Rules Info */}
              <div className="mb-4 p-3 bg-blue-500/20 rounded-lg">
                <h3 className="font-bold text-white text-sm mb-2">🗳️ Voting Rules:</h3>
                <ul className="text-white/90 text-xs space-y-1">
                  <li>• Vote for as many names as you like</li>
                  <li>• One FREE vote per name maximum</li>
                  <li>• Multiple PAID votes allowed per name</li>
                  <li>• Votes cannot be removed once cast</li>
                </ul>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sortedSuggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className={`bg-white/30 rounded-lg p-4 transition-all hover:bg-white/40 ${
                      index === 0 ? 'ring-2 ring-yellow-400' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Trophy className="text-yellow-400" size={16} />}
                          <h3 className="font-bold text-white text-lg">
                            {suggestion.name}
                          </h3>
                        </div>
                        <p className="text-white/70 text-sm">
                          by {suggestion.submittedBy.slice(0, 6)}...{suggestion.submittedBy.slice(-4)}
                        </p>
                        <div className="text-white/60 text-xs mt-1">
                          Free: {suggestion.freeVotes} | Paid: {suggestion.paidVotes}
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="text-2xl font-bold text-white">
                          {suggestion.totalVotes}
                        </div>
                        <div className="flex gap-2">
                          {/* Free Vote Button */}
                          <button
                            onClick={() => handleVote(suggestion.id, false)}
                            disabled={userAccount?.freeVotedNames.includes(suggestion.id) || !userAccount?.freeVotesRemaining}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all text-sm ${
                              userAccount?.freeVotedNames.includes(suggestion.id) || !userAccount?.freeVotesRemaining
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-400 to-purple-400 text-white hover:from-blue-300 hover:to-purple-300 transform hover:scale-105'
                            }`}
                          >
                            <Star size={12} />
                            {userAccount?.freeVotedNames.includes(suggestion.id) ? 'Used' : 'Free'}
                          </button>
                          
                          {/* Paid Vote Button */}
                          <button
                            onClick={() => handleVote(suggestion.id, true)}
                            disabled={!userAccount?.paidVotesOwned}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all text-sm ${
                              !userAccount?.paidVotesOwned
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-pink-400 to-red-400 text-white hover:from-pink-300 hover:to-red-300 transform hover:scale-105'
                            }`}
                          >
                            <Crown size={12} />
                            Paid
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
                        disabled={accountBalance < (pack.aptPrice ?? pack.price)}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:from-green-400 hover:to-blue-400 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {accountBalance < (pack.aptPrice ?? pack.price) ? 'Insufficient Balance' : 'Purchase Now'}
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
    </div>
  );
}
