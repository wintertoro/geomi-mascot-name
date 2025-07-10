'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { 
  getSuggestions, 
  getUserAccount, 
  getPrizePool,
  getAccountBalance,
  registerUser,
  suggestName,
  castVote,
  purchaseVotePack,
  type NameSuggestion,
  type UserAccount 
} from './services/blockchain';
import { WalletConnection } from './components/WalletConnection';
import { MainTab } from './components/MainTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { VoteStoreTab } from './components/VoteStoreTab';
import { GitHubLink } from './components/GitHubLink';
import { MySuggestionsTab } from './components/MySuggestionsTab';
import { Home, Trophy, ShoppingCart, User, FileText } from './components/Icons';

export default function App() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [activeTab, setActiveTab] = useState<'main' | 'leaderboard' | 'instructions' | 'store' | 'my-suggestions'>('main');
  const [suggestions, setSuggestions] = useState<NameSuggestion[]>([]);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [prizePool, setPrizePool] = useState<[number, number]>([0, 0]);
  const [accountBalance, setAccountBalance] = useState<number>(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingEndTime, setVotingEndTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on component mount and when account changes
  useEffect(() => {
    loadData();
  }, [account]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load suggestions and prize pool
      const [suggestionsData, prizePoolData] = await Promise.all([
        getSuggestions(),
        getPrizePool()
      ]);
      
      setSuggestions(suggestionsData);
      setPrizePool(prizePoolData);

             // Load user-specific data if connected
       if (account?.address) {
         const [userAccountData, balance] = await Promise.all([
           getUserAccount(account.address.toString()),
           getAccountBalance(account.address.toString())
         ]);
        
        setUserAccount(userAccountData);
        setAccountBalance(balance);
        setIsRegistered(!!userAccountData);
      } else {
        setUserAccount(null);
        setAccountBalance(0);
        setIsRegistered(false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

     const handleRegister = async () => {
     if (!account?.address) return;
     
     setIsRegistering(true);
     try {
       await registerUser(account.address.toString(), signAndSubmitTransaction);
       await loadData(); // Refresh data after registration
     } catch (error) {
       console.error('Error registering:', error);
     } finally {
       setIsRegistering(false);
     }
   };

     const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!account?.address || !newName.trim()) return;
     
     setIsSubmitting(true);
     try {
       await suggestName(account.address.toString(), newName.trim(), signAndSubmitTransaction);
       setNewName('');
       await loadData(); // Refresh data after submission
     } catch (error) {
       console.error('Error submitting name:', error);
     } finally {
       setIsSubmitting(false);
     }
   };

     const handleVote = async (suggestionId: string, isBoostVote: boolean) => {
     if (!account?.address) return;
     
     try {
       await castVote(account.address.toString(), parseInt(suggestionId), isBoostVote, signAndSubmitTransaction);
       await loadData(); // Refresh data after voting
     } catch (error) {
       console.error('Error voting:', error);
     }
   };

     const handlePurchase = async (pack: { id: string; aptPrice?: number; price: number }) => {
     if (!account?.address) return;
     
     try {
       await purchaseVotePack(account.address.toString(), pack.id, pack.aptPrice ?? pack.price, signAndSubmitTransaction);
       await loadData(); // Refresh data after purchase
     } catch (error) {
       console.error('Error purchasing:', error);
     }
   };

  const handleShare = (suggestion: NameSuggestion) => {
    const shareText = `I love the name "${suggestion.name}" for Geomi! Vote for it at ${window.location.origin}`;
    if (navigator.share) {
      navigator.share({
        title: `Vote for "${suggestion.name}"`,
        text: shareText,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(shareText);
    }
  };

     const getUserSuggestions = () => {
     if (!account?.address) return [];
     return suggestions.filter(s => s.submittedBy.toLowerCase() === account.address.toString().toLowerCase());
   };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'main': return <Home size={20} />;
      case 'leaderboard': return <Trophy size={20} />;
      case 'store': return <ShoppingCart size={20} />;
      case 'my-suggestions': return <User size={20} />;
      case 'instructions': return <FileText size={20} />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blaze-50 to-sky-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blaze-600 mx-auto mb-4"></div>
          <p className="text-neutral-950/60">Loading Geomi voting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blaze-50 to-sky-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blaze-600 to-blaze-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              🎭
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 text-neutral-950">Name Geomi&apos;s Mascot!</h1>
              <p className="text-lg text-neutral-950/80">Help choose the perfect name for our beloved mascot</p>
            </div>
          </div>
          
          {/* Prize Pool */}
          <div className="prize-pool mb-6">
            <div className="text-3xl font-bold text-blaze-600 mb-2">{prizePool[0].toFixed(2)} APT</div>
            <div className="text-sm text-neutral-950/60 font-mono">Prize Pool • {prizePool[1]} Contributors</div>
          </div>

          {/* Wallet Connection */}
          <WalletConnection />
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'main', label: 'Suggest Names', icon: 'main' },
            { id: 'leaderboard', label: 'Vote & Leaderboard', icon: 'leaderboard' },
            { id: 'my-suggestions', label: 'My Suggestions', icon: 'my-suggestions' },
            { id: 'store', label: 'Vote Store', icon: 'store' },
            { id: 'instructions', label: 'How to Vote', icon: 'instructions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={activeTab === tab.id ? 'tab-active' : 'tab-inactive'}
            >
              {getTabIcon(tab.icon)}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'main' && (
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

        {activeTab === 'leaderboard' && (
          <LeaderboardTab
            suggestions={suggestions}
            connected={connected}
            isRegistered={isRegistered}
            userAccount={userAccount}
            handleVote={handleVote}
            handleShare={handleShare}
          />
        )}

        {activeTab === 'my-suggestions' && (
          <MySuggestionsTab
            connected={connected}
            isRegistered={isRegistered}
            userAccount={userAccount}
            userSuggestions={getUserSuggestions()}
            handleShare={handleShare}
          />
        )}

        {activeTab === 'store' && (
          <VoteStoreTab
            connected={connected}
            isRegistered={isRegistered}
            accountBalance={accountBalance}
            handlePurchase={handlePurchase}
          />
        )}

        {activeTab === 'instructions' && (
          <div className="max-w-4xl mx-auto">
            <div className="glass-card">
              <h1 className="text-3xl font-bold mb-4">How to Vote for Geomi&apos;s Name</h1>
              
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2 text-neutral-950">🎯 Getting Started</h2>
                  <ol className="list-decimal list-inside space-y-2 text-neutral-950/80">
                    <li>Connect your Aptos wallet</li>
                    <li>Register to get your free vote</li>
                    <li>Suggest creative names (up to 10 suggestions)</li>
                    <li>Vote for your favorite names</li>
                  </ol>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-2 text-neutral-950">🗳️ Voting Rules</h2>
                  <ul className="list-disc list-inside space-y-2 text-neutral-950/80">
                    <li>Each user gets 1 free vote per name</li>
                    <li>Purchase boost votes for additional voting power</li>
                    <li>You can vote for multiple names</li>
                    <li>Votes cannot be changed once cast</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-2 text-neutral-950">💰 Prize Pool</h2>
                  <p className="text-neutral-950/80">
                    The prize pool grows with each vote pack purchase. Winners will be announced after the voting period ends.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-neutral-950/10">
          <GitHubLink />
          <p className="text-sm text-neutral-950/60 mt-4">
            Built with ❤️ for the Geomi community
          </p>
        </div>
      </div>
    </div>
  );
}
