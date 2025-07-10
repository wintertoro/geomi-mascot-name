'use client';

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { Wallet } from "./Icons";

export const WalletConnection = () => {
  const { account, connected, wallet, disconnect } = useWallet();

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="flex items-center gap-3">
      {connected && account ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Wallet size={16} className="text-olive-500" />
            <span className="font-medium text-neutral-950">{wallet?.name || 'Connected'}</span>
            <span className="font-mono text-neutral-950/60">
              {account.address.toString().slice(0, 6)}...{account.address.toString().slice(-4)}
            </span>
          </div>
          <button 
            onClick={handleDisconnect}
            className="glass-button text-sm"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-950/60">
            <Wallet size={16} />
            <span>Not Connected</span>
          </div>
          <WalletSelector />
        </div>
      )}
    </div>
  );
}; 