import { Trophy, Share2 } from './Icons';
import { NameSuggestion, UserAccount } from '../services/blockchain';

interface LeaderboardTabProps {
  suggestions: NameSuggestion[];
  connected: boolean;
  isRegistered: boolean;
  userAccount: UserAccount | null;
  handleVote: (suggestionId: string, isPaidVote: boolean) => void;
  handleShare: (suggestion: NameSuggestion) => void;
}

export const LeaderboardTab = ({
  suggestions,
  connected,
  isRegistered,
  userAccount,
  handleVote,
  handleShare,
}: LeaderboardTabProps) => {
  const sortedSuggestions = [...suggestions].sort((a, b) => b.totalVotes - a.totalVotes);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">Leaderboard</h2>
      
      {/* Voting Rules */}
      <div className="glass-card p-4 mb-6">
        <h3 className="font-bold mb-2">Voting Rules:</h3>
        <ul className="text-sm space-y-1">
          <li>• One FREE vote per name maximum</li>
          <li>• Multiple BOOST votes allowed per name</li>
          <li>• Votes cannot be removed once cast</li>
        </ul>
      </div>

      {/* All Names */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold mb-4">All Suggestions</h3>
        
        <div className="space-y-4">
          {sortedSuggestions.length > 0 ? (
            sortedSuggestions.map((suggestion, index) => (
              <div key={suggestion.id} className="suggestion-card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Trophy size={16} />}
                      <span className="font-bold text-lg">{suggestion.name}</span>
                      <button
                        onClick={() => handleShare(suggestion)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title={`Share "${suggestion.name}"`}
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      by {suggestion.submittedBy.slice(0, 6)}...{suggestion.submittedBy.slice(-4)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Free: {suggestion.freeVotes} | Boost: {suggestion.boostVotes}
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-xl font-bold">{suggestion.totalVotes}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVote(suggestion.id, false)}
                        disabled={!connected || !isRegistered || userAccount?.freeVotedNames.includes(suggestion.id) || !userAccount?.freeVotesRemaining}
                        className="glass-button disabled:opacity-50"
                      >
                        {userAccount?.freeVotedNames.includes(suggestion.id) ? 'Used' : 'Free'}
                      </button>
                      
                      <button
                        onClick={() => handleVote(suggestion.id, true)}
                        disabled={!connected || !isRegistered || !userAccount?.boostVotesOwned}
                        className="glass-button primary disabled:opacity-50"
                      >
                        Boost
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-600 mb-2">No name suggestions yet!</div>
              <div className="text-sm">
                {connected ? 'Be the first to suggest a name for Geomi!' : 'Connect your wallet to suggest the first name!'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 