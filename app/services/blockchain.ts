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
  private initialized: boolean = false;

  constructor() {
    const config = new AptosConfig({ network: Network.TESTNET });
    this.aptos = new Aptos(config);
    this.contractAddress = "";
    // Don't initialize immediately - wait for client-side
  }

  // Lazy initialization for client-side
  private ensureInitialized() {
    if (this.initialized) return;
    
    // Debug logging
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      typeof_window: typeof window,
      all_env_vars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
    });
    
    // Validate contract address
    this.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
    if (!this.contractAddress) {
      console.error('NEXT_PUBLIC_CONTRACT_ADDRESS environment variable is not set');
      console.error('Available NEXT_PUBLIC_ variables:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
      // In development, we can continue but all blockchain calls will fail gracefully
    } else {
      console.log('Contract address loaded successfully:', this.contractAddress);
    }
    
    this.initialized = true;
  }

  // Check if the service is properly configured
  isConfigured(): boolean {
    this.ensureInitialized();
    return !!this.contractAddress;
  }

  // Get configuration status for debugging
  getConfigurationStatus(): { configured: boolean; contractAddress?: string; error?: string } {
    this.ensureInitialized();
    
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
    this.ensureInitialized();
    
    if (!this.contractAddress) {
      const configStatus = this.getConfigurationStatus();
      console.error('Contract configuration error:', configStatus);
      throw new Error(`Contract not configured. ${configStatus.error} Current environment: ${process.env.NODE_ENV}`);
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
    this.ensureInitialized();
    
    if (!this.contractAddress) {
      const configStatus = this.getConfigurationStatus();
      console.error('Contract configuration error:', configStatus);
      throw new Error(`Contract not configured. ${configStatus.error} Current environment: ${process.env.NODE_ENV}`);
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
    this.ensureInitialized();
    
    if (!this.contractAddress) {
      const configStatus = this.getConfigurationStatus();
      console.error('Contract configuration error:', configStatus);
      throw new Error(`Contract not configured. ${configStatus.error} Current environment: ${process.env.NODE_ENV}`);
    }

    const transaction = await this.aptos.transaction.build.simple({
      sender: userAddress,
      data: {
        function: `${this.contractAddress}::geomi_voting::suggest_name`,
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
    isBoostVote: boolean,
    signAndSubmitTransaction: (transaction: any) => Promise<any>
  ): Promise<string> {
    this.ensureInitialized();
    
    if (!this.contractAddress) {
      const configStatus = this.getConfigurationStatus();
      console.error('Contract configuration error:', configStatus);
      throw new Error(`Contract not configured. ${configStatus.error} Current environment: ${process.env.NODE_ENV}`);
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
    this.ensureInitialized();
    
    if (!this.contractAddress) {
      const configStatus = this.getConfigurationStatus();
      console.error('Contract configuration error:', configStatus);
      throw new Error(`Contract not configured. ${configStatus.error} Current environment: ${process.env.NODE_ENV}`);
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
    this.ensureInitialized();
    
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
    this.ensureInitialized();
    
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

      // Parse the result based on the expected structure
      const accountData = result[0] as any;
      
      return {
        freeVotesRemaining: parseInt(accountData.freeVotesRemaining || '0'),
        boostVotesOwned: parseInt(accountData.boostVotesOwned || '0'),
        totalSpent: parseInt(accountData.totalSpent || '0'),
        freeVotedNames: accountData.freeVotedNames || [],
        suggestionsCount: parseInt(accountData.suggestionsCount || '0'),
      };
    } catch (error) {
      console.error('Error fetching user account:', error);
      return null;
    }
  }

  async getPrizePool(): Promise<PrizePool> {
    this.ensureInitialized();
    
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

      const poolData = result[0] as any;
      return {
        total: parseInt(poolData.total || '0'),
        contributors: parseInt(poolData.contributors || '0'),
      };
    } catch (error) {
      console.error('Error fetching prize pool:', error);
      return { total: 0, contributors: 0 };
    }
  }

  async getVotingEndTime(): Promise<number> {
    this.ensureInitialized();
    
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
    this.ensureInitialized();
    
    if (!this.contractAddress) {
      console.error('Contract address is not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.');
      return false;
    }

    try {
      await this.aptos.getAccountResources({
        accountAddress: this.contractAddress,
      });
      return true;
    } catch (error) {
      console.error('Contract not deployed or accessible:', error);
      return false;
    }
  }

  // Get account balance
  async getAccountBalance(address: string): Promise<number> {
    this.ensureInitialized();
    
    try {
      const resources = await this.aptos.getAccountResources({
        accountAddress: address,
      });
      
      const accountResource = resources.find(
        (resource) => resource.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );
      
      if (accountResource) {
        const balance = (accountResource.data as any).coin.value;
        return parseInt(balance) / 100000000; // Convert from octas to APT
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