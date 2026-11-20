//! Property-based tests for the reputation contract's core invariants.
//!
//! These drive randomised sequences of `register_user`, `submit_rating`,
//! `update_stats` and `void_rating` operations against an independent
//! reference model and verify, on every on-chain state reached:
//!
//! 1. **Average-rating bounds** — `average_rating` always stays within the
//!    valid range regardless of the sequence/count of submitted and voided
//!    ratings: exactly `0` when no rating is active, otherwise in `100..=500`.
//! 2. **Score bounds** — `calculate_score` never exceeds 1000 for any valid
//!    input combination (it is a `u32`, so it can never go negative).
//! 3. **Model agreement** — the contract agrees with the reference model on
//!    which operations are valid, and every reputation field equals the
//!    model after each operation.

use proptest::prelude::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

use crate::contract::{ReputationContract, ReputationContractClient};
use crate::types::UserType;

const USER_COUNT: usize = 4;

/// One reputation operation drawn from the randomised input sequence.
/// `user`/`rater`/`rated` index into the fixed per-case user pool.
#[derive(Clone, Debug)]
enum Op {
    Register { user: usize, user_type: UserType },
    Rate {
        rater: usize,
        rated: usize,
        shipment_id: u64,
        score: u32,
    },
    Stats {
        user: usize,
        was_on_time: bool,
        was_successful: bool,
    },
    Void { rating_index: usize },
}

fn user_idx() -> impl Strategy<Value = usize> {
    0..USER_COUNT
}

/// Strategy for a single operation.
fn op_strategy() -> impl Strategy<Value = Op> {
    prop_oneof![
        (user_idx(), any::<bool>()).prop_map(|(user, is_carrier)| Op::Register {
            user,
            user_type: if is_carrier {
                UserType::Carrier
            } else {
                UserType::Shipper
            },
        }),
        (user_idx(), user_idx(), any::<u64>(), 1u32..=5)
            .prop_map(|(rater, rated, shipment_id, score)| Op::Rate {
                rater,
                rated,
                shipment_id,
                score,
            }),
        (user_idx(), any::<bool>(), any::<bool>())
            .prop_map(|(user, was_on_time, was_successful)| Op::Stats {
                user,
                was_on_time,
                was_successful,
            }),
        (0..64).prop_map(|rating_index| Op::Void { rating_index }),
    ]
}

/// A rating as held by the reference model.
#[derive(Clone, Copy, Debug)]
struct Rating {
    id: u64,
    rater: usize,
    rated: usize,
    shipment_id: u64,
    score: u32,
}

/// The per-user state the model tracks.
#[derive(Clone, Debug)]
struct UserState {
    user_type: UserType,
    total_completed: u32,
    total_rating_points: u32,
    rating_count: u32,
    on_time_count: u32,
    late_count: u32,
    success_count: u32,
    cancel_count: u32,
    average_rating: u32,
}

impl UserState {
    fn new(user_type: UserType) -> Self {
        UserState {
            user_type,
            total_completed: 0,
            total_rating_points: 0,
            rating_count: 0,
            on_time_count: 0,
            late_count: 0,
            success_count: 0,
            cancel_count: 0,
            average_rating: 0,
        }
    }
}

/// An independent reference model of the reputation contract's state.
///
/// It mirrors the documented rules only: a rating is valid iff the rated user
/// is registered, the score is 1-5, the rater is not the ratee, and the
/// (shipment, rater) pair has not already rated; voids reverse a rating's
/// contribution and free the pair again.
#[derive(Clone, Debug)]
struct Model {
    users: [Option<UserState>; USER_COUNT],
    raters: Vec<(u64, usize)>, // (shipment_id, rater) pairs that have rated
    ratings: Vec<Rating>,      // active ratings, insertion ordered
    next_rating_id: u64,
}

impl Model {
    fn new() -> Self {
        Model {
            users: [
                None, None, None, None,
            ],
            raters: Vec::new(),
            ratings: Vec::new(),
            next_rating_id: 0,
        }
    }

    fn registered(&self, user: usize) -> bool {
        self.users[user].is_some()
    }

    /// Returns `Ok(())` when the operation is valid (mutating the model), or
    /// `Err(())` when the contract is expected to reject it.
    fn apply(&mut self, op: &Op) -> Result<(), ()> {
        match op {
            Op::Register { user, user_type } => {
                if self.registered(*user) {
                    return Err(());
                }
                self.users[*user] = Some(UserState::new(*user_type));
                Ok(())
            }
            Op::Rate {
                rater,
                rated,
                shipment_id,
                score,
            } => {
                if rater == rated {
                    return Err(());
                }
                if !(1..=5).contains(score) {
                    return Err(());
                }
                if !self.registered(*rated) {
                    return Err(());
                }
                if self.raters.contains(&(*shipment_id, *rater)) {
                    return Err(());
                }
                self.raters.push((*shipment_id, *rater));
                self.next_rating_id += 1;
                self.ratings.push(Rating {
                    id: self.next_rating_id,
                    rater: *rater,
                    rated: *rated,
                    shipment_id: *shipment_id,
                    score: *score,
                });
                let user = self.users[*rated].as_mut().expect("rated user registered");
                user.total_rating_points += score * 100;
                user.rating_count += 1;
                user.average_rating = user.total_rating_points / user.rating_count;
                Ok(())
            }
            Op::Stats {
                user,
                was_on_time,
                was_successful,
            } => {
                if !self.registered(*user) {
                    return Err(());
                }
                let u = self.users[*user].as_mut().expect("registered user");
                u.total_completed += 1;
                match u.user_type {
                    UserType::Carrier => {
                        if *was_on_time {
                            u.on_time_count += 1;
                        } else {
                            u.late_count += 1;
                        }
                    }
                    UserType::Shipper => {
                        if *was_successful {
                            u.success_count += 1;
                        } else {
                            u.cancel_count += 1;
                        }
                    }
                }
                Ok(())
            }
            Op::Void { rating_index } => {
                if *rating_index >= self.ratings.len() {
                    return Err(());
                }
                let rating = self.ratings.remove(*rating_index);
                if let Some(pos) = self
                    .raters
                    .iter()
                    .position(|&(s, r)| s == rating.shipment_id && r == rating.rater)
                {
                    self.raters.remove(pos);
                }
                let user = self.users[rating.rated]
                    .as_mut()
                    .expect("rated user registered");
                user.total_rating_points =
                    user.total_rating_points.saturating_sub(rating.score * 100);
                user.rating_count = user.rating_count.saturating_sub(1);
                user.average_rating = if user.rating_count == 0 {
                    0
                } else {
                    user.total_rating_points / user.rating_count
                };
                Ok(())
            }
        }
    }
}

proptest! {
    #![proptest_config(ProptestConfig::with_cases(128))]

    /// `average_rating` stays within its valid range (0, or 100..=500 with any
    /// active rating), `calculate_score` never exceeds 1000, and the contract
    /// agrees with the reference model on every operation and reputation field.
    #[test]
    fn average_rating_and_score_invariants(
        ops in prop::collection::vec(op_strategy(), 1..=80),
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let auth_contract = Address::generate(&env);
        let contract_id = env.register(ReputationContract {}, ());
        let client = ReputationContractClient::new(&env, &contract_id);
        client.initialize(&admin, &auth_contract);

        let users: Vec<Address> = (0..USER_COUNT).map(|_| Address::generate(&env)).collect();

        let mut model = Model::new();

        for op in ops {
            // Resolve the void target id BEFORE applying the op so it refers
            // to the rating the model is about to remove.
            let void_target = match &op {
                Op::Void { rating_index } => model.ratings.get(*rating_index).map(|r| r.id),
                _ => None,
            };

            let expected = model.apply(&op);

            let outcome = match &op {
                Op::Register { user, user_type } => {
                    client.try_register_user(&users[*user], user_type)
                }
                Op::Rate {
                    rater,
                    rated,
                    shipment_id,
                    score,
                } => client.try_submit_rating(&users[*rater], shipment_id, &users[*rated], score),
                Op::Stats {
                    user,
                    was_on_time,
                    was_successful,
                } => client.try_update_stats(
                    &auth_contract,
                    &users[*user],
                    was_on_time,
                    was_successful,
                ),
                Op::Void { .. } => client.try_void_rating(&void_target.unwrap_or(0)),
            };

            // The contract must agree with the reference model on validity:
            // `try_*` returns Ok(_) on success and Err(_) on any error.
            prop_assert_eq!(outcome.is_ok(), expected.is_ok(), "op {:?}", op);

            // Field-level agreement plus the issue's invariants for every user.
            for (i, addr) in users.iter().enumerate() {
                match model.users[i].clone() {
                    Some(model_rep) => {
                        let rep = client.try_get_reputation(addr).unwrap().unwrap();

                        prop_assert_eq!(rep.user_type, model_rep.user_type);
                        prop_assert_eq!(rep.total_completed, model_rep.total_completed);
                        prop_assert_eq!(rep.total_rating_points, model_rep.total_rating_points);
                        prop_assert_eq!(rep.rating_count, model_rep.rating_count);
                        prop_assert_eq!(rep.on_time_count, model_rep.on_time_count);
                        prop_assert_eq!(rep.late_count, model_rep.late_count);
                        prop_assert_eq!(rep.success_count, model_rep.success_count);
                        prop_assert_eq!(rep.cancel_count, model_rep.cancel_count);
                        prop_assert_eq!(rep.average_rating, model_rep.average_rating);

                        // Invariant: average stays in [0, 500] — exactly 0 when
                        // no rating is active, otherwise >= 100 (the lowest
                        // single score is 1 star) and <= 500.
                        prop_assert!(
                            rep.average_rating <= 500,
                            "average {} exceeds 500",
                            rep.average_rating
                        );
                        if rep.rating_count == 0 {
                            prop_assert_eq!(rep.average_rating, 0);
                            prop_assert_eq!(rep.total_rating_points, 0);
                        } else {
                            prop_assert!(
                                rep.average_rating >= 100,
                                "average {} below 100 with {} active ratings",
                                rep.average_rating,
                                rep.rating_count
                            );
                            prop_assert_eq!(
                                rep.average_rating,
                                rep.total_rating_points / rep.rating_count
                            );
                        }

                        // Invariant: composite score never exceeds 1000.
                        let score = client.try_calculate_score(addr).unwrap().unwrap();
                        prop_assert!(score <= 1000, "score {} exceeds 1000", score);
                    }
                    None => {
                        prop_assert!(
                            client.try_get_reputation(addr).is_err(),
                            "user {} should be unregistered",
                            i
                        );
                    }
                }
            }
        }
    }
}