import { 
  Aptos, 
  AptosConfig, 
  Network, 
  MoveString,
  U64,
  Bool,
  AccountAddress
} from "@aptos-labs/ts-sdk";

// Types matching the Move contract
export interface NameSuggestion {
  id: string;
  name: string;
  freeVotes: number;
  paidVotes: number;
  totalVotes: number;
  submittedBy: string;
  timestamp: number;
}

export interface UserAccount {
  freeVotesRemaining: number;
  paidVotesOwned: number;
  totalSpent: number;
  freeVotedNames: string[]; // Names user has used free vote on
}

export interface PrizePool {
  total: number;
  contributors: number;
}

export interface VotePack {
  id: string;
  name: string;
  votes: number;
  price: number;
  aptPrice?: number;
  popular?: boolean;
}

export const VOTE_PACKS: VotePack[] = [
  { id: 'starter', name: 'Starter Pack', votes: 5, price: 5 },
  { id: 'booster', name: 'Booster Pack', votes: 12, price: 10, popular: true },
  { id: 'power', name: 'Power Pack', votes: 25, price: 20 },
  { id: 'champion', name: 'Champion Pack', votes: 60, price: 45 },
];

class BlockchainService {
  private aptos: Aptos;
  private contractAddress: string;

  constructor() {
    const config = new AptosConfig({ network: Network.TESTNET });
    this.aptos = new Aptos(config);
    
    // Validate contract address
    this.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
    if (!this.contractAddress) {
      console.error('NEXT_PUBLIC_CONTRACT_ADDRESS environment variable is not set');
      // In development, we can continue but all blockchain calls will fail gracefully
    }
  }

  // Initialize the voting system (admin only)
  async initialize(
    adminAddress: string,
    votingDurationSeconds: number,
    signAndSubmitTransaction: (transaction: any) => Promise<any>
  ): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address is not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.');
    }

    const transaction = await this.aptos.transaction.build.simple({
      sender: adminAddress,
      data: {
        function: `${this.contractAddress}::voting::initialize`,
        functionArguments: [new U64(votingDurationSeconds)],
      },
    });

    const committedTransaction = await signAndSubmitTransaction(transaction);
    return committedTransaction.hash;
  }

  // Register a new user
  async registerUser(
    userAddress: string,
    signAndSubmitTransaction: (transaction: any) => Promise<any>
  ): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address is not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.');
    }

    const transaction = await this.aptos.transaction.build.simple({
      sender: userAddress,
      data: {
        function: `${this.contractAddress}::voting::register_user`,
        functionArguments: [],
      },
    });

    const committedTransaction = await signAndSubmitTransaction(transaction);
    return committedTransaction.hash;
  }

  // Suggest a name
  async suggestName(
    userAddress: string,
    name: string,
    signAndSubmitTransaction: (transaction: any) => Promise<any>
  ): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address is not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.');
    }

    const transaction = await this.aptos.transaction.build.simple({
      sender: userAddress,
      data: {
        function: `${this.contractAddress}::voting::suggest_name`,
        functionArguments: [new MoveString(name)],
      },
    });

    const committedTransaction = await signAndSubmitTransaction(transaction);
    return committedTransaction.hash;
  }

  // Cast a vote
  async castVote(
    userAddress: string,
    suggestionId: number,
    isPaidVote: boolean,
    signAndSubmitTransaction: (transaction: any) => Promise<any>
  ): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address is not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.');
    }

    const transaction = await this.aptos.transaction.build.simple({
      sender: userAddress,
      data: {
        function: `${this.contractAddress}::voting::cast_vote`,
        functionArguments: [
          new U64(suggestionId),
          new Bool(isPaidVote)
        ],
      },
    });

    const committedTransaction = await signAndSubmitTransaction(transaction);
    return committedTransaction.hash;
  }

  // Purchase vote pack
  async purchaseVotePack(
    userAddress: string,
    packType: string,
    aptAmount: number,
    signAndSubmitTransaction: (transaction: any) => Promise<any>
  ): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address is not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.');
    }

    const octasAmount = aptAmount * 100000000; // Convert APT to octas
    
    const transaction = await this.aptos.transaction.build.simple({
      sender: userAddress,
      data: {
        function: `${this.contractAddress}::voting::purchase_vote_pack`,
        functionArguments: [
          new MoveString(packType),
          new U64(octasAmount)
        ],
      },
    });

    const committedTransaction = await signAndSubmitTransaction(transaction);
    return committedTransaction.hash;
  }

  // View functions
  async getSuggestions(): Promise<NameSuggestion[]> {
    if (!this.contractAddress) {
      console.error('Contract address is not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.');
      return [];
    }

    try {
      const result = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::voting::get_suggestions`,
          functionArguments: [],
        },
      });

      // Transform the result from Move format to our interface
      const suggestions = result[0] as any[];
      return suggestions.map((s: any) => ({
        id: s.id.toString(),
        name: s.name,
        freeVotes: parseInt(s.free_votes),
        paidVotes: parseInt(s.paid_votes),
        totalVotes: parseInt(s.total_votes),
        submittedBy: s.submitted_by,
        timestamp: parseInt(s.timestamp),
      }));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }

  async getUserAccount(userAddress: string): Promise<UserAccount | null> {
    if (!this.contractAddress) {
      console.error('Contract address is not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.');
      return null;
    }

    try {
      const result = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::voting::get_user_account`,
          functionArguments: [userAddress],
        },
      });

      const account = result[0] as any;
      return {
        freeVotesRemaining: parseInt(account.free_votes_remaining),
        paidVotesOwned: parseInt(account.paid_votes_owned),
        totalSpent: parseInt(account.total_spent),
        freeVotedNames: account.free_voted_names.map((id: any) => id.toString()),
      };
    } catch (error) {
      console.error('Error fetching user account:', error);
      return null;
    }
  }

  async getPrizePool(): Promise<PrizePool> {
    if (!this.contractAddress) {
      console.error('Contract address is not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.');
      return { total: 0, contributors: 0 };
    }

    try {
      const result = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::voting::get_prize_pool`,
          functionArguments: [],
        },
      });

      const [total, contributors] = result as [string, string];
      return {
        total: parseInt(total) / 100000000, // Convert octas to APT
        contributors: parseInt(contributors),
      };
    } catch (error) {
      console.error('Error fetching prize pool:', error);
      return { total: 0, contributors: 0 };
    }
  }

  async getVotingEndTime(): Promise<number> {
    if (!this.contractAddress) {
      console.error('Contract address is not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.');
      return 0;
    }

    try {
      const result = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::voting::get_voting_end_time`,
          functionArguments: [],
        },
      });

      return parseInt(result[0] as string);
    } catch (error) {
      console.error('Error fetching voting end time:', error);
      return 0;
    }
  }

  // Helper function to check if contract is deployed
  async isContractDeployed(): Promise<boolean> {
    if (!this.contractAddress) {
      console.error('Contract address is not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.');
      return false;
    }
    
    try {
      await this.getSuggestions();
      return true;
    } catch (error) {
      console.error('Error checking contract deployment:', error);
      return false;
    }
  }

  // Get account balance
  async getAccountBalance(address: string): Promise<number> {
    try {
      const resources = await this.aptos.getAccountResources({
        accountAddress: address,
      });
      
      const coinResource = resources.find(
        (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );
      
      if (coinResource) {
        const balance = (coinResource.data as any).coin.value;
        return parseInt(balance) / 100000000; // Convert octas to APT
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching account balance:', error);
      return 0;
    }
  }
}

export const blockchainService = new BlockchainService();

// Export convenience functions that wrap the service methods
export const initialize = (adminAddress: string, votingDurationSeconds: number, signAndSubmitTransaction: any) => 
  blockchainService.initialize(adminAddress, votingDurationSeconds, signAndSubmitTransaction);

export const registerUser = (userAddress: string, signAndSubmitTransaction: any) => 
  blockchainService.registerUser(userAddress, signAndSubmitTransaction);

export const suggestName = (userAddress: string, name: string, signAndSubmitTransaction: any) => 
  blockchainService.suggestName(userAddress, name, signAndSubmitTransaction);

export const castVote = (userAddress: string, suggestionId: number, isPaidVote: boolean, signAndSubmitTransaction: any) => 
  blockchainService.castVote(userAddress, suggestionId, isPaidVote, signAndSubmitTransaction);

export const purchaseVotePack = (userAddress: string, packType: string, aptAmount: number, signAndSubmitTransaction: any) => 
  blockchainService.purchaseVotePack(userAddress, packType, aptAmount, signAndSubmitTransaction);

export const getSuggestions = () => blockchainService.getSuggestions();
export const getUserAccount = (userAddress: string) => blockchainService.getUserAccount(userAddress);
export const getPrizePool = async () => {
  const pool = await blockchainService.getPrizePool();
  return [pool.total, pool.contributors] as [number, number];
};
export const getAccountBalance = (address: string) => blockchainService.getAccountBalance(address); 