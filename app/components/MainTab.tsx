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
      <div className="glass-card">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4 text-neutral-950">Get Started!</h3>
          <p className="mb-4 text-neutral-950/80">Register to get your free vote and start suggesting names!</p>
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
      <div className="glass-card">
        <h3 className="text-lg font-bold mb-4 text-neutral-950">Your Account Status</h3>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="bg-sky-blue-500/10 rounded-lg p-4 border border-sky-blue-500/20">
            <div className="text-2xl font-bold text-sky-blue-600">{userAccount.freeVotesRemaining}</div>
            <div className="text-sm text-neutral-950/60 font-mono">Free Votes Left</div>
          </div>
          <div className="bg-blaze-600/10 rounded-lg p-4 border border-blaze-600/20">
            <div className="text-2xl font-bold text-blaze-600">{userAccount.boostVotesOwned}</div>
            <div className="text-sm text-neutral-950/60 font-mono">Boost Votes Owned</div>
          </div>
          <div className="bg-olive-500/10 rounded-lg p-4 border border-olive-500/20">
            <div className="text-2xl font-bold text-olive-500">{userAccount.suggestionsCount}/10</div>
            <div className="text-sm text-neutral-950/60 font-mono">Name Suggestions</div>
          </div>
        </div>
      </div>
    )}

    {/* Name Suggestion Form */}
    <div className="glass-card">
      <h2 className="text-2xl font-bold mb-4 text-neutral-950">Suggest a Name for Geomi!</h2>
      <p className="mb-6 text-neutral-950/80">Help us choose the perfect name for our beloved mascot. You can suggest up to 10 names for free!</p>
      
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
          disabled={!connected || !isRegistered || isSubmitting || !newName.trim() || (userAccount?.suggestionsCount ?? 0) >= 10}
          className="w-full glass-button primary disabled:opacity-50"
        >
          {!connected ? 'Connect Wallet to Suggest' :
           !isRegistered ? 'Register First' :
           isSubmitting ? 'Submitting...' :
           (userAccount?.suggestionsCount ?? 0) >= 10 ? 'Max 10 Suggestions Reached' :
           `Submit Name (${(userAccount?.suggestionsCount ?? 0)}/10 suggestions used)`}
        </button>
      </form>

    </div>

    {/* Recent Suggestions Preview */}
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-neutral-950">Recent Suggestions</h3>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className="glass-button secondary"
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
                  <span className="font-bold text-lg text-neutral-950">{suggestion.name}</span>
                  <button
                    onClick={() => handleShare(suggestion)}
                    className="p-1 hover:bg-neutral-100 rounded transition-colors"
                    title={`Share "${suggestion.name}"`}
                  >
                    <Share2 size={14} className="text-neutral-950/60" />
                  </button>
                </div>
                <span className="font-bold text-blaze-600">{suggestion.totalVotes} votes</span>
              </div>
              <div className="text-sm text-neutral-950/60 font-mono">
                Free: {suggestion.freeVotes} | Boost: {suggestion.boostVotes}
              </div>
              <div className="text-xs text-neutral-950/40 mt-2 font-mono">
                by {suggestion.submittedBy.slice(0, 6)}...{suggestion.submittedBy.slice(-4)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <h3 className="text-lg font-bold mb-2 text-neutral-950">No suggestions yet</h3>
          <p className="text-neutral-950/60">Be the first to suggest an amazing name!</p>
        </div>
      )}
    </div>
  </div>
); 