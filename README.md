# 🎭 Geomi Mascot Naming Contest - Web3 Voting dApp

A decentralized voting application built on the Aptos blockchain for naming our "Geomi" mascot. Users can suggest names, vote with APT tokens, and compete for the prize pool in a transparent, blockchain-based contest.

## ✨ Features

### 🗳️ **Voting System**
- **Multiple Name Voting**: Vote for as many different names as you like
- **Dual Vote Types**: 
  - **Free Votes**: One per name (3 free votes included with registration)
  - **Paid Votes**: Unlimited per name for maximum impact
- **Strategic Voting**: Stack multiple paid votes on your favorites
- **Permanent Votes**: All votes are irreversible once cast

### 💰 **Monetization & Rewards**
- **Vote Packs**: Purchase with APT tokens (5-60 votes for 5-45 APT)
- **Growing Prize Pool**: All vote pack purchases go into the reward pool
- **Winner Takes All**: Most voted name wins the entire APT prize pool
- **Real Cryptocurrency**: Actual APT token transactions on Aptos testnet

### 🎨 **User Experience**
- **Wallet Integration**: Support for Petra, Martian, and other Aptos wallets
- **Tabbed Interface**: Separate voting and instructions tabs
- **Real-time Updates**: Live vote counts and prize pool tracking
- **Social Sharing**: Share specific names with friends to get more votes
- **Personal Dashboard**: Track your suggested names and their performance
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons

### Blockchain
- **Aptos Blockchain** - Layer 1 blockchain platform
- **Move Language** - Smart contract programming
- **Aptos Wallet Adapter** - Wallet connection and transactions
- **Aptos TypeScript SDK** - Blockchain interactions

### Smart Contract Features
- User registration and account management
- Name suggestion with duplicate prevention
- Dual voting system (free/paid)
- Vote pack purchasing with APT tokens
- Prize pool accumulation and tracking
- Event emission for transparency

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Aptos CLI** (for smart contract deployment)
- **Aptos Wallet** (Petra, Martian, etc.)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd geomi-mascot-name
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_APTOS_NETWORK=testnet
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📜 Smart Contract Deployment

### 1. Install Aptos CLI
```bash
# macOS
brew install aptos

# Or download from: https://github.com/aptos-labs/aptos-core/releases
```

### 2. Initialize Aptos Profile
```bash
aptos init --network testnet
```

### 3. Deploy the Contract
```bash
cd contract
aptos move publish --named-addresses geomi_mascot_voting=<your-address>
```

### 4. Update Environment Variables
Add the deployed contract address to your `.env.local` file.

## 🎮 How to Play

### For First-Time Users
1. **Connect Wallet**: Use your Aptos wallet (Petra recommended)
2. **Register**: Get your 3 free votes and ability to suggest names
3. **Suggest Names**: Submit up to 3 creative names for the Geomi mascot (free)
4. **Vote Strategically**: Use free votes across multiple names

### For Active Participants
1. **Buy Boost Packs**: Purchase additional boost votes with APT tokens
2. **Stack Votes**: Use multiple boost votes on your favorite names
3. **Share Names**: Use the share button to get friends to vote for your favorites
4. **Monitor Progress**: Check "My Suggestions" tab to track your names' performance
5. **Claim Rewards**: Winner takes the entire APT prize pool

## 💎 Vote Pack Options

| Pack | Votes | Price | Value |
|------|-------|-------|-------|
| **Starter** | 5 votes | 5 APT | 1.0 APT/vote |
| **Booster** ⭐ | 12 votes | 10 APT | 0.83 APT/vote |
| **Power** | 25 votes | 20 APT | 0.8 APT/vote |
| **Champion** | 60 votes | 45 APT | 0.75 APT/vote |

*⭐ Most Popular Choice*

## 🏗️ Project Structure

```
geomi-mascot-name/
├── app/                          # Next.js App Router
│   ├── components/               # React components
│   │   ├── WalletConnection.tsx  # Wallet integration
│   │   └── WalletProvider.tsx    # Wallet context provider
│   ├── services/                 # Business logic
│   │   └── blockchain.ts         # Blockchain interactions
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main voting interface
├── contract/                     # Aptos Move contracts
│   ├── sources/
│   │   └── voting.move          # Main voting contract
│   └── Move.toml                # Contract configuration
├── public/                      # Static assets
└── package.json                # Dependencies
```

## 🔧 Development

### Smart Contract Development
```bash
# Test the contract
cd contract
aptos move test

# Compile without publishing
aptos move compile
```

### Frontend Development
```bash
# Run with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## 🎯 Game Rules

### ✅ **Name Suggestions**
- Submit up to 3 creative names for free
- Names must be unique (no duplicates)
- Suggestions are separate from voting
- No cost to suggest names

### ✅ **Voting Rules**
- Vote for multiple different names
- Use one free vote per name
- Purchase and use unlimited paid votes per name
- Each user gets 3 free votes when registering

### ❌ **Restrictions**
- Cannot remove votes once cast
- Cannot vote for the same name with multiple free votes
- Must have sufficient balance for vote pack purchases
- Cannot suggest duplicate names
- Maximum 3 name suggestions per user

## 🏆 Prize Pool Mechanics

- **Funding**: All APT spent on vote packs goes directly to the prize pool
- **Winner**: The name with the most total votes (free + paid) wins
- **Payout**: Winner receives the entire accumulated APT prize pool
- **Transparency**: All transactions are recorded on the Aptos blockchain

## 🛡️ Security & Trust

- **Decentralized**: All voting data stored on Aptos blockchain
- **Transparent**: All transactions are publicly verifiable
- **Immutable**: Votes cannot be changed or deleted
- **Fair**: Equal opportunity for all participants
- **Auditable**: Smart contract code is open source

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Aptos Labs](https://aptoslabs.com/) for the blockchain infrastructure
- [Next.js](https://nextjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- The community for creative mascot name suggestions

## 📞 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Check the Instructions tab in the app
- Review the smart contract documentation

---

**Built with ❤️ for the Geomi community** 🎭
