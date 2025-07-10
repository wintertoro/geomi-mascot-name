import { Coins, Star } from './Icons';
import { VotePack } from '../services/blockchain';

interface VoteStoreTabProps {
  connected: boolean;
  isRegistered: boolean;
  accountBalance: number;
  handlePurchase: (pack: VotePack) => void;
}

const VOTE_PACKS: VotePack[] = [
  { id: 'basic', name: 'Basic Pack', votes: 10, price: 0.1, aptPrice: 0.1 },
  { id: 'standard', name: 'Standard Pack', votes: 10, price: 0.1, aptPrice: 0.1, popular: true },
  { id: 'premium', name: 'Premium Pack', votes: 10, price: 0.1, aptPrice: 0.1 },
  { id: 'ultimate', name: 'Ultimate Pack', votes: 10, price: 0.1, aptPrice: 0.1 },
];

export const VoteStoreTab = ({
  connected,
  isRegistered,
  accountBalance,
  handlePurchase,
}: VoteStoreTabProps) => (
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold mb-4 text-neutral-950">Buy Votes</h1>
      <p className="text-lg text-neutral-950/80">Purchase vote packs to support your favorite names</p>
    </div>

    {/* Account Info */}
    <div className="glass-card mb-8">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-4 text-neutral-950">Your Account</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center bg-black/5 rounded-lg p-4 border border-black/10">
            <div className="text-2xl font-bold text-black">{accountBalance.toFixed(2)} APT</div>
            <div className="text-sm text-black/60">Available Balance</div>
          </div>
          <div className="text-center bg-black/5 rounded-lg p-4 border border-black/10">
            <div className="text-lg font-bold text-black">{connected ? 'Connected' : 'Not Connected'}</div>
            <div className="text-sm text-black/60">Wallet Status</div>
          </div>
          <div className="text-center bg-black/5 rounded-lg p-4 border border-black/10">
            <div className="text-lg font-bold text-black">{isRegistered ? 'Registered' : 'Not Registered'}</div>
            <div className="text-sm text-black/60">Account Status</div>
          </div>
        </div>
      </div>
    </div>

    {/* How It Works */}
    <div className="glass-card mb-8">
      <h3 className="text-xl font-bold mb-4 text-neutral-950">How Vote Packs Work</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-bold mb-2 text-neutral-950">Free Votes vs Paid Votes</h4>
          <ul className="text-sm space-y-1 text-neutral-950/80">
            <li>• <strong>Free votes:</strong> 1 per name maximum</li>
            <li>• <strong>Paid votes:</strong> Unlimited per name</li>
            <li>• <strong>Strategy:</strong> Use paid votes on your favorites</li>
            <li>• <strong>Prize Pool:</strong> All APT goes to winner</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2 text-neutral-950">Value & Benefits</h4>
          <ul className="text-sm space-y-1 text-neutral-950/80">
            <li>• <strong>Fair Price:</strong> All packs cost 0.1 APT for 10 votes</li>
            <li>• <strong>Support Names:</strong> Help your favorites win</li>
            <li>• <strong>Win Prizes:</strong> Winner takes the entire prize pool</li>
            <li>• <strong>On-Chain:</strong> All votes are permanently recorded</li>
          </ul>
        </div>
      </div>
    </div>

    {/* Vote Packs */}
    <div className="glass-card">
      <h3 className="text-xl font-bold mb-6 text-neutral-950">Available Vote Packs</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {VOTE_PACKS.map((pack) => (
          <div key={pack.id} className="suggestion-card text-center">
            {pack.popular && (
              <div className="bg-black text-white px-2 py-1 rounded text-xs mb-4 inline-block">
                <Star size={12} className="inline mr-1" />
                MOST POPULAR
              </div>
            )}
            
            <div className="mb-4">
              <Coins size={32} className="mx-auto mb-2 text-black" />
              <h4 className="font-bold text-lg text-neutral-950">{pack.name}</h4>
            </div>
            
            <div className="mb-4">
              <div className="text-3xl font-bold text-black">{pack.votes}</div>
              <div className="text-sm text-neutral-950/60">votes</div>
            </div>
            
            <div className="mb-4">
              <div className="text-2xl font-bold text-neutral-950">{pack.aptPrice ?? pack.price} APT</div>
              <div className="text-xs text-neutral-950/40">
                {((pack.aptPrice ?? pack.price) / pack.votes).toFixed(3)} APT per vote
              </div>
            </div>
            
            <button
              onClick={() => handlePurchase(pack)}
              disabled={!connected || !isRegistered || accountBalance < (pack.aptPrice ?? pack.price)}
              className="w-full bg-black text-white border border-black px-4 py-2 rounded hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="glass-card mt-8">
      <h3 className="text-xl font-bold mb-4 text-neutral-950">Purchase Information</h3>
      <div className="grid md:grid-cols-2 gap-6 text-sm">
        <div>
          <h4 className="font-bold mb-2 text-neutral-950">What happens when you buy:</h4>
          <ul className="space-y-1 text-neutral-950/80">
            <li>• 0.1 APT is deducted from your wallet</li>
            <li>• 10 vote credits are added to your account</li>
            <li>• Purchase amount goes to prize pool</li>
            <li>• Transaction is recorded on Aptos blockchain</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2 text-neutral-950">Requirements:</h4>
          <ul className="space-y-1 text-neutral-950/80">
            <li>• Connected Aptos wallet</li>
            <li>• Registered account</li>
            <li>• At least 0.1 APT balance</li>
            <li>• Network fees for transaction</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
); 