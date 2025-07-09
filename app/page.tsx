'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { 
  Plus, 
  Trophy, 
  BookOpen, 
  Star, 
  Crown, 
  Target,
  CheckCircle 
} from 'lucide-react';
import { WalletConnection } from './components/WalletConnection';
import { MainTab } from './components/MainTab';
import { LeaderboardTab } from './components/LeaderboardTab';
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
  }, [connected, account]);

  const loadData = async () => {
    if (!account) return;

    try {
      const suggestionsData = await getSuggestions();
      setSuggestions(suggestionsData);

      const [totalPrize, contributors] = await getPrizePool();
      setPrizePool({ 
        total: totalPrize / 100000000,
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
  };

  const handleRegister = async () => {
    if (!account || !signAndSubmitTransaction) return;
    
    setIsRegistering(true);
    setStatus('Registering user...');
    
    try {
      await registerUser(account.address.toString(), signAndSubmitTransaction);
      await loadData();
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
      await loadData();
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
      await loadData();
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
      await loadData();
      setStatus(`${pack.name} purchased successfully!`);
      setShowVoteStore(false);
    } catch (error) {
      console.error('Purchase failed:', error);
      setStatus('Purchase failed. Please check your balance and try again.');
    }
  };

  const InstructionsTab = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">How to Vote for Geomi's Name</h1>
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
                <strong>Register:</strong> Get your free vote by registering
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={16} className="mt-1" />
              <div>
                <strong>Participate:</strong> Suggest names and vote for favorites
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
                <strong>Paid Votes:</strong> Unlimited paid votes per name
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target size={16} className="mt-1" />
              <div>
                <strong>Strategy:</strong> Use multiple paid votes on favorites
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
        <div className="text-center py-6">
          <h1 className="text-4xl font-bold mb-4">Name Our Mascot "Geomi"!</h1>
          <p className="text-lg mb-6">Join our community in choosing the perfect name for our beloved mascot!</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-1 border-2 border-black rounded-lg p-1">
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
            {/* Connection Status */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <WalletConnection />
              
              {connected && account ? (
                <>
                  <div className="status-badge active">
                    Balance: {accountBalance.toFixed(2)} APT
                  </div>
                  {userAccount && (
                    <>
                      <div className="status-badge inactive">
                        Free Votes: {userAccount.freeVotesRemaining}
                      </div>
                      <div className="status-badge inactive">
                        Paid Votes: {userAccount.paidVotesOwned}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="status-badge inactive">
                  Connect wallet to start voting!
                </div>
              )}
            </div>

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
        ) : activeTab === 'leaderboard' ? (
          <LeaderboardTab
            suggestions={suggestions}
            connected={connected}
            isRegistered={isRegistered}
            userAccount={userAccount}
            handleVote={handleVote}
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
            setShowVoteStore={setShowVoteStore}
            handleRegister={handleRegister}
            handleSubmit={handleSubmit}
          />
        )}
      </div>

      {/* Vote Store Modal */}
      {showVoteStore && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Vote Store</h2>
              <button
                onClick={() => setShowVoteStore(false)}
                className="glass-button"
              >
                ✕
              </button>
            </div>
            
            <div className="glass-card p-4 mb-6">
              <div className="text-center">
                <h3 className="font-bold mb-2">How Vote Packs Work</h3>
                <div className="text-sm space-y-1">
                  <div>Free votes: 1 per name</div>
                  <div>Paid votes: unlimited</div>
                  <div>Your balance: {accountBalance.toFixed(2)} APT</div>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {VOTE_PACKS.map((pack) => (
                <div key={pack.id} className="glass-card p-4">
                  {pack.popular && (
                    <div className="status-badge active mb-2 text-xs">MOST POPULAR</div>
                  )}
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg">{pack.name}</h3>
                    <div className="text-2xl font-bold">{pack.votes} votes</div>
                    <div className="text-xl font-bold">{pack.aptPrice ?? pack.price} APT</div>
                    <div className="text-xs text-gray-600">
                      {((pack.aptPrice ?? pack.price) / pack.votes).toFixed(3)} APT per vote
                    </div>
                  </div>
                  <button
                    onClick={() => handlePurchase(pack)}
                    disabled={!connected || !isRegistered || accountBalance < (pack.aptPrice ?? pack.price)}
                    className="w-full glass-button primary disabled:opacity-50"
                  >
                    {!connected ? 'Connect Wallet' :
                     !isRegistered ? 'Register First' :
                     accountBalance < (pack.aptPrice ?? pack.price) ? 'Insufficient Balance' : 
                     'Purchase Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-16 pb-8">
        <div className="glass-card max-w-3xl mx-auto p-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <span>{suggestions.length} names suggested</span>
            <span>{suggestions.reduce((sum, s) => sum + s.totalVotes, 0)} total votes</span>
            <span>{prizePool.total.toFixed(2)} APT prize pool</span>
          </div>
        </div>
      </div>
    </div>
  );
}
