use starknet::ContractAddress;

#[derive(Drop, Serde, starknet::Store)]
pub enum UserType {
    Individual,
    Business,
    Carrier,
    Shipper,
    Receiver,
    Admin,
}

#[derive(Drop, Serde, starknet::Store)]
pub enum VerificationLevel {
    None,
    Basic,
    Enhanced,
    Premium,
    Enterprise,
}

#[derive(Drop, Serde, starknet::Store)]
pub enum UserStatus {
    Active,
    Suspended,
    Banned,
    PendingVerification,
}

#[derive(Drop, Serde, starknet::Store)]
pub struct UserProfile {
    pub user_address: ContractAddress,
    pub user_type: UserType,
    pub name: felt252,
    pub email_hash: felt252,
    pub phone_hash: felt252,
    pub business_license: felt252, // For business users
    pub registration_timestamp: u64,
    pub verification_level: VerificationLevel,
    pub status: UserStatus,
    pub metadata_uri: felt252, // IPFS hash for additional data
}

#[derive(Drop, Serde, starknet::Store)]
pub struct ReputationScore {
    pub total_score: u32,
    pub completed_shipments: u32,
    pub dispute_count: u32,
    pub positive_reviews: u32,
    pub negative_reviews: u32,
    pub last_updated: u64,
}


#[derive(Drop, Serde, starknet::Store)]
pub struct ReputationUpdate {
    pub user_address: ContractAddress,
    pub score_change: i32,
    pub reason: felt252,
    pub timestamp: u64,
    pub updated_by: ContractAddress,
}

#[starknet::interface]
pub trait IUserManager<TContractState> {
    fn register_user(
        ref self: TContractState,
        user_type: UserType,
        name: felt252,
        email_hash: felt252,
        phone_hash: felt252,
        business_license: felt252,
        metadata_uri: felt252
    );
    
    fn update_user_profile(
        ref self: TContractState,
        name: felt252,
        email_hash: felt252,
        phone_hash: felt252,
        metadata_uri: felt252
    );
    
    fn verify_user(
        ref self: TContractState,
        user_address: ContractAddress,
        verification_level: VerificationLevel
    );
    
    fn suspend_user(ref self: TContractState, user_address: ContractAddress);
    
    fn get_user_profile(self: @TContractState, user_address: ContractAddress) -> UserProfile;
    
    fn is_user_verified(
        self: @TContractState,
        user_address: ContractAddress,
        min_level: VerificationLevel
    ) -> bool;
    
    fn get_user_reputation(self: @TContractState, user_address: ContractAddress) -> ReputationScore;

    
    fn update_reputation(
        ref self: TContractState,
        user_address: ContractAddress,
        score_change: i32,
        reason: felt252
    );
    
    fn add_verifier(ref self: TContractState, verifier_address: ContractAddress);
    
    fn add_admin(ref self: TContractState, admin_address: ContractAddress);
    
    fn get_total_users(self: @TContractState) -> u32;
}

#[starknet::contract]
pub mod UserManager {
    use super::{
        UserType, VerificationLevel, UserStatus, UserProfile, ReputationScore, ReputationUpdate,
        IUserManager
    };
    use starknet::{
        ContractAddress, get_caller_address, get_block_timestamp,
        storage::{
            StoragePointerReadAccess, StoragePointerWriteAccess, StoragePathEntry, Map
        }
    };

    #[storage]
    struct Storage {
        owner: ContractAddress,
        total_users: u32,
        user_profiles: Map<ContractAddress, UserProfile>,
        reputation_scores: Map<ContractAddress, ReputationScore>,
        reputation_history: Map<(ContractAddress, u32), ReputationUpdate>,
        reputation_history_count: Map<ContractAddress, u32>,
        verified_users: Map<VerificationLevel, Map<ContractAddress, bool>>,
        admins: Map<ContractAddress, bool>,
        verifiers: Map<ContractAddress, bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        UserRegistered: UserRegistered,
        UserVerified: UserVerified,
        UserSuspended: UserSuspended,
        ProfileUpdated: ProfileUpdated,
        ReputationUpdated: ReputationUpdated,
        VerifierAdded: VerifierAdded,
        AdminAdded: AdminAdded,
    }

    
    #[derive(Drop, starknet::Event)]
    pub struct UserRegistered {
        pub user_address: ContractAddress,
        pub user_type: UserType,
        pub name: felt252,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct UserVerified {
        pub user_address: ContractAddress,
        pub verification_level: VerificationLevel,
        pub verified_by: ContractAddress,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct UserSuspended {
        pub user_address: ContractAddress,
        pub suspended_by: ContractAddress,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ProfileUpdated {
        pub user_address: ContractAddress,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ReputationUpdated {
        pub user_address: ContractAddress,
        pub score_change: i32,
        pub new_total_score: u32,
        pub reason: felt252,
        pub updated_by: ContractAddress,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct VerifierAdded {
        pub verifier_address: ContractAddress,
        pub added_by: ContractAddress,
        pub timestamp: u64,
    }


    #[derive(Drop, starknet::Event)]
    pub struct AdminAdded {
        pub admin_address: ContractAddress,
        pub added_by: ContractAddress,
        pub timestamp: u64,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        self.admins.entry(owner).write(true);
        self.total_users.write(0);
    }

    #[abi(embed_v0)]
    impl UserManagerImpl of IUserManager<ContractState> {
        fn register_user(
            ref self: ContractState,
            user_type: UserType,
            name: felt252,
            email_hash: felt252,
            phone_hash: felt252,
            business_license: felt252,
            metadata_uri: felt252
        ) {
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();
            
            // Check if user is already registered
            let existing_profile = self.user_profiles.entry(caller).read();
            assert(existing_profile.user_address.is_zero(), 'User already registered');

            // Create user profile
            let profile = UserProfile {
                user_address: caller,
                user_type,
                name,
                email_hash,
                phone_hash,
                business_license,
                registration_timestamp: timestamp,
                verification_level: VerificationLevel::None,
                status: UserStatus::PendingVerification,
                metadata_uri,
            };

            // Store profile
            self.user_profiles.entry(caller).write(profile);

            // Initialize reputation score
            let initial_reputation = ReputationScore {
                total_score: 100, // Starting score
                completed_shipments: 0,
                dispute_count: 0,
                positive_reviews: 0,
                negative_reviews: 0,
                last_updated: timestamp,
            };
            self.reputation_scores.entry(caller).write(initial_reputation);


            // Increment total users
            let current_total = self.total_users.read();
            self.total_users.write(current_total + 1);

            // Emit event
            self.emit(UserRegistered {
                user_address: caller,
                user_type,
                name,
                timestamp,
            });
        }

        fn update_user_profile(
            ref self: ContractState,
            name: felt252,
            email_hash: felt252,
            phone_hash: felt252,
            metadata_uri: felt252
        ) {
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();
            
            let mut profile = self.user_profiles.entry(caller).read();
            assert(!profile.user_address.is_zero(), 'User not registered');
            assert(profile.status != UserStatus::Banned, 'User is banned');

            // Update profile fields
            profile.name = name;
            profile.email_hash = email_hash;
            profile.phone_hash = phone_hash;
            profile.metadata_uri = metadata_uri;

            self.user_profiles.entry(caller).write(profile);

            self.emit(ProfileUpdated {
                user_address: caller,
                timestamp,
            });
        }


        fn verify_user(
            ref self: ContractState,
            user_address: ContractAddress,
            verification_level: VerificationLevel
        ) {
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();
            
            // Check if caller is a verifier
            assert(self.verifiers.entry(caller).read(), 'Not authorized verifier');

            let mut profile = self.user_profiles.entry(user_address).read();
            assert(!profile.user_address.is_zero(), 'User not registered');

            // Update verification level
            profile.verification_level = verification_level;
            profile.status = UserStatus::Active;
            self.user_profiles.entry(user_address).write(profile);

            // Mark user as verified for this level
            self.verified_users.entry(verification_level).entry(user_address).write(true);

            self.emit(UserVerified {
                user_address,
                verification_level,
                verified_by: caller,
                timestamp,
            });
        }

        fn suspend_user(ref self: ContractState, user_address: ContractAddress) {
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();
            
            // Check if caller is an admin
            assert(self.admins.entry(caller).read(), 'Not authorized admin');

            let mut profile = self.user_profiles.entry(user_address).read();
            assert(!profile.user_address.is_zero(), 'User not registered');

            profile.status = UserStatus::Suspended;
            self.user_profiles.entry(user_address).write(profile);

            self.emit(UserSuspended {
                user_address,
                suspended_by: caller,
                timestamp,
            });
        }


        fn get_user_profile(self: @ContractState, user_address: ContractAddress) -> UserProfile {
            self.user_profiles.entry(user_address).read()
        }

        fn is_user_verified(
            self: @ContractState,
            user_address: ContractAddress,
            min_level: VerificationLevel
        ) -> bool {
            let profile = self.user_profiles.entry(user_address).read();
            if profile.user_address.is_zero() {
                return false;
            }

            // Check if user meets minimum verification level
            let user_level_value = match profile.verification_level {
                VerificationLevel::None => 0,
                VerificationLevel::Basic => 1,
                VerificationLevel::Enhanced => 2,
                VerificationLevel::Premium => 3,
                VerificationLevel::Enterprise => 4,
            };

            let min_level_value = match min_level {
                VerificationLevel::None => 0,
                VerificationLevel::Basic => 1,
                VerificationLevel::Enhanced => 2,
                VerificationLevel::Premium => 3,
                VerificationLevel::Enterprise => 4,
            };

            user_level_value >= min_level_value
        }

        fn get_user_reputation(self: @ContractState, user_address: ContractAddress) -> ReputationScore {
            self.reputation_scores.entry(user_address).read()
        }

        fn update_reputation(
            ref self: ContractState,
            user_address: ContractAddress,
            score_change: i32,
            reason: felt252
        ) {
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();
            
            // Check if caller is an admin or the platform contract
            assert(self.admins.entry(caller).read(), 'Not authorized');

            let mut reputation = self.reputation_scores.entry(user_address).read();
