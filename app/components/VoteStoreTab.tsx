import { Coins, Star } from './Icons';
import { VotePack } from '../services/blockchain';

interface VoteStoreTabProps {
  connected: boolean;
  isRegistered: boolean;
  accountBalance: number;
  handlePurchase: (pack: VotePack) => void;
}

const VOTE_PACKS: VotePack[] = [
  { id: 'starter', name: 'Starter Pack', votes: 5, price: 5, aptPrice: 5 },
  { id: 'booster', name: 'Booster Pack', votes: 12, price: 10, aptPrice: 10, popular: true },
  { id: 'power', name: 'Power Pack', votes: 25, price: 20, aptPrice: 20 },
  { id: 'champion', name: 'Champion Pack', votes: 60, price: 45, aptPrice: 45 },
];

export const VoteStoreTab = ({
  connected,
  isRegistered,
  accountBalance,
  handlePurchase,
}: VoteStoreTabProps) => (
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold mb-4">Vote Store</h1>
      <p className="text-lg">Purchase vote packs to support your favorite names</p>
    </div>

    {/* Account Info */}
    <div className="glass-card p-6 mb-8">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-4">Your Account</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{accountBalance.toFixed(2)} APT</div>
            <div className="text-sm text-gray-600">Available Balance</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{connected ? 'Connected' : 'Not Connected'}</div>
            <div className="text-sm text-gray-600">Wallet Status</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{isRegistered ? 'Registered' : 'Not Registered'}</div>
            <div className="text-sm text-gray-600">Account Status</div>
          </div>
        </div>
      </div>
    </div>

    {/* How It Works */}
    <div className="glass-card p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">How Vote Packs Work</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-bold mb-2">Free Votes vs Paid Votes</h4>
          <ul className="text-sm space-y-1">
            <li>• <strong>Free votes:</strong> 1 per name maximum</li>
            <li>• <strong>Paid votes:</strong> Unlimited per name</li>
            <li>• <strong>Strategy:</strong> Use paid votes on your favorites</li>
            <li>• <strong>Prize Pool:</strong> All APT goes to winner</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2">Value & Benefits</h4>
          <ul className="text-sm space-y-1">
            <li>• <strong>Best Value:</strong> Larger packs = better price per vote</li>
            <li>• <strong>Support Names:</strong> Help your favorites win</li>
            <li>• <strong>Win Prizes:</strong> Winner takes the entire prize pool</li>
            <li>• <strong>On-Chain:</strong> All votes are permanently recorded</li>
          </ul>
        </div>
      </div>
    </div>

    {/* Vote Packs */}
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-6">Available Vote Packs</h3>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {VOTE_PACKS.map((pack) => (
          <div key={pack.id} className="suggestion-card text-center">
            {pack.popular && (
              <div className="status-badge active mb-4 text-xs inline-block">
                <Star size={12} className="inline mr-1" />
                MOST POPULAR
              </div>
            )}
            
            <div className="mb-4">
              <Coins size={32} className="mx-auto mb-2" />
              <h4 className="font-bold text-lg">{pack.name}</h4>
            </div>
            
            <div className="mb-4">
              <div className="text-3xl font-bold">{pack.votes}</div>
              <div className="text-sm text-gray-600">votes</div>
            </div>
            
            <div className="mb-4">
              <div className="text-2xl font-bold">{pack.aptPrice ?? pack.price} APT</div>
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

    {/* Purchase Info */}
    <div className="glass-card p-6 mt-8">
      <h3 className="text-xl font-bold mb-4">Purchase Information</h3>
      <div className="grid md:grid-cols-2 gap-6 text-sm">
        <div>
          <h4 className="font-bold mb-2">What happens when you buy:</h4>
          <ul className="space-y-1">
            <li>• APT is deducted from your wallet</li>
            <li>• Vote credits are added to your account</li>
            <li>• Purchase amount goes to prize pool</li>
            <li>• Transaction is recorded on Aptos blockchain</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2">Requirements:</h4>
          <ul className="space-y-1">
            <li>• Connected Aptos wallet</li>
            <li>• Registered account</li>
            <li>• Sufficient APT balance</li>
            <li>• Network fees for transaction</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
); 