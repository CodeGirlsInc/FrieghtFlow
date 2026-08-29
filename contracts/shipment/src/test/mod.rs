use soroban_sdk::{
    testutils::{Address as _, Events as _},
    Address, Env, String, Symbol, TryFromVal, Val, Vec,
};

use crate::contract::{ShipmentContract, ShipmentContractClient};

mod dispute;
mod events;
mod lifecycle;
mod queries;

pub struct Ctx {
    pub env: Env,
    pub admin: Address,
    pub client: ShipmentContractClient<'static>,
}

pub fn setup() -> Ctx {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let contract_id = env.register(ShipmentContract {}, ());
    let client = ShipmentContractClient::new(&env, &contract_id);
    client.initialize(&admin);

    Ctx { env, admin, client }
}

pub fn str(env: &Env, s: &str) -> String {
    String::from_str(env, s)
}

pub fn make_shipment(ctx: &Ctx, shipper: &Address) -> u64 {
    ctx.client.create_shipment(
        shipper,
        &str(&ctx.env, "Lagos, Nigeria"),
        &str(&ctx.env, "Nairobi, Kenya"),
        &str(&ctx.env, "Electronics — 50 units"),
        &120,
        &5_000_000_000i128, // 500 XLM
    )
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

/// The `key` topic (topic #3) of the first event matching `action`.
pub fn emitted_key<T: TryFromVal<Env, Val>>(env: &Env, contract: &Address, action: &str) -> T {
    let expected = Symbol::new(env, action);

    for (id, topics, _) in env.events().all().iter() {
        if id != *contract || topics.len() < 3 {
            continue;
        }
        let got = Symbol::try_from_val(env, &topics.get_unchecked(1)).unwrap();
        if got == expected {
            return T::try_from_val(env, &topics.get_unchecked(2))
                .unwrap_or_else(|_| panic!("key topic has unexpected type"));
        }
    }

    panic!("no event emitted for the requested action")
}

/// True when the last top-level invocation emitted nothing at all.
pub fn no_events(env: &Env) -> bool {
    env.events().all().is_empty()
}
