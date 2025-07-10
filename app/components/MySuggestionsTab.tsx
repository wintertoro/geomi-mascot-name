import { Share2, User } from './Icons';
import { NameSuggestion, UserAccount } from '../services/blockchain';

interface MySuggestionsTabProps {
  connected: boolean;
  isRegistered: boolean;
  userAccount: UserAccount | null;
  userSuggestions: NameSuggestion[];
  handleShare: (suggestion: NameSuggestion) => void;
}

export const MySuggestionsTab = ({
  connected,
  isRegistered,
  userAccount,
  userSuggestions,
  handleShare,
}: MySuggestionsTabProps) => (
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold mb-4 text-neutral-950">My Name Suggestions</h1>
      <p className="text-lg text-neutral-950/80">Track your suggested names and their performance</p>
    </div>

    {/* User Stats */}
    {connected && isRegistered && userAccount && (
      <div className="glass-card mb-8">
        <h3 className="text-lg font-bold mb-4 text-neutral-950">Your Suggestion Stats</h3>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="bg-olive-500/10 rounded-lg p-4 border border-olive-500/20">
            <div className="text-2xl font-bold text-olive-500">{userAccount.suggestionsCount}/10</div>
            <div className="text-sm text-neutral-950/60 font-mono">Suggestions Made</div>
          </div>
          <div className="bg-blaze-600/10 rounded-lg p-4 border border-blaze-600/20">
            <div className="text-2xl font-bold text-blaze-600">
              {userSuggestions.reduce((total, s) => total + s.totalVotes, 0)}
            </div>
            <div className="text-sm text-neutral-950/60 font-mono">Total Votes Received</div>
          </div>
          <div className="bg-sky-blue-500/10 rounded-lg p-4 border border-sky-blue-500/20">
            <div className="text-2xl font-bold text-sky-blue-600">
              {userSuggestions.length > 0 ? Math.max(...userSuggestions.map(s => s.totalVotes)) : 0}
            </div>
            <div className="text-sm text-neutral-950/60 font-mono">Highest Voted Name</div>
          </div>
        </div>
      </div>
    )}

    {/* Connection/Registration Prompts */}
    {!connected && (
      <div className="glass-card text-center">
        <User size={48} className="mx-auto mb-4 text-neutral-950/40" />
        <h3 className="text-xl font-bold mb-2 text-neutral-950">Connect Your Wallet</h3>
        <p className="text-neutral-950/80">Connect your wallet to view your name suggestions</p>
      </div>
    )}

    {connected && !isRegistered && (
      <div className="glass-card text-center">
        <User size={48} className="mx-auto mb-4 text-neutral-950/40" />
        <h3 className="text-xl font-bold mb-2 text-neutral-950">Register First</h3>
        <p className="text-neutral-950/80">You need to register before you can suggest names</p>
      </div>
    )}

    {/* User Suggestions */}
    {connected && isRegistered && (
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-neutral-950">Your Name Suggestions</h3>
          <div className="text-sm text-neutral-950/60 font-mono">
            {userSuggestions.length} of 10 suggestions used
          </div>
        </div>
        
        {userSuggestions.length > 0 ? (
          <div className="space-y-4">
            {userSuggestions
              .sort((a, b) => b.totalVotes - a.totalVotes)
              .map((suggestion, index) => (
                <div key={suggestion.id} className="suggestion-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-neutral-950/40">
                        #{index + 1}
                      </div>
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
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-blaze-600">{suggestion.totalVotes}</div>
                      <div className="text-xs text-neutral-950/60 font-mono">total votes</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-sky-blue-500/10 rounded-lg p-3 border border-sky-blue-500/20">
                      <div className="font-bold text-sky-blue-600">{suggestion.freeVotes}</div>
                      <div className="text-neutral-950/60 font-mono">Free Votes</div>
                    </div>
                    <div className="bg-blaze-600/10 rounded-lg p-3 border border-blaze-600/20">
                      <div className="font-bold text-blaze-600">{suggestion.boostVotes}</div>
                      <div className="text-neutral-950/60 font-mono">Boost Votes</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-neutral-950/40 mt-3 font-mono">
                    Suggested on {new Date(suggestion.timestamp * 1000).toLocaleDateString()}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <User size={48} className="mx-auto mb-4 text-neutral-950/40" />
            <h3 className="text-lg font-bold mb-2 text-neutral-950">No suggestions yet</h3>
            <p className="text-neutral-950/60 mb-4">
              You haven&apos;t suggested any names yet! You can suggest up to 10 names.
            </p>
            <p className="text-sm text-neutral-950/40">
              Go to the &quot;Suggest Names&quot; tab to add your creative ideas.
            </p>
          </div>
        )}
      </div>
    )}

    {/* Suggestion Guidelines */}
    {connected && isRegistered && userAccount && userAccount.suggestionsCount < 10 && (
      <div className="glass-card mt-6">
        <h3 className="text-lg font-bold mb-4 text-neutral-950">💡 Suggestion Tips</h3>
        <ul className="space-y-2 text-sm text-neutral-950/80">
          <li>• Make names memorable and easy to pronounce</li>
          <li>• Consider the mascot&apos;s personality and appearance</li>
          <li>• Avoid names that are too similar to existing suggestions</li>
          <li>• You can suggest up to 10 names total</li>
          <li>• Share your suggestions with friends to get more votes!</li>
        </ul>
      </div>
    )}
  </div>
); 