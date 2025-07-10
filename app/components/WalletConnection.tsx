'use client';

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";

const WalletConnection = () => {
  const [isClient, setIsClient] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Always call useWallet (required by React hooks rules)
  const { account, connected, wallet, disconnect, wallets, connect } = useWallet();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleConnect = async (walletName: string) => {
    if (!isClient) return;
    
    try {
      setIsConnecting(true);
      await connect(walletName);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!isClient) return;
    
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
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
    );
  }

  return (
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
        <span className="text-xs text-black/60">No wallets detected</span>
      )}
    </div>
  );
};

export default WalletConnection;