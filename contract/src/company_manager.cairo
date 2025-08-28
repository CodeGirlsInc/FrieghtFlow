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

    
    #[derive(Drop, starknet::Event)]
    struct MemberAdded {
        #[key]
        company_id: u256,
        #[key]
        member: ContractAddress,
        role: CompanyRole,
        added_by: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct MemberRemoved {
        #[key]
        company_id: u256,
        #[key]
        member: ContractAddress,
        removed_by: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct RoleUpdated {
        #[key]
        company_id: u256,
        #[key]
        member: ContractAddress,
        old_role: CompanyRole,
        new_role: CompanyRole,
        updated_by: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct CompanyVerified {
        #[key]
        company_id: u256,
        verification_level: CompanyVerificationLevel,
        verified_by: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct CompanySuspended {
        #[key]
        company_id: u256,
        reason: felt252,
        suspended_by: ContractAddress
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        verifier: ContractAddress
    ) {
        self.owner.write(owner);
        self.verifier.write(verifier);
        self.next_company_id.write(1);
    }

    
    #[abi(embed_v0)]
    impl CompanyManagerImpl of ICompanyManager<ContractState> {
        fn register_company(
            ref self: ContractState,
            name: felt252,
            registration_number: felt252,
            country_code: felt252,
            company_type: CompanyType,
            admin: ContractAddress
        ) -> u256 {
            let caller = get_caller_address();
            let company_id = self.next_company_id.read();
            
            // Create new company
            let company = Company {
                id: company_id,
                name,
                registration_number,
                country_code,
                company_type,
                verification_level: CompanyVerificationLevel::Unverified,
                status: CompanyStatus::Active,
                created_at: get_block_timestamp(),
                admin
            };
            
            // Store company
            self.companies.write(company_id, company);
            
            // Add admin as owner
            self.company_members.write((company_id, admin), CompanyRole::Owner);
            self.user_companies.write((admin, company_id), true);
            self.company_member_count.write(company_id, 1);
            self.company_owner_count.write(company_id, 1);
            
            // Increment next company ID
            self.next_company_id.write(company_id + 1);
            
            // Emit event
            self.emit(CompanyRegistered {
                company_id,
                name,
                registration_number,
                country_code,
                company_type,
                admin
            });
            
            company_id
        }

        
        fn add_member(
            ref self: ContractState,
            company_id: u256,
            member: ContractAddress,
            role: CompanyRole
        ) {
            let caller = get_caller_address();
            
            // Check if company exists
            let company = self.companies.read(company_id);
            assert(company.id == company_id, 'Company does not exist');
            
            // Check if caller has permission (owner or admin)
            let caller_role = self.company_members.read((company_id, caller));
            assert(
                matches!(caller_role, CompanyRole::Owner) || 
                matches!(caller_role, CompanyRole::Admin),
                'Insufficient permissions'
            );
            
            // Check if member is not already in company
            let existing_role = self.company_members.read((company_id, member));
            assert(!self._role_exists(existing_role), 'Member already exists');
            
            // Add member
            self.company_members.write((company_id, member), role);
            self.user_companies.write((member, company_id), true);
            
            // Update counters
            let current_count = self.company_member_count.read(company_id);
            self.company_member_count.write(company_id, current_count + 1);
            
            if matches!(role, CompanyRole::Owner) {
                let owner_count = self.company_owner_count.read(company_id);
                self.company_owner_count.write(company_id, owner_count + 1);
            }
            
            // Emit event
            self.emit(MemberAdded {
                company_id,
                member,
                role,
                added_by: caller
            });
        }
