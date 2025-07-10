'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { 
  Plus, 
  Trophy, 
  BookOpen, 
  Star, 
  Crown, 
  Target,
  CheckCircle,
  Coins,
  Share2
} from './components/Icons';
import { WalletConnection } from './components/WalletConnection';
import { MainTab } from './components/MainTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { VoteStoreTab } from './components/VoteStoreTab';
import { GitHubLink } from './components/GitHubLink';
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

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const VOTE_PACKS: VotePack[] = [
  { id: 'starter', name: 'Starter Pack', votes: 5, price: 5, aptPrice: 5 },
  { id: 'booster', name: 'Booster Pack', votes: 12, price: 10, aptPrice: 10, popular: true },
  { id: 'power', name: 'Power Pack', votes: 25, price: 20, aptPrice: 20 },
  { id: 'champion', name: 'Champion Pack', votes: 60, price: 45, aptPrice: 45 },
];

type TabType = 'main' | 'leaderboard' | 'instructions' | 'store' | 'my-suggestions';

export default function Home() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>('main');
  const [suggestions, setSuggestions] = useState<NameSuggestion[]>([]);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [prizePool, setPrizePool] = useState({ total: 0, contributors: 0 });
  const [accountBalance, setAccountBalance] = useState(0);
  const [status, setStatus] = useState<string>('');

  const handleShare = async (suggestion: NameSuggestion) => {
    const shareUrl = `${window.location.origin}?highlight=${suggestion.id}`;
    const shareText = `Vote for "${suggestion.name}" in the Geomi Mascot Contest! 🎭`;
    
    try {
      if (navigator.share) {
        // Use native sharing if available (mobile)
        await navigator.share({
          title: 'Geomi Mascot Contest',
          text: shareText,
          url: shareUrl,
        });
        setStatus(`Shared "${suggestion.name}" successfully!`);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setStatus(`Link for "${suggestion.name}" copied to clipboard!`);
      }
    } catch (error) {
      console.error('Share failed:', error);
      setStatus('Share failed. Please try again.');
    }
  };

  const loadData = useCallback(async () => {
    if (!account) return;

    try {
      const suggestionsData = await getSuggestions();
      setSuggestions(suggestionsData);

      const [totalPrize, contributors] = await getPrizePool();
      setPrizePool({ 
        total: totalPrize, // Already converted to APT in blockchain service
        contributors 
      });

      const balance = await getAccountBalance(account.address.toString());
      setAccountBalance(balance);

      try {
        const userAccountData = await getUserAccount(account.address.toString());
        setUserAccount(userAccountData);
        setIsRegistered(true);
      } catch (error) {
        setIsRegistered(false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setStatus('Error loading data. Contract may not be deployed.');
    }
  }, [account]);

  useEffect(() => {
    if (connected && account) {
      loadData();
    } else {
      setSuggestions([]);
      setUserAccount(null);
      setIsRegistered(false);
      setPrizePool({ total: 0, contributors: 0 });
      setAccountBalance(0);
    }
  }, [connected, account, loadData]);

  const handleRegister = async () => {
    if (!account || !signAndSubmitTransaction) return;
    
    setIsRegistering(true);
    setStatus('Registering user...');
    
    try {
      await registerUser(account.address.toString(), signAndSubmitTransaction);
      await loadData();
      setStatus('Registration successful! You have 3 free votes and can suggest up to 3 names.');
    } catch (error) {
      console.error('Registration failed:', error);
      setStatus('Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !account || !signAndSubmitTransaction) return;
    
    setIsSubmitting(true);
    setStatus('Submitting name suggestion...');
    
    try {
      await suggestName(account.address.toString(), newName.trim(), signAndSubmitTransaction);
      setNewName('');
      await loadData();
      setStatus('Name suggestion submitted successfully!');
    } catch (error) {
      console.error('Submission failed:', error);
      setStatus('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (suggestionId: string, isBoostVote: boolean) => {
    if (!account || !userAccount || !signAndSubmitTransaction) return;
    
    if (isBoostVote && userAccount.boostVotesOwned === 0) {
      setStatus('No boost votes available. Purchase vote packs to continue.');
      return;
    }
    
    if (!isBoostVote && userAccount.freeVotesRemaining === 0) {
      setStatus('No free votes remaining.');
      return;
    }

    if (!isBoostVote && userAccount.freeVotedNames.includes(suggestionId)) {
      setStatus('You already used your free vote on this name.');
      return;
    }
    
    setStatus(isBoostVote ? 'Casting boost vote...' : 'Casting free vote...');
    
    try {
      await castVote(account.address.toString(), parseInt(suggestionId), isBoostVote, signAndSubmitTransaction);
      await loadData();
      setStatus(`${isBoostVote ? 'Boost' : 'Free'} vote cast successfully!`);
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
      await loadData();
      setStatus(`${pack.name} purchased successfully!`);
    } catch (error) {
      console.error('Purchase failed:', error);
      setStatus('Purchase failed. Please check your balance and try again.');
    }
  };

  const MySuggestionsTab = () => {
    if (!connected || !account) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">My Suggestions</h2>
            <p>Connect your wallet to view your suggestions</p>
          </div>
        </div>
      );
    }

    const mySuggestions = suggestions.filter(
      suggestion => suggestion.submittedBy.toLowerCase() === account.address.toString().toLowerCase()
    );

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">My Suggestions</h1>
          <p className="text-lg">Names you've suggested and their current vote counts</p>
        </div>

        {/* User Stats */}
        {userAccount && (
          <div className="glass-card p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Your Suggestion Stats</h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{mySuggestions.length}/3</div>
                <div className="text-sm text-gray-600">Names Suggested</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {mySuggestions.reduce((sum, s) => sum + s.totalVotes, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Votes Received</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {mySuggestions.length > 0 ? 
                    Math.max(...mySuggestions.map(s => suggestions.findIndex(sg => sg.id === s.id) + 1)) : 
                    'N/A'
                  }
                </div>
                <div className="text-sm text-gray-600">Best Ranking</div>
              </div>
            </div>
          </div>
        )}

        {/* My Suggestions List */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4">Your Suggested Names</h3>
          
          {mySuggestions.length > 0 ? (
            <div className="space-y-4">
              {mySuggestions
                .sort((a, b) => b.totalVotes - a.totalVotes)
                .map((suggestion, index) => {
                  const overallRank = suggestions
                    .sort((a, b) => b.totalVotes - a.totalVotes)
                    .findIndex(s => s.id === suggestion.id) + 1;
                  
                  return (
                    <div key={suggestion.id} className="suggestion-card">
                      <div className="flex items-center justify-between">
                                                 <div className="flex-1">
                           <div className="flex items-center gap-2 mb-2">
                             <span className="font-bold text-lg">{suggestion.name}</span>
                             <button
                               onClick={() => handleShare(suggestion)}
                               className="p-1 hover:bg-gray-200 rounded transition-colors"
                               title={`Share "${suggestion.name}"`}
                             >
                               <Share2 size={14} />
                             </button>
                             <span className="status-badge inactive text-xs">
                               #{overallRank} overall
                             </span>
                           </div>
                          <div className="text-sm text-gray-600 mb-1">
                            Free: {suggestion.freeVotes} | Boost: {suggestion.boostVotes}
                          </div>
                          <div className="text-xs text-gray-500">
                            Suggested on {new Date(suggestion.timestamp * 1000).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold">{suggestion.totalVotes}</div>
                          <div className="text-sm text-gray-600">votes</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-600 mb-4">You haven't suggested any names yet!</div>
              <button
                onClick={() => setActiveTab('main')}
                className="glass-button primary"
              >
                Suggest Your First Name
              </button>
            </div>
          )}
        </div>

        {/* Performance Insights */}
        {mySuggestions.length > 0 && (
          <div className="glass-card p-6 mt-8">
            <h3 className="text-xl font-bold mb-4">Performance Insights</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold mb-2">Your Best Performer</h4>
                {(() => {
                  const best = mySuggestions.reduce((prev, current) => 
                    prev.totalVotes > current.totalVotes ? prev : current
                  );
                  return (
                    <div className="text-sm">
                      <div className="font-bold">{best.name}</div>
                      <div>{best.totalVotes} votes</div>
                    </div>
                  );
                })()}
              </div>
              <div>
                <h4 className="font-bold mb-2">Average Votes per Name</h4>
                <div className="text-sm">
                  <div className="font-bold">
                    {(mySuggestions.reduce((sum, s) => sum + s.totalVotes, 0) / mySuggestions.length).toFixed(1)}
                  </div>
                  <div>votes per suggestion</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const InstructionsTab = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">How to Vote for Geomi&apos;s Name</h1>
        <p className="text-lg">Complete guide to participating in our mascot naming contest</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Getting Started */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Getting Started</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle size={16} className="mt-1" />
              <div>
                <strong>Connect Wallet:</strong> Use your Aptos wallet to participate
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={16} className="mt-1" />
              <div>
                <strong>Register:</strong> Get your 3 free votes and ability to suggest names
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={16} className="mt-1" />
              <div>
                <strong>Suggest Names:</strong> Submit up to 3 creative names (free)
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={16} className="mt-1" />
              <div>
                <strong>Vote:</strong> Cast votes on your favorite names
              </div>
            </div>
          </div>
        </div>

        {/* Voting Rules */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Voting Rules</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Star size={16} className="mt-1" />
              <div>
                <strong>Free Votes:</strong> One free vote per name
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Crown size={16} className="mt-1" />
              <div>
                <strong>Boost Votes:</strong> Unlimited boost votes per name
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target size={16} className="mt-1" />
              <div>
                <strong>Strategy:</strong> Use multiple boost votes on favorites
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={16} className="mt-1" />
              <div>
                <strong>Important:</strong> Votes cannot be removed once cast
              </div>
            </div>
          </div>
        </div>

        {/* Vote Packs */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Vote Packs</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Starter Pack:</span>
              <span className="font-bold">5 votes for 5 APT</span>
            </div>
            <div className="flex justify-between border border-black p-1 rounded">
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

        {/* Prize Pool */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Prize Pool</h2>
          <div className="space-y-3">
            <div>
              <strong>How it Grows:</strong> All APT from vote packs goes to prize pool
            </div>
            <div>
              <strong>Winner Takes All:</strong> Most voted name wins entire pool
            </div>
            <div>
              <strong>Current Pool:</strong> {prizePool.total.toFixed(2)} APT
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bw-gradient p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between py-6">
          <div className="flex items-center gap-4">
            <div className="glass-card p-3">
              <h1 className="text-xl font-bold">🎭 Geomi Mascot Contest</h1>
              <p className="text-sm text-gray-600">Vote for your favorite name!</p>
            </div>
          </div>
          
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-bold mb-4">Name Geomi's Mascot!</h1>
            <p className="text-lg mb-6">Join our community in choosing the perfect name for our beloved mascot!</p>
          </div>
          
          <div className="flex flex-col gap-3">
            {/* Boost Votes Indicator */}
            {connected && userAccount && (
              <div className="glass-card p-3">
                <div className="flex items-center gap-2">
                  <Coins size={20} />
                  <div>
                    <div className="text-lg font-bold">{userAccount.boostVotesOwned}</div>
                    <div className="text-xs text-gray-600">Boost Votes</div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex-shrink-0">
              <WalletConnection />
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-1 border-2 border-black rounded-lg p-1 flex-wrap">
            <button
              onClick={() => setActiveTab('main')}
              className={activeTab === 'main' ? 'tab-active' : 'tab-inactive'}
            >
              <Plus size={16} />
              Submit & Vote
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={activeTab === 'leaderboard' ? 'tab-active' : 'tab-inactive'}
            >
              <Trophy size={16} />
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('store')}
              className={activeTab === 'store' ? 'tab-active' : 'tab-inactive'}
            >
              <Coins size={16} />
              Buy Votes
            </button>
            {connected && account && (
              <button
                onClick={() => setActiveTab('my-suggestions')}
                className={activeTab === 'my-suggestions' ? 'tab-active' : 'tab-inactive'}
              >
                <Star size={16} />
                My Suggestions
              </button>
            )}
            <button
              onClick={() => setActiveTab('instructions')}
              className={activeTab === 'instructions' ? 'tab-active' : 'tab-inactive'}
            >
              <BookOpen size={16} />
              How to Play
            </button>
          </div>
        </div>

        {/* Status Section */}
        {activeTab !== 'instructions' && (
          <div className="mb-8">
            {/* User Stats */}
            {connected && account && userAccount && (
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <div className="status-badge active">
                  Balance: {accountBalance.toFixed(2)} APT
                </div>
                <div className="status-badge inactive">
                  Free Votes: {userAccount.freeVotesRemaining}
                </div>
                <div className="status-badge inactive">
                  Boost Votes: {userAccount.boostVotesOwned}
                </div>
              </div>
            )}

            {/* Status Message */}
            {status && (
              <div className="glass-card max-w-2xl mx-auto mb-6 p-4">
                <p className="text-center">{status}</p>
              </div>
            )}

            {/* Prize Pool */}
            <div className="prize-pool max-w-4xl mx-auto mb-8">
              <h2 className="text-2xl font-bold mb-2">Prize Pool</h2>
              <p className="text-4xl font-bold mb-2">{prizePool.total.toFixed(2)} APT</p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span>{prizePool.contributors} contributors</span>
                <span>Winner takes all!</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'instructions' ? (
          <InstructionsTab />
        ) : activeTab === 'my-suggestions' ? (
          <MySuggestionsTab />
        ) : activeTab === 'leaderboard' ? (
          <LeaderboardTab
            suggestions={suggestions}
            connected={connected}
            isRegistered={isRegistered}
            userAccount={userAccount}
            handleVote={handleVote}
            handleShare={handleShare}
          />
        ) : activeTab === 'store' ? (
          <VoteStoreTab
            connected={connected}
            isRegistered={isRegistered}
            accountBalance={accountBalance}
            handlePurchase={handlePurchase}
          />
        ) : (
          <MainTab
            connected={connected}
            isRegistered={isRegistered}
            isRegistering={isRegistering}
            newName={newName}
            setNewName={setNewName}
            isSubmitting={isSubmitting}
            userAccount={userAccount}
            suggestions={suggestions}
            setActiveTab={setActiveTab}
            handleRegister={handleRegister}
            handleSubmit={handleSubmit}
            handleShare={handleShare}
          />
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-16 pb-8">
        <div className="glass-card max-w-3xl mx-auto p-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm mb-4">
            <span>{suggestions.length} names suggested</span>
            <span>{suggestions.reduce((sum, s) => sum + s.totalVotes, 0)} total votes</span>
            <span>{prizePool.total.toFixed(2)} APT prize pool</span>
          </div>
          <div className="flex justify-center">
            <GitHubLink />
          </div>
        </div>
      </div>
    </div>
  );
}
