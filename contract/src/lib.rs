use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    clock::Clock,
    sysvar::Sysvar,
};

// Program entrypoint
entrypoint!(process_instruction);

// Document types
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum DocumentType {
    BillOfLading,
    ProofOfDelivery,
    Invoice,
    CustomsDeclaration,
    InsuranceCertificate,
    Photo,
    Other,
}

// Document record structure
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct DocumentRecord {
    pub document_id: u64,
    pub document_hash: [u8; 32],
    pub document_type: DocumentType,
    pub shipment_id: String,
    pub uploader: Pubkey,
    pub upload_timestamp: i64,
    pub metadata_ipfs_hash: String,
    pub is_verified: bool,
}

// Program state
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ProgramState {
    pub document_count: u64,
    pub owner: Pubkey,
}

// Instructions
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum DocumentInstruction {
    /// Initialize the program
    /// Accounts expected:
    /// 0. `[writable]` State account
    /// 1. `[signer]` Owner account
    Initialize,

    /// Register a new document
    /// Accounts expected:
    /// 0. `[writable]` Document account
    /// 1. `[writable]` State account
    /// 2. `[signer]` Uploader account
    RegisterDocument {
        document_hash: [u8; 32],
        document_type: DocumentType,
        shipment_id: String,
        metadata_ipfs_hash: String,
    },

    /// Verify a document
    /// Accounts expected:
    /// 0. `[writable]` Document account
    /// 1. `[signer]` Verifier account
    /// 2. `[]` State account
    VerifyDocument,

    /// Update document metadata
    /// Accounts expected:
    /// 0. `[writable]` Document account
    /// 1. `[signer]` Uploader account
    UpdateMetadata {
        new_metadata_hash: String,
    },
}

// Main program logic
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = DocumentInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        DocumentInstruction::Initialize => {
            msg!("Instruction: Initialize");
            process_initialize(program_id, accounts)
        }
        DocumentInstruction::RegisterDocument {
            document_hash,
            document_type,
            shipment_id,
            metadata_ipfs_hash,
        } => {
            msg!("Instruction: RegisterDocument");
            process_register_document(
                program_id,
                accounts,
                document_hash,
                document_type,
                shipment_id,
                metadata_ipfs_hash,
            )
        }
        DocumentInstruction::VerifyDocument => {
            msg!("Instruction: VerifyDocument");
            process_verify_document(program_id, accounts)
        }
        DocumentInstruction::UpdateMetadata { new_metadata_hash } => {
            msg!("Instruction: UpdateMetadata");
            process_update_metadata(program_id, accounts, new_metadata_hash)
        }
    }
}

fn process_initialize(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let state_account = next_account_info(accounts_iter)?;
    let owner_account = next_account_info(accounts_iter)?;

    if !owner_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let state = ProgramState {
        document_count: 0,
        owner: *owner_account.key,
    };

    state.serialize(&mut &mut state_account.data.borrow_mut()[..])?;
    
    msg!("Program initialized with owner: {}", owner_account.key);
    Ok(())
}

fn process_register_document(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    document_hash: [u8; 32],
    document_type: DocumentType,
    shipment_id: String,
    metadata_ipfs_hash: String,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let document_account = next_account_info(accounts_iter)?;
    let state_account = next_account_info(accounts_iter)?;
    let uploader_account = next_account_info(accounts_iter)?;

    if !uploader_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Validate hash is not zero
    if document_hash == [0u8; 32] {
        msg!("Error: Invalid hash (all zeros)");
        return Err(ProgramError::InvalidArgument);
    }

    // Load and update state
    let mut state = ProgramState::try_from_slice(&state_account.data.borrow())?;
    state.document_count += 1;

    // Get current timestamp
    let clock = Clock::get()?;
    let timestamp = clock.unix_timestamp;

    // Create document record
    let document = DocumentRecord {
        document_id: state.document_count,
        document_hash,
        document_type,
        shipment_id: shipment_id.clone(),
        uploader: *uploader_account.key,
        upload_timestamp: timestamp,
        metadata_ipfs_hash,
        is_verified: false,
    };

    // Save document
    document.serialize(&mut &mut document_account.data.borrow_mut()[..])?;
    
    // Save updated state
    state.serialize(&mut &mut state_account.data.borrow_mut()[..])?;

    msg!("Document registered with ID: {}", document.document_id);
    msg!("Hash: {:?}", document_hash);
    msg!("Shipment: {}", shipment_id);
    
    Ok(())
}

fn process_verify_document(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let document_account = next_account_info(accounts_iter)?;
    let verifier_account = next_account_info(accounts_iter)?;
    let state_account = next_account_info(accounts_iter)?;

    if !verifier_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Check if verifier is owner
    let state = ProgramState::try_from_slice(&state_account.data.borrow())?;
    if *verifier_account.key != state.owner {
        msg!("Error: Not authorized verifier");
        return Err(ProgramError::InvalidAccountData);
    }

    // Load document and verify
    let mut document = DocumentRecord::try_from_slice(&document_account.data.borrow())?;
    document.is_verified = true;

    // Save updated document
    document.serialize(&mut &mut document_account.data.borrow_mut()[..])?;

    msg!("Document {} verified by {}", document.document_id, verifier_account.key);
    
    Ok(())
}

fn process_update_metadata(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    new_metadata_hash: String,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let document_account = next_account_info(accounts_iter)?;
    let uploader_account = next_account_info(accounts_iter)?;

    if !uploader_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Load document
    let mut document = DocumentRecord::try_from_slice(&document_account.data.borrow())?;

    // Check if caller is uploader
    if document.uploader != *uploader_account.key {
        msg!("Error: Not the document uploader");
        return Err(ProgramError::InvalidAccountData);
    }

    // Update metadata
    document.metadata_ipfs_hash = new_metadata_hash.clone();

    // Save updated document
    document.serialize(&mut &mut document_account.data.borrow_mut()[..])?;

    msg!("Metadata updated for document {}", document.document_id);
    msg!("New IPFS hash: {}", new_metadata_hash);
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_document_type_serialization() {
        let doc_type = DocumentType::BillOfLading;
        let serialized = doc_type.try_to_vec().unwrap();
        let deserialized = DocumentType::try_from_slice(&serialized).unwrap();
        assert_eq!(doc_type, deserialized);
    }

    #[test]
    fn test_document_record_serialization() {
        let doc = DocumentRecord {
            document_id: 1,
            document_hash: [1u8; 32],
            document_type: DocumentType::Invoice,
            shipment_id: "SHIP001".to_string(),
            uploader: Pubkey::new_unique(),
            upload_timestamp: 1234567890,
            metadata_ipfs_hash: "QmTest123".to_string(),
            is_verified: false,
        };

        let serialized = doc.try_to_vec().unwrap();
        let deserialized = DocumentRecord::try_from_slice(&serialized).unwrap();
        assert_eq!(doc.document_id, deserialized.document_id);
    }
}
#![cfg_attr(not(feature = "std"), no_std, no_main)]

pub mod reputation {
    use ink::prelude::*;
    use ink::storage::Mapping;

    /// Represents the type of user on the platform
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
    #[cfg_attr(feature = "std", derive(scale::Encode, scale::Decode))]
    pub enum UserType {
        Carrier,
        Shipper,
    }

    /// Stores reputation information for a user
    #[derive(Debug, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale::Encode, scale::Decode, scale_info::TypeInfo)
    )]
    pub struct UserReputation {
        pub user_address: AccountId,
        pub user_type: UserType,
        pub total_shipments_completed: u32,
        pub average_rating: u32,           // Fixed point: 450 = 4.50 stars
        pub total_rating_points: u32,      // Sum of all ratings * 100
        pub rating_count: u32,             // Number of ratings received
        pub on_time_deliveries: u32,       // For carriers
        pub late_deliveries: u32,          // For carriers
        pub successful_shipments: u32,     // For shippers
        pub cancelled_shipments: u32,      // For shippers
        pub last_updated: u64,             // Timestamp
    }

    /// Stores a single rating
    #[derive(Debug, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale::Encode, scale::Decode, scale_info::TypeInfo)
    )]
    pub struct Rating {
        pub rating_id: u64,
        pub shipment_id: u64,
        pub rater_address: AccountId,
        pub rated_address: AccountId,
        pub score: u8,                      // 1-5 stars
        pub comment_hash: [u8; 32],        // Hash of review text
        pub timestamp: u64,
        pub is_carrier_rating: bool,       // true if rating carrier
    }

    /// Events emitted by the contract
    #[ink(event)]
    pub struct UserInitialized {
        #[ink(topic)]
        user_address: AccountId,
        user_type: UserType,
        timestamp: u64,
    }

    #[ink(event)]
    pub struct RatingSubmitted {
        #[ink(topic)]
        rating_id: u64,
        shipment_id: u64,
        #[ink(topic)]
        rater: AccountId,
        #[ink(topic)]
        rated: AccountId,
        score: u8,
        timestamp: u64,
    }

    #[ink(event)]
    pub struct ReputationUpdated {
        #[ink(topic)]
        user_address: AccountId,
        new_average: u32,
        total_shipments: u32,
        timestamp: u64,
    }

    /// Main reputation contract
    #[ink::contract]
    pub mod reputation_contract {
        use super::*;

        /// Contract storage
        #[ink(storage)]
        pub struct ReputationContract {
            /// Map of user address to UserReputation
            user_reputations: Mapping<AccountId, UserReputation>,
            /// Map of rating_id to Rating
            ratings: Mapping<u64, Rating>,
            /// Map of shipment_id to list of rating_ids
            shipment_ratings: Mapping<u64, Vec<u64>>,
            /// Map tracking who has rated each shipment
            shipment_raters: Mapping<u64, Vec<AccountId>>,
            /// Counter for generating unique rating IDs
            rating_counter: u64,
            /// Address of authorized shipment contract
            authorized_shipment_contract: Option<AccountId>,
        }

        /// Error types
        #[derive(Debug, PartialEq, Eq)]
        #[cfg_attr(feature = "std", derive(scale::Encode, scale::Decode))]
        pub enum Error {
            /// User already initialized
            UserAlreadyInitialized,
            /// User not found
            UserNotFound,
            /// Invalid rating score (must be 1-5)
            InvalidRatingScore,
            /// Duplicate rating for shipment
            DuplicateRating,
            /// Caller not authorized to rate
            NotAuthorized,
            /// Shipment not yet delivered
            ShipmentNotDelivered,
            /// Cannot rate yourself
            CannotRateSelf,
            /// Rating not found
            RatingNotFound,
            /// Unauthorized shipment contract
            UnauthorizedShipmentContract,
            /// User type mismatch
            UserTypeMismatch,
        }

        impl ReputationContract {
            /// Creates a new reputation contract instance
            #[ink(constructor)]
            pub fn new() -> Self {
                Self {
                    user_reputations: Mapping::new(),
                    ratings: Mapping::new(),
                    shipment_ratings: Mapping::new(),
                    shipment_raters: Mapping::new(),
                    rating_counter: 0,
                    authorized_shipment_contract: None,
                }
            }

            /// Sets the authorized shipment contract address
            #[ink(message)]
            pub fn set_authorized_shipment_contract(&mut self, contract_address: AccountId) {
                let caller = self.env().caller();
                // In production, add proper access control (e.g., owner check)
                self.authorized_shipment_contract = Some(contract_address);
            }

            /// Initializes a new user in the reputation system
            #[ink(message)]
            pub fn initialize_user(&mut self, user_address: AccountId, user_type: UserType) -> Result<(), Error> {
                if self.user_reputations.contains(user_address) {
                    return Err(Error::UserAlreadyInitialized);
                }

                let now = self.env().block_timestamp();
                let reputation = UserReputation {
                    user_address,
                    user_type,
                    total_shipments_completed: 0,
                    average_rating: 0,
                    total_rating_points: 0,
                    rating_count: 0,
                    on_time_deliveries: 0,
                    late_deliveries: 0,
                    successful_shipments: 0,
                    cancelled_shipments: 0,
                    last_updated: now,
                };

                self.user_reputations.insert(user_address, &reputation);

                self.env().emit_event(UserInitialized {
                    user_address,
                    user_type,
                    timestamp: now,
                });

                Ok(())
            }

            /// Submits a rating for a completed shipment
            #[ink(message)]
            pub fn submit_rating(
                &mut self,
                shipment_id: u64,
                rated_address: AccountId,
                score: u8,
                comment_hash: [u8; 32],
            ) -> Result<u64, Error> {
                let caller = self.env().caller();

                // Validate score is 1-5
                if score < 1 || score > 5 {
                    return Err(Error::InvalidRatingScore);
                }

                // Cannot rate yourself
                if caller == rated_address {
                    return Err(Error::CannotRateSelf);
                }

                // Check if caller already rated this shipment
                let raters = self.shipment_raters.get(shipment_id).unwrap_or_default();
                if raters.contains(&caller) {
                    return Err(Error::DuplicateRating);
                }

                // Check if user to be rated exists and initialize if needed
                if !self.user_reputations.contains(rated_address) {
                    // Auto-initialize based on caller's type (opposite type)
                    let caller_type = self.user_reputations
                        .get(caller)
                        .ok_or(Error::UserNotFound)?
                        .user_type;
                    
                    let rated_type = if caller_type == UserType::Carrier {
                        UserType::Shipper
                    } else {
                        UserType::Carrier
                    };

                    self.initialize_user(rated_address, rated_type)?;
                }

                // Create rating record
                let rating_id = self.rating_counter;
                self.rating_counter += 1;

                let now = self.env().block_timestamp();
                let rating = Rating {
                    rating_id,
                    shipment_id,
                    rater_address: caller,
                    rated_address,
                    score,
                    comment_hash,
                    timestamp: now,
                    is_carrier_rating: self.user_reputations
                        .get(caller)
                        .map(|r| r.user_type == UserType::Carrier)
                        .unwrap_or(false),
                };

                self.ratings.insert(rating_id, &rating);

                // Add rating to shipment's rating list
                let mut shipment_rating_ids = self.shipment_ratings.get(shipment_id).unwrap_or_default();
                shipment_rating_ids.push(rating_id);
                self.shipment_ratings.insert(shipment_id, &shipment_rating_ids);

                // Add rater to shipment's raters list
                let mut raters = self.shipment_raters.get(shipment_id).unwrap_or_default();
                raters.push(caller);
                self.shipment_raters.insert(shipment_id, &raters);

                // Update user reputation
                let mut user_rep = self.user_reputations.get(rated_address)
                    .ok_or(Error::UserNotFound)?;

                user_rep.total_rating_points += score as u32 * 100;
                user_rep.rating_count += 1;
                user_rep.average_rating = user_rep.total_rating_points / user_rep.rating_count;
                user_rep.last_updated = now;

                self.user_reputations.insert(rated_address, &user_rep);

                self.env().emit_event(RatingSubmitted {
                    rating_id,
                    shipment_id,
                    rater: caller,
                    rated: rated_address,
                    score,
                    timestamp: now,
                });

                self.env().emit_event(ReputationUpdated {
                    user_address: rated_address,
                    new_average: user_rep.average_rating,
                    total_shipments: user_rep.total_shipments_completed,
                    timestamp: now,
                });

                Ok(rating_id)
            }

            /// Updates shipment statistics for a user
            #[ink(message)]
            pub fn update_shipment_stats(
                &mut self,
                user_address: AccountId,
                shipment_id: u64,
                was_on_time: bool,
                was_successful: bool,
            ) -> Result<(), Error> {
                // Only authorized shipment contract can call this
                if let Some(authorized) = self.authorized_shipment_contract {
                    if self.env().caller() != authorized {
                        return Err(Error::UnauthorizedShipmentContract);
                    }
                } else {
                    return Err(Error::UnauthorizedShipmentContract);
                }

                let mut user_rep = self.user_reputations.get(user_address)
                    .ok_or(Error::UserNotFound)?;

                user_rep.total_shipments_completed += 1;

                match user_rep.user_type {
                    UserType::Carrier => {
                        if was_on_time {
                            user_rep.on_time_deliveries += 1;
                        } else {
                            user_rep.late_deliveries += 1;
                        }
                    }
                    UserType::Shipper => {
                        if was_successful {
                            user_rep.successful_shipments += 1;
                        } else {
                            user_rep.cancelled_shipments += 1;
                        }
                    }
                }

                user_rep.last_updated = self.env().block_timestamp();
                self.user_reputations.insert(user_address, &user_rep);

                Ok(())
            }

            /// Gets complete reputation data for a user
            #[ink(message)]
            pub fn get_user_reputation(&self, user_address: AccountId) -> Result<UserReputation, Error> {
                self.user_reputations.get(user_address)
                    .ok_or(Error::UserNotFound)
            }

            /// Gets a specific rating by ID
            #[ink(message)]
            pub fn get_rating(&self, rating_id: u64) -> Result<Rating, Error> {
                self.ratings.get(rating_id)
                    .ok_or(Error::RatingNotFound)
            }

            /// Gets all ratings for a specific user
            #[ink(message)]
            pub fn get_user_ratings(&self, user_address: AccountId) -> Vec<u64> {
                let mut user_rating_ids = Vec::new();

                // Iterate through ratings to find those for this user
                for i in 0..self.rating_counter {
                    if let Some(rating) = self.ratings.get(i) {
                        if rating.rated_address == user_address {
                            user_rating_ids.push(i);
                        }
                    }
                }

                user_rating_ids
            }

            /// Gets average rating for a user
            #[ink(message)]
            pub fn get_average_rating(&self, user_address: AccountId) -> Result<u32, Error> {
                let user_rep = self.user_reputations.get(user_address)
                    .ok_or(Error::UserNotFound)?;

                Ok(user_rep.average_rating)
            }

            /// Gets ratings for a specific shipment
            #[ink(message)]
            pub fn get_shipment_ratings(&self, shipment_id: u64) -> Vec<u64> {
                self.shipment_ratings.get(shipment_id).unwrap_or_default()
            }

            /// Calculates reputation score based on formula
            /// Score = (Average Rating / 5 * 500) + (On-Time % * 300) + (Completion Rate * 200)
            #[ink(message)]
            pub fn calculate_reputation_score(&self, user_address: AccountId) -> Result<u32, Error> {
                let user_rep = self.user_reputations.get(user_address)
                    .ok_or(Error::UserNotFound)?;

                // Average rating component (0-500)
                let avg_rating_component = (user_rep.average_rating as u64 * 500) / 500;

                // On-time or completion rate component (0-300)
                let rate_component = match user_rep.user_type {
                    UserType::Carrier => {
                        if user_rep.total_shipments_completed == 0 {
                            0
                        } else {
                            let on_time_percentage = (user_rep.on_time_deliveries as u64 * 100)
                                / user_rep.total_shipments_completed as u64;
                            (on_time_percentage * 3) as u32
                        }
                    }
                    UserType::Shipper => {
                        if user_rep.total_shipments_completed == 0 {
                            0
                        } else {
                            let success_percentage = (user_rep.successful_shipments as u64 * 100)
                                / user_rep.total_shipments_completed as u64;
                            (success_percentage * 2) as u32
                        }
                    }
                };

                // Completion rate component (0-200)
                // Using rating_count as proxy for shipments with ratings
                let completion_rate_component = if user_rep.total_shipments_completed == 0 {
                    0
                } else {
                    let completion_rate = (user_rep.rating_count as u64 * 100)
                        / user_rep.total_shipments_completed as u64;
                    (completion_rate * 2) as u32
                };

                let total_score = avg_rating_component as u32 + rate_component + completion_rate_component;

                // Cap score at 1000
                Ok(total_score.min(1000))
            }

            /// Gets on-time percentage for a carrier
            #[ink(message)]
            pub fn get_on_time_percentage(&self, user_address: AccountId) -> Result<u32, Error> {
                let user_rep = self.user_reputations.get(user_address)
                    .ok_or(Error::UserNotFound)?;

                if user_rep.user_type != UserType::Carrier {
                    return Err(Error::UserTypeMismatch);
                }

                if user_rep.total_shipments_completed == 0 {
                    return Ok(0);
                }

                Ok((user_rep.on_time_deliveries as u64 * 100 / user_rep.total_shipments_completed as u64) as u32)
            }

            /// Gets completion rate for a shipper
            #[ink(message)]
            pub fn get_completion_rate(&self, user_address: AccountId) -> Result<u32, Error> {
                let user_rep = self.user_reputations.get(user_address)
                    .ok_or(Error::UserNotFound)?;

                if user_rep.user_type != UserType::Shipper {
                    return Err(Error::UserTypeMismatch);
                }

                if user_rep.total_shipments_completed == 0 {
                    return Ok(0);
                }

                Ok((user_rep.successful_shipments as u64 * 100 / user_rep.total_shipments_completed as u64) as u32)
            }

            /// Checks if a user has already rated a shipment
            #[ink(message)]
            pub fn has_rated_shipment(&self, shipment_id: u64, rater_address: AccountId) -> bool {
                self.shipment_raters
                    .get(shipment_id)
                    .map(|raters| raters.contains(&rater_address))
                    .unwrap_or(false)
            }

            /// Gets total number of ratings in the contract
            #[ink(message)]
            pub fn get_rating_count(&self) -> u64 {
                self.rating_counter
            }

            /// Checks if user is initialized
            #[ink(message)]
            pub fn is_user_initialized(&self, user_address: AccountId) -> bool {
                self.user_reputations.contains(user_address)
            }
        }

        // Unit tests
        #[cfg(test)]
        mod tests {
            use super::*;

            #[test]
            fn test_new_contract() {
                let contract = ReputationContract::new();
                assert_eq!(contract.get_rating_count(), 0);
            }

            #[test]
            fn test_initialize_user() {
                let mut contract = ReputationContract::new();
                let user = AccountId::from([0x1; 32]);

                let result = contract.initialize_user(user, UserType::Carrier);
                assert!(result.is_ok());
                assert!(contract.is_user_initialized(user));

                // Test duplicate initialization
                let result = contract.initialize_user(user, UserType::Carrier);
                assert_eq!(result, Err(Error::UserAlreadyInitialized));
            }

            #[test]
            fn test_initialize_user_details() {
                let mut contract = ReputationContract::new();
                let user = AccountId::from([0x2; 32]);

                contract.initialize_user(user, UserType::Shipper).unwrap();
                let rep = contract.get_user_reputation(user).unwrap();

                assert_eq!(rep.user_address, user);
                assert_eq!(rep.user_type, UserType::Shipper);
                assert_eq!(rep.total_shipments_completed, 0);
                assert_eq!(rep.average_rating, 0);
                assert_eq!(rep.rating_count, 0);
            }

            #[test]
            fn test_submit_rating_invalid_score() {
                let mut contract = ReputationContract::new();
                let rater = AccountId::from([0x3; 32]);
                let rated = AccountId::from([0x4; 32]);

                contract.initialize_user(rater, UserType::Carrier).unwrap();
                contract.initialize_user(rated, UserType::Shipper).unwrap();

                // Test score too low
                let result = contract.submit_rating(1, rated, 0, [0; 32]);
                assert_eq!(result, Err(Error::InvalidRatingScore));

                // Test score too high
                let result = contract.submit_rating(1, rated, 6, [0; 32]);
                assert_eq!(result, Err(Error::InvalidRatingScore));
            }

            #[test]
            fn test_cannot_rate_self() {
                let mut contract = ReputationContract::new();
                let user = AccountId::from([0x5; 32]);

                contract.initialize_user(user, UserType::Carrier).unwrap();

                let result = contract.submit_rating(1, user, 5, [0; 32]);
                assert_eq!(result, Err(Error::CannotRateSelf));
            }

            #[test]
            fn test_duplicate_rating() {
                let mut contract = ReputationContract::new();
                let rater = AccountId::from([0x6; 32]);
                let rated = AccountId::from([0x7; 32]);

                contract.initialize_user(rater, UserType::Carrier).unwrap();
                contract.initialize_user(rated, UserType::Shipper).unwrap();

                let result = contract.submit_rating(1, rated, 5, [0; 32]);
                assert!(result.is_ok());

                // Try to rate same shipment again
                let result = contract.submit_rating(1, rated, 4, [0; 32]);
                assert_eq!(result, Err(Error::DuplicateRating));
            }

            #[test]
            fn test_average_rating_calculation() {
                let mut contract = ReputationContract::new();
                let carrier = AccountId::from([0x8; 32]);
                let shipper1 = AccountId::from([0x9; 32]);
                let shipper2 = AccountId::from([0xa; 32]);

                contract.initialize_user(carrier, UserType::Carrier).unwrap();
                contract.initialize_user(shipper1, UserType::Shipper).unwrap();
                contract.initialize_user(shipper2, UserType::Shipper).unwrap();

                // Submit multiple ratings
                contract.submit_rating(1, carrier, 5, [0; 32]).unwrap();
                contract.submit_rating(2, carrier, 4, [0; 32]).unwrap();
                contract.submit_rating(3, carrier, 3, [0; 32]).unwrap();

                let rep = contract.get_user_reputation(carrier).unwrap();
                assert_eq!(rep.rating_count, 3);
                // Average should be 400 (4.00 stars)
                assert_eq!(rep.average_rating, 400);
            }

            #[test]
            fn test_get_average_rating() {
                let mut contract = ReputationContract::new();
                let carrier = AccountId::from([0xb; 32]);
                let shipper = AccountId::from([0xc; 32]);

                contract.initialize_user(carrier, UserType::Carrier).unwrap();
                contract.initialize_user(shipper, UserType::Shipper).unwrap();

                contract.submit_rating(1, carrier, 5, [0; 32]).unwrap();
                contract.submit_rating(2, carrier, 5, [0; 32]).unwrap();

                let avg = contract.get_average_rating(carrier).unwrap();
                assert_eq!(avg, 500); // 5.00 stars
            }

            #[test]
            fn test_update_shipment_stats() {
                let mut contract = ReputationContract::new();
                let shipper_contract = AccountId::from([0xd; 32]);
                let carrier = AccountId::from([0xe; 32]);

                contract.set_authorized_shipment_contract(shipper_contract);
                contract.initialize_user(carrier, UserType::Carrier).unwrap();

                // Simulate authorized contract call
                let result = contract.update_shipment_stats(carrier, 1, true, false);
                assert!(result.is_ok());

                let rep = contract.get_user_reputation(carrier).unwrap();
                assert_eq!(rep.total_shipments_completed, 1);
                assert_eq!(rep.on_time_deliveries, 1);
            }

            #[test]
            fn test_calculate_reputation_score() {
                let mut contract = ReputationContract::new();
                let carrier = AccountId::from([0xf; 32]);
                let shipper = AccountId::from([0x10; 32]);

                contract.initialize_user(carrier, UserType::Carrier).unwrap();
                contract.initialize_user(shipper, UserType::Shipper).unwrap();

                // Submit ratings
                contract.submit_rating(1, carrier, 5, [0; 32]).unwrap();
                contract.submit_rating(2, carrier, 5, [0; 32]).unwrap();

                let score = contract.calculate_reputation_score(carrier).unwrap();
                assert!(score > 0);
                assert!(score <= 1000);
            }

            #[test]
            fn test_has_rated_shipment() {
                let mut contract = ReputationContract::new();
                let rater = AccountId::from([0x11; 32]);
                let rated = AccountId::from([0x12; 32]);

                contract.initialize_user(rater, UserType::Carrier).unwrap();
                contract.initialize_user(rated, UserType::Shipper).unwrap();

                assert!(!contract.has_rated_shipment(1, rater));

                contract.submit_rating(1, rated, 5, [0; 32]).unwrap();

                assert!(contract.has_rated_shipment(1, rater));
            }

            #[test]
            fn test_get_shipment_ratings() {
                let mut contract = ReputationContract::new();
                let rater1 = AccountId::from([0x13; 32]);
                let rater2 = AccountId::from([0x14; 32]);
                let rated = AccountId::from([0x15; 32]);

                contract.initialize_user(rater1, UserType::Carrier).unwrap();
                contract.initialize_user(rater2, UserType::Carrier).unwrap();
                contract.initialize_user(rated, UserType::Shipper).unwrap();

                contract.submit_rating(1, rated, 5, [0; 32]).unwrap();
                contract.submit_rating(1, rated, 4, [0; 32]).unwrap();

                let ratings = contract.get_shipment_ratings(1);
                assert_eq!(ratings.len(), 2);
            }

            #[test]
            fn test_get_on_time_percentage() {
                let mut contract = ReputationContract::new();
                let shipper_contract = AccountId::from([0x16; 32]);
                let carrier = AccountId::from([0x17; 32]);

                contract.set_authorized_shipment_contract(shipper_contract);
                contract.initialize_user(carrier, UserType::Carrier).unwrap();

                contract.update_shipment_stats(carrier, 1, true, false).unwrap();
                contract.update_shipment_stats(carrier, 2, false, false).unwrap();
                contract.update_shipment_stats(carrier, 3, true, false).unwrap();

                let percentage = contract.get_on_time_percentage(carrier).unwrap();
                assert_eq!(percentage, 66); // 2 out of 3 on time
            }

            #[test]
            fn test_get_completion_rate() {
                let mut contract = ReputationContract::new();
                let shipper_contract = AccountId::from([0x18; 32]);
                let shipper = AccountId::from([0x19; 32]);

                contract.set_authorized_shipment_contract(shipper_contract);
                contract.initialize_user(shipper, UserType::Shipper).unwrap();

                contract.update_shipment_stats(shipper, 1, false, true).unwrap();
                contract.update_shipment_stats(shipper, 2, false, false).unwrap();
                contract.update_shipment_stats(shipper, 3, false, true).unwrap();

                let rate = contract.get_completion_rate(shipper).unwrap();
                assert_eq!(rate, 66); // 2 out of 3 successful
            }

            #[test]
            fn test_get_user_ratings() {
                let mut contract = ReputationContract::new();
                let carrier = AccountId::from([0x1a; 32]);
                let shipper1 = AccountId::from([0x1b; 32]);
                let shipper2 = AccountId::from([0x1c; 32]);

                contract.initialize_user(carrier, UserType::Carrier).unwrap();
                contract.initialize_user(shipper1, UserType::Shipper).unwrap();
                contract.initialize_user(shipper2, UserType::Shipper).unwrap();

                contract.submit_rating(1, carrier, 5, [0; 32]).unwrap();
                contract.submit_rating(2, carrier, 4, [0; 32]).unwrap();
                contract.submit_rating(3, shipper1, 5, [0; 32]).unwrap();

                let carrier_ratings = contract.get_user_ratings(carrier);
                assert_eq!(carrier_ratings.len(), 2);

                let shipper_ratings = contract.get_user_ratings(shipper1);
                assert_eq!(shipper_ratings.len(), 1);
            }

            #[test]
            fn test_unauthorized_shipment_contract() {
                let mut contract = ReputationContract::new();
                let carrier = AccountId::from([0x1d; 32]);
                let unauthorized = AccountId::from([0x1e; 32]);

                contract.initialize_user(carrier, UserType::Carrier).unwrap();

                // Try to update stats without authorized contract
                let result = contract.update_shipment_stats(carrier, 1, true, false);
                assert_eq!(result, Err(Error::UnauthorizedShipmentContract));
            }
        }
    }
}
