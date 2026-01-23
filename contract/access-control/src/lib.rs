#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec,
};

// --- Data Structures ---

#[contracttype]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u32)]
pub enum Role {
    Admin = 0,
    Moderator = 1,
    Shipper = 2,
    Carrier = 3,
    Dispatcher = 4,
    Auditor = 5,
    System = 6,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct User {
    pub roles: Vec<Role>,
    pub is_active: bool,
    pub registered_at: u64,
    pub updated_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct Permission {
    pub required_role: Role,
    pub description_hash: String,
}

const ADMIN_KEY: Symbol = symbol_short!("ADMIN");

#[contract]
pub struct AccessControlContract;

#[contractimpl]
impl AccessControlContract {
    
    // --- Initialization ---
    
    pub fn init(env: Env, admin: Address) {
        if env.storage().persistent().has(&ADMIN_KEY) {
            panic!("Already initialized");
        }
        env.storage().persistent().set(&ADMIN_KEY, &admin);
    }

    // --- User Functions ---

    pub fn register_user(env: Env, user_addr: Address, initial_role: Role) {
        user_addr.require_auth();

        if env.storage().persistent().has(&user_addr) {
            panic!("User already registered");
        }

        // Only Admin can assign Admin/System/Moderator roles initially
        if matches!(initial_role, Role::Admin | Role::System | Role::Moderator) {
            let admin: Address = env.storage().persistent().get(&ADMIN_KEY).expect("Not initialized");
            admin.require_auth();
        }

        let now = env.ledger().timestamp();
        let mut roles = Vec::new(&env);
        roles.push_back(initial_role);

        let user = User {
            roles,
            is_active: true,
            registered_at: now,
            updated_at: now,
        };

        env.storage().persistent().set(&user_addr, &user);
        
        // Emit Event
        env.events().publish(
            (symbol_short!("UserReg"), user_addr), 
            (initial_role as u32, now)
        );
    }

    pub fn assign_role(env: Env, user_addr: Address, new_role: Role) {
        Self::require_admin(&env);

        let mut user: User = env.storage().persistent().get(&user_addr).expect("User not found");
        
        // Check for duplicate
        for r in user.roles.iter() {
            if r == new_role {
                panic!("User already has this role");
            }
        }

        user.roles.push_back(new_role);
        user.updated_at = env.ledger().timestamp();
        
        env.storage().persistent().set(&user_addr, &user);

        env.events().publish(
            (symbol_short!("RoleAdd"), user_addr), 
            (new_role as u32, env.ledger().timestamp())
        );
    }

    pub fn revoke_role(env: Env, user_addr: Address, role_to_remove: Role) {
        Self::require_admin(&env);

        let mut user: User = env.storage().persistent().get(&user_addr).expect("User not found");

        if user.roles.len() <= 1 {
            panic!("Cannot revoke last role");
        }

        let mut new_roles = Vec::new(&env);
        let mut found = false;

        for r in user.roles.iter() {
            if r == role_to_remove {
                found = true;
            } else {
                new_roles.push_back(r);
            }
        }

        if !found {
            panic!("User does not have this role");
        }

        user.roles = new_roles;
        user.updated_at = env.ledger().timestamp();
        env.storage().persistent().set(&user_addr, &user);

        env.events().publish(
            (symbol_short!("RoleRev"), user_addr), 
            (role_to_remove as u32, env.ledger().timestamp())
        );
    }

    // --- Access Checks ---

    pub fn has_role(env: Env, user_addr: Address, role: Role) -> bool {
        if let Some(user) = env.storage().persistent().get::<Address, User>(&user_addr) {
            if !user.is_active { return false; }
            for r in user.roles.iter() {
                if r == role { return true; }
            }
        }
        false
    }

    pub fn has_permission(env: Env, user_addr: Address, permission_name: Symbol) -> bool {
        if let Some(user) = env.storage().persistent().get::<Address, User>(&user_addr) {
            if !user.is_active { return false; }

            // Get required role for this permission
            if let Some(perm) = env.storage().persistent().get::<Symbol, Permission>(&permission_name) {
                // Check if user has the required role OR is Admin
                for user_role in user.roles.iter() {
                    if user_role == perm.required_role || user_role == Role::Admin {
                        return true;
                    }
                }
            }
        }
        false
    }

    pub fn get_user_roles(env: Env, user_addr: Address) -> Vec<Role> {
         env.storage().persistent().get::<Address, User>(&user_addr).expect("User not found").roles
    }

    // --- Permission Management ---

    pub fn register_permission(env: Env, name: Symbol, required_role: Role, desc: String) {
        Self::require_admin(&env);
        
        let permission = Permission {
            required_role,
            description_hash: desc,
        };
        
        env.storage().persistent().set(&name, &permission);
        
        env.events().publish(
            (symbol_short!("PermReg"), name), 
            (required_role as u32, env.ledger().timestamp())
        );
    }

    // --- Admin Management ---

    pub fn transfer_admin(env: Env, new_admin: Address) {
        Self::require_admin(&env);
        
        // Prevent zero address check is implicit in Soroban Address type (mostly)
        // but explicit check requires knowing what "zero" looks like for the chain. 
        // We rely on new_admin being a valid Address type.

        env.storage().persistent().set(&ADMIN_KEY, &new_admin);
        
        env.events().publish(
            (symbol_short!("AdminTx"), new_admin), 
            env.ledger().timestamp()
        );
    }

    pub fn set_user_status(env: Env, user_addr: Address, status: bool) {
        // Only Admin or Moderator can change status
        let caller = env.storage().persistent().get::<Symbol, Address>(&ADMIN_KEY).unwrap(); // Simplification: caller isn't easily accessible without auth in arg
        // In Soroban, we usually check auth of stored admin
        // For 'Moderator' check, we need to pass the moderator's address as an argument to verify auth.
        // For simplicity in this snippet, we enforce Admin Only for status changes 
        // OR requires an update to accept `caller: Address` and verify it has Moderator role.
        
        Self::require_admin(&env); 

        let mut user: User = env.storage().persistent().get(&user_addr).expect("User not found");
        user.is_active = status;
        user.updated_at = env.ledger().timestamp();
        env.storage().persistent().set(&user_addr, &user);
    }

    // --- Helpers ---

    fn require_admin(env: &Env) {
        let admin: Address = env.storage().persistent().get(&ADMIN_KEY).expect("Not initialized");
        admin.require_auth();
    }
}