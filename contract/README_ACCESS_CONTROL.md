# AccessControl Smart Contract

A comprehensive roles and permissions management system for the FreightFlow logistics platform, built on Starknet using Cairo.

## Overview

The AccessControl contract provides a robust system for managing user roles and permissions in a decentralized logistics platform. It follows a structure similar to OpenZeppelin's AccessControl but is specifically tailored for Starknet and extended with permission creation and validation capabilities.

## Features

### 🔐 **Role Management**
- **Grant/Revoke Roles**: Assign and remove roles from users
- **Role Hierarchy**: Admin roles can manage other roles
- **Role Renunciation**: Users can voluntarily give up their roles
- **Role Validation**: Check if users have specific roles

### 🛡️ **Permission System**
- **Permission Creation**: Create custom permissions with required roles
- **Permission Validation**: Check if users have specific permissions
- **Multi-Role Permissions**: Permissions can require multiple roles
- **Permission Details**: Retrieve comprehensive permission information

### 🏗️ **Standard Roles**
The contract comes pre-configured with standard logistics roles:
- `DEFAULT_ADMIN_ROLE` - Super admin with all permissions
- `SHIPMENT_MANAGER_ROLE` - Manage shipments
- `PAYMENT_MANAGER_ROLE` - Handle payments
- `CARRIER_ROLE` - Transport and delivery
- `SHIPPER_ROLE` - Shipment creation and management
- `VIEWER_ROLE` - Read-only access

### 🔑 **Standard Permissions**
Pre-configured permissions for common logistics operations:
- `CREATE_SHIPMENT` - Create new shipments
- `UPDATE_SHIPMENT` - Modify existing shipments
- `DELETE_SHIPMENT` - Remove shipments
- `VIEW_SHIPMENT` - View shipment details
- `PROCESS_PAYMENT` - Process payments
- `VIEW_PAYMENT` - View payment information
- `MANAGE_USERS` - User management
- `MANAGE_ROLES` - Role and permission management

## Contract Interface

### Core Functions

#### Role Management
```cairo
// Grant a role to an account
fn grant_role(ref self: TContractState, role: felt252, account: ContractAddress);

// Revoke a role from an account
fn revoke_role(ref self: TContractState, role: felt252, account: ContractAddress);

// Check if an account has a specific role
fn has_role(self: @TContractState, role: felt252, account: ContractAddress) -> bool;

// Get the admin role for a given role
fn get_role_admin(self: @TContractState, role: felt252) -> felt252;

// Set the admin role for a given role
fn set_role_admin(ref self: TContractState, role: felt252, admin_role: felt252);

// Renounce a role (only callable by the account itself)
fn renounce_role(ref self: TContractState, role: felt252, account: ContractAddress);
```

#### Permission Management
```cairo
// Create a new permission
fn create_permission(
    ref self: TContractState,
    permission_name: felt252,
    required_roles: Array<felt252>,
    description: felt252,
);

// Check if an account has permission
fn check_permission(
    self: @TContractState,
    permission_name: felt252,
    account: ContractAddress,
) -> bool;
```

#### Query Functions
```cairo
// Get all roles for a user
fn get_user_roles(self: @TContractState, account: ContractAddress) -> Array<felt252>;

// Get all permissions
fn get_all_permissions(self: @TContractState) -> Array<felt252>;

// Get permission details
fn get_permission_details(self: @TContractState, permission_name: felt252) -> Permission;

// Get role members count
fn get_role_member_count(self: @TContractState, role: felt252) -> u32;

// Get role member at index
fn get_role_member(self: @TContractState, role: felt252, index: u32) -> ContractAddress;
```

## Data Structures

### Permission
```cairo
pub struct Permission {
    pub name: felt252,                    // Permission name
    pub required_roles: Array<felt252>,   // Roles required for this permission
    pub description: felt252,             // Permission description
    pub is_active: bool,                  // Whether permission is active
    pub created_at: u64,                  // Creation timestamp
    pub created_by: ContractAddress,      // Address that created the permission
}
```

### RoleData
```cairo
pub struct RoleData {
    pub admin_role: felt252,              // Admin role for this role
    pub members: Array<ContractAddress>,  // List of role members
    pub is_active: bool,                  // Whether role is active
    pub created_at: u64,                  // Creation timestamp
}
```

## Events

The contract emits the following events for tracking role and permission changes:

- `RoleGranted` - When a role is granted to an account
- `RoleRevoked` - When a role is revoked from an account
- `RoleAdminChanged` - When a role's admin is changed
- `PermissionCreated` - When a new permission is created
- `RoleRenounced` - When a user renounces their own role

## Usage Examples

### Deployment
```cairo
// Deploy with admin address
let admin: ContractAddress = 0x123.try_into().unwrap();
let constructor_calldata = array![admin.into()];
let contract_address = contract.deploy(@constructor_calldata).unwrap();
```

### Granting Roles
```cairo
// Admin grants shipment manager role to user
access_control.grant_role(SHIPMENT_MANAGER_ROLE, user_address);
```

### Checking Permissions
```cairo
// Check if user can create shipments
let can_create = access_control.check_permission(CREATE_SHIPMENT, user_address);
```

### Creating Custom Permissions
```cairo
let mut required_roles = ArrayTrait::new();
required_roles.append(SHIPMENT_MANAGER_ROLE);
required_roles.append(PAYMENT_MANAGER_ROLE);

access_control.create_permission(
    'CUSTOM_PERMISSION',
    required_roles,
    'Custom permission description'
);
```

## Security Features

### 🔒 **Access Control**
- Only role admins can grant/revoke roles
- Users can only renounce their own roles
- Permission creation restricted to admins

### 🛡️ **Validation**
- Duplicate permission prevention
- Role existence validation
- Permission existence checks

### 📝 **Audit Trail**
- Comprehensive event logging
- Timestamp tracking
- Creator tracking for permissions

## Testing

Run the comprehensive test suite:

```bash
cd contract
snforge test
```

The test suite covers:
- ✅ Role granting and revocation
- ✅ Permission creation and validation
- ✅ Multi-role permissions
- ✅ Unauthorized access prevention
- ✅ Event emission
- ✅ Edge cases and error conditions

## Integration

### With Other Contracts
The AccessControl contract can be integrated with other FreightFlow contracts:

```cairo
// In other contracts, check permissions before executing functions
let access_control = IAccessControlDispatcher { contract_address: access_control_address };
assert(
    access_control.check_permission(CREATE_SHIPMENT, get_caller_address()),
    'Insufficient permissions'
);
```

### With Frontend
The contract provides all necessary view functions for frontend integration:
- Role checking for UI rendering
- Permission validation for feature access
- User role listing for profile pages

## Gas Optimization

The contract is optimized for gas efficiency:
- Efficient storage patterns
- Minimal external calls
- Optimized loops and data structures
- Batch operations where possible

## Future Enhancements

Potential improvements for future versions:
- Role expiration mechanisms
- Permission inheritance
- Batch role operations
- Role templates
- Advanced permission logic (AND/OR combinations)

## License

This contract is part of the FreightFlow project and follows the same licensing terms.

---

**Built for Starknet with ❤️ by the FreightFlow team**
