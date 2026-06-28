#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, BytesN as _},
    Env, IntoVal,
};

fn setup() -> (Env, Address, IdentityContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let contract_id = env.register(IdentityContract {}, ());
    let client = IdentityContractClient::new(&env, &contract_id);
    client.initialize(&admin);

    (env, admin, client)
}

/// Register a wallet, then get_user_identity — should return the hash.
#[test]
fn test_register_new_identity() {
    let (env, _admin, client) = setup();
    let wallet = Address::generate(&env);
    let hash = BytesN::random(&env);

    client.register_identity(&hash, &wallet);

    assert!(client.verify_identity(&wallet));
    assert_eq!(client.get_user_identity(&wallet), hash);
}

/// Registering the same wallet twice should fail with AlreadyRegistered.
#[test]
fn test_register_duplicate_wallet_fails() {
    let (env, _admin, client) = setup();
    let wallet = Address::generate(&env);
    let hash = BytesN::random(&env);

    client.register_identity(&hash, &wallet);

    let result = client.try_register_identity(&hash, &wallet);
    assert_eq!(result, Err(Ok(IdentityError::AlreadyRegistered)));
}

/// get_user_identity for an unknown wallet should return NotRegistered.
#[test]
fn test_get_unregistered_wallet_returns_none() {
    let (env, _admin, client) = setup();
    let wallet = Address::generate(&env);

    let result = client.try_get_user_identity(&wallet);
    assert_eq!(result, Err(Ok(IdentityError::NotRegistered)));
}

/// Admin revokes a registration; subsequent lookups treat the wallet as unregistered.
#[test]
fn test_revoke_identity_by_admin() {
    let (env, _admin, client) = setup();
    let wallet = Address::generate(&env);
    let hash = BytesN::random(&env);

    client.register_identity(&hash, &wallet);
    assert!(client.verify_identity(&wallet));

    client.revoke_identity(&wallet);

    assert!(!client.verify_identity(&wallet));
    let result = client.try_get_user_identity(&wallet);
    assert_eq!(result, Err(Ok(IdentityError::NotRegistered)));
}

/// Revoking as a non-admin wallet should fail because `revoke_identity` only
/// authorizes the address stored as `Admin`. We mock authorization for a
/// non-admin signer (instead of mocking all auths), so the contract's
/// `admin.require_auth()` call has no valid signature to satisfy and the
/// invocation fails.
#[test]
fn test_revoke_by_non_admin_fails() {
    let env = Env::default();

    let admin = Address::generate(&env);
    let non_admin = Address::generate(&env);
    let wallet = Address::generate(&env);
    let hash = BytesN::random(&env);

    let contract_id = env.register(IdentityContract {}, ());
    let client = IdentityContractClient::new(&env, &contract_id);

    env.mock_all_auths();
    client.initialize(&admin);
    client.register_identity(&hash, &wallet);

    // Only authorize `non_admin` for this call — `admin` never signs it.
    env.mock_auths(&[soroban_sdk::testutils::MockAuth {
        address: &non_admin,
        invoke: &soroban_sdk::testutils::MockAuthInvoke {
            contract: &contract_id,
            fn_name: "revoke_identity",
            args: (wallet.clone(),).into_val(&env),
            sub_invokes: &[],
        },
    }]);

    let result = client.try_revoke_identity(&wallet);
    assert!(result.is_err());
    assert!(client.verify_identity(&wallet));
}

/// is_registered (via verify_identity) returns true for a registered wallet
/// and false for an unregistered one.
#[test]
fn test_is_registered_returns_correct_bool() {
    let (env, _admin, client) = setup();
    let registered = Address::generate(&env);
    let unregistered = Address::generate(&env);
    let hash = BytesN::random(&env);

    client.register_identity(&hash, &registered);

    assert!(client.verify_identity(&registered));
    assert!(!client.verify_identity(&unregistered));
}
