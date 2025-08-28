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