use soroban_sdk::{
    testutils::{Address as _, Events as _},
    token::{Client as TokenClient, StellarAssetClient},
    Address, Env, Symbol, TryFromVal, Val, Vec,
};

use crate::contract::{EscrowContract, EscrowContractClient};

mod admin;
mod events;
mod funding;
mod settlement;

pub const AMOUNT: i128 = 500_000_000; // 50 XLM in stroops (7 decimals)
pub const SHIPMENT_ID: u64 = 42;

pub struct Ctx {
    pub env: Env,
    pub admin: Address,
    pub shipper: Address,
    pub carrier: Address,
    pub token_addr: Address,
    pub client: EscrowContractClient<'static>,
}

impl Ctx {
    pub fn token(&self) -> TokenClient<'_> {
        TokenClient::new(&self.env, &self.token_addr)
    }

    /// Approve the escrow contract to pull `AMOUNT` from the shipper, then fund.
    pub fn fund(&self) {
        self.token().approve(
            &self.shipper,
            &self.client.address,
            &AMOUNT,
            &(self.env.ledger().sequence() + 1000),
        );
        self.client
            .fund_escrow(&self.shipper, &self.carrier, &SHIPMENT_ID, &AMOUNT);
    }
}

/// Deploy a test SAC token, mint `amount` to `recipient`, return token address.
fn create_token(env: &Env, admin: &Address, recipient: &Address, amount: i128) -> Address {
    let token_address = env
        .register_stellar_asset_contract_v2(admin.clone())
        .address();
    let sac = StellarAssetClient::new(env, &token_address);
    sac.mint(recipient, &amount);
    token_address
}

pub fn setup(shipper_balance: i128) -> Ctx {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let shipper = Address::generate(&env);
    let carrier = Address::generate(&env);

    let token_addr = create_token(&env, &admin, &shipper, shipper_balance);

    let contract_id = env.register(EscrowContract {}, ());
    let client = EscrowContractClient::new(&env, &contract_id);
    client.initialize(&admin, &token_addr);

    Ctx {
        env,
        admin,
        shipper,
        carrier,
        token_addr,
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
