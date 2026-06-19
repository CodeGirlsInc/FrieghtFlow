Closes #962

### Overview
This pull request implements the requested BullMQ asynchronous background queues and scheduled cron jobs for the backend. These changes ensure that operations like Stellar smart contract calls, email delivery, and PDF generation no longer block HTTP responses. Additionally, automated scheduled tasks for expired bids, stuck shipments, and unused file cleanup have been added.

### Technical Details

#### 1. BullMQ Setup
- Configured `@nestjs/bull` in the `AppModule` using `ConfigService` to connect to Redis (`REDIS_HOST` & `REDIS_PORT`).
- Created a centralized `QueueModule` defining three named queues: `stellar-anchor`, `email-send`, and `pdf-generate`.

#### 2. Queue Processors
- Added processors for `stellar-anchor`, `email-send`, and `pdf-generate`.
- Each processor leverages `job.updateProgress()` at four intervals (25%, 50%, 75%, 100%).
- Built-in 3 retry logic (using BullMQ job options). If max retries are exhausted, the failure is logged and (in the case of `stellar-anchor`) updates the related `ShipmentStatus` to `FAILED`.

#### 3. Cron Jobs
- Integrated `@nestjs/schedule` to handle the following automated background tasks:
  - **Bid Expiry:** Hourly cron (`0 * * * *`) that checks `Bid` entities and transitions them to `EXPIRED` if `expiresAt < NOW()`. (Added `expiresAt` column to the `Bid` entity).
  - **Stuck Shipments:** Daily cron (`0 2 * * *`) that triggers a prominent Logger alert for `IN_TRANSIT` shipments lacking updates for >30 days.
  - **Temporary File Cleanup:** Daily cron (`0 3 * * *`) that scans the `./uploads` directory to delete files older than 7 days with no matching `Document` DB record.

#### 4. API Endpoints
- Added a `GET /admin/queue/stats` endpoint to the `AdminController`.
- Protected by the `RolesGuard` (ADMIN only).
- Aggregates and returns active, waiting, completed, failed, and delayed job counts across all three configured queues.

### Verification
All 105 automated backend tests pass cleanly. The application successfully connects to the configured Redis instance, schedules cron tasks, and can enqueue/process jobs seamlessly.
