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