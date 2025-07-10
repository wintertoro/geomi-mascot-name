'use client';

import { type PropsWithChildren, useEffect, useState } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";

const WalletProvider = ({ children }: PropsWithChildren) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render children without wallet provider during SSR
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <AptosWalletAdapterProvider
      autoConnect={false}
      dappConfig={{ 
        network: Network.TESTNET,
        // Configure multiple popular wallets
        aptosConnectDappId: "57fa42a9-29c6-4f1e-939c-4eefa36d9ff5",
        // Add manifest for Mizu wallet
        mizuwallet: {
          manifestURL: "https://assets.mizu.io/wallet/manifest.json",
        },
      }}
      onError={(error) => {
        console.error("Wallet connection error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};

export default WalletProvider; 