'use client';

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { type PropsWithChildren, useEffect, useState } from "react";
import { Network } from "@aptos-labs/ts-sdk";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render wallet provider on server side
  if (!isClient) {
    return <div>{children}</div>;
  }

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ 
        network: Network.TESTNET, // Use testnet for development
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