'use client';

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { Wallet, Users } from "lucide-react";

export const WalletConnection = () => {
  const { account, connected, wallet, network } = useWallet();

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={20} />
          <h2 className="text-lg font-bold">Wallet Connection</h2>
        </div>
        <div className="text-sm text-gray-600">
          Network: {network?.name || 'Not Connected'}
        </div>
      </div>
      
      {connected && account ? (
        <div className="space-y-3">
          <div className="border border-black rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} />
              <span className="font-medium">Connected Account</span>
            </div>
            <div className="text-sm font-mono text-gray-700">
              {account.address.toString()}
            </div>
          </div>
          
          <div className="border border-black rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} />
              <span className="font-medium">Wallet</span>
            </div>
            <div className="text-sm">
              {wallet?.name || 'Unknown Wallet'}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <div className="text-gray-600 text-sm mb-2">
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