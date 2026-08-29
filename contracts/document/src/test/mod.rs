use soroban_sdk::{
    testutils::{Address as _, BytesN as _, Events as _},
    Address, Bytes, BytesN, Env, String, Symbol, TryFromVal, Val, Vec,
};

use crate::contract::{DocumentContract, DocumentContractClient};
use crate::types::{DocumentType, HashAlgorithm};

mod admin;
mod events;
mod registration;
mod shipment_link;
mod verification;

pub struct Ctx {
    pub env: Env,
    pub admin: Address,
    pub shipper: Address,
    pub carrier: Address,
    /// The real shipment contract this registry validates against.
    pub shipment: shipment::ShipmentContractClient<'static>,
    pub client: DocumentContractClient<'static>,
    /// A shipment accepted by `carrier`, so both parties may upload to it.
    pub shipment_id: u64,
}

impl Ctx {
    /// Create another shipment posted by `ctx.shipper` and leave it unaccepted.
    pub fn new_shipment(&self) -> u64 {
        self.shipment.create_shipment(
            &self.shipper,
            &String::from_str(&self.env, "Lagos, Nigeria"),
            &String::from_str(&self.env, "Nairobi, Kenya"),
            &String::from_str(&self.env, "Electronics — 50 units"),
            &120,
            &5_000_000_000i128,
        )
    }

    pub fn fake_hash(&self) -> BytesN<32> {
        BytesN::random(&self.env)
    }

    pub fn fake_cid(&self) -> Bytes {
        // Simulate a CIDv0 string encoded as bytes.
        Bytes::from_slice(&self.env, b"QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG")
    }

    /// Register a Bill of Lading against `shipment_id`, returning its id and hash.
    pub fn register(&self, uploader: &Address, shipment_id: u64) -> (u64, BytesN<32>) {
        let hash = self.fake_hash();
        let id = self.client.register_document(
            uploader,
            &shipment_id,
            &DocumentType::BillOfLading,
            &hash,
            &HashAlgorithm::Sha256,
            &self.fake_cid(),
        );
        (id, hash)
    }
}

pub fn setup() -> Ctx {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let shipper = Address::generate(&env);
    let carrier = Address::generate(&env);

    // A real shipment contract, so the cross-contract validation in
    // `register_document` is exercised rather than stubbed out.
    let shipment_id_addr = env.register(shipment::ShipmentContract {}, ());
    let shipment = shipment::ShipmentContractClient::new(&env, &shipment_id_addr);
    shipment.initialize(&admin);

    let contract_id = env.register(DocumentContract {}, ());
    let client = DocumentContractClient::new(&env, &contract_id);
    client.initialize(&admin, &shipment_id_addr);

    let ctx = Ctx {
        env,
        admin,
        shipper,
        carrier,
        shipment,
        client,
        shipment_id: 0,
    };

    let shipment_id = ctx.new_shipment();
    ctx.shipment.accept_shipment(&ctx.carrier, &shipment_id);

    Ctx { shipment_id, ..ctx }
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
