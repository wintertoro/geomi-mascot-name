import { Plus, Share2 } from './Icons';
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
  setActiveTab: (tab: 'main' | 'leaderboard' | 'instructions' | 'store' | 'my-suggestions') => void;
  handleRegister: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleShare: (suggestion: NameSuggestion) => void;
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
  handleRegister,
  handleSubmit,
  handleShare,
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

    {/* User Stats */}
    {connected && isRegistered && userAccount && (
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4">Your Account Status</h3>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{userAccount.freeVotesRemaining}</div>
            <div className="text-sm text-gray-600">Free Votes Left</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{userAccount.boostVotesOwned}</div>
            <div className="text-sm text-gray-600">Boost Votes Owned</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{userAccount.suggestionsCount}/3</div>
            <div className="text-sm text-gray-600">Name Suggestions</div>
          </div>
        </div>
      </div>
    )}

    {/* Name Suggestion Form */}
    <div className="glass-card p-6">
      <h2 className="text-2xl font-bold mb-4">Suggest a Name for Geomi!</h2>
      <p className="mb-6">Help us choose the perfect name for our beloved mascot. You can suggest up to 3 names for free!</p>
      
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
          disabled={!connected || !isRegistered || isSubmitting || !newName.trim() || (userAccount?.suggestionsCount ?? 0) >= 3}
          className="w-full glass-button primary disabled:opacity-50"
        >
          {!connected ? 'Connect Wallet to Suggest' :
           !isRegistered ? 'Register First' :
           isSubmitting ? 'Submitting...' :
           (userAccount?.suggestionsCount ?? 0) >= 3 ? 'Max 3 Suggestions Reached' :
           `Submit Name (${(userAccount?.suggestionsCount ?? 0)}/3 suggestions used)`}
        </button>
      </form>

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
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{suggestion.name}</span>
                  <button
                    onClick={() => handleShare(suggestion)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title={`Share "${suggestion.name}"`}
                  >
                    <Share2 size={14} />
                  </button>
                </div>
                <span className="font-bold">{suggestion.totalVotes} votes</span>
              </div>
              <div className="text-sm text-gray-600">
                Free: {suggestion.freeVotes} | Boost: {suggestion.boostVotes}
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