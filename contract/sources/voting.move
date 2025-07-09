module geomi_mascot_voting::voting {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_framework::event;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_VOTING_ENDED: u64 = 2;
    const E_ALREADY_VOTED_FREE: u64 = 3;
    const E_INSUFFICIENT_PAYMENT: u64 = 4;
    const E_NAME_NOT_FOUND: u64 = 5;
    const E_DUPLICATE_NAME: u64 = 6;

    /// Vote pack prices in APT (in octas - 1 APT = 100,000,000 octas)
    const STARTER_PACK_PRICE: u64 = 500000000; // 5 APT
    const BOOSTER_PACK_PRICE: u64 = 1000000000; // 10 APT
    const POWER_PACK_PRICE: u64 = 2000000000; // 20 APT
    const CHAMPION_PACK_PRICE: u64 = 4500000000; // 45 APT

    /// Vote pack sizes
    const STARTER_PACK_VOTES: u64 = 5;
    const BOOSTER_PACK_VOTES: u64 = 12;
    const POWER_PACK_VOTES: u64 = 25;
    const CHAMPION_PACK_VOTES: u64 = 60;

    /// Name suggestion structure
    struct NameSuggestion has copy, drop, store {
        id: u64,
        name: String,
        free_votes: u64,
        paid_votes: u64,
        total_votes: u64,
        submitted_by: address,
        timestamp: u64,
    }

    /// User account structure
    struct UserAccount has copy, drop, store {
        free_votes_remaining: u64,
        paid_votes_owned: u64,
        total_spent: u64,
        free_voted_names: vector<u64>, // Names user has used free vote on
    }

    /// Voting system resource
    struct VotingSystem has key {
        admin: address,
        suggestions: vector<NameSuggestion>,
        users: vector<UserAccount>,
        user_addresses: vector<address>,
        prize_pool: Coin<AptosCoin>,
        prize_pool_amount: u64,
        contributors: u64,
        next_suggestion_id: u64,
        voting_end_time: u64,
    }

    /// Events
    struct NameSuggestedEvent has drop, store {
        id: u64,
        name: String,
        submitted_by: address,
        timestamp: u64,
    }

    struct VoteCastEvent has drop, store {
        suggestion_id: u64,
        voter: address,
        is_paid_vote: bool,
        timestamp: u64,
    }

    struct VotePackPurchasedEvent has drop, store {
        buyer: address,
        pack_type: String,
        votes_purchased: u64,
        amount_paid: u64,
        timestamp: u64,
    }

    /// Initialize the voting system
    public fun initialize(admin: &signer, voting_duration_seconds: u64) {
        let admin_addr = signer::address_of(admin);
        
        let voting_system = VotingSystem {
            admin: admin_addr,
            suggestions: vector::empty<NameSuggestion>(),
            users: vector::empty<UserAccount>(),
            user_addresses: vector::empty<address>(),
            prize_pool: coin::zero<AptosCoin>(),
            prize_pool_amount: 0,
            contributors: 0,
            next_suggestion_id: 1,
            voting_end_time: timestamp::now_seconds() + voting_duration_seconds,
        };
        
        move_to(admin, voting_system);
    }

    /// Register a new user
    public fun register_user(user: &signer) acquires VotingSystem {
        let user_addr = signer::address_of(user);
        let voting_system = borrow_global_mut<VotingSystem>(@geomi_mascot_voting);
        
        // Check if user already registered
        let user_exists = vector::contains(&voting_system.user_addresses, &user_addr);
        if (!user_exists) {
            let user_account = UserAccount {
                free_votes_remaining: 1, // Each user gets 1 free vote
                paid_votes_owned: 0,
                total_spent: 0,
                free_voted_names: vector::empty<u64>(),
            };
            
            vector::push_back(&mut voting_system.users, user_account);
            vector::push_back(&mut voting_system.user_addresses, user_addr);
        };
    }

    /// Submit a name suggestion
    public fun suggest_name(user: &signer, name: String) acquires VotingSystem {
        let user_addr = signer::address_of(user);
        let voting_system = borrow_global_mut<VotingSystem>(@geomi_mascot_voting);
        
        // Check if voting has ended
        assert!(timestamp::now_seconds() < voting_system.voting_end_time, E_VOTING_ENDED);
        
        // Check for duplicate names
        let i = 0;
        let len = vector::length(&voting_system.suggestions);
        while (i < len) {
            let suggestion = vector::borrow(&voting_system.suggestions, i);
            assert!(suggestion.name != name, E_DUPLICATE_NAME);
            i = i + 1;
        };
        
        // Find user account
        let user_index = get_user_index(user_addr, voting_system);
        let user_account = vector::borrow_mut(&mut voting_system.users, user_index);
        
        // Check if user has free votes
        assert!(user_account.free_votes_remaining > 0, E_INSUFFICIENT_PAYMENT);
        
        // Create suggestion
        let suggestion = NameSuggestion {
            id: voting_system.next_suggestion_id,
            name,
            free_votes: 1,
            paid_votes: 0,
            total_votes: 1,
            submitted_by: user_addr,
            timestamp: timestamp::now_seconds(),
        };
        
        vector::push_back(&mut voting_system.suggestions, suggestion);
        voting_system.next_suggestion_id = voting_system.next_suggestion_id + 1;
        
        // Update user account
        user_account.free_votes_remaining = user_account.free_votes_remaining - 1;
        vector::push_back(&mut user_account.free_voted_names, suggestion.id);
        
        // Emit event
        event::emit(NameSuggestedEvent {
            id: suggestion.id,
            name: suggestion.name,
            submitted_by: user_addr,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Cast a vote (free or paid)
    public fun cast_vote(user: &signer, suggestion_id: u64, is_paid_vote: bool) acquires VotingSystem {
        let user_addr = signer::address_of(user);
        let voting_system = borrow_global_mut<VotingSystem>(@geomi_mascot_voting);
        
        // Check if voting has ended
        assert!(timestamp::now_seconds() < voting_system.voting_end_time, E_VOTING_ENDED);
        
        // Find user account
        let user_index = get_user_index(user_addr, voting_system);
        let user_account = vector::borrow_mut(&mut voting_system.users, user_index);
        
        if (is_paid_vote) {
            // For paid votes, just check if user has paid votes available
            assert!(user_account.paid_votes_owned > 0, E_INSUFFICIENT_PAYMENT);
            user_account.paid_votes_owned = user_account.paid_votes_owned - 1;
        } else {
            // For free votes, check if user has free votes and hasn't used free vote on this name
            assert!(user_account.free_votes_remaining > 0, E_INSUFFICIENT_PAYMENT);
            assert!(!vector::contains(&user_account.free_voted_names, &suggestion_id), E_ALREADY_VOTED_FREE);
            user_account.free_votes_remaining = user_account.free_votes_remaining - 1;
            vector::push_back(&mut user_account.free_voted_names, suggestion_id);
        };
        
        // Find and update suggestion
        let suggestion_index = get_suggestion_index(suggestion_id, voting_system);
        let suggestion = vector::borrow_mut(&mut voting_system.suggestions, suggestion_index);
        
        if (is_paid_vote) {
            suggestion.paid_votes = suggestion.paid_votes + 1;
        } else {
            suggestion.free_votes = suggestion.free_votes + 1;
        };
        suggestion.total_votes = suggestion.total_votes + 1;
        
        // Emit event
        event::emit(VoteCastEvent {
            suggestion_id,
            voter: user_addr,
            is_paid_vote,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Purchase vote pack
    public fun purchase_vote_pack(user: &signer, pack_type: String, payment_amount: u64) acquires VotingSystem {
        let user_addr = signer::address_of(user);
        let voting_system = borrow_global_mut<VotingSystem>(@geomi_mascot_voting);
        
        let (votes_to_add, expected_price) = if (pack_type == string::utf8(b"starter")) {
            (STARTER_PACK_VOTES, STARTER_PACK_PRICE)
        } else if (pack_type == string::utf8(b"booster")) {
            (BOOSTER_PACK_VOTES, BOOSTER_PACK_PRICE)
        } else if (pack_type == string::utf8(b"power")) {
            (POWER_PACK_VOTES, POWER_PACK_PRICE)
        } else if (pack_type == string::utf8(b"champion")) {
            (CHAMPION_PACK_VOTES, CHAMPION_PACK_PRICE)
        } else {
            (0, 0)
        };
        
        assert!(payment_amount >= expected_price, E_INSUFFICIENT_PAYMENT);
        
        // Withdraw payment from user's account
        let payment = coin::withdraw<AptosCoin>(user, payment_amount);
        
        // Add payment to prize pool - properly merge the coins
        coin::merge(&mut voting_system.prize_pool, payment);
        voting_system.prize_pool_amount = voting_system.prize_pool_amount + payment_amount;
        voting_system.contributors = voting_system.contributors + 1;
        
        // Find user account
        let user_index = get_user_index(user_addr, voting_system);
        let user_account = vector::borrow_mut(&mut voting_system.users, user_index);
        
        // Update user account
        user_account.paid_votes_owned = user_account.paid_votes_owned + votes_to_add;
        user_account.total_spent = user_account.total_spent + payment_amount;
        
        // Emit event
        event::emit(VotePackPurchasedEvent {
            buyer: user_addr,
            pack_type,
            votes_purchased: votes_to_add,
            amount_paid: payment_amount,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Helper function to get user index
    fun get_user_index(user_addr: address, voting_system: &VotingSystem): u64 {
        let i = 0;
        let len = vector::length(&voting_system.user_addresses);
        while (i < len) {
            if (*vector::borrow(&voting_system.user_addresses, i) == user_addr) {
                return i
            };
            i = i + 1;
        };
        abort E_NOT_AUTHORIZED
    }

    /// Helper function to get suggestion index
    fun get_suggestion_index(suggestion_id: u64, voting_system: &VotingSystem): u64 {
        let i = 0;
        let len = vector::length(&voting_system.suggestions);
        while (i < len) {
            let suggestion = vector::borrow(&voting_system.suggestions, i);
            if (suggestion.id == suggestion_id) {
                return i
            };
            i = i + 1;
        };
        abort E_NAME_NOT_FOUND
    }

    /// View functions
    #[view]
    public fun get_suggestions(): vector<NameSuggestion> acquires VotingSystem {
        let voting_system = borrow_global<VotingSystem>(@geomi_mascot_voting);
        voting_system.suggestions
    }

    #[view]
    public fun get_user_account(user_addr: address): UserAccount acquires VotingSystem {
        let voting_system = borrow_global<VotingSystem>(@geomi_mascot_voting);
        let user_index = get_user_index(user_addr, voting_system);
        *vector::borrow(&voting_system.users, user_index)
    }

    #[view]
    public fun get_prize_pool(): (u64, u64) acquires VotingSystem {
        let voting_system = borrow_global<VotingSystem>(@geomi_mascot_voting);
        (voting_system.prize_pool_amount, voting_system.contributors)
    }

    #[view]
    public fun get_voting_end_time(): u64 acquires VotingSystem {
        let voting_system = borrow_global<VotingSystem>(@geomi_mascot_voting);
        voting_system.voting_end_time
    }
} 