# TransactionModule

A comprehensive transaction logging and reporting system for financial transactions.

## Features

- Immutable transaction records with full history tracking
- Detailed metadata for every financial transaction
- Advanced search capabilities
- Comprehensive reporting and analytics
- Secure API endpoints for transaction management

## Configuration

The module requires the following environment variables:

\`\`\`
# API Security
API_KEY=your_api_key_here

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=transaction_service
\`\`\`

## API Endpoints

### Transaction Management
- POST `/transactions` - Create a new transaction record
- GET `/transactions/:id` - Get transaction by ID
- GET `/transactions/reference/:reference` - Get transaction by reference
- GET `/transactions/user/:userId` - Get transactions by user ID
- GET `/transactions` - Search transactions with filters
- PATCH `/transactions/:id/status` - Update transaction status
- GET `/transactions/:id/history` - Get transaction history

### Transaction Reporting
- GET `/transaction-reports/summary` - Get transaction summary report
- GET `/transaction-reports/volume` - Get transaction volume report
- GET `/transaction-reports/status-breakdown` - Get status breakdown report
- GET `/transaction-reports/gateway-breakdown` - Get gateway breakdown report
- GET `/transaction-reports/time-series` - Get time series report

## Security

All management endpoints are protected by API key authentication. The API key must be provided in the `x-api-key` header.

## Data Immutability

Transaction records are immutable by design:
- All changes are tracked in a separate history table
- Database triggers prevent deletion of transaction records
- Updates are limited to specific fields and always create history entries

## Search Capabilities

The search API supports filtering by:
- Transaction ID
- User ID
- Amount range
- Currency
- Status
- Gateway
- Date range

## Reporting

The reporting API provides:
- Summary reports with transaction counts and amounts
- Volume reports by time period
- Status breakdown reports
- Gateway breakdown reports
- Time series reports

## Usage

To use this module in your NestJS application:

1. Import the `TransactionModule` in your `AppModule`
2. Configure the necessary environment variables
3. Run the database migration script to create the required tables
4. Use the `TransactionService` to create and manage transactions

## Example

\`\`\`typescript
// In your app.module.ts
import { Module } from '@nestjs/common';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    TransactionModule,
    // other modules...
  ],
})
export class AppModule {}
\`\`\`

## Database Schema

The module uses two main tables:
- `transactions` - Stores the transaction records
- `transaction_history` - Stores the history of changes to transactions

Both tables are designed for high performance with appropriate indexes and constraints.
