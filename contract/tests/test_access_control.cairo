use starknet::ContractAddress;
use starknet::testing::{set_caller_address, set_block_timestamp};
use snforge_std::{declare, ContractClassTrait, declare_contract, declare_contract_with_source};

use credenza_contract::access_control::{
    IAccessControlDispatcher, IAccessControlDispatcherTrait, Permission, RoleData,
};

// Constants for testing
const DEFAULT_ADMIN_ROLE: felt252 = 'DEFAULT_ADMIN_ROLE';
const SHIPMENT_MANAGER_ROLE: felt252 = 'SHIPMENT_MANAGER_ROLE';
const PAYMENT_MANAGER_ROLE: felt252 = 'PAYMENT_MANAGER_ROLE';
const CARRIER_ROLE: felt252 = 'CARRIER_ROLE';
const SHIPPER_ROLE: felt252 = 'SHIPPER_ROLE';
const VIEWER_ROLE: felt252 = 'VIEWER_ROLE';

const CREATE_SHIPMENT: felt252 = 'CREATE_SHIPMENT';
const UPDATE_SHIPMENT: felt252 = 'UPDATE_SHIPMENT';
const DELETE_SHIPMENT: felt252 = 'DELETE_SHIPMENT';
const VIEW_SHIPMENT: felt252 = 'VIEW_SHIPMENT';
const PROCESS_PAYMENT: felt252 = 'PROCESS_PAYMENT';
const VIEW_PAYMENT: felt252 = 'VIEW_PAYMENT';
const MANAGE_USERS: felt252 = 'MANAGE_USERS';
const MANAGE_ROLES: felt252 = 'MANAGE_ROLES';

fn deploy_access_control() -> IAccessControlDispatcher {
    let contract = declare_contract_with_source!("src/access_control.cairo");
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let constructor_calldata = array![admin.into()];
    let contract_address = contract.deploy(@constructor_calldata).unwrap();
    IAccessControlDispatcher { contract_address }
}

#[test]
fn test_constructor() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let access_control = deploy_access_control();
    
    // Check that admin has default admin role
    assert(access_control.has_role(DEFAULT_ADMIN_ROLE, admin), 'Admin should have default admin role');
    
    // Check that admin is the only member of default admin role
    assert(access_control.get_role_member_count(DEFAULT_ADMIN_ROLE) == 1, 'Should have 1 admin member');
    assert(access_control.get_role_member(DEFAULT_ADMIN_ROLE, 0) == admin, 'Admin should be the first member');
}

#[test]
fn test_grant_role() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let user: ContractAddress = 0x456.try_into().unwrap();
    let access_control = deploy_access_control();
    
    set_caller_address(admin);
    
    // Grant role to user
    access_control.grant_role(SHIPMENT_MANAGER_ROLE, user);
    
    // Check that user has the role
    assert(access_control.has_role(SHIPMENT_MANAGER_ROLE, user), 'User should have shipment manager role');
    
    // Check user roles
    let user_roles = access_control.get_user_roles(user);
    assert(user_roles.len() == 1, 'User should have 1 role');
    assert(user_roles.at(0) == SHIPMENT_MANAGER_ROLE, 'User should have shipment manager role');
}

#[test]
fn test_revoke_role() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let user: ContractAddress = 0x456.try_into().unwrap();
    let access_control = deploy_access_control();
    
    set_caller_address(admin);
    
    // Grant role to user
    access_control.grant_role(SHIPMENT_MANAGER_ROLE, user);
    assert(access_control.has_role(SHIPMENT_MANAGER_ROLE, user), 'User should have role');
    
    // Revoke role from user
    access_control.revoke_role(SHIPMENT_MANAGER_ROLE, user);
    
    // Check that user no longer has the role
    assert(!access_control.has_role(SHIPMENT_MANAGER_ROLE, user), 'User should not have role after revocation');
    
    // Check user roles
    let user_roles = access_control.get_user_roles(user);
    assert(user_roles.len() == 0, 'User should have no roles after revocation');
}

#[test]
fn test_renounce_role() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let user: ContractAddress = 0x456.try_into().unwrap();
    let access_control = deploy_access_control();
    
    set_caller_address(admin);
    access_control.grant_role(SHIPMENT_MANAGER_ROLE, user);
    
    // User renounces their own role
    set_caller_address(user);
    access_control.renounce_role(SHIPMENT_MANAGER_ROLE, user);
    
    // Check that user no longer has the role
    assert(!access_control.has_role(SHIPMENT_MANAGER_ROLE, user), 'User should not have role after renouncing');
}

#[test]
#[should_panic(expected: ('Can only renounce roles for self',))]
fn test_renounce_role_not_self() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let user: ContractAddress = 0x456.try_into().unwrap();
    let access_control = deploy_access_control();
    
    set_caller_address(admin);
    access_control.grant_role(SHIPMENT_MANAGER_ROLE, user);
    
    // Admin tries to renounce user's role (should fail)
    access_control.renounce_role(SHIPMENT_MANAGER_ROLE, user);
}

#[test]
fn test_set_role_admin() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let access_control = deploy_access_control();
    
    set_caller_address(admin);
    
    // Set admin role for shipment manager role
    access_control.set_role_admin(SHIPMENT_MANAGER_ROLE, PAYMENT_MANAGER_ROLE);
    
    // Check that admin role was set correctly
    assert(access_control.get_role_admin(SHIPMENT_MANAGER_ROLE) == PAYMENT_MANAGER_ROLE, 'Admin role should be set correctly');
}

#[test]
fn test_create_permission() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let access_control = deploy_access_control();
    
    set_caller_address(admin);
    
    let permission_name = 'CUSTOM_PERMISSION';
    let mut required_roles = ArrayTrait::new();
    required_roles.append(SHIPMENT_MANAGER_ROLE);
    required_roles.append(PAYMENT_MANAGER_ROLE);
    let description = 'Custom permission for testing';
    
    // Create permission
    access_control.create_permission(permission_name, required_roles, description);
    
    // Check that permission was created
    let permission = access_control.get_permission_details(permission_name);
    assert(permission.name == permission_name, 'Permission name should match');
    assert(permission.is_active, 'Permission should be active');
    assert(permission.created_by == admin, 'Permission should be created by admin');
}

#[test]
fn test_check_permission() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let user: ContractAddress = 0x456.try_into().unwrap();
    let access_control = deploy_access_control();
    
    set_caller_address(admin);
    
    // Grant shipment manager role to user
    access_control.grant_role(SHIPMENT_MANAGER_ROLE, user);
    
    // Check that user has permission to create shipment
    assert(access_control.check_permission(CREATE_SHIPMENT, user), 'User should have create shipment permission');
    
    // Check that user does not have permission to process payment
    assert(!access_control.check_permission(PROCESS_PAYMENT, user), 'User should not have process payment permission');
}

#[test]
fn test_get_all_permissions() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let access_control = deploy_access_control();
    
    // Check that all standard permissions are created
    let all_permissions = access_control.get_all_permissions();
    assert(all_permissions.len() == 8, 'Should have 8 standard permissions');
    
    // Check that specific permissions exist
    let mut found_create_shipment = false;
    let mut found_process_payment = false;
    
    let mut i = 0;
    let len = all_permissions.len();
    loop {
        if i >= len {
            break;
        }
        
        let permission = all_permissions.at(i);
        if permission == CREATE_SHIPMENT {
            found_create_shipment = true;
        }
        if permission == PROCESS_PAYMENT {
            found_process_payment = true;
        }
        
        i += 1;
    };
    
    assert(found_create_shipment, 'CREATE_SHIPMENT permission should exist');
    assert(found_process_payment, 'PROCESS_PAYMENT permission should exist');
}

#[test]
fn test_role_member_management() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let user1: ContractAddress = 0x456.try_into().unwrap();
    let user2: ContractAddress = 0x789.try_into().unwrap();
    let access_control = deploy_access_control();
    
    set_caller_address(admin);
    
    // Grant role to multiple users
    access_control.grant_role(SHIPMENT_MANAGER_ROLE, user1);
    access_control.grant_role(SHIPMENT_MANAGER_ROLE, user2);
    
    // Check member count
    assert(access_control.get_role_member_count(SHIPMENT_MANAGER_ROLE) == 2, 'Should have 2 members');
    
    // Check specific members
    assert(access_control.get_role_member(SHIPMENT_MANAGER_ROLE, 0) == user1, 'First member should be user1');
    assert(access_control.get_role_member(SHIPMENT_MANAGER_ROLE, 1) == user2, 'Second member should be user2');
    
    // Revoke role from one user
    access_control.revoke_role(SHIPMENT_MANAGER_ROLE, user1);
    
    // Check member count after revocation
    assert(access_control.get_role_member_count(SHIPMENT_MANAGER_ROLE) == 1, 'Should have 1 member after revocation');
    assert(access_control.get_role_member(SHIPMENT_MANAGER_ROLE, 0) == user2, 'Remaining member should be user2');
}

#[test]
#[should_panic(expected: ('AccessControl: sender must be an admin to grant',))]
fn test_grant_role_unauthorized() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let user: ContractAddress = 0x456.try_into().unwrap();
    let unauthorized: ContractAddress = 0x999.try_into().unwrap();
    let access_control = deploy_access_control();
    
    // Unauthorized user tries to grant role
    set_caller_address(unauthorized);
    access_control.grant_role(SHIPMENT_MANAGER_ROLE, user);
}

#[test]
#[should_panic(expected: ('AccessControl: sender must be an admin to grant',))]
fn test_revoke_role_unauthorized() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let user: ContractAddress = 0x456.try_into().unwrap();
    let unauthorized: ContractAddress = 0x999.try_into().unwrap();
    let access_control = deploy_access_control();
    
    set_caller_address(admin);
    access_control.grant_role(SHIPMENT_MANAGER_ROLE, user);
    
    // Unauthorized user tries to revoke role
    set_caller_address(unauthorized);
    access_control.revoke_role(SHIPMENT_MANAGER_ROLE, user);
}

#[test]
#[should_panic(expected: ('Caller does not have permission to create permissions',))]
fn test_create_permission_unauthorized() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let unauthorized: ContractAddress = 0x999.try_into().unwrap();
    let access_control = deploy_access_control();
    
    // Unauthorized user tries to create permission
    set_caller_address(unauthorized);
    
    let permission_name = 'UNAUTHORIZED_PERMISSION';
    let mut required_roles = ArrayTrait::new();
    required_roles.append(SHIPMENT_MANAGER_ROLE);
    let description = 'Unauthorized permission';
    
    access_control.create_permission(permission_name, required_roles, description);
}

#[test]
#[should_panic(expected: ('Permission already exists',))]
fn test_create_duplicate_permission() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let access_control = deploy_access_control();
    
    set_caller_address(admin);
    
    let permission_name = 'DUPLICATE_PERMISSION';
    let mut required_roles = ArrayTrait::new();
    required_roles.append(SHIPMENT_MANAGER_ROLE);
    let description = 'Duplicate permission';
    
    // Create permission first time
    access_control.create_permission(permission_name, required_roles, description);
    
    // Try to create same permission again
    access_control.create_permission(permission_name, required_roles, description);
}

#[test]
fn test_multiple_roles_per_user() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let user: ContractAddress = 0x456.try_into().unwrap();
    let access_control = deploy_access_control();
    
    set_caller_address(admin);
    
    // Grant multiple roles to user
    access_control.grant_role(SHIPMENT_MANAGER_ROLE, user);
    access_control.grant_role(PAYMENT_MANAGER_ROLE, user);
    access_control.grant_role(CARRIER_ROLE, user);
    
    // Check that user has all roles
    assert(access_control.has_role(SHIPMENT_MANAGER_ROLE, user), 'User should have shipment manager role');
    assert(access_control.has_role(PAYMENT_MANAGER_ROLE, user), 'User should have payment manager role');
    assert(access_control.has_role(CARRIER_ROLE, user), 'User should have carrier role');
    
    // Check user roles array
    let user_roles = access_control.get_user_roles(user);
    assert(user_roles.len() == 3, 'User should have 3 roles');
    
    // Check that user has permissions from all roles
    assert(access_control.check_permission(CREATE_SHIPMENT, user), 'User should have create shipment permission');
    assert(access_control.check_permission(PROCESS_PAYMENT, user), 'User should have process payment permission');
    assert(access_control.check_permission(VIEW_SHIPMENT, user), 'User should have view shipment permission');
}

#[test]
fn test_permission_with_multiple_required_roles() {
    let admin: ContractAddress = 0x123.try_into().unwrap();
    let user: ContractAddress = 0x456.try_into().unwrap();
    let access_control = deploy_access_control();
    
    set_caller_address(admin);
    
    // Create permission that requires multiple roles
    let permission_name = 'MULTI_ROLE_PERMISSION';
    let mut required_roles = ArrayTrait::new();
    required_roles.append(SHIPMENT_MANAGER_ROLE);
    required_roles.append(PAYMENT_MANAGER_ROLE);
    let description = 'Permission requiring multiple roles';
    
    access_control.create_permission(permission_name, required_roles, description);
    
    // User has no roles initially
    assert(!access_control.check_permission(permission_name, user), 'User should not have permission initially');
    
    // Grant first required role
    access_control.grant_role(SHIPMENT_MANAGER_ROLE, user);
    assert(access_control.check_permission(permission_name, user), 'User should have permission with first role');
    
    // Revoke first role and grant second role
    access_control.revoke_role(SHIPMENT_MANAGER_ROLE, user);
    access_control.grant_role(PAYMENT_MANAGER_ROLE, user);
    assert(access_control.check_permission(permission_name, user), 'User should have permission with second role');
    
    // Grant both roles
    access_control.grant_role(SHIPMENT_MANAGER_ROLE, user);
    assert(access_control.check_permission(permission_name, user), 'User should have permission with both roles');
}
