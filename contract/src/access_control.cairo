use starknet::{
    contract_address_const, contract_address_try_from_felt252, ContractAddress, get_caller_address,
};
use starknet::get_block_timestamp;

/// Interface for the AccessControl contract
#[starknet::interface]
pub trait IAccessControl<TContractState> {
    /// Grant a role to an account
    fn grant_role(ref self: TContractState, role: felt252, account: ContractAddress);
    
    /// Revoke a role from an account
    fn revoke_role(ref self: TContractState, role: felt252, account: ContractAddress);
    
    /// Check if an account has a specific role
    fn has_role(self: @TContractState, role: felt252, account: ContractAddress) -> bool;
    
    /// Get the admin role for a given role
    fn get_role_admin(self: @TContractState, role: felt252) -> felt252;
    
    /// Set the admin role for a given role
    fn set_role_admin(ref self: TContractState, role: felt252, admin_role: felt252);
    
    /// Renounce a role (only callable by the account itself)
    fn renounce_role(ref self: TContractState, role: felt252, account: ContractAddress);
    
    /// Create a new permission
    fn create_permission(
        ref self: TContractState,
        permission_name: felt252,
        required_roles: Array<felt252>,
        description: felt252,
    );
    
    /// Check if an account has permission
    fn check_permission(
        self: @TContractState,
        permission_name: felt252,
        account: ContractAddress,
    ) -> bool;
    
    /// Get all roles for a user
    fn get_user_roles(self: @TContractState, account: ContractAddress) -> Array<felt252>;
    
    /// Get all permissions
    fn get_all_permissions(self: @TContractState) -> Array<felt252>;
    
    /// Get permission details
    fn get_permission_details(self: @TContractState, permission_name: felt252) -> Permission;
    
    /// Get role members count
    fn get_role_member_count(self: @TContractState, role: felt252) -> u32;
    
    /// Get role member at index
    fn get_role_member(self: @TContractState, role: felt252, index: u32) -> ContractAddress;
}

/// Permission struct to store permission details
#[derive(Drop, starknet::Store, starknet::Serde)]
pub struct Permission {
    pub name: felt252,
    pub required_roles: Array<felt252>,
    pub description: felt252,
    pub is_active: bool,
    pub created_at: u64,
    pub created_by: ContractAddress,
}

/// RoleData struct to store role information
#[derive(Drop, starknet::Store, starknet::Serde)]
pub struct RoleData {
    pub admin_role: felt252,
    pub members: Array<ContractAddress>,
    pub is_active: bool,
    pub created_at: u64,
}

/// Events emitted by the contract
#[derive(Drop, starknet::Event)]
pub enum Event {
    #[derive(Drop, starknet::Event)]
    RoleGranted: RoleGranted,
    #[derive(Drop, starknet::Event)]
    RoleRevoked: RoleRevoked,
    #[derive(Drop, starknet::Event)]
    RoleAdminChanged: RoleAdminChanged,
    #[derive(Drop, starknet::Event)]
    PermissionCreated: PermissionCreated,
    #[derive(Drop, starknet::Event)]
    RoleRenounced: RoleRenounced,
}

#[derive(Drop, starknet::Event)]
pub struct RoleGranted {
    pub role: felt252,
    pub account: ContractAddress,
    pub sender: ContractAddress,
}

#[derive(Drop, starknet::Event)]
pub struct RoleRevoked {
    pub role: felt252,
    pub account: ContractAddress,
    pub sender: ContractAddress,
}

#[derive(Drop, starknet::Event)]
pub struct RoleAdminChanged {
    pub role: felt252,
    pub previous_admin_role: felt252,
    pub new_admin_role: felt252,
}

#[derive(Drop, starknet::Event)]
pub struct PermissionCreated {
    pub permission_name: felt252,
    pub required_roles: Array<felt252>,
    pub description: felt252,
    pub created_by: ContractAddress,
}

#[derive(Drop, starknet::Event)]
pub struct RoleRenounced {
    pub role: felt252,
    pub account: ContractAddress,
}

/// AccessControl contract for roles and permissions management
#[starknet::contract]
mod AccessControl {
    use super::{
        ContractAddress, Event, IAccessControl, Permission, RoleData, RoleAdminChanged, RoleGranted,
        RoleRevoked, PermissionCreated, RoleRenounced,
    };
    use starknet::get_caller_address;
    use starknet::get_block_timestamp;

    /// Storage for the AccessControl contract
    #[storage]
    struct Storage {
        /// Mapping from role to RoleData
        roles: LegacyMap<felt252, RoleData>,
        /// Mapping from permission name to Permission
        permissions: LegacyMap<felt252, Permission>,
        /// Mapping from account to array of roles
        user_roles: LegacyMap<ContractAddress, Array<felt252>>,
        /// Default admin role
        default_admin_role: felt252,
        /// Array of all permission names
        all_permissions: Array<felt252>,
    }

    /// Constants for standard roles
    const DEFAULT_ADMIN_ROLE: felt252 = 'DEFAULT_ADMIN_ROLE';
    const SHIPMENT_MANAGER_ROLE: felt252 = 'SHIPMENT_MANAGER_ROLE';
    const PAYMENT_MANAGER_ROLE: felt252 = 'PAYMENT_MANAGER_ROLE';
    const CARRIER_ROLE: felt252 = 'CARRIER_ROLE';
    const SHIPPER_ROLE: felt252 = 'SHIPPER_ROLE';
    const VIEWER_ROLE: felt252 = 'VIEWER_ROLE';

    /// Constants for standard permissions
    const CREATE_SHIPMENT: felt252 = 'CREATE_SHIPMENT';
    const UPDATE_SHIPMENT: felt252 = 'UPDATE_SHIPMENT';
    const DELETE_SHIPMENT: felt252 = 'DELETE_SHIPMENT';
    const VIEW_SHIPMENT: felt252 = 'VIEW_SHIPMENT';
    const PROCESS_PAYMENT: felt252 = 'PROCESS_PAYMENT';
    const VIEW_PAYMENT: felt252 = 'VIEW_PAYMENT';
    const MANAGE_USERS: felt252 = 'MANAGE_USERS';
    const MANAGE_ROLES: felt252 = 'MANAGE_ROLES';

    #[abi(embed_v0)]
    impl AccessControlImpl of IAccessControl<ContractState> {
        /// Grant a role to an account
        fn grant_role(ref self: ContractState, role: felt252, account: ContractAddress) {
            let caller = get_caller_address();
            self._grant_role(role, account, caller);
        }

        /// Revoke a role from an account
        fn revoke_role(ref self: ContractState, role: felt252, account: ContractAddress) {
            let caller = get_caller_address();
            self._revoke_role(role, account, caller);
        }

        /// Check if an account has a specific role
        fn has_role(self: @ContractState, role: felt252, account: ContractAddress) -> bool {
            self._has_role(role, account)
        }

        /// Get the admin role for a given role
        fn get_role_admin(self: @ContractState, role: felt252) -> felt252 {
            self._get_role_admin(role)
        }

        /// Set the admin role for a given role
        fn set_role_admin(ref self: ContractState, role: felt252, admin_role: felt252) {
            let caller = get_caller_address();
            self._set_role_admin(role, admin_role, caller);
        }

        /// Renounce a role (only callable by the account itself)
        fn renounce_role(ref self: ContractState, role: felt252, account: ContractAddress) {
            let caller = get_caller_address();
            assert(caller == account, 'Can only renounce roles for self');
            self._revoke_role(role, account, caller);
            
            // Emit RoleRenounced event
            self.emit(RoleRenounced { role, account });
        }

        /// Create a new permission
        fn create_permission(
            ref self: ContractState,
            permission_name: felt252,
            required_roles: Array<felt252>,
            description: felt252,
        ) {
            let caller = get_caller_address();
            self._create_permission(permission_name, required_roles, description, caller);
        }

        /// Check if an account has permission
        fn check_permission(
            self: @ContractState,
            permission_name: felt252,
            account: ContractAddress,
        ) -> bool {
            self._check_permission(permission_name, account)
        }

        /// Get all roles for a user
        fn get_user_roles(self: @ContractState, account: ContractAddress) -> Array<felt252> {
            self.user_roles.read(account)
        }

        /// Get all permissions
        fn get_all_permissions(self: @ContractState) -> Array<felt252> {
            self.all_permissions.read()
        }

        /// Get permission details
        fn get_permission_details(self: @ContractState, permission_name: felt252) -> Permission {
            self.permissions.read(permission_name)
        }

        /// Get role members count
        fn get_role_member_count(self: @ContractState, role: felt252) -> u32 {
            let role_data = self.roles.read(role);
            role_data.members.len()
        }

        /// Get role member at index
        fn get_role_member(self: @ContractState, role: felt252, index: u32) -> ContractAddress {
            let role_data = self.roles.read(role);
            role_data.members.at(index)
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        /// Internal function to grant a role
        fn _grant_role(
            ref self: ContractState,
            role: felt252,
            account: ContractAddress,
            sender: ContractAddress,
        ) {
            self._ensure_role_admin(role, sender);
            self._grant_role_internal(role, account);
        }

        /// Internal function to revoke a role
        fn _revoke_role(
            ref self: ContractState,
            role: felt252,
            account: ContractAddress,
            sender: ContractAddress,
        ) {
            self._ensure_role_admin(role, sender);
            self._revoke_role_internal(role, account);
        }

        /// Internal function to set role admin
        fn _set_role_admin(
            ref self: ContractState,
            role: felt252,
            admin_role: felt252,
            sender: ContractAddress,
        ) {
            self._ensure_role_admin(role, sender);
            self._set_role_admin_internal(role, admin_role);
        }

        /// Internal function to create permission
        fn _create_permission(
            ref self: ContractState,
            permission_name: felt252,
            required_roles: Array<felt252>,
            description: felt252,
            sender: ContractAddress,
        ) {
            // Check if sender has admin role or permission management role
            assert(
                self._has_role(MANAGE_ROLES, sender) || self._has_role(self.default_admin_role.read(), sender),
                'Caller does not have permission to create permissions'
            );

            // Check if permission already exists
            let existing_permission = self.permissions.read(permission_name);
            assert(existing_permission.name == 0, 'Permission already exists');

            let timestamp = get_block_timestamp();
            let permission = Permission {
                name: permission_name,
                required_roles,
                description,
                is_active: true,
                created_at: timestamp,
                created_by: sender,
            };

            self.permissions.write(permission_name, permission);
            
            // Add to all permissions array
            let mut all_perms = self.all_permissions.read();
            all_perms.append(permission_name);
            self.all_permissions.write(all_perms);

            // Emit event
            self.emit(PermissionCreated {
                permission_name,
                required_roles,
                description,
                created_by: sender,
            });
        }

        /// Internal function to check permission
        fn _check_permission(
            self: @ContractState,
            permission_name: felt252,
            account: ContractAddress,
        ) -> bool {
            let permission = self.permissions.read(permission_name);
            
            // Check if permission exists and is active
            if permission.name == 0 || !permission.is_active {
                return false;
            }

            // Check if user has any of the required roles
            let required_roles = permission.required_roles;
            let mut i = 0;
            let len = required_roles.len();
            
            loop {
                if i >= len {
                    break;
                }
                
                let role = required_roles.at(i);
                if self._has_role(role, account) {
                    return true;
                }
                
                i += 1;
            };
            
            false
        }

        /// Internal function to grant role
        fn _grant_role_internal(ref self: ContractState, role: felt252, account: ContractAddress) {
            let mut role_data = self.roles.read(role);
            
            // Initialize role data if it doesn't exist
            if role_data.admin_role == 0 {
                role_data = RoleData {
                    admin_role: self.default_admin_role.read(),
                    members: ArrayTrait::new(),
                    is_active: true,
                    created_at: get_block_timestamp(),
                };
            }

            // Check if account already has the role
            let mut i = 0;
            let len = role_data.members.len();
            let mut has_role = false;
            
            loop {
                if i >= len {
                    break;
                }
                
                if role_data.members.at(i) == account {
                    has_role = true;
                    break;
                }
                
                i += 1;
            };

            if !has_role {
                role_data.members.append(account);
                self.roles.write(role, role_data);

                // Update user roles mapping
                let mut user_roles = self.user_roles.read(account);
                user_roles.append(role);
                self.user_roles.write(account, user_roles);

                // Emit event
                self.emit(RoleGranted {
                    role,
                    account,
                    sender: get_caller_address(),
                });
            }
        }

        /// Internal function to revoke role
        fn _revoke_role_internal(ref self: ContractState, role: felt252, account: ContractAddress) {
            let mut role_data = self.roles.read(role);
            
            if role_data.admin_role == 0 {
                return;
            }

            // Remove account from role members
            let mut new_members = ArrayTrait::new();
            let mut i = 0;
            let len = role_data.members.len();
            
            loop {
                if i >= len {
                    break;
                }
                
                let member = role_data.members.at(i);
                if member != account {
                    new_members.append(member);
                }
                
                i += 1;
            };

            role_data.members = new_members;
            self.roles.write(role, role_data);

            // Remove role from user roles mapping
            let mut user_roles = self.user_roles.read(account);
            let mut new_user_roles = ArrayTrait::new();
            let mut j = 0;
            let user_roles_len = user_roles.len();
            
            loop {
                if j >= user_roles_len {
                    break;
                }
                
                let user_role = user_roles.at(j);
                if user_role != role {
                    new_user_roles.append(user_role);
                }
                
                j += 1;
            };

            self.user_roles.write(account, new_user_roles);

            // Emit event
            self.emit(RoleRevoked {
                role,
                account,
                sender: get_caller_address(),
            });
        }

        /// Internal function to set role admin
        fn _set_role_admin_internal(ref self: ContractState, role: felt252, admin_role: felt252) {
            let mut role_data = self.roles.read(role);
            let previous_admin_role = role_data.admin_role;
            
            if role_data.admin_role == 0 {
                role_data = RoleData {
                    admin_role,
                    members: ArrayTrait::new(),
                    is_active: true,
                    created_at: get_block_timestamp(),
                };
            } else {
                role_data.admin_role = admin_role;
            }

            self.roles.write(role, role_data);

            // Emit event
            self.emit(RoleAdminChanged {
                role,
                previous_admin_role,
                new_admin_role: admin_role,
            });
        }

        /// Internal function to check if account has role
        fn _has_role(self: @ContractState, role: felt252, account: ContractAddress) -> bool {
            let role_data = self.roles.read(role);
            
            if role_data.admin_role == 0 {
                return false;
            }

            let mut i = 0;
            let len = role_data.members.len();
            
            loop {
                if i >= len {
                    break;
                }
                
                if role_data.members.at(i) == account {
                    return true;
                }
                
                i += 1;
            };
            
            false
        }

        /// Internal function to get role admin
        fn _get_role_admin(self: @ContractState, role: felt252) -> felt252 {
            let role_data = self.roles.read(role);
            role_data.admin_role
        }

        /// Internal function to ensure role admin
        fn _ensure_role_admin(self: @ContractState, role: felt252, sender: ContractAddress) {
            let admin_role = self._get_role_admin(role);
            assert(
                admin_role == 0 || self._has_role(admin_role, sender),
                'AccessControl: sender must be an admin to grant'
            );
        }
    }

    impl InternalImpl of InternalTrait {}

    /// Constructor to initialize the contract with default roles and permissions
    #[constructor]
    fn constructor(ref self: ContractState, admin: ContractAddress) {
        // Set default admin role
        self.default_admin_role.write(DEFAULT_ADMIN_ROLE);

        // Grant default admin role to the provided admin
        self._grant_role_internal(DEFAULT_ADMIN_ROLE, admin);

        // Initialize standard roles
        self._set_role_admin_internal(SHIPMENT_MANAGER_ROLE, DEFAULT_ADMIN_ROLE);
        self._set_role_admin_internal(PAYMENT_MANAGER_ROLE, DEFAULT_ADMIN_ROLE);
        self._set_role_admin_internal(CARRIER_ROLE, DEFAULT_ADMIN_ROLE);
        self._set_role_admin_internal(SHIPPER_ROLE, DEFAULT_ADMIN_ROLE);
        self._set_role_admin_internal(VIEWER_ROLE, DEFAULT_ADMIN_ROLE);

        // Create standard permissions
        let mut create_shipment_roles = ArrayTrait::new();
        create_shipment_roles.append(SHIPMENT_MANAGER_ROLE);
        create_shipment_roles.append(SHIPPER_ROLE);
        
        let mut update_shipment_roles = ArrayTrait::new();
        update_shipment_roles.append(SHIPMENT_MANAGER_ROLE);
        update_shipment_roles.append(CARRIER_ROLE);
        
        let mut delete_shipment_roles = ArrayTrait::new();
        delete_shipment_roles.append(SHIPMENT_MANAGER_ROLE);
        
        let mut view_shipment_roles = ArrayTrait::new();
        view_shipment_roles.append(VIEWER_ROLE);
        view_shipment_roles.append(SHIPMENT_MANAGER_ROLE);
        view_shipment_roles.append(PAYMENT_MANAGER_ROLE);
        view_shipment_roles.append(CARRIER_ROLE);
        view_shipment_roles.append(SHIPPER_ROLE);
        
        let mut process_payment_roles = ArrayTrait::new();
        process_payment_roles.append(PAYMENT_MANAGER_ROLE);
        
        let mut view_payment_roles = ArrayTrait::new();
        view_payment_roles.append(PAYMENT_MANAGER_ROLE);
        view_payment_roles.append(SHIPMENT_MANAGER_ROLE);
        
        let mut manage_users_roles = ArrayTrait::new();
        manage_users_roles.append(DEFAULT_ADMIN_ROLE);
        
        let mut manage_roles_roles = ArrayTrait::new();
        manage_roles_roles.append(DEFAULT_ADMIN_ROLE);

        // Create permissions
        self._create_permission(
            CREATE_SHIPMENT,
            create_shipment_roles,
            'Permission to create new shipments',
            admin,
        );
        
        self._create_permission(
            UPDATE_SHIPMENT,
            update_shipment_roles,
            'Permission to update existing shipments',
            admin,
        );
        
        self._create_permission(
            DELETE_SHIPMENT,
            delete_shipment_roles,
            'Permission to delete shipments',
            admin,
        );
        
        self._create_permission(
            VIEW_SHIPMENT,
            view_shipment_roles,
            'Permission to view shipment details',
            admin,
        );
        
        self._create_permission(
            PROCESS_PAYMENT,
            process_payment_roles,
            'Permission to process payments',
            admin,
        );
        
        self._create_permission(
            VIEW_PAYMENT,
            view_payment_roles,
            'Permission to view payment details',
            admin,
        );
        
        self._create_permission(
            MANAGE_USERS,
            manage_users_roles,
            'Permission to manage users',
            admin,
        );
        
        self._create_permission(
            MANAGE_ROLES,
            manage_roles_roles,
            'Permission to manage roles and permissions',
            admin,
        );
    }
}
