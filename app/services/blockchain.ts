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
  boostVotes: number;
  totalVotes: number;
  submittedBy: string;
  timestamp: number;
}

export interface UserAccount {
  freeVotesRemaining: number;
  boostVotesOwned: number;
  totalSpent: number;
  freeVotedNames: string[]; // Names user has used free vote on
  suggestionsCount: number; // Number of names user has suggested
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
  { id: 'basic', name: 'Basic Pack', votes: 10, price: 0.1 },
  { id: 'standard', name: 'Standard Pack', votes: 25, price: 0.3, popular: true },
  { id: 'premium', name: 'Premium Pack', votes: 50, price: 0.6 },
  { id: 'ultimate', name: 'Ultimate Pack', votes: 100, price: 1.0 },
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
      console.error('❌ NEXT_PUBLIC_CONTRACT_ADDRESS environment variable is not set');
      console.error('Available NEXT_PUBLIC_ variables:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
      // In development, we can continue but all blockchain calls will fail gracefully
    } else {
      console.log('✅ Contract address loaded successfully:', this.contractAddress);
    }
  }

  // Check if the service is properly configured
  isConfigured(): boolean {
    return !!this.contractAddress;
  }

  // Get configuration status for debugging
  getConfigurationStatus(): { configured: boolean; contractAddress?: string; error?: string } {
    if (this.contractAddress) {
      return {
        configured: true,
        contractAddress: this.contractAddress
      };
    }
    return {
      configured: false,
      error: 'Contract address not set. Please check NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.'
    };
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
        function: `${this.contractAddress}::geomi_voting::initialize`,
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
        function: `${this.contractAddress}::geomi_voting::register_user`,
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
      const configStatus = this.getConfigurationStatus();
      console.error('Contract configuration error:', configStatus);
      throw new Error(`Contract not configured. ${configStatus.error} Current environment: ${process.env.NODE_ENV}`);
    }

    try {
      console.log('🔨 Building transaction...');
      console.log('Contract address:', this.contractAddress);
      console.log('User address:', userAddress);
      console.log('Name:', name);

      const transaction = await this.aptos.transaction.build.simple({
        sender: userAddress,
        data: {
          function: `${this.contractAddress}::geomi_voting::suggest_name`,
          functionArguments: [new MoveString(name)],
        },
      });

      console.log('✅ Transaction built successfully');
      console.log('Transaction object:', transaction);
      console.log('Transaction type:', typeof transaction);
      console.log('Transaction keys:', Object.keys(transaction));
      
      console.log('🚀 Submitting transaction...');
      const committedTransaction = await signAndSubmitTransaction(transaction);
      
      console.log('✅ Transaction submitted successfully');
      console.log('Committed transaction:', committedTransaction);
      
      return committedTransaction.hash;
    } catch (error: any) {
      console.error('❌ Error in suggestName function:');
      console.error('Error type:', typeof error);
      console.error('Error instanceof Error:', error instanceof Error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Full error object:', error);
      throw error;
    }
  }

  // Cast a vote
  async castVote(
    userAddress: string,
    suggestionId: number,
    isBoostVote: boolean,
    signAndSubmitTransaction: (transaction: any) => Promise<any>
  ): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address is not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.');
    }

    const transaction = await this.aptos.transaction.build.simple({
      sender: userAddress,
      data: {
        function: `${this.contractAddress}::geomi_voting::cast_vote`,
        functionArguments: [
          new U64(suggestionId),
          new Bool(isBoostVote)
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
        function: `${this.contractAddress}::geomi_voting::purchase_vote_pack`,
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
          function: `${this.contractAddress}::geomi_voting::get_suggestions`,
          functionArguments: [],
        },
      });

      // Transform the result from Move format to our interface
      const suggestions = result[0] as any[];
      return suggestions.map((s: any) => ({
        id: s.id.toString(),
        name: s.name,
        freeVotes: parseInt(s.free_votes),
        boostVotes: parseInt(s.boost_votes),
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
          function: `${this.contractAddress}::geomi_voting::get_user_account`,
          functionArguments: [userAddress],
        },
      });

      const account = result[0] as any;
      return {
        freeVotesRemaining: parseInt(account.free_votes_remaining),
        boostVotesOwned: parseInt(account.boost_votes_owned),
        totalSpent: parseInt(account.total_spent),
        freeVotedNames: account.free_voted_names.map((id: any) => id.toString()),
        suggestionsCount: parseInt(account.suggestions_count),
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
          function: `${this.contractAddress}::geomi_voting::get_prize_pool`,
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
          function: `${this.contractAddress}::geomi_voting::get_voting_end_time`,
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

export const castVote = (userAddress: string, suggestionId: number, isBoostVote: boolean, signAndSubmitTransaction: any) => 
  blockchainService.castVote(userAddress, suggestionId, isBoostVote, signAndSubmitTransaction);

export const purchaseVotePack = (userAddress: string, packType: string, aptAmount: number, signAndSubmitTransaction: any) => 
  blockchainService.purchaseVotePack(userAddress, packType, aptAmount, signAndSubmitTransaction);

export const getSuggestions = () => blockchainService.getSuggestions();
export const getUserAccount = (userAddress: string) => blockchainService.getUserAccount(userAddress);
export const getPrizePool = async () => {
  const pool = await blockchainService.getPrizePool();
  return [pool.total, pool.contributors] as [number, number];
};
export const getAccountBalance = (address: string) => blockchainService.getAccountBalance(address); 