'use client';

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { Wallet } from "./Icons";

export const WalletConnection = () => {
  const { account, connected, wallet } = useWallet();

  return (
    <div className="flex items-center gap-3">
      {connected && account ? (
        <div className="flex items-center gap-2 text-sm">
          <Wallet size={16} />
          <span className="font-medium">{wallet?.name || 'Connected'}</span>
          <span className="font-mono text-gray-600">
            {account.address.toString().slice(0, 6)}...{account.address.toString().slice(-4)}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Wallet size={16} />
          <span>Not Connected</span>
        </div>
      )}
      
      <WalletSelector />
    </div>
  );
}; 