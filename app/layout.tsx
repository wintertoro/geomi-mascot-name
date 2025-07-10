import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import dynamic from "next/dynamic";

// Dynamically import WalletProvider to prevent SSR issues
const WalletProvider = dynamic(
  () => import("./components/WalletProvider"),
  { ssr: false }
);

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Geomi Mascot Name Voting",
  description: "Vote for your favorite mascot name using Aptos blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fredoka.variable} font-inter antialiased`}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
