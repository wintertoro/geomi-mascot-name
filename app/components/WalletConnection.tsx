'use client';

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";

const WalletConnection = () => {
  const [isClient, setIsClient] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string>('');
  
  // Always call useWallet (required by React hooks rules)
  const { account, connected, wallet, disconnect, wallets, connect } = useWallet();

  useEffect(() => {
    setIsClient(true);
    // Debug: log available wallets
    console.log('Available wallets:', wallets);
    console.log('Connected:', connected);
    console.log('Account:', account);
  }, [wallets, connected, account]);

  const handleConnect = async (walletName: string) => {
    if (!isClient) return;
    
    try {
      setIsConnecting(true);
      setConnectionError('');
      console.log('Attempting to connect to:', walletName);
      
      await connect(walletName);
      console.log('Successfully connected to:', walletName);
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      setConnectionError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!isClient) return;
    
    try {
      setConnectionError('');
      await disconnect();
      console.log('Successfully disconnected');
    } catch (error: any) {
      console.error("Failed to disconnect wallet:", error);
      setConnectionError(error.message || 'Failed to disconnect wallet');
    }
  };

  // Show loading state during SSR and initial hydration
  if (!isClient) {
    return (
      <div className="flex items-center gap-3 p-3 border border-black">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-sm text-black/60">Loading wallet...</span>
        </div>
      </div>
    );
  }

  if (connected && account) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 p-3 border border-black">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-black">
              {wallet?.name || 'Connected'}
            </span>
            <span className="text-xs font-mono text-black/60">
              {account.address.toString().slice(0, 6)}...{account.address.toString().slice(-4)}
            </span>
          </div>
          <button 
            type="button"
            onClick={handleDisconnect}
            className="px-3 py-1 text-xs border border-black text-black hover:bg-black hover:text-white"
          >
            Disconnect
          </button>
        </div>
        {connectionError && (
          <div className="text-xs text-red-600 px-3">
            {connectionError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 p-3 border border-black">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-sm text-black/60">Not Connected</span>
        </div>
        
        {wallets.length > 0 ? (
          <select
            onChange={(e) => {
              const walletName = e.target.value;
              if (walletName) {
                handleConnect(walletName);
              }
            }}
            disabled={isConnecting}
            className="px-3 py-1 text-xs border border-black text-black bg-white disabled:opacity-50"
            defaultValue=""
          >
            <option value="" disabled>
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </option>
            {wallets.map((wallet) => (
              <option key={wallet.name} value={wallet.name}>
                {wallet.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-xs text-orange-600">
            No wallets detected. Please install a wallet extension.
          </div>
        )}
      </div>
      
      {connectionError && (
        <div className="text-xs text-red-600 px-3">
          {connectionError}
        </div>
      )}
      
      {wallets.length === 0 && (
        <div className="text-xs text-gray-500 px-3">
          <p>Popular Aptos wallets:</p>
          <ul className="list-disc list-inside mt-1">
            <li><a href="https://petra.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Petra Wallet</a></li>
            <li><a href="https://martianwallet.xyz/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Martian Wallet</a></li>
            <li><a href="https://pontem.network/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Pontem Wallet</a></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;