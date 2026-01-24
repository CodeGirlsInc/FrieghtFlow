# Implementation Guide: User Reputation and Rating System

## Project Structure

```
contract/
├── Cargo.toml                      # Project configuration with ink! dependencies
├── src/
│   └── lib.rs                     # Main contract implementation
├── tests/
│   └── integration_tests.rs       # Integration tests
└── CONTRACT_DOCUMENTATION.md      # Full API documentation
```

## Contract Architecture

### Core Components

#### 1. Data Types Module
Located at the top of `lib.rs`:
- `UserType` enum: Distinguishes Carrier from Shipper
- `UserReputation` struct: Complete user profile data
- `Rating` struct: Individual rating records
- Events: UserInitialized, RatingSubmitted, ReputationUpdated

#### 2. Contract Module
Main contract implementation with:
- Storage definitions (Maps, Mappings)
- Constructor
- Message functions (public methods)
- Test module

#### 3. Error Handling
Custom `Error` enum with variants for:
- User initialization errors
- Rating validation errors
- Authorization errors
- Data not found errors

## Implementation Details

### User Initialization Flow

```
User attempts to rate → System checks if rated user exists
    ↓
If not exists → Auto-initialize with opposite UserType
    ↓
Create UserReputation with default values (0 for counts, timestamps)
    ↓
Emit UserInitialized event
```

### Rating Submission Flow

```
submit_rating called with shipment_id, rated_address, score, comment_hash
    ↓
Validate:
  - Score is 1-5
  - Caller ≠ Rated address
  - No duplicate rating for this shipment
  - Both users initialized
    ↓
Create Rating record with rating_counter as ID
    ↓
Increment rating_counter
    ↓
Update shipment_ratings[shipment_id] → add rating_id
    ↓
Update shipment_raters[shipment_id] → add caller
    ↓
Update UserReputation for rated user:
  - total_rating_points += score * 100
  - rating_count += 1
  - average_rating = total_rating_points / rating_count
  - last_updated = now
    ↓
Emit RatingSubmitted and ReputationUpdated events
    ↓
Return rating_id
```

### Reputation Score Calculation

#### Formula Components

**Average Rating Component (0-500):**
```
(average_rating / 500) * 500 = average_rating (in fixed-point)
```

**On-Time/Success Component (0-300 for Carrier, 0-200 for Shipper):**
```
For Carrier:  (on_time_deliveries / total_shipments) * 100 * 3
For Shipper:  (successful_shipments / total_shipments) * 100 * 2
```

**Completion Component (0-200):**
```
(rating_count / total_shipments_completed) * 100 * 2
```

**Total Score:**
```
Sum of all components, capped at 1000
```

### Fixed-Point Arithmetic

Ratings are stored as fixed-point numbers to avoid floating-point precision issues:
- **5.00 stars** → 500
- **4.50 stars** → 450
- **3.25 stars** → 325

This allows for accurate averaging and comparison without floating-point operations.

## Key Implementation Choices

### 1. Auto-Initialization
When a user receives their first rating, if they haven't been initialized, the system auto-initializes them with the opposite user type of the rater. This improves UX and ensures all users have reputation records.

### 2. Immutable Ratings
Ratings cannot be modified or deleted after submission. This ensures data integrity and prevents manipulation. If a user disputes a rating, a new dispute mechanism would handle it (future enhancement).

### 3. Fixed-Point Averages
Instead of storing individual ratings and recalculating averages, we store:
- `total_rating_points` (sum of scores × 100)
- `rating_count` (number of ratings)
- `average_rating` (total_rating_points / rating_count)

This reduces gas costs and computation, while maintaining accuracy.

### 4. Separated Rating Tracking
We maintain multiple indexes for efficient querying:
- `ratings`: Map rating_id → Rating (full data)
- `shipment_ratings`: Map shipment_id → rating_ids (prevent duplicates)
- `shipment_raters`: Map shipment_id → raters (quick duplicate check)

This trade-off of storage for query efficiency is acceptable given blockchain storage costs.

### 5. Authorization via Set Function
The authorized Shipment contract is set via `set_authorized_shipment_contract()`. In production:
- Add owner-based access control
- Consider using role-based access patterns
- Implement admin functions for upgrades

## Gas Optimization Strategies

### 1. Direct Lookups
All primary queries use Mapping lookups (O(1)) rather than iterating collections.

### 2. Deferred Calculations
- Average ratings calculated and stored on update (not on every read)
- Percentages calculated on-demand for read queries
- Score calculated only when explicitly requested

### 3. Fixed-Point Arithmetic
No floating-point operations; all math uses u32/u64 integers.

### 4. Limited Iteration
Only `get_user_ratings()` iterates all ratings, and this is filtered by user type. Other queries are direct lookups.

### 5. Event Logging
Events are efficiently emitted with indexed topics for easy filtering.

## Testing Strategy

### Unit Tests (in lib.rs)
Located in the `#[cfg(test)]` module:
1. **Initialization Tests**
   - New user initialization
   - Duplicate initialization prevention
   - User data correctness

2. **Validation Tests**
   - Invalid score rejection (0, 6, negative)
   - Self-rating prevention
   - Duplicate rating prevention

3. **Calculation Tests**
   - Average rating calculation with multiple ratings
   - On-time percentage calculation
   - Completion rate calculation
   - Reputation score calculation

4. **Authorization Tests**
   - Shipment contract authorization
   - Unauthorized caller rejection

5. **Data Retrieval Tests**
   - Accurate reputation data retrieval
   - Shipment rating queries
   - User rating queries
   - Event emission verification

### Integration Tests (in tests/integration_tests.rs)
Mock scenarios testing realistic workflows:
1. Multiple users with different performance levels
2. Carrier with perfect on-time delivery record
3. Shipper with high completion rate
4. Cross-contract interactions
5. Large-scale operations (1000+ ratings)

### Running Tests
```bash
# Run all tests
cargo test

# Run specific test
cargo test test_submit_rating_invalid_score

# Run with output
cargo test -- --nocapture
```

## Security Considerations

### 1. Input Validation
- Score must be 1-5
- Addresses must be valid
- Timestamps checked for monotonicity

### 2. Access Control
- `update_shipment_stats` restricted to authorized contract
- `set_authorized_shipment_contract` (add owner check in production)

### 3. Reentrancy
- No callbacks or cross-contract calls that could loop back
- Single-level authorization

### 4. Overflow Prevention
- Scores capped at 1000
- Counters use u32/u64 with reasonable limits
- Percentages calculated safely with proper division order

### 5. Storage Safety
- All storage accesses wrapped with error handling
- No unwrap() calls that could panic
- Empty collections handled gracefully

## Deployment Steps

### 1. Build Contract
```bash
cd contract
cargo build --release
```

### 2. Deploy to Testnet
```bash
# Using substrate/ink deployment tools
# Contract artifacts in target/wasm32-unknown-unknown/release/
```

### 3. Initialize Contract
```rust
// Deploy with new()
let contract = ReputationContract::new();
```

### 4. Set Authorized Contract
```rust
contract.set_authorized_shipment_contract(shipment_contract_address);
```

### 5. Verify Deployment
- Check events are emitting
- Test basic flow (initialize, rate, calculate)
- Verify storage state

## Integration with Shipment Contract

### Shipment Contract Responsibilities
When shipment status changes to "Delivered":
1. Call `update_shipment_stats(carrier_address, shipment_id, was_on_time, true)`
2. Call `update_shipment_stats(shipper_address, shipment_id, false, was_successful)`

### Reputation Contract Responsibilities
1. Receive calls from authorized Shipment contract
2. Update user statistics
3. Provide reputation queries back to Shipment contract for display

### Event Flow
```
Shipment Delivered → Shipment Contract
    ↓
Calls update_shipment_stats() → Reputation Contract
    ↓
Reputation updated
    ↓
Emits ReputationUpdated event
    ↓
Frontend listens for event
    ↓
Updates user profile with new reputation
```

## Frontend Integration Points

### 1. User Profile Display
```javascript
// Get complete reputation data
const reputation = await contract.get_user_reputation(userAddress);
// Display: average rating, total shipments, on-time %
```

### 2. Rating Submission
```javascript
// Submit rating after shipment
const ratingId = await contract.submit_rating(
  shipmentId,
  carrierAddress,
  5,
  commentHash
);
```

### 3. Reputation Score Widget
```javascript
// Display reputation score
const score = await contract.calculate_reputation_score(userAddress);
// Display: score/1000 with visual representation
```

### 4. Event Listening
```javascript
// Listen for rating events
contract.on('RatingSubmitted', (event) => {
  // Update UI with new rating
  refreshUserProfile();
});
```

## Future Enhancements

### Phase 1 (Current)
- Basic rating and reputation calculation
- Cross-contract authorization
- Event logging

### Phase 2
- Reputation badges/tiers
- Historical reputation tracking
- Advanced filtering and search

### Phase 3
- Dispute resolution mechanism
- Reputation appeal process
- Advanced analytics

### Phase 4
- Machine learning for anomaly detection
- Dynamic weighting of reputation components
- Reputation decay system

## Troubleshooting

### Issue: "User not found" error
**Solution**: Check if user has been initialized. Can initialize manually or wait for first rating.

### Issue: "Duplicate rating" error
**Solution**: Same user cannot rate same shipment twice. Verify shipment_id is unique.

### Issue: "Unauthorized" error on update_shipment_stats
**Solution**: Ensure Shipment contract address was set via `set_authorized_shipment_contract()`.

### Issue: High gas usage
**Solution**: Check if querying large lists. Consider using indexed queries instead.

## Performance Benchmarks

Expected performance metrics:
- **User initialization**: ~25,000 gas
- **Rating submission**: ~50,000 gas
- **Reputation calculation**: ~15,000 gas
- **Query operations**: ~5,000-10,000 gas

(Note: Actual values depend on blockchain platform and gas pricing)
