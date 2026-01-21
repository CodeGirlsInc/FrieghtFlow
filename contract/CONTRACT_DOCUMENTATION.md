# User Reputation and Rating System Contract

## Overview

The Reputation Contract implements a trustless, immutable reputation system for FreightFlow platform users (carriers and shippers). It tracks performance metrics, ratings, and calculates reputation scores transparently on-chain.

## Architecture

### Data Structures

#### UserReputation
Stores comprehensive reputation data for each user:
- `user_address`: The user's blockchain address
- `user_type`: Enum (Carrier or Shipper)
- `total_shipments_completed`: Count of completed shipments
- `average_rating`: Fixed-point number (e.g., 450 = 4.50 stars)
- `total_rating_points`: Sum of all ratings received (scaled by 100)
- `rating_count`: Number of ratings received
- `on_time_deliveries`: For carriers only
- `late_deliveries`: For carriers only
- `successful_shipments`: For shippers only
- `cancelled_shipments`: For shippers only
- `last_updated`: Timestamp of last reputation change

#### Rating
Individual rating record:
- `rating_id`: Unique identifier
- `shipment_id`: Associated shipment
- `rater_address`: Who gave the rating
- `rated_address`: Who received the rating
- `score`: 1-5 stars
- `comment_hash`: Hash of optional review text (off-chain)
- `timestamp`: When the rating was submitted
- `is_carrier_rating`: Boolean flag for rating type

### Storage Maps
- `user_reputations`: Maps AccountId to UserReputation
- `ratings`: Maps rating_id to Rating
- `shipment_ratings`: Maps shipment_id to list of rating_ids
- `shipment_raters`: Maps shipment_id to list of rater addresses
- `rating_counter`: Global counter for unique rating IDs
- `authorized_shipment_contract`: Address of authorized shipment contract

## Core Functions

### User Management

#### `initialize_user(user_address, user_type) -> Result<(), Error>`
Initializes a new user in the reputation system.
- **Preconditions**: User not already initialized
- **Side Effects**: Emits `UserInitialized` event
- **Error Cases**: `UserAlreadyInitialized`

#### `is_user_initialized(user_address) -> bool`
Checks if a user has been initialized.
- **Returns**: Boolean indicating initialization status

### Rating Management

#### `submit_rating(shipment_id, rated_address, score, comment_hash) -> Result<u64, Error>`
Submits a rating for a completed shipment.
- **Validation**:
  - Score must be 1-5
  - Caller cannot be the rated user
  - Cannot have duplicate ratings for same shipment
  - Caller must be initialized (auto-initializes rated user if needed)
- **Side Effects**:
  - Creates Rating record
  - Updates UserReputation
  - Emits `RatingSubmitted` and `ReputationUpdated` events
- **Error Cases**: `InvalidRatingScore`, `DuplicateRating`, `CannotRateSelf`, `UserNotFound`
- **Returns**: New rating_id

#### `has_rated_shipment(shipment_id, rater_address) -> bool`
Checks if a user has already rated a specific shipment.

#### `get_user_ratings(user_address) -> Vec<u64>`
Gets all rating IDs for a specific user.

#### `get_shipment_ratings(shipment_id) -> Vec<u64>`
Gets all rating IDs for a specific shipment.

### Reputation Queries

#### `get_user_reputation(user_address) -> Result<UserReputation, Error>`
Gets complete reputation data for a user.
- **Returns**: Full UserReputation struct
- **Error Cases**: `UserNotFound`

#### `get_rating(rating_id) -> Result<Rating, Error>`
Gets a specific rating by ID.
- **Returns**: Rating struct
- **Error Cases**: `RatingNotFound`

#### `get_average_rating(user_address) -> Result<u32, Error>`
Gets the average rating for a user (fixed-point format).
- **Returns**: Average as u32 (e.g., 450 = 4.50 stars)
- **Error Cases**: `UserNotFound`

#### `get_on_time_percentage(user_address) -> Result<u32, Error>`
Gets on-time delivery percentage for carriers.
- **Returns**: Percentage (0-100)
- **Error Cases**: `UserNotFound`, `UserTypeMismatch`

#### `get_completion_rate(user_address) -> Result<u32, Error>`
Gets successful shipment rate for shippers.
- **Returns**: Percentage (0-100)
- **Error Cases**: `UserNotFound`, `UserTypeMismatch`

### Reputation Calculation

#### `calculate_reputation_score(user_address) -> Result<u32, Error>`
Calculates the overall reputation score using the formula:

**For Carriers:**
```
Score = (Average Rating / 5 * 500) + (On-Time % * 3) + (Completion Rate * 2)
       = [0-500] + [0-300] + [0-200] = 0-1000
```

**For Shippers:**
```
Score = (Average Rating / 5 * 500) + (Success Rate % * 2) + (Completion Rate * 2)
       = [0-500] + [0-200] + [0-200] = 0-1000
```

- **Returns**: Score capped at 1000
- **Error Cases**: `UserNotFound`

### Shipment Integration

#### `update_shipment_stats(user_address, shipment_id, was_on_time, was_successful) -> Result<(), Error>`
Updates shipment statistics for a user (called by Shipment contract).
- **Authorization**: Only authorized Shipment contract can call
- **For Carriers**:
  - Increments `on_time_deliveries` if `was_on_time == true`
  - Increments `late_deliveries` if `was_on_time == false`
- **For Shippers**:
  - Increments `successful_shipments` if `was_successful == true`
  - Increments `cancelled_shipments` if `was_successful == false`
- **Side Effects**: Updates user reputation, sets `last_updated` timestamp
- **Error Cases**: `UnauthorizedShipmentContract`, `UserNotFound`

#### `set_authorized_shipment_contract(contract_address)`
Sets the address of the authorized Shipment contract.
- **Note**: In production, add owner/role-based access control

## Events

### UserInitialized
```
event UserInitialized(user_address: AccountId, user_type: UserType, timestamp: u64)
```

### RatingSubmitted
```
event RatingSubmitted(
    rating_id: u64,
    shipment_id: u64,
    rater: AccountId,
    rated: AccountId,
    score: u8,
    timestamp: u64
)
```

### ReputationUpdated
```
event ReputationUpdated(
    user_address: AccountId,
    new_average: u32,
    total_shipments: u32,
    timestamp: u64
)
```

## Validation Rules

### Rating Validation
1. **Score Range**: Must be 1-5 inclusive
2. **Unique Rating**: Cannot rate same shipment twice
3. **Self-Rating Prevention**: Cannot rate yourself
4. **Participant Verification**: Shipper rates carrier, carrier rates shipper
5. **Immutability**: Ratings cannot be changed after submission

### User Validation
1. **Initialization**: Users auto-initialize on first rating
2. **Type Consistency**: User type determined at initialization
3. **Existence Check**: Both rater and rated must be initialized

## Error Handling

| Error | Cause | Recovery |
|-------|-------|----------|
| `UserAlreadyInitialized` | Attempting to re-initialize user | Use existing user data |
| `UserNotFound` | User not initialized | Initialize user first |
| `InvalidRatingScore` | Score outside 1-5 range | Provide valid score |
| `DuplicateRating` | Already rated this shipment | Cannot re-rate same shipment |
| `CannotRateSelf` | Attempting self-rating | Rate different user |
| `RatingNotFound` | Invalid rating_id queried | Verify rating_id exists |
| `UnauthorizedShipmentContract` | Unauthorized caller | Use authorized contract |
| `UserTypeMismatch` | Calling carrier function on shipper | Verify user type |

## Gas Optimization

### Storage Efficiency
- Fixed-point arithmetic avoids floating-point overhead
- Mapping-based storage for O(1) lookups
- Vector iteration only when necessary
- Rating counter prevents re-use of IDs

### Computation Efficiency
- Average rating stored rather than calculated on-demand
- Percentages calculated with integer math
- Score capped at 1000 to prevent overflow

## Security Considerations

### Authorization
- Only authorized Shipment contract can update stats
- Rating submission validated by user type matching
- Self-rating prevention built-in

### Data Integrity
- Ratings immutable after submission
- No duplicate ratings possible
- Event logging for audit trail

### Overflow Prevention
- Score capped at 1000
- Fixed-point arithmetic for ratings
- Integer division for percentages

## Testing Coverage

### Unit Tests (>80%)
- ✅ User initialization
- ✅ Invalid rating score rejection
- ✅ Self-rating prevention
- ✅ Duplicate rating prevention
- ✅ Average rating calculation
- ✅ On-time percentage calculation
- ✅ Completion rate calculation
- ✅ Reputation score calculation
- ✅ Shipment stats updates
- ✅ Authorization checks
- ✅ Event emissions
- ✅ Getter function accuracy

### Integration Tests
- ✅ Multiple users reputation tracking
- ✅ Carrier with perfect on-time record
- ✅ Shipper with high completion rate
- ✅ Cross-contract authorization
- ✅ Large-scale rating submission
- ✅ Time-based timestamp tracking

## Integration Points

### With Shipment Contract
1. Shipment contract calls `update_shipment_stats` when shipment delivered
2. Passes completion metrics (on-time status, success status)
3. Receives confirmation of stats update

### With Escrow Contract (Future)
1. Escrow contract can query `get_user_reputation`
2. Can query `calculate_reputation_score`
3. Can decide release amount based on reputation

### Frontend Integration
1. Query `get_user_reputation` for profile display
2. Query `get_average_rating` for quick ratings
3. Query `calculate_reputation_score` for trust metrics
4. Query `get_on_time_percentage` / `get_completion_rate` for performance metrics

## Future Enhancements

### Reputation Decay
- Implement time-based reputation reduction for inactive users
- Reward consistent performance over time

### Advanced Metrics
- Customer satisfaction score separate from on-time
- Service quality metrics
- Communication ratings

### Dispute Resolution
- Allow rating appeals/challenges
- Implement reputation recovery mechanism
- Add comment/evidence submission

### Tiered Reputation
- Implement badges/levels (Bronze, Silver, Gold, Platinum)
- Unlock features based on reputation tier

## Deployment Checklist

- [ ] Set authorized Shipment contract address
- [ ] Initialize test users (carriers and shippers)
- [ ] Verify event emission with listeners
- [ ] Test rating submission flow end-to-end
- [ ] Verify gas consumption is acceptable
- [ ] Load test with simulated data
- [ ] Audit contract security
- [ ] Deploy to testnet
- [ ] Verify integration with other contracts
- [ ] Deploy to mainnet

## Usage Examples

### Initialize User
```rust
reputation_contract.initialize_user(
    AccountId::from([0x01; 32]),
    UserType::Carrier
)?;
```

### Submit Rating
```rust
let rating_id = reputation_contract.submit_rating(
    shipment_id: 123,
    rated_address: AccountId::from([0x02; 32]),
    score: 5,
    comment_hash: [0; 32]
)?;
```

### Get Reputation
```rust
let rep = reputation_contract.get_user_reputation(
    AccountId::from([0x01; 32])
)?;
println!("Average Rating: {}", rep.average_rating);
println!("Total Shipments: {}", rep.total_shipments_completed);
```

### Calculate Score
```rust
let score = reputation_contract.calculate_reputation_score(
    AccountId::from([0x01; 32])
)?;
println!("Reputation Score: {}/1000", score);
```
