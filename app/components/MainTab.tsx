import { Plus } from 'lucide-react';
import { NameSuggestion, UserAccount } from '../services/blockchain';

interface MainTabProps {
  connected: boolean;
  isRegistered: boolean;
  isRegistering: boolean;
  newName: string;
  setNewName: (name: string) => void;
  isSubmitting: boolean;
  userAccount: UserAccount | null;
  suggestions: NameSuggestion[];
  setActiveTab: (tab: 'main' | 'leaderboard' | 'instructions') => void;
  setShowVoteStore: (show: boolean) => void;
  handleRegister: () => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const MainTab = ({
  connected,
  isRegistered,
  isRegistering,
  newName,
  setNewName,
  isSubmitting,
  userAccount,
  suggestions,
  setActiveTab,
  setShowVoteStore,
  handleRegister,
  handleSubmit,
}: MainTabProps) => (
  <div className="max-w-4xl mx-auto space-y-8">
    {/* Registration prompt */}
    {connected && !isRegistered && (
      <div className="glass-card p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Get Started!</h3>
          <p className="mb-4">Register to get your free vote and start suggesting names!</p>
          <button
            onClick={handleRegister}
            disabled={isRegistering}
            className="glass-button primary disabled:opacity-50"
          >
            {isRegistering ? 'Registering...' : 'Register & Get Free Vote'}
          </button>
        </div>
      </div>
    )}

    {/* Name Suggestion Form */}
    <div className="glass-card p-6">
      <h2 className="text-2xl font-bold mb-4">Suggest a Name for Geomi!</h2>
      <p className="mb-6">Help us choose the perfect name for our beloved mascot</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={connected ? "Enter a creative name..." : "Connect wallet to suggest names"}
          className="glass-input"
          disabled={!connected || !isRegistered}
          required
        />
        
        <button
          type="submit"
          disabled={!connected || !isRegistered || isSubmitting || !newName.trim() || !userAccount?.freeVotesRemaining}
          className="w-full glass-button primary disabled:opacity-50"
        >
          {!connected ? 'Connect Wallet to Suggest' :
           !isRegistered ? 'Register First' :
           isSubmitting ? 'Submitting...' :
           !userAccount?.freeVotesRemaining ? 'No Free Votes Left' :
           'Submit Name (Uses Free Vote)'}
        </button>
      </form>
      
      <div className="mt-4 pt-4 border-t border-black">
        <button
          onClick={() => setShowVoteStore(true)}
          disabled={!connected || !isRegistered}
          className="w-full glass-button disabled:opacity-50"
        >
          {!connected ? 'Connect Wallet to Buy Votes' : 'Get More Votes'}
        </button>
      </div>
    </div>

    {/* Recent Suggestions Preview */}
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Recent Suggestions</h3>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className="glass-button"
        >
          View All & Vote
        </button>
      </div>
      
      {suggestions.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {suggestions.slice(0, 6).map((suggestion, index) => (
            <div key={suggestion.id} className="suggestion-card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg">{suggestion.name}</span>
                <span className="font-bold">{suggestion.totalVotes} votes</span>
              </div>
              <div className="text-sm text-gray-600">
                Free: {suggestion.freeVotes} | Paid: {suggestion.paidVotes}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                by {suggestion.submittedBy.slice(0, 6)}...{suggestion.submittedBy.slice(-4)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <h3 className="text-lg font-bold mb-2">No suggestions yet</h3>
          <p className="text-gray-600">Be the first to suggest an amazing name!</p>
        </div>
      )}
    </div>
  </div>
); 