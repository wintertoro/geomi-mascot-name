'use client';

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { Wallet, Users } from "lucide-react";

export const WalletConnection = () => {
  const { account, connected, wallet, network } = useWallet();

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="text-white" size={24} />
          <h2 className="text-xl font-bold text-white">Wallet Connection</h2>
        </div>
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <span>Network: {network?.name || 'Not Connected'}</span>
        </div>
      </div>
      
      {connected && account ? (
        <div className="space-y-3">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-white" size={16} />
              <span className="text-white font-medium">Connected Account</span>
            </div>
            <div className="text-white/90 text-sm font-mono">
              {account.address.toString()}
            </div>
          </div>
          
          <div className="bg-white/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="text-white" size={16} />
              <span className="text-white font-medium">Wallet</span>
            </div>
            <div className="text-white/90 text-sm">
              {wallet?.name || 'Unknown Wallet'}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <div className="text-white/80 text-sm mb-2">
              Connect your Aptos wallet to start voting
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-center">
        <WalletSelector />
      </div>
    </div>
  );
}; 