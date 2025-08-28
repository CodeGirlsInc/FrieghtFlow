use starknet::ContractAddress;

#[starknet::interface]
trait ICompanyManager<TContractState> {
    fn register_company(
        ref self: TContractState,
        name: felt252,
        registration_number: felt252,
        country_code: felt252,
        company_type: CompanyType,
        admin: ContractAddress
    ) -> u256;
    
    fn add_member(
        ref self: TContractState,
        company_id: u256,
        member: ContractAddress,
        role: CompanyRole
    );
    
    fn remove_member(
        ref self: TContractState,
        company_id: u256,
        member: ContractAddress
    );
    
    fn update_member_role(
        ref self: TContractState,
        company_id: u256,
        member: ContractAddress,
        new_role: CompanyRole
    );
    
    fn get_company_details(self: @TContractState, company_id: u256) -> Company;
    fn get_member_role(self: @TContractState, company_id: u256, member: ContractAddress) -> CompanyRole;
    fn is_member(self: @TContractState, company_id: u256, member: ContractAddress) -> bool;
    fn get_user_companies(self: @TContractState, user: ContractAddress) -> Array<u256>;
    
    fn verify_company(
        ref self: TContractState,
        company_id: u256,
        verification_level: CompanyVerificationLevel
    );
    
    fn suspend_company(
        ref self: TContractState,
        company_id: u256,
        reason: felt252
    );

     fn get_owner(self: @TContractState) -> ContractAddress;
    fn get_verifier(self: @TContractState) -> ContractAddress;
}

#[derive(Drop, Serde, starknet::Store)]
enum CompanyType {
    Shipper,
    Carrier,
    Broker,
    Warehouse,
    Port,
    Other
}

#[derive(Drop, Serde, starknet::Store)]
enum CompanyRole {
    Owner,
    Admin,
    Manager,
    Employee,
    Viewer
}

#[derive(Drop, Serde, starknet::Store)]
enum CompanyVerificationLevel {
    Unverified,
    Basic,
    Standard,
    Premium,
    Enterprise
}

#[derive(Drop, Serde, starknet::Store)]
enum CompanyStatus {
    Active,
    Suspended,
    Inactive
}

#[derive(Drop, Serde, starknet::Store)]
struct Company {
    id: u256,
    name: felt252,
    registration_number: felt252,
    country_code: felt252,
    company_type: CompanyType,
    verification_level: CompanyVerificationLevel,
    status: CompanyStatus,
    created_at: u64,
    admin: ContractAddress
}

#[starknet::contract]
mod CompanyManagerContract {
    use super::{
        ICompanyManager, Company, CompanyType, CompanyRole, 
        CompanyVerificationLevel, CompanyStatus
    };
    use starknet::{
        ContractAddress, get_caller_address, get_block_timestamp,
        storage::{Map, StorageMapReadAccess, StorageMapWriteAccess}
    };

    #[storage]
    struct Storage {
        owner: ContractAddress,
        verifier: ContractAddress,
        next_company_id: u256,
        companies: Map<u256, Company>,
        company_members: Map<(u256, ContractAddress), CompanyRole>,
        user_companies: Map<(ContractAddress, u256), bool>,
        company_member_count: Map<u256, u32>,
        company_owner_count: Map<u256, u32>
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        CompanyRegistered: CompanyRegistered,
        MemberAdded: MemberAdded,
        MemberRemoved: MemberRemoved,
        RoleUpdated: RoleUpdated,
        CompanyVerified: CompanyVerified,
        CompanySuspended: CompanySuspended
    }

    #[derive(Drop, starknet::Event)]
    struct CompanyRegistered {
        #[key]
        company_id: u256,
        name: felt252,
        registration_number: felt252,
        country_code: felt252,
        company_type: CompanyType,
        admin: ContractAddress
    }