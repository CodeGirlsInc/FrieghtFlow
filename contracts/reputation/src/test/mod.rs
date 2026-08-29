use soroban_sdk::{
    testutils::{Address as _, Events as _},
    Address, Env, Symbol, TryFromVal, Val, Vec,
};

use crate::contract::{ReputationContract, ReputationContractClient};

mod admin;
mod events;
mod rating;
mod stats;
mod users;

pub struct Ctx {
    pub env: Env,
    pub admin: Address,
    /// Simulates the shipment contract authorised to call `update_stats`.
    pub auth_contract: Address,
    pub client: ReputationContractClient<'static>,
}

pub fn setup() -> Ctx {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let auth_contract = Address::generate(&env);
    let contract_id = env.register(ReputationContract {}, ());
    let client = ReputationContractClient::new(&env, &contract_id);
    client.initialize(&admin, &auth_contract);

    Ctx {
        env,
        admin,
        auth_contract,
        client,
    }
}

/// Payloads of every event emitted by `contract` whose action topic (topic #2)
/// is `action`, in emission order.
///
/// Note: the test `Env`'s event buffer only holds the events of the *most
/// recent* top-level invocation, and a call that returned an error leaves it
/// empty. Any further call clears it — read-only queries included — so read
/// every event a call produced before invoking the contract again.
pub fn emitted(env: &Env, contract: &Address, action: &str) -> Vec<Val> {
    let expected = Symbol::new(env, action);
    let mut out = Vec::new(env);

    for (id, topics, data) in env.events().all().iter() {
        if id != *contract || topics.len() < 2 {
            continue;
        }
        let got = Symbol::try_from_val(env, &topics.get_unchecked(1)).unwrap();
        if got == expected {
            out.push_back(data);
        }
    }

    out
}

/// The `key` topic (topic #3) of the last event matching `action`.
pub fn emitted_key<T: TryFromVal<Env, Val>>(env: &Env, contract: &Address, action: &str) -> T {
    let expected = Symbol::new(env, action);
    let mut found: Option<T> = None;

    for (id, topics, _) in env.events().all().iter() {
        if id != *contract || topics.len() < 3 {
            continue;
        }
        let got = Symbol::try_from_val(env, &topics.get_unchecked(1)).unwrap();
        if got == expected {
            found = Some(
                T::try_from_val(env, &topics.get_unchecked(2))
                    .unwrap_or_else(|_| panic!("key topic has unexpected type")),
            );
        }
    }

    found.expect("no event emitted for the requested action")
}

/// True when the last top-level invocation emitted nothing at all.
pub fn no_events(env: &Env) -> bool {
    env.events().all().is_empty()
}
