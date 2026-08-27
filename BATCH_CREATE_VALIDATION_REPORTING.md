# Batch Create Per-Item Validation Reporting

## Summary

Implemented per-item validation reporting for the batch-create shipments endpoint. Previously, the endpoint used an all-or-nothing transaction approach where any single failure would roll back the entire batch with no detailed feedback. Now, each shipment is processed individually, and the response includes detailed success/failure status for each item.

## Changes Made

### 1. New DTOs (`batch-create-result.dto.ts`)

Created two new DTOs to structure the batch response:

- **`BatchItemResultDto`**: Represents the result for a single item in the batch
  - `index`: Position in the original batch (0-based)
  - `success`: Boolean indicating if the item was created successfully
  - `id?`: Shipment ID (present only if success=true)
  - `error?`: Error message (present only if success=false)

- **`BatchCreateResultDto`**: Aggregate response for the entire batch
  - `total`: Total number of items in the batch
  - `succeeded`: Count of successful items
  - `failed`: Count of failed items
  - `items`: Array of `BatchItemResultDto` with per-item details

### 2. Service Layer (`shipments.service.ts`)

Modified `batchCreate()` method:

**Before:**

- Single transaction wrapping all shipments
- All-or-nothing: any failure rolls back entire batch
- Returns `string[]` (array of created IDs)
- No per-item error reporting

**After:**

- Each shipment processed in its own transaction
- Partial success: valid shipments are created even if others fail
- Returns `BatchCreateResultDto` with detailed per-item results
- Each item's success or failure is tracked independently
- Failed items include error messages for debugging

### 3. Controller Layer (`shipments.controller.ts`)

Updated the batch-create endpoint:

- Changed return type to `Promise<BatchCreateResultDto>`
- Updated API documentation to reflect per-item reporting
- Added `type: BatchCreateResultDto` to `@ApiResponse` decorator
- Updated description to clarify individual processing

### 4. Tests (`shipments.service.spec.ts`)

Updated and added tests:

**Test 1: "creates multiple shipments and returns per-item results"**

- Verifies successful batch creation
- Validates response structure with per-item details
- Confirms all items show success=true with IDs

**Test 2: "returns per-item results with mixed success and failure"**

- Tests batch with 3 items: 2 valid, 1 invalid
- Validates partial success behavior
- Confirms failed item includes error message
- Verifies successful items are still created
- Checks transaction behavior (2 commits, 1 rollback)

## API Response Example

### Successful Batch (All Items Valid)

```json
{
  "total": 2,
  "succeeded": 2,
  "failed": 0,
  "items": [
    {
      "index": 0,
      "success": true,
      "id": "uuid-1"
    },
    {
      "index": 1,
      "success": true,
      "id": "uuid-2"
    }
  ]
}
```

### Partial Success (Mixed Valid/Invalid Items)

```json
{
  "total": 3,
  "succeeded": 2,
  "failed": 1,
  "items": [
    {
      "index": 0,
      "success": true,
      "id": "uuid-1"
    },
    {
      "index": 1,
      "success": false,
      "error": "Validation error: weightKg must be a positive number"
    },
    {
      "index": 2,
      "success": true,
      "id": "uuid-3"
    }
  ]
}
```

## Benefits

1. **Better Developer Experience**: Callers get clear, actionable feedback about which items failed and why
2. **Partial Success**: Valid shipments are created even if others fail, reducing the need for retries
3. **Debugging**: Error messages per item make it easy to identify and fix issues
4. **Backward Compatible**: The endpoint still accepts the same request format; only the response structure changed
5. **Transactional Integrity**: Each item is still processed transactionally, ensuring data consistency per shipment

## Acceptance Criteria Met

✅ A caller submitting a batch with one invalid shipment gets clear, per-item feedback about what succeeded and what didn't

✅ Per-item results include:

- Index position for mapping back to original request
- Success/failure boolean
- Shipment ID for successful items
- Error message for failed items

✅ Tests cover mixed valid/invalid batches and verify partial success behavior
